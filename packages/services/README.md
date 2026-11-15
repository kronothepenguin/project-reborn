# services

The contracts through which a program tells the game server of a change it must show live
(`plans/reborn/decisions/0005-the-game-hears-live-changes-through-services.md`). Each contract is a Go interface. The
package imports only the standard library, so every app can import it and it imports no app.

```go
site := cms.New(db, opts...)
site.Inject(cms.Services{Habbos: habbos})
site.Mount(mux)
```

## Contracts

| Contract | Call | What the game does |
| --- | --- | --- |
| `Habbos` | `SendLook(ctx, avatarID)` | Shows the habbo's saved figure, gender and motto to it and to its room |

## Rules

- A service exists only for what the game must show live, such as a habbo's look. What a program reads when it needs
  it, such as a setting or the hotel's name, needs none.
- The order is constructors, services, `Inject`, run. A service may hold the app it calls, so it is built once the apps
  are; each app then receives its services through `Inject`, once, after `New` and before `Mount`.
- A call carries ids only, such as `SendLook(ctx, avatarID)`. The change is saved before the call, and the game reads
  the store again.
- Services only communicate: they store nothing. A service that would need to is decided when it comes.
- Until a runner injects it, a service is absent: its field in the app's `Services` is nil, and the app skips its
  calls. The change stays saved, as when a call fails, and the habbo sees it at its next login.
