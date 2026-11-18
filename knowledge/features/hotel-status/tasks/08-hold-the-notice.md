---
type: Task
title: Hold each connection five seconds after the closing notice
description: When the game stops, each connection stays open for 5 seconds after message 292 so the client shows its notice, and every caller of Stop waits long enough.
scope: [packages/server]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

The behaviour of the [spec](/features/hotel-status/spec.md): the game is stopped with habbos inside: each connection
stays open for 5 seconds after the notice, so the client shows it, then closes.

# Context

- [Spec](/features/hotel-status/spec.md)
- [Plan](/features/hotel-status/plan.md)
- `packages/server/server.go`, `Stop`; `packages/server/internal/r26`, where a session answers the closing context
  with 292; `packages/server/knowledge/connection.md`, "The doors".
- `packages/server/api/api.go`: its calls end after 2 seconds, and `Stop` now takes longer.
- The screenshot of an 8-second hold, for what the client shows:
  `/tmp/claude-1000/-mnt-media-Projects-habbo/5838a8a3-d542-499e-90bf-949c857d87fb/scratchpad/hotel-status-01/stop-with-8s-hold-notice.png`.

# Steps

- [ ] On a stop the doors close and each habbo is logged out at once; each connection closes 5 seconds after its
  notice, and reads nothing meanwhile. All sessions wait together, so `Stop` takes about 5 seconds whatever their
  number, and nothing when nobody is inside.
- [ ] The `/api/` client's `Stop` waits 15 seconds; its other calls keep their 2.
- [ ] One test of the behaviour, with the hold shortened through an unexported variable of the package.
- [ ] Update `packages/server/knowledge/connection.md`.

# Checks

```sh
make -C packages/server check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/server`.
