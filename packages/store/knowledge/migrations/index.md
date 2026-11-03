# Updates

Concepts for the update files under `packages/store/migrations/`, applied in version order, each once. A new database gets
them all when `store.Open` creates it.

- [0001-baseline.sql](0001-baseline.md) — Creates every table and index of the schema files as they were before updates existed, so a database created then passes through it unchanged.
