# Reference

What the R26 client, the Holograph Emulator and the old server contain, and how the new server is built.

## Sources

- [The R26 client](/reference/client-r26.md) — Where the R26 client's protocol lives in packages/client-r26, how its scripts register and send messages, its wire format and handshake, and the format of the per-cast protocol references.
- [The Holograph Emulator](/reference/holoemu.md) — What the Holograph Emulator in source/holoemu is, how its source is laid out, what its three MySQL dumps hold, which fuses it checks and ranks, how to read it, and when the server plan reads it.
- [The old server](/reference/old-server.md) — The game server removed in commit 2ea51d7b, where to read it, its structure, what each part did, what this plan changes and the problems found in it.

## The server

- [How the server is built](/reference/architecture.md) — The packages of the game server and what each one does, the path of a connection from a listener to the state, and how the server runs alone and under the orchestrator.

## The R26 protocol

[The R26 protocol by cast](/reference/r26/index.md), written in [S1](/phases/s1-protocol-reference.md).
