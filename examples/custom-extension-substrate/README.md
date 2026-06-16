# Custom Extension Substrate Example

This example demonstrates how a substrate can extend XanaNode Core without breaking interoperability.

The substrate defines a local namespace:

```text
example.museum
```

It adds:

- a custom node type: `example.museum:artifact`
- custom relationship types: `example.museum:curatorial_context_for` and `example.museum:has_curatorial_context`

A reader that does not understand these custom types should still preserve them as declared, namespaced, versioned schema extensions. A reader that does understand them can validate and render them more precisely.
