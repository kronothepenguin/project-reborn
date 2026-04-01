# Project Reborn - MVP Ticket Index

All tickets are in `docs/tickets/`. Status is tracked here; update as work progresses.

| # | Name | Priority | Size | Affects | Status | Depends On |
|---|------|----------|------|---------|--------|------------|
| [TICKET-001](TICKET-001-navigator-public-rooms.md) | Navigator - Public Rooms | MVP-1 | M | Server / Client / DB | pending | — |
| [TICKET-002](TICKET-002-room-entry.md) | Room Entry | MVP-1 | M | Server / Client / DB | pending | TICKET-001 |
| [TICKET-003](TICKET-003-room-movement.md) | Room Movement | MVP-1 | L | Server / Client | pending | TICKET-002 |
| [TICKET-004](TICKET-004-room-chat.md) | Room Chat | MVP-1 | S | Server / Client | pending | TICKET-002 |
| [TICKET-005](TICKET-005-room-users.md) | Room User List | MVP-1 | M | Client / Server | pending | TICKET-002 |
| [TICKET-006](TICKET-006-furni-view.md) | Furniture - View Only | MVP-1 | S | Client / Server | pending | TICKET-002 |
| [TICKET-007](TICKET-007-furni-place-move-remove.md) | Furniture - Place, Move, Remove | MVP-2 | L | Server / Client / DB | pending | TICKET-006 |
| [TICKET-008](TICKET-008-furni-use.md) | Furniture Interactions | MVP-2 | M | Server / Client | pending | TICKET-007 |
| [TICKET-009](TICKET-009-navigator-private-rooms.md) | Navigator - Private Rooms, Search, Categories | MVP-2 | M | Server / Client | pending | TICKET-001 |
| [TICKET-010](TICKET-010-room-create-edit.md) | Room Management - Create, Edit, Delete | MVP-2 | S | Server / Client / DB | pending | TICKET-001 |
| [TICKET-011](TICKET-011-room-access-control.md) | Room Access Control | MVP-2 | M | Server / Client | pending | TICKET-002 |
| [TICKET-012](TICKET-012-friend-list.md) | Friend List - View | MVP-2 | S | Server / Client / DB | pending | — |
| [TICKET-013](TICKET-013-friend-management.md) | Friend Management | MVP-2 | S | Server / Client | pending | TICKET-012 |
| [TICKET-014](TICKET-014-instant-messenger.md) | Instant Messenger / Console | MVP-2 | S | Server / Client | pending | TICKET-012 |
| [TICKET-015](TICKET-015-catalogue-browse.md) | Catalogue - Browse Pages | MVP-2 | S | Server / Client / DB | pending | — |
| [TICKET-016](TICKET-016-catalogue-purchase.md) | Catalogue - Purchase Items | MVP-2 | M | Server / Client / DB | pending | TICKET-015, TICKET-007 |
| [TICKET-017](TICKET-017-room-trade.md) | Trading System | MVP-3 | L | Server / Client | pending | TICKET-007 |
| [TICKET-018](TICKET-018-figure-change.md) | Figure / Avatar Customization | MVP-2 | S | Server / Client / CMS | pending | — |
| [TICKET-019](TICKET-019-room-kiosk-create-flat.md) | Room Kiosk - Create Flat | MVP-2 | S | Server / Client / DB | pending | TICKET-009 |
| [TICKET-020](TICKET-020-habbo-club.md) | Habbo Club | MVP-3 | S | Server / Client / DB | pending | TICKET-002 |
| [TICKET-021](TICKET-021-help-system-hobba.md) | Help System - Hobba / Moderation | POST-MVP | M | Server / Client / DB | pending | TICKET-002, TICKET-011 |
| [TICKET-022](TICKET-022-poll-system.md) | Poll System | POST-MVP | S | Server / Client / DB | pending | TICKET-002 |
| [TICKET-023](TICKET-023-recycler.md) | Recycler / Furni Exchange | POST-MVP | S | Server / Client / DB | pending | TICKET-007 |
| [TICKET-024](TICKET-024-tutorial-system.md) | Tutorial System | POST-MVP | M | Server / Client / DB | pending | TICKET-002 |
| [TICKET-025](TICKET-025-guide-system.md) | Guide System | POST-MVP | S | Server / Client / DB | pending | TICKET-002 |
| [TICKET-026](TICKET-026-photo-system.md) | Photo System | POST-MVP | S | Server / Client | pending | TICKET-002 |
| [TICKET-027](TICKET-027-room-actions-animations.md) | Room Actions - Animations & Expressions | MVP-2 | S | Server / Client | pending | TICKET-003 |
| [TICKET-028](TICKET-028-room-inventory-strip.md) | Room Inventory Strip | MVP-2 | M | Server / Client / DB | pending | TICKET-007 |
| [TICKET-029](TICKET-029-room-doorbell-teleport.md) | Room Doorbell & Teleport Furniture | MVP-2 | S | Server / Client | pending | TICKET-011, TICKET-007 |
| [TICKET-030](TICKET-030-room-moderation.md) | Room Moderation (Kick, Ban, Ignore) | MVP-2 | S | Server / Client / DB | pending | TICKET-011 |
| [TICKET-031](TICKET-031-furni-state-machines.md) | Furniture State Machines | MVP-3 | L | Server / Client / DB | pending | TICKET-007, TICKET-008 |
| [TICKET-032](TICKET-032-room-spectator-mode.md) | Room Spectator Mode | MVP-3 | S | Server / Client | pending | TICKET-002 |
| [TICKET-033](TICKET-033-room-events.md) | Room Events | POST-MVP | M | Server / Client / DB | pending | TICKET-010 |
| [TICKET-034](TICKET-034-asset-pipeline.md) | Asset Pipeline (Buffer + Dynamic Downloader) | MVP-1 | M | Server / Client | pending | TICKET-002 |

