# Log

## 2026-10-27

- **Done** [p0-05](/tasks/p0-05-world-schema.md): ten world schema files (21 tables); the full schema is now
  16 files and 35 tables, documented as 16 schema, 35 table and 20 entity concepts; 26 store tests pass.
- **Start** [p0-05](/tasks/p0-05-world-schema.md).
- **Done** [p0-12](/tasks/p0-12-remove-store-testdata.md): deleted the unused `packages/store/testdata`
  at the user's request; store tests pass.
- **Create** [p0-12](/tasks/p0-12-remove-store-testdata.md) from the open question of p0-02.
- **Done** [p0-04](/tasks/p0-04-identity-schema.md): six identity schema files (14 tables) with schema, table and
  entity concepts; constraint tests pass. Also added `idx_sessions_avatar_id` and sqlc `initialisms` (see the task
  notes).
- **Start** [p0-04](/tasks/p0-04-identity-schema.md).
- **Done** [p0-03](/tasks/p0-03-persistence-skill-updates.md): `adding-data-persistence` and
  `documenting-with-okf` describe the new store API, native types, the foreign-key parent rule and the
  `tables/`/`entities/` concepts; both pass the strict skill validator.
- **Start** [p0-03](/tasks/p0-03-persistence-skill-updates.md).
- **Done** [p0-02](/tasks/p0-02-store-open-returns-db.md): `store.Open` and `store.Must` return `*sql.DB` with
  `_time_format=sqlite`; tests (race) and `make check-docs` pass. The persistence skill still shows the old API
  until p0-03.
- **Start** [p0-02](/tasks/p0-02-store-open-returns-db.md).
- **Done** [p0-01](/tasks/p0-01-port-state-bundle.md): this bundle and the `tracking-holo-port` skill were created
  from the approved plan.
- **Update** Open questions recorded in the phases: the group badge tint exception to the Tailwind colour rule
  ([P5](/phases/p5-groups-forum.md)) and the re-hosting of sticker, background and badge art
  ([P3](/phases/p3-homes.md)).
- **Update** The P0 schema work is split into the identity schema
  ([p0-04](/tasks/p0-04-identity-schema.md)), the world schema ([p0-05](/tasks/p0-05-world-schema.md)) and the
  P0 queries ([p0-06](/tasks/p0-06-p0-queries.md)). Every schema file is created in P0 because SQLite refuses to
  write a child row while a foreign-key parent table is missing, even when the key is NULL (checked with
  `sqlite3`: "no such table: main.groups"), and the installer writes `homes` rows in P0.
- **Create** 22 decisions, 10 phases, tasks p0-01 to p0-11 and five reference documents.
- **Decision** [0001](/decisions/0001-user-owns-many-habbos.md) to
  [0022](/decisions/0022-port-state-bundle.md) accepted during planning.
