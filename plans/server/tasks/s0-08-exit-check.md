---
type: Task
title: Check S0's exit criteria
description: From a clean checkout of the merged work, check every exit criterion of S0, bring the reference up to date and close the phase.
status: blocked
phase: s0
depends_on: [s0-01, s0-02, s0-03, s0-04, s0-05, s0-06, s0-07]
packages: [packages/server, apps/server, tools/create]
client: []
timestamp: 2026-11-07T02:40:24+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

S0 meets its [exit criteria](/phases/s0-foundations.md#exit-criteria) on `main`.

# Steps

- [x] In a fresh worktree of `main` merged into `s0`: `make install` and `make gates`.
- [x] The test client receives `HELLO` and its `INIT_CRYPTO` is logged by name, on the `info` WebSocket listener.
- [x] One project of each template passes its gates, in a throwaway worktree.
- [x] [How the server is built](/reference/architecture.md) matches the code.
- [ ] S0 is `done`; `/index.md` names the active phases.

# Verification

```sh
make install && make gates
cd packages/server && go test ./... -race -v
```

Run on 2026-11-07 in the throwaway worktree `s0-exit`, made from `main` at `c01d3ec7`, the merge of `s0` with s0-07
and s0-09:

- `make install` exits 0, and `git status` stays clean after it.
- `make gates` exits 0: `gofmt`, `go vet` and `go test -race` in the 15 Go modules (26 packages with tests), the
  components' tests and `svelte-check`, `sqlc generate` with no diff, and `check-docs`.
- `go test ./... -race -v` in `packages/server` passes the 6 tests of the listeners, the 18 of `encoding`, the 15 of
  `r26` and the 8 of `transport`.

S0's [exit criteria](/phases/s0-foundations.md#exit-criteria), one by one:

- Every gate passes: `make gates` above.
- The Go test client of `packages/server/client_test.go` connects to the `info` WebSocket listener that `StartInfo`
  opens, receives `HELLO`, sends `INIT_CRYPTO`, and the server logs
  `r26 127.0.0.1:<port> unhandled INIT_CRYPTO (206), 0 bytes`: `TestInfoSendsHelloAndLogsInitCryptoByName` passes.
  TCP is tested at the transport level, where `TestServeTCPReturnsNilOnceTheListenerCloses`,
  `TestServeTCPReturnsAFailedAccept` and the TCP runs of the `Conn` tests pass.
- The encoding reads and writes every value form of [the wire format](/reference/client-r26.md#wire-format), with
  cases worked out from the client's scripts: `TestVL64`, `TestReadVL64ReadsAsGetIntFrom`,
  `TestB64MatchesTheClientForEveryValue`, `TestBool`, `TestString`, `TestB64String`, `TestRaw`,
  `TestACommandReadValueByValue`, `TestAMessageReadByTheClient` and the seeds of the three fuzz targets pass.
- `tools/create` makes a project of each template that passes the gates: in `s0-exit`, `make create name=exitfull`,
  `make create name=exitback template=backend` and `make create name=exit-client template=client` exit 0; `gofmt -l`
  lists nothing, and `go vet ./...` and `go test ./... -race` pass, in `packages/exitfull`, `apps/exitfull`,
  `packages/exitback` and `apps/exitback`; and `pnpm build` in `packages/exit-client` writes `dist/index.html` and
  `dist/assets/index-BYhCLo9y.js`. The worktree and its branch were then removed.
- [How the server is built](/reference/architecture.md) names `StartInfo` and `StartMus`, the dispatch by id, the log of
  unhandled packets and the `mus` listener before S7, and says what the package holds so far.

# Notes

- Runs on the branch `s0`, and ends it: the branch is merged as [Branches](/rules.md#branches) says.
- Blocked on 2026-11-07: every exit criterion passes on `main`, but S0 is `done` only once every task of the phase is,
  and [s0-10](/tasks/s0-10-go-names-that-clash.md), which s0-09 found, waits for the user's answer to S0's open
  question: what `tools/create` does with a name whose Go package name is a Go keyword, `main`, or a name the generated
  Go already uses. Once s0-10 is done, the last step sets S0 to `done` and updates the active phases of `/index.md`.
- Still blocked on 2026-11-07, once s0-10 was done: s0-10 found
  [s0-11](/tasks/s0-11-names-the-go-tool-treats-specially.md), which waits for the user's answer to S0's new open
  question, what `tools/create` does with `internal`, `vendor` and `testdata`. Once s0-11 is done, the exit criteria are
  checked again on the merged state, and the last step sets S0 to `done` and updates the active phases of `/index.md`.
  s0-10's throwaway worktree made a backend, a fullstack and a client project that pass the checks of the gates.
