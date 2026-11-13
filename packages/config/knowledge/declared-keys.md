---
type: Reference
title: Declared keys
description: Every key config.json holds, with its type, default and allowed values, and how a new key is declared.
---

# Keys

A key belongs here only when a program reads it before the database opens. Values that can change while a program
runs are settings, declared in `packages/virtual`.

| Key | Type | Default | Allowed |
| --- | --- | --- | --- |
| `store.path` | string | `habbo.db` | non-empty, no `?` or `#` |
| `cms.host` | string | `localhost` | hostname or IP address; `0.0.0.0` listens on every IPv4 interface, as a pod needs |
| `cms.port` | int | 17387 | 1–65535 |
| `housekeeping.host` | string | `localhost` | hostname or IP address, as `cms.host` |
| `housekeeping.port` | int | 18465 | 1–65535 |
| `proxy.enabled` | bool | false | |
| `proxy.trusted` | []string | `["127.0.0.1", "::1"]` | IP addresses or CIDR ranges, at least one when `proxy.enabled` |
| `server.info.host` | string | `localhost` | hostname or IP address, as `cms.host` |
| `server.info.port` | int | 30000 | 1–65535 |
| `server.mus.host` | string | `localhost` | hostname or IP address, as `cms.host` |
| `server.mus.port` | int | 30001 | 1–65535, other than `server.info.port` |

`store.path` refuses `?` and `#` because `store.Open` builds a `file:` URI from it.

`proxy` is for a hotel behind a reverse proxy: production enables it in its `config.json`, and `auth.RealIP` then takes
the client IP from the `X-Forwarded-For` header of requests that come from a trusted address or range.
`proxy.trusted` takes CIDR ranges because a pod's proxy address changes within a range.

`server` is the game server's two WebSocket listeners, `info` and `mus` (decision server/0020).

- `server.ValidateHost` calls `cms.ValidateHost`, so its hosts follow the rule of `cms.host`.
- `Server.Validate` compares only the `info` and `mus` ports with each other.
- The installer writes the section's defaults (`packages/installer/internal/router/config.go`).

The settings package (`packages/virtual/settings`) exposes these values under the same key paths
(`settings.GetInt("cms.port")`; it has no getter for lists such as `proxy.trusted`), and a settings row never overrides
them.

# Declaring a key

The `adding-config-sections` skill holds the steps, the conventions and the tests.
