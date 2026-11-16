---
type: Task
title: Run an installed hotel in reborn
description: packages/reborn runs the CMS, housekeeping and the game server of an installed hotel in one process, on one mux and one database handle, on the reborn section's address; apps/reborn is scaffolded and its main.go is proposed to the user.
scope: [packages/reborn, apps/reborn, go.work, Makefile]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, documenting-with-okf, use-modern-go]
---

# Goal

`reborn`, started in the folder of an installed hotel, serves the site at `/`, housekeeping at `/housekeeping/` and
the game on its two WebSocket ports ([0003](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)). The
behaviour of the spec:

- reborn starts in the folder of an installed hotel: the site answers at `/`, housekeeping at `/housekeeping/` and the
  game on its two ports, on the address of the `reborn` section.

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- [Go layout](/go-layout.md): the playbook of `applying-go-patterns`.
- [reborn runs the hotel in one process, and the separate programs
  stay](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)
- `config.Reborn.Host` and `Port` hold reborn's address, `localhost` and 16416 by default
  (`packages/config/knowledge/declared-keys.md`).
- `go.work` and the root `Makefile` are [shared files](/shared-files.md): this task is the one that changes them now.
- `packages/cms/knowledge/runtime.md` and `packages/housekeeping/knowledge/package.md`: `New`, `Inject` and `Mount`.
- Under reborn, inside a transaction only the transaction's queries are used: the one connection is shared
  ([holo-port 0011](/decisions/holo-port/0011-store-returns-sql-db.md)).
- The settings refresh still runs in `cms.New` and `server.New` until
  [platform 07](/features/platform/tasks/07-cms-reads-settings.md) and
  [platform 09](/features/platform/tasks/09-game-reads-settings.md) remove it; it is harmless in one process.

# Steps

- [ ] A new module `packages/reborn` (`go work use`), following `applying-go-patterns`. Its public API is what
  `main.go` calls; the proposed shape, which the task may refine and reports:

  ```go
  type Site struct {
      Resolver astro.Resolver
      Static   http.Handler
  }
  type Option func(*Reborn)
  func WithCMS(s Site) Option
  func WithHousekeeping(s Site) Option
  func WithInstaller(s Site) Option
  func New(opts ...Option) *Reborn
  func (r *Reborn) Run(ctx context.Context) error // serves until ctx ends
  ```

- [ ] `Run` on an installed hotel: `config.Load`, one `store.Open`, then `cms.New`, `housekeeping.New` and `server.New`
  in that order with the same `*sql.DB`; one `http.ServeMux` with the CMS and housekeeping mounted; `StartInfo` and
  `StartMus`; an `http.Server` on `reborn.host:reborn.port`; one start-up line, `reborn on http://<addr>`. A folder
  that is not installed (no `config.json`, or nobody holds `housekeeping.accessGroups`) returns an error saying so,
  as a stopgap with no test: [platform 05](/features/platform/tasks/05-reborn-installs-a-new-hotel.md) replaces it
  with the installer.
- [ ] One test for the behaviour of the goal, in `packages/reborn`: an installed hotel in a temporary folder
  (`t.Chdir`), on free ports, answers `GET /` with the CMS's page and `GET /housekeeping/` with housekeeping's, and a
  WebSocket on the info port receives the game's first message.
- [ ] `packages/reborn` gets a short `README.md` (what it is, setup) and a `knowledge/` folder: what reborn runs, in
  which order, and its options.
- [ ] `apps/reborn`: `go.mod`, `Makefile` (`install`), `README.md`, as the other apps have; `go work use ./apps/reborn`.
- [ ] The root `Makefile`'s `build` comes back: `go build -o ./bin/reborn ./apps/reborn/cmd/reborn`.
- [ ] `apps/reborn/cmd/reborn/main.go` is the user's file: write its full proposed content in the report, as the other
  runners wire theirs (`fs.Sub` of each package's `DistFS`, `astro.MakeFSResolver`, `http.FileServerFS`), and stop.
  The master shows it to the user and writes it on the user's yes.

# Checks

```sh
make -C packages/reborn check
make -C apps/reborn check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/reborn`, `apps/reborn`.
