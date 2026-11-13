---
type: Task
title: reborn runs an installed hotel
description: packages/reborn runs the CMS, housekeeping and the game server of an installed hotel in one process, on one mux and one database handle, on the reborn section's address; apps/reborn is scaffolded and its main.go is proposed to the user.
status: todo
slice: platform
depends_on: [platform-02]
packages: [packages/reborn, apps/reborn, go.work, Makefile]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

`reborn`, started in the folder of an installed hotel, serves the site at `/`, housekeeping at `/housekeeping/` and
the game on its two WebSocket ports ([0003](/decisions/0003-reborn-runs-the-hotel-in-one-process.md)).

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
  that is not installed (no `config.json`, or nobody holds `housekeeping.accessGroups`) returns an error saying so;
  [platform-05](/tasks/platform-05-reborn-installs-a-new-hotel.md) installs it.
- [ ] Tests in `packages/reborn`: an installed hotel in a temporary folder (`t.Chdir`), on free ports, answers `GET /`
  with the CMS's page and `GET /housekeeping/` with housekeeping's; a WebSocket on the info port receives the game's
  first message; a folder without `config.json` returns the error.
- [ ] `apps/reborn`: `go.mod`, `Makefile` (`install`), `README.md`, as the other apps have; `go work use ./apps/reborn`.
- [ ] The root `Makefile`'s `build` comes back: `go build -o ./bin/reborn ./apps/reborn/cmd/reborn`.
- [ ] `apps/reborn/cmd/reborn/main.go` is the user's file: write its full proposed content under `# Notes`, as the other
  runners wire theirs (`fs.Sub` of each package's `DistFS`, `astro.MakeFSResolver`, `http.FileServerFS`), and stop.
  The coordinator shows it to the user and writes it on the user's yes.

# Verification

```sh
cd packages/reborn && go vet ./... && go test ./... -race
cd apps/reborn && go vet ./... && go build ./...
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-03`.
- Under reborn, inside a transaction only the transaction's queries are used: the one connection is shared
  (`plans/holo-port/decisions/0011-store-returns-sql-db.md`).
- The settings refresh still runs in `cms.New` and `server.New` until [platform-07](/tasks/platform-07-cms-reads-settings.md)
  and [platform-09](/tasks/platform-09-game-reads-settings.md) remove it; it is harmless in one process.
