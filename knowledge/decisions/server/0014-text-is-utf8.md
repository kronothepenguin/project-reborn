---
type: Decision
title: Text on the wire is UTF-8
description: The server reads and writes every string as UTF-8, and the external variables the site serves turn client.textdata.utf8 on so that the client does the same.
status: accepted
timestamp: 2026-11-06T14:59:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T14:59:31+00:00"}
tags: [server, protocol]
---

# Decision

- Every string the server reads from or writes to the R26 client is UTF-8.
- The external variables the site serves to the client set `client.textdata.utf8=1`, so that the client's
  `encodeUTF8` and `decodeUTF8` convert its text (fuse_client (`packages/server/knowledge/r26/fuse_client.md#text`)).

# Context

The client writes UTF-8 only when `client.textdata.utf8` is on. Otherwise each byte is one character of the client's
locale, such as Windows-1252. s1-01 found this, and the user chose UTF-8.

# Consequences

- s0-06 writes strings as UTF-8, with no locale conversion.
- The site's external variables file carries `client.textdata.utf8=1`. Which task writes it is settled when the site
  starts serving the client.
- A UTF-8 string has no byte `0x01` or `0x02` except those characters themselves, so the R26 end marks stay safe.
