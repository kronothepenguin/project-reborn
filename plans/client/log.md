# Log

## 2026-11-09

- **Decision** [0004](/decisions/0004-client-links-from-site-url.md): the client's links come from `site.url`, taken
  with the game server's S2 questions (`plans/server/decisions/0033-one-client-version-from-the-site.md`).

## 2026-11-07

- **Update** [C1](/phases/c1-client-page-on-libreshockwave.md) asks whether LibreShockwave runs the code behind the
  client's login key, which the decompiled scripts show only as `-- unk26`; without it the client never sends
  `GENERATEKEY`. Found by `plans/server/tasks/s1-02-entry-init.md`.

## 2026-11-06

- **Update** [C1](/phases/c1-client-page-on-libreshockwave.md)'s question on how LibreShockwave reaches the server's
  two WebSocket paths leaves its open questions: `plans/server/decisions/0020-info-and-mus-websocket-ports.md` gives
  `info` and `mus` a WebSocket listener each on a host and port of their own, with no path, which LibreShockwave
  opens from `connection.info.*` and `connection.mus.*`.
- **Update** [C1](/phases/c1-client-page-on-libreshockwave.md) asks how LibreShockwave reaches the server's two
  WebSocket paths, since it adds one path to every socket.
- **Update** [the rules](/rules.md#branches): once merged, the agent removes its worktree and deletes its branch
  (`plans/holo-port/decisions/0101-agents-clean-up-worktrees.md`).
- **Done** [c0-02](/tasks/c0-02-libreshockwave-submodule.md): LibreShockwave is a submodule at `vendor/LibreShockwave`,
  at `3f90480`, and [LibreShockwave](/reference/libreshockwave.md) describes it.
- **Start** [c0-02](/tasks/c0-02-libreshockwave-submodule.md).
- **Done** [c0-01](/tasks/c0-01-plan-bundle.md): the bundle passes its checks, and `plans/index.md`, the
  `tracking-plans` skill, holo-port's deferred client page and the server's S2 point at it.
- **Update** [C0](/phases/c0-foundations.md) is done; [C1](/phases/c1-client-page-on-libreshockwave.md),
  [C2](/phases/c2-client-files.md) and [C3](/phases/c3-javascript-client.md) are planned, each with its open
  questions.
- **Decision** [0003](/decisions/0003-libreshockwave-submodule.md): LibreShockwave is a submodule at
  `vendor/LibreShockwave`.
- **Decision** [0002](/decisions/0002-libreshockwave-first-then-javascript.md): LibreShockwave and the `.dcr` first, a
  vanilla JavaScript client later.
- **Decision** [0001](/decisions/0001-plan-in-plans-client.md): the client's plan lives in `plans/client`.
- **Start** [c0-01](/tasks/c0-01-plan-bundle.md).
- **Create** the bundle and [c0-01](/tasks/c0-01-plan-bundle.md), from the user's request to plan LibreShockwave in the
  CMS's client page on its own.
