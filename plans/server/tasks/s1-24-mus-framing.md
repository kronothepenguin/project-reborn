---
type: Task
title: Describe the MUS framing of the #mus connection
description: Write /reference/r26/mus.md from LibreShockwave's Multiuser Xtra: the bytes of a MUS frame, the Logon frame, the serialized Lingo values, and the messages fuse_client and hh_photo exchange on #mus.
status: todo
phase: s1
depends_on: [s1-01]
packages: []
client: ["packages/client-r26/src/game/fuse_client/52_Multiuser Instance Class.ls", "packages/client-r26/src/game/fuse_client/42_Binary Manager Class.ls"]
timestamp: 2026-11-06T14:59:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T14:59:31+00:00"}
---

# Goal

`/reference/r26/mus.md` describes the `#mus` connection byte for byte
([0015](/decisions/0015-client-on-libreshockwave.md)), so that the server can serve photos without reading
LibreShockwave again.

# Steps

- [ ] Clone LibreShockwave at commit `3f9048009ff4bc9bf4bedb4a44f875c2ab36645b` into a scratch directory, never into
  the repository.
- [ ] From `cpp/src/player/xtra/queued_multiuser_bridge.cpp` and `socket_multiuser_bridge.cpp`: the frame header,
  the body fields in order, byte order, how strings are padded, and the `Logon` frame the client writes on connect,
  field by field.
- [ ] Every serialized Lingo value type (void, integer, symbol, string, media, float, list, point, rect, property
  list and any other), each with a worked example in bytes.
- [ ] What the server has to answer to the `Logon` frame, if anything, and what the player does with frames it
  cannot read.
- [ ] The messages on `#mus`, from [fuse_client](/reference/r26/fuse_client.md#the-mus-connection): `HELLO`,
  `LOGIN`, `BINDATA`, `GETBINDATA`, `BINDATA_SAVED`, `BINDATA_AUTHKEYERROR`, `DISCONNECT`, `U_RTS`, with
  the subject, the content's Lingo type and a worked frame for each. `hh_photo`'s `OK` and `FILM` are left to
  [s1-16](/tasks/s1-16-photo.md).
- [ ] The document follows the [protocol reference format](/reference/client-r26.md#protocol-reference-format) where
  it fits, names the LibreShockwave commit and files it comes from, and is listed in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
```

Each worked example is checked against the C++ it comes from.

# Notes

- Runs on the branch `s1-mus`.
- LibreShockwave is read only for the `#mus` framing; everything the Lingo says stays from the `.ls` scripts
  ([0008](/decisions/0008-reverse-engineer-ls-only.md)).
