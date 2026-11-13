---
type: Reference
title: Research: how the programs tell each other of changes
description: Every place where a change made by the site must reach the game server or the reverse, what Holo's MUS did, and the designs weighed for a notice package, with the orchestrator first and separate programs later.
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [research, platform, bus, server, cms, housekeeping]
---

A read-only study of 2026-11-12, made by a research agent for the [platform slice](/slices/platform.md). Nothing here
is decided: the slice lists the questions the user answers before any task is written.

# In short

- Build the orchestrator first, with a small notice package that works inside one process, and add the transport for
  separate programs later. The package's interface is written now so that the transport is only a new implementation.
- The site should not change `packages/virtual` directly, even inside the orchestrator, which
  `plans/server/decisions/0013-site-changes-like-mus.md` says it should. Most changes for a habbo that is online
  must reach its client, a protocol message, a "poof" or a disconnect, which the rules of `packages/server/game` and
  `r26`'s `Session.Notify` do; the site would have to copy them, and run alone it would write to an empty `virtual` in
  its own process, silently.
- A notice is a hint, not data: "the badges of avatar 12 changed", and the server reads the store again. A lost notice
  leaves the habbo stale until its next login, since `game.Login` reads everything fresh, so at most once is enough.
- All the traffic goes through one hub: every item is the site telling the game server something, or asking it
  something. Nothing needs the server to push to the site. A neutral package that imports nothing ends the worry about
  cycles.

# Inventory

"Next login" means `game.Login` (`packages/server/game/login.go:25`) reads fresh.

## The site tells the game server

| # | Change, and where | Store rows | Memory the server holds | What the server must do | Holo | If lost |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Credits: CMS vouchers, club, group purchase, home store, registration; housekeeping's credits | wallet, transactions | none | Send the client its balance | `UPRC` | Old balance shown until the next purchase or login; no corruption, `game.Buy` reads the wallet in its transaction |
| 2 | Tickets and film (housekeeping `users.go`) | wallet | none | Send tickets and film | `UPRT` | Stale until login |
| 3 | Item voucher (`furni.Create`), Take from the shared inventory | furni | none, the hand is read from the store | `game.HandChanged` | `UPRH` | Shows the next time the client asks for its hand |
| 4 | Badges: housekeeping's badge tool; club bought or ended | avatar_badges | `habbo.Habbo.Badges`, `Worn` | Read again, update, `game.BadgesChanged` | `UPRS` | Wrong badges in rooms until login |
| 5 | Club bought or ended on the site | club_subscriptions | club fuses in `Habbo.Fuses` | Read club and fuses; send club status and fuse rights | `UPRS` | Stale until login |
| 6 | Access groups and user attributes (housekeeping) | groups, attributes | `Habbo.Fuses` | `auth.Fuses` again; send fuse rights | none | A demoted moderator keeps `fuse_kick` until logout |
| 7 | Look, gender, motto: CMS account pages; housekeeping's habbos | avatars | `Habbo.Avatar` | Read again; send to the habbo and its room | `UPRA` | Old look until login |
| 8 | Favourite group and group data (CMS groups) | groups, members | `Habbo.Group` | Read the favourite group of members online; tell their rooms | none | Shows from the next login, as s4-07 accepts |
| 9 | User ban (housekeeping `bans.go`) | bans, sessions | the habbo and its session | Ban message with its reason, then close the session | `HKSB` | A banned player keeps playing until logout |
| 10 | IP ban | bans | sessions by address | Close every session from that address? | by user id only | As 9 |
| 11 | Alert and mass alert (housekeeping) | alerts | none | Show it to that habbo, or to everyone online | `HKMW` | The alert is never seen in the game |
| 12 | Habbo archived (`auth.ArchiveHabbo`) | avatars, hand, recycling, rooms | the habbo if online; loaded rooms keep their owner | Close or refresh its session; fix the owner of its loaded rooms | none | The old owner keeps owner rights until the room unloads |
| 13 | Habbo restored | avatars | none | nothing | | |
| 14 | Catalogue or furni definitions (updates today; an editor later) | catalogue, definitions | `virtual/furni`, `virtual/catalogue` | Reload both | `HKRC` | Old catalogue until a restart |
| 15 | Settings (housekeeping is the single writer) | settings | `virtual/settings` per process | Read again | | Already polled: `cms.go:69`, `server.go:57` (`plans/server/decisions/0050-the-server-loads-and-reloads-the-settings.md`) |
| 16 | Updates applied by housekeeping | schema | shared data loaded once none wait | | | Already polled (`updates.WhenCurrent`) |
| 17 | Friends, calls for help, the mod tool, club bought in the game | | | Open questions of those slices | | |

