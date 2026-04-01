# TICKET-018: Figure / Avatar Customization

**Priority:** MVP-2
**Size:** S
**Affects:** Server / Client / CMS
**Depends on:** hh_human (partially done)

## Summary
Allow users to change their avatar appearance (figure string) via the wardrobe/figure editor and have the change broadcast to all users in the same room via FIGURE_CHANGE (inbound 266). The figure system in `hh_human/` is partially functional for rendering; this ticket adds the editing flow and the server-side broadcast and persistence.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Figure change is initiated from outside the room context (CMS/wardrobe), but the in-room update uses the room protocol.
- Inbound commands to implement:
  - 158 `SETBADGE` (handleSETBADGE) — currently a nil stub; read `slot int, visible bool, badgeCode string`; update `Habbo.Badges` in memory; persist to `users_avatar_badges` table; broadcast USERBADGE (228) to all room visitors with `{userID, badgeData}`
  - Figure change packet: no direct inbound command from the room client for figure change in R26 — figure is changed via the CMS web interface and the new figure string is sent to the server as a session property update; implement a simple internal API or extend the SSO/login flow to accept a `figure` update param; on figure change, update `users_avatar.figure` in DB, update `Habbo.Figure`, and broadcast FIGURE_CHANGE (266) to all users in the current room
- Outbound commands: FIGURE_CHANGE (266), USERBADGE (228) — both already registered in `room.go`
- DB changes needed: yes
  - Add `figure TEXT` update path in sqlc queries: `UpdateAvatarFigure`
  - New table `users_avatar_badges`: `avatar_id INT FK users_avatar`, `badge_code TEXT`, `slot INT DEFAULT 0`, `visible BOOL DEFAULT TRUE`
  - Add sqlc queries: `GetBadgesByAvatar`, `UpsertBadge`
- Virtual state changes:
  - `pkg/virtual/habbo.go`: add `SetFigure(figure string)` that validates the figure string format and updates `Habbo.Figure`; add `BroadcastFigureChange()` that sends FIGURE_CHANGE to the current room
  - Figure validation: a valid figure string matches the pattern `partType-setID-colorID.partType-setID-colorID...` (dot-separated); reject malformed strings

## Client (Godot)
- Scene/script: `client/hh_human/`, `client/hh_kiosk_room/` (wardrobe kiosk)
- `client/hh_kiosk_room/` is a stub; `hh_human/` has partial figure rendering.
- What to implement:
  - Figure editor UI (wardrobe): a window displaying part categories (hair, face, body, clothing, shoes, accessories); each category shows available set options; clicking a set/color updates a live preview using `figure_preview.gd` which already exists in `hh_human/`
  - "Save" button: send the new figure string to the server; for CMS-less MVP, add a thin in-game wardrobe command or connect to the existing CMS `web/` endpoint
  - On FIGURE_CHANGE (266) inbound: parse `{userID, newFigureString}`; find the user's avatar node in the room; call `configure(newFigureString)` on the HumanNode to re-render the figure
  - Figure preview in the editor uses the existing `figure_preview.gd` and `figure_data.gd`
  - `hh_human/figure_system.gd`: verify it handles re-configuration (not just initial configuration) — ensure calling `configure()` on an already-rendered avatar updates correctly without duplicating nodes
  - Reference: `client/hh_human/figure_preview.gd`, `client/hh_human/figure_data.gd`, `client/hh_human/human_class_ex.gd`

## Acceptance criteria
- [ ] Figure editor window opens and displays part categories with available options
- [ ] Selecting different hair/clothing parts updates the live preview in real time
- [ ] Saving the new figure persists it to DB via `users_avatar.figure`
- [ ] After saving, the user's avatar in the current room updates to the new figure for all visitors (FIGURE_CHANGE broadcast)
- [ ] FIGURE_CHANGE received from another user correctly re-renders their avatar without removing them from the room
- [ ] Invalid/malformed figure strings are rejected server-side; old figure is preserved
- [ ] SETBADGE updates the badge slot; USERBADGE broadcast causes other users' badge displays to update
- [ ] Figure string survives logout/login (loaded from DB)

## Notes
- FIGURE_CHANGE (266) in `room.go` is already registered as an outbound command with no inbound counterpart in the room handler. The server initiates this broadcast; the client only receives it.
- The figure string format must be validated before persisting — malformed strings could break client rendering for all room visitors.
- The wardrobe/kiosk in the original Habbo R26 was a room object (a kiosk furni); for MVP, a standalone wardrobe window is simpler. The `hh_kiosk_room/` cast is the room-object kiosk approach — use it as reference but implement as a window for MVP.
- Part type identifiers: `hd` (head/skin), `hr` (hair), `he` (head accessory), `ha` (hat), `hf` (face), `ch` (chest/shirt), `ca` (chest accessory), `wa` (waist), `lg` (legs), `sh` (shoes). Color IDs are numeric. The `figure_data.gd` likely already has mappings.
