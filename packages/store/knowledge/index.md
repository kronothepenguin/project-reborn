---
okf_version: "0.2"
---

# Store knowledge

Concepts for `packages/store`, the project's persistence infrastructure.

## Infrastructure

- [Store](store.md) — Persistence infrastructure that opens the SQLite file, applies the update files and provides the generated typed operations.
- [Store bundle](bundle.md) — The layout, concept types, naming and body rules of this bundle, and what make check-docs checks.
- [Adding persisted data](adding-persisted-data.md) — Where new persisted data goes in packages/store, the generator, the checks and tests that guard it, and the helpers a consumer calls, for the adding-data-persistence skill.

## Entities

- [Entities](entities/index.md) — Index of the domain entities with their invariants, lifecycle and relations.

## Updates

- [Updates](migrations/index.md) — Index of the update files that bring a database from one release to the next.
- [How database updates work](database-updates.md) — How a release's schema and seed changes reach an installed hotel through update files in packages/store, automatic and waiting updates, a copy before each run, and housekeeping's update page with config.json's new keys.

## Schemas

- [Schemas](schemas/index.md) — Index of the declared SQLite schema files.

## Tables

- [Tables](tables/index.md) — Index of the declared tables with their columns and keys.

## Queries

- [Queries](queries/index.md) — Index of the query files and their generated operations.

## Discussions

- [Discussions](discussions/index.md) — Questions kept for a later discussion, with nothing planned from them.
