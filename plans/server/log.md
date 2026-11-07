# Log

## 2026-11-07

- **Create** [s0-11](/tasks/s0-11-names-the-go-tool-treats-specially.md): `internal`, `vendor` and `testdata` compile
  as Go package names but not as folders: the runners may not import `packages/internal`, the go tool reads
  `packages/vendor` as vendored code, and `./...` skips folders named `testdata`, which fails a backend's gates. What
  `tools/create` does with them is a new open question of [S0](/phases/s0-foundations.md). Found by s0-10.
- **Done** [s0-10](/tasks/s0-10-go-names-that-clash.md): `validateName` refuses, for the backend and fullstack
  templates, a name whose Go package would be a Go keyword, `main`, `init`, or one of the 5 names the backend's Go
  uses or the 15 the fullstack's does, derived from the templates and tested; of 218 names tried in a throwaway
  worktree, none it refuses compiles, and every one it accepts compiles but `internal`, `vendor` and `testdata`.
- **Start** [s0-10](/tasks/s0-10-go-names-that-clash.md).
- **Update** [s0-10](/tasks/s0-10-go-names-that-clash.md)'s question is answered by 0025, and
  [S0](/phases/s0-foundations.md) has no open questions left.
- **Decision** [0025](/decisions/0025-refuse-names-whose-go-package-cannot-compile.md): `validateName` refuses, with a
  plain message, a name whose Go package name cannot compile in the template being made: `main`, a Go keyword, or a
  name the template's own Go already uses; every generated project stays as it is. Answers
  [s0-10](/tasks/s0-10-go-names-that-clash.md)'s question.
- **Blocked** [s0-08](/tasks/s0-08-exit-check.md): every exit criterion of [S0](/phases/s0-foundations.md) passes on
  `main`, from `make install` and `make gates` in a fresh worktree to one project of each template, and
  [How the server is built](/reference/architecture.md) matches the code; S0 can be `done` only once
  [s0-10](/tasks/s0-10-go-names-that-clash.md), which waits for the user's answer, is.
- **Start** [s0-08](/tasks/s0-08-exit-check.md).
- **Done** [s0-07](/tasks/s0-07-r26-sessions.md): `StartInfo` and `StartMus` start a WebSocket listener on the host
  and port of `server.info` and `server.mus`, and the runner calls both. On `info`, `r26` sends `HELLO`, reads packets
  in each session's own goroutine and logs each unhandled one as `r26 <address> unhandled INIT_CRYPTO (206), 0 bytes`;
  on `mus`, the server logs the connect, each size and the close, and never answers.
- **Start** [s0-07](/tasks/s0-07-r26-sessions.md).
- **Create** [s0-10](/tasks/s0-10-go-names-that-clash.md): names whose Go package name is a Go keyword or `main`, or
  a name the generated Go already uses, such as `log`, `http`, `db` or `new`, still make projects that do not compile;
  what `tools/create` does with them is a new open question of [S0](/phases/s0-foundations.md). Found by s0-09.
- **Done** [s0-09](/tasks/s0-09-go-template-names.md): the Go package of `game-server` is `gameserver` while its
  folders and module paths keep the dash, and `create` runs the Go it writes through `go/format`, so the imports are in
  order for any name; projects of both Go templates named `tracker`, `tracker2`, `web-shop` and `game-server` pass
  their gates.
- **Start** [s0-09](/tasks/s0-09-go-template-names.md).
- **Update** [S2](/phases/s2-login.md) asks whether the server waits for `GENERATEKEY` (2002) before it sends
  `ENDOFCRYPTOPARAMS` (278): the client withholds `GENERATEKEY` in some cases, while its handler of 278 checks
  nothing. Found by [s1-02](/tasks/s1-02-entry-init.md); `plans/client`'s C1 asks whether LibreShockwave runs the key
  code at all.
- **Update** [s0-07](/tasks/s0-07-r26-sessions.md)'s steps follow 0021 to 0023,
  [s0-09](/tasks/s0-09-go-template-names.md)'s question is answered by 0024, and [S0](/phases/s0-foundations.md) has
  no open questions left.
- **Decision** [0024](/decisions/0024-go-package-names-drop-the-dash.md): the Go package of a backend or fullstack
  project is its name without the dashes, and folders and module paths keep them. Answers
  [s0-09](/tasks/s0-09-go-template-names.md)'s question.
- **Decision** [0023](/decisions/0023-mus-listener-before-s7.md): until S7 frames MUS, the `mus` listener accepts the
  WebSocket, logs the connect, the size of each message and the close, and never answers. Answers
  [s0-07](/tasks/s0-07-r26-sessions.md)'s question.
