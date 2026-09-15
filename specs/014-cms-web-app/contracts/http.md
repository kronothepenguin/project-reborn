# HTTP Contract: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-12

The CMS exposes one HTTP surface served by Go on the same origin as its Astro templates. Route registration lives in `packages/cms/cms.go` `Mount`; handlers live one per file in `packages/cms/internal/router/` (routes → files per research R14). Pages are rendered by `astro.WriteTemplate` with the built template name; JSON endpoints return `application/json`.

---

## Routes

| Method | Path | Handler | Access | Success | Failure |
|---|---|---|---|---|---|
| GET | `/{$}` | `HandleIndexView` | public | `200 index.html` | — |
| POST | `/{$}` | `HandleIndexLogin` | public + origin check | `303 /me` | `200 index.html` with errors |
| GET | `/register` | `HandleRegisterView` | public | `200 register.html` | — |
| POST | `/register` | `HandleRegisterAction` | public + origin check | `303 /me` | `200 register.html` with errors |
| GET | `/register/username` | `HandleRegisterUsername` | public | `200 JSON` | `400` malformed query |
| GET | `/forgot` | `HandleForgotView` | public | `200 forgot.html` | — |
| POST | `/forgot` | `HandleForgotAction` | public + origin check | `200 forgot.html` (confirmation) | `200 forgot.html` with form error |
| GET | `/reset` | `HandleResetView` | public | `200 reset.html` | `200 reset.html` invalid state |
| POST | `/reset` | `HandleResetAction` | public + origin check | `303 /` | `200 reset.html` with errors/invalid state |
| GET | `/me` | `HandleMeView` | session | `200 me.html` | `303 /` |
| POST | `/me/motto` | `HandleMeMotto` | session + CSRF | `200 JSON` | `401`/`403`/`422 JSON` |
| POST | `/logout` | `HandleLogout` | session + CSRF | `303 /` | `303 /` |
| GET | `/client` | `HandleClientView` | session | `200 client.html` | `303 /` |

The static file handler is registered last on `/`.

---

## Middleware

| Middleware | Applied to | Behaviour |
|---|---|---|
| Origin check (research R6) | every unsafe public route: `POST /{$}`, `POST /register`, `POST /forgot`, `POST /reset` | When `Origin` (fallback `Referer`) is present and its scheme+host differ from `CMS_BASE_URL`, respond `403` without processing. Absent header passes (non-browser clients). |
| `protectPage` | `GET /me`, `GET /client`, `POST /logout` | `auth.Protect` with `WithUnauthorizedHandler` redirecting to `/`; POST requests additionally require the session CSRF token; failures render the redirect/forbidden response, never member data. |
| `protectAPI` | `POST /me/motto` | `auth.Protect` with a JSON `401 {"error":"sign in required"}` unauthorized handler and JSON `403` forbidden handler so Svelte sees JSON, not HTML redirects. |

The page-protection and API-protection closures are configured once in `Mount` (research R15).

---

## Forms

All forms post `application/x-www-form-urlencoded`.

### Sign in — `POST /{$}`

| Field | Required | Rules |
|---|---|---|
| `username` | yes | Trimmed; used canonically |
| `password` | yes | Never echoed |
| `remember` | no | Present (`on`/`true`) → extended recognition (FR-015) |

Behaviour: origin check → throttle check (`ip:<address>` and `u:<canonical-username>`) → credential verification → on success clear the account key, update `last_signed_in_at`, `auth.Create`, redirect `303 /me`; on failure record the failure and re-render with the generic message `Invalid username or password.` (never confirming the username exists, FR-013). A locked key renders `Too many attempts. Try again later.` The entered username is echoed back; the password never is.

### Registration — `POST /register`

| Field | Required | Rules |
|---|---|---|
| `username` | yes | 3–15 of `[A-Za-z0-9_-]`; available |
| `password` | yes | 8–72 bytes |
| `password_confirm` | yes | Matches `password` |
| `birth_day`, `birth_month`, `birth_year` | yes | Real date, not future, year ≥ 1900 |
| `email` | yes | Valid address, ≤ 254 chars, unused |
| `email_confirm` | yes | Matches `email` |
| `newsletter` | no | Recorded consent |
| `terms` | yes | Must be accepted |
| `avatar` | yes | `female` or `male` |

