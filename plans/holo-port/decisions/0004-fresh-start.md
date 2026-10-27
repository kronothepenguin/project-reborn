---
type: Decision
title: Fresh start without Holo data
description: No data is imported from a Holo or Holograph MySQL database, so the schema keeps no legacy ids, formats or hashes.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [store]
---

# Decision

- No import tool and no legacy password verification.
- The schema is designed for the new system only.

# Context

Holo stored dates as strings, passwords as md5 with a static salt and user text HTML-escaped; carrying any of it
over would keep its bugs.

# Consequences

- Development databases are recreated with the installer when the schema or the seed data changes.
