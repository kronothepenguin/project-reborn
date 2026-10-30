---
type: Task
title: Make settings and auth package-level and pass the db to cms.New
description: Move the settings into the virtual/settings singleton, turn auth into helpers that receive the db, give cms.New the db with options only for the resolver and the static handler, and add store.FromConfig.
status: done
phase: p0
depends_on: [p0-11]
packages: [packages/store, packages/virtual, packages/auth, packages/installer, packages/cms, apps/cms]
holo: []
timestamp: 2026-10-28T02:51:32+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-28T02:41:53+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-28T02:51:32+00:00"}
---

# Goal

Implement [0029](/decisions/0029-package-level-settings-and-auth.md).

# Steps

- [x] `packages/store`: `FromConfig()`.
- [x] `packages/virtual/settings`: the singleton with `Load`, `Reload`, `Set` and the getters; the `Settings` type and
      `ReloadEvery` go away.
- [x] `packages/auth`: package-level helpers that receive the db.
- [x] `packages/installer`: use the settings package and the auth helpers; its runners stay untouched.
- [x] `packages/cms`: `New(db, opts...)` with `WithResolver` and `WithStatic` only; `New` loads the settings; `Mount`
      wraps the routes.
- [x] `apps/cms/cmd/*`, as the user requested: drop the filename check, the config load, `store.Must`, `auth.New`
      and the `WithDB`, `WithSettings` and `WithAuth` options, and open the db with `store.FromConfig()`.
- [x] Docs.

# Verification

```sh
for m in packages/store packages/virtual packages/auth packages/installer packages/cms apps/cms apps/installer; do
  (cd $m && gofmt -l . && go vet ./... && go test ./... -race)
done
```

Then run the installer and the CMS end to end.

Results (2026-10-28T02:51:32+00:00):

- `gofmt -l`, `go vet` and `go test -race` pass in `packages/config`, `store`, `virtual`, `auth`, `installer` and
  `cms`, in `apps/cms` and `apps/installer`, and in `tools/create`.
- Test results:
  - store: 40, including a test of `FromConfig`;
  - settings: 27, including one showing that `Set` and `Reload` refuse before `Load`;
  - auth: 41;
  - installer: 10;
  - cms: 1, `TestMaintenance`, now with the sessions inside the routes.
- Rerunning the auth mutation check against the helpers, a removed ban check and a removed user throttle each still
  failed a test.
- End-to-end run of the production binaries:
  - in an empty directory the CMS now starts: `config.Get` wrote a default `config.json` and `store.FromConfig`
    created an empty database;
  - after the installer, `GET /` and `GET /register` returned 200, a cross-site `POST /` 403 and a same-origin one
    200;
  - with a `site.maintenance` row, a restarted CMS served the 503 page naming the hotel with the sign-in form; with
    the row deleted, it served 200 again.

# Notes

API as built:

- `settings.Load(ctx, cfg, db)`, `settings.Reload(ctx, db)`, `settings.Set(ctx, db, userID, key, value)` and the
  `Get…` and `Get…Or` getters (`packages/virtual/settings`). The root `virtual` package has no code left.
- auth:
  - `Login(w, r, db, …)`, `Logout(w, r, db)`, `LogoutEverywhere(ctx, db, userID)`, `SwitchHabbo(ctx, db, avatarID)`;
  - `Sessions(db)`, `RequireSession(next)`, `RequireAttribute(db, attr)`, `Attributes(ctx, db, userID)`;
  - `CreateReset(ctx, db, email)`, `ResetPassword(ctx, db, token, password)`, `ValidatePassword(password)`;
  - `RealIP` and the password functions are unchanged.
- `cms.New(db, WithResolver, WithStatic)` loads the settings and panics when it cannot, like `store.Must`. `Mount`
  wraps each CMS route with `auth.RealIP`, cross-origin protection and `auth.Sessions(db)`.
- `store.FromConfig()` is `Must(Open(config.Get().Store.Path))`.

Renames:

- auth's clock is the package variable `clock`, which tests replace.
- `lifetime` became `sessionLifetime` and the session loader became `loadSession`, so neither clashes with local
  names.
- The settings lookup is `lookup`, because the `declaration` type owns that name.

Runners:

- The user explicitly requested the change to `apps/cms/cmd/*` described in the steps. `apps/installer/cmd/*`
  stayed untouched.

Behavior changes:

- With the existence check gone, the CMS no longer refuses to start before the installer ran. This drops the
  "refuse to start" consequence of [0016](/decisions/0016-installer.md) by the user's choice.
- Nothing reloads the settings, so a row written by another process applies at the next start.
