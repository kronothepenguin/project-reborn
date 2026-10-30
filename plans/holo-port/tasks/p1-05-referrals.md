---
type: Task
title: Pay referrals at registration
description: Read the refer link at registration, write the referral in the registration transaction and pay referral.reward to the referring habbo.
status: todo
phase: p1
depends_on: [p1-04]
packages: [packages/store, packages/virtual, packages/cms]
holo: [source/holo/account.php, source/holo/config.php]
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
---

# Goal

Implement the refer-a-friend link that Holo advertised and never read
([0021](/decisions/0021-dropped-and-kept-features.md)), following `packages/store/knowledge/entities/referral.md`.

# Steps

- [ ] Declare `referral.enabled` (default on) and `referral.reward` (default 50, Holo's `$reward`, allowing 1 to
      1,000,000).
- [ ] Queries `CreateReferral` and `AddWalletCredits`, with their OKF documents in `packages/store/knowledge`.
- [ ] `register.astro` carries `GET /register?refer=<habbo name>` through the form in a hidden input.
- [ ] In the registration transaction, when the name belongs to a habbo:
  - write the referral;
  - when `referral.enabled` is on, credit the referrer, write a `referral` ledger row and set `rewarded_at`;
  - when it is off, leave `rewarded_at` NULL.
- [ ] An unknown name lets the registration go on without a referral.
- [ ] Tests in `packages/cms` for each of these, and for a failed registration leaving no referral and no credits.

# Verification

```sh
cd packages/store && go tool sqlc generate && go vet ./... && go test ./... && make check-docs
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- The referral link itself is shown by P2's account page, as in Holo's `account.php`.
- Open question before starting: nothing stops a person from farming credits with their own link, up to
  `registration.maxPerIp` per window. Holo never paid, so it has no answer to port.
