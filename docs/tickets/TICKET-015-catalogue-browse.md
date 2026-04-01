# TICKET-015: Catalogue - Browse Pages

**Priority:** MVP-2
**Size:** S
**Affects:** Server / Client / DB
**Depends on:** none (login already done)

## Summary
Implement catalogue browsing so users can view the shop index and individual category pages. The client sends GCIX (outbound 101) to get the catalogue index and GCAP (outbound 102) to get a specific page. The handlers exist in `catalogue.go` but return hardcoded placeholder data. This ticket wires them to real DB-backed catalogue content.

## Server (Go)
- Package: `internal/app/game/protocol/hh_cat_code/`
- Inbound commands to implement (currently return hardcoded placeholder data):
  - 101 `GCIX` (handleGCIX) — currently returns a two-entry placeholder CATALOGINDEX; replace with DB query for all catalogue pages accessible to the user's club/rights level; serialize as newline-delimited `pageId\tdata` lines (the format is already correct, just the source needs to be real)
  - 102 `GCAP` (handleGCAP) — currently returns a two-line placeholder CATALOGPAGE; replace with DB query for the specific `pageID`; serialize as newline-delimited `key:value` lines per the catalogue page format; include all product entries under `p:` key
- Outbound commands (all registered): CATALOGINDEX (126), CATALOGPAGE (127)
- DB changes needed: yes
  - New table `catalogue_pages`: `id INT PK`, `parent_id INT DEFAULT -1`, `name TEXT`, `layout TEXT`, `header_text TEXT`, `teaser_text TEXT`, `special_text TEXT`, `header_image TEXT`, `teaser_images TEXT`, `min_rank INT DEFAULT 1` (access control)
  - New table `catalogue_products`: `id INT PK AUTOINCREMENT`, `page_id INT FK catalogue_pages`, `name TEXT`, `description TEXT`, `price_credits INT`, `price_pixels INT DEFAULT 0`, `definition_id INT FK furniture_definitions` (nullable for non-furni products), `class_name TEXT`, `extra_data TEXT DEFAULT ''`
  - Add sqlc queries: `GetAllCataloguePages`, `GetCataloguePageByID`, `GetProductsByPage`
  - Seed at least one populated catalogue page with several products for testing
- Virtual state changes: none required; catalogue is stateless (read-only browse)

## Client (Godot)
- Scene/script: `client/hh_cat_code/`
- `client/hh_cat_code/` is currently empty.
- What to implement:
  - `hh_cat_code.gd` — cast entry point; registers CATALOGINDEX (126) and CATALOGPAGE (127) listeners; sends GCIX (101) on catalogue open
  - `catalogue_window.tscn` — main catalogue window with left-panel page tree and right-panel content area
  - `catalogue_index.gd` — parses CATALOGINDEX response (`pageId\tdata` lines); builds the page tree using the parent_id hierarchy; clicking a page sends GCAP (102)
  - `catalogue_page.gd` — parses CATALOGPAGE response (key:value lines); renders layout based on `l:` value; displays header image, teaser, products list; each product shows name, price, preview image
  - Product preview: use `furni_base.gd` preview renderer or a static image from resource packs
  - PURCHASENOTALLOWED (296): show "Purchase not allowed" notification if received during browse
  - Reference: `casts/hh_cat_code/3_Catalogue Interface Class.ls`, `casts/hh_cat_code/4_Catalogue Component Class.ls`, `casts/hh_cat_code/6_Product Preview Class.ls`, `casts/hh_cat_code/8_Catalogue Loader Class.ls`

## Acceptance criteria
- [ ] Opening the catalogue sends GCIX (101); CATALOGINDEX response is received with real page data from DB
- [ ] Page tree is rendered in the left panel; at least 3 pages are seeded in DB
- [ ] Clicking a page sends GCAP (102); CATALOGPAGE response renders the page content
- [ ] Products are listed with name, price, and a preview image or placeholder
- [ ] Navigating between multiple pages works without error
- [ ] Catalogue index respects `min_rank` — pages above the user's rank are not shown
- [ ] GCIX with an invalid or unrecognized editMode/language still returns the index
- [ ] Empty catalogue page (no products) renders correctly without error

## Notes
- `handleGCIX` receives `editMode/language` slash-delimited. `editMode` is `"0"` for normal browse, `"1"` for admin/edit mode. For MVP, admin edit mode is out of scope.
- The CATALOGINDEX format is `pageId\tparentId\tname\tminRank\tleaf` or similar — verify against `casts/hh_cat_code/5_Catalogue Handler Class.ls` for the exact field order the client expects.
- The CATALOGPAGE `p:` product line format is lengthy: `name\tdescription\tprice\tspecialText\tobjectType\tclass\tdirection\tdimensions\tpurchaseCode\tpartColors`. The `handleGCAP` stub already shows this structure.
- Catalogue pages for "spaces" (rooms for purchase) use a different layout type — defer to POST-MVP.
