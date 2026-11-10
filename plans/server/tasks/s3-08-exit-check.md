---
type: Task
title: Check S3's exit criteria
description: From the merged work, check every exit criterion of S3 and close the phase.
status: todo
phase: s3
depends_on: [s3-01, s3-02, s3-03, s3-04, s3-05, s3-06, s3-07]
packages: [packages/server, packages/store, packages/virtual]
client: []
timestamp: 2026-11-10T03:40:35+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
---

# Goal

S3 meets its [exit criteria](/phases/s3-navigator.md#exit-criteria) on `main`.

# Steps

- [ ] Every exit criterion of [S3](/phases/s3-navigator.md), checked one by one on the merged work.
- [ ] `packages/server/README.md` and the reference describe what S3 added.
- [ ] S3 is `done`; `/index.md` names the next phase.

# Verification

```sh
make install && make gates
cd packages/server && go test ./... -race -v
```

# Notes

- Runs on the branch `s3-exit-check`.
