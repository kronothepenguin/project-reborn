---
type: Task
title: Scaffold and build the installer
description: Create packages/installer and apps/installer with tools/create and build the status, config, site and administrator steps.
status: todo
phase: p0
depends_on: [p0-07, p0-09, p0-13]
packages: [packages/installer, apps/installer]
holo: [source/holo/install.php]
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
---

# Goal

Implement [0016](/decisions/0016-installer.md) up to the administrator step; the home store seed comes in
[P3](/phases/p3-homes.md).

# Steps

- [ ] `make create name=installer` from the repository root.
- [ ] Align the generated router with `router.Deps`.
- [ ] `GET /{$}` status page; it refuses when `config.json` exists and the database has an administrator.
- [ ] `GET/POST /config`: database path and cms port → `config.Create`; then `store.Open(path)` creates the file
      and schema.
- [ ] `GET/POST /site`: site name, short name, URL, secure cookies and start credits → `virtual.LoadSettings`,
      then `Set` for each key.
- [ ] `GET/POST /admin` in one transaction:
  - user, credentials, habbo, profile, home and wallet;
  - "Administrators" access group with every catalogued attribute and `staff_listed`;
  - the administrator's membership, with the admin habbo as display habbo.
- [ ] `GET /done`.
- [ ] Primitives used come from `packages/components`; colours follow [the mapping](/reference/colours.md).

# Verification

```sh
cd packages/installer && pnpm build && go build ./... && go vet ./...
cd apps/installer && go build ./... && go vet ./...
```

Run the installer in an empty directory, finish every step, then check that `config.json` and the database exist
and that the administrator holds every attribute.

# Notes

- `config.json` holds only startup keys ([0023](/decisions/0023-config-holds-startup-keys.md)). Secure cookies moved from the config step to the site
  step as the setting `auth.secureCookies`, and the housekeeping port joins the config step when HK-A declares
  `housekeeping.port`.
- Start credits need the setting `registration.startCredits`, which P1 declares.
