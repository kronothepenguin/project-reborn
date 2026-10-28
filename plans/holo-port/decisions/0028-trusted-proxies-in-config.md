---
type: Decision
title: Trusted reverse proxies in config.json
description: config.json has a proxy section, off by default, that lets the runners take the client IP from X-Forwarded-For when the connection comes from a listed proxy address or range.
status: accepted
timestamp: 2026-10-28T01:49:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:49:44+00:00"}
tags: [config, auth, security]
---

# Decision

- `packages/config` has a `proxy` section:
  - `enabled`, false by default;
  - `trusted`, IP addresses or CIDR ranges, by default `127.0.0.1` and `::1`.
- When `enabled` is true, `auth.RealIP` replaces `r.RemoteAddr` with the client's address for requests that come from
  a trusted proxy. The runners put this middleware in front of everything. It reads `X-Forwarded-For` from the right
  and skips trusted proxies. Requests from any other address keep their own.
- Development leaves it disabled. Production enables it in its own `config.json`.

# Context

Behind a reverse proxy every request has the proxy's address, so IP throttling, IP bans and the IP history would apply
to everyone. Clients can forge `X-Forwarded-For`, so the header is believed only from trusted proxies. The user chose
a switch in `config.json`, so that development and production differ only by their config files.

# Consequences

- [p0-11](/tasks/p0-11-cms-wiring.md) puts `auth.RealIP` in front of the CMS handler, and housekeeping does the same.
- Housekeeping cannot change which proxies are trusted, since the list lives in `config.json`.
