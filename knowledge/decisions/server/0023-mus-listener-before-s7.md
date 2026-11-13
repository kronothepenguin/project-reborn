---
type: Decision
title: Until S7, the mus listener accepts, logs sizes and never answers
description: Until S7 frames MUS, the mus listener accepts the WebSocket and logs the connect, the size of each message and the close, and it never answers.
status: accepted
timestamp: 2026-11-07T00:12:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:12:36+00:00"}
tags: [server, protocol, mus]
---

# Decision

Until [S7](/phases/s7-club-help-extras.md) frames MUS, the `mus` listener accepts the WebSocket and logs the connect,
the size of each message and the close. It never answers.

# Context

The client opens `#mus` only when its photo queue has work ([fuse_client](/reference/r26/fuse_client.md#session)). The
user chose "Accept and log sizes (Recommended)": "Accepts the WebSocket and logs the connect, each message's size and
the close, but never answers. The client's photo queue keeps waiting, as it would on any silent server."

# Consequences

- [s0-07](/tasks/s0-07-r26-sessions.md) serves the `mus` listener this way.
- S7 replaces it with the MUS framing that [s1-24](/tasks/s1-24-mus-framing.md) describes.
