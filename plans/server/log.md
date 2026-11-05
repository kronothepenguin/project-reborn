# Log

## 2026-11-05

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
