---
type: Decision
title: The client's links come from site.url
description: The links the client opens, such as a habbo's home page, mail and the logout pages, are built from the CMS setting site.url in the external variables the site serves, as the game server checks VERSIONCHECK's URLs against it.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [client, settings]
---

# Decision

- The links the client opens, such as a habbo's home page, mail and the logout pages, are built from the CMS setting
  `site.url`, the site's root, in the external variables the site serves.
- The game server checks the URLs that `VERSIONCHECK` carries against the same setting
  (`knowledge/decisions/server/0033-one-client-version-from-the-site.md`).

# Context

While answering the game server's S2 questions, the user asked to "make the urls to the site urls. you will need a
setting for the site root or something like that." The site's root is already the setting `site.url`,
`http://localhost:17387` by default. Asked whether that meant the URLs of `VERSIONCHECK`, the client's links, or both,
the user chose "Both": "The server checks VERSIONCHECK's URLs against site.url, and the client's links are built from it
too."

# Consequences

- C1, which serves the external variables until
  C2, builds every link of the client from `site.url`.
