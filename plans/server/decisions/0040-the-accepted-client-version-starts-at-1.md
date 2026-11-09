---
type: Decision
title: The accepted client version starts at 1
description: The setting that holds the client version the server accepts starts at 1, and the external variables the site serves give the client client.version.id=1.
status: accepted
timestamp: 2026-11-09T22:20:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:20:00+00:00"}
tags: [server, settings]
---

# Decision

- The setting that holds the client version the server accepts
  ([0033](/decisions/0033-one-client-version-from-the-site.md)) starts at 1.
- The external variables the site serves give the client `client.version.id=1` (`plans/client`'s C1).

# Context

The setting and the external variables only need to agree. Offered 1 or 26, the user chose "1 (Recommended)": "The
setting starts at 1, and C1's external variables give client.version.id=1. Example: a client sending 2 gets 'Version
not correct' and the alert_old_client window."

# Consequences

- [s2-01](/tasks/s2-01-settings.md) declares the setting with it.
