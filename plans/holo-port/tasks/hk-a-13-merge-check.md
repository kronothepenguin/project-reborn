---
type: Task
title: Verify HK-A merged with P2
description: Merge hk-a into main and verify the result from a clean checkout, in the browser and with every gate.
status: in-progress
phase: hk-a
depends_on: [hk-a-12, p2-07]
packages: [packages/housekeeping, packages/cms, packages/installer]
holo: []
timestamp: 2026-11-01T22:54:30+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T22:54:30+00:00"}
---

# Goal

`main` holds P2 and HK-A together, and both still work, side by side, as they did apart.

# Steps

- [ ] Merge `hk-a` on a branch of its own, keeping `main` as the first parent, and regenerate what `sqlc` writes.
- [ ] Run every gate from a clean checkout of the result.
- [ ] Run every browser suite of P2 on the merged binaries.
- [ ] Walk housekeeping beside a running CMS in a real browser, from the installer on, and compare it with `docs/hk.png`.
- [ ] Fast-forward `main` to the result.

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

# Notes

- None yet.
