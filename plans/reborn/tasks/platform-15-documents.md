---
type: Task
title: The documents say what reborn is
description: plans/later.md, the READMEs and the architecture references describe reborn, the installer under /installer/, settings read from the store, the stop in order and the releases.
status: todo
slice: platform
depends_on: [platform-09, platform-10, platform-12, platform-14]
packages: [plans/later.md, README.md, apps, packages/reborn/README.md, packages/installer/README.md, packages/server/README.md, plans/server/reference/architecture.md]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

Nothing written in the repository contradicts what the platform slice built.

# Steps

- [ ] `plans/later.md`, "The orchestrator" and "One binary": reborn exists, and releases ship it beside the four
  programs ([0008](/decisions/0008-releases-ship-reborn-and-the-separate-programs.md)).
- [ ] The root `README.md` and every app's README: how to run reborn, and when to run a program alone
  ([0003](/decisions/0003-reborn-runs-the-hotel-in-one-process.md)).
- [ ] `packages/reborn`, `packages/installer` and `packages/server` READMEs; `plans/server/reference/architecture.md`
  on settings read from the store and the game's caches.
- [ ] Every `cms.refresh`, "refresh" and `virtual/settings` left in a document is corrected.

# Verification

```sh
grep -rn 'cms.refresh\|virtual/settings' --include=*.md . | grep -v '^./plans/\(holo-port\|server\|client\)/\(decisions\|tasks\|log\)' || true
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-15`.
- History decisions, tasks and logs are never edited; reference documents are corrected in place.
