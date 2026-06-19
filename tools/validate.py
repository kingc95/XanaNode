"""Validate XanaNode protocol artifacts.

This script performs two layers of checks:

1. Draft 2020-12 JSON Schema validation for registries, manifests, nodes,
   relationship files, merge reports, and compatibility reports.
2. XanaNode-specific integrity checks that JSON Schema cannot express locally:
   declared relationship types, resolvable endpoints, and registered namespaces.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from jsonschema import Draft202012Validator
except ImportError as exc:  # pragma: no cover - intentionally user-facing
    raise SystemExit(
        "Missing dependency: jsonschema. Install with `python -m pip install -r requirements-dev.txt`."
    ) from exc


ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validate_json(schema_path: Path, data_path: Path, errors: list[str]) -> None:
    schema = load_json(schema_path)
    data = load_json(data_path)
    validator = Draft202012Validator(schema)
    for error in sorted(validator.iter_errors(data), key=lambda err: list(err.path)):
        location = "/".join(str(part) for part in error.path) or "<root>"
        errors.append(f"{data_path.relative_to(ROOT)}:{location}: {error.message}")


def validate_schema_sets(errors: list[str]) -> None:
    schema_dir = ROOT / "schemas"

    validate_json(
        schema_dir / "xananode-node-types.schema.v0.3.0.json",
        schema_dir / "xananode-node-types.v0.3.0.json",
        errors,
    )
    validate_json(
        schema_dir / "xananode-relationship-types.schema.v0.5.0.json",
        schema_dir / "xananode-relationship-types.v0.5.0.json",
        errors,
    )
    validate_json(
        schema_dir / "property-registry.schema.json",
        schema_dir / "xananode-property-registry.v0.1.0.json",
        errors,
    )

    for path in ROOT.glob("examples/**/schemas/node-types*.json"):
        validate_json(schema_dir / "xananode-node-types.schema.v0.3.0.json", path, errors)

    for path in ROOT.glob("examples/**/schemas/relationship-types*.json"):
        validate_json(schema_dir / "xananode-relationship-types.schema.v0.5.0.json", path, errors)

    for path in ROOT.glob("examples/**/substrate.json"):
        validate_json(schema_dir / "substrate-manifest.schema.json", path, errors)

    for path in ROOT.glob("examples/**/nodes/*.json"):
        validate_json(schema_dir / "substrate-node.schema.json", path, errors)

    for path in ROOT.glob("examples/**/relationships.json"):
        validate_json(schema_dir / "substrate-relationships.schema.json", path, errors)

    for path in ROOT.glob("examples/**/merge-report.json"):
        validate_json(schema_dir / "merge-report.schema.json", path, errors)

    for path in ROOT.glob("examples/**/compatibility-report.json"):
        validate_json(schema_dir / "compatibility-report.schema.json", path, errors)

    for path in ROOT.glob("examples/**/substrate-diff.json"):
        validate_json(schema_dir / "substrate-diff.schema.json", path, errors)

    for path in ROOT.glob("examples/**/author-profile.json"):
        validate_json(schema_dir / "author-profile.schema.json", path, errors)

    for path in ROOT.glob("examples/**/*nanopublication*.json"):
        validate_json(schema_dir / "nanopublication.schema.json", path, errors)

    for path in ROOT.glob("examples/**/ro-crate-metadata.json"):
        validate_json(schema_dir / "ro-crate-metadata.schema.json", path, errors)


def registered_namespaces() -> set[str]:
    data = load_json(ROOT / "registry" / "namespaces.json")
    return {entry["id"] for entry in data["namespaces"]}


def declared_relationship_types(substrate_dir: Path) -> set[str]:
    core = load_json(ROOT / "schemas" / "xananode-relationship-types.v0.5.0.json")
    declared = {item["type"] for item in core["relationship_types"]}
    declared.update(item["id"] for item in core["relationship_types"])

    for path in substrate_dir.glob("**/relationship-types*.json"):
        data = load_json(path)
        for item in data.get("relationship_types", []):
            declared.add(item["type"])
            declared.add(item["id"])

    return declared


def node_ids(substrate_dir: Path) -> set[str]:
    ids: set[str] = set()
    for path in (substrate_dir / "nodes").glob("*.json"):
        ids.add(load_json(path)["id"])
    return ids


def is_versioned_fragment_tumbler(value: str) -> bool:
    return "@" in value and "#fragment/" in value and value.rsplit("#fragment/", 1)[1].count("@") == 1


def substrate_dirs() -> list[Path]:
    return [
        ROOT / "examples" / "minimal-substrate",
        ROOT / "examples" / "custom-extension-substrate",
        ROOT / "examples" / "federation-example" / "substrate-a",
        ROOT / "examples" / "federation-example" / "substrate-b",
    ]


def validate_xananode_integrity(errors: list[str]) -> None:
    namespaces = registered_namespaces()
    core_relationships = load_json(ROOT / "schemas" / "xananode-relationship-types.v0.5.0.json")[
        "relationship_types"
    ]


def parse_datetime(value: str) -> datetime:
    if value.endswith("Z"):
        value = f"{value[:-1]}+00:00"
    return datetime.fromisoformat(value)
    core_types = {item["type"] for item in core_relationships}

    for item in core_relationships:
        inverse = item.get("inverse")
        if inverse and inverse != item["type"] and inverse in core_types:
            errors.append(
                "schemas/xananode-relationship-types.v0.5.0.json: "
                f"inverse relationship type should be derived, not separately registered: {item['type']} / {inverse}"
            )

    for manifest_path in ROOT.glob("examples/**/substrate.json"):
        manifest = load_json(manifest_path)
        namespace = manifest["namespace"]
        if namespace not in namespaces:
            errors.append(f"{manifest_path.relative_to(ROOT)}: namespace is not registered: {namespace}")

    for substrate_dir in substrate_dirs():
        declared_types = declared_relationship_types(substrate_dir)
        local_nodes = node_ids(substrate_dir)
        rel_path = substrate_dir / "relationships.json"
        if not rel_path.exists():
            continue

        for rel in load_json(rel_path)["relationships"]:
            if rel["type"] not in declared_types:
                errors.append(f"{rel_path.relative_to(ROOT)}: undeclared relationship type: {rel['type']}")
            if rel["source"] not in local_nodes and not rel.get("external"):
                errors.append(f"{rel_path.relative_to(ROOT)}: unresolved source: {rel['source']}")
            if rel["target"] not in local_nodes and not rel.get("external"):
                errors.append(f"{rel_path.relative_to(ROOT)}: unresolved target: {rel['target']}")
            if rel["type"] == "transcludes":
                tumbler = rel.get("tumbler")
                if not tumbler or not is_versioned_fragment_tumbler(tumbler):
                    errors.append(
                        f"{rel_path.relative_to(ROOT)}: transcludes relationship must carry a versioned fragment tumbler: {rel['id']}"
                    )
            if rel.get("valid_from") and rel.get("valid_to"):
                if parse_datetime(rel["valid_from"]) > parse_datetime(rel["valid_to"]):
                    errors.append(f"{rel_path.relative_to(ROOT)}: valid_from is after valid_to: {rel['id']}")

        for node_path in (substrate_dir / "nodes").glob("*.json"):
            node = load_json(node_path)
            if node.get("type") == "fragment":
                tumbler = node.get("tumbler", "")
                if not is_versioned_fragment_tumbler(tumbler):
                    errors.append(f"{node_path.relative_to(ROOT)}: fragment tumbler must include source and fragment versions")
                if node.get("source_version_id") not in tumbler:
                    errors.append(f"{node_path.relative_to(ROOT)}: fragment tumbler must include source_version_id")
                if node.get("version_id") not in tumbler:
                    errors.append(f"{node_path.relative_to(ROOT)}: fragment tumbler must include fragment version_id")


def main() -> int:
    errors: list[str] = []
    validate_schema_sets(errors)
    validate_xananode_integrity(errors)

    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1

    print("XanaNode protocol artifacts validated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
