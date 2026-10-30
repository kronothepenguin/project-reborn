---
type: Decision
title: packages/auth creates accounts and habbos
description: The helpers that create a user with its first habbo, and a habbo with its profile, home and wallet, live in packages/auth with the name, email and birth-date rules, and take sqlc queries so each caller keeps its own transaction.
status: accepted
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
tags: [auth, installer, cms, habbos]
---

# Decision

- `packages/auth` holds the code that creates accounts:
  - a helper that writes a user, its credentials and its first habbo;
  - a helper that writes a habbo with its profile, home, wallet and first ledger row for an existing user;
  - the habbo name, email and birth-date rules, next to `ValidatePassword`.
- The helpers take `*store.Queries`, not the db, so each caller keeps its own transaction.
- The installer and CMS registration call them, and P2's "add a habbo" will too.

# Context

The installer and registration write the same rows and need the same rules:
[0026](/decisions/0026-installer-administrator-and-names.md) says P1 registration follows the installer's name rule.
The user chose `packages/auth` over a helper in `packages/store` and over separate copies.

The callers need their own transaction because the installer also creates the Administrators group in it, and
registration also writes the referral.

# Consequences

- The installer keeps only what is its own: the administrator's figure and credits, and the Administrators group.
