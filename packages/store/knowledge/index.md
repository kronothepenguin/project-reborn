---
okf_version: "0.2"
---

# Store knowledge

Concepts for `packages/store`, the project's persistence infrastructure.

## Infrastructure

- [Store](store.md) — Persistence infrastructure that opens the SQLite file, applies the update files and provides the generated typed operations.
- [Store bundle](bundle.md) — The layout of this bundle, its concept types and what make check-docs checks.
- [Adding persisted data](adding-persisted-data.md) — Where new persisted data goes in packages/store: the table list, the files, the generator, the checks and tests that guard it, and the helpers a consumer calls, for the adding-data-persistence skill.

## Tables

- [Tables](tables.md) — Every table of packages/store/schema, grouped by the entity it holds, with what it holds and its schema file, to find a table before adding one.

## Updates

- [How database updates work](database-updates.md) — How a release's schema and seed changes reach an installed hotel through update files in packages/store, automatic and waiting updates, a copy before each run, and housekeeping's update page with config.json's new keys.

## Discussions

- [Discussions](discussions/index.md) — Questions kept for a later discussion, with nothing planned from them.
