---
type: Task
title: The game's /api/ for programs run apart
description: Run alone, the game server serves /api/ on server.api, secured by a secret in X-Reborn-Secret that a database update generates; packages/server/api is its client, and the runners use it.
scope: [packages/server, packages/config, packages/store, apps/server, apps/cms, apps/housekeeping]
depends_on: []
skills: [applying-go-patterns, adding-config-sections, adding-data-persistence, testing-behaviours, use-modern-go]
---

# Goal

With the separate programs, a look saved on the site still reaches the game at once, and nobody else can make the
game do it ([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)). The behaviour of the spec:

- With the separate programs, the same changes reach the game through its `/api/`, and the `/api/` answers 404 without
  the secret.

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- `packages/config/knowledge/adding-a-section.md`: the playbook of `adding-config-sections`.
- `packages/store/knowledge/adding-persisted-data.md`: the playbook of `adding-data-persistence`.
- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)
- It touches `packages/store/migrations`, which no other task may change at the same
  time. The next free update number is 0025.
- `(*server.Server).SendLook` returns nil for an unknown or offline habbo, and an error only when the store fails.
- The user keeps `server.WithAPI()` as an option: "i want to prevent careless options, i don't say i forbid options".
  The game server's own runner passes it, and reborn's runner leaves it out.
- The CMS and housekeeping call their service after a save through `sendLook`, with 2 seconds of its own
  (`packages/cms/knowledge/runtime.md`).
- A new table gets its row in `packages/store/knowledge/tables.md`; a query needs no document.

# Steps

- [ ] `config.json`'s `server.api`, host `localhost` and port `15445`, through the `adding-config-sections` skill.
- [ ] A database update creates the one-row table `api_secret` with a random secret, and a query reads it
  (`adding-data-persistence`).
- [ ] The game server serves, only when its runner asks for it with `WithAPI()`, an HTTP listener on `server.api` with
  `POST /api/habbos/{id}/look`, which calls `SendLook`. A request without the right `X-Reborn-Secret` is answered 404,
  as is every other path. reborn never opens it.
- [ ] `packages/server/api`: `api.New(baseURL, secret)` returns a client that implements `services.Habbos`, giving up
  after 2 seconds.
- [ ] One test per side of the behaviour: with the secret, a call to the `/api/` runs `SendLook` through the client of
  `packages/server/api`; without the secret, or with a wrong one, the `/api/` answers 404. One more for the update: a
  hotel of the last release applies it and holds one secret.
- [ ] The runners: `apps/server/cmd/server/main.go` opens the API; the CMS's and housekeeping's runners read the
  secret, build `api.New` from `server.api` and `Inject` it.

# Checks

```sh
make -C packages/server check
make -C packages/config check
make -C packages/store check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/server`,
`packages/config`, `packages/store`.
