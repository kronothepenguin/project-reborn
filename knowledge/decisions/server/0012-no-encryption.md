---
type: Decision
title: The server skips the client's encryption
description: At login the server answers the client's public key with ENDOFCRYPTOPARAMS, as the old server did, so the client sends plain bytes, with no Diffie-Hellman key exchange and no RC4.
status: superseded
superseded_by: "0027"
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, protocol, security]
---

# Decision

- The server answers `INIT_CRYPTO` with `CRYPTOPARAMETERS` set to 0, and the client's public key (`GENERATEKEY`) with
  `ENDOFCRYPTOPARAMS`, as the old server did. The client then starts its session and sends plain bytes.
- The server has no Diffie-Hellman key exchange and no RC4.

# Context

The R26 client always offers encryption: `handleCryptoParameters` in `8_Login Handler Class.ls` sets client-to-server
encryption to 1 and answers with its public key. `handleEndOfCryptoParams` starts the session without it. Offered no
encryption, plain now and RC4 later, or RC4 from the start, the user chose no encryption: Habbo's modified RC4 protects
nothing today, and for the WebSocket the real protection is `wss://` (TLS) in front of the server.

# Consequences

- [s1-02](/tasks/s1-02-entry-init.md) confirms the handshake from the client's scripts.
