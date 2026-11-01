---
type: Task
title: Verify the HK-A exit criteria
description: Run housekeeping on the production binaries in a real browser, list the differences from Holo, and run every gate.
status: todo
phase: hk-a
depends_on: [hk-a-08]
packages: [packages/housekeeping, apps/housekeeping]
holo: []
timestamp: 2026-11-01T21:07:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
---

# Goal

Every exit criterion of [HK-A](/phases/hk-a-housekeeping-core.md) holds on the production binaries.

# Steps

- [ ] Install a hotel, then run the CMS and housekeeping side by side from a temporary `config.json`.
- [ ] Walk every page in a real Chromium, as a guest, as non-staff, as staff missing attributes and as an administrator,
  and compare the layout with `docs/hk.png`.
- [ ] Maintenance: turn it on in housekeeping, restart the CMS and see the maintenance page; turn it off, restart and see
  the site.
- [ ] Add the "Housekeeping" section of [the differences](/reference/holo-differences.md).
- [ ] Update [the programs](/reference/architecture.md) and [Holo housekeeping](/reference/holo-housekeeping.md).
- [ ] Run every gate.

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

- The IPC of [0040](/decisions/0040-housekeeping-writes-settings.md) is not designed, so a running stand-alone CMS sees a
  settings change only at its next start, as [the programs](/reference/architecture.md) says. On one shared mux the
  settings are shared and the change applies at once, which a test proves.
