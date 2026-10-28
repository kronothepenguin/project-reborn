# Log

## 2026-10-28

- **Decision** [0025](/decisions/0025-settings-reads-never-wait.md): `virtual.Settings` keeps the atomic pointer for
  lock-free reads and the mutex only writers use; a comment on the type now explains why.

## 2026-10-27

- **Done** [p0-09](/tasks/p0-09-auth-rewrite.md): the new `packages/auth` with argon2id passwords, habbo-name login
  with throttling and bans, hashed session tokens with sliding expiry, middleware, the attribute catalogue and
  password resets; 38 test results pass with `-race`. Open: client IPs behind a reverse proxy.
- **Start** [p0-09](/tasks/p0-09-auth-rewrite.md).
- **Done** [p0-13](/tasks/p0-13-settings-catalogue.md): `config.json` holds `store.path` and `cms.port`;
  `virtual.Settings` is a map of the declared defaults, the config values and the rows, with typed getters, `…Or`
  getters, `Set` and `Reload`. 33 config and 26 virtual test results pass (virtual with `-race`).
- **Start** [p0-13](/tasks/p0-13-settings-catalogue.md).
- **Create** [p0-13](/tasks/p0-13-settings-catalogue.md) to implement 0023 and 0024.
- **Update** The P0 scope, tasks p0-09 to p0-11, phases P1, P2, P3, P5, P6 and HK-A and the database reference
  follow 0023 and 0024: runtime values are settings, written with `Set`. HK-A gets an open question about the
  reload interval of a housekeeping running alone.
- **Decision** [0024](/decisions/0024-settings-catalogue-and-getters.md) supersedes
  [0010](/decisions/0010-virtual-settings-entity.md): settings are a map of declared keys with typed getters,
  `…Or` variants and `Set`.
- **Decision** [0023](/decisions/0023-config-holds-startup-keys.md) supersedes
  [0009](/decisions/0009-config-is-static-types.md): `config.json` holds only the startup keys.
- **Done** [p0-08](/tasks/p0-08-virtual-settings.md): the `packages/virtual` module with the `Settings` entity
  (`LoadSettings`, `Config`, `Base`, `Update`, `Reload`) and a README; 21 test results pass with `-race`. Open for
  p0-11: whether the `Reload` ticker follows a changed `settingsRefreshSeconds`.
- **Start** [p0-08](/tasks/p0-08-virtual-settings.md).
- **Done** [p0-07](/tasks/p0-07-config-sections.md): `packages/config` declares `settingsRefreshSeconds` and the
  `store`, `cms`, `auth` and `site` sections (15 keys) plus `Create`; 122 test results pass. Errors now carry the
  full key path (`cms.port`).
- **Start** [p0-07](/tasks/p0-07-config-sections.md).
- **Done** [p0-06](/tasks/p0-06-p0-queries.md): nine query files with 41 operations and their concepts; 36 store
  tests pass. Also added `_timezone=UTC` to `store.Open` and a sqlc nullability gotcha to the persistence skill.
- **Start** [p0-06](/tasks/p0-06-p0-queries.md).
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
