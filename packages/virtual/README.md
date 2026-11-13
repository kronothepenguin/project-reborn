# virtual

In-memory state of Project Reborn's entities, one package per entity. Nothing here keeps a database connection: every function that reads or writes the database receives the `*sql.DB`, and the program that opened it stays its owner.

## settings

`packages/virtual/settings` holds the settings once per process, filled in this order:

1. the defaults declared in the catalogue (`settings/catalogue.go`);
2. every `config.json` value, under the key path of its JSON tags (`cms.port`, `store.path`);
3. the rows of the `settings` table, whose `value` is a JSON literal of the setting's type.

```go
if err := settings.Load(ctx, config.Get(), db); err != nil {
	return err
}

name := settings.GetString("site.name")
idle := settings.GetIntOr("auth.sessionIdleMinutes", 30)

err := settings.Set(ctx, db, userID, "site.maintenance", true)
```

- `Load(ctx, cfg, db) error` validates `cfg`, reads the rows and builds the values. It may run again: `cms.New` runs it, so every app of a process loads the same values.
- `GetInt`, `GetBool` and `GetString(key)` return the value. For an unknown key, a value of another type or settings not loaded yet, they return the zero value and log a warning with `slog`.
- `GetIntOr`, `GetBoolOr` and `GetStringOr(key, fallback)` return `fallback` in those cases, without a warning.
- `Set(ctx, db, userID, key, value) error` writes one declared setting. It checks the value's type, the validator and the rules, then upserts the row, or deletes it when `value` equals the default. The values change at once. A `userID` of 0 records no user (the installer writes settings before the first user exists).
- `Validate(values) error` reports why `Set` would refuse several values taken together, and writes nothing, so that a form can refuse all of them before it writes one. `Set` still writes one key at a time and checks the rules each time.
- `Declared() []Setting` lists the declared settings with their current values, sorted by key, for housekeeping's forms. A setting declared with `secret(...)` comes without its value, and `GetString` is the only way to read it.
- `Reload(ctx, db) error` rebuilds the values from the rows. Nothing calls it for now: the apps of one process share the values, and reloading for programs that run apart comes back with housekeeping or the orchestrator.
- `Set` and `Reload` before any `Load` return an error.

### Declaring a setting

Add the key to `catalogue` in `settings/catalogue.go` with `declare(default, validator)`. The default's Go type (`int`, `bool` or `string`) is the setting's type, and a nil validator accepts every value of that type. A rule that spans several settings goes into `rules` and lists every key it reads.

The tests check that every default passes its validator and the rules, and that no setting reuses a `config.json` key. A value needed before the database opens is not a setting: it belongs to `packages/config`.

### Rows

- A row is ignored, and logged with `slog.Warn` (key and reason, never the value), when its key comes from `config.json` or is not declared, when its value is not a JSON literal of the declared type (`null` included), or when its validator rejects it.
- When rows break a rule, each of them goes back to its default and is logged, because the rule cannot tell which row is wrong.
- A deleted row means the default applies again from the next `Load` or `Reload`.

### Gotchas

- `Set` refuses a value whose Go type differs from the default's: `int64(7)` is not an `int`.
- The store's pool has one connection, so calling `Load`, `Set` or `Reload` while holding a transaction blocks forever.

## habbo

`packages/virtual/habbo` holds the habbos online in the game, each with the session that plays it
(`knowledge/decisions/server/0047-online-habbos-in-virtual-habbo.md`). `game.Login` adds a habbo and `game.Logout` drops it;
nothing here reads or writes the database.

```go
h, ok := habbo.Get(avatarID)
if ok {
	h.Session.Notify(event)
}
```

- `Session` is the interface every protocol's session implements, `Notify(event any)`, and `game.Session` is the same
  interface (`knowledge/decisions/server/0048-sessions-through-an-interface-virtual-declares.md`). Sessions are compared by
  identity, so a session is a pointer.
- `Habbo` is what the login read of the habbo: its `store.Avatar`, its badges, those it wears in its five slots, `Worn`,
  its sound setting, its ignore list, `Ignored`, its favourite `Group`, and its fuses
  (`knowledge/decisions/server/0053-the-online-habbo-holds-its-own-data.md`), and its `Session`. The wallet and the club,
  which the user's habbos share, stay in the store.
- `Get(avatarID) (Habbo, bool)` returns a copy of an online habbo; changing the copy changes nothing online.
- `Update(avatarID, s, change) bool` runs `change` on the online habbo while `s` plays it, after the store has the
  change. `change` runs under the package's lock: it must not call a session or the database.
- `Add(h) (replaced Habbo, ok bool)` puts `h` online, and returns the habbo it replaces when `h` was online already,
  on its old session.
- `Drop(avatarID, s) bool` takes the habbo offline while `s` plays it, and reports whether it did: a session that a
  second login replaced drops nothing.
- Every function may be called from several goroutines at once, and none calls a session.

## category, model and room

