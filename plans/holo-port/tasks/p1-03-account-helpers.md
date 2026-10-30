---
type: Task
title: Move account creation into packages/auth
description: Move the habbo name, email and birth-date rules and the writes of a user and a habbo from the installer into auth helpers that take sqlc queries.
status: done
phase: p1
depends_on: []
packages: [packages/auth, packages/installer]
holo: []
timestamp: 2026-10-30T22:13:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-30T22:13:19+00:00"}
---

# Goal

Implement [0030](/decisions/0030-accounts-created-in-auth.md), so that registration reuses what the installer does.

# Steps

- [x] `ValidateHabboName`, `ValidateEmail` and `ValidateBornOn` in `packages/auth`, with `ErrHabboName`, `ErrEmail`
      and `ErrBornOn` moved from `internal/setup`. The name rule is the one in
      [0026](/decisions/0026-installer-administrator-and-names.md), and it also refuses names starting with `MOD-`,
      ignoring case.
- [x] `CreateHabbo(ctx, q, userID, …)`: the habbo with its profile, home and wallet, and a ledger row when it starts
      with credits.
- [x] `CreateAccount(ctx, q, …)`: the user, the credentials and the first habbo.
- [x] Both take `*store.Queries`, so that the caller keeps its transaction. The caller hashes the password before it
      opens the transaction, because argon2 is slow and the pool has one connection.
- [x] Export `ClientIP(r)` and delete the installer's copy.
- [x] `CreateAdministrator` uses the helpers and keeps the administrator's figure and credits and the Administrators
      group. `internal/router/admin.go` matches the errors from `auth`.
- [x] Tests move with the code, and new ones cover each helper's rows.
- [x] Docs: `packages/auth/README.md` and `packages/installer/AGENTS.md`.

# Verification

```sh
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/installer && gofmt -l internal *.go && go vet ./... && go test ./... -race
cd apps/installer && go build ./... && go vet ./...
```

Then run the installer end to end: the administrator signs in with a habbo created through the new helpers.

Results (2026-10-30T22:13:19+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/auth` and `packages/installer`, and `apps/installer` builds
  and vets.
- New tests in `packages/auth/account_test.go` cover the three validators, the rows of `CreateHabbo`, a habbo starting
  without credits, taken emails and names ignoring case, and a rolled back transaction leaving no rows.
- `TestHabboNames` moved from the installer to `TestValidateHabboName`, with the `MOD-` cases added.
- End-to-end run of the production binaries: the installer created the administrator through the new helpers with one
  row each in `users`, `credentials`, `avatars`, `profiles` and `homes`, a wallet of 5000 credits and a
  `registration/installer/5000` ledger row, and the administrator signed in on the CMS and opened `/me`.

# Notes

- The `MOD-` rule ports Holo's intent. Its check was dead code, and its letters-and-digits filter refused such names
  anyway, but [0026](/decisions/0026-installer-administrator-and-names.md) allows `-`, so `MOD-Bob` would now pass.
- `CreateHabbo` writes the ledger row only when the habbo starts with credits, so `registration.startCredits` of 0
  leaves no row, as in Holo.
- The installer's `clientIP` is gone, and its router uses `auth.ClientIP`.
