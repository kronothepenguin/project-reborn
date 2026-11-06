---
type: Task
title: Write the encoding
description: packages/server/encoding reads and writes the values of the R26 wire format, B64, VL64, strings, booleans, bytes and raw bodies, tested against the client's own code.
status: done
phase: s0
depends_on: [s0-03, s1-01]
packages: [packages/server]
client: ["packages/client-r26/src/game/fuse_client/51_Connection Instance Class.ls", "packages/client-r26/src/game/fuse_client/37_String Services Class.ls"]
timestamp: 2026-11-06T17:29:58-05:00
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T17:29:58-05:00"}
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

Every value of [the wire format](/reference/client-r26.md#wire-format) has a reader and a writer that match the client
byte for byte ([0005](/decisions/0005-package-layout.md)).

# Steps

- [x] Read the `fuse_client` reference of [s1-01](/tasks/s1-01-fuse-client.md) and the old `io.go`
  (`git show 2ea51d7b^:packages/server/internal/protocol/io.go`).
- [x] B64 of 2 and 3 characters, VL64, strings that end with `chr(2)`, strings with a B64 length before them,
  booleans, bytes, and the raw rest of a body.
- [x] Reading never goes past the end of a body, and a malformed value is an error, never a panic.
- [x] Tests with values worked out from the client's scripts (`sendNew`, `GetIntFrom`, `GetStrFrom`): negative
  numbers, the largest VL64 of 6 characters, empty strings and UTF-8 text.
- [x] Fuzz tests show that no input makes a reader panic.
- [x] `packages/server/README.md` describes the encoding.

# Verification

```sh
cd packages/server && gofmt -l . && go vet ./... && go test ./encoding/... -race
```

Run on 2026-11-06: `gofmt -l .` lists nothing, `go vet ./...` reports nothing, and the tests pass:

```text
ok  	github.com/kronothepenguin/project-reborn/packages/server/encoding	1.240s
```

- `lingo_test.go` ports `sendNew`, `GetIntFrom`, `GetStrFrom`, `GetBoolFrom`, `GetByteFrom`, the id of `msghandler`,
  the length of `send`, and `encodeUTF8` and `decodeUTF8`, line for line in Lingo's 32-bit integers. The tests check
  each value both against the encoding and against these ports.
- `encoding_test.go`: VL64 from 0 to the largest Lingo integer, 2,147,483,647 (`73 7F 7F 7F 7F 5F`), and
  negative numbers down to −2,147,483,648; every B64 value of 1, 2 and 3 characters against the client's `#short`,
  message id, packet length and `GetByteFrom`; every byte as `GetBoolFrom` reads it; empty strings and UTF-8 text in
  both string forms, read back through the client's `decodeUTF8` and `GetStrFrom`; the malformed values, short
  reads and refused writes; a client's `GENERATEKEY` packet read value by value; and a message read by the ports.
- `fuzz_test.go`: `FuzzReaders` runs every reader on any bytes, through an `io.ByteReader` and through a plain
  `io.Reader`, and compares each value it reads with the client's port; `FuzzVL64` and `FuzzText` write and read back
  any number and any text. Fuzzed besides the seeds, 45 seconds each
  (`go test ./encoding -run '^$' -fuzz '^<target>$' -fuzztime 45s`): `FuzzReaders` 2,127,417 inputs, `FuzzVL64`
  9,284,641, `FuzzText` 2,634,666, all passing, with no panic.

# Notes

- Strings are UTF-8 ([0014](/decisions/0014-text-is-utf8.md)).

- Runs on the branch `s0`, once s1-01 has reached `main`.
- Text is checked both ways under [0014](/decisions/0014-text-is-utf8.md): a string or raw body that is not UTF-8
  is malformed when read and refused when written.
- A byte, which the client reads with `GetByteFrom`, is B64 of 1 character: `ReadB64(r, 1)` and `WriteB64(w, v, 1)`.
- For [s0-07](/tasks/s0-07-r26-sessions.md): a server message ends at the first `chr(1)`, so its body must hold none.
  The encoding checks each value against its own form only, so the framing checks the body.
- The client's `decodeUTF8` misreads two kinds of characters, found while porting it: those whose UTF-8 starts with
  the byte `E0`, U+0800 to U+0FFF (among them Thai and the Indic scripts), which it takes for 2-byte sequences, and
  those above U+FFFF, whose 4 bytes it reads as 3. The encoding writes UTF-8 as it is.
  [fuse_client](/reference/r26/fuse_client.md#text) says that it reads 1- to 3-byte sequences.
