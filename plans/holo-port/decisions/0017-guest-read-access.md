---
type: Decision
title: Guests can read public pages
description: Guests can read news, community, staff, tags, homes, group pages, the forum and the club and credits information; acting needs a session.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [cms, access]
---

# Decision

- Readable without a session: news, community, staff, tags, habbo homes, group pages, the forum, and the club and
  credits information pages.
- Posting, buying, joining, editing and every other action require a session.

# Context

Holo marked these pages `$allow_guests = true`, but `source/holo/includes/session.php` redirected without `exit`,
so the intent never worked.

# Consequences

- The community header has a guest state with the mini login form.
- Every action route checks the session; read routes render guest variants.
