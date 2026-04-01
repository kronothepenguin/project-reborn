# TICKET-016: Catalogue - Purchase Items

**Priority:** MVP-2
**Size:** M
**Affects:** Server / Client / DB
**Depends on:** TICKET-015, TICKET-007

## Summary
Implement item purchasing from the catalogue. The client sends GPRC (outbound 100) with a purchase code; the server deducts credits, creates an inventory item, and responds with PURCHASE_OK (67) or PURCHASE_ERROR (65) or PURCHASE_NOBALANCE (68). A PURSE (6) update is sent after a successful purchase to refresh the client's credit display. The `handleGPRC` handler exists but does nothing after parsing.

## Server (Go)
- Package: `internal/app/game/protocol/hh_cat_code/`
- Inbound commands to implement:
  - 100 `GPRC` (handleGPRC) — full purchase flow:
    1. Parse `editMode, lastPageID, language, purchaseCode, extra, gift` (already parsed in stub)
    2. Look up product by `purchaseCode` in `catalogue_products` table
    3. Check `habbo.Credits >= product.price_credits`; if not, send PURCHASE_NOBALANCE (68)
    4. Check purchase is allowed for user rank; if not, send PURCHASENOTALLOWED (296)
    5. Deduct credits: `habbo.Credits -= price`; persist to `users_avatar.credits`
    6. Create inventory item: insert row into `furniture_inventory`; add to `habbo.Inventory`
    7. Send PURCHASE_OK (67) with `{purchaseCode, itemName, extraData, amount, isGift=0}`
    8. Send PURSE (6) with updated credits/pixels balance
    9. If `gift != ""`, handle gift wrapping and delivery to recipient (sub-task, MVP can skip gift flow)
- Outbound commands (all registered): PURCHASE_OK (67), PURCHASE_ERROR (65), PURCHASE_NOBALANCE (68), PURCHASENOTALLOWED (296), PURSE (6)
- DB changes needed: yes
  - Reuse `furniture_inventory` and `catalogue_products` tables from TICKET-007 and TICKET-015
  - Add sqlc queries: `GetProductByPurchaseCode`, `DeductCredits`, `GetCredits`
  - Add `pixels INT DEFAULT 0` column to `users_avatar` if pixel currency is to be supported (can stub as 0 for MVP)
- Virtual state changes:
  - `pkg/virtual/habbo.go`: add `DeductCredits(amount int) error` method that checks balance, deducts, and persists; add `AddToInventory(item FurniItem)` (may already exist from TICKET-007)
  - `pkg/virtual/habbo.go`: `Credits` field already exists as `int`; ensure it is loaded from DB in `habbo.load()` (currently hardcoded to 500)

## Client (Godot)
- Scene/script: `client/hh_cat_code/`
- Builds on TICKET-015 catalogue window.
- What to implement:
  - Purchase button on each product in the catalogue page; shows price
  - On purchase click: show confirmation dialog (`casts/hh_cat_code/17_habbo_orderinfo_dialog.window.txt` style) with item name and credit cost; confirm sends GPRC (100) with `purchaseCode`
  - On PURCHASE_OK (67): show success notification; if a room is open, trigger GETSTRIP refresh so the new item appears in inventory
  - On PURCHASE_NOBALANCE (68): show "Not enough credits" dialog (`casts/hh_cat_code/19_habbo_orderinfo_nocredits.window.txt`)
  - On PURCHASE_ERROR (65): show generic error dialog
  - On PURSE (6): update the credits display in `hh_interface/habbo_purse.gd` — this component likely already listens for PURSE since it's used by hh_entry_init
  - Gift purchase: "Send as gift" option in the confirmation dialog; sends GPRC with recipient name in `gift` field; on success, show gift sent confirmation (`casts/hh_cat_code/18_habbo_orderinfo_gift_dialog.window.txt`)
  - Reference: `casts/hh_cat_code/5_Catalogue Handler Class.ls`, `casts/hh_cat_code/16_Catalogue purse Class.ls`

## Acceptance criteria
- [ ] Clicking "Buy" on a catalogue product shows a confirmation dialog with correct name and price
- [ ] Confirming the purchase sends GPRC with the correct purchase code
- [ ] Server deducts credits and sends PURCHASE_OK; client shows success notification
- [ ] PURSE (6) is sent after purchase; credit counter in the UI updates immediately
- [ ] Newly purchased item appears in the room inventory strip after GETSTRIP refresh
- [ ] Purchasing with insufficient credits returns PURCHASE_NOBALANCE; client shows appropriate dialog
- [ ] PURCHASENOTALLOWED is handled gracefully with a user-facing message
- [ ] Credits are persisted to DB; balance survives server restart
- [ ] Same purchase code cannot be submitted twice concurrently (race condition protection via DB transaction)

## Notes
- PURSE (6) format: `credits\tpixels` tab-separated (or as protocol.Int args depending on client version). Verify with the hh_entry_init implementation which already sends PURSE during login — reuse that format.
- The `extra` field in GPRC is used for furni color variants. For MVP, ignore `extra` and always use the default variant.
- Gift delivery requires knowing if the recipient is online; if offline, hold the gift until login. Defer gift flow to POST-MVP and handle the `gift` field as empty for now.
- Purchase atomicity: deduct credits and insert inventory item within a DB transaction to avoid partial state on crash.
