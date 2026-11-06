---
type: Decision
title: The client runs on LibreShockwave, and every socket is a WebSocket
description: The R26 .dcr runs in the browser on LibreShockwave, which turns each of the client's sockets, #info and #mus, into a WebSocket carrying the same bytes as TCP; the #mus connection speaks the Multiuser Xtra's SMUS protocol, learned from LibreShockwave's source.
status: accepted
timestamp: 2026-11-06T14:59:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T14:59:31+00:00"}
tags: [server, protocol, client]
---

# Decision

- The R26 client runs as its `.dcr` in a modern browser on LibreShockwave
  (`https://github.com/LibreShockwave/LibreShockwave`), a Shockwave player compiled to WebAssembly.
- Every socket the client opens becomes a WebSocket. `#info` speaks R26 ([fuse_client](/reference/r26/fuse_client.md))
  and `#mus` speaks MUS, the protocol of the Multiuser Xtra in its message mode. Over TCP or over a WebSocket, the
  bytes are the same.
- The MUS byte format is learned from LibreShockwave's Multiuser Xtra, since no `.ls` script holds it. This is the
  one source besides the `.ls` scripts ([0008](/decisions/0008-reverse-engineer-ls-only.md)), and it covers the
  `#mus` framing only.

# Context

[s1-01](/tasks/s1-01-fuse-client.md) found that `#mus` is opened in the Multiuser Xtra's message mode, whose bytes no
`.ls` script writes. The user explained that MUS is just a protocol, a raw TCP connection or bytes over a WebSocket,
and that the client will run on LibreShockwave, so sockets become WebSockets.

LibreShockwave's source, read at commit `3f9048009ff4bc9bf4bedb4a44f875c2ab36645b`, shows:

- `web/libreshockwave-cpp-worker.js`: each `connectToNetServer` opens `ws(s)://<host>:<port><websocketPath>`, one
  WebSocket per connection, with the host and port the client was given and one `websocketPath` for all of them. It
  sends binary frames, and it reads binary frames, or text frames one character per byte.
- `cpp/src/player/xtra/queued_multiuser_bridge.cpp`: in mode 0 every message is a frame of the byte `114`, the byte
  `0`, a 4-byte body length, then the error code, a timestamp, the subject, the sender, the recipients and the
  content as a serialized Lingo value. It also writes a fixed `Logon` frame when it connects.
- `cpp/src/player/movie_properties.cpp`: `the productVersion` is `"10.1"`, so the client takes its paths for
  Director below 11 ([fuse_client](/reference/r26/fuse_client.md#text)).

# Consequences

- [s1-24](/tasks/s1-24-mus-framing.md) writes the MUS byte format from LibreShockwave's source.
- `#info` and `#mus` share one `websocketPath` and differ only by port, and the server speaks first on `#info`
  (`HELLO`). A listener cannot tell the two protocols apart from the bytes, so each port speaks one protocol, as
  [0007](/decisions/0007-protocols-per-listener.md) already has each listener name its protocol. The ports and paths
  are [s0-04](/tasks/s0-04-listener-config.md)'s open question.
- The WebSocket sends binary frames, because the client sends them and reads any byte from them.
- `packages/client-r26`, the JavaScript translation, stays as it is. This decision does not change it.
