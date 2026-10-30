# Log

## 2026-10-30

- **Done** [p1-07](/tasks/p1-07-legal-pages.md): `/disclaimer` and `/privacy` serve Holo's texts with the site names
  from the settings, so the footer and registration links work.
- **Start** [p1-07](/tasks/p1-07-legal-pages.md).
- **Done** [p1-06](/tasks/p1-06-forgot-and-reset.md): `/forgot` mails a single-use reset link in the background and
  answers the same way for every address, and `/reset/{token}` sets the new password. The production binary went
  through the whole reset against a throwaway SMTP server.
- **Start** [p1-06](/tasks/p1-06-forgot-and-reset.md).
- **Done** [p1-05](/tasks/p1-05-referrals.md): `/register?refer=<habbo name>` writes the referral in the registration
  transaction and pays `referral.reward` to the referrer, with a `referral` ledger row, while `referral.enabled` is
  on.
- **Start** [p1-05](/tasks/p1-05-referrals.md).
- **Done** [p1-04](/tasks/p1-04-registration.md): `/register` creates an account with the avatar editor, whose look
  reaches the backend through hidden inputs, with the live name check and the per-IP limit, and signs the visitor in.
  A real Chromium registered end to end, and the database held the editor's exact figure.
- **Start** [p1-04](/tasks/p1-04-registration.md).
- **Done** [p1-03](/tasks/p1-03-account-helpers.md): the name, email and birth-date rules and the writes of an account
  and a habbo moved from the installer into `packages/auth`, as [0030](/decisions/0030-accounts-created-in-auth.md)
  says; the installer's end-to-end run still works.
- **Start** [p1-03](/tasks/p1-03-account-helpers.md).
- **Done** [p1-02](/tasks/p1-02-sign-in-and-out.md): `POST /` signs in with `auth.Login`, `POST /logout` signs out, and
  `/me` shows the active habbo. On the production binaries, with `curl` and a real Chromium, the whole flow worked,
  including a failed sign-in during maintenance and the throttle.
- **Start** [p1-02](/tasks/p1-02-sign-in-and-out.md).
- **Done** [p1-01](/tasks/p1-01-primitives.md): Checkbox, Select, Notice, Avatar and Icon are in `packages/components`
  with stories and tests, and 112 component tests pass. Checking them through the real build also led to a fix in
  `packages/astro`, which now removes Svelte's `<!>` select marker from built pages.
- **Start** [p1-01](/tasks/p1-01-primitives.md).
- **Update** [p1-04](/tasks/p1-04-registration.md) and [p1-08](/tasks/p1-08-landing-promo.md) with the
  `vendor/HabboWidgets` details: how the editor's look reaches the backend through hidden inputs, how to build the
  landing widget, and that its button sends `gender` and `figure` to `/register`.
- **Create** the P1 tasks, [p1-01](/tasks/p1-01-primitives.md) to [p1-09](/tasks/p1-09-exit-check.md).
- **Decision** [0033](/decisions/0033-commit-each-task-on-main.md): the agent commits each finished task on `main`
  and never pushes. The work of p0-11 and p0-17 went in as four commits, each passing its gates from a clean
  export.
- **Decision** [0032](/decisions/0032-avatar-imager-default.md): `imaging.avatarUrl` defaults to the habbo.com
  imager.
- **Decision** [0031](/decisions/0031-p1-minimal-me-page.md): P1 signs in to a minimal `/me` page.
- **Decision** [0030](/decisions/0030-accounts-created-in-auth.md): `packages/auth` creates accounts and habbos.

## 2026-10-28

- **Update** P0 is done again and P1 is active; P1 gets its tasks when its work starts.
- **Done** [p0-17](/tasks/p0-17-package-level-settings-and-auth.md): settings live in the `virtual/settings`
  singleton, auth is helpers receiving the db, `cms.New(db, …)` loads the settings and protects its own routes,
  and runners open the db with `store.FromConfig()`; all gates pass and the installer-then-CMS run works.
- **Start** [p0-17](/tasks/p0-17-package-level-settings-and-auth.md); P0 is active again and P1 waits.
- **Create** [p0-17](/tasks/p0-17-package-level-settings-and-auth.md) to implement 0029.
- **Decision** [0029](/decisions/0029-package-level-settings-and-auth.md) supersedes
  [0024](/decisions/0024-settings-catalogue-and-getters.md): settings are a package-level singleton in
  `virtual/settings`, auth is helpers receiving the db, and apps take the db on creation. The user also ruled
  that `apps/**/cmd/**` changes only on request.
- **Update** P0 is done and P1 is active; P1 gets its tasks when its work starts.
- **Done** [p0-11](/tasks/p0-11-cms-wiring.md): the CMS runners open config, store, settings and auth, put
  `RealIP`, cross-origin protection and sessions in front of the routes, reload settings every `cms.refresh`
  seconds and gate the pages behind maintenance. End to end, after the installer the CMS served `/`, refused a
  cross-site POST with 403, and showed or lifted maintenance about a second after its row changed.
- **Start** [p0-11](/tasks/p0-11-cms-wiring.md).
- **Done** [p0-16](/tasks/p0-16-trusted-proxies.md): the `proxy` section in `packages/config` and the
  `auth.RealIP` middleware; config, auth, virtual and installer tests pass, and three deliberate trust bugs were
  each caught by the tests.
- **Start** [p0-16](/tasks/p0-16-trusted-proxies.md).
- **Create** [p0-16](/tasks/p0-16-trusted-proxies.md) to implement 0028.
- **Decision** [0028](/decisions/0028-trusted-proxies-in-config.md): a `proxy` section in `config.json`, off
  by default, makes `auth.RealIP` take the client IP from `X-Forwarded-For` of trusted proxies.
- **Done** [p0-15](/tasks/p0-15-runners-from-root.md): `make dev` starts air from the repository root for the
  installer and the CMS, and `tools/create` generates apps that way; both runners were checked running from the
  root.
- **Done** [p0-14](/tasks/p0-14-create-dotfile-templates.md): `tools/create` embeds `all:templates`, so it
  writes `.air.toml`; a new test renders the templates.
- **Start** [p0-15](/tasks/p0-15-runners-from-root.md).
- **Create** [p0-15](/tasks/p0-15-runners-from-root.md) to implement 0027.
- **Decision** [0027](/decisions/0027-runners-run-from-the-root.md): in development the runners run from the
  repository root, so they share the root `config.json`.
- **Start** [p0-14](/tasks/p0-14-create-dotfile-templates.md).
- **Done** [p0-10](/tasks/p0-10-installer.md): `packages/installer` and `apps/installer` with the status, config,
  site, administrator and done steps; 10 test results pass with `-race`, and an end-to-end run in an empty
  directory produced `config.json`, the database and an administrator with every attribute. Open for p0-11: where
  the runners run in development.
- **Create** [p0-14](/tasks/p0-14-create-dotfile-templates.md) from p0-10: `tools/create` never writes the
  `.air.toml` template.
- **Start** [p0-10](/tasks/p0-10-installer.md).
- **Decision** [0026](/decisions/0026-installer-administrator-and-names.md): `registration.startCredits` is
  declared in P0; the administrator step also asks the birth date; habbo names take Habbo's wider set.
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
