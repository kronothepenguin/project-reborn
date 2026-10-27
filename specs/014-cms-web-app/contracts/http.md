# HTTP Contract: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-16

The CMS serves one HTTP surface from Go on the same origin as its Astro
templates. Route registration lives in `packages/cms/cms.go` `Mount`; handlers
live one per file in `packages/cms/internal/router/`. Pages render through
`astro.WriteTemplate` with the built template name; JSON endpoints (Slice 2)
return `application/json`. The static handler is registered last on `/`.

## Routes

| Slice | Method | Path | Handler | Access | Success | Failure |
|---|---|---|---|---|---|---|
| 1 | GET | `/{$}` | `HandleIndexView` | public | `200 index.html` | — |
| 1 | POST | `/{$}` | `HandleIndexLogin` | public + nonce | `303 /me` | `200 index.html` with errors |
| 2 | GET/POST | `/register` | `HandleRegisterView` / `HandleRegisterAction` | public + nonce | `200` / `303 /me` | re-render with per-field errors |
| 2 | GET | `/register/username` | `HandleRegisterUsername` | public | `200 JSON` | `400` malformed query |
| 2 | GET | `/me` | `HandleMeView` | session (`Guard`) | `200 me.html` | `303 /` |
| 2 | POST | `/me/motto` | `HandleMeMotto` | session + CSRF | `200 JSON` | `401`/`403`/`422 JSON` |
| 2 | POST | `/logout` | `HandleLogout` | session | `303 /` | `303 /` |
| 2 | GET | `/client` | `HandleClientView` | session (`Guard`) | `200 client.html` | `303 /` |
| 3 | GET/POST | `/forgot` | `HandleForgotView` / `HandleForgotAction` | public + nonce | `200` confirmation | re-render with error |
| 3 | GET | `/reset` | `HandleResetView` | public | `200 reset.html` | `200` invalid-token state |
| 3 | POST | `/reset` | `HandleResetAction` | public + nonce | `303 /` | re-render with errors |

Slice 1 implements the first two rows; the rest are the delivery roadmap for
Slices 2 and 3 and gain their contracts when those slices start.

## Cookies

| Name | Issued | Attributes |
|---|---|---|
| `__Host-session` | successful `POST /{$}` and every `Guard` refresh | `Path=/`, `HttpOnly`, `Secure`, `SameSite=Strict`, no `Domain`; `Max-Age` = 30 d only when `remember`; cleared with a past expiry when invalid or terminal |
| `__Host-csrf` | `GET /{$}` when absent; also after a failed nonce check | `Path=/`, `HttpOnly`, `Secure`, `SameSite=Strict`, no `Domain`, session cookie |

`Secure` works in local development because browsers treat `localhost` as a
trustworthy origin, so the same hardened cookie serves every deployment.

## `GET /{$}`

1. Read the `__Host-csrf` cookie; when absent, generate 32 random bytes, store
   them base64url in the cookie, and use that value as the nonce.
2. Render `index.html` with `CSRFToken` set and empty `Values`/`Errors`.
3. Respond `200`.

## `POST /{$}`

The nonce is checked before any credential or throttle work, so a cross-site
post cannot reach verification.

1. `req.ParseForm`; a parse failure responds `400`.
2. Nonce check: the form's `csrf_token` must equal the `__Host-csrf` cookie
   (`crypto/subtle` compare). Missing or mismatched → re-render the homepage
   with `Errors.General` = "Sign-in could not be completed. Please try again."
   and a freshly generated `__Host-csrf` cookie, status `403`. No credential
   or throttle work happens.
3. Field checks: empty `username` → `Errors.Username`; empty `password` →
   `Errors.Password`; either present → re-render `200` with the username
   echoed and no store access.
4. Throttle check: `store.GetLoginAttempt(ctx, canonical)`; when the stored
   lock is still in the future → re-render `200` with `Errors.General` =
   "Too many attempts. Try again later."
5. Lazy purge: `store.PurgeSessions(ctx)` removes revoked and past-deadline
   rows.
6. Verify: `store.GetUserByUsername(ctx, canonical)`; an absent row is treated
   as a credential failure while still performing the dummy bcrypt comparison.
   A present row is checked with `bcrypt.CompareHashAndPassword` against
   `password_hash`.
7. Failure path: `store.UpsertLoginFailure` with the canonical key,
   `now-window`, `now`; re-read the attempt and call
   `store.LockLoginAttempt(now+lock, key)` when `failures >= 5`. Re-render
   `200` with `Errors.General` = "Invalid username or password."
8. Success path: `store.MarkUserSignedIn(now, user.ID)`,
   `store.ClearLoginAttempt(ctx, key)`, `store.CreateSession` with the digest
   key and deadlines from [data-model.md](../data-model.md), set the
   `__Host-session` cookie, and redirect `303` to `/me`. A store failure while
   creating the session → re-render `200` with `Errors.General` =
   "Sign-in is unavailable right now. Please try again."

Throttle constants (spec FR-012 defaults, named in `index.go`): window
15 min, limit 5, lock 15 min.

## `Guard`

`func (r *Router) Guard(next http.Handler) http.Handler` is the session
gateway for member pages; Slice 1 ships and tests it, and Slice 2 mounts it on
`/me` and `/client`.

1. Read `__Host-session`; absent, malformed, or when `store.GetSession`
   reports no row → clear the cookie and redirect `303` to `/`.
2. Row revoked or `absolute_expires_at <= now` → clear the cookie and
   redirect `303` to `/`.
3. `idle_expires_at <= now < absolute_expires_at` → `store.TouchSession(now,
   now+idle)` refresh, then continue.
4. Otherwise continue to `next` unchanged; the route reads the account id from
   the session row.
5. Purge revoked and expired rows lazily on the same request.

## Error shapes

- Failed sign-in: `200` re-render with page errors; no redirect, no session.
- Nonce failure: `403` re-render with a general error and a fresh nonce.
- Malformed form: `400` plain text.
- Store failure during session creation: `200` re-render with the
  "unavailable" error; no session row or cookie is left behind.
- Unknown route: the static handler answers `404`.

No response contains a password, session token, digest, or store error detail
(spec FR-009, FR-014).

## Template data

| Page | Slice | Data |
|---|---|---|
| `index.html` | 1 | `CSRFToken`, `Values.Username`, `Errors.Username`, `Errors.Password`, `Errors.General` |
| `me.html` | 2 | `Username`, `Motto`, `Avatar`, `LastSignedIn`, `IsAdmin`, `CSRF`, `HelpURL` |
| `client.html` | 2 | `Username` |
| `forgot.html` | 3 | `Submitted`, `Values.Username`, `Values.Email`, `Errors.Username`, `Errors.Email` |
| `reset.html` | 3 | `Token`, `Valid`, `Values.*`, `Errors.Password`, `Errors.PasswordConfirm` |

The signed-out header (zero online count, hotel offline) and footer routes are
static markup in `signed-out.astro`; only the values above reach the templates
through `[[ ]]`. Slice 2 Svelte components receive no server data through
props except simple scalars.