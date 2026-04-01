# TICKET-017: Trading System

**Priority:** MVP-3
**Size:** L
**Affects:** Server / Client
**Depends on:** TICKET-007

## Summary
Implement peer-to-peer furniture trading between two users in the same room. The full trade flow is: TRADE_OPEN (71) -> both parties add items -> TRADE_ITEMS (108) updates -> TRADE_ACCEPT (109) from both -> TRADE_COMPLETED (105) or either party sends TRADE_CLOSE (70) to cancel. The handlers in `room.go` are all nil stubs. Trading is required for a complete social/economy experience.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement (all currently nil stubs):
  - 71 `TRADE_OPEN` — read `targetUserID int`; validate both users are in the same room and trading is enabled for the room; create a `TradeSession{InitiatorID, PartnerID, InitiatorItems, PartnerItems, InitiatorAccepted, PartnerAccepted}` and store in `Room.ActiveTrades`; send TRADE_ITEMS (108) to both parties with empty item lists
  - 72 `TRADE_ADDITEM` — read `itemID int`; validate item is in caller's inventory and not already in the trade; add to the caller's side of the trade session; send TRADE_ITEMS (108) update to both parties with full current item lists from both sides
  - 67 `ADDSTRIPITEM` — alias for adding an item to trade (verify exact usage in cast reference)
  - 68 `TRADE_UNACCEPT` — clear the caller's accepted state; send TRADE_ACCEPT (109) update to both parties
  - 69 `TRADE_ACCEPT` — set caller's accepted state to true; send TRADE_ACCEPT (109) to both parties; if both accepted, execute the trade: atomically move items between inventories in DB, send TRADE_COMPLETED (105) to both parties, remove trade session
  - 70 `TRADE_CLOSE` — cancel the trade; send TRADE_CLOSE (110) to both parties; remove trade session; no item transfer occurs
- Outbound commands (all registered): TRADE_ITEMS (108), TRADE_ACCEPT (109), TRADE_COMPLETED (105), TRADE_CLOSE (110), TRADE_COMPLETED_2 (112)
- DB changes needed: no new tables; trade execution uses atomic updates to `furniture_inventory` rows (change `owner_id`) within a DB transaction
- Virtual state changes:
  - `pkg/virtual/room.go`: add `ActiveTrades map[string]*TradeSession` keyed by `"minID-maxID"` of the two participants
  - New type `TradeSession` in `pkg/virtual/trade.go`: fields `InitiatorID int`, `PartnerID int`, `InitiatorItems []int` (inventory item IDs), `PartnerItems []int`, `InitiatorAccepted bool`, `PartnerAccepted bool`, `Mu sync.Mutex`
  - `pkg/virtual/room.go`: add `FindTrade(userID int) *TradeSession` helper; add `ExecuteTrade(storage, *TradeSession) error`

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`, `client/hh_room_ui/`
- What to implement:
  - Right-click context menu on another user in room: "Trade" option; sends TRADE_OPEN (71) with target user's ID
  - Trade window UI: two-column layout — left side (my items), right side (partner's items); each side shows dragged-in furni icons
  - Drag furni from inventory strip into trade window left side; sends TRADE_ADDITEM (72)
  - "Accept" button: sends TRADE_ACCEPT (69); button state changes to "Accepted" (greyed)
  - "Cancel" button: sends TRADE_CLOSE (70); closes trade window
  - On TRADE_ITEMS (108): update both sides of the trade window with current item lists
  - On TRADE_ACCEPT (109): show checkmark or indicator on accepting party's side
  - On TRADE_COMPLETED (105): show "Trade complete!" notification; close window; refresh inventory strip
  - On TRADE_CLOSE (110): close trade window; show "Trade cancelled" if not initiated locally
  - If the other party closes the trade window on their side, the trade is also cancelled
  - Reference: `casts/hh_room/5_Room Handler Class.ls` (trade section)

## Acceptance criteria
- [ ] Right-clicking a user and selecting "Trade" sends TRADE_OPEN; both parties see the trade window open
- [ ] Dragging an item into the trade window sends TRADE_ADDITEM; TRADE_ITEMS updates both parties' displays
- [ ] Neither party can add items they do not own or items already in another trade
- [ ] Clicking "Accept" on both sides executes the trade; items transfer atomically in DB
- [ ] TRADE_COMPLETED is received by both parties; inventory strips reflect new ownership
- [ ] Clicking "Cancel" or closing the window sends TRADE_CLOSE; no items are transferred
- [ ] If one party disconnects mid-trade, the trade is cancelled and items are returned to their original owners
- [ ] Trading is blocked if the room has `trading_allowed = false`
- [ ] A user cannot be in two simultaneous trades

## Notes
- The trade execution must be atomic at the DB level — use a transaction that updates all `furniture_inventory.owner_id` rows together; roll back on any failure.
- `TRADE_COMPLETED_2` (112) is a variant sent in some server versions for confirming the second party's view — send both TRADE_COMPLETED and TRADE_COMPLETED_2 to be safe.
- YOUARENOTALLOWED (102) and OTHERNOTALLOWED (103) are sent when trade is attempted in a no-trading room or when the other party rejects the trade initiation — handle these responses client-side.
- Items added to a trade should be temporarily locked (not removable from inventory via REMOVESTUFF) for the duration of the trade session.
