---
type: Task
title: Load the navigator's shared data in virtual
description: virtual/category, virtual/model and virtual/room load the categories, the room models and the public rooms when the server starts, and count the habbos in each room in memory.
status: todo
phase: s3
depends_on: [s3-01]
packages: [packages/virtual, packages/server]
client: []
timestamp: 2026-11-10T03:40:35+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
---

# Goal

The navigator's shared data is in memory from the server's start
([0009](/decisions/0009-virtual-holds-the-server-state.md)), in the packages of
[0060](/decisions/0060-virtual-category-model-and-room.md).

# Steps

- [ ] `virtual/category`, `virtual/model` and `virtual/room` load the categories, the models and the public rooms from
  the store, and `server.New` loads them.
- [ ] `virtual/room` counts the habbos in each public room and habbo room, in memory only
  ([0011](/decisions/0011-saved-and-memory-only-data.md)); every count stays 0 until [S4](/phases/s4-rooms.md) lets
  habbos enter.
- [ ] Tests: what loads, a lookup of each, and counts safe for concurrent use.

# Verification

```sh
cd packages/virtual && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s3-navigator-state`.
