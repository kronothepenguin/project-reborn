# Quickstart: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-16

How to build, run, and prove the index slice end to end. Details live in
[contracts/http.md](./contracts/http.md),
[contracts/persistence.md](./contracts/persistence.md),
[contracts/ui.md](./contracts/ui.md), and [data-model.md](./data-model.md).
The `store.Must()` accessor and the `database` config section come from the
`013-store-library` addendum; declare them before running the app.

## Prerequisites

- Go 1.27 workspace at the repository root (`go.work` includes `apps/cms`,
  `packages/config`, `packages/store`, `packages/cms`).
- pnpm workspace with `@project-reborn/cms` dependencies installed.
- `sqlite3` available for seeding a manual account.

## 1. Static gates

```sh
# store: parameterless purge, docs, generation
cd packages/store && go vet ./... && go test ./... && make check-docs
go tool sqlc generate && git diff --exit-code

# configuration sections (cms host/port)
cd packages/config && gofmt -l . && go vet ./... && go test ./...

# the CMS package
cd packages/cms && go vet ./... && go test ./...
```

All gates pass; `go test` in `packages/cms` covers the offline render, footer
targets, empty-field errors, nonce accept/reject, throttle lock, invalid
credential with no session, successful sign-in (cookie attributes, session
row, cleared counters), `Guard` invalid/idle/absolute paths, and the lazy
purge.

## 2. Build the frontend

```sh
pnpm --filter @project-reborn/cms build
test -f packages/cms/dist/index.html
grep -c '\[\[ ' packages/cms/dist/index.html   # runtime placeholders survived the build
```

## 3. Run (development)

```sh
cd apps/cms && make dev        # air + Astro dev; server on http://localhost:17387
```

The dev runner hardcodes `localhost:17387`; the Astro proxy target stays
`http://localhost:4321`; the store file comes from the `database` setting
(default `habbo.db`).

## 4. Manual validation

Seed one account (password `habbo`, bcrypt cost 12) once the store file
exists:

```sh
sqlite3 apps/cms/habbo.db "INSERT INTO users (username, username_canonical, password_hash, email, email_canonical, birth_date, avatar, terms_accepted_at, created_at) VALUES ('Holo', 'holo', '$2y$12$IobAjQUW2UBU6jpiEeJNY.MhXCiwUrglnH.cPRoPkD7Ow04xCxbea', 'holo@example.com', 'holo@example.com', strftime('%s', '2008-01-01'), 'female', strftime('%s', 'now'), strftime('%s', 'now'));"
```

Then:

1. **Homepage** — open `http://localhost:17387/`: the UI renders with
   `0 users online now`, "Hotel offline", the join banner linking to
   `/register`, the sign-in card, and the footer links to `/`, `/disclaimer`,
   and `/privacy`. A `__Host-csrf` cookie is set.
2. **Successful sign-in** — submit `holo` / `habbo` through the real form (so
   the hidden `csrf_token` matches). Expect `303` to `/me`, a
   `__Host-session` cookie (`HttpOnly`, `Secure`, `SameSite=Strict`), one
   active row in `sessions`, and no key in `login_attempts`. `/me` itself is
   delivered in Slice 2, so the redirect lands on the static handler's `404`
   for now.
3. **Failure** — submit a wrong password and an unknown username: the same
   "Invalid username or password." paper, the username echoed, no session
   row, no cookie.
4. **Throttle** — five consecutive failures (fresh nonce per page load) then
   a sixth attempt: "Too many attempts. Try again later." The
   `login_attempts` row holds 5 failures and a lock; a correct password is
   blocked until the lock expires.
5. **Remember me** — repeat a successful sign-in with the checkbox: the
   session cookie carries `Max-Age` and the row's `absolute_expires_at` is
   30 days out; without it both stay browser-session.
6. **Nonce** — post the form with `curl` while omitting `csrf_token`: `403`
   with the general error, no session row. Posting with a stale token from an
   earlier page load behaves the same and returns a fresh `__Host-csrf`.
7. **Lazy purge** — mark a session row `revoked_at = 1` (or push
   `absolute_expires_at` into the past), submit a sign-in attempt, and confirm
   the row is gone afterwards.

## 5. Run (production shape)

```sh
pnpm --filter @project-reborn/cms build
cd apps/cms && go run ./cmd/cms
```

On first run `config.json` is created in `apps/cms` from the declared defaults
(`cms.host` `localhost`, `cms.port` `17387`); the store opens at
`database.path` (`habbo.db`). Edit `config.json` for a real deployment; it is
deployment state and is not committed.

## References

- Routes, cookies, errors, and `Guard`: [contracts/http.md](./contracts/http.md)
- Store operations and the parameterless purge: [contracts/persistence.md](./contracts/persistence.md)
- Layouts, components, styles, and the hidden nonce input: [contracts/ui.md](./contracts/ui.md)
- Entities and page data: [data-model.md](./data-model.md)