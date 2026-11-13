---
type: Rules
title: Shared files
description: The files that only one task changes at a time, each with its reason.
---

# Shared files

Tasks run in parallel when their scopes leave each other's folders alone. These files are changed by one task at a
time, whatever the scopes say:

| Files | Reason |
| --- | --- |
| `packages/store/migrations`, the generated query files and the indexes of `packages/store/knowledge` | The next update's number collides |
| `packages/virtual/settings`, and `packages/settings` once it holds the list | Every task that declares a setting changes the one list |
| `go.work`, the `go.mod` files and `pnpm-lock.yaml` | Every module of the workspace shares them |
| `apps/**/cmd/**` | The user's files: a task describes its change there and the master asks the user |
