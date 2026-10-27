# Feature Specification: CMS Web Application

**Feature Branch**: `014-cms-web-app`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "CMS, this is the web app for the game, it allows users to interact with the system out of the game."

## Background

Project Reborn remakes Habbo Hotel as it was around 2008. The Shockwave client is reimplemented as a browser runtime, and the surrounding hotel services are built as applications around a shared persistence layer; session authentication (012) and the central store (013) already exist as reusable libraries. What the project has never had is the hotel's website.

This specification defines the CMS index view: the public homepage where a visitor sees the hotel's brand and the game's offline status, follows the registration call to action, and signs in. It also defines the index view's backend: credential verification, session establishment with "remember me", failure handling and throttling, and the redirect that follows a successful sign-in. Nothing else of the CMS is defined here; the homepage only points at `/register`, `/forgot`, `/disclaimer`, `/privacy`, and `/me` as routes outside this specification.

## Clarifications

### Session 2026-09-16

- Q: What does the index view scope cover — only the page and its links, or also its backend? → A: Everything related to the index view, backend included: credential verification, session creation, "remember me", throttling, and the redirect after a successful sign-in. (User: "i want to have everything related to index view, even the backend part.")
- Q: How are pages that do not exist yet handled? → A: They are not described; the homepage only keeps links to their final routes, and broken links are acceptable. (User: "instead of mentioning something that does not exists yet, just keep links to that pages"; "it does not matter if the links are broken.")
- Q: Which link targets does the index view carry? → A: `/register` (registration banner and "Register for free" text link), `/forgot` ("I forgot my password/username"), `/me` (redirect after successful sign-in), `/` (footer "Homepage" link and the sign-in form's own submit target), `/disclaimer` (terms of service), and `/privacy` (privacy policy).
- Q: Is there a time requirement for sign-in to reach `/me`? → A: None; sign-in has no time target. (User: "i don't have any time requirement for the sign-in to reach /me within 2 seconds.")
- Q: How does the homepage present the game's status? → A: It always shows the game as offline. (User: "just show offline always.")

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor signs in from the homepage (Priority: P1)

A visitor opens the hotel's homepage, understands what the hotel is, sees that the game is offline, and signs in with an existing account. The homepage is the only page this specification defines.

**Why this priority**: Sign-in is the index view's only action and the first capability of the CMS; without it the homepage cannot identify anyone.

**Independent Test**: From a deployment with one seeded account, open the homepage, submit correct credentials, and assert the visitor is signed in and redirected to `/me`; assert each invalid submission is rejected with a clear message that does not reveal whether the username exists; assert repeated failures are throttled; assert "remember me" extends recognition across browser restarts.

**Acceptance Scenarios**:

1. **Given** a first-time visitor on the homepage, **When** the page loads, **Then** it shows the hotel's brand, the game as offline, a registration call to action linking to `/register`, a sign-in form, and the footer.
2. **Given** a returning member on the homepage, **When** they submit correct credentials, **Then** they are signed in and redirected to `/me`.
3. **Given** a returning member, **When** they submit incorrect credentials, **Then** they stay on the homepage with an error that does not reveal whether the username exists.
4. **Given** a member who chose "remember me", **When** they close and reopen the browser, **Then** they remain recognized; **Given** they did not choose it, **Then** they must sign in again once the browsing session ends.
5. **Given** repeated failed sign-ins, **When** the limit is reached, **Then** further attempts are temporarily blocked with a message.

### Edge Cases

- The username does not exist: the failure message is identical to a wrong password, so neither the page nor its timing reveals account existence.
- A sign-in attempt arrives with a cross-site origin: it is rejected without creating a session.
- Repeated failed sign-ins: they are throttled without revealing whether any account exists.
- The links to `/register`, `/forgot`, `/disclaimer`, `/privacy`, and `/me`: the homepage keeps pointing at those routes even though the pages behind them are outside this specification and may be unavailable.

## Requirements *(mandatory)*

### Functional Requirements

#### Index view (public homepage)

- **FR-001**: The homepage MUST show the hotel's brand and MUST always present the game as offline.
- **FR-002**: The homepage MUST present a prominent registration call to action and a sign-in form accepting a username, a password, and an optional "remember me" choice.
- **FR-003**: The homepage MUST link to `/register` from the registration banner and from the "Register for free" text link in the sign-in card.
- **FR-004**: The homepage MUST link to `/forgot` from the "I forgot my password/username" link in the sign-in card.
- **FR-005**: The homepage MUST show a footer linking to the homepage (`/`), the terms of service (`/disclaimer`), and the privacy policy (`/privacy`), and showing the project copyright.
- **FR-006**: The homepage MUST use the signed-out layout, which presents its content card centered horizontally and vertically.
- **FR-007**: The sign-in form MUST submit to the homepage route (`/`).

#### Sign-in, session, and redirects

- **FR-008**: The sign-in action MUST establish authentication only after successful credential verification, using the project's persisted sessions and a hardened session cookie, and MUST be protected against cross-site requests.
- **FR-009**: Credentials MUST be stored in a form that does not reveal the password, and the system MUST never display, log, or return a password.
- **FR-010**: On successful sign-in the system MUST redirect the member to `/me`; on failed sign-in it MUST keep the visitor on the homepage with an actionable error that does not reveal whether the username exists, retaining the submitted username and never re-displaying the password.
- **FR-011**: "Remember me" MUST extend recognition beyond the browsing session; without it, recognition ends when the browsing session ends.
- **FR-012**: Repeated failed sign-in attempts MUST be throttled or temporarily blocked, with the member informed, and without confirming whether the username exists (default policy: 5 failures within 15 minutes lock the key for 15 minutes).

#### Routes this specification only points at

- **FR-013**: The homepage's links to `/register`, `/forgot`, `/disclaimer`, and `/privacy` MUST point at those routes, and a successful sign-in MUST redirect to `/me`, even though those pages are outside this specification and may be unavailable.

#### Cross-cutting

- **FR-014**: The system MUST present clear, non-technical error messages for every rejected action, and MUST NOT expose internal details.

### Key Entities

- **Account**: a member identity. Unique username and protected password.
- **Session**: an authenticated visit established over the project's session store; the CMS consumes it and never stores credentials.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of invalid sign-in attempts produce a message naming the problem, with no session created.
- **SC-002**: Members who chose "remember me" remain recognized across browser restarts in 100% of tested cases.
- **SC-003**: After a configured number of consecutive failed sign-ins, further attempts are blocked for a period, while a legitimate member can still recover access.
- **SC-004**: 100% of rendered homepage links point at their defined routes (`/`, `/register`, `/forgot`, `/disclaimer`, `/privacy`).

## Assumptions

- One account serves both the CMS and the game client; the CMS verifies accounts and the future game server consumes the same store.
- Session lifetime and cookie protections follow the project's session defaults: idle 30 minutes, absolute 12 hours, remember 30 days; the cookie is `__Host-` with `Path=/`, `HttpOnly`, `Secure`, and `SameSite=Strict`.
- The terms of service and privacy policy pages are outside this specification; the homepage only links to them.
- The look matches the classic hotel style, desktop-first with a fixed layout; small-screen and mobile support are out of scope.
- Modern evergreen browsers are assumed, because the game client runs in them.
- No page other than the index view is defined by this specification; `/register`, `/forgot`, `/disclaimer`, `/privacy`, and `/me` are routes it only points at.
