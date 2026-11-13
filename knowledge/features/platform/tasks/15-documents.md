---
type: Task
title: The documents say what reborn is
description: The platform feature's later notes, the READMEs and the architecture references describe reborn, the installer under /installer/, settings read from the store, the stop in order and the releases.
scope: [knowledge/features/platform/later.md, README.md, apps, packages/reborn/README.md, packages/reborn/knowledge, packages/installer/README.md, packages/installer/knowledge, packages/server/README.md, packages/server/knowledge]
depends_on: [09-game-reads-settings, 10-reborn-stops-in-order, 12-reborn-dev, 14-releases]
skills: []
---

# Goal

Nothing written in the repository contradicts what the platform feature built.

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- History decisions are never edited; reference documents are corrected in place.

# Steps

- [ ] [Later](/features/platform/later.md), "The orchestrator" and "One binary": reborn exists, and releases ship it
  beside the four programs ([0008](/decisions/reborn/0008-releases-ship-reborn-and-the-separate-programs.md)).
- [ ] The root `README.md` and every app's README: how to run reborn, and when to run a program alone
  ([0003](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)).
- [ ] Short `packages/reborn`, `packages/installer` and `packages/server` READMEs (what it is, setup);
  `packages/reborn/knowledge/`, `packages/installer/knowledge/steps.md`,
  `packages/installer/knowledge/runners.md`, `packages/server/knowledge/layout.md` and
  `packages/server/knowledge/architecture.md`
  on settings read from the store and the game's caches.
- [ ] Every `cms.refresh`, "refresh" and `virtual/settings` left in a document is corrected.

# Checks

```sh
grep -rn 'cms.refresh\|virtual/settings' --include=*.md . | grep -v '^./knowledge/decisions/' || true
make gates
```
