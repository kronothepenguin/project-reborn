---
type: Task
title: Load the furni definitions and the catalogue in virtual
description: virtual/furni holds the furni definitions and virtual/catalogue the pages and what they sell, both loaded when the server starts.
status: todo
phase: s5
depends_on: [s5-01]
packages: [packages/virtual, packages/server]
client: []
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

The server reads furni and the catalogue from memory, as shared data
([0098](/decisions/0098-virtual-furni-and-catalogue.md), [0009](/decisions/0009-virtual-holds-the-server-state.md)).

# Steps

- [ ] `packages/virtual/furni` holds the definitions, read by id; `packages/virtual/catalogue` holds the pages in their
  order, each with its items, and reads `virtual/furni` ([0098](/decisions/0098-virtual-furni-and-catalogue.md)).
- [ ] Neither keeps a database connection: their loaders receive the `*sql.DB`
  ([0009](/decisions/0009-virtual-holds-the-server-state.md)).
- [ ] `server.New` loads both with the navigator, once no database update waits
  ([0064](/decisions/0064-the-navigator-loads-once-the-updates-are-applied.md)).
- [ ] Tests, and the two packages in `packages/virtual`'s README.

# Verification

```sh
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-catalogue-state`.
