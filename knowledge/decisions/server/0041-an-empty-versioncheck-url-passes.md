---
type: Decision
title: An empty VERSIONCHECK URL passes the check
description: The version check accepts an empty client or external variables URL, which the client sends while its game host is local; a URL that is not empty must start with site.url.
status: accepted
timestamp: 2026-11-09T22:20:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:20:00+00:00"}
tags: [server, protocol]
---

# Decision

- An empty client URL or external variables URL in `VERSIONCHECK` passes the check
  ([0033](/decisions/server/0033-one-client-version-from-the-site.md)).
- A URL that is not empty must start with `site.url`.

# Context

The client sends its client URL empty while the game host is local, as in development, and both URLs empty outside a
browser plugin (hh_entry_init (`packages/server/knowledge/r26/hh_entry_init.md`)); LibreShockwave reports the `runMode` `Plugin`, so it sends both otherwise. Offered letting empty
URLs pass or requiring both to match, the user chose "Empty passes (Recommended)": "An empty URL is accepted; a URL
that is not empty must start with site.url. Local development keeps working, and a client loaded from another site is
still turned away."

# Consequences

- s2-06 checks `VERSIONCHECK` with it.
