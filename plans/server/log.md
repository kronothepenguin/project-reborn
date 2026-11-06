# Log

## 2026-11-06

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
