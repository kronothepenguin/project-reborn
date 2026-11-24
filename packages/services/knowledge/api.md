---
type: Go Package
title: API
description: The contracts of packages/services, each a Go interface, and how an app takes them through Inject.
resource: packages/services/services.go
---

# API

| Contract | Call | What the game does |
| --- | --- | --- |
| `Habbos` | `SendLook(ctx, avatarID)` | Shows the habbo's saved figure, gender and motto to it and to its room |
| `Habbos` | `AreOnline(ctx, ids)` | Answers, for each id, whether that habbo is in the hotel now |
| `Habbos` | `Online(ctx)` | Lists the avatar ids of the habbos in the hotel now, in ascending order |
| `Hotel` | `Status(ctx)` | Answers `HotelStatus`: `Running`, whether the doors are open, and `Online`, how many habbos are inside |
| `Hotel` | `Start(ctx)` | Opens the doors, unless `game.closed` or `site.maintenance` is on; with the doors open, does nothing |
| `Hotel` | `Stop(ctx)` | Closes the doors: every habbo sees the client's "hotel closed" notice and is logged out |
| `Economy` | `SendPurse(ctx, userID)` | Reads the user's purse again and shows its credits, tickets and film to each of its habbos in the hotel |

- Each contract is a Go interface. The package imports only the standard library, so every app imports it.
- An app holds its contracts in its own `Services` struct and takes them through `Inject`.
- Under reborn, `*server.Server` is every contract. With the programs run apart, `api.New(gameURL, db)` of
  `packages/server/api` is, and it calls the game's `/api/`; a game that gives no answer returns an error.

# Examples

```go
site := cms.New(db, opts...)
site.Inject(cms.Services{Habbos: game, Hotel: game, Economy: game})
site.Mount(mux)
```
