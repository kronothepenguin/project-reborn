---
type: Task
title: The services package, the Habbos contract and Inject
description: packages/services holds the first contract, Habbos.SendLook(ctx, avatarID), and the CMS and housekeeping take their services through Inject.
status: todo
slice: habbos
depends_on: []
packages: [packages/services, packages/cms, packages/housekeeping, go.work]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

The contract every side of the habbos slice builds on ([0005](/decisions/0005-the-game-hears-live-changes-through-services.md)).
It runs alone.

# Steps

- [ ] A new module `packages/services` (`go work use`), importing only the standard library:

  ```go
  // Habbos tells the game server that a habbo changed outside the game.
  type Habbos interface {
      // SendLook shows the habbo's saved figure, gender and motto to it and its room.
      SendLook(ctx context.Context, avatarID int64) error
  }
  ```

- [ ] The CMS and housekeeping each gain `type Services struct { Habbos services.Habbos }` and
  `Inject(s Services)`, called once after `New` and before `Mount`; their routers receive the services.
- [ ] Until a runner injects them, a service is absent and an app skips its calls: the change is saved, as when a call
  fails.
- [ ] `packages/services/README.md`: what a service is (only what the game must show live), the order constructors,
  services, `Inject`, run, ids only, nothing stored.
- [ ] Tests: `Inject` hands the service to the router; nothing is called yet.

# Verification

```sh
cd packages/services && go vet ./... && go test ./... -race
cd packages/cms && go vet ./... && go test ./... -race
cd packages/housekeeping && go vet ./... && go test ./... -race
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `habbos-01`, alone: it touches `go.work` and the go.mod files of the CMS and housekeeping.
