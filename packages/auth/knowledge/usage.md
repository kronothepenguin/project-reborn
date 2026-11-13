---
type: Reference
title: Usage
description: How an app wraps its routes with sessions and handles the errors of a sign-in.
---

# Usage

Every function is a package-level helper that receives the database, and every limit is a setting read through
`packages/virtual/settings` (`auth.*`), so it can change while the programs run.

An app receives the db on creation and wraps its routes with the session middleware:

```go
sessions := auth.Sessions(db)
mux.Handle("GET /me", sessions(auth.RequireSession(me)))
mux.Handle("GET /housekeeping/", sessions(auth.RequireAttribute(db, auth.HousekeepingAccess)(housekeeping)))
```

In a login handler:

```go
_, err := auth.Login(w, r, db, r.PostFormValue("username"), r.PostFormValue("password"), r.PostFormValue("remember") != "")
switch {
case errors.Is(err, auth.ErrInvalidCredentials), errors.Is(err, auth.ErrThrottled):
	// show the form again
case errors.Is(err, auth.ErrBanned):
	ban, _ := errors.AsType[*auth.BanError](err) // ban.Reason; ban.ExpiresAt is zero when permanent
}
```

# Gotchas

- The settings must be loaded (`settings.Load`) before the helpers run; `cms.New` does it.
- The store's pool has one connection, so calling `auth` while holding a transaction blocks forever.
