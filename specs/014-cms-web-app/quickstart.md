# Quickstart: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-12

Runnable guide to build, test, and validate the feature end to end. Data structures and exact field rules live in [data-model.md](./data-model.md); request/response shapes live in [contracts/http.md](./contracts/http.md); the design decisions referenced below live in [research.md](./research.md).

---

## Prerequisites

- Go 1.27 toolchain (workspace `go.work` already lists `packages/cms`, `packages/store`, `packages/auth`, `apps/cms`)
- pnpm with dependencies installed (`make install` at the repository root)
- No SQLite server; the store is embedded

## 1. Generate and document the store layer

From the repository root, after the `users`, `sessions`, `recovery-tokens`, and `login-attempts` schema and query files exist:

```sh
cd packages/store
go tool sqlc generate
make check-docs
make test          # go vet ./... && go test ./... -race
git diff --exit-code   # regeneration must produce no diff
```

Expected: generated `users.query.sql.go`, `sessions.query.sql.go`, `recovery-tokens.query.sql.go`, and `login-attempts.query.sql.go` plus updated `models.go`, all committed; `check-docs` exits 0; the clean-diff gate is green.

## 2. Build the frontend and run the Go tests

```sh
pnpm --filter @project-reborn/cms build

cd packages/cms
go vet ./...
go test ./...
```

Expected: `dist/index.html`, `dist/register.html`, `dist/forgot.html`, `dist/reset.html`, `dist/me.html`, `dist/client.html`; the Go suite passes (account service, auth adapter, and end-to-end handler tests over a temporary store with a fake mailer, fake status provider, and inline test templates).

Template verification (the built HTML must still contain unrendered placeholders):

```sh
grep -c '\[\[ \.' packages/cms/dist/me.html
grep -c '\[\[ \.' packages/cms/dist/register.html
```

