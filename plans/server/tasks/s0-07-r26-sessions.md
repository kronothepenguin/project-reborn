---
type: Task
title: Serve R26 sessions
description: The server runs a WebSocket listener on the host and port of server.info and of server.mus, and on info r26 frames packets, sends HELLO, dispatches packets by id and logs the ones it does not handle yet.
status: done
phase: s0
depends_on: [s0-04, s0-05, s0-06, s1-02]
packages: [packages/server, apps/server]
client: ["packages/client-r26/src/game/fuse_client/51_Connection Instance Class.ls", "packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls"]
timestamp: 2026-11-07T00:49:13+00:00
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:49:13+00:00"}
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

An R26 client that connects to the `info` WebSocket listener receives `HELLO`, and every packet it sends is read,
dispatched by id, and logged when nothing handles it yet ([0020](/decisions/0020-info-and-mus-websocket-ports.md)).

# Steps

- [x] Ask the user S0's open questions for this task, and record the answers as decisions: what the server logs for
  each packet ([0021](/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md)); how the runner, which
  belongs to the user, starts the listeners ([0022](/decisions/0022-start-info-and-start-mus.md)); and what the `mus`
  listener does before [S7](/phases/s7-club-help-extras.md) ([0023](/decisions/0023-mus-listener-before-s7.md)).
- [x] `StartInfo` and `StartMus`, methods of the `Server` of `packages/server`, each open a WebSocket listener, the
  transport's `WebSocket` handler, on the host and port of `server.info` or `server.mus`
  ([0020](/decisions/0020-info-and-mus-websocket-ports.md)), return an error when they cannot listen, and then serve
  in the background ([0022](/decisions/0022-start-info-and-start-mus.md)); `info` speaks r26.
- [x] `apps/server/cmd/server/main.go` calls both after `c := server.New(db)`, with exactly the lines of
  [0022](/decisions/0022-start-info-and-start-mus.md), and nothing else under `apps/**/cmd/**` changes.
- [x] `r26` reads a packet (3 B64 characters of length, 2 of id, the body), writes one (2 B64 characters of id, the
  body, `chr(1)`) and refuses a body that holds `chr(1)`, which only the framing can check
  ([s0-06](/tasks/s0-06-encoding.md)), sends `HELLO` when a client connects, and runs the handler registered for an
  id.
- [x] `r26` knows the names of the commands of [s1-02](/tasks/s1-02-entry-init.md)'s document. A packet with no
  handler is logged as one line, with the session's address, the id, the name when `r26` knows it and the body's
  size, never the body ([0021](/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md)), and the session
  goes on.
