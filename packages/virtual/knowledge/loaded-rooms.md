---
type: Go Package
title: Loaded rooms
description: The rooms in use, held only in memory by packages/virtual/room, with their habbos, lines, trades, events, floor and furni.
resource: packages/virtual/room
---

# What it holds

`packages/virtual/room` also holds the rooms in use, with the habbos in them, only in memory (decisions server/0009,
server/0011). A room loads with its first habbo and unloads with its last (decision server/0071).

# Examples

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

# Entering and leaving

- `Enter(ctx, db, ref, avatarID, s, limit)` puts the habbo at the room's door, at the model's door tile, height and
  direction, with the smallest index nobody in the room holds, from 0, as Holo gave it. A room that is not loaded loads
  first: its floor from its model, and a habbo room's rights and bans in force from `db` (decision server/0009);
  `loaded` tells. It refuses a habbo who is in a room already (`ErrInRoom`), a room that holds `limit` habbos or more
  (`ErrFull`, never when `limit` is 0) and a room that does not exist (`ErrNoRoom`).
- `Leave(avatarID, s)` takes the habbo out while `s` plays it. The last one out unloads the room: `Done()` closes, and
  `Left.Waiting` hands back who was at its doorbell, in its queue or among its spectators, to be told.
- `Loaded(ref)` and `In(avatarID)` find a loaded room by its ref or by a habbo in it.
- `Head(avatarID, ref)`, `Admit(avatarID, ref)`, `HeadingOf(avatarID)` and `ClearHeading(avatarID)` keep the room a
  habbo is on its way into and whether its door let it through, only in memory. `Admit` admits a habbo only into the
  room it heads for, so that a late answer never lets it in elsewhere.
- `OpenPassage(avatarID, passage)` and `ClosePassage(avatarID)` keep the teleport a habbo comes out of and its room,
  from the moment it stands in the other of the pair, only in memory. The passage ends when the habbo walks, enters a
  room or logs out. `AdmitThrough(avatarID, ref, teleportID)` admits it into the room it heads for with that teleport
  as its `Heading.Teleport`, where it arrives.

# A room

- A `Room` gives its `Ref()`, `Owner()`, a habbo room's owner as it loaded, `Model()`, `Floor()` and `Done()`;
  `Occupants()`, by index, and `Occupant(avatarID)`; `Update(avatarID, change)`, which changes a habbo's place and
  statuses but never its id, session or index; the copies of its rights and bans, `HasRights`, `SetRights`, `BanEnd`
  and `Ban`, which the rules change once the store has the change (decision server/0010); four lines, `Doorbell`,
  `Queue`, `Spectators` and `SpectatorQueue`, with `Join`, `Remove`, `Waiting` and `LineOf` (decision server/0069);
  `Reserve`, `Unreserve`, `Reserved` and `Taken`, for the places a queue keeps for the habbos it lets in; and `Max`,
  the room's limit, which `SetMax` changes.
- An `Occupant` also holds its walk, `Walking` to `GoalX`, `GoalY`; `Changed`, which asks the room's clock to send its
  status (decision server/0072); `Typing`; and `Leaving`, a kicked or banned habbo walking out. A `Status` may end,
  `Until`, as talking and waving do. `Tick(step)` runs the clock's step on every habbo at once, by index, under the
  room's lock, and returns the statuses `step` hands back.
- An `Occupant` carries its drink in `Carry`: the token, the sips left and when it next raises or lowers it; the room's
  clock moves it on.
- A loaded room holds its event, which lives only in memory (decision server/0081): `Event`, `SetEvent` and
  `EndEvent`; `All()` returns the loaded rooms, for the navigator's list of events.
- Once a room unloads, its methods change nothing and report false, so a rule holding an old `*Room` cannot bring it
  back.

# Trades

A `Room` holds its open trades (decision server/0092): `OpenTrade(avatarID, index)` between two of its habbos,
`OfferFurni`, `AcceptTrade`, `TradeOf` and `CloseTrade`. A `Trade` has two `TradeSide`s, each with its habbo, its
accept and the furni it offers, by id. `Leave` ends the trade of the habbo that goes and returns it in `Left.Trade`.

# Floor and furni

- A habbo room loads the furni that stands in it too, each row with what it is from `virtual/furni`: `Furni()` lists it
  by id, and `Floor()` is the model's floor with the furni on it. On each tile the highest furni decides, and of two as
  high the newer one: a solid blocks the tile, unless it is a door whose state is `O`; a seat and a bed take a habbo at
  `Tile.Level`, their altitude and their height, facing `Tile.Direction`; a rug leaves the tile open at its own
  altitude; and a roller leaves it open at its top, where habbos and furni stand. `BareFloor()` is the model's floor
  alone. `Furni.Tiles()` gives the tiles a floor furni covers, its length along x when it faces 0 or 4 and along y when
  it faces 2 or 6. `WithDefinitions(rows)` pairs the store's rows with their definitions, for a room that is not
  loaded.
- `SetFurni(item)` stands a furni in the room's copy, or moves the one of its id, and `RemoveFurni(id)` takes one out,
  each once the store has the change; both lay the floor again. `FurniByID(id)` reads one, and `FloorWithout(id)` is
  the floor without a furni, where it may move to. A tile says where more furni stands: `Placeable`, when the model
  allows furni and what stands there carries more, a solid that has a height or a rug, and `Top`, how high the next one
  would stand. `Furnish(change)` runs one change to the room's furni at a time.
- `ParseFloor(model)` reads a model's height map as the client reads 31: `x` blocked, in either case; a digit, that
  height; `A` to `H`, the heights 0 to 7, and `y`, 0, where nothing may be placed; any other character open at 0, as
  Holo read it. The public furni block their tiles (state 1) or seat a habbo (state 2), and the door's tile is always
  open. Holo's data lists the furni of eight models without their state; no public room uses them, and they do not
  parse.
- `change` runs under the room's lock, so it must not call a session or the database. A `Floor` never changes once
  parsed, and every function may be called from several goroutines at once.
