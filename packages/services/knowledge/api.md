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

- Each contract is a Go interface. The package imports only the standard library, so every app imports it.
- An app holds its contracts in its own `Services` struct and takes them through `Inject`.

# Examples

```go
site := cms.New(db, opts...)
site.Inject(cms.Services{Habbos: habbos})
site.Mount(mux)
```
