# Tasks

Units of work grouped by phase. Statuses: todo, in-progress, blocked, done, dropped. A phase gets its tasks when it
starts.

## P0 Foundations

- [p0-01 Create the port state bundle and the tracking skill](/tasks/p0-01-port-state-bundle.md) — Seed plans/holo-port from the approved plan and add the tracking-holo-port skill so the port can be resumed in any session. **done**
- [p0-02 Make store.Open return *sql.DB](/tasks/p0-02-store-open-returns-db.md) — Remove the Store wrapper so store.Open and store.Must return *sql.DB, and add the sqlite time format to the connection string. **done**
- [p0-03 Update the persistence and OKF skills](/tasks/p0-03-persistence-skill-updates.md) — Align adding-data-persistence and documenting-with-okf with the store API, native types and entity and table concepts. **done**
- [p0-04 Write the identity schema](/tasks/p0-04-identity-schema.md) — Schema files and OKF concepts for users, auth, avatars, access, settings and referrals. **done**
- [p0-05 Write the world schema](/tasks/p0-05-world-schema.md) — Schema files and OKF concepts for profiles, homes, the home store, groups, economy, club, forums, news, moderation and site. **done**
- [p0-06 Write the queries P0 needs](/tasks/p0-06-p0-queries.md) — Named sqlc operations for auth, habbo creation, access and settings, with their OKF query concepts. **done**
- [p0-07 Declare the P0 config sections and Create](/tasks/p0-07-config-sections.md) — Add settingsRefreshSeconds and the store, cms, auth and site sections to packages/config, plus Create for the installer. **done**
- [p0-08 Build the Settings entity in packages/virtual](/tasks/p0-08-virtual-settings.md) — Create the packages/virtual module with a type-safe Settings wrapper that merges settings rows over config and receives the database. **todo**
- [p0-09 Rewrite packages/auth](/tasks/p0-09-auth-rewrite.md) — Replace the session-only library with argon2id passwords, habbo-name login with throttling and bans, sessions, middleware, attributes and password reset. **todo**
- [p0-10 Scaffold and build the installer](/tasks/p0-10-installer.md) — Create packages/installer and apps/installer with tools/create and build the status, config, site and administrator steps. **todo**
- [p0-11 Wire the CMS to config, store, settings and auth](/tasks/p0-11-cms-wiring.md) — The CMS runners open config, store, settings and auth, and the router gets its dependencies, cross-origin protection, sessions and maintenance mode. **todo**

- [p0-12 Remove the unused store test data](/tasks/p0-12-remove-store-testdata.md) — Delete packages/store/testdata, stale schema files from the store refactor that no code references. **done**

## Later phases

[P1](/phases/p1-signed-out.md), [P2](/phases/p2-me-account.md), [HK-A](/phases/hk-a-housekeeping-core.md),
[HK-B](/phases/hk-b-users-moderation.md), [P3](/phases/p3-homes.md), [P4](/phases/p4-community.md),
[P5](/phases/p5-groups-forum.md), [P6](/phases/p6-economy.md) and [P7](/phases/p7-help.md) get their tasks when
they start.
