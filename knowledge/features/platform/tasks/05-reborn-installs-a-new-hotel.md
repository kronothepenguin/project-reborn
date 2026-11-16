---
type: Task
title: reborn installs a new hotel
description: Started in an empty folder, reborn serves the installer under /installer/ on the reborn defaults, redirects every other path there, moves to the address the administrator chooses, builds the hotel once the administrator exists, and answers 404 under /installer/ from then on.
scope: [packages/reborn, apps/reborn, packages/installer, apps/installer, packages/config]
depends_on: [17-hand-reborn-the-programs, 18-installer-inject-and-move-first]
skills: [applying-go-patterns, testing-behaviours, documenting-with-okf, use-modern-go]
---

# Goal

A new hotel is installed live in reborn, without a restart
([0004](/decisions/reborn/0004-the-installer-inside-reborn.md)). The behaviours of the spec:

- From an empty folder, reborn serves the installer at `/installer/` on `localhost:16416` and redirects every other path
  there. A new port in the config step moves the browser to it and closes the old one. After "Create administrator"
  the browser lands on the site at `/`, `/installer/` answers 404, housekeeping answers at `/housekeeping/` and the game
  on 30000 and 30001.
- An installed hotel runs under reborn: `/installer/` answers 404.

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md): reborn runs the programs its runner builds; the installer gets its listener
  through `Inject`, asks a host and a port only, and moves before it saves.
- [Inside reborn the installer lives under /installer/, moves the hotel to the address it is given, and goes once
  installed](/decisions/reborn/0004-the-installer-inside-reborn.md)
- `packages/installer/knowledge/steps.md`: `Inject`, `Installed`, `Done` and the one-address forms.
- In an empty folder the runner's `config.Get()` writes `config.json` with its defaults and `store.FromConfig()`
  creates the database, so every program is built before the hotel is installed.
- With host `0.0.0.0` or `::` on the same port, the installer calls `Move`: the move binds the new address while the
  old one is still held.
- A successful move redirects the browser to the same path, so it lands on `GET /installer/config`: the form at the
  new address, with the saved values, where "Save address" goes on to the site step.
- Saving a section leaves the result of `config.Get()` as it was until the program starts again: `Move` uses the host
  and the port it is given.
- `installer.New` opens its own handle on the database today (`setup.Open`), and `packages/config` has
  `Save(section string, value any)`, which task 18 added.
- The tests of `packages/reborn` share one hotel, started in `TestMain`, because `config.Get` loads `config.json`
  once a process. A habbo name is unique across its test files. A test from an empty folder runs the built program,
  or starts its hotel another way: say in the report how.

# Steps

- [ ] `installer.New(ctx, db, opts...)`: with a database the installer uses it and creates none; with `nil` it
  creates the database in its config step, as today. reborn's runner passes the database it opened, and the
  installer's two runners pass `nil`.
- [ ] `config.SaveReborn(r reborn.Reborn) error` replaces `config.Save(section string, value any)`, with its tests and
  its caller in the installer.
- [ ] `apps/reborn/cmd/reborn/main.go` calls `i.Inject(installer.Services{Listener: r})` after `reborn.New`, and ends
  with an error only when `Run` returns one: a Ctrl-C ends the program with status 0.
- [ ] A hotel that is not installed (`installer.Installed` is false): `Run` mounts the installer with the CMS and
  housekeeping, and a middleware redirects every path outside `/installer/` to `/installer/`. The game's listeners
  wait. This replaces the stopgap error of task 03.
- [ ] reborn's `Move`: listen on the new address (an error goes back to the form), serve the same handler there,
  redirect the browser to the same path on the new address (with `0.0.0.0` or `::`, keep the browser's host name), and
  shut the old server down right after the response.
- [ ] On `Done()`: the middleware lets the hotel through and answers 404 under `/installer/`, and the game's listeners
  start. Log where `config.json` and the database are.
- [ ] Installed at start: `/installer/` answers 404 from the first request.
- [ ] One test per behaviour of the goal, from an empty temporary folder, on free ports.
- [ ] Update `packages/reborn/knowledge`.

# Checks

```sh
make -C packages/reborn check
make -C apps/reborn check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/reborn`, `apps/reborn`.
