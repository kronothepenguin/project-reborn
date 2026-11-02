---
type: Task
title: Verify HK-B
description: Every exit criterion of HK-B holds from a clean checkout, in a real browser.
status: todo
phase: hk-b
depends_on: [hk-b-02, hk-b-03, hk-b-04, hk-b-05, hk-b-06, hk-b-07, hk-b-08, hk-b-09]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-02T19:41:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
---

# Goal

The phase closes on results seen from a clean checkout.

# Steps

- [ ] Run the HK-B flows on the production binaries in a real browser.
- [ ] A banned user's sessions end, and their next login shows the reason and the expiry.
- [ ] Every action wrote a staff log row with the actor and the target.
- [ ] List the differences from Holo.
- [ ] Run every gate.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
