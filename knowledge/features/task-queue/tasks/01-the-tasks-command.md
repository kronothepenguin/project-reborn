---
type: Task
title: The tasks command
description: A Go tool in tools/tasks with status, start, note, ready, turn, deliver and merge, its state in an ignored folder of the main checkout and in git.
scope: [tools/tasks, Makefile, .gitignore]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

The queue and the steps of a delivery are one command, and they outlast a closed session.

# Context

- [Spec](/features/task-queue/spec.md), every section under `## Next`.
- [Plan](/features/task-queue/plan.md): the shape and where the state lives are the user's, build them exactly as
  written there.
- [The workflow](/workflow.md), "Delivery", and the `working-tasks` and `planning-features` skills: the steps the tool
  carries out.
- `tools/checks`: how a tool of this repository is laid out, built by `make tools` and tested.

# Steps

- [ ] `tools/tasks`: a Go module with `cmd/tasks`, built to `tools/tasks/bin/tasks` by `make tools`; `make tasks`
  prints the status.
- [ ] The seven subcommands of the plan, each refusing what the protocol forbids, with a plain line that says why.
- [ ] The state in `.claude/tasks/` of the main checkout, found from any worktree; `.gitignore` covers it.
- [ ] Tests on temporary repositories: each behaviour of the spec, with the checks and the browser run replaced by
  commands the test gives.
- [ ] The tool's README and knowledge: each command with one example and its refusals.

# Checks

```sh
make -C tools/tasks check
```
