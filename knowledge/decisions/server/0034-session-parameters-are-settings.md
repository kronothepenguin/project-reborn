---
type: Decision
title: The session parameters are settings
description: The ten session parameters are settings of the settings catalogue, edited in housekeeping like the CMS's other settings, with defaults that keep what no script reads at 0.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, settings]
---

# Decision

- The ten session parameters, ids 0 to 9, are settings of the settings catalogue, edited in housekeeping like the
  CMS's other settings.
- Defaults: COPPA, vouchers, the parent's e-mail at registration and at re-registration, direct mail and partner
  integration 0, which no script reads; the date format `dd-mm-yyyy`, the client's own; profile editing on; an empty
  tracking header; the tutorial off until a phase serves it.

# Context

Only four of the ten are read by any script: the date format, profile editing, the tracking header and the tutorial
([hh_entry_init](/reference/r26/hh_entry_init.md)). Offered settings with defaults or values fixed in the server, the user answered: "ok with settings, but we
already have a cms, same for sso i forgot, the sso should be created when the user logs in the cms, please load cms
knownledge and then extend login to generate sso if needed. and make the urls to the site urls. you will need a setting
for the site root or something like that." The offered option read: "Each is a setting in the settings catalogue,
editable in housekeeping. Defaults: the six unread ones 0, the date format dd-mm-yyyy (the client's own), profile
editing on, an empty tracking header, the tutorial off until a phase serves it."

# Consequences

- [s2-01](/tasks/s2-01-settings.md) declares them, and [s2-06](/tasks/s2-06-handshake-and-login.md) sends them in
  257.
