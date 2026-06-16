# Federation Rules

Federation connects independently authored substrates without forcing one source of truth.

A federation process should:

1. Load each substrate manifest.
2. Validate each substrate against declared schemas.
3. Preserve original node IDs and namespaces.
4. Detect likely overlaps.
5. Generate mapping relationships.
6. Preserve conflicts and uncertainty.
7. Avoid destructive merging.

Federation should create more knowledge, not erase local context.

## Never Collapse by Default

Two nodes that look similar should not automatically become one node.

Prefer:

- `same_entity`
- `possible_match`
- `disputed_identity`
- `equivalent_to`

depending on confidence and review status.
