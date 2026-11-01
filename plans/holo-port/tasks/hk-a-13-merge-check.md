---
type: Task
title: Verify HK-A merged with P2
description: Merge hk-a into main and verify the result from a clean checkout, in the browser and with every gate.
status: done
phase: hk-a
depends_on: [hk-a-12, p2-07]
packages: [packages/housekeeping, packages/cms, packages/installer]
holo: []
timestamp: 2026-11-01T23:07:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T22:54:30+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T23:07:49+00:00"}
---

# Goal

`main` holds P2 and HK-A together, and both still work, side by side, as they did apart.

# Steps

- [x] Merge `hk-a` on a branch of its own, keeping `main` as the first parent, and regenerate what `sqlc` writes.
- [x] Run every gate from a clean checkout of the result.
- [x] Run every browser suite of P2 on the merged binaries.
- [x] Walk housekeeping beside a running CMS in a real browser, from the installer on, and compare it with `docs/hk.png`.
- [x] Fast-forward `main` to the result.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
pnpm --filter @project-reborn/cms build
pnpm --filter @project-reborn/installer build
pnpm --filter @project-reborn/housekeeping build
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go' && make check-docs
```

Results (2026-11-01T23:07:49+00:00):

From a clean checkout of `10bd0ed5`, whose tree differs from the result only in this bundle:

- `make install` left the tree clean, and the programs built with no frontend.
- `gofmt`, `go vet` and `go test -race` passed in all 13 modules of `go.work`, with 582 tests counting subtests. 122 component
  tests and `svelte-check` passed, all three frontends built, `sqlc generate` changed nothing and `make check-docs` passed.
- The 223 browser checks of P2 passed on the merged binaries.
- The 116 browser checks of HK-A passed on them, with the seed also writing the wallets, profiles and homes that P2 reads.
- 28 new checks walked the three programs together in a real Chromium, with every server log clean:
  - the installer's form wrote both ports to `config.json`;
  - the session reached housekeeping on its own port;
  - the three settings of P2 were saved through their forms, and a bad address was refused;
  - a running CMS kept its values, and after a restart the tab followed the address, the limit of habbos applied and the
    birthday message obeyed the setting, off and on;
  - housekeeping named the habbo switched to on the CMS, and signing out on the CMS ended housekeeping too.
- The dashboard and the settings form were compared with `docs/hk.png`.
- `main` moved by fast-forward to the commit that closes this task, so its first parents stay those of `main`.

# Notes

- The merge had six conflicts: five documents kept from both sides, and `moderation.query.sql.go`, which `sqlc` wrote again.
  The row that listed the footer and the maintenance alert as waiting for P2 went, because P2 built them.
- The first run of the P2 suites failed because the user's own dev server held port 17387, which says nothing about the merge.
  The suites ran on 17487 instead, and that server was left alone.
- On a new install the CMS's Housekeeping tab answers 404 when the programs run alone: see the open questions of
  [HK-A](/phases/hk-a-housekeeping-core.md).
