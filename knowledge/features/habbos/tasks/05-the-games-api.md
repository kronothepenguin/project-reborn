---
type: Task
title: The game's /api/ for programs run apart
description: Run alone, the game server serves /api/ on server.api, secured by a secret in X-Reborn-Secret that a database update generates; packages/server/api is its client, and the runners' changes are proposed to the user.
scope: [packages/server, packages/config, packages/store]
depends_on: [02-the-game-sends-a-new-look, 03-the-site-tells-the-game]
skills: [adding-config-sections, adding-data-persistence, documenting-with-okf]
---

# Goal

With the separate programs, a look saved on the site still reaches the game at once, and nobody else can make the
game do it ([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)).

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)
- It touches `packages/store/migrations`, which no other task may change at the same
  time.

# Steps

- [ ] `config.json`'s `server.api`, host `localhost` and port `15445`, through the `adding-config-sections` skill.
- [ ] A database update creates the one-row table `api_secret` with a random secret, and a query reads it
  (`adding-data-persistence`, `documenting-with-okf`).
- [ ] The game server serves, only when its runner asks for it with `WithAPI()`, an HTTP listener on `server.api` with
  `POST /api/habbos/{id}/look`, which calls `SendLook`. A request without the right `X-Reborn-Secret` is answered 404,
  as is every other path. reborn never opens it.
- [ ] `packages/server/api`: `api.New(baseURL, secret)` returns a client that implements `services.Habbos`, giving up
  after 2 seconds.
- [ ] Tests: the `/api/` answers 404 without the secret and with a wrong one; with it, `SendLook` runs; the client
  against an `httptest` server; the update on an empty database and on one of the last release.
- [ ] The runners are the user's files: write in the report the changes to `apps/server/cmd/server/main.go` (open the
  API) and to the CMS's and housekeeping's runners (read the secret, build `api.New` from `server.api`, `Inject` it),
  and stop for the master to ask.

# Checks

```sh
cd packages/server && go vet ./... && go test ./... -race
cd packages/config && go vet ./... && go test ./... -race
cd packages/store && go vet ./... && go test ./... -race
make gates
```