The navigator's shared data, loaded when the server starts and kept
(`knowledge/decisions/server/0060-virtual-category-model-and-room.md`): `server.New` calls each `Load(ctx, db)`, at once or
once the database updates waiting are applied (`knowledge/decisions/server/0064-the-navigator-loads-once-the-updates-are-applied.md`).
A load swaps in a whole new copy, so a reader never sees half of one, and the getters take no lock.

```go
c, ok := category.Get(3)            // Public Rooms
for _, r := range room.PublicIn(c.ID) {
	visitors := room.Visitors(room.Ref{Public: true, ID: r.ID})
}
m, ok := model.Get("a")
```

- `category`: `Get(id)`; `Children(id)`, the categories right under it, by id; and `Parents(id)`, the categories above
  it, nearest first, as `GETPARENTCHAIN` wants them.
- `model`: `Get(name)`, by the name the client knows, such as `a` or `newbie_lobby`, and `ByID(id)`.
- `room`: `Public(id)` and `PublicIn(categoryID)` for the public rooms, and `Visitors(ref)`, how many habbos are in a
  room, where a `Ref` names a public room or a habbo room, whose ids may be equal.
- The getters return copies: changing one changes nothing in memory.

Gates, from `packages/virtual`:

```sh
gofmt -l .
go vet ./...
go test ./... -race
```

## furni and catalogue

What each furni is and what the catalogue sells, loaded when the server starts and kept
(`knowledge/decisions/server/0098-virtual-furni-and-catalogue.md`): `server.New` calls `furni.Load(ctx, db)` and then
`catalogue.Load(ctx, db)`, with the navigator's shared data. A load swaps in a whole new copy, so a reader never sees
half of one, and the getters take no lock.

```go
chair, ok := furni.Get(463)           // the recycler's Palm Chair
page, ok := catalogue.Get("Recycler") // by the page's code, the client's id for it
for _, p := range catalogue.Pages() {
	for _, item := range p.Items {
		for _, f := range item.Furni {
			_ = f.Sprite // and f.Amount, how many pieces the item gives
		}
	}
}
```

- `furni`: `Get(id)`, a furni definition, and `BySprite(sprite)`, the definition of a sprite, the one with the lowest
  id of several that share it.
- `catalogue`: `Pages()`, every page in the catalogue's order, and `Get(code)`. A `Page` carries its numbered `Texts`
  and its `Items`, each with the `Furni` it gives, a definition and an amount. `Item.Deal()` tells a deal, an item that
  gives more than one piece.
- `furni.Create(ctx, q, sprite, piece)` creates what a habbo gets for one furni, as a purchase, an item voucher or any
  other gift gives it (`knowledge/decisions/server/0125-an-item-voucher-gives-what-buying-gives.md`): the piece, a pad of
  post-its with its 20 notes, or a teleport with the other of its pair. It writes through `q`, in the caller's
  transaction, and reads nothing from memory, so the site calls it too. `IsTeleport`, `IsPostIt` and `IsDecoration` tell
  those furni by their sprite.
- `catalogue.Load` takes each furni from `virtual/furni`, so `furni.Load` runs first.
- `Pages` returns a copy of its list. The texts, items and furni of a page are the ones in memory, to read and never
  to change.

## Loaded rooms

`packages/virtual/room` also holds the rooms in use, with the habbos in them, only in memory
(`knowledge/decisions/server/0009-virtual-holds-the-server-state.md`, `knowledge/decisions/server/0011-saved-and-memory-only-data.md`).
A room loads with its first habbo and unloads with its last
(`knowledge/decisions/server/0071-an-empty-room-unloads-at-once.md`).

```go
r, o, loaded, err := room.Enter(ctx, db, room.Ref{ID: flatID}, h.ID, h.Session, limit)
if errors.Is(err, room.ErrFull) {
	// 224 with 1
}
if loaded {
	go clock(r) // until <-r.Done()
}
for _, other := range r.Occupants() {
	other.Session.Notify(event)
}
left, ok := room.Leave(h.ID, h.Session)
```

- `Enter(ctx, db, ref, avatarID, s, limit)` puts the habbo at the room's door, at the model's door tile, height and
  direction, with the smallest index nobody in the room holds, from 0, as Holo gave it. A room that is not loaded loads
  first: its floor from its model, and a habbo room's rights and bans in force from `db`
  (`knowledge/decisions/server/0009-virtual-holds-the-server-state.md`); `loaded` tells. It refuses a habbo who is in a room
  already (`ErrInRoom`), a room that holds `limit` habbos or more (`ErrFull`, never when `limit` is 0) and a room that does
  not exist (`ErrNoRoom`).
- `Leave(avatarID, s)` takes the habbo out while `s` plays it. The last one out unloads the room: `Done()` closes, and
  `Left.Waiting` hands back who was at its doorbell, in its queue or among its spectators, to be told.
