# TICKET-021: Help System - Hobba / Moderation

**Priority:** POST-MVP
**Size:** M
**Affects:** Server / Client / DB
**Depends on:** TICKET-002, TICKET-011

## Summary
Implement the Hobba moderation system (`hh_shared` cast, Hobba thread). Hobba moderators can respond to calls for help (CALL_FOR_HELP, 86), teleport to rooms, warn, kick, and ban players. This also covers the Ticket Window for reporting and the Guide system entry points. Full moderation tooling is post-MVP but the CALL_FOR_HELP pipeline must be in place before any community features.

## Server (Go)
- Package: `internal/app/game/protocol/hh_shared/` (Hobba handler)
- Inbound commands:
  - 86 `CALL_FOR_HELP` — read `message string`; create a help ticket in DB; notify online moderators (Hobba role) via session broadcast; respond with ticket ID
  - 87 `MODERATE_ROOM` — moderator action: kick/ban/mute within a room; validate caller has Hobba rank
  - 91 `CLOSE_HELP_TICKET` — moderator closes an open help ticket; update DB status
- Outbound commands to register:
  - 92 `HELP_TICKET_STATUS` — sent to the reporter: `ticket_id int`, `status string` (open/assigned/closed)
  - 93 `HOBBA_NOTIFICATION` — sent to Hobba moderators: new help ticket alert with room ID and message
  - 73 `MODTOOL_INFO` — moderator tool packet with room state snapshot
- DB changes needed: yes
  - New table `help_tickets`: `id INT PK AUTOINCREMENT`, `reporter_id INT FK users_avatar`, `room_id INT FK rooms`, `message TEXT`, `status TEXT DEFAULT 'open'`, `assigned_to INT NULL FK users_avatar`, `created_at DATETIME`
  - Add column to `users_avatar`: `rank INT DEFAULT 1` (1=user, 2=Hobba, 3=admin)
  - Add sqlc queries: `CreateHelpTicket`, `GetOpenTickets`, `AssignTicket`, `CloseTicket`
- Virtual state changes:
  - `pkg/virtual/habbo.go`: add `Rank int`; add `IsHobba() bool` helper
  - `pkg/virtual/hotel.go`: add `GetModerators() []*Habbo` — returns all online Hobbas

## Client (Godot)
- Scene/script: `client/hh_shared/hobba.gd`
- Reference: `casts/hh_shared/` — Hobba Handler Class and Ticket Window Interface
- What to implement:
  - "Call for Help" button in the room UI: opens a text input dialog; on submit, sends CALL_FOR_HELP (86)
  - HELP_TICKET_STATUS (92): update help dialog with current ticket state (waiting/assigned/closed)
  - Hobba moderator panel (rank ≥ 2 only): shows incoming HOBBA_NOTIFICATION alerts; buttons for: go to room, kick user, warn user, close ticket
  - Ticket window: list of the player's own open help tickets with status

## Acceptance criteria
- [ ] Any user can send CALL_FOR_HELP; ticket is created in DB
- [ ] Online Hobba moderators receive HOBBA_NOTIFICATION with ticket details
- [ ] HELP_TICKET_STATUS is sent back to reporter with current status
- [ ] Moderator can close a ticket; reporter receives status update
- [ ] MODERATE_ROOM kick requires Hobba rank; server rejects if rank < 2
- [ ] Help tickets survive server restart (persisted in DB)

## Notes
- Hobba rank system: verify exact rank thresholds from `casts/hh_shared/` Handler regMsgList.
- The Guide system (TICKET-025) is a separate cast (`hh_guide`) and distinct from Hobba — do not conflate.
- This ticket covers the server-side pipeline; moderator UI polish is out of scope for the first pass.
