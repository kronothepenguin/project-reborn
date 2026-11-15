---
type: Decision
title: The server accepts one client version, from the site
description: A setting holds the client version the server accepts; VERSIONCHECK must carry it, and its client and external variables URLs must start with site.url, or the client is turned away; the client's links come from site.url too.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, protocol, settings]
---

# Decision

- A setting holds the client version the server accepts.
- `VERSIONCHECK` (1170) must carry that version, and its client URL and external variables URL must start with the
  setting `site.url`, the site's root. Any other client is turned away with an error.
- The links the client opens are built from `site.url` too, in the external variables the site serves
  (`knowledge/decisions/client/0004-client-links-from-site-url.md`).

# Context

Offered accepting any version or only one, the user chose "Only one version": "A setting holds the expected version,
and the server turns any other client away with an error." While answering where the session parameters come from, the
user added: "and make the urls to the site urls. you will need a setting for the site root or something like that."
The site's root is already the setting `site.url`, `http://localhost:17387` by default. Asked which URLs, the user
chose "Both": "The server checks VERSIONCHECK's URLs against site.url, and the client's links are built from it
too."

# Consequences

- s2-01 adds the version setting, whose default is asked when it starts, and
  s2-06 checks `VERSIONCHECK`.