Design-system verification: styles come from Tailwind utilities using the tokens mapped in [contracts/ui.md](./contracts/ui.md#color-mapping-authoritative). Map any new color with the repository tool before using it, and confirm the mapped classes reach the built pages:

```sh
node tools/tw-color/tw-color.mjs "#bce0ee"        # sky-200
grep -o 'max-w-189' packages/cms/dist/index.html
grep -o 'bg-sky-200' packages/cms/dist/index.html
```

## 3. Configuration

All variables have development defaults:

| Variable | Default | Purpose |
|---|---|---|
| `CMS_ADDR` | `localhost:8080` | HTTP listen address |
| `CMS_BASE_URL` | `http://localhost:8080` | Origin check and recovery links; `https` selects hardened cookies (`__Host-session`, `Secure`) |
| `CMS_DB_PATH` | `habbo.db` | Shared SQLite file |
| `CMS_SMTP_ADDR`, `CMS_SMTP_FROM` | empty | SMTP delivery when set |
| `CMS_MAIL_OUTBOX` | `mail-outbox` | Filesystem outbox used when SMTP is not configured |
| `CMS_HELP_URL`, `CMS_TERMS_URL`, `CMS_PRIVACY_URL` | `#` | Navigation/footer links |
| `CMS_FAILURE_MAX`, `CMS_FAILURE_WINDOW`, `CMS_LOCK_DURATION` | `5`, `15m`, `15m` | Throttling (FR-013, SC-010) |
| `CMS_PURGE_INTERVAL` | `1h` | Session purge ticker |

## 4. Run the app

Terminal 1 — Astro dev server:

```sh
pnpm --filter @project-reborn/cms dev        # http://localhost:4321
```

Terminal 2 — Go server that proxies Astro in dev mode:

```sh
cd apps/cms
CMS_DB_PATH=/tmp/opencode/cms-dev.db CMS_MAIL_OUTBOX=/tmp/opencode/mail-outbox go run ./cmd/cms-dev
```

Production-shape run (embedded `dist`): `go run ./cmd/cms` after step 2.

## 5. Validation scenarios

### S1 — Public homepage shows hotel status (FR-001–FR-004, SC-009)

```sh
curl -s http://localhost:8080/ | grep -E 'Sign in|Join now|users online|Powered by ProjectReborn'
```

Expected: the paper frame (`max-w-189`), the first row with the online count in `orange-500`, the two-column layout (banner left, login card right), and the footer rows render. In this first slice the status row shows the sample online values from the stub; the page still loads when no game server exists.

### S2 — Registration with availability check (FR-005–FR-010, SC-001, SC-002)

```sh
curl -s 'http://localhost:8080/register/username?username=newhabbo'      # {"valid":true,"available":true}
curl -s -X POST http://localhost:8080/register \
  -d 'username=NewHabbo&password=secret123&password_confirm=secret123' \
  -d 'birth_day=1&birth_month=1&birth_year=1990' \
  -d 'email=new@example.com&email_confirm=new@example.com' \
  -d 'terms=on&avatar=female'
```

Expected: `303` to `/me`; the same username again reports `available:false`; resubmitting with mismatched emails or unaccepted terms re-renders with specific messages and creates nothing.

### S3 — Sign-in, recognition, and sign-out (FR-014–FR-016, SC-003, SC-006; sign-in/recognition in Slice 1, sign-out in Slice 2)

```sh
curl -i -s -c /tmp/opencode/cookies.txt -X POST http://localhost:8080/ \
  -d 'username=NewHabbo&password=secret123&remember=on' | grep -i '^HTTP\|^Location'
curl -s -b /tmp/opencode/cookies.txt http://localhost:8080/me | grep -E 'NewHabbo'
# Slice 2 only: /me carries the CSRF meta tag and /logout exists once the personal page ships
TOKEN=$(curl -s -b /tmp/opencode/cookies.txt http://localhost:8080/me | grep -o 'name="csrf-token" content="[^"]*"' | cut -d'"' -f4)
curl -i -s -b /tmp/opencode/cookies.txt -X POST http://localhost:8080/logout -d "csrf_token=$TOKEN" | grep -i '^HTTP\|^Location'
```

Expected: `303 /me`; the minimal `/me` placeholder shows the username (avatar, motto, last sign-in time, and the CSRF meta tag arrive with the personal-page slice); after sign-out `/me` redirects to `/`. Invalid credentials produce `Invalid username or password.` without confirming the account.

### S4 — Motto update without leaving the page (FR-027, SC-008)

With a signed-in browser session open on `/me`: edit the motto and save. Expected: the motto updates in place, a reload still shows the new value, and a >128-character motto is rejected with a message.

### S5 — Recovery stays neutral and completes by email (FR-017–FR-021, SC-005)

```sh
curl -s -X POST http://localhost:8080/forgot -d 'username=NewHabbo&email=new@example.com' | grep -i 'sent'
curl -s -X POST http://localhost:8080/forgot -d 'username=ghost&email=ghost@example.com' | grep -i 'sent'
```

Expected: both responses are the same neutral confirmation card. In the default development setup a `.eml` file appears in `CMS_MAIL_OUTBOX` only for the matching request. Open its `/reset?token=…` link, set a new password, and confirm the redirect to `/`; the old password no longer works and previous sessions are revoked.

### S6 — Throttling (FR-013, FR-020, SC-010)

Post the wrong password `CMS_FAILURE_MAX` times, then once more with the right one.

Expected: after the threshold, `Too many attempts. Try again later.` even for the correct password until the lock expires; a request for a non-existent username produces the same generic failure and throttles by address, never confirming existence.

### S7 — Admin-only housekeeping entry (FR-024, SC-007)

```sh
sqlite3 /tmp/opencode/cms-dev.db "UPDATE users SET is_admin = 1 WHERE username = 'NewHabbo';"
```

(If the `sqlite3` CLI is not installed, the same state is exercised by the automated admin-navigation handler test.)

Expected: the housekeeping link appears on `/me` for this member and never for a non-admin; it is absent from the rendered HTML of every other account (`grep` returns nothing).

### S8 — Client entry and protected routes (FR-025, FR-028, SC-011)

```sh
curl -i -s http://localhost:8080/client | grep -i '^HTTP\|^Location'   # 303 /
curl -s -b /tmp/opencode/cookies.txt http://localhost:8080/client | grep -i 'NewHabbo'
```

Expected: unauthenticated access redirects to `/` with no member data; the signed-in client page opens in a separate window from `/me` and identifies the member.

## 6. Automated gates

| Gate | Command | Passing state |
|---|---|---|
| CMS handlers and services | `cd packages/cms && go vet ./... && go test ./...` | all tests pass |
| Store generation | `cd packages/store && go tool sqlc generate && git diff --exit-code` | no diff |
| Store docs | `cd packages/store && make check-docs` | exit 0 |
| Store tests | `cd packages/store && go test ./... -race` | all tests pass |
| Frontend build | `pnpm --filter @project-reborn/cms build` | `dist/*.html` present |

## 7. Out of scope for validation

Tags, mailbox, avatars card, friends/groups/rooms popovers, events, news, recommended content, groups, credits, club, community, account settings, and the client runtime embed are deferred by the specification and must not appear in this feature's pages or navigation.
