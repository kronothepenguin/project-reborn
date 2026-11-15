---
type: Decision
title: The server sends ENDOFCRYPTOPARAMS right after CRYPTOPARAMETERS
description: The server still skips the client's encryption, but answers INIT_CRYPTO with CRYPTOPARAMETERS 0 and ENDOFCRYPTOPARAMS at once, without waiting for GENERATEKEY, which the client sometimes never sends.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, protocol, security]
---

# Decision

- The server answers `INIT_CRYPTO` (206) with `CRYPTOPARAMETERS` (277) set to 0, and then with `ENDOFCRYPTOPARAMS`
  (278) at once. The client starts its session on 278 and sends plain bytes.
- A `GENERATEKEY` (2002) that arrives later is logged and changes nothing.
- As in [0012](/decisions/server/0012-no-encryption.md), the server has no Diffie-Hellman key exchange and no RC4.

# Context

[0012](/decisions/server/0012-no-encryption.md) had the server answer the client's public key, `GENERATEKEY`, with
`ENDOFCRYPTOPARAMS`, as the old server did. S2 found that the client withholds `GENERATEKEY`
with script tracing on, when `Login Subscript 2` is missing, and where the platform is not Windows when its key comes
out shorter than 2 characters, while its handler of 278 checks nothing
(hh_entry_init (`packages/server/knowledge/r26/hh_entry_init.md`)). Offered sending 278 right after 277, or after `GENERATEKEY` as 0012
and the old server did, the user chose "Right after 277 (Recommended)": "The server sends
CRYPTOPARAMETERS (277) with 0 and 278 at once. A GENERATEKEY that comes later is logged and ignored. Example:
INIT_CRYPTO -> server sends 277 '0' and 278 -> client sends VERSIONCHECK."

# Consequences

- It supersedes [0012](/decisions/server/0012-no-encryption.md), whose other rules it keeps.
- s2-06 follows it.
