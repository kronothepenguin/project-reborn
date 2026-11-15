---
type: Task
title: Add the reborn section to config.json
description: packages/config gains the section reborn with host localhost and port 16416, and the installer writes it with its defaults.
scope: [packages/config, packages/installer]
depends_on: []
skills: [adding-config-sections]
---

# Goal

reborn has its own address in `config.json` ([0003](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)).

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- `packages/config/knowledge/adding-a-section.md`: the playbook of `adding-config-sections`.
- [reborn runs the hotel in one process, and the separate programs
  stay](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)
- A `config.json` written before this section exists loads with the section's defaults, as every missing section does.

# Steps

- [ ] Follow the `adding-config-sections` skill: `packages/config/reborn` with `Reborn{Host, Port}` (`host`, `port`),
  `DefaultHost()` `localhost`, `DefaultPort()` `16416` (`tools/create`'s `AppPort("reborn")`), their validation, and
  the section registered on `Config` as `reborn`, with the tests the skill asks for.
- [ ] The installer's config handler (`packages/installer/internal/router/config.go`) fills the section with its
  defaults, as it does `proxy` and `server`, so `config.json` validates.
- [ ] `packages/config/knowledge/declared-keys.md` lists the section.

# Checks

```sh
make -C packages/config check
make -C packages/installer check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/config`,
`packages/installer`.
