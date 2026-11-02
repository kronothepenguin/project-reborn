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
- [p0-22 Keep the dist placeholder template in tools/create](/tasks/p0-22-keep-dist-template.md) — Restore the placeholder template a new app starts with and track it in git, so that every machine generates it.
- [p0-23 Build packages/scheduler](/tasks/p0-23-scheduler.md) — Add the package-level scheduler, whose tasks read scheduler.Every(1, scheduler.Hour, task).
- [p0-24 Check that every program works on an empty database](/tasks/p0-24-empty-database.md) — Prove that the CMS works on a database it creates itself, and that the installer still works on that database afterwards.

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
- [p1-20 Delete expired reset links on a schedule](/tasks/p1-20-delete-expired-resets.md) — Register a task in cms.New that deletes reset links once they expire, in place of the purge in auth.CreateReset.

## P2 Me and account

- [p2-01 Delete expired sessions on a schedule](/tasks/p2-01-delete-expired-sessions.md) — Register a task in cms.New that deletes sessions once they expire, in place of the purge at sign-in.
- [p2-02 Build the community layout](/tasks/p2-02-community-layout.md) — Port Holo's community header, main tabs, sub-tabs, habbo search, mini login, footer and maintenance alert into layouts/community.astro.
- [p2-03 Build the Me page](/tasks/p2-03-me-page.md) — Port the personal info plate, the inline motto editor and the feed with alerts, birthday, last sign-in and the staff help count.
- [p2-04 Build the account pages' frame and Looks](/tasks/p2-04-account-looks.md) — Port the settings navigation, the Join Club box and the Looks tab, with the editor listening as Holo's settings.js does.
- [p2-05 Build the motto, email, password and referral tabs](/tasks/p2-05-account-details.md) — Port the other four tabs of account.php with Holo's forms, checks and texts.
- [p2-06 Own several habbos](/tasks/p2-06-several-habbos.md) — Let a user add habbos up to registration.maxHabbosPerUser and switch the active one.
- [p2-07 Verify the P2 exit criteria](/tasks/p2-07-exit-check.md) — Run the signed-in flows on the production binaries, list the differences from Holo and close the phase.

## HK-A Housekeeping core

- [hk-a-01 Bring the tools/create templates to the current conventions](/tasks/hk-a-01-create-templates.md) — Generate apps that open the db with store.FromConfig, pass it to New and report a failed server, so that housekeeping is right from its first commit. **done**
- [hk-a-02 Add the housekeeping section to packages/config](/tasks/hk-a-02-housekeeping-config.md) — Declare housekeeping.host and housekeeping.port, mirroring cms.host and cms.port, and have the installer write their defaults. **done**
- [hk-a-03 Scaffold housekeeping and guard its routes](/tasks/hk-a-03-scaffold-and-access.md) — Generate packages/housekeeping and apps/housekeeping, mount them under /housekeeping alone and on a shared mux, and keep out guests and non-staff. **done**
- [hk-a-04 Build the housekeeping layout](/tasks/hk-a-04-layout.md) — The layout of docs/hk.png as a new design system, the Table primitive, the previous login and Holo's Access Denied page. **done**
- [hk-a-05 Write the staff log helper and page](/tasks/hk-a-05-staff-log.md) — One helper writes a staff_logs row for every mutation, and GET /logs reads them with housekeeping.logs. **done**
- [hk-a-06 Build the dashboard and the shared note](/tasks/hk-a-06-dashboard.md) — GET /housekeeping/ shows the counts, the holders of housekeeping.accessGroups and the note, and POST /note saves it with settings.Set. **done**
- [hk-a-07 Build the settings editor](/tasks/hk-a-07-settings-editor.md) — GET /settings and POST /settings/{section} give a form over each group of declared settings, saved with settings.Set, all or nothing. **done**
- [hk-a-08 Build access groups](/tasks/hk-a-08-access-groups.md) — Create and edit access groups, tick their attributes, add and remove members with a display habbo, and refuse to leave nobody who can manage them. **done**
- [hk-a-09 Verify the HK-A exit criteria](/tasks/hk-a-09-exit-check.md) — Run housekeeping on the production binaries in a real browser, list the differences from Holo, and run every gate. **done**
- [hk-a-10 Keep a stopped task from running](/tasks/hk-a-10-stopped-task.md) — After stop, a tick that waited out a slow run started another run, because select picks at random.
- [hk-a-11 Label the settings of P2](/tasks/hk-a-11-p2-setting-labels.md) — Give the three settings P2 declared while HK-A was on its branch real labels on the settings forms.
- [hk-a-12 Ask for the housekeeping port in the installer](/tasks/hk-a-12-installer-housekeeping-port.md) — The configuration step asks for both ports, as the plan's wizard does, because it is the one time the administrator sets them.
- [hk-a-13 Verify HK-A merged with P2](/tasks/hk-a-13-merge-check.md) — Merge hk-a into main and verify the result from a clean checkout, in the browser and with every gate.

## FX Review follow-ups

- [fx-01 Move the browser suites into the repository](/tasks/fx-01-browser-suites.md) — The Playwright suites and their runner move from a temporary folder into tests/e2e, so they survive and CI can run them.
- [fx-02 Run every gate on GitHub Actions](/tasks/fx-02-ci-workflow.md) — ci.yml runs every gate and the browser suites on pushes to main and on pull requests.
- [fx-03 Publish releases on tags](/tasks/fx-03-release-workflow.md) — release.yml publishes archives for linux amd64 and aarch64 when a version tag is pushed.
- [fx-04 Give the wallet, the club and the home inventory to the user](/tasks/fx-04-user-wallet-club-inventory.md) — Wallets, club periods and the home inventory move from the habbo to the user, as decision 0056 says.
- [fx-05 Give attributes to users](/tasks/fx-05-user-attributes.md) — Direct attributes join group attributes in every check, the guard counts both, and private user data gets its own attribute.
- [fx-06 Add levels to access groups](/tasks/fx-06-staff-levels.md) — Each group gets a level, group changes follow it, and IP bans skip housekeeping staff.
- [fx-07 Seed Holo's ranks in the installer](/tasks/fx-07-seed-ranks.md) — The installer creates Administrator, Moderator, Gold Hobba, Silver Hobba and HabboX as access groups.
- [fx-08 Delete access groups](/tasks/fx-08-delete-access-groups.md) — Staff with housekeeping.accessGroups can delete a group, unless that breaks the guard.
- [fx-09 Ask for the Housekeeping Address in the installer](/tasks/fx-09-housekeeping-address.md) — site.housekeepingUrl defaults to the development address, and the installer's site step asks for it.
- [fx-10 Refresh the CMS settings on schedule](/tasks/fx-10-settings-refresh.md) — A CMS running alone re-reads the settings every cms.refresh seconds, on the scheduler.
- [fx-11 Keep the session on a password change](/tasks/fx-11-password-keeps-session.md) — A password change keeps the session of the user who made it, with a new token, and ends the others.
- [fx-12 Send banned staff to the CMS](/tasks/fx-12-banned-staff.md) — A banned user who opens housekeeping goes to site.url, where the CMS shows Holo's ban message.
- [fx-13 Give housekeeping components their looks](/tasks/fx-13-housekeeping-components.md) — Gold data lists, blue forms, a Log out link and the clock box, as decision 0060 says.
- [fx-14 Archive habbos](/tasks/fx-14-archive-habbos.md) — A user archives a habbo from /account/habbos, which hides it and frees a slot, and its name stays reserved.
- [fx-15 Bring the art into the repository](/tasks/fx-15-art-in-the-repository.md) — Fetch the stickers, backgrounds, user badges and missing widget skins once, and commit them.
- [fx-16 Verify FX](/tasks/fx-16-exit-check.md) — Every exit criterion of FX holds from a clean checkout, in a real browser.

## HK-B Users and moderation

- [hk-b-01 Find habbos and read them](/tasks/hk-b-01-find-habbos.md) — GET /habbos and GET /habbos/{id} give Holo's user listing, its IP, user id and clone tools, and the habbo with its owner, other habbos and IP history.
- [hk-b-02 Edit habbos and users](/tasks/hk-b-02-edit-users.md) — POST /habbos/{id} and POST /users/{id} save the fields of Holo's Edit User, taken from a list, only on users below the actor.
- [hk-b-03 Give and remove badges](/tasks/hk-b-03-badges.md) — POST /habbos/{id}/badges gives a badge and wears it, as Holo's badge tool did, and POST /habbos/{id}/badges/{code}/delete removes one.
- [hk-b-04 Give credits and read transactions](/tasks/hk-b-04-credits.md) — POST /habbos/{id}/credits changes the user's wallet and its ledger together, and GET /habbos/{id}/transactions lists the ledger.
- [hk-b-05 Ban users and lift bans](/tasks/hk-b-05-bans.md) — GET /bans and POST /bans issue a ban with Holo's lengths and end the user's sessions, and POST /bans/{id}/lift lifts it and keeps it as history.
- [hk-b-06 Send alerts](/tasks/hk-b-06-alerts.md) — GET /alerts and POST /alerts alert one habbo, or everyone with housekeeping.alertsBroadcast, and list the alerts not dismissed yet.
- [hk-b-07 Handle help tickets](/tasks/hk-b-07-help.md) — GET /help lists open tickets, and staff read, pick up, close and reply to them; closed tickets stay as history.
- [hk-b-08 Give direct attributes](/tasks/hk-b-08-direct-attributes.md) — The habbo page lets holders of housekeeping.accessGroups give attributes to the user directly, only on users below them.
- [hk-b-09 Restore archived habbos](/tasks/hk-b-09-restore-habbos.md) — Staff restore an archived habbo from its page, unless that takes the user past registration.maxHabbosPerUser.
- [hk-b-10 Verify HK-B](/tasks/hk-b-10-exit-check.md) — Every exit criterion of HK-B holds from a clean checkout, in a real browser.

## Later phases

[P3](/phases/p3-homes.md), [P4](/phases/p4-community.md), [P5](/phases/p5-groups-forum.md),
[P6](/phases/p6-economy.md) and [P7](/phases/p7-help.md) get their tasks when they start.
