---
type: Task
title: Save the last time online, the machine id and the sound setting
description: Habbos keep their last time online, the machine id of their last login and their sound setting in the store.
status: todo
phase: s2
depends_on: []
packages: [packages/store]
client: []
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
---

# Goal

The store holds what S2 saves of a habbo: the last time online ([0037](/decisions/0037-last-online-at-login-and-logout.md)), the
machine id of the last login ([0035](/decisions/0035-the-machine-id-is-saved-per-habbo.md)) and the sound setting
([0038](/decisions/0038-the-sound-setting-is-saved.md)).

# Steps

- [ ] Add them with the `adding-data-persistence` skill, with their queries and OKF documents.
- [ ] Tests of the queries.

# Verification

```sh
cd packages/store && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s2-saved-login-data`.
