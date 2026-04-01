# TICKET-004: Room Chat

**Priority:** MVP-1
**Size:** S
**Affects:** Server / Client
**Depends on:** TICKET-002

## Summary
Implement the three chat modes — normal say, shout, and whisper — so that users can communicate inside a room. The client sends CHAT (52), SHOUT (55), or WHISPER (56); the server broadcasts the message back to the appropriate audience as the same inbound command IDs. Chat is a foundational social feature and among the simplest room interactions to implement since it requires no state beyond the current room visitor list.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement (currently log-only stubs):
  - 52 `CHAT` — read `message string` from packet; broadcast CHAT to all visitors in sender's current room with format `"id:N\r" + "txt:$message\r"`; apply basic chat filtering/length limit (max 100 chars)
  - 55 `SHOUT` — same as CHAT but broadcast SHOUT; client renders in bold/caps styling
  - 56 `WHISPER` — read `recipientName string` and `message string`; send WHISPER only to the named recipient's session if they are in the same room; send back to sender for confirmation
- Outbound commands (already registered): STATUS (34) is used for chat gestures (wave, smile); CHAT/SHOUT/WHISPER use the same IDs as the outbound
- DB changes needed: no (chat is ephemeral for MVP; no persistence)
- Virtual state changes:
  - `pkg/virtual/room.go`: add `BroadcastChat(sender *Habbo, msg string, chatType string)` helper
  - `pkg/virtual/room.go`: add `FindVisitorByName(name string) *Habbo` for whisper targeting
  - 317 `USER_START_TYPING` / 318 `USER_CANCEL_TYPING` — broadcast USER_TYPING_STATUS (361) to room; low-priority but trivial to add alongside chat

## Client (Godot)
- Scene/script: `client/hh_room_ui/`, `client/hh_room/room.gd`
- `client/hh_room_ui/` exists but is empty.
- What to implement:
  - Chat input bar in the room UI: a `habbo_field` text input and send button (reuse `hh_interface/habbo_field.gd`)
  - On Enter/send: read input text; if prefixed with `:` or triggered via shout UI, send SHOUT; else send CHAT
  - Whisper: context menu on username (deferred UI) or `/w username message` text command prefix
  - On CHAT inbound (28 — note: same ID as USERS in the protocol; distinguish by context or cast): parse `id:N\r txt:$msg\r`; display speech bubble above the named user's avatar; add to room chat log panel
  - On SHOUT inbound (same ID as server broadcast): render in bold; larger bubble radius
  - On WHISPER inbound: display in a different color (e.g. purple); add to chat log with whisper indicator
  - USER_TYPING_STATUS (361): show typing indicator dot above avatar
  - Reference: `casts/hh_room/5_Room Handler Class.ls` (chat handling section)

## Acceptance criteria
- [ ] Typing in the chat bar and pressing Enter sends CHAT packet to server
- [ ] Server broadcasts CHAT to all room visitors; sender sees their own message
- [ ] Message appears as a speech bubble above the sender's avatar for ~4 seconds
- [ ] Message appears in the room chat log panel
- [ ] SHOUT renders differently from normal CHAT (bold text, wider bubble)
- [ ] WHISPER is only received by the intended recipient and the sender
- [ ] Empty message or whitespace-only input is not sent
- [ ] Messages exceeding 100 characters are truncated or rejected server-side
- [ ] USER_TYPING_STATUS indicator appears above a user who is currently typing
- [ ] Chat works bidirectionally between two concurrent test clients in the same room

## Notes
- The inbound CHAT packet ID (28) conflicts with USERS (28) in the raw lingo protocol — this is handled by cast/context; in the Go server these are on different listener registrations because USERS uses G_USRS (61). Double-check the outbound vs inbound ID mapping in `room.go` constants.
- For MVP, no chat moderation, mute, or log storage is required.
- LOOKTO (79) — face direction change — is trivially related and can be bundled: read `x, y` from packet, update `Habbo.Rotation`, broadcast STATUS with new rotation.
