# Log

## 2026-11-01

- **Update** [hk-a-09](/tasks/hk-a-09-exit-check.md): the housekeeping tests create accounts through `auth.CreateAccount`,
  because the CMS of P2 reads what a hand-written habbo lacks.
- **Update** [hk-a-09](/tasks/hk-a-09-exit-check.md): the list of settings forms has its own name, because `catalogue`
  also means the attributes in that package, and `tools/create` names the exported type in the README it writes.
- **Done** [hk-a-09](/tasks/hk-a-09-exit-check.md): every exit criterion of HK-A holds on the production binaries: 116
  browser checks, 317 Go tests and 120 component tests pass, and the differences from Holo are listed.
- **Start** [hk-a-09](/tasks/hk-a-09-exit-check.md).
- **Done** [hk-a-08](/tasks/hk-a-08-access-groups.md): staff with `housekeeping.accessGroups` manage groups, attributes
  and members with display habbos, and a change that would leave nobody able to manage them is refused and logged.
- **Start** [hk-a-08](/tasks/hk-a-08-access-groups.md).
- **Done** [hk-a-07](/tasks/hk-a-07-settings-editor.md): staff with `housekeeping.settings` edit every declared setting
  in forms with Holo's texts, all or nothing, and a value back at its default deletes the row.
- **Start** [hk-a-07](/tasks/hk-a-07-settings-editor.md).
- **Done** [hk-a-06](/tasks/hk-a-06-dashboard.md): staff land on Holo's dashboard, with the counts, the holders of
  `housekeeping.accessGroups` and a shared note saved with `settings.Set`.
- **Start** [hk-a-06](/tasks/hk-a-06-dashboard.md).
- **Done** [hk-a-05](/tasks/hk-a-05-staff-log.md): one helper writes the `staff_logs` row of a mutation, and `GET /logs`
  reads them with `housekeeping.logs`, in pages.
- **Start** [hk-a-05](/tasks/hk-a-05-staff-log.md).
- **Done** [hk-a-04](/tasks/hk-a-04-layout.md): the layout of `docs/hk.png` is built as its own design system, with the
  `Table` primitive, the previous login and Holo's Access Denied page.
- **Start** [hk-a-04](/tasks/hk-a-04-layout.md).
- **Done** [hk-a-03](/tasks/hk-a-03-scaffold-and-access.md): `packages/housekeeping` and `apps/housekeeping` exist,
  every route under `/housekeeping/` belongs to staff, and `Mount` works alone and on one mux with the CMS.
- **Start** [hk-a-03](/tasks/hk-a-03-scaffold-and-access.md).
- **Done** [hk-a-02](/tasks/hk-a-02-housekeeping-config.md): `housekeeping.host` and `housekeeping.port` are in
  `packages/config`, and the installer writes their defaults.
- **Start** [hk-a-02](/tasks/hk-a-02-housekeeping-config.md).
- **Done** [hk-a-01](/tasks/hk-a-01-create-templates.md): `tools/create` generates runners that open the db with
  `store.FromConfig()` and hand it to `New`, and a generated project compiles and builds.
- **Start** [hk-a-01](/tasks/hk-a-01-create-templates.md).
- **Create** [hk-a-01](/tasks/hk-a-01-create-templates.md) to [hk-a-09](/tasks/hk-a-09-exit-check.md): HK-A is active on the
  `hk-a` branch, beside P2.
- **Update** P2 is done, and HK-A runs on the `hk-a` branch.
- **Done** [p2-07](/tasks/p2-07-exit-check.md): P2 meets its exit criteria from a clean build, with 223 browser checks
  and every gate passing, and the differences from Holo are listed.
- **Start** [p2-07](/tasks/p2-07-exit-check.md).
- **Done** [p2-06](/tasks/p2-06-several-habbos.md): a user can add habbos up to `registration.maxHabbosPerUser` and
  switch the active one.
- **Start** [p2-06](/tasks/p2-06-several-habbos.md).
- **Done** [p2-05](/tasks/p2-05-account-details.md): the motto, email, password and referral tabs work as Holo's do,
  with the current password and birth date on both forms that change credentials.
- **Start** [p2-05](/tasks/p2-05-account-details.md).
- **Done** [p2-04](/tasks/p2-04-account-looks.md): the account pages have Holo's frame, with the settings navigation
  and the Join Club box, and `/account/looks` saves a look with the editor listening as `settings.js` does.
- **Start** [p2-04](/tasks/p2-04-account-looks.md).
- **Done** [p2-03](/tasks/p2-03-me-page.md): `/me` has Holo's plate, inline motto editor and feed, with alerts,
  birthday, last sign-in and the staff help count.
- **Start** [p2-03](/tasks/p2-03-me-page.md).
- **Done** [p2-02](/tasks/p2-02-community-layout.md): signed-in pages have Holo's header, tabs, footer and maintenance
  alert, for guests and signed-in users, and staff get the Housekeeping tab and footer link.
