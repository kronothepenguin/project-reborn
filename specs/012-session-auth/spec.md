# Feature Specification: HTTP Session-Based Authentication Library

**Feature Branch**: `012-session-auth`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "i want to build a library for session-based authentication over http following OWASP recommendations"

## Background

HTTP applications in this project currently implement login and sessions ad hoc, with known security gaps: session credentials are stored in plain form, cookies lack scripting protections, sessions never rotate or expire, and there is no defense against cross-site request forgery. A dedicated authentication package already exists as an empty shell. This feature defines a single session-authentication library, aligned with OWASP guidance, that every HTTP application in the project can consume to create, validate, protect, and revoke sessions. The application remains responsible for verifying credentials; the library takes over from the moment an account is verified.

## Clarifications

### Session 2026-09-11 (resolved — user decisions recorded verbatim)

- **C1 — credential verification ownership: session layer only.** The library begins after the consuming application has verified the account's credentials. Password collection, hashing, verification, brute-force throttling/lockout, and login-failure messaging remain application responsibilities. (User: "Session layer only".)
- **C2 — cross-site request forgery protection: included.** The library issues and validates a per-session anti-forgery value for state-changing requests, using it to complete OWASP session protection. (User: "Include CSRF protection (Recommended)".)
- **C3 — transport security ownership: deployment only.** TLS and secure-transport enforcement are outside the library: the library does not require, enforce, or inspect transport. FR-003 (secure transport) is removed; FR-004 onward retain their identifiers, and FR-005 no longer requires transport security. (User: "FR-003/FR-005 the TLS is not part of this library, we should remove that".)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A verified person logs in and stays recognized until they log out (Priority: P1)

After the application has verified a person's credentials, it asks the library to establish a session; from then on the application recognizes the person on every request until they log out, their session expires, or it is revoked.

**Why this priority**: This is the core of session-based authentication; the security properties below have nothing to protect without it.

**Independent Test**: Wire the library into a test HTTP application exposing a login endpoint, a protected endpoint, and a logout endpoint; exercise the full flow and assert identity resolution and denial outcomes.

**Acceptance Scenarios**:

1. **Given** the application has verified an account's credentials, **When** it requests a session for that account, **Then** a session is established and the next request is recognized as that account.
2. **Given** the application's credential verification fails, **When** the person submits them, **Then** the application does not request a session and no session credential is issued.
3. **Given** an established session, **When** a protected resource is requested, **Then** access is granted with the correct identity.
4. **Given** no session, an expired session, or a revoked session, **When** a protected resource is requested, **Then** access is denied as unauthenticated.
5. **Given** the person has logged out, **When** the previous session credential is replayed, **Then** access is denied.

---

### User Story 2 - Sessions cannot be forged, fixated, or hijacked (Priority: P1)

Session credentials are unguessable, protected in the browser and at rest, rotated when authentication or privilege changes, and bounded by timeouts.

**Why this priority**: A session credential is as powerful as a password; weak generation, storage, or lifetime turns any credential theft into full account takeover.

**Independent Test**: Automated security assertions against the library and its persistent store: entropy/uniqueness sampling, store inspection, cookie attribute inspection, rotation checks, and timeout checks.

**Acceptance Scenarios**:

1. **Given** any issued session, **When** its credential is inspected, **Then** it carries at least 128 bits of entropy from a cryptographically secure source and is unique across issuances.
2. **Given** a client-supplied session credential, **When** a session is created, **Then** the client-supplied value is never adopted as the authenticated session (session fixation).
3. **Given** a session is created for an already-signed-in client, **When** the new session is issued, **Then** a fresh credential replaces the prior one.
4. **Given** the session store, **When** it is inspected, **Then** no stored value can be replayed as a valid session credential.
5. **Given** a session cookie, **When** client-side script or a cross-site request tries to use it, **Then** the cookie is unavailable to scripts and is not attached to cross-site requests.
6. **Given** inactivity beyond the idle timeout, **When** the session is used, **Then** it is rejected; **Given** the absolute lifetime is exceeded, **Then** it is rejected even with continuous activity.
7. **Given** a session has been rotated, revoked, or logged out, **When** the old credential is presented, **Then** it is rejected.

---

### User Story 3 - Compromised sessions can be contained and audited (Priority: P2)

A password change or explicit revocation invalidates sessions so a leaked credential stops working; operators and account owners can see and manage active sessions; session security events are recorded without leaking secrets.

**Why this priority**: Revocability is the main advantage of server-side sessions, and it is what makes incident response possible after a credential leak.

