# TICKET-025: Guide System

**Priority:** POST-MVP
**Size:** S
**Affects:** Server / Client / DB
**Depends on:** TICKET-002

## Summary
Implement the Guide system (`hh_guide` cast). Guides are volunteer players who help new users by responding to help requests. This is distinct from Hobba moderation: Guides cannot kick or ban — they can only chat with and advise the player who requested help. The server manages the guide request queue and connects requesting users with available guides.

## Server (Go)
- Package: `internal/app/game/protocol/hh_guide/`
- Inbound commands:
  - 360 `MSG_INIT_TUTORSERVICE` — player opts into the guide request queue; validate player is not already in queue; add to `hotel.GuideQueue`
  - 362 `MSG_GUIDE_ACCEPT` — a guide accepts a pending request; pair guide with requesting user; open a private chat channel between them
  - 363 `MSG_GUIDE_REJECT` — guide declines a request; request is re-queued or cancelled
  - 364 `MSG_GUIDE_FINISHED` — session ended; remove pairing; notify both parties
  - 365 `MSG_GUIDE_CHAT` — guide or user sends a message in the guide session; relay to the paired party
- Outbound commands to register:
  - 361 `MSG_GUIDE_REQUEST` — sent to available guides: `requester_name string`, `request_message string`, `request_id int`
  - 366 `MSG_GUIDE_SESSION` — sent to both parties on pair: `guide_name string`, `requester_name string`
  - 367 `MSG_GUIDE_CHAT_RESPONSE` — relayed chat message from the paired party
  - 368 `MSG_GUIDE_ENDED` — session ended notification

## Client (Godot)
- Scene/script: `client/hh_guide/`
- Reference: `casts/hh_guide/` — Interface/Component/Handler .ls files
- What to implement:
  - "Request a Guide" button in help menu: sends MSG_INIT_TUTORSERVICE (360); shows "Waiting for a guide..." status
  - Guide toolbar (for guide-ranked users): shows pending requests from MSG_GUIDE_REQUEST (361); Accept/Reject buttons
  - Guide chat window: on MSG_GUIDE_SESSION, open a dedicated chat panel; send/receive MSG_GUIDE_CHAT messages
  - "End Session" button: sends MSG_GUIDE_FINISHED (364)

## Acceptance criteria
- [ ] Player requesting a guide is added to the queue; guide-ranked users receive MSG_GUIDE_REQUEST
- [ ] Guide accepting a request pairs the two users; both receive MSG_GUIDE_SESSION
- [ ] Messages sent via MSG_GUIDE_CHAT are relayed to the paired party only
- [ ] MSG_GUIDE_FINISHED ends the session for both parties
- [ ] Guide declining a request re-queues the request for another available guide
- [ ] Guide queue does not persist across server restarts (in-memory only)

## Notes
- Command IDs 360–368 need verification from `casts/hh_guide/` Handler regMsgList.
- Guide rank is a separate role from Hobba moderator. Add `is_guide BOOL DEFAULT FALSE` column to `users_avatar` or extend the rank system from TICKET-021.
- Guide chat is not stored in DB — it is ephemeral, in-memory relay only.
