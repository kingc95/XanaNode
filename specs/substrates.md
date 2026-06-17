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
