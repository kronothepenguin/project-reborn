---
type: Phase
title: P0 Foundations
description: Store, config, virtual settings, auth, the complete schema, the installer and the CMS wiring that every later phase builds on.
status: active
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [p0]
---

# Goal

A fresh checkout can run the installer, which creates `config.json`, the full database and the first administrator.
The CMS then starts on top of it with sessions, attributes, live settings and cross-origin protection.

# Scope

- `packages/store`: `Open`/`Must` return `*sql.DB` ([0011](/decisions/0011-store-returns-sql-db.md)), native
  types ([0012](/decisions/0012-sqlite-native-types.md)), and **every schema file** of the
  [new schema](/reference/holo-database.md#new-schema). Queries are written only for P0 consumers; later phases add
  theirs. OKF concepts follow [0007](/decisions/0007-store-okf-entities-and-tables.md).
- `packages/config`: root `settingsRefreshSeconds`, sections `store`, `cms`, `auth`, `site`, and `Create`
  ([0009](/decisions/0009-config-is-static-types.md)).
- `packages/virtual`: the `Settings` entity ([0010](/decisions/0010-virtual-settings-entity.md)).
- `packages/auth`: full rewrite (passwords, login with throttling and bans, sessions, middleware, attributes,
  password reset) ([0005](/decisions/0005-argon2id-passwords.md),
  [0014](/decisions/0014-attribute-based-access.md), [0015](/decisions/0015-attribute-names-and-fuses.md)).
- `packages/installer` + `apps/installer`: status, config, site and administrator steps
  ([0016](/decisions/0016-installer.md)).
- `packages/cms` + `apps/cms`: runners open config → store → settings → auth; `router.Deps`;
  `http.CrossOriginProtection`; sessions and maintenance middleware; ports from config.
- Skills: `adding-data-persistence` and `documenting-with-okf` follow the decisions above.

# Exit criteria

- Every P0 task is done with its verification recorded.
- From a clean database: the installer finishes, `config.json` and the database exist, and `apps/cms` starts and
  serves `/`.
- `curl -i -X POST localhost:17387/ -H 'Sec-Fetch-Site: cross-site'` returns 403.

# Tasks

- [p0-01 Port state bundle and tracking skill](/tasks/p0-01-port-state-bundle.md) — done
- [p0-02 Store returns *sql.DB](/tasks/p0-02-store-open-returns-db.md) — done
- [p0-03 Persistence and OKF skill updates](/tasks/p0-03-persistence-skill-updates.md) — done
- [p0-04 Identity schema](/tasks/p0-04-identity-schema.md) — done
- [p0-05 World schema](/tasks/p0-05-world-schema.md) — done
- [p0-06 P0 queries](/tasks/p0-06-p0-queries.md) — todo
- [p0-07 Config sections and Create](/tasks/p0-07-config-sections.md) — todo
- [p0-08 Virtual settings](/tasks/p0-08-virtual-settings.md) — todo
- [p0-09 Auth rewrite](/tasks/p0-09-auth-rewrite.md) — todo
- [p0-10 Installer](/tasks/p0-10-installer.md) — todo
- [p0-11 CMS wiring](/tasks/p0-11-cms-wiring.md) — todo
- [p0-12 Remove the unused store test data](/tasks/p0-12-remove-store-testdata.md) — done
