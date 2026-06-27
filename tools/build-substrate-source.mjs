import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const protocolRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultOutDir = path.join(protocolRoot, "substrate-source");
const generatedAt = new Date().toISOString();

const includeRoots = new Set(["contexts", "examples", "governance", "links", "media", "proposals", "registry", "schemas", "specs"]);
const includeRootFiles = new Set(["README.md", "LICENSE.md", "NOTICE", "TRADEMARK.md"]);
const includeExtensions = new Set([".json", ".jsonld", ".md", ".txt", ".svg", ".png", ".ico", ".webmanifest"]);

function gitValue(args) {
  const result = spawnSync("git", args, { cwd: protocolRoot, encoding: "utf8", shell: false });
  return result.status === 0 ? result.stdout.trim() : "";
}

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function cleanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    fs.rmSync(path.join(dir, entry.name), { recursive: true, force: true });
  }
}

function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return `sha256:${hash.digest("hex")}`;
}

function safeAssetRelativePath(relativePath) {
  return String(relativePath || "").replace(/\\/g, "/").replace(/^\.\//, "").replace(/\.\./g, "_");
}

function protocolSourceUrl(relativePath) {
  return `https://github.com/kingc95/XanaNode-Protocol/blob/main/${safeAssetRelativePath(relativePath)}`;
}

function nodeKindFor(relativePath) {
  const clean = safeAssetRelativePath(relativePath);
  const ext = path.extname(clean).toLowerCase();
  if (clean.startsWith("schemas/")) {
    return {
      type: "schema",
      subtype: ext === ".json" ? "schema_registry_artifact" : "schema_document",
      media_type: "document",
      mime_type: ext === ".json" ? "application/json" : "text/markdown"
    };
  }
  if (clean.startsWith("registry/")) {
    return {
      type: "schema",
      subtype: "registry_artifact",
      media_type: "document",
      mime_type: ext === ".json" ? "application/json" : "text/markdown"
    };
  }
  if ([".svg", ".png", ".ico"].includes(ext) || clean.endsWith(".webmanifest")) {
    return {
      type: "media",
      subtype: clean.startsWith("media/") ? "protocol_media_asset" : "repository_media_asset",
      media_type: ext === ".webmanifest" ? "document" : "image",
      mime_type:
        ext === ".svg" ? "image/svg+xml"
        : ext === ".png" ? "image/png"
        : ext === ".ico" ? "image/x-icon"
        : "application/manifest+json"
    };
  }
  return {
    type: "source",
    subtype: clean.startsWith("specs/") ? "protocol_spec_document" : clean.startsWith("governance/") ? "governance_document" : "protocol_document",
    media_type: "document",
    mime_type: ext === ".jsonld" ? "application/ld+json" : ext === ".json" ? "application/json" : "text/markdown"
  };
}

function shouldElevateRepositoryFileToNode(relativePath) {
  const clean = safeAssetRelativePath(relativePath);
  if (includeRootFiles.has(clean)) return true;
  if (
    clean.startsWith("contexts/") ||
    clean.startsWith("examples/") ||
    clean.startsWith("governance/") ||
    clean.startsWith("proposals/") ||
    clean.startsWith("registry/") ||
    clean.startsWith("schemas/") ||
    clean.startsWith("specs/")
  ) {
    return true;
  }
  if (clean === "media/images/xananode-icon.svg") return true;
  return false;
}

function titleFor(relativePath) {
  const clean = safeAssetRelativePath(relativePath);
  if (clean === "README.md") return "XanaNode Protocol README";
  if (clean === "LICENSE.md") return "XanaNode Protocol License";
  if (clean === "TRADEMARK.md") return "XanaNode Trademark Policy";
  if (clean === "NOTICE") return "XanaNode Protocol Notice";
  return clean
    .replace(/\.[^.]+$/, "")
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" / ");
}

