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
| `server.api.host` | string | `localhost` | hostname or IP address, as `cms.host` |
| `server.api.port` | int | 15445 | 1–65535, other than `server.info.port` and `server.mus.port` |
| `reborn.host` | string | `localhost` | hostname or IP address, as `cms.host` |
| `reborn.port` | int | 16416 | 1–65535 |
| `assets.path` | string | `assets` | non-empty |

`store.path` refuses `?` and `#` because `store.Open` builds a `file:` URI from it.

`proxy` is for a hotel behind a reverse proxy: production enables it in its `config.json`, and `auth.RealIP` then takes
the client IP from the `X-Forwarded-For` header of requests that come from a trusted address or range.
`proxy.trusted` takes CIDR ranges because a pod's proxy address changes within a range.

`server` is the game server's two WebSocket listeners, `info` and `mus` (decision server/0020), and `api`, the HTTP
listener of its `/api/`, which the game opens only when it runs apart (decision reborn/0005). The CMS's and
housekeeping's runners call the game at `server.api`.

- `server.ValidateHost` calls `cms.ValidateHost`, so its hosts follow the rule of `cms.host`.
- `Server.Validate` refuses two of its listeners on one port; it compares no port of another section.
- The installer writes the section's defaults (`packages/installer/internal/router/config.go`).

`reborn` is the address of the whole hotel in one process (decision reborn/0003). Its port is the one `tools/create`
derives for the name `reborn`.

- Under reborn, `cms.host`, `cms.port`, `housekeeping.host` and `housekeeping.port` go unused. The separate programs
  read them.
- The game server keeps its own `server.info` and `server.mus` listeners.
- `reborn.ValidateHost` calls `cms.ValidateHost`.
- The installer writes the section's defaults.

`assets.path` is the assets folder, beside `config.json` by default. The client's folder is `<assets.path>/dcr/`,
which the CMS serves at `/dcr/`.

The settings package (`packages/virtual/settings`) exposes these values under the same key paths
(`settings.GetInt("cms.port")`; it has no getter for lists such as `proxy.trusted`), and a settings row never overrides
them.

# Declaring a key

The `adding-config-sections` skill holds the steps, the conventions and the tests.
