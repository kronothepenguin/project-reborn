---
type: Task
title: Remove the unused store test data
description: Delete packages/store/testdata, stale schema files from the store refactor that no code references.
status: done
phase: p0
depends_on: []
packages: [packages/store]
holo: []
timestamp: 2026-10-27T21:25:59+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T21:25:59+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T21:25:59+00:00"}
---

# Goal

`packages/store` carries no stale test data. The user confirmed the files are leftovers of the store refactor.

# Steps

- [x] Confirm nothing references `packages/store/testdata`.
- [x] Delete `packages/store/testdata/schema/alpha.schema.sql` and `beta.schema.sql` (the whole `testdata/`).

# Verification

```sh
grep -rn "testdata" packages/store
cd packages/store && go vet ./... && go test ./... -count=1
```

Results (2026-10-27T21:25:59+00:00):

- No reference to `testdata` remains in `packages/store`. The only `testdata` match in the repository is air's own
  `testdata_dir` setting in `apps/cms/.air.toml`, which is unrelated.
- `go vet ./...`: no output; `go test ./... -count=1`: ok.

# Notes

- Found in [p0-02](/tasks/p0-02-store-open-returns-db.md); the user asked for the deletion on 2026-10-27.
