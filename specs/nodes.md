# Nodes

Nodes are addressable knowledge objects.

A node may represent a person, concept, claim, source, observation, essay, media item, event, place, organization, project, technology, publication, community, relationship, revision, trail, schema, or fragment.

Nodes should have stable IDs and human-readable summaries.

Nodes should carry provenance metadata when it is known. Common provenance fields include `created_by`, `created_at`, `updated_at`, `source_url`, `rights_status`, and `confidence`.

`created_by` should point to a person, organization, project, or external actor identifier when possible. If the actor is local to the substrate, it should be represented as a node.

A node is not automatically true. It is an object in the substrate that can be connected to evidence, claims, sources, disputes, and revisions.
