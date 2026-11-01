---
type: Task
title: Read the CMS address from config.json
description: Add cms.host to packages/config, with localhost as its default, and make both CMS runners listen on it.
status: done
phase: p0
depends_on: []
packages: [packages/config, packages/installer, apps/cms]
holo: []
timestamp: 2026-11-01T18:18:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:18:46+00:00"}
---

# Goal

Implement [0037](/decisions/0037-cms-host-in-config.md).

# Steps

- [x] `packages/config/cms`: `Host`, `DefaultHost()` and `ValidateHost()`, registered in `defaults()`.
- [x] `packages/installer`: the config step writes the default host.
- [x] `apps/cms/cmd/cms` and `apps/cms/cmd/cms-dev`, as the user requested: the address comes from `cms.host` and
      `cms.port`.
- [x] Unit and pipeline tests.
- [x] Docs: `packages/config/README.md` and the docs of `apps/cms` and `packages/cms`.

# Verification

```sh
cd packages/config && gofmt -l . && go vet ./... && go test ./... -race
cd packages/virtual && go test ./... -race
cd packages/installer && go test ./... -race
cd apps/cms && gofmt -l . && go build ./... && go vet ./...
```

Then run the CMS with `cms.host` set to `0.0.0.0` and check that it answers on another address of the machine.

Results (2026-11-01T18:18:46+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/config`, with `cms.host` through the unit tests and the five
  pipeline checks. `packages/virtual` and `packages/installer` pass, and `apps/cms` builds and vets.
- End-to-end run of the production binary:
  - with `"host": "0.0.0.0"`, the CMS answered 200 on `127.0.0.1` and on the machine's LAN address;
  - with no `host` key, it answered 200 on `127.0.0.1` and refused the LAN address, as before this task;
  - with `"host": "http://x"`, it stopped at start with `config: config.json: cms.host: must be a hostname or an IP
    address, got "http://x"`.

# Notes

- The installer's form does not ask for the host. It writes `localhost`, and a pod edits `config.json`.
- The user's request covers both runners, because both build the CMS address.
