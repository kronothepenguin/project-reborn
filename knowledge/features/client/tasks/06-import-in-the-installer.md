---
type: Task
title: Import the client's files when a hotel is installed
description: The installer copies the variables and texts of the assets folder into the database of a new hotel when the folder holds the two files.
scope: [packages/installer]
depends_on: [03-the-dcr-package]
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

A new hotel can open its client at once ([Plan](/features/client/plan.md)). The behaviour of the spec:

- A new hotel is installed while the folder holds the two files: the installer imports them.

# Context

- [Spec](/features/client/spec.md)
- [Plan](/features/client/plan.md)
- `packages/assets/knowledge/index.md`: `dcr.Import`.
- `packages/installer/knowledge/steps.md`: the steps, run alone and inside reborn.
- Downloading the files is [the assets feature](/features/assets/spec.md)'s; until then the folder holds what the
  administrator put there. A folder without the two files leaves the tables empty, and housekeeping's action imports
  them later.

# Steps

- [ ] When the administrator is created, the installer runs `dcr.Import` on `<assets.path>/dcr/` in that step's
  transaction when the folder holds both files.
- [ ] One test for each side: a folder with the two files, and a folder without them, where the hotel is installed
  with empty tables.
- [ ] Update `packages/installer/knowledge/steps.md`.

# Checks

```sh
make -C packages/installer check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/installer`.
