# Canonical Type Policy

Canonical types are the shared vocabulary that make independent XanaNode substrates interoperable.

A type should become canonical only when it is:

- broadly useful across many domains
- clearly distinguishable from existing types
- describable in plain language
- stable enough to validate
- useful to both humans and machines

Avoid adding canonical types for every domain-specific object. Prefer subtypes or namespaced extensions.

## Canonical vs Extension

Use canonical types for common substrate structure.

Use extensions for domain-specific modeling.

Example:

- `xananode:media` should be canonical.
- `museum:artifact` should be an extension.
- `biology:species` should be an extension unless future adoption proves otherwise.
