# Substrates

A substrate is an independently authored XanaNode-compatible knowledge graph.

A substrate includes:

- a manifest
- a declared namespace
- a Git repository backing the substrate history
- nodes
- relationships
- schema declarations
- optional custom extensions
- optional merge reports
- optional substrate packs

## Git Backing

Each production substrate is a Git repository. Git provides the substrate's version history, branching, review, merge, and synchronization layer.

XanaNode does not replace Git. It defines knowledge-specific artifacts inside a repository:

- `substrate.json`
- `relationships.json`
- `nodes/*.json`
- optional `schemas/*.json`
- optional merge and compatibility reports

The substrate manifest must include a `repository` block describing the Git remote and default branch. Example fixtures may live in subdirectories of the protocol repository, but independently maintained substrates should use the repository root as the substrate root.

Substrates are sovereign. They can be moderated independently while still participating in federation.

## Substrate Packs

A substrate pack is a portable set of XanaNode protocol artifacts that can be added to a substrate without losing the ownership boundary of the pack.

Packs use the same artifact shapes as a normal substrate:

- optional `substrate.json`
- `nodes/*.json` or any JSON file containing one node, an array of nodes, or `{ "nodes": [...] }`
- `relationships.json` or any JSON file containing `{ "relationships": [...] }`
- optional `assets/` files referenced by media node `asset_path` fields
- optional schemas, reports, and companion metadata

Packs may be used in three composition modes:

- `mounted`: the pack is included at build or analysis time, but remains externally governed. Its records are not copied into the receiving substrate as canonical local content.
- `imported`: the pack's records are copied into generated local artifacts with provenance, but identity is not reconciled beyond explicit namespace mappings. Imported records must retain `imported_from`, pack identity, and pack mode metadata.
- `merged`: the pack is reconciled with the receiving substrate through identity mapping, duplicate detection, conflict handling, and review policy. Merged packs should produce a merge or intake report.

Mounted packs are the right model for optional example layers, teaching material, lineage overlays, alternate interpretations, and domain extensions. Imported packs are the right model when a substrate owner wants local generated artifacts for an external pack without claiming authorship. Merged packs are the right model when a substrate owner decides that incoming records should be reconciled with local canonical authorship.

`absorbed` is a legacy alias for `imported`. New manifests should prefer `imported` or `merged` so tools can distinguish copying from identity reconciliation.

The substrate manifest may declare pack references in `imports`:

```json
{
  "imports": [
    "xananode:core",
    {
      "id": "example.minimal",
      "source": "vendor/xananode-core/vendor/xananode-protocol/examples/minimal-substrate",
      "mode": "mounted",
      "version": "0.2.0",
      "required": true
    }
  ]
}
```

String imports remain valid for simple vocabulary or schema dependencies. Object imports are used when the import is a concrete substrate pack.

Pack ingress may declare namespace mappings:

```json
{
  "id": "xananode.lineage",
  "source": "imports/lineage",
  "mode": "mounted",
  "namespace_mappings": [
    {
      "from": "xananode.example",
      "to": "xananode.com",
      "scope": "relationships",
      "reason": "Bind example-authored relationship endpoints to the receiving canonical substrate namespace."
    }
  ]
}
```

Namespace mappings are local federation rules. They do not rename the imported pack's own nodes unless `scope` is `all`; with `scope: "relationships"` they only rebase relationship endpoints so mounted records can connect to equivalent local substrate nodes. Implementations should report mappings in review or merge/intake output so authors can audit how a mounted pack is being interpreted.

Implementations must not silently treat a mounted pack as imported or merged. If a tool copies mounted records into local artifacts, it should record that as an explicit import step with review metadata. If a tool reconciles identity, de-duplicates nodes, or resolves conflicting claims, it should record that as a merge step. This prevents two repositories from accidentally claiming canonical ownership of the same governed records.

## Pack Media Portability

Packs that include local media must include the media files alongside the node records. Media files belong under the pack root, normally in `assets/`. Media nodes reference those files with relative `asset_path` values.

Pack builders must:

- copy every file referenced by a media node `asset_path`
- reject or warn on paths that escape the pack root
- preserve `source_url`, `rights_status`, `license`, `source_snapshot`, and content identifiers when known
- keep `primary_media` references pointing at media node ids, not raw file paths

Pack consumers must resolve `asset_path` relative to the pack root for mounted packs and relative to the receiving substrate root for imported or merged assets after an explicit copy step.

Live source URLs and captured media are different objects. A `source` node may point to `https://example.com`. A related `media` node with `subtype: "web_snapshot"` may carry a screenshot or Open Graph image captured from that URL. This lets renderers show rich previews while preserving source identity, capture time, rights, and provenance.
