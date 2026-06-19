# Relationships

Relationships connect nodes with explicit meaning.

XanaNode relationships are typed.

Examples:

- `supports`
- `contradicts`
- `explains`
- `created`
- `derived_from`
- `transcludes`
- `deep_links_to`

Relationships may be simple edges or first-class nodes when the relationship itself needs evidence, provenance, dispute, or revision history.

Relationship records should preserve assertion provenance when available. Common fields include `asserted_by`, `asserted_at`, `confidence`, `evidence`, and `tumbler`.

`asserted_by` should point to a person, organization, project, or external actor identifier when possible. If the actor is local to the substrate, it should be represented as a node.

Relationships may also carry temporal validity when the relationship was true during a specific historical interval. Use `valid_from` for the beginning of the interval and `valid_to` for the end. These fields describe the modeled reality, while `asserted_at` describes when the substrate recorded the assertion.

## Inverse Views

Canonical relationship types are authored in one direction only. A type may name an `inverse` label for display or query purposes, but that inverse does not need to be registered as a second canonical type.

For example, an implementation can display `created_by` when viewing the target of a `created` relationship, but the stored relationship type remains `created`. This avoids bloating the canonical registry and avoids dangling inverse-type pairs.