- `Loaded(ref)` and `In(avatarID)` find a loaded room by its ref or by a habbo in it.
- `Head(avatarID, ref)`, `Admit(avatarID, ref)`, `HeadingOf(avatarID)` and `ClearHeading(avatarID)` keep the room a
  habbo is on its way into and whether its door let it through, only in memory. `Admit` admits a habbo only into the
  room it heads for, so that a late answer never lets it in elsewhere.
- A `Room` holds its open trades (`knowledge/decisions/server/0092-a-trade-lives-only-in-memory.md`): `OpenTrade(avatarID,
  index)` between two of its habbos, `OfferFurni`, `AcceptTrade`, `TradeOf` and `CloseTrade`. A `Trade` has two
  `TradeSide`s, each with its habbo, its accept and the furni it offers, by id. `Leave` ends the trade of the habbo
  that goes and returns it in `Left.Trade`.
- `OpenPassage(avatarID, passage)` and `ClosePassage(avatarID)` keep the teleport a habbo comes out of and its room,
  from the moment it stands in the other of the pair, only in memory. `AdmitThrough(avatarID, ref, teleportID)`
  admits it into the room it heads for with that teleport as its `Heading.Teleport`, where it arrives.
- A `Room` gives its `Ref()`, `Owner()`, a habbo room's owner as it loaded, `Model()`, `Floor()` and `Done()`;
  `Occupants()`, by index, and `Occupant(avatarID)`; `Update(avatarID, change)`, which changes a habbo's place and
  statuses but never its id, session or index; the copies of its rights and bans, `HasRights`, `SetRights`, `BanEnd` and
  `Ban`, which the rules change once the store has the change
  (`knowledge/decisions/server/0010-hot-data-written-at-once.md`); four lines, `Doorbell`, `Queue`, `Spectators` and
  `SpectatorQueue`, with `Join`, `Remove`, `Waiting` and `LineOf`
  (`knowledge/decisions/server/0069-doorbell-queue-and-spectators-in-memory.md`); `Reserve`, `Unreserve`, `Reserved` and
  `Taken`, for the places a queue keeps for the habbos it lets in; and `Max`, the room's limit, which `SetMax` changes.
- An `Occupant` also holds its walk, `Walking` to `GoalX`, `GoalY`; `Changed`, which asks the room's clock to send its
  status (`knowledge/decisions/server/0072-each-loaded-room-runs-its-own-clock.md`); `Typing`; and `Leaving`, a kicked or
  banned habbo walking out. A `Status` may end, `Until`, as talking and waving do. `Tick(step)` runs the clock's step on
  every habbo at once, by index, under the room's lock, and returns the statuses `step` hands back.
- A loaded room holds its event, which lives only in memory (`knowledge/decisions/server/0081-eleven-room-event-types.md`):
  `Event`, `SetEvent` and `EndEvent`; `All()` returns the loaded rooms, for the navigator's list of events.
- Once a room unloads, its methods change nothing and report false, so a rule holding an old `*Room` cannot bring it
  back.
- A habbo room loads the furni that stands in it too, each row with what it is from `virtual/furni`: `Furni()` lists
  it by id, and `Floor()` is the model's floor with the furni on it. On each tile the highest furni decides, and of two
  as high the newer one: a solid blocks the tile, unless it is a door whose state is `O`; a seat and a bed take a habbo
  at `Tile.Level`, their altitude and their height, facing `Tile.Direction`; a rug leaves the tile open at its own
  altitude; and a roller leaves it open at its top, where habbos and furni stand. `BareFloor()` is the model's floor
  alone. `Furni.Tiles()` gives the tiles a floor furni covers, its length along x when it faces 0 or 4 and along y
  when it faces 2 or 6. `WithDefinitions(rows)` pairs the store's rows with their definitions, for a room that is not
  loaded.
- An `Occupant` carries its drink in `Carry`: the token, the sips left and when it next raises or lowers it; the
  room's clock moves it on.
- `SetFurni(item)` stands a furni in the room's copy, or moves the one of its id, and `RemoveFurni(id)` takes one out,
  each once the store has the change; both lay the floor again. `FurniByID(id)` reads one, and `FloorWithout(id)` is
  the floor without a furni, where it may move to. A tile says where more furni stands: `Placeable`, when the model
  allows furni and what stands there carries more, a solid that has a height or a rug, and `Top`, how high the next
  one would stand. `Furnish(change)` runs one change to the room's furni at a time.
- `ParseFloor(model)` reads a model's height map as the client reads 31: `x` blocked, in either case; a digit, that
  height; `A` to `H`, the heights 0 to 7, and `y`, 0, where nothing may be placed; any other character open at 0, as
  Holo read it. The public furni block their tiles (state 1) or seat a habbo (state 2), and the door's tile is always
  open. Holo's data lists the furni of eight models without their state; no public room uses them, and they do not
  parse.
- `change` runs under the room's lock, so it must not call a session or the database. A `Floor` never changes once
  parsed, and every function may be called from several goroutines at once.