Behaviour: validate all fields and collect per-field errors → on success create the account in one store call, `auth.Create`, redirect `303 /me`; on failure re-render with every message and all entered values except passwords (FR-008).

### Username availability — `GET /register/username?username=…`

Response `200`:

```json
{ "valid": true, "available": false }
```

`valid=false` for a rule-breaking name; `available=false` for a taken name. Nothing else is disclosed (FR-007). The endpoint is safe to call repeatedly (no state change).

### Recovery request — `POST /forgot`

| Field | Required | Rules |
|---|---|---|
| `username` | yes | Canonical lookup |
| `email` | yes | Valid address, canonical lookup |

Behaviour: throttle (`ip:` and `r:` keys) → when username and email match one account, delete its previous tokens, store a new token digest, and email the reset link; when they do not match, do nothing. Either way respond `200` with the identical confirmation card (FR-019) containing the link back to `/`. A locked key still renders the confirmation; the request is dropped (never confirms existence, FR-020). A delivery failure after a match is logged internally and never changes the response (FR-021).

### Reset — `GET /reset?token=…` and `POST /reset`

`GET` validates the token: active → reset form; unknown, used, or expired → invalid state with a link back to `/` and to `/forgot`.

`POST` fields: `token` (hidden), `password` (8–72 bytes), `password_confirm` (must match). On success: update the password hash, mark the token used, revoke every session of the account (`auth.RevokeAll`), redirect `303 /` where the signed-out homepage is shown. On failure re-render with errors; an invalid token returns the invalid state. Other sessions are revoked even though this request is unauthenticated (012 FR-011 requires every session to be invalidated on a password change).

### Sign out — `POST /logout`

Field `csrf_token`. Behaviour: `auth.Logout` (revokes the presented session, always clears the cookie), redirect `303 /`. An absent/invalid session still ends at `/`.

### Motto — `POST /me/motto` (AJAX)

Request body `application/json`:

```json
{ "motto": "hello hotel" }
```

Header `X-CSRF-Token: <session token>`. Behaviour: trim; reject > 128 characters or control characters with `422 {"error":"…"}`; on success persist and return `200 {"motto":"hello hotel"}`. No session → `401 {"error":"sign in required"}`; bad/missing CSRF → `403 {"error":"invalid request"}`.

---

## Redirects and status summary

| Case | Status |
|---|---|
| Successful login/registration/logout/reset | `303` (Post/Redirect/Get) |
| Validation or credential failure | `200` re-render with errors |
| Unauthenticated page access | `303 /` |
| Unauthenticated AJAX | `401` JSON |
| CSRF failure | `403` (JSON on API routes, default forbidden handler on pages) |
| Cross-site public POST | `403` |
| Unknown route | static handler (`404`) |

## Template data handed to pages

Every signed-out page also receives the shared layout data `.Online`, `.IsUp`, `.TermsURL`, `.PrivacyURL` (from `status.Provider` and `Deps.Links`); the rows below list page-specific values only. In the index slice, `me.html` renders only the signed-in username; the remaining `me` values arrive with the personal-page slice.

| Page | Data |
|---|---|
| `index.html` | `.Online`, `.IsUp`, `.TermsURL`, `.PrivacyURL`, `.Values.Username`, `.Errors.Username`, `.Errors.Password`, `.Errors.General` |
| `register.html` | `.Online`, `.IsUp`, `.TermsURL`, `.PrivacyURL`, `.Values.*` and `.Errors.*` for every field above, `.AvatarOptions` |
| `forgot.html` | `.Online`, `.IsUp`, `.Submitted`, `.Values.Username`, `.Values.Email`, `.Errors.Username`, `.Errors.Email`, `.PrivacyURL`, `.TermsURL` |
| `reset.html` | `.Online`, `.IsUp`, `.TermsURL`, `.PrivacyURL`, `.Token`, `.Valid`, `.Values.*`, `.Errors.Password`, `.Errors.PasswordConfirm` |
| `me.html` | `.Username`, `.Motto`, `.Avatar`, `.LastSignedIn`, `.IsAdmin`, `.CSRF`, `.HelpURL` |
| `client.html` | `.Username` |

All runtime values render through `[[ ]]` placeholders only; Svelte components receive no server data through props except simple scalars (research R10).
