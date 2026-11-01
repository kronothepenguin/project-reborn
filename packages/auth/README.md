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

## Accounts

Registration and the installer create accounts the same way.

- `ValidateHabboName(name)`, `ValidateEmail(email)`, `ValidateBornOn(bornOn)` and `ValidateLook(figure, gender)` give `ErrHabboName`, `ErrEmail`, `ErrBornOn` and `ErrLook`.
  - Names are 1 to 24 ASCII letters, digits or `- = ? ! @ : . ,`, and those starting with `MOD-` are refused, ignoring case. `ErrHabboNameEmpty`, `ErrHabboNameTooLong` and `ErrHabboNameReserved` say why, and all of them match `ErrHabboName`.
  - An email follows Holo's rule, at 6 to 254 bytes, and a birth date is a past date from 1920, Holo's first valid year.
  - A figure is the dot format of the v2 avatar editor (`hd-180-1.ch-215-82.lg-270-82`), whose parts can leave the colour empty (`ha-1018-`), and the gender is `M` or `F`.
- `CreateAccount(ctx, q, account)` writes the user, the credentials and the first habbo, and returns `userID, avatarID`.
- `CreateHabbo(ctx, q, userID, habbo)` writes a habbo with its profile, home and wallet, plus a `registration` ledger row when it starts with credits.

Both take `*store.Queries` so that the caller keeps its own transaction, and neither validates. A taken email or name comes back as an error that `store.IsConflict` recognises.

```go
hash := auth.HashPassword(password) // before the transaction: argon2 is slow and the pool has one connection
tx, err := db.BeginTx(ctx, nil)
if err != nil {
	return err
}
defer tx.Rollback()
userID, avatarID, err := auth.CreateAccount(ctx, store.New(tx), auth.Account{
	Email: email, BornOn: bornOn, IP: auth.ClientIP(r), PasswordHash: hash,
	Habbo: auth.Habbo{Name: name, Figure: figure, Gender: gender, Credits: 500, Detail: "Welcome!"},
})
if err != nil {
	return err
}
return tx.Commit()
```

## Password reset

- `CreateReset(ctx, db, name, email)` returns the `Reset` to mail, with its token valid for `auth.resetTokenMinutes`, when
  the habbo belongs to the account of that address. For any other pair, and while the account holds `auth.resetMaxActive` unexpired links,
  it returns nil and no error, so a caller can answer the same way in every case.
- `DeleteExpiredResets(ctx, db)` removes the links past `auth.resetTokenMinutes`. A program that offers password resets
  runs it on the scheduler; nothing else deletes them.
- The caller builds the link (`site.url` + `/reset/<token>`) and sends the mail.
- `ResetPassword(ctx, db, token, password)` validates the password, then sets it once: every reset of the user is deleted and every session of the user ends. An unknown, used or expired token gives `ErrInvalidReset`.

## Behind a reverse proxy

`RealIP(cfg.Proxy)` returns a middleware that an app puts in front of its routes, outside `Sessions`. With `proxy.enabled` in `config.json`, a request whose connection comes from an address or range in `proxy.trusted` gets the client's address as its `RemoteAddr`, taken from `X-Forwarded-For`: read from the right, skipping trusted proxies, because entries further left come from the client and can be forged. Any other request keeps the connection's address, and with `proxy.enabled` false nothing changes.

## Gotchas

- `ClientIP(r)` is the connection's address, so it needs `RealIP` in front of it behind a reverse proxy.
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
