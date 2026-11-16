---
type: Task
title: Import the client's files from housekeeping
description: Housekeeping gains an "Import client files" action, open to the new attribute housekeeping.dcr, which copies the variables and texts of the assets folder into the database.
scope: [packages/housekeeping, packages/auth, packages/store]
depends_on: [03-the-dcr-package]
skills: [applying-go-patterns, adding-data-persistence, templating-astro-pages, building-astro-components, testing-behaviours, use-modern-go]
---

# Goal

A hotel that exists, or one that received a newer client file, gets its variables and texts
([Plan](/features/client/plan.md)). The behaviours of the spec:

- Staff with `housekeeping.dcr` press "Import client files": the database holds exactly the variables and texts of the
  two files in the folder.
- The folder lacks one of the two files: the import is refused, names the missing file, and the database stays as it
  was.

# Context

- [Spec](/features/client/spec.md)
- [Plan](/features/client/plan.md)
- `packages/assets/knowledge/index.md`: `dcr.Import`.
- `packages/housekeeping/knowledge/package.md` and `design-system.md`: pages, `Box`, the plain `Button`, the staff log.
- `packages/auth/knowledge`: the catalogue of attributes. A new attribute comes with an update that gives it to the
  holders of the attribute that manages access (`adding-data-persistence`, its update rules).
- [Ranks](/features/ranks/spec.md): every change staff make writes one row of the staff log.
- `packages/store/migrations` is a shared file: this task is the one adding an update now, after
  [client 03](/features/client/tasks/03-the-dcr-package.md).

# Steps

- [ ] The attribute `housekeeping.dcr` in the catalogue, and the update that gives it to those who manage access.
- [ ] A housekeeping page for the client's files, in the menu where Holo kept its client settings, with one action,
  "Import client files". It runs `dcr.Import` on `<assets.path>/dcr/` in one transaction, writes one staff log row and
  says how many variables and texts the database holds.
- [ ] A missing file shows its name in the page's error, with status 422.
- [ ] One test per behaviour of the goal, through the router, and one for staff without the attribute: the page and
  the action are refused.
- [ ] Update `packages/housekeeping/knowledge`.

# Checks

```sh
make -C packages/housekeeping check
make -C packages/auth check
make -C packages/store check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/housekeeping`,
`packages/auth`, `packages/store`.
