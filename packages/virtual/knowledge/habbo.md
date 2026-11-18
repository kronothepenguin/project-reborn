---
type: Go Package
title: habbo
description: The habbos online in the game, each with the session that plays it.
resource: packages/virtual/habbo
---

# What it holds

`packages/virtual/habbo` holds the habbos online in the game, each with the session that plays it
(decision server/0047). `game.Login` adds a habbo and `game.Logout` drops it; nothing here reads or writes the
database.

# Examples

```go
h, ok := habbo.Get(avatarID)
if ok {
	h.Session.Notify(event)
}
```

# Functions

- `Session` is the interface every protocol's session implements, `Notify(event any)`, and `game.Session` is the same
  interface (decision server/0048). Sessions are compared by identity, so a session is a pointer.
- `Habbo` is what the login read of the habbo: its `store.Avatar`, its badges, those it wears in its five slots,
  `Worn`, its sound setting, its ignore list, `Ignored`, its favourite `Group`, and its fuses (decision server/0053),
  and its `Session`. The wallet and the club, which the user's habbos share, stay in the store.
- `Get(avatarID) (Habbo, bool)` returns a copy of an online habbo; changing the copy changes nothing online.
- `Count() int` returns how many habbos are online, and `IDs() []int64` their avatar ids in ascending order: the game's
  `Status` and `Online` read them.
- `Update(avatarID, s, change) bool` runs `change` on the online habbo while `s` plays it, after the store has the
  change. `change` runs under the package's lock: it must not call a session or the database.
- `Add(h) (replaced Habbo, ok bool)` puts `h` online, and returns the habbo it replaces when `h` was online already, on
  its old session.
- `Drop(avatarID, s) bool` takes the habbo offline while `s` plays it, and reports whether it did: a session that a
  second login replaced drops nothing.
- Every function may be called from several goroutines at once, and none calls a session.
