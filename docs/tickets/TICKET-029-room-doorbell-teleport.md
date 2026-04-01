# TICKET-029: Room Doorbell & Teleport Furniture

**Priority:** MVP-2
**Size:** S
**Affects:** Server / Client
**Depends on:** TICKET-011, TICKET-007

## Summary
Implement two related room-entry mechanics: (1) the doorbell flow for locked rooms — DOORBELL_RINGING (91) to owner, FLAT_LETIN (41) response, GOVIADOOR (54) to move through the door; and (2) teleport furniture interaction — USEITEM (89) on a teleporter places the user in the teleport animation, then GOVIADOOR sends them to the linked room. These are sub-features of TICKET-011 (access control) that need specific furniture and movement plumbing.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement/complete:
  - 54 `GOVIADOOR` — read `room_id int`, `door_id int`; look up the door or teleporter by `door_id`; validate the entry is permitted (open door or user was let in via doorbell); initiate room transfer: send DOOR_OUT (89) to move user out, then room entry sequence to the destination room
  - 41 `FLAT_LETIN` — already partially in TICKET-011 (LETUSERIN); verify this is the same command or alias
  - 62 `DOORFLAT` (server→client, inbound from server perspective) — not a client command; the server sends DOORFLAT (62) to all room users when a door opens/closes; implement the server-side broadcast
- Outbound commands:
  - 62 `DOORFLAT` — room door state change broadcast: `door_id int`, `state string` (open/closed), `owner_name string`
  - 63 `DOOR_DELETED` — door removed from room
  - 92 `DOOR_IN` — user arriving through a door animation
  - 89 `DOOR_OUT` — user leaving through a door animation
- Teleport furniture (TICKET-007 extension):
  - `USEITEM` on a teleporter (class `teleport` from hh_furni_classes): verify destination teleporter exists and is in an accessible room; set user status to teleporting; send DOOR_OUT; after 1s timer, send user to destination room via GOTOFLAT
  - Teleport link: `room_furniture` needs a `link_id INT NULL` column referencing another teleporter instance

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`
- What to implement:
  - DOOR_OUT (89): play door exit animation on the avatar, then transition to the destination room
  - DOOR_IN (92): play door entry animation when a user arrives via door
  - DOORFLAT (62): update the door furniture visual state (open/closed) when received
  - Teleport interaction: on clicking a teleporter furniture item, send USEITEM (89 outbound) with the teleporter's ID; wait for DOOR_OUT response; then GOVIADOOR is sent automatically
  - Doorbell waiting (from TICKET-011): show "Waiting for host" dialog after TRYFLAT on locked room; on DOORBELL_RINGING ack, wait for OPC_OK or rejection

## Acceptance criteria
- [ ] Entering a locked room shows doorbell waiting dialog; owner receives DOORBELL_RINGING
- [ ] Owner accepting sends FLAT_LETIN; user receives OPC_OK and enters room
- [ ] GOVIADOOR (54) triggers room transfer with DOOR_OUT animation followed by room entry
- [ ] Teleporter furniture: clicking a teleporter sends USEITEM; avatar plays teleport animation; user appears in linked room
- [ ] DOORFLAT (62) updates door visual state for all users in the room
- [ ] Teleporter link (link_id) is persisted in DB; both ends of a teleporter pair reference each other

## Notes
- GOVIADOOR vs GOTOFLAT: GOVIADOOR goes through a specific door object (floor item with ID); GOTOFLAT (59) goes directly to a room without a door animation. Teleporters use GOVIADOOR.
- Teleporter furniture class is `teleport` in hh_furni_classes. The linked destination is stored as `extra_data` or `link_id` on the room_furniture row.
- For MVP, implement the doorbell flow (depends on TICKET-011) and GOVIADOOR. Teleporter furniture (depends on TICKET-007 furni states) can follow in TICKET-031.
