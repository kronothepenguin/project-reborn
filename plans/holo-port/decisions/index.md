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
- [0018 Password reset by email](/decisions/0018-password-reset-by-email.md) — Forgot password emails a single-use, expiring reset link built on password_resets and the mail settings.

## Configuration and data

- [0004 Fresh start without Holo data](/decisions/0004-fresh-start.md) — No data is imported from a Holo or Holograph MySQL database, so the schema keeps no legacy ids, formats or hashes.
- [0007 Store knowledge documents entities and tables](/decisions/0007-store-okf-entities-and-tables.md) — The store's OKF bundle adds entities/ and tables/ concepts next to the required schemas/ and queries/ concepts.
- [0009 Config is static types; settings map onto config keys](/decisions/0009-config-is-static-types.md) — packages/config holds static types describing config.json, and database settings rows override config keys at runtime. **Superseded by [0023](/decisions/0023-config-holds-startup-keys.md).**
- [0010 Settings entity in packages/virtual](/decisions/0010-virtual-settings-entity.md) — packages/virtual holds a Settings entity, a type-safe wrapper over config with the settings rows merged in, which receives the database instead of holding it. **Superseded by [0024](/decisions/0024-settings-catalogue-and-getters.md).**
- [0011 store.Open returns *sql.DB](/decisions/0011-store-returns-sql-db.md) — The Store wrapper is removed; store.Open returns *sql.DB and callers run the sqlc queries on a db or a transaction.
- [0012 Native SQLite date and boolean types](/decisions/0012-sqlite-native-types.md) — Columns use DATETIME for instants, DATE for birth dates and BOOLEAN with TRUE/FALSE instead of unix-second integers and 0/1.
- [0023 config.json holds only startup keys](/decisions/0023-config-holds-startup-keys.md) — packages/config declares only the values a program needs before the database opens; every other value is a setting declared in packages/virtual.
- [0024 Settings are declared keys read through typed getters](/decisions/0024-settings-catalogue-and-getters.md) — packages/virtual holds Settings, a map of key paths filled from declared defaults, config.json and the settings rows, read with typed getters and written one key at a time.
- [0025 Settings reads never wait on writers](/decisions/0025-settings-reads-never-wait.md) — virtual.Settings publishes its values through an atomic pointer read without locks, and a mutex used only by Set and Reload serializes the writers.

## Scope

- [0013 Game-server features are deferred](/decisions/0013-defer-game-server-features.md) — Everything in Holo that needs the game emulator waits until the game server exists; meanwhile the hotel shows as offline.
- [0017 Guests can read public pages](/decisions/0017-guest-read-access.md) — Guests can read news, community, staff, tags, homes, group pages, the forum and the club and credits information; acting needs a session.
- [0019 Staff page shows display habbos](/decisions/0019-staff-page-display-habbo.md) — /staff lists access groups flagged staff_listed and shows, for each member, the display habbo chosen when access was granted.
- [0020 News bodies in BBCode](/decisions/0020-news-in-bbcode.md) — News article bodies are BBCode rendered by the same renderer as forum posts and sticky notes.
- [0021 Dropped and kept Holo features](/decisions/0021-dropped-and-kept-features.md) — The captcha, the Dutch and German texts and Holo's admin database tools are dropped; tag fight and refer-a-friend are ported.

## Packages and process

- [0003 Housekeeping under /housekeeping](/decisions/0003-housekeeping-under-prefix.md) — Every housekeeping route lives under /housekeeping/ so it can share one mux and the session cookie with the CMS.
- [0008 Avatar images from a configurable URL](/decisions/0008-configurable-avatar-imaging.md) — Avatar images come from an imaging URL in config and settings, used by an Avatar primitive in packages/components.
- [0016 Installer package](/decisions/0016-installer.md) — packages/installer writes the initial config.json and creates the initial database, the first administrator and the seed rows.
- [0022 Port state in plans/holo-port](/decisions/0022-port-state-bundle.md) — The state of the port lives in this OKF bundle, and agents follow it through the tracking-holo-port skill.
- [0026 Installer administrator, start credits and habbo names](/decisions/0026-installer-administrator-and-names.md) — The installer sets registration.startCredits and creates the administrator from a habbo name, email, password and birth date with Holo's figure and 5000 credits; habbo names take letters, digits and - = ? ! @ : . , up to 24 characters.
- [0027 Runners run from the repository root in development](/decisions/0027-runners-run-from-the-root.md) — In development every app runner runs with the repository root as its working directory, so all of them read the root config.json.
