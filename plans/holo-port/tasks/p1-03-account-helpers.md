---
type: Task
title: Move account creation into packages/auth
description: Move the habbo name, email and birth-date rules and the writes of a user and a habbo from the installer into auth helpers that take sqlc queries.
status: todo
phase: p1
depends_on: []
packages: [packages/auth, packages/installer]
holo: []
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
---

# Goal

Implement [0030](/decisions/0030-accounts-created-in-auth.md), so that registration reuses what the installer does.

# Steps

- [ ] `ValidateHabboName`, `ValidateEmail` and `ValidateBornOn` in `packages/auth`, with `ErrHabboName`, `ErrEmail`
      and `ErrBornOn` moved from `internal/setup`. The name rule is the one in
      [0026](/decisions/0026-installer-administrator-and-names.md), and it also refuses names starting with `MOD-`,
      ignoring case.
- [ ] `CreateHabbo(ctx, q, userID, …)`: the habbo with its profile, home and wallet, and a ledger row when it starts
      with credits.
- [ ] `CreateAccount(ctx, q, …)`: the user, the credentials and the first habbo.
- [ ] Both take `*store.Queries`, so that the caller keeps its transaction. The caller hashes the password before it
      opens the transaction, because argon2 is slow and the pool has one connection.
- [ ] Export `ClientIP(r)` and delete the installer's copy.
- [ ] `CreateAdministrator` uses the helpers and keeps the administrator's figure and credits and the Administrators
      group. `internal/router/admin.go` matches the errors from `auth`.
- [ ] Tests move with the code, and new ones cover each helper's rows.
- [ ] Docs: `packages/auth/README.md` and `packages/installer/AGENTS.md`.

# Verification

```sh
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/installer && gofmt -l internal *.go && go vet ./... && go test ./... -race
cd apps/installer && go build ./... && go vet ./...
```

Then run the installer end to end: the administrator signs in with a habbo created through the new helpers.

# Notes

- The `MOD-` rule ports Holo's intent. Its check was dead code, and its letters-and-digits filter refused such names
  anyway, but [0026](/decisions/0026-installer-administrator-and-names.md) allows `-`, so `MOD-Bob` would now pass.
