# XanaNode

![XanaNode Logo](media/images/xananode-icon.svg)

## What is XanaNode?

XanaNode is a protocol, ontology, and publishing architecture for building interoperable knowledge substrates.

Rather than treating documents as the primary unit of knowledge, XanaNode treats relationships as first-class entities and models knowledge as a connected network of people, concepts, claims, questions, hypotheses, problems, knowledge gaps, communications, responses, sources, events, media, organizations, technologies, and their relationships.

XanaNode is designed to be both human-readable and machine-interpretable.

Documentation is licensed under `CC-BY-4.0`. Schemas, validators, and reference code are licensed under `Apache-2.0`. The XanaNode name and logo are trademarks of the XanaNode project; see [LICENSE.md](LICENSE.md) and [TRADEMARK.md](TRADEMARK.md).

Implementations should identify themselves as XanaNode-compatible and link to the canonical specification when accurate:

```text
This project is a XanaNode-compatible implementation.
Canonical specification: https://github.com/kingc95/XanaNode
```

It is not a wiki.

It is not a graph database.

It is not a note-taking application.

It is a framework for preserving, navigating, and federating knowledge across independently authored knowledge substrates.

---

## The Core Problem

Humanity has become exceptionally good at publishing information.

We have become far less successful at preserving the relationships that give information meaning.

Modern publishing systems prioritize documents:

* web pages
* articles
* books
* PDFs
* databases

Yet knowledge does not exist inside isolated documents.

Knowledge exists in:

* provenance
* context
* lineage
* contradiction
* influence
* evidence
* explanation
* association

The result is a civilization-scale memory problem.

Information survives.

Relationships disappear.

Sources become detached from conclusions.

Claims lose context.

Links decay.

Authority becomes difficult to evaluate.

The problem becomes increasingly visible in artificial intelligence systems, but it predates AI by decades.

XanaNode is an attempt to address this deeper problem.

---

# Core Principles

## 1. Relationships Are First-Class

Traditional systems primarily store content.

XanaNode stores both content and the relationships that connect content.

Examples:

* supports
* contradicts
* explains
* derived_from
* created
* memorializes
* documents
* participates_in

Relationships are explicit, queryable, versioned structures.

---

## 2. Provenance Matters

Every claim should be traceable.

Users should be able to answer:

* Where did this come from?
* Who said it?
* What evidence supports it?
* What contradicts it?
* What changed over time?

XanaNode prioritizes preserving knowledge lineage rather than merely preserving information.

---

## 3. Claims Are Not Facts

Claims, observations, concepts, essays, and sources are distinct node types.

XanaNode does not assume consensus.

Instead it preserves:

* claims
* counterclaims
* evidence
* disagreement
* uncertainty
* open questions
* hypotheses
* knowledge gaps
* review status

The goal is not enforced truth.

The goal is navigable knowledge.

---

## 4. Knowledge Is Structure

A knowledge substrate is not information.

A knowledge substrate is the structure that determines how information relates, persists, evolves, and can be understood.

The same information arranged differently produces different knowledge capabilities.

---

## 5. Human Readable and Machine Interpretable

Most semantic systems optimize for machines.

Most publishing systems optimize for humans.

XanaNode attempts to support both.

Humans should be able to browse, understand, and author the graph.

Machines should be able to query, reason over, and analyze it.

---

# Knowledge Substrates

A knowledge substrate is an independently authored graph of knowledge.

In XanaNode, a production substrate is backed by a Git repository. Git supplies history, branching, review, merge, and synchronization; XanaNode supplies the knowledge model, schemas, validation rules, and federation semantics.

Examples:

* personal knowledge substrates
* research substrates
* organizational substrates
* historical archives
* educational collections
* institutional memory systems

Each substrate remains independently owned and moderated.

There is no requirement for a central authority.

---

# Federation

XanaNode is designed for federation.

Multiple independent substrates can interoperate without surrendering ownership.

Example:

Researcher A maintains a substrate.

Researcher B maintains a substrate.

A university maintains a substrate.

A museum maintains a substrate.

Each can preserve its own interpretations and governance policies.

Federation allows these substrates to be connected and analyzed together.

The goal is not one global database.

The goal is a network of interoperable knowledge substrates.

---

# Schema Architecture

XanaNode uses a layered schema model.

## Core Schema

Provides the canonical node and relationship registries for the protocol.

The current core registry files are versioned and live in [schemas/](schemas):