- **Start** [p2-02](/tasks/p2-02-community-layout.md).
- **Create** the rest of the P2 tasks, [p2-02](/tasks/p2-02-community-layout.md) to [p2-07](/tasks/p2-07-exit-check.md).
- **Done** [p2-01](/tasks/p2-01-delete-expired-sessions.md): a task on `packages/scheduler` deletes sessions once they
  expire, every minute, in place of the purge at sign-in.
- **Start** [p2-01](/tasks/p2-01-delete-expired-sessions.md).
- **Create** [p2-01](/tasks/p2-01-delete-expired-sessions.md).
- **Decision** [0050](/decisions/0050-expired-sessions-deleted.md): expired sessions are deleted on a schedule.
- **Decision** [0049](/decisions/0049-store-is-the-global-database.md) supersedes
  [0047](/decisions/0047-every-program-works-on-an-empty-database.md): `packages/store` is the global database, with every
  schema.
- **Update** P1 is done again and P2 is active, with HK-A to run beside it on a feature branch; both get their tasks when
  their work starts.
- **Done** [p1-20](/tasks/p1-20-delete-expired-resets.md): a task on `packages/scheduler` deletes reset links once they
  expire, every minute, in place of the purge in `auth.CreateReset`.
- **Start** [p1-20](/tasks/p1-20-delete-expired-resets.md).
- **Update** P0 is done again and P1 is active.
- **Done** [p0-24](/tasks/p0-24-empty-database.md): the CMS works on an empty database it creates, and the installer
  still works on that database afterwards, once.
- **Start** [p0-24](/tasks/p0-24-empty-database.md).
- **Done** [p0-23](/tasks/p0-23-scheduler.md): `packages/scheduler` runs tasks written as `scheduler.Every(1,
  scheduler.Hour, task)`, with one scheduler per process.
- **Start** [p0-23](/tasks/p0-23-scheduler.md).
- **Done** [p0-22](/tasks/p0-22-keep-dist-template.md): the placeholder template is back in `tools/create` and tracked
  in git, so a new app has its `dist/index.html` on every machine.
- **Start** [p0-22](/tasks/p0-22-keep-dist-template.md).
- **Update** P0 is active again, then P1, and P2 waits; both get new tasks from the user's second review:
  [p0-22](/tasks/p0-22-keep-dist-template.md) to [p0-24](/tasks/p0-24-empty-database.md) and
  [p1-20](/tasks/p1-20-delete-expired-resets.md).
- **Decision** [0048](/decisions/0048-footer-names-reborn.md): the footer keeps `Powered by Project Reborn ©`.
- **Decision** [0047](/decisions/0047-every-program-works-on-an-empty-database.md) supersedes
  [0016](/decisions/0016-installer.md): every program works on an empty database, and the installer merges every schema and
  seed.
- **Decision** [0046](/decisions/0046-main-and-feature-branches.md) supersedes
  [0033](/decisions/0033-commit-each-task-on-main.md): sequential work on `main`, parallel work on feature branches.
- **Decision** [0045](/decisions/0045-homes-deferred.md): homes are deferred until the art exists.
- **Decision** [0044](/decisions/0044-expired-reset-links-deleted.md): reset links are deleted when they expire.
- **Decision** [0043](/decisions/0043-scheduler.md): `packages/scheduler` runs timed tasks.
- **Update** P1 is done and P2 is active; P2 gets its tasks when its work starts.
- **Done** [p1-18](/tasks/p1-18-exit-check-as-holo.md): P1 matches Holo page by page. 141 browser checks and every gate
  pass from a clean build, and the differences that remain are listed for the user.
- **Start** [p1-18](/tasks/p1-18-exit-check-as-holo.md).
- **Done** [p1-19](/tasks/p1-19-text-fixes.md): the join button keeps its text on one line, and the forgot page keeps
  the spaces around `log out`.
- **Start** [p1-19](/tasks/p1-19-text-fixes.md).
- **Done** [p1-17](/tasks/p1-17-registration-flow.md): `/register` follows Holo's order and `registration.js`, in a
  real Chromium and without JavaScript. This also fixes the `Done` button that a visitor who kept the suggested look
  could not press.
- **Start** [p1-17](/tasks/p1-17-registration-flow.md).
- **Done** [p1-16](/tasks/p1-16-registration-rules.md): `/register` follows Holo's email, birth date and age rules,
  texts and defaults, and the live name check keeps its own texts. The age limit now also runs on the server.
- **Start** [p1-16](/tasks/p1-16-registration-rules.md).
- **Done** [p1-15](/tasks/p1-15-landing-as-holo.md): the landing page has Holo's sign-in texts, the remember-me bubble,
  the party advert, the `Enable JavaScript` box and the age-limit message, with a new `Bubble` primitive.
- **Start** [p1-15](/tasks/p1-15-landing-as-holo.md).
- **Done** [p1-14](/tasks/p1-14-reset-mail-limit.md): an account holds at most `auth.resetMaxActive` unexpired reset
  links, checked in one statement, and `POST /forgot` answers the same way at the limit.