- **Decision** [0022](/decisions/0022-start-info-and-start-mus.md): `StartInfo` and `StartMus` of `packages/server`
  start the listeners, for the standalone runner and later the orchestrator; the runner gains the two calls and
  nothing else. Answers [s0-07](/tasks/s0-07-r26-sessions.md)'s question.
- **Decision** [0021](/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md): a packet the server does not
  handle yet is logged as one line with the session's address, the id, the name and the body's size, never the body.
  Answers [s0-07](/tasks/s0-07-r26-sessions.md)'s question.

## 2026-11-06

- **Done** [s1-02](/tasks/s1-02-entry-init.md): [hh_entry_init](/reference/r26/hh_entry_init.md) maps 26 messages
  and 22 commands, as registered, and confirms 0012's handshake step by step, with its bytes. 308 has a second reader
  in `hh_tutorial`, asked for with the same id 228, and what the session parameters carry is a new open question of
  [S2](/phases/s2-login.md).
- **Start** [s1-02](/tasks/s1-02-entry-init.md).
- **Done** [s0-04](/tasks/s0-04-listener-config.md): `config.json` gives `server.info` and `server.mus` a host and a
  port each, by default `localhost` with 30000 and 30001, checked as `cms.host` and refused on one port; the installer
  writes their defaults, and housekeeping offers them to an older `config.json`.
- **Start** [s0-04](/tasks/s0-04-listener-config.md).
- **Update** [S0](/phases/s0-foundations.md), [s0-04](/tasks/s0-04-listener-config.md),
  [s0-07](/tasks/s0-07-r26-sessions.md), [s0-08](/tasks/s0-08-exit-check.md) and
  [How the server is built](/reference/architecture.md) follow 0020: a WebSocket listener on a host and port per
  connection, the exit criterion on WebSocket only, and s0-07 also asks what the `mus` listener does before S7.
- **Decision** [0020](/decisions/0020-info-and-mus-websocket-ports.md): `server.info` and `server.mus` are a host and a
  port each, and the server runs a WebSocket listener on each, which LibreShockwave opens; TCP and WebSocket paths
  wait for later. It supersedes 0019 and answers [s0-04](/tasks/s0-04-listener-config.md)'s question.
- **Done** [s0-06](/tasks/s0-06-encoding.md): `packages/server/encoding` reads and writes B64, VL64, both string
  forms, booleans, bytes and raw bodies byte for byte as ports of the client's scripts do, with UTF-8 text, and fuzzing
  finds no input that makes a reader panic.
- **Start** [s0-06](/tasks/s0-06-encoding.md).
- **Done** [s0-05](/tasks/s0-05-transport.md): `packages/server/transport` serves TCP with `ServeTCP(l, h)` and
  the WebSocket with the `http.Handler` `WebSocket(h)`, both as one `Conn` that closes when its handler returns; the
  WebSocket writes binary frames and reads binary and text frames.
- **Start** [s0-05](/tasks/s0-05-transport.md).
- **Update** [s0-04](/tasks/s0-04-listener-config.md)'s steps follow 0019, and its question leaves
  [S0](/phases/s0-foundations.md)'s open questions.
- **Decision** [0019](/decisions/0019-info-and-mus-listeners.md): the server listens as `server.info` and
  `server.mus`, each on a TCP port, a WebSocket path or both; it supersedes 0007.
- **Done** [s0-03](/tasks/s0-03-scaffold-server.md): `make create name=server template=backend` made
  `packages/server` and `apps/server`, which build and pass the gates as generated, and the package's README lays out
  `transport`, `encoding`, `r26` and `game` as [0005](/decisions/0005-package-layout.md) says, each with the task that
  brings it.
- **Start** [s0-03](/tasks/s0-03-scaffold-server.md).
- **Done** [s0-02](/tasks/s0-02-create-templates.md): `tools/create -template=fullstack|backend|client` makes today's
  projects byte for byte, Go-only backends and plain Vite clients, and a project of each kind passes its gates.
- **Create** [s0-09](/tasks/s0-09-go-template-names.md): the Go templates fail for a name with a `-`, and `gofmt`
  reorders the imports of a name that sorts after `store`. Found by s0-02.
- **Decision** [0018](/decisions/0018-client-is-a-plain-vite-app.md): a client project builds as a plain Vite app,
  `dist/index.html` and its script, with only the port in `vite.config.js`. Answers
  [s0-02](/tasks/s0-02-create-templates.md)'s question and unblocks it.
- **Blocked** [s0-02](/tasks/s0-02-create-templates.md): the fullstack, backend and client templates are written and
  tested, but a client project's `pnpm build` fails: client-r26's library build needs a global name, `_director`
  there. How a client builds is asked to the user.
- **Decision** [0017](/decisions/0017-client-vite-port.md): the client template derives its Vite port from the
  name, in 30000 to 39999 of its own; `client-r18` gets 30050. Answers [s0-02](/tasks/s0-02-create-templates.md)'s
  question.
