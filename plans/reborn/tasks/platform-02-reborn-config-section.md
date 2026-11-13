---
type: Task
title: Add the reborn section to config.json
description: packages/config gains the section reborn with host localhost and port 16416, and the installer writes it with its defaults.
status: todo
slice: platform
depends_on: []
packages: [packages/config, packages/installer]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

reborn has its own address in `config.json` ([0003](/decisions/0003-reborn-runs-the-hotel-in-one-process.md)).

# Steps

- [ ] Follow the `adding-config-sections` skill: `packages/config/reborn` with `Reborn{Host, Port}` (`host`, `port`),
  `DefaultHost()` `localhost`, `DefaultPort()` `16416` (`tools/create`'s `AppPort("reborn")`), their validation, and
  the section registered on `Config` as `reborn`, with the tests the skill asks for.
- [ ] The installer's config handler (`packages/installer/internal/router/config.go`) fills the section with its
  defaults, as it does `proxy` and `server`, so `config.json` validates.
- [ ] `packages/config/README.md` lists the section.

# Verification

```sh
cd packages/config && go vet ./... && go test ./... -race
cd packages/installer && go vet ./... && go test ./... -race
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-02`.
- A `config.json` written before this section exists loads with the section's defaults, as every missing section does.
