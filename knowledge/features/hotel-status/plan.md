---
type: Plan
title: "Hotel status: how"
description: The game implements a Hotel contract with Status, Start and Stop and answers who is online, the site and housekeeping ask it in reborn's process or over the game's /api/, and the switch is a setting the game reads when it starts.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/services` | The `Hotel` contract and `HotelStatus`; `Habbos` has `AreOnline` and `Online` |
| `packages/settings` | The setting `game.closed`, false by default |
| `packages/virtual` | `habbo.Count()` and `habbo.IDs()`, the two reads the questions need |
| `packages/server` | `Start`, `Stop`, `Status`, `AreOnline`, `Online`; the five routes of `/api/`; `api` calls them for the programs run apart |
| `packages/reborn`, the runners | `Start` opens the doors; the runners inject `Hotel` beside `Habbos` |

Planned:

| Project | Part |
| --- | --- |
| `packages/server` | `Stop` holds each connection 5 seconds after the notice |
| `packages/cms` | The status on every page, the Me page's button, the client page's redirect, the "Hotel Closed" page of the client's window, each habbo's online picture |
| `packages/housekeeping` | "Turn your hotel on/off" on the settings page, the stop and start after the site's switch, the dashboard's count, the Online Users page |
| `tests/e2e` | The suite `hotel-status` |

The contract, as the user approved it:

```go
// packages/services
type Hotel interface {
    Status(ctx context.Context) (HotelStatus, error)
    Start(ctx context.Context) error
    Stop(ctx context.Context) error
}

type HotelStatus struct {
    Running bool // the doors are open
    Online  int  // habbos in the hotel
}

type Habbos interface {
    SendLook(ctx context.Context, avatarID int64) error
    // AreOnline reports which of ids are in the hotel now.
    AreOnline(ctx context.Context, ids []int64) (map[int64]bool, error)
    // Online lists the habbos in the hotel now.
    Online(ctx context.Context) ([]int64, error)
}

// apps/reborn/cmd/reborn/main.go
c.Inject(cms.Services{Habbos: g, Hotel: g})
h.Inject(housekeeping.Services{Habbos: g, Hotel: g})

// the game's /api/, programs apart
GET  /api/hotel                 -> {"running":true,"online":12}
POST /api/hotel/start           -> 204
POST /api/hotel/stop            -> 204
GET  /api/habbos/online         -> [1, 5, 9]
GET  /api/habbos/online?ids=1,2 -> {"1":true,"2":false}
```

# Decisions

All of 2026-11-18, each the user's choice among options put to them.

- Stopping closes the doors, and the program keeps running. The game logs every player out and closes the info and
  mus listeners; its program and its `/api/` stay up, so housekeeping starts it again, under reborn and with the
  programs apart alike. The choice is saved, so a stopped hotel stays stopped after a restart ("The game closes its
  doors").
- The saved choice is the setting `game.closed`. The doors are open when `game.closed` and `site.maintenance` are
  both false. The game holds the rule: `Start` reads both settings and leaves the doors closed while either is true,
  so a runner calls `Start` at boot and housekeeping calls `Start` or `Stop` after it saves a switch.
- Maintenance closes the game too: turning it on stops the game, and turning it off starts it unless the hotel is
  closed ("Maintenance closes the game too"). Waiting database updates leave the doors as they are
  ([reborn 0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)).
- One `Hotel` contract holds `Status`, `Start` and `Stop`. `Start` replaces `StartInfo` and `StartMus`, and reborn's
  ordered stop on Ctrl-C uses the same `Stop` in place of a separate `Shutdown`
  ([platform](/features/platform/tasks/10-reborn-stops-in-order.md)).
- Players see the client's own "hotel closed" notice, message 292, for 5 seconds, then a "Hotel Closed" page. The
  client draws the notice only while its connection is open, and sends its window to the site's error page the moment
  the connection closes. So the game holds each connection 5 seconds after the notice, and the site's error page says
  "Hotel Closed" while the game is stopped ("The notice for 5 seconds, then "Hotel Closed"").
- The switch lives on the settings page, as a second form under Holo's "Turn your site on/off", with the same
  attribute, `housekeeping.settings`.
- The feature also brings back the dashboard's online count, each habbo's online state and housekeeping's Online
  Users, which [waited for the game](/decisions/holo-port/0013-defer-game-server-features.md).
- A page asks about the habbos it shows: `AreOnline(ids)`. The user: "better ask instead of returning everyone
  online, we need single user and per page online status, it is cheaper to ask "is this habbo online" rather than
  getting everything and find out everytime." `Online()` serves Online Users alone.
- The client page sends a habbo to its Me page while the game is stopped ("Back to the site").
- The header follows the user's rule, "the "Enter <site name>" is shown if game server is running", for guests and
  habbos alike; a guest's Enter leads through sign-in, as Holo's did.
- Online Users lists the habbos in the hotel now, in place of Holo's "active in the past 600 seconds", with Holo's
  columns; Last activity follows the rule of User Listing.

# Notes

- A page asks the game once for the status and once for the habbos it shows, each with a context of its own that ends
  after 1 second. An error, or no injected game, reads as stopped and offline, and is logged once per request at most.
- Under reborn the calls stay in the process. Apart, `packages/server/api` makes them with the hotel's secret, read on
  each call.
- Every text of message 292 names an opening time, so the notice reads "The Hotel will open again at 00:00": the game
  sends hour 0 and minute 0.
- `Start` replaces the `StartInfo` and `StartMus` of
  [server 0022](/decisions/server/0022-start-info-and-start-mus.md).
