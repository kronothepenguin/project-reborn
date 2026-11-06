---
type: Task
title: Declare the hosts and ports of info and mus in config.json
description: packages/config gains server.info and server.mus, a host and a port each, on which the server runs its WebSocket listeners.
status: done
phase: s0
depends_on: [s0-03]
packages: [packages/config, packages/installer, packages/housekeeping]
client: []
timestamp: 2026-11-06T17:49:41-05:00
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T17:49:41-05:00"}
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

`config.json` gives the server's two connections, `info` and `mus`, a host and a port each
([0020](/decisions/0020-info-and-mus-websocket-ports.md)). They are startup keys: the server needs them before it opens
the database (`plans/holo-port/decisions/0023-config-holds-startup-keys.md`).

# Steps

- [x] Ask the user S0's open question for this task: the keys and their defaults. Recorded as
  [0019](/decisions/0019-info-and-mus-listeners.md); asked how a connection is switched off, the user answered with
  [0020](/decisions/0020-info-and-mus-websocket-ports.md), which supersedes it.
- [x] Add the section with the `adding-config-sections` skill: `server.info` and `server.mus`, each with a `host` and a
  `port`, by default `localhost` and 30000, and `localhost` and 30001.
- [x] Validation checks each `host` as `cms.host` is checked, refuses a port outside 1 to 65535, and refuses `info`
  and `mus` on the same port.
- [x] Key paths of three levels, such as `server.info.port`, work with `Differences()` and `Rewrite()`.
- [x] The README's declared keys list the four keys.
- [x] The installer and the new-keys update follow what the skill says for a new section.

# Verification

```sh
cd packages/config && gofmt -l . && go vet ./... && go test ./... -race
make gates
```

Run on 2026-11-06. In `packages/config`, `gofmt -l .` lists nothing, `go vet ./...` reports nothing, and the tests
pass:

```text
ok  	github.com/kronothepenguin/project-reborn/packages/config	1.067s
ok  	github.com/kronothepenguin/project-reborn/packages/config/cms	(cached)
ok  	github.com/kronothepenguin/project-reborn/packages/config/housekeeping	(cached)
ok  	github.com/kronothepenguin/project-reborn/packages/config/proxy	(cached)
ok  	github.com/kronothepenguin/project-reborn/packages/config/server	1.013s
ok  	github.com/kronothepenguin/project-reborn/packages/config/store	(cached)
```

`make gates` in the worktree exits 0: every one of the 15 Go modules is formatted, vetted and passes its tests with
`-race`, the components pass their 167 tests and `svelte-check` with 0 errors, and sqlc and the store's documents
are up to date.

- `server/server_test.go`: the defaults pass their rules, `ValidateHost` gives what `cms.ValidateHost` gives,
  `ValidatePort` takes 1 to 65535, each error names its key, and the section round-trips its JSON tags.
- `server_pipeline_test.go`: the five checks of every key for the four keys, through `Load`, and `info` and `mus`
  on one port refused, on one host or on two.
- `keys_test.go`: `Differences()` lists the missing server keys of a section that has only `info.port` and an
  unused `server.lobby.port`; `Rewrite()` refuses a key the file has and `mus` on the port of `info`, leaving the file
  as it was, then writes a new `server.mus.port` beside the kept `server.info.port`.
- The installer's tests check that its `config.json` holds the section's defaults, and housekeeping's that its update
  page offers the four keys of an older `config.json` and saves them.

# Notes

- Runs on the branch `s0`.
- `server.ValidateHost` calls `cms.ValidateHost`, so the hosts follow the rule of `cms.host` from one place, while the
  section still declares a validator for each field as the others do. `housekeeping` copies that rule instead.
- `packages/config` has no rule across sections, none for `cms.port` and `housekeeping.port`, so the server's ports
  join none: only `info` and `mus` are checked against each other.
- The installer's form asks for no server key: it asks for the store path, the CMS port and the housekeeping port.
  It builds the whole `Config` before `Create` validates it, so its config step writes the section's defaults, as it
  writes `housekeeping.host`'s; without them `Create` refused the empty section.
- An older `config.json` lacks the section: `Differences()` lists its four keys with their defaults, and
  housekeeping's update page offers them and writes them three levels deep. The settings package reads them under
  their paths, such as `settings.GetInt("server.info.port")`, as it reads every key of `config.json`.
