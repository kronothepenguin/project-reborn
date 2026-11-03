# Updates

Concepts for the update files under `packages/store/migrations/`, applied in version order, each once. A new database gets
them all when `store.Open` creates it.

- [0001-baseline.sql](0001-baseline.md) — Creates every table and index of the schema files as they were before updates existed, so a database created then passes through it unchanged.
- [0002-home-store.sql](0002-home-store.md) — Writes Holo's home store, its 20 categories and 298 items with Holo's ids, keeping the rows already there.
- [0003-ranks.sql](0003-ranks.md) — Creates Holo's five staff ranks as access groups with their attributes, only on a hotel that has no access group yet.
- [0004-database-attribute.sql](0004-database-attribute.md) — Grants housekeeping.database to every group and every user that holds housekeeping.accessGroups.
