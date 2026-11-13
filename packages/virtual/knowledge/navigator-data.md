---
type: Go Package
title: category, model and room
description: The navigator's shared data, its categories, room models and public rooms, loaded when the server starts and kept.
resource: packages/virtual/category
---

# What it holds

The navigator's shared data, loaded when the server starts and kept (decision server/0060): `server.New` calls each
`Load(ctx, db)`, at once or once the database updates waiting are applied (decision server/0064). A load swaps in a
whole new copy, so a reader never sees half of one, and the getters take no lock.

# Examples

```go
c, ok := category.Get(3)            // Public Rooms
for _, r := range room.PublicIn(c.ID) {
	visitors := room.Visitors(room.Ref{Public: true, ID: r.ID})
}
m, ok := model.Get("a")
```

# Functions

- `category`: `Get(id)`; `All()`, every category by id; `Children(id)`, the categories right under it, by id; and
  `Parents(id)`, the categories above it, nearest first, as `GETPARENTCHAIN` wants them.
- `model`: `Get(name)`, by the name the client knows, such as `a` or `newbie_lobby`, and `ByID(id)`.
- `room`: `Public(id)` and `PublicIn(categoryID)` for the public rooms, and `Visitors(ref)`, how many habbos are in a
  room, where a `Ref` names a public room or a habbo room, whose ids may be equal.
- The getters return copies: changing one changes nothing in memory.
