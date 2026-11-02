# Decisions

Design decisions confirmed by the user, numbered in the order they were taken. Accepted text is never rewritten; a
change supersedes a decision with a new one.

## Identity and access

- [0001 One user owns many habbos](/decisions/0001-user-owns-many-habbos.md) — A user is the person; credentials and sessions belong to the user and a session records the active habbo.
- [0002 Login with habbo name and password](/decisions/0002-login-with-habbo-name.md) — The login box takes a habbo name and the owning user's password; the named habbo becomes the active one.
- [0005 Passwords hashed with argon2id](/decisions/0005-argon2id-passwords.md) — Passwords are hashed with argon2id from golang.org/x/crypto and stored as PHC strings that carry their parameters.
- [0006 Profiles belong to each habbo](/decisions/0006-profiles-per-habbo.md) — Each habbo has its own profile, which anchors its home page and its tags.
- [0014 Attribute-based access control](/decisions/0014-attribute-based-access.md) — Admin-defined access groups carry attributes that belong to the user, and code checks attributes only, never a rank number or a group name.
- [0015 Dotted attribute names; fuses stay separate](/decisions/0015-attribute-names-and-fuses.md) — Web attributes use dotted names such as forum.edit, while R26 fuses keep their exact fuse_* names in a separate, deferred catalogue.
- [0035 Reset mail is limited per account](/decisions/0035-reset-mail-limit.md) — An account can hold auth.resetMaxActive unexpired reset links at a time, so nobody can make the hotel send repeated mail to one address.
- [0044 Expired reset links are deleted when they expire](/decisions/0044-expired-reset-links-deleted.md) — A reset link works for auth.resetTokenMinutes, 60 by default, and a scheduled task deletes it at that age, so that the account can ask for a new one.
- [0050 Expired sessions are deleted on a schedule](/decisions/0050-expired-sessions-deleted.md) — A task on the scheduler deletes sessions once they expire, in place of the purge at sign-in.
- [0018 Password reset by email](/decisions/0018-password-reset-by-email.md) — Forgot password emails a single-use, expiring reset link built on password_resets and the mail settings.
- [0030 packages/auth creates accounts and habbos](/decisions/0030-accounts-created-in-auth.md) — The helpers that create a user with its first habbo, and a habbo with its profile, home and wallet, live in packages/auth with the name, email and birth-date rules, and take sqlc queries so each caller keeps its own transaction.
- [0053 Attributes on groups and on users](/decisions/0053-attributes-on-groups-and-users.md) — A user holds the attributes of their access groups and those given to them directly, private user data takes its own attribute, and the guard needs one user holding both keys.
- [0054 Access groups are Holo's ranks](/decisions/0054-access-groups-are-holos-ranks.md) — The installer creates Holo's staff ranks as access groups with attributes, and admins can create, edit and delete any group.
- [0055 Staff levels](/decisions/0055-staff-levels.md) — Each access group has a level, staff act only on users below them, IP bans skip housekeeping staff, and a banned user in housekeeping goes to the CMS.
- [0058 Habbos are archived, not deleted](/decisions/0058-habbos-are-archived.md) — A user can archive a habbo instead of deleting it, which hides the habbo and keeps the audit trail, and staff can restore it.
- [0059 Account forms keep the birth date and the session](/decisions/0059-account-forms.md) — The email and password forms keep Holo's birth date question, and a password change keeps the session of the user who made it, with a new token.

## Configuration and data

- [0049 packages/store is the global database](/decisions/0049-store-is-the-global-database.md) — packages/store stays the one access point to one global database with every schema, and programs do not get schemas of their own.
- [0047 Every program works on an empty database](/decisions/0047-every-program-works-on-an-empty-database.md) — Any program creates and uses an empty database with default values, while the installer merges every schema and seed and lets the administrator change the defaults once.
- [0004 Fresh start without Holo data](/decisions/0004-fresh-start.md) — No data is imported from a Holo or Holograph MySQL database, so the schema keeps no legacy ids, formats or hashes.
- [0007 Store knowledge documents entities and tables](/decisions/0007-store-okf-entities-and-tables.md) — The store's OKF bundle adds entities/ and tables/ concepts next to the required schemas/ and queries/ concepts.
- [0009 Config is static types; settings map onto config keys](/decisions/0009-config-is-static-types.md) — packages/config holds static types describing config.json, and database settings rows override config keys at runtime. **Superseded by [0023](/decisions/0023-config-holds-startup-keys.md).**
- [0010 Settings entity in packages/virtual](/decisions/0010-virtual-settings-entity.md) — packages/virtual holds a Settings entity, a type-safe wrapper over config with the settings rows merged in, which receives the database instead of holding it. **Superseded by [0024](/decisions/0024-settings-catalogue-and-getters.md).**
- [0011 store.Open returns *sql.DB](/decisions/0011-store-returns-sql-db.md) — The Store wrapper is removed; store.Open returns *sql.DB and callers run the sqlc queries on a db or a transaction.
- [0012 Native SQLite date and boolean types](/decisions/0012-sqlite-native-types.md) — Columns use DATETIME for instants, DATE for birth dates and BOOLEAN with TRUE/FALSE instead of unix-second integers and 0/1.
- [0023 config.json holds only startup keys](/decisions/0023-config-holds-startup-keys.md) — packages/config declares only the values a program needs before the database opens; every other value is a setting declared in packages/virtual.
- [0024 Settings are declared keys read through typed getters](/decisions/0024-settings-catalogue-and-getters.md) — packages/virtual holds Settings, a map of key paths filled from declared defaults, config.json and the settings rows, read with typed getters and written one key at a time. **Superseded by [0029](/decisions/0029-package-level-settings-and-auth.md).**
- [0025 Settings reads never wait on writers](/decisions/0025-settings-reads-never-wait.md) — virtual.Settings publishes its values through an atomic pointer read without locks, and a mutex used only by Set and Reload serializes the writers.
- [0029 Settings and auth are package-level; apps take the db on creation](/decisions/0029-package-level-settings-and-auth.md) — Settings live in virtual/settings as a process-wide singleton read through package functions, auth is a set of helpers that receive the db, and app packages take the db as New's first argument with options only for the resolver and the static handler.
- [0051 One machine, and a refresh instead of IPC](/decisions/0051-one-machine-and-a-refresh.md) — The programs run on one machine while the database is SQLite, and a CMS running alone re-reads the settings every cms.refresh seconds, so no IPC is built.
- [0056 The wallet, the club and the home inventory belong to the user](/decisions/0056-wallet-club-and-inventory-per-user.md) — One wallet and one club membership per user, and stickers, notes and backgrounds are shared while they are not placed on a home.

## Scope

- [0045 Homes are deferred until the art exists](/decisions/0045-homes-deferred.md) — P3 Homes leaves the phase order and becomes an isolated piece of work for later, because the user has none of the art yet and will look for it.
- [0048 The footer names Project Reborn](/decisions/0048-footer-names-reborn.md) — The signed-out footer keeps "Powered by Project Reborn ©" instead of Holo's line.
- [0034 Behaviour matches Holo exactly; the code is new and safest](/decisions/0034-behaviour-matches-holo.md) — Every page behaves exactly as its HoloCMS page does, with new code, and differs only where Holo is unsafe, where a decision says so, or where Holo's behaviour is a bug.
- [0036 Referral farming stays open for now](/decisions/0036-referral-farming-accepted.md) — Nothing stops a person from earning credits with their own referral link, beyond the per-IP registration limit, until the user asks for it.
- [0042 Group badges get two palettes](/decisions/0042-two-badge-palettes.md) — P5 builds the group badge tints twice, with Holo's exact colours and with the closest Tailwind colours, and the user picks one once both work.
- [0013 Game-server features are deferred](/decisions/0013-defer-game-server-features.md) — Everything in Holo that needs the game emulator waits until the game server exists; meanwhile the hotel shows as offline.
- [0017 Guests can read public pages](/decisions/0017-guest-read-access.md) — Guests can read news, community, staff, tags, homes, group pages, the forum and the club and credits information; acting needs a session.
- [0019 Staff page shows display habbos](/decisions/0019-staff-page-display-habbo.md) — /staff lists access groups flagged staff_listed and shows, for each member, the display habbo chosen when access was granted.
- [0020 News bodies in BBCode](/decisions/0020-news-in-bbcode.md) — News article bodies are BBCode rendered by the same renderer as forum posts and sticky notes.
- [0021 Dropped and kept Holo features](/decisions/0021-dropped-and-kept-features.md) — The captcha, the Dutch and German texts and Holo's admin database tools are dropped; tag fight and refer-a-friend are ported.
- [0031 P1 signs in to a minimal /me page](/decisions/0031-p1-minimal-me-page.md) — During P1, sign-in and registration redirect to a small GET /me showing the habbo and a sign-out button, and GET / redirects signed-in visitors there, so P2 only fills in the page.
- [0057 Furni and rooms](/decisions/0057-furni-and-rooms.md) — Furni is split per habbo with a shared inventory per user, and rooms have a creator and an owner, so a user can move a room between their habbos with its furni in place.
- [0061 The art lives in the repository](/decisions/0061-art-in-the-repository.md) — The home art and user badges are committed under packages/cms/public and embedded in the CMS binary, and P3 Homes returns to the phase order.
- [0063 What housekeeping can delete](/decisions/0063-what-housekeeping-can-delete.md) — The staff log, credit history and bans stay for audit, help tickets are closed instead of deleted, and unused vouchers can be deleted.

## Packages and process

- [0043 packages/scheduler runs timed tasks](/decisions/0043-scheduler.md) — A package-level, cron-like scheduler in packages/scheduler runs tasks written as scheduler.Every(1, scheduler.Hour, task), so a process has one scheduler whether a program runs alone or under the orchestrator.
- [0046 Sequential work on main, parallel work on feature branches](/decisions/0046-main-and-feature-branches.md) — The agent commits sequential work on main and gives each parallel line of work a feature branch that is merged later, and it never pushes.
- [0037 The CMS address comes from config.json](/decisions/0037-cms-host-in-config.md) — config.json gains cms.host, and the CMS runners listen on cms.host and cms.port instead of a fixed localhost.
- [0038 Project folders hold a README and a make install](/decisions/0038-project-docs-and-install.md) — AGENTS.md stays only at the repository root, project folders document themselves in README.md, and every project and the root have a make install.
- [0039 The orchestrator is a later project](/decisions/0039-orchestrator-is-a-later-project.md) — apps/reborn will run the installer, cms, housekeeping and server from one binary; its old implementation is gone, it is not planned yet, and the work stays on the CMS.
- [0040 Housekeeping is the single writer of settings](/decisions/0040-housekeeping-writes-settings.md) — Housekeeping alone updates settings, the CMS only reads them, the installer runs once, and programs running alone will be told of a change instead of polling for it.
- [0041 Housekeeping gets its own simple design system](/decisions/0041-housekeeping-design-system.md) — Housekeeping follows Habbo's original housekeeping, simple tables with white and blue sections, in a new design system.
- [0003 Housekeeping under /housekeeping](/decisions/0003-housekeeping-under-prefix.md) — Every housekeeping route lives under /housekeeping/ so it can share one mux and the session cookie with the CMS.
- [0008 Avatar images from a configurable URL](/decisions/0008-configurable-avatar-imaging.md) — Avatar images come from an imaging URL in config and settings, used by an Avatar primitive in packages/components.
- [0016 Installer package](/decisions/0016-installer.md) — packages/installer writes the initial config.json and creates the initial database, the first administrator and the seed rows.
- [0022 Port state in plans/holo-port](/decisions/0022-port-state-bundle.md) — The state of the port lives in this OKF bundle, and agents follow it through the tracking-holo-port skill.
- [0026 Installer administrator, start credits and habbo names](/decisions/0026-installer-administrator-and-names.md) — The installer sets registration.startCredits and creates the administrator from a habbo name, email, password and birth date with Holo's figure and 5000 credits; habbo names take letters, digits and - = ? ! @ : . , up to 24 characters.
- [0027 Runners run from the repository root in development](/decisions/0027-runners-run-from-the-root.md) — In development every app runner runs with the repository root as its working directory, so all of them read the root config.json.
- [0028 Trusted reverse proxies in config.json](/decisions/0028-trusted-proxies-in-config.md) — config.json has a proxy section, off by default, that lets the runners take the client IP from X-Forwarded-For when the connection comes from a listed proxy address or range.
- [0032 imaging.avatarUrl defaults to the habbo.com imager](/decisions/0032-avatar-imager-default.md) — The imaging.avatarUrl setting defaults to https://www.habbo.com/habbo-imaging/avatarimage, an external imager that accepts dot-format figures and can be replaced at any time.
- [0033 Each finished task is committed on main](/decisions/0033-commit-each-task-on-main.md) — The agent commits every finished task on main with a one-line title in the style of the repository's history and never pushes.
- [0052 The installer has no modes](/decisions/0052-installer-has-no-modes.md) — The installer has no standalone or orchestrator mode, its fields stay editable with the development ports as defaults, and it asks for the Housekeeping Address.
- [0060 Housekeeping components have one look each](/decisions/0060-housekeeping-components.md) — Each housekeeping component looks the same on every page, with blue navigation, gold data lists, blue forms and a grey top bar.
- [0062 CI and releases on GitHub Actions](/decisions/0062-ci-and-releases.md) — GitHub Actions runs every gate and the browser suites, and a version tag publishes prebuilt archives for linux amd64 and aarch64.