**Independent Test**: Change a password and assert other sessions die; list and revoke sessions and assert immediate rejection; inspect the audit records.

**Acceptance Scenarios**:

1. **Given** an account with active sessions, **When** its sessions are listed, **Then** each session can be identified (creation time, last activity, client origin) and revoked individually or all at once, and revoked credentials stop working immediately.
2. **Given** a successful password change (reported by the application to the library), **When** it completes, **Then** all other sessions for the account are invalidated.
3. **Given** a session lifecycle event (created, rotated, revoked, logged out, expired), **When** it occurs, **Then** it is recorded with timestamp, account reference, outcome, and client origin, and no password, secret, or raw session credential appears in records.

---

### User Story 4 - State-changing requests cannot be forged from another site (Priority: P2)

An authenticated request that changes state is accepted only when it carries proof that it originated from the application, not from a malicious third-party page riding the session cookie.

**Why this priority**: Session cookies are attached automatically by the browser; without request-origin proof, any site can trigger authenticated actions.

**Independent Test**: With an active session, submit state-changing requests with a valid, missing, and forged request-origin proof and assert acceptance and rejection; assert forged requests cannot read the proof cross-origin.

**Acceptance Scenarios**:

1. **Given** an authenticated session, **When** a state-changing request carries the correct request-origin proof, **Then** it is processed.
2. **Given** an authenticated session, **When** a state-changing request is missing the proof or carries an invalid one, **Then** it is rejected without performing the action.
3. **Given** the request-origin proof, **When** it is inspected from another site, **Then** it cannot be read or guessed.

---

### User Story 5 - Sessions survive restarts and scale across instances (Priority: P3)

Active sessions remain valid when the application restarts and are honored consistently by every application instance sharing the store; expired and revoked records do not accumulate forever.

**Why this priority**: Correctness across deployments is required for the library to be usable in practice, but it does not change the security contract.

**Independent Test**: Create sessions, restart the application process, and assert recognition; run two instances against one store and assert consistent accept/reject behavior; assert expired records are removed.

**Acceptance Scenarios**:

1. **Given** active sessions, **When** the application restarts, **Then** those sessions remain valid.
2. **Given** two application instances sharing storage, **When** a session is created on one, **Then** it is recognized on the other and revocation on either is honored by both.
3. **Given** expired or revoked sessions, **When** cleanup runs, **Then** their records are removed without affecting active sessions.

---

### Edge Cases

- The client presents several session cookies, a malformed value, or an oversized value: treated as unauthenticated, with no internal detail exposed in the failure response.
- Concurrent requests occur during session rotation: at most one credential is valid at any moment; a request using the retired credential is treated as unauthenticated.
- The session store is unavailable or errors while validating: access fails closed (denied); authentication never silently succeeds.
- Session creation is requested for an account that cannot be resolved in persistent storage: creation fails closed and no partial session is stored.
- "Remember me" persistent sessions: longer absolute lifetime, but the same protections (cookie hardening, at-rest protection, revocation) apply.
- Activity during a session extends the idle deadline but never the absolute lifetime.
- Passwords or roles change while multiple sessions are active: all other sessions are invalidated; the session performing the change remains valid.
- Clock differences between application instances must not extend the absolute lifetime or revive an expired session.
- Clients whose network address or user agent changes are not locked out by session validation itself (address binding is deliberately not used).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST establish sessions only on an explicit request from the consuming application after that application has verified the account's credentials; the library MUST NOT collect, transmit, hash, or verify passwords.
- **FR-002**: System MUST create a session with a fresh credential on every session-creation request and MUST NOT adopt any session credential supplied by the client (prevents session fixation).
- **FR-004**: System MUST generate session credentials from a cryptographically secure random source with at least 128 bits of entropy, and each credential MUST be unique.
- **FR-005**: System MUST deliver session credentials only in cookies marked inaccessible to client-side scripts, restricted to same-site requests, and scoped to the application.
- **FR-006**: System MUST NOT persist raw session credentials; only a one-way derived value may be stored, so stored records cannot be replayed as valid sessions.
- **FR-007**: System MUST resolve the authenticated account from the session credential on every request, and MUST reject unknown, malformed, expired, or revoked credentials.
- **FR-008**: System MUST enforce an idle timeout and an absolute session lifetime; exceeding either requires a new session from the application. Both MUST be configurable with secure defaults.
- **FR-009**: System MUST rotate the session credential on privilege changes (for example, password change or role change) while preserving the logical session.
- **FR-010**: System MUST invalidate the session server-side and clear the client cookie on logout; the credential MUST NOT be usable afterwards, and logout MUST be idempotent.
- **FR-011**: System MUST automatically revoke all other sessions when the application reports that the account's password changed (the bulk-revoke operation itself is required by FR-014).
- **FR-012**: System MUST protect authenticated state-changing requests against cross-site request forgery with a per-session value that is validated on every such request and cannot be read cross-origin.
- **FR-013**: System MUST record session security events (created, rotated, revoked, logged out, expired) with timestamp, account reference, outcome, and client origin; records MUST NOT contain passwords, secrets, or raw session credentials.
- **FR-014**: System MUST expose operations to list an account's active sessions with identifying metadata and to revoke a specific session or all sessions.
- **FR-015**: Library MUST be reusable by any HTTP application in the project without being coupled to specific routes, page layouts, or a single application; it provides authentication primitives while applications own their endpoints and pages.
- **FR-016**: All security-relevant settings (timeouts, cookie attributes, entropy, rotation policy) MUST be configurable, with secure defaults.
- **FR-017**: System MUST persist sessions so they survive application restarts and are honored consistently by every application instance sharing the store.
- **FR-018**: System MUST remove expired and revoked session records so storage remains bounded.
- **FR-019**: System MUST fail closed: if session state cannot be validated (for example, storage unavailable or erroring), protected access MUST be denied and authentication MUST NOT silently succeed.

