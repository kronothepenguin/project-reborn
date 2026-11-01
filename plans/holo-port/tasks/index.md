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
- [p0-08 Build the Settings entity in packages/virtual](/tasks/p0-08-virtual-settings.md) — Create the packages/virtual module with a type-safe Settings wrapper that merges settings rows over config and receives the database. **done**
- [p0-09 Rewrite packages/auth](/tasks/p0-09-auth-rewrite.md) — Replace the session-only library with argon2id passwords, habbo-name login with throttling and bans, sessions, middleware, attributes and password reset. **done**
- [p0-10 Scaffold and build the installer](/tasks/p0-10-installer.md) — Create packages/installer and apps/installer with tools/create and build the status, config, site and administrator steps. **done**
- [p0-11 Wire the CMS to config, store, settings and auth](/tasks/p0-11-cms-wiring.md) — The CMS runners open config, store, settings and auth, and the router gets its dependencies, cross-origin protection, sessions and maintenance mode. **done**

- [p0-12 Remove the unused store test data](/tasks/p0-12-remove-store-testdata.md) — Delete packages/store/testdata, stale schema files from the store refactor that no code references. **done**
- [p0-13 Move runtime values into the settings catalogue](/tasks/p0-13-settings-catalogue.md) — Reduce packages/config to the startup keys and rewrite virtual.Settings as a map filled from declared defaults, config.json and the settings rows, with typed getters and Set. **done**
- [p0-14 Generate dotfile templates in tools/create](/tasks/p0-14-create-dotfile-templates.md) — tools/create embeds templates/* without all:, so the .air.toml template is never generated and make dev of a new app has no air config. **done**
- [p0-15 Run the dev runners from the repository root](/tasks/p0-15-runners-from-root.md) — make dev starts air from the repository root, so the installer and the CMS read and write the root config.json; tools/create generates new apps the same way. **done**
- [p0-16 Take the client IP from trusted proxies](/tasks/p0-16-trusted-proxies.md) — Add the proxy section to packages/config and the auth.RealIP middleware, which reads X-Forwarded-For only from trusted proxies when enabled. **done**
- [p0-17 Make settings and auth package-level and pass the db to cms.New](/tasks/p0-17-package-level-settings-and-auth.md) — Move the settings into the virtual/settings singleton, turn auth into helpers that receive the db, give cms.New the db with options only for the resolver and the static handler, and add store.FromConfig. **done**
- [p0-18 Read the CMS address from config.json](/tasks/p0-18-cms-host.md) — Add cms.host to packages/config, with localhost as its default, and make both CMS runners listen on it.
- [p0-19 Fix the tools/create templates](/tasks/p0-19-create-templates.md) — End every template with a newline, so that a generated project passes gofmt, and test it.
- [p0-20 Replace the project AGENTS.md files with READMEs](/tasks/p0-20-project-readmes.md) — Rename the AGENTS.md of each project folder to README.md, in the repository and in the tools/create templates, keeping one AGENTS.md at the root.
- [p0-21 Add make install to every project](/tasks/p0-21-make-install.md) — Give each project a make install that creates folders and installs dependencies, have the root one run them, and comment out the root targets of the orchestrator.

## P1 Signed-out site

- [p1-01 Add the P1 primitives](/tasks/p1-01-primitives.md) — Add Checkbox, Select, Notice and Avatar to packages/components and move Icon there from packages/cms, each with a story, a test and an export. **done**
- [p1-02 Sign in and sign out](/tasks/p1-02-sign-in-and-out.md) — Make POST / sign in with auth.Login, add POST /logout and the minimal GET /me page, and send signed-in visitors from / to /me. **done**
- [p1-03 Move account creation into packages/auth](/tasks/p1-03-account-helpers.md) — Move the habbo name, email and birth-date rules and the writes of a user and a habbo from the installer into auth helpers that take sqlc queries. **done**
- [p1-04 Build registration](/tasks/p1-04-registration.md) — Make /register create an account with the avatar editor, the live name check and the per-IP limit, then sign the visitor in. **done**
- [p1-05 Pay referrals at registration](/tasks/p1-05-referrals.md) — Read the refer link at registration, write the referral in the registration transaction and pay referral.reward to the referring habbo. **done**
- [p1-06 Reset a forgotten password by email](/tasks/p1-06-forgot-and-reset.md) — Add the mail settings and the internal mail package, and the forgot and reset pages built on auth.CreateReset and auth.ResetPassword. **done**
- [p1-07 Add the legal pages](/tasks/p1-07-legal-pages.md) — Serve the terms of service and the privacy policy with Holo's texts, so the footer links and the registration terms link work. **done**
- [p1-08 Add the landing promo widget](/tasks/p1-08-landing-promo.md) — Serve the promo habbos as XML and show the HabboWidgets landing widget on the landing page when features.landingPromo is on, with the join button otherwise. **done**
- [p1-09 Verify the P1 exit criteria](/tasks/p1-09-exit-check.md) — Run the whole signed-out flow end to end on the production binaries and close the phase. **done**
- [p1-10 Give the register page a title](/tasks/p1-10-register-page-title.md) — The register page was the only signed-out page with an empty title, found while reviewing the phase before closing it. **done**
- [p1-11 Match the signed-out layout to Holo](/tasks/p1-11-signed-out-layout.md) — Give the signed-out pages Holo's titles, meta tags, header stats, logo link and footer.
- [p1-12 Show Holo's sign-out and ban pages](/tasks/p1-12-sign-out-page.md) — Replace the redirect after signing out with Holo's confirmation, and end the session of a banned visitor on the next page with the ban message.
- [p1-13 Match the forgot page to Holo](/tasks/p1-13-forgot-as-holo.md) — Ask for the username and the email as Holo does, send a reset only when both match, and show Holo's page to signed-in visitors.
- [p1-14 Limit the reset mail](/tasks/p1-14-reset-mail-limit.md) — Send no reset mail while the account holds auth.resetMaxActive unexpired links, in one atomic insert.
- [p1-15 Match the landing page to Holo](/tasks/p1-15-landing-as-holo.md) — Give the landing page Holo's sign-in texts, remember-me bubble, advert, no-JavaScript box and age-limit message, with a new Bubble primitive.
- [p1-16 Match the registration rules and texts to Holo](/tasks/p1-16-registration-rules.md) — Port Holo's email, birth date and age rules, its messages and defaults, and keep the live check's own texts apart.
- [p1-17 Port Holo's registration flow to the browser](/tasks/p1-17-registration-flow.md) — Rebuild the page in Holo's order and port registration.js with its gated details, tooltips, live checks, submit validation and age bubbles.
- [p1-18 Verify P1 against Holo](/tasks/p1-18-exit-check-as-holo.md) — Run the whole signed-out flow again on the production binaries, finish the list of differences and close the phase.
- [p1-19 Fix two texts found by the exit check](/tasks/p1-19-text-fixes.md) — Keep the join button's text on one line, and keep the spaces around the log out button on the forgot page.

## Later phases

[P2](/phases/p2-me-account.md), [HK-A](/phases/hk-a-housekeeping-core.md), [HK-B](/phases/hk-b-users-moderation.md),
[P3](/phases/p3-homes.md), [P4](/phases/p4-community.md), [P5](/phases/p5-groups-forum.md),
[P6](/phases/p6-economy.md) and [P7](/phases/p7-help.md) get their tasks when they start.
