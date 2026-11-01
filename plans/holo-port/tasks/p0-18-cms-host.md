---
type: Task
title: Read the CMS address from config.json
description: Add cms.host to packages/config, with localhost as its default, and make both CMS runners listen on it.
status: todo
phase: p0
depends_on: []
packages: [packages/config, packages/installer, apps/cms]
holo: []
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Implement [0037](/decisions/0037-cms-host-in-config.md).

# Steps

- [ ] `packages/config/cms`: `Host`, `DefaultHost()` and `ValidateHost()`, registered in `defaults()`.
- [ ] `packages/installer`: the config step writes the default host.
- [ ] `apps/cms/cmd/cms` and `apps/cms/cmd/cms-dev`, as the user requested: the address comes from `cms.host` and
      `cms.port`.
- [ ] Unit and pipeline tests.
- [ ] Docs: `packages/config/README.md` and the docs of `apps/cms` and `packages/cms`.

# Verification

```sh
cd packages/config && gofmt -l . && go vet ./... && go test ./... -race
cd packages/virtual && go test ./... -race
cd packages/installer && go test ./... -race
cd apps/cms && gofmt -l . && go build ./... && go vet ./...
```

Then run the CMS with `cms.host` set to `0.0.0.0` and check that it answers on another address of the machine.

# Notes

- None yet.
