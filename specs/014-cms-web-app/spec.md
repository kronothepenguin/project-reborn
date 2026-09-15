# Feature Specification: CMS Web Application

**Feature Branch**: `014-cms-web-app`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "CMS, this is the web app for the game, it allows users to interact with the system out of the game." Detailed page inventory: `packages/cms/prompt.md`.

## Background

Project Reborn remakes Habbo Hotel as it was around 2008. The Shockwave client is reimplemented as a browser runtime, and the surrounding hotel services are built as applications around a shared persistence layer; session authentication (012) and the central store (013) already exist as reusable libraries. What the project has never had is the hotel's website.

This feature defines the CMS: the public and member-facing web application of the hotel, the surface where people interact with the system out of the game. Visitors discover the hotel, see how many people are connected, register, and sign in; members land on a personal page from which they can update their identity and enter the game client. The CMS consumes the project's session library for authentication and the central store for persistence; it does not reimplement either. Account creation and credential verification belong to the CMS, as decided by the session-authentication specification (012).

This first release is deliberately foundational. It delivers the public pages a visitor needs to find the hotel and create an account, the forgotten-password view, the signed-out and signed-in layouts, and a basic personal page. The member navigation ships simplified and grows as later member features are specified; content areas are deferred to the specifications that implement them, because those features — and the future game server that shares their data — are better described when they are built. The driving page inventory is recorded in `packages/cms/prompt.md`.

## Clarifications

### Session 2026-09-12 (resolved — user decisions recorded)