- **Start** [p1-14](/tasks/p1-14-reset-mail-limit.md).
- **Done** [p1-13](/tasks/p1-13-forgot-as-holo.md): `/forgot` asks for the username and the email as Holo does and
  mails Holo's reminder, with the link, only when both belong to one account. Signed-in visitors see Holo's page.
- **Start** [p1-13](/tasks/p1-13-forgot-as-holo.md).
- **Done** [p1-12](/tasks/p1-12-sign-out-page.md): signing out shows Holo's confirmation or `You are not logged in`,
  and a banned visitor loses the session on the next page and sees the ban.
- **Start** [p1-12](/tasks/p1-12-sign-out-page.md).
- **Done** [p1-11](/tasks/p1-11-signed-out-layout.md): the signed-out pages have Holo's titles, meta tags,
  registered-users count, logo link and footer separators.
- **Start** [p1-11](/tasks/p1-11-signed-out-layout.md).
- **Update** P0 is done again and P1 is active.
- **Done** [p0-21](/tasks/p0-21-make-install.md): every project and the root have a `make install`, a clean checkout
  compiles after it with no frontend build, and the root targets of the orchestrator are comments that say what they
  wait for.
- **Start** [p0-21](/tasks/p0-21-make-install.md).
- **Done** [p0-20](/tasks/p0-20-project-readmes.md): project folders document themselves in `README.md`, in the
  repository and in `tools/create`, and one `AGENTS.md` stays at the root.
- **Start** [p0-20](/tasks/p0-20-project-readmes.md).
- **Done** [p0-19](/tasks/p0-19-create-templates.md): every `tools/create` template ends with a newline, and a test
  checks that a generated project is formatted.
- **Start** [p0-19](/tasks/p0-19-create-templates.md).
- **Done** [p0-18](/tasks/p0-18-cms-host.md): the CMS listens on `cms.host` and `cms.port` from `config.json`, with
  `localhost` as the default, so a pod can set `0.0.0.0`.
- **Start** [p0-18](/tasks/p0-18-cms-host.md).
- **Update** the user saved the image of [0041](/decisions/0041-housekeeping-design-system.md) as `docs/hk.png`;
  [HK-A](/phases/hk-a-housekeeping-core.md) describes it.
- **Update** P0 is active again, then P1, and P2 waits; both get new tasks from the user's review of P1:
  [p0-18](/tasks/p0-18-cms-host.md) to [p0-21](/tasks/p0-21-make-install.md) and
  [p1-11](/tasks/p1-11-signed-out-layout.md) to [p1-18](/tasks/p1-18-exit-check-as-holo.md).
- **Create** [How the programs work together](/reference/architecture.md) and
  [Where the port differs from Holo](/reference/holo-differences.md).
- **Decision** [0042](/decisions/0042-two-badge-palettes.md): group badges get two palettes, and the Tailwind colour rule
  stays hard.
- **Decision** [0041](/decisions/0041-housekeeping-design-system.md): housekeeping gets a simple design system of its own.
- **Decision** [0040](/decisions/0040-housekeeping-writes-settings.md): housekeeping is the single writer of settings.
- **Decision** [0039](/decisions/0039-orchestrator-is-a-later-project.md): the orchestrator is a later project.
- **Decision** [0038](/decisions/0038-project-docs-and-install.md): project folders hold a README and a `make install`.
- **Decision** [0037](/decisions/0037-cms-host-in-config.md): the CMS address comes from `config.json`.
- **Decision** [0036](/decisions/0036-referral-farming-accepted.md): referral farming stays open for now.
- **Decision** [0035](/decisions/0035-reset-mail-limit.md): reset mail is limited per account.
- **Decision** [0034](/decisions/0034-behaviour-matches-holo.md): every behaviour matches Holo exactly, with new and
  safest code.

## 2026-10-30

- **Update** P1 is done and P2 is active; P2 gets its tasks when its work starts. P1's phase file lists four open
  questions for the user's review.
- **Done** [p1-09](/tasks/p1-09-exit-check.md): all exit criteria hold on a clean build: a new visitor went from a
  referral link through registration, signing out and in, and a mailed password reset in a real Chromium, with the
  referrer paid. P1 is done.
- **Done** [p1-10](/tasks/p1-10-register-page-title.md): `/register` has a title, in Holo's `Reborn ~ Register` form,
  and the legal pages use the same form.
- **Start** [p1-10](/tasks/p1-10-register-page-title.md), found while reviewing P1 before closing it.
- **Start** [p1-09](/tasks/p1-09-exit-check.md).
- **Done** [p1-08](/tasks/p1-08-landing-promo.md): the landing page shows the HabboWidgets promo, built from
  `vendor/HabboWidgets`, with random habbos from `/xml/promo-habbos.xml`. Its button carries the chosen look into the
  avatar editor on `/register`, and the join button stays for `features.landingPromo` off and for visitors without
  JavaScript.
- **Start** [p1-08](/tasks/p1-08-landing-promo.md).
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