### Key Entities *(include if feature involves data)*

- **Account**: the identity a session belongs to; established and credential-verified by the consuming application before any session request. This feature neither creates accounts nor touches credential material.
- **Session**: an authenticated login. Holds an opaque credential (raw value never stored), the account reference, creation time, last-activity time, idle deadline, absolute deadline, revocation state, and client-origin metadata (for example, user agent and network address for display/invalidation only).
- **Security event**: a timestamped audit record of a session action, with account reference, outcome, and client origin, and no secrets or raw credentials.
- **Request-origin proof**: a per-session value that a client must present for state-changing requests; bound to the session and never readable cross-origin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new HTTP application can add session creation after successful login, protected-access checks, and logout by calling the library, requiring no security-sensitive code written by the application itself, as verified end-to-end by the quickstart test app.
- **SC-002**: 100% of the OWASP-derived session control checks defined for this feature pass automated verification (credential entropy, cookie protections, rotation, timeouts, revocation, cross-site request forgery protection, fail-closed behavior, at-rest protection).
- **SC-003**: Attack simulations achieve zero successes: fixation, replay after rotation/logout/revocation, script access to the session cookie, and cross-site state-changing requests.
- **SC-004**: A captured session-store snapshot yields zero usable session credentials when inspected.
- **SC-005**: Sessions survive application restarts and are accepted or rejected consistently by multiple instances sharing the store; expired records are removed so storage does not grow without bound.
- **SC-006**: Session validation adds no perceptible delay: 95% of authenticated requests incur less than 10 ms of added processing under expected load.

## Assumptions

- The library is server-side, for this project's HTTP applications; end users use browsers.
- HTTPS/TLS is provided and enforced by the deployment; transport security is outside the library's responsibility (decision C3), and the library neither requires nor inspects the connection's transport.
- Accounts and credential material already exist in the project's persistent store; the consuming application verifies credentials before requesting a session (decision C1).
- Credential hashing, brute-force throttling/lockout, and login-failure messaging are application responsibilities, outside this library (decision C1).
- Server-side, revocable sessions are used; self-contained tokens (not revocable) are out of scope.
- Multiple concurrent sessions per account are allowed by default; each is independently revocable.
- Initial secure defaults (all configurable): idle timeout 30 minutes, absolute lifetime 12 hours, persistent "remember me" lifetime 30 days.
- Existing sessions created by the current ad-hoc implementation need not survive migration; users may be asked to log in again.
- In scope: session lifecycle, session administration, cross-site request forgery protection, and session audit events.
- Out of scope: credential verification and password hashing, registration and password-reset user interfaces, brute-force throttling/lockout, multi-factor authentication, federated/social login, game-socket authentication, and any stateless token scheme.

## Dependencies & Scope Boundaries

- **Depends on**: the project's persistent storage for sessions; HTTP applications that consume the library; the consuming application's credential verification.
- **Consumed by**: all HTTP applications requiring login (for example, the CMS and future web surfaces); the game server's own socket protocol is not affected.
- **Boundary**: the library provides session authentication primitives; transport security (TLS) is owned by the deployment; application routing, pages, credential verification, and user-interface flows remain the responsibility of each consuming application.
