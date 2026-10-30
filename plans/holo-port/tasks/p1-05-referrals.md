---
type: Task
title: Pay referrals at registration
description: Read the refer link at registration, write the referral in the registration transaction and pay referral.reward to the referring habbo.
status: done
phase: p1
depends_on: [p1-04]
packages: [packages/store, packages/virtual, packages/cms]
holo: [source/holo/account.php, source/holo/config.php]
timestamp: 2026-10-30T22:24:53+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-30T22:24:53+00:00"}
---

# Goal

Implement the refer-a-friend link that Holo advertised and never read
([0021](/decisions/0021-dropped-and-kept-features.md)), following `packages/store/knowledge/entities/referral.md`.

# Steps

- [x] Declare `referral.enabled` (default on) and `referral.reward` (default 50, Holo's `$reward`, allowing 1 to
      1,000,000).
- [x] Queries `CreateReferral` and `AddWalletCredits`, with their OKF documents in `packages/store/knowledge`.
- [x] `register.astro` carries `GET /register?refer=<habbo name>` through the form in a hidden input.
- [x] In the registration transaction, when the name belongs to a habbo:
  - write the referral;
  - when `referral.enabled` is on, credit the referrer, write a `referral` ledger row and set `rewarded_at`;
  - when it is off, leave `rewarded_at` NULL.
- [x] An unknown name lets the registration go on without a referral.
- [x] Tests in `packages/cms` for each of these, and for a failed registration leaving no referral and no credits.

# Verification

```sh
cd packages/store && go tool sqlc generate && go vet ./... && go test ./... && make check-docs
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-10-30T22:24:53+00:00):

- `go tool sqlc generate` regenerates the store without further changes, and `go vet`, `go test` and `make check-docs`
  pass in `packages/store`.
- `gofmt`, `go vet` and `go test -race` pass in `packages/virtual` and `packages/cms`.
- New tests in `packages/cms` cover the payment and its ledger row, the configured reward, referrals switched off, an
  unknown name, the link carried through a failed form, a rejected registration paying nothing, and four registrations
  of one name at once paying a single reward.
- Mutation checks: each of these, applied on purpose, failed a test:
  - paying while `referral.enabled` is off;
  - a ledger row without the credits;
  - the wrong ledger reason;
  - an unknown name stopping the registration;
  - `rewarded_at` never set.

# Notes

- The referral link itself is shown by P2's account page, as in Holo's `account.php`.
- Open question before starting: nothing stops a person from farming credits with their own link, up to
  `registration.maxPerIp` per window. Holo never paid, so it has no answer to port.
- `recordReferral` runs inside the registration transaction and uses its queries, so a registration that fails pays
  nothing. On the plain `db` it would wait forever, because the store's pool has one connection.
