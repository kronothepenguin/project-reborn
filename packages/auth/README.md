# auth

Sign-in, sessions, access attributes and password resets, shared by the CMS, housekeeping and the installer. Every function is a package-level helper that receives the database, and every limit is a setting read through `packages/virtual/settings` (`auth.*`), so it can change while the programs run.

## Usage

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

## Passwords

- `HashPassword(password)` hashes with argon2id (m=19456 KiB, t=2, p=1, 16-byte salt, 32-byte key) into a PHC string, `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`.
- `VerifyPassword(hash, password)` compares in constant time; its error reports a malformed hash, never a wrong password.
- `NeedsRehash(hash)` reports a hash made with other parameters; `Login` rehashes such a hash after a successful login.
- `ValidatePassword(password)` checks a new password's length in characters against `auth.passwordMinLength` and `auth.passwordMaxLength` and wraps `ErrPasswordLength`.

## Login

`Login(w, r, db, habboName, password, remember)` takes these steps:

1. It refuses with `ErrThrottled` when the IP, and then the habbo's user, reached `auth.loginMaxFailures` failed attempts within `auth.loginWindowMinutes`. Throttled attempts are not recorded.
2. It finds the habbo case-insensitively and checks the owner's password. An unknown habbo and a wrong password both give `ErrInvalidCredentials` after the same argon2 work.
3. Only once the password is right, it refuses an active ban on the user or the IP with a `*BanError`, which matches `ErrBanned`.
4. It records every attempt in `login_attempts`, purges expired sessions, starts the session with the named habbo active and sets the cookie.

## Sessions

- The cookie `reborn_session` holds 32 random bytes in base64url: HttpOnly, SameSite=Lax, `Secure` from `auth.secureCookies`, Path `/`. Only a remember-me cookie carries a Max-Age.
- The database keeps only the SHA-256 digest of the token, as `sessions.id`.
- A session ends after `auth.sessionIdleMinutes` without requests, a remembered one after `auth.rememberDays`. `Sessions` slides the expiry forward, writing at most once a minute, and renews the cookie of a remembered session.
- `Sessions(db)` returns the middleware that puts the session in the context for `FromContext(ctx) (Session, bool)` and clears a cookie without an active session.
- `RequireSession(next)` redirects a page to `/` and answers 401 when the request's `Accept` header names `application/json`.
- `RequireAttribute(db, attr)` answers 403 to a user without `attr`.
- `Logout(w, r, db)` ends the cookie's session, `LogoutEverywhere(ctx, db, userID)` every session of a user, and `SwitchHabbo(ctx, db, avatarID)` changes the active habbo (`ErrNotOwner` for another user's habbo).

## Attributes

The `Attribute` constants and `Catalogue()` (name and description) follow decision 0015 of the port bundle. `Attributes(ctx, db, userID)` is the union of the attributes of the user's access groups.

## Password reset

- `CreateReset(ctx, db, email)` returns the token to email, valid for `auth.resetTokenMinutes`. For an unknown email it returns `""` without an error, so the page answers the same way. Expired resets are purged first.
- The caller builds the link (`site.url` + `/reset/<token>`) and sends the mail.
- `ResetPassword(ctx, db, token, password)` validates the password, then sets it once: every reset of the user is deleted and every session of the user ends. An unknown, used or expired token gives `ErrInvalidReset`.

## Behind a reverse proxy

`RealIP(cfg.Proxy)` returns a middleware that an app puts in front of its routes, outside `Sessions`. With `proxy.enabled` in `config.json`, a request whose connection comes from an address or range in `proxy.trusted` gets the client's address as its `RemoteAddr`, taken from `X-Forwarded-For`: read from the right, skipping trusted proxies, because entries further left come from the client and can be forged. Any other request keeps the connection's address, and with `proxy.enabled` false nothing changes.

## Gotchas

- `RequireSession`, `RequireAttribute` and `SwitchHabbo` read the session that `Sessions` put in the context, so `Sessions` must wrap them.
- Behind a reverse proxy without `RealIP`, or with `proxy.enabled` false, every request has the proxy's IP, so IP throttling and IP bans would hit everyone.
- JSON callers must send `Accept: application/json` to get 401 instead of a redirect.
- The settings must be loaded (`settings.Load`) before the helpers run; `cms.New` does it.
- The store's pool has one connection, so calling `auth` while holding a transaction blocks forever.

Gates, from `packages/auth`:

```sh
gofmt -l .
go vet ./...
go test ./... -race
```
