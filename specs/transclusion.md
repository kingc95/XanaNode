# Transclusion

Transclusion is inclusion by reference rather than duplication.

In XanaNode, transclusion should preserve:

- source identity
- attribution
- version lineage
- fragment address
- rights metadata

The relationship type `transcludes` describes transclusion at the graph level. A viewer may derive the inverse view `transcluded_by` when looking from the fragment back to the consuming node.

The minimal interoperable form is:

- a source node, such as `source/as-we-may-think`
- a fragment node with `source_node`, `fragment_id`, `tumbler`, and `selector`
- a consuming node, such as an essay or trail
- a `transcludes` relationship from the consuming node to the fragment node

Implementations may begin with practical fragment references before attempting full Project Xanadu-style transclusion.
