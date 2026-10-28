---
type: Task
title: Scaffold and build the installer
description: Create packages/installer and apps/installer with tools/create and build the status, config, site and administrator steps.
status: done
phase: p0
depends_on: [p0-07, p0-09, p0-13]
packages: [packages/installer, apps/installer]
holo: [source/holo/install.php]
timestamp: 2026-10-28T01:30:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:30:19+00:00"}
---

# Goal

Implement [0016](/decisions/0016-installer.md) up to the administrator step; the home store seed comes in
[P3](/phases/p3-homes.md).

# Steps

- [x] `make create name=installer` from the repository root.
- [x] Align the generated router with `router.Deps`.
- [x] `GET /{$}` status page; it refuses when `config.json` exists and the database has an administrator.
- [x] `GET/POST /config`: database path and cms port → `config.Create`; then `store.Open(path)` creates the file
      and schema.
- [x] `GET/POST /site`: site name, short name, URL, secure cookies and start credits → `virtual.LoadSettings`,
      then `Set` for each key.
- [x] `GET/POST /admin` in one transaction:
  - user, credentials, habbo, profile, home and wallet;
  - "Administrators" access group with every catalogued attribute and `staff_listed`;
  - the administrator's membership, with the admin habbo as display habbo.
- [x] `GET /done`.
- [x] Primitives used come from `packages/components`; colours follow [the mapping](/reference/colours.md).

# Verification

```sh
cd packages/installer && pnpm build && go build ./... && go vet ./...
cd apps/installer && go build ./... && go vet ./...
```

Run the installer in an empty directory, finish every step, then check that `config.json` and the database exist
and that the administrator holds every attribute.

Results (2026-10-28T01:30:19+00:00):

- `pnpm build` built 5 pages: `index`, `config`, `site`, `admin` and `done`. Each keeps its `[[ ]]` placeholders,
  including those inside input `value` attributes.
- `go build ./...` and `go vet ./...` pass in `packages/installer` and `apps/installer`.
- `go test ./... -race` in `packages/installer`: 10 test results pass (9 `setup` tests and the flow test).
- End-to-end run of the production binary in an empty directory:
  - a cross-site POST got 403;
  - every step redirected to the next;
  - a habbo name with a space was refused with its message;
  - after the administrator, `/` reported the hotel installed and `POST /admin` redirected to `/`.
- `config.json` held only `store.path` and `cms.port`.
- The database held:
  - a settings row only for the two values that differed from their defaults;
  - the habbo `Admin-1` with Holo's figure and gender `M`;
  - a wallet of 5000 credits;
  - the group "Administrators", staff-listed, with 18 attributes and the habbo as display habbo;
  - the user's birth date.

# Notes

Scaffold:

- The generated ports are 17306 (app) and 25050 (Astro).
- `make create` also changed:
  - `go.work`, which now uses both new modules;
  - `pnpm-lock.yaml`;
  - `packages/auth/go.mod`, which gained `golang.org/x/sys v0.48.0 // indirect` from `go work sync`. That line is
    right, since argon2 imports `golang.org/x/sys/cpu`, and p0-09 had missed it.
- `tools/create` did not write `apps/installer/.air.toml`: `//go:embed templates/*` skips dotfiles. It was written by
  hand from the template, and [p0-14](/tasks/p0-14-create-dotfile-templates.md) fixes the generator.

Changes from the generated code:

- `Installer` is exported, and `New(ctx, opts...)` returns an error because it opens the installation found in the
  working directory.
- Both runners wrap the mux in `http.NewCrossOriginProtection`, which the steps did not list. Without it a page on
  another site could post the administrator form to the installer on localhost.
- Both runners exit with the error when the server cannot start; the template ignored it.

Choices:

- The config step opens the database before writing `config.json`, the reverse of the step's order, so a path that
  cannot be opened leaves no `config.json`.
- "Has an administrator" means a user holds `housekeeping.accessGroups`.
- Every step after that redirects to `/`, and `/site` and `/admin` redirect to `/config` until `config.json` exists.
- A restarted installer reopens the database named by an existing `config.json`.
- The site step saves each key with `Set` and no user, and stops at the first error.
- The administrator step follows [0026](/decisions/0026-installer-administrator-and-names.md), and its ledger row uses
  the reason `registration` with the detail `installer`.
- The habbo-name rule lives in `internal/setup` until P1 decides where registration shares it.
- The housekeeping port is not asked; it joins the config step when HK-A declares `housekeeping.port`.
- The UI uses `Paper`, `FormField`, `Input`, `Button` and `Link` from `packages/components`, with the mapping's sky-200
  (process pages), sky-700 (blue title) and red-600 (error).

Earlier notes:

- `config.json` holds only startup keys ([0023](/decisions/0023-config-holds-startup-keys.md)). Secure cookies moved
  from the config step to the site step as the setting `auth.secureCookies`.
- Start credits use `registration.startCredits`, declared in P0 by
  [0026](/decisions/0026-installer-administrator-and-names.md).

Open for p0-11:

- The installer writes `config.json` in its working directory, and the CMS reads it from its own. `make dev` runs in
  `apps/installer` and `apps/cms` respectively, so the two do not meet. Only the root `/config.json` is gitignored.
  Where the runners run in development needs the user's decision.
