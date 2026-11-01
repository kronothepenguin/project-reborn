---
type: Task
title: Add the housekeeping section to packages/config
description: Declare housekeeping.host and housekeeping.port, mirroring cms.host and cms.port, and have the installer write their defaults.
status: done
phase: hk-a
depends_on: []
packages: [packages/config, packages/installer]
holo: []
timestamp: 2026-11-01T21:14:05+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:14:05+00:00"}
---

# Goal

Housekeeping's runners read their address from `config.json`, as the CMS's do
([0037](/decisions/0037-cms-host-in-config.md)).

# Steps

- [x] `packages/config/housekeeping`, with `Host` and `Port`, per field defaults and validators, default host `localhost`
  and default port 18465, the port `tools/create` derives for the name.
- [x] Register the section in `config.go`: the struct, `defaults()` and `Validate()`.
- [x] Unit tests in the section, and the full-pipeline tests in `packages/config`.
- [x] The installer's config step writes the section's defaults, as it does for `cms.host`.
- [x] `packages/config/README.md` lists the keys.

# Verification

```sh
cd packages/config && gofmt -l . && go vet ./... && go test ./... -race
cd packages/installer && gofmt -l *.go internal && go vet ./... && go test ./... -race
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
```

Results (2026-11-01): `gofmt`, `go vet` and `go test -race` pass in `packages/config` (34 tests), `packages/installer`
(10), `packages/virtual` (22) and the packages that build on them. `TestInstallation` reads the `config.json` the
installer wrote and finds the section's defaults.

# Notes

- `Config.Validate` refuses an empty section, so the installer's `Config` literal has to carry it, and so does the
  fixture in `packages/installer/internal/setup/setup_test.go`.
