# Tumbler Addressing

Tumbler addressing refers to persistent, location-independent addressing of knowledge objects and fragments.

The goal is to address a thing even if:

- files move
- folders change
- URLs change
- renderers change
- the substrate is mirrored or federated

XanaNode begins with stable node IDs and a minimal fragment addressing profile.

## Address Profile

Node addresses use:

```text
<namespace>:<node-kind>/<local-id>
```

Fragment addresses append a fragment selector:

```text
<namespace>:<node-kind>/<local-id>#fragment/<fragment-id>
```

Rules:

- `namespace` is a registered namespace such as `xananode` or `example.minimal`.
- `node-kind` is the node type family used in the substrate path, such as `source`, `claim`, `concept`, `essay`, or `fragment`.
- `local-id` is stable within the namespace.
- `fragment-id` is stable within the addressed node.
- Fragment nodes should store both `source_node` and `fragment_id`.
- A `tumbler` field should preserve the full node or fragment address when a record depends on persistent addressing.

Examples:

```text
example.minimal:concept/knowledge-substrate
example.minimal:source/as-we-may-think#fragment/0004
```

This profile is intentionally small. Future versions may add richer selectors, byte ranges, media regions, and revision-qualified addresses without invalidating these base addresses.