Holo's MUS (`source/holoemu/Source/Socket servers/musSocketServer.cs`): TCP accepted from one configured address, its
only security; one packet a connection, a 4-character opcode and fields separated by `chr(2)`; it ran the command,
closed the connection, never answered and swallowed every error. Commands: HKTM, HKMW, HKUK, HKAR, HKSB, HKRC, UPRA,
UPRC, UPRT, UPRS, UPRH. HoloCMS (`includes/mus.php`) sent through `fsockopen` and ignored failures, so Holo was already
fire-and-forget; it sent only UPRC, UPRS, UPRA, UPRH, HKMW and HKSB.

## The site asks the game server

| # | Wanted by | Today | What Holo did |
| --- | --- | --- | --- |
| 18 | Online count (every page, housekeeping's dashboard) | 0 and offline | The emulator wrote `system.onlinecount` to the database every 6 s (`Core.cs:210-218`) |
| 19 | Is the hotel up (status picture) | offline | The CMS opened a TCP connection to the game port (`core.php:345-366`) |
| 20 | Is habbo X online (profile, community, staff, forum, promo) | offline | Not the game: `users.online` was the time of the user's last page view on the site, online meaning within 10 minutes (`core.php:564`, `IsUserOnline` at `core.php:575`) |
| 21 | Housekeeping's Online Users | deferred | Site activity, as 20 |
| 22 | My Friends, friends online, the room a habbo is in | deferred | In the emulator |

# State and imports today

- The sub-packages of `packages/virtual` are package-level state, all safe for concurrent use in one process:
  `settings` (an atomic pointer and a mutex for writers); `furni`, `catalogue`, `category`, `model` and the public rooms
  of `room` (an atomic pointer swapped whole on `Load`); `habbo` (a map under a mutex, `Update(id, s, change)` applying
  only while `s` still plays the habbo); loaded rooms (a lock a room).
- `packages/cms` imports `virtual/settings` and `virtual/furni`, for `furni.Create` only, which writes through the
  caller's transaction and reads no memory. `packages/housekeeping` imports `virtual/settings` and `virtual/furni`
  (`IsDecoration`). `packages/auth` imports `virtual/settings`. Only `packages/server` imports `habbo`, `room`,
  `catalogue`, `category` and `model`.
- Imports: store → config; virtual → config, store; auth → config, store, virtual/settings; cms → astro, auth, config,
  scheduler, store, virtual/{settings,furni}; housekeeping → the same, cms/seed, and cms in tests; server → auth,
  config, scheduler, store, virtual/*. Nobody imports server.
- The cycle, made concrete: `cms → server/game` would compile today, but it ties the CMS's own binary to the whole game
  server, and the first time the server needs anything of the site it is a cycle. `cms.New(db, cms.WithServer(s))`
  breaks the rule that options are for the resolver and the static handler, and alone the option would be nil.

# The designs

- (a) No messages, everyone polls the store. Right for settings and updates, as today. Wrong for a habbo's data:
  reading wallet, badges, look, fuses, group and bans again for every habbo online on each tick runs on a pool of one
  connection (`store.go:58`), so every write of the game waits behind those reads; and alerts and bans are events, which
  need a cursor. A variant worth keeping for separate programs is an outbox table, `site_notices(id, kind, ref_id,
  created_at)`, written in the transaction of the change and polled by id: durable, ordered, nothing to secure, up to a
  second late, and it answers no question.
- (b) A neutral notice package (recommended). In one process it is a map from a notice's type to its subscribers, each
  with a goroutine and a buffered queue, so `Publish` never blocks a page and each subscriber sees notices in order.
- (c) Options such as `WithHousekeeping(instance)`: required wiring passed as an option, nil checks everywhere when
  alone, the site coupled to the server, and the cycle the first time the server needs the site. It gains nothing over
  (b).
- (d) The site changes `virtual` directly. `Notify` takes `game`'s events, so the site would import `server/game` and
  copy each rule: a ban needs `LeaveRoom`, `ClosePassage`, `habbo.Drop` and the `r26` session closed. A sequence of safe
  calls is not safe while the habbo logs in again. Alone, every change does nothing, silently.
- Sockets even inside the orchestrator, so that both modes are the same: possible, but encoding, goroutines, error
  paths and a port for no gain. The sameness belongs in the interface.

Transports for separate programs, later:

| Transport | Fits | Windows | Security | Verdict |
| --- | --- | --- | --- | --- |
| Unix socket, HTTP over it | notices and questions | AF_UNIX streams work from Windows 10 1803, and Go supports them | file permissions; on Windows only the directory's | good |
| Loopback TCP with HTTP | notices and questions | everywhere | bind to 127.0.0.1 and require a shared secret kept in the database | the simplest portable choice |
| stdio pipes | a parent and its child only | yes | inherited | does not fit: separate programs have no parent |
| UDP over loopback | notices only | yes | anyone local can send | no questions, no error when the server is down |
| SQLite outbox | notices only | yes | access to the file | durable and ordered, up to 1 s late |

Rules that make (b) work:

- A notice carries ids only; alert and ban texts are already rows of the store. A handler replaces what the server
  caches whole from the store, so it may run twice. The wallet is never cached.
- Publish only after the transaction commits. In one process a handler's read waits for the one connection; across
  processes, in WAL mode, a read before the commit sees the old snapshot.
- At most once is enough: every notice concerns a habbo that is online, a login reads everything fresh, a server that
  was down has nobody online when it starts, and the store holds the change. Bans and lost fuses are where "until the
  next login" is too long.
- In-order delivery to each subscriber is enough. The ban handler checks `auth.ActiveBan` when the notice arrives.
- With no server to ask, a question returns `ErrNoAnswer` and the page shows today's "offline" and 0.
- Tests: the in-process implementation is the test double. A site test subscribes a recorder; a server test publishes
  and reads what the fake session's `Notify` got.

# Recommendation

Ship the in-process package with the orchestrator. Run alone, the site publishes to nobody, and changes show at the
next login, as today. What the interface guarantees now, so that the transport comes later without touching the
programs:

1. Notices are a closed set of plain structs of ids, declared in the package: no pointers, sessions, `*sql.DB` or `any`.
2. `Publish` returns no error and never blocks.
3. Questions take a `ctx` and return a value and an error, with `ErrNoAnswer` defined.
4. No program learns whether it runs alone: its runner chooses a transport before `New`.
5. Publish after the commit, written in the README and tested.
6. Handlers read the store again and never apply data a notice carries.
7. Each question has one answerer, the game server.

# A sketch of the package

Its name is the user's to give; `packages/bus` here. Package-level, like `settings` and `scheduler`; it imports only the
standard library.

```go
package bus

type Notice interface{ notice() }

type (
	WalletChanged    struct{ UserID int64 } // credits, tickets, film
	HandChanged      struct{ AvatarID int64 }
	BadgesChanged    struct{ AvatarID int64 }
	LookChanged      struct{ AvatarID int64 } // figure, gender, motto
	ClubChanged      struct{ UserID int64 }
	FusesChanged     struct{ UserID int64 } // access groups, attributes
	GroupChanged     struct{ GroupID int64 }
	FavouriteChanged struct{ AvatarID int64 }
	HabboArchived    struct{ AvatarID, ToAvatarID int64 }
	BanCreated       struct{ BanID int64 }
	AlertSent        struct{ AlertID int64 }
	CatalogueChanged struct{}
)

func Publish(n Notice)
func Subscribe[N Notice](handle func(N)) (stop func())

type Place struct {
	Online bool
	Room   int64
	Public bool
}

type Hotel interface {
	OnlineCount(ctx context.Context) (int, error)
	Places(ctx context.Context, avatarIDs []int64) (map[int64]Place, error)
}

var ErrNoAnswer = errors.New("bus: no answer")

func Answer(h Hotel) (stop func())
func OnlineCount(ctx context.Context) (int, error)
func Places(ctx context.Context, avatarIDs []int64) (map[int64]Place, error)

// Later, for separate programs only.
type Transport interface {
	Send(n Notice)
	Receive(deliver func(Notice)) (stop func())
	Hotel
}

func Connect(t Transport)
```

| Notice | Published by, after its commit | What the server does |
| --- | --- | --- |
| WalletChanged | CMS vouchers, club, group purchase, home store; housekeeping's credits, tickets and film | Read the wallet; send credits, tickets, film |
| HandChanged | CMS item voucher, Take | `game.HandChanged`, which exists |
| BadgesChanged | housekeeping's badge tool; CMS club | Read badges, `habbo.Update`, `game.BadgesChanged` to the habbo and its room |
| LookChanged | CMS looks, profile, me; housekeeping's habbos | Update the copy; send the habbo's info to it and its room |
| ClubChanged | CMS club | Read club, fuses and badges again |
| FusesChanged | housekeeping's access groups and attributes | `auth.Fuses`; send fuse rights |
| GroupChanged, FavouriteChanged | CMS groups and members | Read the favourite groups of members online; tell their rooms |
| HabboArchived | CMS `account-habbos`, after `auth.ArchiveHabbo` | An open question |
| BanCreated | housekeeping's bans | If the ban is in force: its message, `LeaveRoom`, the sessions closed |
| AlertSent | housekeeping's alerts | Show it to that habbo or to everyone online |
| CatalogueChanged | a catalogue editor, later | `furni.Load`, `catalogue.Load` |
| `OnlineCount`, `Places` | asked by CMS pages, housekeeping's dashboard and Online Users | Answered from `virtual/habbo` and `room.In` |

How `packages/server` delivers them: `server.New` subscribes beside its `scheduler.Every` calls and calls
`bus.Answer`. The rules go in a new file of `packages/server/game`: `RefreshBadges`, for one, gets the habbo, returns
when it is offline, reads the store, calls `habbo.Update(id, h.Session, …)`, which is false when a second login took the
session and read fresh data, and notifies the habbo and its room. New `game` events (`CreditsChanged`, `ClubChanged`,
`LookChanged`, `FusesChanged`, `Alert`, `Banned`) get their message ids from the client's `.ls` scripts. `Notify` only
queues to the session's outbox, so a handler never waits on a client.

# Risks

- Bans are where security is at stake. Run alone with no transport, a banned player plays until logout; a check of new
  ban rows every second in the server closes it. And `game.Login` does not call `auth.ActiveBan`, so a ticket made just
  before a ban can still be spent: the check has to be added.
- A lost `FusesChanged` leaves a demoted moderator with `fuse_kick` until logout.
- Publishing inside a transaction by mistake gives stale reads across processes, and tests in one process never see it.
- A handler that stalls on the one connection overflows its queue and drops notices: a generous buffer, every drop
  logged, short handlers.
- The package-level bus in parallel tests delivers one test's notices to another: filter by ids, stop in `t.Cleanup`.
- One connection a process: in the orchestrator, handlers' reads compete with pages and the game's writes. A mass alert
  reads its row once, then loops in memory.
- Decisions that this replaces: `plans/server/decisions/0013-site-changes-like-mus.md`, and
  `plans/holo-port/decisions/0051-one-machine-and-a-refresh.md` where it says the refresh does not run in one process.

# Suggested tasks

1. Decisions: supersede server 0013; record the package, hints, publish after commit and at most once.
2. The package: types, `Publish` and `Subscribe` that drop and log, `Answer` and the questions with `ErrNoAnswer`, a
   README with the rules, `-race` tests, the `go.work` entry.
3. The server receives: subscriptions in `server.New`; the `game` rules; the new events and their `r26` messages; the
   ban check in `game.Login`. Touches `packages/server` and maybe `packages/virtual/room`, a setter for a loaded room's
   owner.
4. The site publishes: one `Publish` after each commit of the inventory. Touches `packages/cms/internal/router` and
   `packages/housekeeping/internal/router`.
5. The site asks: the online count on every page and the dashboard; the online state on the profile, community, staff,
   forum and promo; housekeeping's Online Users; Holo's "An ingame notification has been sent…" and "(poof) ingame"
   texts restored; the rows of `plans/holo-port/reference/holo-differences.md`.
6. `apps/reborn`: nothing beyond calling each `New`.
7. Later, the transport for separate programs: one implementation, a listener in `packages/server`, a section of
   `packages/config`, and the runners.

# Questions for the user

Each with the agent's recommendation first.

1. Replace "the CMS changes the virtual state directly" (server 0013) with notices? Yes. Example: housekeeping gives a
   badge, writes it and publishes `BadgesChanged{AvatarID: 12}`; the server does the rest.
2. Orchestrator first, the transport for separate programs later? Yes. Example: with three terminals, credits given in
   housekeeping show at the player's next purchase or login, as today; under `reborn` they show at once.
3. The name of the new package? `packages/bus`; or `packages/events`; or `packages/virtual/notice`.
4. Package-level, like `settings` and `scheduler`, rather than passed into `New`? Package-level: `cms.New(db, …)` stays
   as it is.
5. Notices carry ids only, and the server reads the store again? Yes. Example: `AlertSent{AlertID: 55}`.
6. A lost notice is dropped and logged, never retried? Yes: the next login reads everything fresh.
7. An archived habbo that is in the hotel? Close its game session, as a second login does, and give its loaded rooms
   their new owner at once.
8. Does an IP ban disconnect every session from that address? Yes.
9. What does "online" mean on the site? "In the hotel now", asked of the game server. Holo meant "opened a page of the
   site in the last 10 minutes". Example: a habbo reading the forum but not in the hotel.
10. Keep the polling of settings and updates in every mode, so no program knows its mode? Yes; it replaces holo-port
    0051's "in one process the refresh does not run".
11. Which transport, when separate programs must talk? Decide then; the leaning is HTTP on a local listener of the game
    server, since it also answers "who is online"; the other is the outbox table.
12. Close the ban gap for separate programs now? Yes: a check of new ban rows every second in the game server, and the
    ban check in `game.Login`.
