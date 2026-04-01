# TICKET-023: Recycler / Furni Exchange

**Priority:** POST-MVP
**Size:** S
**Affects:** Server / Client / DB
**Depends on:** TICKET-007

## Summary
Implement the furniture recycler (`hh_recycler` cast). Players can exchange a set of lower-value furniture items for a single higher-value item via the recycler kiosk. The server receives the items to recycle (GET_FURNI_RECYCLER_CONFIGURATION, then RECYCLE_ITEMS), removes them from inventory, rolls a random reward, and grants it.

## Server (Go)
- Package: `internal/app/game/protocol/hh_recycler/`
- Inbound commands:
  - 222 `GET_FURNI_RECYCLER_CONFIGURATION` — send current recycler config: reward tier table and required item count per cycle
  - 224 `RECYCLE_ITEMS` — read list of inventory item IDs; validate user owns all items; validate item count matches tier requirement; remove items from inventory; select reward from tier table (weighted random); grant reward to inventory; send FURNI_RECYCLER_FINISHED (225)
- Outbound commands to register:
  - 223 `FURNI_RECYCLER_CONFIGURATION` — recycler config packet: `num_tiers int`, per tier: `level int`, `probability int`, `reward_class_name string`
  - 225 `FURNI_RECYCLER_FINISHED` — recycle complete: `reward_class_name string`, `extra_data string`
  - 226 `FURNI_RECYCLER_NOT_AVAILABLE` — recycler is currently disabled
- DB changes needed: yes
  - New table `recycler_rewards`: `id INT PK`, `tier INT`, `class_name TEXT`, `probability INT` (weight)
  - New table `recycler_config`: `required_item_count INT`, `is_active BOOL DEFAULT TRUE`
  - Add sqlc queries: `GetRecyclerConfig`, `GetRecyclerRewards`, `GetRandomReward`

## Client (Godot)
- Scene/script: `client/hh_recycler/`
- Reference: `casts/hh_recycler/` — Interface/Component/Handler .ls files
- What to implement:
  - `hh_recycler.gd` — registers for FURNI_RECYCLER_CONFIGURATION (223) and FURNI_RECYCLER_FINISHED (225)
  - `recycler_window.tscn` — grid of item slots for the player to drag furniture into; "Recycle" button; animated reward reveal on FURNI_RECYCLER_FINISHED
  - On open: send GET_FURNI_RECYCLER_CONFIGURATION (222); populate tier display
  - On FURNI_RECYCLER_FINISHED: play animation, show reward item name
  - On FURNI_RECYCLER_NOT_AVAILABLE: show "Recycler is currently unavailable" message

## Acceptance criteria
- [ ] Opening the recycler sends GET_FURNI_RECYCLER_CONFIGURATION; tier table is displayed
- [ ] Placing the correct number of items and clicking Recycle sends RECYCLE_ITEMS
- [ ] Server removes the items from inventory and grants a random reward from the tier table
- [ ] FURNI_RECYCLER_FINISHED is received with the reward item name
- [ ] Recycled items no longer appear in inventory; reward item does
- [ ] Items and rewards are persisted in DB (inventory changes survive restart)

## Notes
- Command IDs 222–226 need verification from `casts/hh_recycler/` Handler regMsgList — they may conflict with other registered commands.
- The weighted random reward selection should use a seeded RNG with configurable weights per tier.
- For MVP, the reward table is seeded via DB migration; no in-game recycler management UI.