function summaryFor(relativePath, kind) {
  const clean = safeAssetRelativePath(relativePath);
  if (kind.type === "schema") return `${clean} is elevated as a first-class protocol schema or registry artifact in the XanaNode Protocol substrate.`;
  if (kind.type === "media") return `${clean} is elevated as a first-class protocol branding or media artifact in the XanaNode Protocol substrate.`;
  return `${clean} is elevated as a first-class protocol document in the XanaNode Protocol substrate.`;
}

function listRepositoryFiles(dir = protocolRoot) {
  const files = [];
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith(".") && entry.name !== ".well-known") continue;
      if (entry.name === "node_modules" || entry.name === "substrate-source") continue;
      const fullPath = path.join(current, entry.name);
      const relativePath = path.relative(protocolRoot, fullPath).replace(/\\/g, "/");
      const top = relativePath.split("/")[0];
      if (entry.isDirectory()) {
        if (includeRoots.has(top)) visit(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!includeRootFiles.has(relativePath) && !includeRoots.has(top)) continue;
      if (!includeExtensions.has(ext) && !includeRootFiles.has(relativePath)) continue;
      files.push(relativePath);
    }
  }
  visit(dir);
  return files.sort((a, b) => a.localeCompare(b));
}

function readTextIfPossible(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (![".json", ".jsonld", ".md", ".txt", ".webmanifest", ""].includes(ext)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

export function buildProtocolSubstrateSource(outDir = defaultOutDir) {
  cleanDir(outDir);

  const manifest = {
    id: "xananode.protocol",
    name: "XanaNode Protocol Substrate",
    version: "0.1.0",
    namespace: "xananode.protocol",
    description: "A substrate source built directly from the XanaNode Protocol repository, preserving schemas, registries, specs, governance artifacts, and canonical protocol documents as first-class nodes while carrying lower-level repository files as attached assets when they do not deserve independent node status.",
    schema_version: "xananode-core@0.5.0",
    repository: {
      type: "git",
      url: "https://github.com/kingc95/XanaNode-Protocol.git",
      default_branch: "main"
    },
    build_metadata: {
      built_at: generatedAt,
      git_commit: gitValue(["rev-parse", "HEAD"]),
      git_branch: gitValue(["rev-parse", "--abbrev-ref", "HEAD"]),
      built_by: "xananode-protocol/tools/build-substrate-source.mjs"
    },
    sharing: {
      default_shareable: true,
      rules: [
        {
          selector: { namespace: "xananode.protocol" },
          shareable: true,
          scope: "public",
          reason: "The protocol substrate is intended to be federated as a public canonical source."
        }
      ]
    }
  };

  const nodes = [];
  const relationships = [];

  nodes.push(
    {
      id: "xananode.protocol:concept/xananode",
      title: "XanaNode",
      type: "concept",
      importance: 5,
      summary: "The core protocol concept preserved by the protocol repository substrate.",
      content: "XanaNode is a protocol for independently authored knowledge substrates that preserve relationships, provenance, lineage, disagreement, and addressable fragments, so knowledge can move across tools and media without losing its structure.",
      relationships: []
    },
    {
      id: "xananode.protocol:project/xananode-protocol",
      title: "XanaNode Protocol",
      type: "project",
      subtype: "protocol",
      importance: 5,
      summary: "The canonical protocol repository defining XanaNode schemas, registries, specs, governance, and examples.",
      source_url: "https://github.com/kingc95/XanaNode-Protocol",
      repository: "kingc95/XanaNode-Protocol",
      relationships: []
    },
    {
      id: "xananode.protocol:source/repository-xananode-protocol",
      title: "XanaNode Protocol Repository",
      type: "source",
      subtype: "git_repository",
      importance: 5,
      summary: "Public Git repository for the XanaNode Protocol.",
      source_url: "https://github.com/kingc95/XanaNode-Protocol",
      repository: "kingc95/XanaNode-Protocol",
      rights_status: "external",
      relationships: []
    }
  );

  relationships.push(
    {
      id: "xananode.protocol:rel/protocol-defines-xananode",
      source: "xananode.protocol:project/xananode-protocol",
      target: "xananode.protocol:concept/xananode",
      type: "defines",
      summary: "The protocol project defines the XanaNode concept.",
      asserted_at: generatedAt
    },
    {
      id: "xananode.protocol:rel/repository-documents-protocol-project",
      source: "xananode.protocol:source/repository-xananode-protocol",
      target: "xananode.protocol:project/xananode-protocol",
      type: "documents",
      summary: "The repository documents and carries the protocol project.",
      asserted_at: generatedAt
    }
  );

  for (const relativePath of listRepositoryFiles()) {
    const sourcePath = path.join(protocolRoot, relativePath);
    const assetPath = `assets/raw/repository/${safeAssetRelativePath(relativePath)}`;
    const assetTarget = path.join(outDir, assetPath);
    fs.mkdirSync(path.dirname(assetTarget), { recursive: true });
    fs.copyFileSync(sourcePath, assetTarget);
    if (!shouldElevateRepositoryFileToNode(relativePath)) continue;
    const kind = nodeKindFor(relativePath);
    const localSlug = slug(relativePath.replace(/\.[^.]+$/, "")) || "artifact";
    const nodeId = `xananode.protocol:${kind.type}/artifact-${localSlug}`;
    const content = readTextIfPossible(sourcePath);

    nodes.push({
      id: nodeId,
      title: titleFor(relativePath),
      type: kind.type,
      subtype: kind.subtype,
      importance: relativePath === "README.md" || relativePath.startsWith("specs/") || relativePath.startsWith("schemas/") || relativePath.startsWith("registry/") ? 4 : 3,
      summary: summaryFor(relativePath, kind),
      source_url: protocolSourceUrl(relativePath),
      artifact_path: relativePath,
      asset_path: assetPath,
      asset_role: "repository_snapshot",
      media_type: kind.media_type,
      mime_type: kind.mime_type,
      rights_status: "canonical-public",
      content_id: sha256File(sourcePath),
      ...(content ? { content } : {}),
      source_snapshot: {
        captured_at: generatedAt,
        source_url: protocolSourceUrl(relativePath),
        method: "archive",
        content_id: sha256File(sourcePath),
        rights_status: "canonical-public",
        tool: "xananode-protocol/tools/build-substrate-source.mjs"
      },
      relationships: []
    });

    relationships.push({
      id: `xananode.protocol:rel/repository-contains-${localSlug}`,
      source: "xananode.protocol:source/repository-xananode-protocol",
      target: nodeId,
      type: "contains",
      summary: `The protocol repository contains ${relativePath}.`,
      asserted_at: generatedAt
    });

    if (relativePath.startsWith("specs/") || relativePath === "README.md") {
      relationships.push({
        id: `xananode.protocol:rel/${localSlug}-documents-xananode`,
        source: nodeId,
        target: "xananode.protocol:concept/xananode",
        type: "documents",
        summary: `${titleFor(relativePath)} documents XanaNode.`,
        asserted_at: generatedAt
      });
    }
  }

  writeJson(path.join(outDir, "substrate.json"), manifest);
  writeJson(path.join(outDir, "nodes.json"), { nodes });
  writeJson(path.join(outDir, "relationships.json"), { relationships });
  for (const node of nodes) {
    writeJson(path.join(outDir, "nodes", `${node.type}_${slug(node.title)}.json`), node);
  }
  writeText(path.join(outDir, "README.md"), `# XanaNode Protocol Substrate

This folder is the explicit substrate source generated from the XanaNode Protocol repository.

It exists so the rest of the stack can federate with the protocol as a normal substrate instead of treating the protocol repository as a private implementation detail.

Regenerate it from the repository root with:

\`\`\`powershell
node XanaNode-Protocol/tools/build-substrate-source.mjs
\`\`\`

Or from \`XanaNode-Master\`:

\`\`\`powershell
npm run protocol:build-substrate-source
\`\`\`
`);

  return {
    outDir,
    manifest,
    nodeCount: nodes.length,
    relationshipCount: relationships.length
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = buildProtocolSubstrateSource();
  console.log(`Protocol substrate source: ${result.outDir}`);
  console.log(`  Nodes: ${result.nodeCount}`);
  console.log(`  Relationships: ${result.relationshipCount}`);
}