- **Start** [s0-02](/tasks/s0-02-create-templates.md).
- **Update** [the rules](/rules.md#branches): once merged, the agent removes its worktree and deletes its branch
  (`plans/holo-port/decisions/0101-agents-clean-up-worktrees.md`).
- **Update** [s1-24](/tasks/s1-24-mus-framing.md) reads LibreShockwave in the submodule `vendor/LibreShockwave`
  (`plans/client/decisions/0003-libreshockwave-submodule.md`), and [S2](/phases/s2-login.md)'s question about the
  `/client` page points at `plans/client`, phase C1.
- **Update** [The Holograph Emulator](/reference/holoemu.md) describes `source/holoemu`: its layout, its dumps and how
  to read it, and [the rules](/rules.md) gain "Reading the emulator".
- **Decision** [0016](/decisions/0016-holoemu-is-a-reference.md): the Holograph Emulator is a reference, read when the
  client's `.ls` scripts are not enough, and never a port.

- **Create** [s1-24](/tasks/s1-24-mus-framing.md): the MUS framing of `#mus`, from LibreShockwave's Multiuser Xtra.
- **Decision** [0015](/decisions/0015-client-on-libreshockwave.md): the client runs on LibreShockwave, every socket is
  a WebSocket, and the `#mus` framing comes from LibreShockwave's source. Answers s0-05's question (binary frames) and
  S7's question on the `#mus` format.
- **Decision** [0014](/decisions/0014-text-is-utf8.md): text on the wire is UTF-8. Answers s0-06's question.

## 2026-11-05

- **Done** [s1-01](/tasks/s1-01-fuse-client.md): [fuse_client](/reference/r26/fuse_client.md) describes the
  connections, framing and values with worked examples. Text is UTF-8 only when `client.textdata.utf8` is on, a new
  open question of [s0-06](/tasks/s0-06-encoding.md). The `#mus` byte format is the Multiuser Xtra's, in no `.ls`
  script: an open question for S7.
- **Start** [s1-01](/tasks/s1-01-fuse-client.md).
- **Done** [s0-01](/tasks/s0-01-plan-bundle.md): the bundle, the `tracking-plans` skill and the `.claude/skills` link
  exist, and the bundle passes its checks.
- **Create** [s0-02](/tasks/s0-02-create-templates.md) to [s0-08](/tasks/s0-08-exit-check.md), S0's tasks, and
  [s1-01](/tasks/s1-01-fuse-client.md) to [s1-23](/tasks/s1-23-exit-check.md), S1's tasks.
- **Update** [S0](/phases/s0-foundations.md) and [S1](/phases/s1-protocol-reference.md) are active; S2 to S9 are
  planned, each with its open questions.
- **Decision** [0013](/decisions/0013-site-changes-like-mus.md): changes from the site reach the server like Holo's MUS
  commands, and under the orchestrator the CMS and housekeeping change the virtual state directly.
- **Decision** [0012](/decisions/0012-no-encryption.md): the server skips the client's encryption.
- **Decision** [0011](/decisions/0011-saved-and-memory-only-data.md): what the server saves and what lives only in
  memory.
- **Decision** [0010](/decisions/0010-hot-data-written-at-once.md): a change to hot data reaches the database at once.
- **Decision** [0009](/decisions/0009-virtual-holds-the-server-state.md): `packages/virtual` holds the hot data,
  loaded when needed and dropped when unused, and the temporary data.
- **Decision** [0008](/decisions/0008-reverse-engineer-ls-only.md): the R26 protocol comes from the client's `.ls`
  scripts.
- **Decision** [0007](/decisions/0007-protocols-per-listener.md): `r26` is the protocol package, each listener names
  its protocol, and r18 is a door left open.
- **Decision** [0006](/decisions/0006-transport.md): TCP and WebSocket are one byte-stream `Conn`, and the WebSocket
  mounts on any HTTP mux.
- **Decision** [0005](/decisions/0005-package-layout.md): the server lives in `packages/server`, and `virtual` holds
  only state.
- **Decision** [0004](/decisions/0004-old-server-is-the-model.md): the server deleted in `2ea51d7b` is the model for
  the structure.
- **Decision** [0003](/decisions/0003-create-templates.md): `tools/create` makes fullstack, backend and client projects.
- **Decision** [0002](/decisions/0002-server-app.md): the game server is `packages/server` and `apps/server`, with no
  web pages.
- **Decision** [0001](/decisions/0001-plan-in-plans-server.md): the plan lives in `plans/server`, worked through the
  `tracking-plans` skill.
- **Start** [s0-01](/tasks/s0-01-plan-bundle.md).
- **Create** the bundle and [s0-01](/tasks/s0-01-plan-bundle.md), from the user's request for a game server plan in the
  format of `plans/holo-port`.
