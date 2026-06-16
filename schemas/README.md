# Schemas

This directory contains the machine-readable registry and validation artifacts for XanaNode.

The current layout is versioned and split between canonical type registries and JSON Schemas that validate substrate metadata and reports.

Core files:

- [xananode-node-types.v0.3.0.json](xananode-node-types.v0.3.0.json)
- [xananode-node-types.schema.v0.3.0.json](xananode-node-types.schema.v0.3.0.json)
- [xananode-relationship-types.v0.4.0.json](xananode-relationship-types.v0.4.0.json)
- [xananode-relationship-types.schema.v0.4.0.json](xananode-relationship-types.schema.v0.4.0.json)
- [substrate-manifest.schema.json](substrate-manifest.schema.json)
- [substrate-node.schema.json](substrate-node.schema.json)
- [substrate-relationships.schema.json](substrate-relationships.schema.json)
- [namespace.schema.json](namespace.schema.json)
- [merge-report.schema.json](merge-report.schema.json)
- [compatibility-report.schema.json](compatibility-report.schema.json)

The versioned registry files define the canonical core node and relationship types. The schema files describe the required structure of each registry plus related substrate and compatibility documents.