- [x] Each session reads and handles its packets in order in its own goroutine, and sessions never wait on each
  other, unlike the old registry ([The old server](/reference/old-server.md#problems-found-while-planning)).
- [x] The `mus` listener accepts the WebSocket, logs the connect, the size of each message and the close, and never
  answers ([0023](/decisions/0023-mus-listener-before-s7.md)).
- [x] A Go test client, for tests only, speaks R26 over WebSocket.
- [x] Tests: on the `info` listener the test client receives `HELLO`, sends `INIT_CRYPTO`, and the log names it
  without the body; a malformed length closes that session only; the `mus` listener logs what it receives and
  answers nothing; `StartInfo` and `StartMus` return an error when they cannot listen.
- [x] `packages/server/README.md` describes how a connection goes.

# Verification

```sh
cd packages/server && gofmt -l . && go vet ./... && go test ./... -race
make gates
```

Run on 2026-11-07: `gofmt -l .` lists nothing, `go vet ./...` reports nothing, and the tests pass:

```text
ok  	github.com/kronothepenguin/project-reborn/packages/server	1.230s
ok  	github.com/kronothepenguin/project-reborn/packages/server/encoding	1.282s
ok  	github.com/kronothepenguin/project-reborn/packages/server/r26	1.019s
ok  	github.com/kronothepenguin/project-reborn/packages/server/transport	1.028s
```

- `server_test.go` starts both listeners with `StartInfo` and `StartMus`, on free ports of a `config.json` of its own,
  and reaches them with the test client of `client_test.go`, which speaks R26 over a WebSocket.
  `TestInfoSendsHelloAndLogsInitCryptoByName` is S0's exit criterion: the client receives `HELLO`, `@@` and the
  character 1, sends `INIT_CRYPTO`, and the log holds `r26 <address> unhandled INIT_CRYPTO (206), 0 bytes`.
  `TestInfoReadsPacketsWhateverTheFrames` sends two packets in one frame and one over two frames, logged in order;
  `TestInfoNeverLogsABody` sends `TRY_LOGIN` and `SSO`, logged by name and size, and no line holds the password or the
  ticket; in `TestInfoClosesOnlyTheSessionWithAMalformedLength`, `@@A` closes that client's WebSocket and is logged,
  while another session's `INIT_CRYPTO` is still logged; `TestMusLogsWhatItReceivesAndNeverAnswers` sees `connected`,
  `received 11 bytes`, `received 1 byte`, nothing to read for 200 ms, then `closed`; and
  `TestStartReturnsAnErrorWhenItCannotListen` starts both again on their ports in use.
- `r26/packet_test.go` reads the handshake's commands and writes its messages byte for byte as
  [hh_entry_init](/reference/r26/hh_entry_init.md#the-handshake-in-bytes) computed them, refuses a length below 2, a
  body that holds the character 1 and an id beyond 2 B64 characters, and checks that a message goes out in one write.
  `r26/r26_test.go` runs sessions over pipes: `HELLO` first; the handlers run in order; an unhandled packet is logged
  and the session goes on; no body reaches the log; a session goes on while another one's handler blocks; a client
  that closes, or writes its byte 0, ends its session with no log line; and a malformed length, or a packet cut short,
  closes the session with one.
- Broken on purpose, each restored after: without `HELLO`, 13 tests fail; with the body in the log line,
  `TestInfoNeverLogsABody` and `TestServeNeverLogsABody` fail, with every test that waits for an exact line; with a
  length of 1 accepted, `readPacket` panics and both malformed-length tests fail; without the check of the byte 0, the
  session waits for a packet and `TestServeEndsQuietlyWhenTheClientLeaves/with_the_byte_0` fails; with a body holding
  the character 1 accepted, its test fails; with one lock around every session's dispatch, as the old registry held,
  `TestSessionsDoNotWaitOnEachOther` fails; with a `mus` listener that echoes,
  `TestMusLogsWhatItReceivesAndNeverAnswers` fails; and with a failed listen returning nil,
  `TestStartReturnsAnErrorWhenItCannotListen` fails.
- The runner, built from `apps/server` into the scratchpad and run there with a `config.json` of free ports, logged
  `INFO server: info on ws://127.0.0.1:43993`, `INFO server: mus on ws://127.0.0.1:38495` and
  `server on http://localhost:15445`. A WebSocket client written for the check received `HELLO` as one binary frame,
  `@@` and the character 1. Its `INIT_CRYPTO`, `TRY_LOGIN` and `SSO` were logged as
  `INFO r26 127.0.0.1:35350 unhandled INIT_CRYPTO (206), 0 bytes`, `… unhandled TRY_LOGIN (756), 16 bytes` and
  `… unhandled SSO (204), 16 bytes`, and its byte 0 ended the session with no line. On `mus` the log shows
  `connected`, `received 11 bytes` and `closed`, and nothing came back.
- `make gates` passes on the branch: `gofmt`, `go vet` and `go test -race` in the 15 Go modules (26 packages with
  tests, `packages/server` and `packages/server/r26` among them), the components' tests and `svelte-check`,
  `sqlc generate` with no diff, and `check-docs`.

# Notes

- Runs on the branch `s0`.
- Choices no decision makes, each following what the repository already does:
  - The server logs through the default logger of `log/slog`, as `packages/cms`, `packages/scheduler` and
    `packages/virtual/settings` do: the lines of 0021 and 0023 and where each listener listens at Info, and an error
    that ends a session at Warn.
  - A malformed length ends its session, as the steps say, and is logged once, as the scheduler logs a task that
    failed. Nothing else happens to that client.
  - `StartInfo` and `StartMus` read `config.json` with `config.Load`, as `cms.New` reads it with `config.Get`, and
    return its error instead of panicking. Each logs where it listens, as each runner prints its address.
- There is no shutdown: [0022](/decisions/0022-start-info-and-start-mus.md) defines none, and the listeners serve until
  the process ends. That `http.Server.Shutdown` leaves hijacked WebSockets open ([s0-05](/tasks/s0-05-transport.md))
  matters once something stops the server, such as the orchestrator: it must close the sessions too.
- A panic in a session's goroutine ends only that session: `net/http` recovers it and logs it, and the transport's
  deferred `Close` closes the connection. Over TCP, which no listener serves until a decision brings it back
  ([0020](/decisions/0020-info-and-mus-websocket-ports.md)), a panic would end the process.
- The handlers are a map from command id to `func(*session, []byte)`, empty until [S2](/phases/s2-login.md), which
  writes the first ones and settles what a handler's failure does.
- The client writes one byte 0 before every disconnect (`fuse_client/51_Connection Instance Class.ls`, `disconnect`),
  so a session takes a 0 where a packet would start as the client leaving.
- The transport hides the WebSocket's frames ([0006](/decisions/0006-transport.md)), so the `mus` listener logs as
  "each message's size" what each read brings. A read never spans two frames of `golang.org/x/net/websocket`, but a
  large frame may come in several reads.
- `r26` names the commands of [s1-02](/tasks/s1-02-entry-init.md)'s document. 228 is also `hh_tutorial`'s
  `GET_ACCOUNT_PREFERENCES` ([s1-14](/tasks/s1-14-tutorial.md)); the log names it `GET_SOUND_SETTING` until then.
