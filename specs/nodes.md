# Nodes

Nodes are addressable knowledge objects.

A node may represent a person, concept, claim, source, observation, essay, media item, event, place, organization, project, technology, publication, community, relationship, revision, trail, schema, or fragment.

Nodes should have stable IDs and human-readable summaries.

Nodes should carry provenance metadata when it is known. Common provenance fields include `created_by`, `created_at`, `updated_at`, `source_url`, `rights_status`, and `confidence`.

`created_by` should point to a person, organization, project, or external actor identifier when possible. If the actor is local to the substrate, it should be represented as a node.

A node is not automatically true. It is an object in the substrate that can be connected to evidence, claims, sources, disputes, and revisions.

## Primary Type And Facets

Each node has one primary `type`. The primary type controls the node's stable route, required fields, default rendering, and validation behavior.

Nodes may also carry a narrower `subtype`. The subtype does not replace the primary type. It describes a more specific kind inside that route and validation category. For example, a node can remain a `source` while declaring `subtype: "git_repository"`, `subtype: "official_site"`, `subtype: "documentation"`, `subtype: "support_page"`, or `subtype: "web_snapshot"`.

Use `subtypes` when one node needs multiple narrow labels. Subtypes should use lower-case slugs. Namespaced subtypes are allowed for extension vocabularies.

Some real knowledge objects naturally play several roles. A quotation can be a `fragment` of a source, evidence used like a `source`, and an assertion that functions like a `claim`. Do not duplicate the quotation into separate nodes just to satisfy those categories. Model one canonical node and add secondary `facets` when the object should participate in more than one role.

Example:

```json
{
  "id": "example.minimal:fragment/as-we-may-think-0004",
  "title": "Associative Trails Quote",
  "type": "fragment",
  "facets": ["source", "claim"],
  "summary": "A stable quotation fragment that can be cited as evidence and interpreted as an assertion."
}
```

Use relationships to explain why a facet matters in context. For example, a quote can `supports` a claim, `derived_from` a source, or `defines` a concept. Facets describe secondary behavior; relationships describe meaning.

## Media Assets

Media should be represented as `media` nodes, then connected to other nodes with `has_primary_media`, `depicts`, `represents`, `transcribes`, or another appropriate relationship. A node that wants a representative image should use `primary_media` to reference a media node rather than embedding a renderer-specific image path.

Portable media nodes should use a relative `asset_path` when the file is part of the substrate or pack:

```json
{
  "id": "example.minimal:media/hugo-site-snapshot",
  "title": "Hugo Site Snapshot",
  "type": "media",
  "subtype": "web_snapshot",
  "media_type": "screenshot",
  "mime_type": "image/png",
  "asset_path": "assets/sources/hugo-official-site/snapshot.png",
  "asset_role": "source_snapshot",
  "source_url": "https://gohugo.io/",
  "source_snapshot": {
    "captured_at": "2026-06-19T00:00:00Z",
    "source_url": "https://gohugo.io/",
    "method": "screenshot",
    "tool": "xananode-core"
  },
  "rights_status": "external",
  "importance": 3,
  "summary": "A captured visual representation of the Hugo official site.",
  "relationships": []
}
```

`asset_path` is always relative to the substrate or pack root. It must not escape that root. Implementations that build packs must copy referenced assets into the pack and preserve the relative path, or rewrite the path and record that rewrite in pack metadata.

Recommended asset layout:

```text
assets/
  media/
  sources/
    <source-node-local-id>/
      snapshot.png
      thumbnail.png
      metadata.json
```

Source page previews, Open Graph images, screenshots, transcripts, and archived copies should be captured as media nodes with provenance. The external `source_url` remains the live source. The media node records the captured representation and its rights status.

## Open Properties

Substrate nodes may carry extra root-level properties so authors can describe domain-specific facts without waiting for a protocol release. Common extra properties should use the canonical property registry when possible.

The core property registry standardizes fields such as `birth_date`, `geo_coordinates`, `currency_value`, `measurement_si`, and `external_identifier`. Implementations can use `schemas/xananode-property-registry.v0.1.0.json` to parse these values consistently while still accepting custom extension properties.
