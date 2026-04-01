# TICKET-020: Habbo Club

**Priority:** MVP-3
**Size:** S
**Affects:** Server / Client / DB
**Depends on:** TICKET-002

## Summary
Implement Habbo Club (HC) subscription checks and UI. This covers the `hh_club` cast: the `SCR_GET_USER_INFO` outbound (26) and `scr_sinfo` inbound (7) that carry HC days remaining and subscription period, plus the client-side "Habbo Club" subscribe dialog. HC gating is referenced in catalogue, trading, and some furniture interactions but the subscription state itself is straightforward to implement.

## Server (Go)
- Package: `internal/app/game/protocol/hh_club/`
- Inbound commands:
  - 26 `SCR_GET_USER_INFO` — client requests HC status; read session user's `habbo_club_expires` from DB; compute days remaining; send SCRSENDUSERCREDITS (6) and SCRACK (7) with period info
- Outbound commands to register:
  - 7 `SCRSENDUSERCREDITS` — HC days and period data (used by club and catalogue)
  - 6 `SCRACK` — subscription acknowledgement
  - 277 `CLUB_INFO` — full club info packet: `days_remaining int`, `period_months int`, `period_days int`, `has_club bool`
- DB changes needed: yes
  - Add column to `users_avatar`: `habbo_club_expires DATETIME NULL` (NULL = no HC)
  - Add sqlc query: `GetHabboClubExpiry`
- Virtual state changes:
  - `pkg/virtual/habbo.go`: add `ClubExpires *time.Time`; add `HasClub() bool` helper (returns `ClubExpires != nil && time.Now().Before(*ClubExpires)`)

## Client (Godot)
- Scene/script: `client/hh_club/`
- Reference: `casts/hh_club/` — Interface/Component/Handler .ls files
- What to implement:
  - `hh_club.gd` — registers for CLUB_INFO (277); on receipt, updates HC badge/indicator in the main HUD
  - `club_window.tscn` — "Subscribe to Habbo Club" dialog showing current status (days remaining or "not subscribed") and subscription options; for MVP, display status only — purchase flow is post-MVP
  - On login: server sends CLUB_INFO automatically after login; client stores HC state and shows HC badge if active
  - HC badge visibility: show gold HC badge icon in the user's name tag if `has_club = true`

## Acceptance criteria
- [ ] Server sends CLUB_INFO after login with correct `has_club`, `days_remaining` values
- [ ] Client displays HC badge icon for users with an active subscription
- [ ] Client displays "not subscribed" state when HC is expired or null
- [ ] SCR_GET_USER_INFO (26) sent from client returns accurate club info from DB
- [ ] HC expiry is persisted in DB; server restart preserves it
- [ ] `HasClub()` helper returns correct boolean based on `ClubExpires` field

## Notes
- The exact command IDs for hh_club need verification from `casts/hh_club/` Handler's `regMsgList`. The IDs above (26, 7, 277) are derived from cross-cast references; confirm before implementing.
- For MVP, HC subscription cannot be purchased in-game — the field can only be set directly in the DB. Purchase integration is a post-MVP feature.
- Some catalogue items are HC-only; the `HasClub()` helper is used by the catalogue handler to gate purchases.