* [xananode-node-types.v0.3.0.json](schemas/xananode-node-types.v0.3.0.json)
* [xananode-node-types.schema.v0.3.0.json](schemas/xananode-node-types.schema.v0.3.0.json)
* [xananode-relationship-types.v0.5.0.json](schemas/xananode-relationship-types.v0.5.0.json)
* [xananode-relationship-types.schema.v0.5.0.json](schemas/xananode-relationship-types.schema.v0.5.0.json)

The node registry currently centers on core types such as person, concept, claim, question, hypothesis, problem, knowledge_gap, communication, response, source, essay, and observation.

The relationship registry currently centers on core types such as defines, has_claim, supports, contradicts, documents, derived_from, answers, investigates, requires_source, possibly_related_to, and communicated_to.

The core property registry standardizes common open properties such as `uncertainty_level`, `review_status`, `research_priority`, `evidence_strength`, `communication_model`, and `communication_pattern`.

The core schema provides interoperability while still allowing extension schemas to define namespaced custom types.

Validation tools live in [tools/](tools). The repository validator checks JSON Schema conformance plus XanaNode-specific integrity rules such as declared relationship types, registered namespaces, and resolvable relationship endpoints.

---

# Implementations

The protocol repository is implementation-neutral. It defines the canonical schemas, registries, examples, governance material, and validation rules. The active implementation stack is maintained in separate repositories that consume this protocol:

* [XanaNode Core SDK](https://github.com/kingc95/XanaNode-Core-SDK) is the renderer-independent parser, validator, graph builder, fragment engine, and exporter. It includes this protocol repository as `vendor/xananode-protocol`.
* [XanaNode Workspace](https://github.com/kingc95/XanaNode-Workspace) is the local-first workspace engine used by Studio, CLIs, and editor integrations. It includes Core SDK as `vendor/xananode-core`.
* [XanaNode Hugo Theme](https://github.com/kingc95/XanaNode-Hugo) is the static-site renderer and graph viewer for XanaNode-compatible substrates.
* [XanaNode Studio](https://github.com/kingc95/XanaNode-Studio) is the desktop authoring workbench. It includes Hugo and Workspace as submodules.

The intended dependency chain is:

```text
xananode protocol
  -> XanaNode-Core-SDK
    -> XanaNode-Workspace
      -> XanaNode-Studio

XanaNode-Hugo consumes the protocol artifacts as the published/static preview renderer.
```

For a full local Studio checkout:

```bash
git clone --recurse-submodules https://github.com/kingc95/XanaNode-Studio.git
cd XanaNode-Studio
npm install
npm test
```

---

## Extension Schema

Substrates may define custom node types and relationship types.

Examples:

museum:artifact

biology:species

legal:precedent

genealogy:ancestor_of

Custom types are:

* namespaced
* documented
* versioned
* machine-readable

This allows evolution without breaking compatibility.

---

# Namespaces

XanaNode supports schema namespaces.

Examples:

xananode:claim

museum:artifact

research:experiment

Namespaces prevent collisions and allow independent schema development.

Relationships between schemas can themselves be represented.

Examples:

equivalent_to

broader_than

narrower_than

related_to

---

# Tumbler Addressing

XanaNode is intended to support persistent, location-independent addressing.

The goal is to move beyond URLs and document paths.

Objects should remain addressable even if:

* files move
* websites migrate
* structures change

Future implementations may support:

* node-level addressing
* relationship-level addressing
* claim-level addressing
* fragment-level addressing
* transcluded content references

This provides durable references across time.

---

# Transclusion

XanaNode embraces transclusion principles inspired by Project Xanadu.

Rather than duplicating information repeatedly, knowledge should be referenced and reused.

Benefits include:

* provenance preservation
* reduction of duplication
* easier revision tracking
* stronger lineage visibility

Practical implementations may initially focus on partial transclusion while preserving compatibility with existing publishing systems.

---

# Mergeability

Mergeability is a core design goal.

Two substrates should be able to exchange knowledge without requiring identical governance.

Merge operations should preserve:

* authorship
* provenance
* disagreement
* source attribution
* local moderation decisions

Merging should add structure rather than destroy context.

---

# Civilizational Memory

The long-term goal of XanaNode is not merely better note-taking, search, or AI retrieval.

The goal is the creation of a federated civilizational memory system.

A system where:

* knowledge remains locally owned
* provenance remains visible
* disagreement remains preserved
* schemas remain interoperable
* relationships remain navigable

A civilization-scale memory substrate built from independently maintained knowledge systems rather than a single centralized authority.

XanaNode is an open protocol for building interoperable knowledge substrates that preserve relationships, provenance, lineage, and disagreement across independently authored and federated knowledge systems.