- **C1 — scope: public pages and a basic member shell.** This feature delivers the homepage, registration, sign-in/sign-out, the forgotten-password view, both layouts, and a basic personal page without the content cards. Homepage tag display, mailbox, avatars, events, news, recommended, tags, groups, credits, club, community, account settings, and my page are deferred to the specifications that implement them. (User: "index + register, basic me without content layout only. many of the pages are better describe later to implement full feature rather than keep repeating this in the future, because the future server app will require the same data and updates.") **Delivery slices (resolved 2026-09-12):** Slice 1 (this branch) = index view with working sign-in; Slice 2 = registration plus the personal page; Slice 3 = recovery. See Delivery Slices below.
- **C2 — account recovery as a forgot view.** The forgotten-password flow is a signed-out view: a card with a username input, an email input, and a request-information action; after the request a neutral "false alarm" confirmation card (the confirmation card; "false alarm" is the user's wording) with a link back to the index. (User: "include recovery as forgot view: signed out layout; forgot password card with username input, email input and request information button; false alarm card with back to index link".)
- **C3 — game-dependent areas omitted; navigation simplified.** In-game room events, groups and group purchase, friends, rooms, credits, and club are not part of this feature; the signed-in navigation carries only the basics and extra pages are added as new features are specified. (User: "omit everything, as i said, better build basic pages now, also simplify the navigation, we will add extra pages as we add new features.")
- Q: What should this first slice deliver for the index view — only the page rendering, or the page plus a working sign-in? → A: Page plus working sign-in: credential verification, session creation, and redirect to `/me`; registration, the personal page, and recovery are clarified and delivered in later slices. (User: "i want to build the index view (page) only for now, i will clarifly later for register, me, forgot.")
- Q: While the register and forgot pages are deferred, what should the homepage's "Join now", "Register for free", and "I forgot my password/username" links do? → A: Real routes now: the links point at `/register` and `/forgot` and return not-found until those slices ship. (User: "Real routes now".)
- Q: With no game server yet, what should the homepage's "users online now" count and server status show in this first slice? → A: Static sample values: the stub shows a sample count and online badge for design review until the game-server integration. (User: "Static sample values".)

### Out of Scope (deferred to later specifications)

- Homepage tag display and member tags.
- Mailbox and private messages.
- Avatars card, friend invitations, member avatars search, and the friends/groups/rooms quick views.
- In-game room events, news, recommended content, groups, and group purchase.
- Credits and club areas and the destinations behind their links.
- Community, account settings, my page, and club pages.
- The contents of the game client window beyond the CMS entry point.

## Delivery Slices

- **Slice 1 (this branch)** — homepage and sign-in (User Story 1a).
- **Slice 2** — registration and username availability (User Story 1b), the personal page and signed-in layout (User Story 2), sign-out, and the client entry.
- **Slice 3** — password recovery (User Story 3).

The Clarifications scope above describes the feature's eventual scope; `tasks.md` records the slice currently being implemented.

## User Scenarios & Testing *(mandatory)*

### User Story 1a - A visitor signs in from the homepage (Priority: P1 — Slice 1)

A visitor opens the hotel's homepage, understands what the hotel is, sees how many people are connected, and signs in. Returning members sign in from the homepage and sign out when they are done.

**Why this priority**: Without sign-in there is no CMS; every later member capability depends on it. Together with registration (Story 1b) and the basic personal page (Story 2) it is the minimum viable product.

**Independent Test**: From a deployment with one seeded account, open the homepage, submit correct credentials, and assert the member arrives signed in at `/me` (a minimal protected placeholder in Slice 1); assert each invalid submission is rejected with a clear message that does not reveal whether the username exists. Sign-out and sign-back-in are exercised when the signed-in layout ships in Slice 2.

**Acceptance Scenarios**:

1. **Given** a first-time visitor on the homepage, **When** the page loads, **Then** it shows the hotel's brand, whether the hotel is online, the number of users connected to the game, a registration call to action, a sign-in form, and the footer.
2. **Given** a returning member on the homepage, **When** they submit correct credentials, **Then** they are signed in and land on their personal page (the placeholder in Slice 1).
3. **Given** a returning member, **When** they submit incorrect credentials, **Then** they stay on the homepage with an error that does not reveal whether the username exists.
4. **Given** a member who chose "remember me", **When** they close and reopen the browser, **Then** they remain recognized; **Given** they did not choose it, **Then** they must sign in again once the browsing session ends.
5. **Given** a signed-in member, **When** they sign out, **Then** the homepage shows the signed-out state and the member area is no longer reachable without signing in again. Delivers in Slice 2.

---

### User Story 1b - A visitor registers (Priority: P1 — Slice 2)

A visitor registers through the registration page: choosing a username and checking it is free, providing account details, accepting the terms, and picking an initial avatar. On success the visitor is already signed in and lands on their personal page.

**Why this priority**: Registration creates the accounts every later member capability depends on; it is the entry point for new members.

**Independent Test**: From a deployment with no accounts, open the registration page, complete registration, and assert the member arrives signed in on the personal page; assert each invalid input is rejected with a specific message and no account is created.

**Acceptance Scenarios**:

1. **Given** a visitor registering, **When** they submit valid details with an available username, **Then** an account is created, they are signed in, and they land on their personal page.
2. **Given** a visitor registering, **When** they check a username, **Then** availability is reported without leaving the page; **When** the username is already taken, **Then** registration is rejected with a specific message.
3. **Given** a visitor registering, **When** any input is invalid (password confirmation mismatch, invalid or future birth date, malformed or mismatched email, duplicate email, unaccepted terms), **Then** registration is rejected with a message naming the problem and no account is created.

---

### User Story 2 - A member has a basic personal page (Priority: P1 — Slice 2)

After signing in or registering, the member sees the signed-in layout and their personal page: avatar, username, motto, and last sign-in time. They can change their motto in place, enter the game client from the layout, and administrators additionally see the housekeeping entry.

**Why this priority**: The personal page is the destination of every sign-in and the shell that every later member feature will hang from; sign-in without it delivers nothing.

**Independent Test**: Sign in as a member and assert the personal page shows the member's identity data, the simplified navigation, and the client entry; change the motto and assert it persists across a reload; sign in as an administrator and as a non-administrator and compare the navigation.

**Acceptance Scenarios**:

1. **Given** a signed-in member, **When** the personal page loads, **Then** it shows the member's avatar, username, motto, and last sign-in time, with the signed-in navigation.
2. **Given** the personal page, **When** the member edits the motto, **Then** the new motto is saved without leaving the page and is still there after a reload.
3. **Given** a signed-in member, **When** they choose to enter the client, **Then** the game client opens in a separate window identified as the signed-in member.
4. **Given** an administrator, **When** the signed-in navigation renders, **Then** the housekeeping entry is present; **Given** a non-administrator, **Then** it is absent.
5. **Given** a signed-in member, **When** any member page renders, **Then** the current section is shown as plain text rather than a link.
6. **Given** an unauthenticated visitor, **When** they request a member page, **Then** they are returned to the signed-in-required state without any member data being exposed.

---

### User Story 3 - A visitor recovers a forgotten password (Priority: P2 — Slice 3)

From the homepage's forgotten-password link, the visitor sees the forgot view in the signed-out layout: a card with a username input, an email input, and a request-information action. After requesting, a neutral confirmation card appears — the same whether or not the details matched an account — with a link back to the index.

**Why this priority**: Members who lose their password must be able to regain access, but the hotel is usable without it and delivery depends on email.

**Independent Test**: Submit a recovery request for a known account and for an unknown one and assert both produce the identical neutral confirmation; assert that a matching request results in recovery information being sent to the registered email address and that repeated requests are throttled.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor following the forgotten-password link, **When** the forgot view loads, **Then** it uses the signed-out layout and shows a card with username and email inputs and a request-information action.
2. **Given** the forgot view, **When** the visitor submits details matching an account, **Then** recovery information is sent to that account's registered email address and the confirmation card is shown.
3. **Given** the forgot view, **When** the visitor submits details that match no account, **Then** the same confirmation card is shown and nothing is sent, so the response reveals nothing about whether the account exists.
4. **Given** the confirmation card, **When** the visitor follows its link, **Then** they return to the index.
5. **Given** repeated recovery requests in a short period, **When** they are submitted, **Then** they are throttled without revealing whether any account exists.

---

### Edge Cases

- The game server is unreachable: the homepage still loads and shows a clear offline status in place of live game data.
- Two visitors register the same username at nearly the same time: exactly one account is created; the other receives a specific "already taken" message.
- A username is taken between the availability check and submission: registration is rejected cleanly.
- The session expires while the member is using a member page: the action fails with a message that sign-in is required, and no partial change is saved.
- A member is signed in and signs in again as another account: the previous session is replaced, not duplicated.
- A motto, username, email, or other input exceeds its allowed length: input is rejected with a specific message.
- A birth date in the future or a malformed date is submitted: registration is rejected.
- A member selects a female or male avatar: the choice is recorded and shown consistently on the personal page.
- The same email is used by an existing account: registration is rejected with a specific message.
- Recovery is requested for a non-existent account: the response is the identical neutral confirmation with nothing sent.
- Email delivery fails after a request that matched an account: the confirmation stays neutral and the failure is handled without exposing account existence.
- Recovery requests are repeated rapidly: requests are throttled.
- A member opens the client without an active session: the client entry requires sign-in first.
- An unauthenticated visitor requests a member page directly: they are returned to the signed-in-required state without exposing member data.
- While the registration and recovery pages are not yet delivered, the homepage links point at their final routes (`/register`, `/forgot`) and return not-found until those slices ship.

## Requirements *(mandatory)*

### Functional Requirements

#### Public site

- **FR-001**: The public homepage MUST show the hotel's brand, whether the hotel is online, and the number of users currently connected to the game (not the number signed in to the website).
- **FR-002**: The public homepage MUST present a prominent registration call to action and a sign-in form accepting a username, a password, and an optional "remember me" choice.
- **FR-003**: The public site MUST show a footer linking to the homepage, the terms of service, and the privacy policy, and showing the project copyright.
- **FR-004**: Public pages MUST use the signed-out layout, which presents its content card centered horizontally and vertically.

#### Registration (Slice 2)

- **FR-005**: Registration MUST collect a username, a password and its confirmation, a birth date, an email address and its confirmation, optional newsletter consent, acceptance of the terms of service, and a choice of initial avatar between a female and a male appearance.
- **FR-006**: Registration MUST offer a username availability check that works without leaving the page and before final submission.
- **FR-007**: Usernames and email addresses MUST be unique; availability responses MUST reveal nothing beyond whether a username is free.
- **FR-008**: Registration MUST reject invalid or incomplete input — unavailable or invalid username, unacceptable password or confirmation mismatch, invalid or future birth date, malformed or mismatched email, duplicate email, or unaccepted terms — with a message that names the problem, and MUST NOT create an account or partial account.
- **FR-009**: On successful registration the system MUST create the account with the provided details, sign the member in, and take them to their personal page.
- **FR-010**: The system MUST record each account's terms acceptance and newsletter preference.

#### Sign-in, session, and sign-out (sign-in and remember-me in Slice 1; sign-out in Slice 2)

- **FR-011**: The system MUST establish authentication only after successful credential verification and MUST use the project's session protections for every authenticated request; every state-changing member action MUST be protected against cross-site requests.
- **FR-012**: Credentials MUST be stored in a form that does not reveal the password, and the system MUST never display, log, or return a password.
- **FR-013**: Repeated failed sign-in attempts MUST be throttled or temporarily blocked, with the member informed, and without confirming whether the username exists (default policy: 5 failures within 15 minutes lock the key for 15 minutes; configurable).
- **FR-014**: Successful sign-in MUST take the member to their personal page (the `/me` placeholder until the personal-page slice); failed sign-in MUST keep the visitor on the page with an actionable error.
- **FR-015**: "Remember me" MUST extend recognition beyond the browsing session; without it, recognition ends when the browsing session ends.
- **FR-016**: Sign-out MUST end the member's session and return the public signed-out state.

#### Password recovery (Slice 3)

- **FR-017**: The public site MUST provide a forgotten-password view that uses the signed-out layout and contains a card with a username input, an email input, and a request-information action.
- **FR-018**: On a request whose username and email match an account, the system MUST send recovery information to that account's registered email address.
- **FR-019**: Every recovery request MUST show the same neutral confirmation card with a link back to the index, whether or not it matched an account, MUST reveal nothing about whether the account exists, and MUST stay neutral even when delivery fails (FR-021).
- **FR-020**: Repeated recovery requests MUST be throttled without revealing whether any account exists.
- **FR-021**: A delivery failure after a request that matched an account MUST be handled without exposing account existence and MUST NOT change the response from the neutral confirmation (FR-019).

#### Signed-in layout and navigation (Slice 2)

- **FR-022**: Signed-in members MUST see a distinct layout whose simplified top navigation offers their personal page, help, sign-out, and an entry to the game client, plus the housekeeping entry for administrators; the navigation grows as later features add destinations.
- **FR-023**: The current section MUST be shown as plain text rather than as a link.
- **FR-024**: The housekeeping entry MUST be visible only to administrators and MUST never be visible to other members.
- **FR-025**: Entering the game client MUST open a separate window that identifies the signed-in member to the client, and MUST require a signed-in member.

#### Personal page (Slice 2)

- **FR-026**: The personal page MUST show the member's avatar, username, motto, and last sign-in time.
- **FR-027**: The member MUST be able to edit the motto in place; the change MUST persist and MUST survive a reload.
- **FR-028**: The member area MUST be reachable only by signed-in members; unauthenticated requests MUST return the visitor to the signed-in-required state without exposing member data.

#### Cross-cutting

- **FR-029**: The system MUST present clear, non-technical error messages for every rejected action, and MUST NOT expose internal details.
- **FR-030**: Member-visible values (username, motto, and avatar) MUST stay consistent with the shared data: a motto change is immediately reflected wherever it appears, and the personal page always shows the stored value.

### Key Entities

- **Account**: a member identity. Unique username, protected password, unique email, birth date, newsletter preference, terms acceptance, administrator flag, creation and last sign-in times.
- **Profile**: the member's basic presence. Avatar appearance (the female or male choice made at registration) and motto.
- **Recovery request**: a submitted username and email pair with its outcome; used to send recovery information without revealing whether an account exists.
- **Session**: an authenticated visit established by the project's session authentication; the CMS consumes it and never stores credentials.
- **Administrator role**: an account attribute granting the housekeeping entry point.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can go from the homepage to a signed-in personal page through registration in under 3 minutes, succeeding on the first attempt in at least 95% of cases.
- **SC-002**: Username availability results appear within 1 second of asking.
- **SC-003**: Sign-in reaches the personal page (the `/me` placeholder in Slice 1) within 2 seconds on a standard connection.
- **SC-004**: 100% of invalid registration and sign-in attempts produce a message naming the problem, with no account or session created.
- **SC-005**: Recovery requests produce the neutral confirmation card within 1 second, with identical content and status whether or not the details matched an account, in 100% of tested cases.
- **SC-006**: Members who chose "remember me" remain recognized across browser restarts in 100% of tested cases.
- **SC-007**: The housekeeping entry appears in 0% of sessions belonging to non-administrators.
- **SC-008**: A motto change survives a page reload in 100% of tested cases.
- **SC-009**: The public homepage remains usable and shows a clear game-offline state when the game server is unreachable.
- **SC-010**: After a configured number of consecutive failed sign-ins, further attempts are blocked for a period, while a legitimate member can still recover access.
- **SC-011**: 100% of unauthenticated attempts to reach the member area are returned to the signed-in-required state without exposing member data.

## Assumptions

- One account serves both the CMS and the game client; the CMS creates and verifies accounts and the future game server consumes the same store.
- The game's online-user count and status come from the game server; when unavailable, the CMS shows a neutral offline state instead of failing.
- Account recovery relies on an email-sending capability, which this feature introduces; recovery information is delivered to the account's registered email address.
- The housekeeping application is a separate application; this feature only exposes its entry point to administrators.
- Administrator status is assigned outside the CMS by operators; this feature never grants it.
- The look matches the classic hotel style, desktop-first with a fixed layout; small-screen and mobile support are out of scope.
- Modern evergreen browsers are assumed, because the game client runs in them.
- Email addresses are unique per account and are used for identification and recovery.
- Session lifetime, rotation, and cookie protections are governed by the project's session library configuration and are not redefined here.
- The terms of service and privacy policy are static content; this feature only links to them.
- The member navigation ships simplified and will grow as each later member feature is specified; this feature does not pre-build destinations for deferred features.
- In the first delivery slice, the homepage's online count and server status are sample values from a stub source; the truthful online/offline reporting required by FR-001 and SC-009 arrives with the game-server integration.