## Priority Legend

| Priority | Meaning |
|----------|---------|
| MVP-1 | Core loop: required to have a playable room session |
| MVP-2 | Full social/economy features: required for a complete MVP |
| MVP-3 | Extended features: important but not blocking the MVP milestone |
| POST-MVP | Out of scope for current milestone |

## Size Legend

| Size | Rough Effort |
|------|-------------|
| XS | < 0.5 day |
| S | 0.5 - 1 day |
| M | 1 - 3 days |
| L | 3 - 5 days |
| XL | > 5 days |

## Dependency Graph

```
Login (done)
 ├── TICKET-001 (navigator public)
 │    ├── TICKET-002 (room entry)
 │    │    ├── TICKET-003 (movement)
 │    │    │    └── TICKET-027 (actions/animations)
 │    │    ├── TICKET-004 (chat)
 │    │    ├── TICKET-005 (room users)
 │    │    ├── TICKET-006 (furni view) ← blocked by TICKET-034
 │    │    │    └── TICKET-007 (furni place/move/remove) [needs TICKET-009 + TICKET-019]
 │    │    │         ├── TICKET-008 (furni use)
 │    │    │         │    └── TICKET-031 (furni state machines)
 │    │    │         ├── TICKET-016 (catalogue purchase)
 │    │    │         ├── TICKET-017 (trading)
 │    │    │         ├── TICKET-023 (recycler)
 │    │    │         ├── TICKET-028 (inventory strip)
 │    │    │         └── TICKET-029 (doorbell/teleport)
 │    │    ├── TICKET-011 (access control)
 │    │    │    ├── TICKET-021 (hobba/moderation)
 │    │    │    ├── TICKET-029 (doorbell/teleport)
 │    │    │    └── TICKET-030 (room moderation)
 │    │    ├── TICKET-020 (habbo club)
 │    │    ├── TICKET-022 (poll system)
 │    │    ├── TICKET-024 (tutorial)
 │    │    ├── TICKET-025 (guide system)
 │    │    ├── TICKET-026 (photo system)
 │    │    └── TICKET-032 (spectator mode)
 │    ├── TICKET-009 (navigator private rooms) [needs TICKET-019]
 │    │    └── TICKET-019 (kiosk create flat)
 │    └── TICKET-010 (room create/edit)
 │         └── TICKET-033 (room events)
 ├── TICKET-002 (see above)
 │    └── TICKET-034 (asset pipeline) ← MVP-1, gates furni rendering
 ├── TICKET-012 (friend list view)
 │    ├── TICKET-013 (friend management)
 │    └── TICKET-014 (instant messenger)
 ├── TICKET-015 (catalogue browse)
 │    └── TICKET-016 (catalogue purchase)
 └── TICKET-018 (figure change)
```

## DB Schema Changes Summary

Tickets that require schema changes (for migration planning):

| Ticket | Tables Added / Modified |
|--------|------------------------|
| TICKET-001 | `rooms`: add description, owner_name, max_visitors, current_visitors, door_state, category_id, is_public, model, floor_level |
| TICKET-002 | `rooms`: add model (if not from TICKET-001) |
| TICKET-007 | Add `furniture_definitions`, `furniture_inventory`, `room_furniture` |
| TICKET-010 | `rooms`: add show_owner_name, trading_allowed |
| TICKET-011 | Add `room_rights`, `room_bans` |
| TICKET-012 | Add `friendships`, `friend_categories` |
| TICKET-013 | Add `friend_requests` |
| TICKET-014 | Add `messages` |
| TICKET-015 | Add `catalogue_pages`, `catalogue_products` |
| TICKET-018 | Add `users_avatar_badges` |
| TICKET-019 | `rooms`: INSERT via CREATEFLAT |
| TICKET-020 | `users_avatar`: add `habbo_club_expires` |
| TICKET-021 | Add `help_tickets`; `users_avatar`: add `rank` |
| TICKET-022 | Add `polls`, `poll_questions`, `poll_answers`, `poll_responses` |
| TICKET-023 | Add `recycler_rewards`, `recycler_config` |
| TICKET-024 | `users_avatar`: add `tutorial_step`; add `tutorial_steps` |
| TICKET-025 | `users_avatar`: add `is_guide` |
| TICKET-026 | `users_avatar`: add `film_count`; add `photos` |
| TICKET-030 | Add `ignore_list` |
| TICKET-031 | `furniture_definitions`: add `credit_value`; `room_furniture`: add `extra_data` |
| TICKET-032 | `rooms`: add `spectator_mode` |
| TICKET-033 | Add `room_events`, `room_event_types`; `rooms`: add `room_rating` |
| TICKET-034 | `furniture_definitions`: add `asset_revision`, `asset_alias` |
