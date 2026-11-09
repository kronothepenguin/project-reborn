---
type: Task
title: Describe the MUS framing of the #mus connection
description: Write /reference/r26/mus.md from LibreShockwave's Multiuser Xtra: the bytes of a MUS frame, the Logon frame, the serialized Lingo values, and the messages fuse_client and hh_photo exchange on #mus.
status: done
phase: s1
depends_on: [s1-01]
packages: []
client: ["packages/client-r26/src/game/fuse_client/52_Multiuser Instance Class.ls", "packages/client-r26/src/game/fuse_client/42_Binary Manager Class.ls"]
timestamp: 2026-11-09T19:19:11+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T14:59:31+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T19:19:11+00:00"}
---

# Goal

`/reference/r26/mus.md` describes the `#mus` connection byte for byte
([0015](/decisions/0015-client-on-libreshockwave.md)), so that the server can serve photos without reading
LibreShockwave again.

# Steps

- [x] Read LibreShockwave in `vendor/LibreShockwave`, the submodule at commit `3f9048009ff4bc9bf4bedb4a44f875c2ab36645b`
  (`plans/client/decisions/0003-libreshockwave-submodule.md`), after `git submodule update --init vendor/LibreShockwave`
  in the task's worktree.
- [x] From `cpp/src/player/xtra/queued_multiuser_bridge.cpp` and `socket_multiuser_bridge.cpp`: the frame header,
  the body fields in order, byte order, how strings are padded, and the `Logon` frame the client writes on connect,
  field by field.
- [x] Every serialized Lingo value type (void, integer, symbol, string, media, float, list, point, rect, property
  list and any other), each with a worked example in bytes.
- [x] What the server has to answer to the `Logon` frame, if anything, and what the player does with frames it
  cannot read.
- [x] The messages on `#mus`, from [fuse_client](/reference/r26/fuse_client.md#the-mus-connection): `HELLO`,
  `LOGIN`, `BINDATA`, `GETBINDATA`, `BINDATA_SAVED`, `BINDATA_AUTHKEYERROR`, `DISCONNECT`, `U_RTS`, with
  the subject, the content's Lingo type and a worked frame for each. `hh_photo`'s `OK` and `FILM` are left to
  [s1-16](/tasks/s1-16-photo.md).
- [x] The document follows the [protocol reference format](/reference/client-r26.md#protocol-reference-format) where
  it fits, names the LibreShockwave commit and files it comes from, and is listed in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
```

Each worked example is checked against the C++ it comes from.

Results:

- The bundle check: 84 concepts, 0 problems.
- A probe compiled with `g++ -std=c++20` from LibreShockwave's `queued_multiuser_bridge.cpp`, `datum.cpp` and the
  three bitmap sources it needs, at commit `3f904800`, wrote the Logon frame and the client's `LOGIN`, `GETBINDATA`,
  `PHOTOTXT`, `BINDATA` and closing frames. A Python encoder written from the document built the same five frames,
  byte for byte the same.
- The probe read back, through `deliverMessageBytes`, the server's `HELLO`, `BINDATA_SAVED`, `BINDATA_AUTHKEYERROR`
  and photo frames as the values the document shows, and one frame of each of the 12 value types. It also confirmed
  that a second frame in one message is lost, that a cut-short frame and a `Logon` reply are dropped, that a body too
  short for its fields gives error −5, and that an int content arrives as an int.

The two bridges, the Multiuser Xtra, the wasm bridge and the browser worker were read for the transport, with
`fuse_client`'s Multiuser Instance and Binary Manager for what the client does with each message.

# Notes

- Runs on the branch `s1-mus`.
- LibreShockwave is read only for the `#mus` framing; everything the Lingo says stays from the `.ls` scripts
  ([0008](/decisions/0008-reverse-engineer-ls-only.md)).
