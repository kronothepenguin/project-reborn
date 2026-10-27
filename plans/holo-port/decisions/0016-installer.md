---
type: Decision
title: Installer package
description: packages/installer writes the initial config.json and creates the initial database, the first administrator and the seed rows.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [installer]
---

# Decision

- `packages/installer` + `apps/installer`, scaffolded with `make create name=installer`. The installer keeps its
  generated port because it runs before `config.json` exists.
- Wizard steps:
  1. Status.
  2. Config: `config.Create`, then `store.Open` creates the database file and its schema.
  3. Site settings through `virtual.Settings.Update`.
  4. First administrator, in one transaction: user, credentials, habbo, profile, home, wallet, an "Administrators"
     access group with every attribute and `staff_listed`, and the membership with the admin habbo as display
     habbo.
  5. Done.
- It refuses to run when `config.json` exists and the database already has an administrator.
- Phase P3 adds the home store seed: Holo's categories and the 303 items from `source/holo/install.php:469-772`.

# Context

Holo's `install.php` created the `cms_*` tables, seeded content and the catalogue, and created the first admin with
rank 7.

# Consequences

- cms and housekeeping refuse to start when the database file is missing ("run the installer").
