---
type: Task
title: Write the encoding
description: packages/server/encoding reads and writes the values of the R26 wire format, B64, VL64, strings, booleans, bytes and raw bodies, tested against the client's own code.
status: todo
phase: s0
depends_on: [s0-03, s1-01]
packages: [packages/server]
client: ["packages/client-r26/src/game/fuse_client/51_Connection Instance Class.ls"]
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

Every value of [the wire format](/reference/client-r26.md#wire-format) has a reader and a writer that match the client
byte for byte ([0005](/decisions/0005-package-layout.md)).

# Steps

- [ ] Read the `fuse_client` reference of [s1-01](/tasks/s1-01-fuse-client.md) and the old `io.go`
  (`git show 2ea51d7b^:packages/server/internal/protocol/io.go`).
- [ ] B64 of 2 and 3 characters, VL64, strings that end with `chr(2)`, strings with a B64 length before them,
  booleans, bytes, and the raw rest of a body.
- [ ] Reading never goes past the end of a body, and a malformed value is an error, never a panic.
- [ ] Tests with values worked out from the client's scripts (`sendNew`, `GetIntFrom`, `GetStrFrom`): negative
  numbers, the largest VL64 of 6 characters, empty strings and UTF-8 text.
- [ ] Fuzz tests show that no input makes a reader panic.
- [ ] `packages/server/README.md` describes the encoding.

# Verification

```sh
cd packages/server && gofmt -l . && go vet ./... && go test ./encoding/... -race
```

# Notes

- Open question, asked when the task starts: whether the server speaks UTF-8 text, with `client.textdata.utf8`
  set in the external variables the site serves, or one byte per character of a locale such as Windows-1252
  ([fuse_client](/reference/r26/fuse_client.md#text)).

- Runs on the branch `s0`, once s1-01 has reached `main`.
