# TICKET-034: Asset Pipeline (Buffer + Dynamic Downloader)

**Priority:** MVP-1
**Size:** M
**Affects:** Server / Client
**Depends on:** TICKET-002

## Summary
Implement the asset download pipeline (`hh_buffer` + `hh_dynamic_downloader` casts). Before furniture can be rendered in a room, the client needs to know which asset packs are available (GET_FURNI_REVISIONS, 213) and their alias mappings (GET_ALIAS_LIST, 215). The buffer system shows placeholder graphics while assets load; the downloader fetches `.cct` asset packs serially. Without this, TICKET-006 (furni view) cannot render any furniture. This is an MVP-1 blocker for furni rendering.

## Server (Go)
- Package: `internal/app/game/protocol/hh_dynamic_downloader/`
- Inbound commands to implement:
  - 213 `GET_FURNI_REVISIONS` — respond with FURNI_REVISIONS (214): a list of furniture class names and their current asset revision numbers; the client uses revisions to determine whether to re-download an asset pack
  - 215 `GET_ALIAS_LIST` — respond with ALIAS_LIST (216): a mapping of furniture class names to their asset pack file names (many classes can share one asset pack)
- Outbound commands to register:
  - 214 `FURNI_REVISIONS` — `num_entries int`, per entry: `class_name string`, `revision int`
  - 216 `ALIAS_LIST` — `num_entries int`, per entry: `class_name string`, `alias string`
  - 217 `DOWNLOAD_URLS` — optional: a list of base URLs for asset downloads (if not hardcoded in client config)
- DB changes needed: yes
  - Add columns to `furniture_definitions`: `asset_revision INT DEFAULT 1`, `asset_alias TEXT` (NULL means same as class_name)
  - Add sqlc queries: `GetAllFurniRevisions`, `GetAllFurniAliases`
- Server-side asset hosting: the Go server (or a static file server) must serve `.cct` asset pack files at a known URL path. For MVP, serve from `assets/furni/` directory via the existing HTTP server.

## Client (Godot)
- Scene/script: `client/hh_dynamic_downloader/`, `client/hh_buffer/`
- Reference: `casts/hh_dynamic_downloader/`, `casts/hh_buffer/`
- What to implement:
  - `hh_dynamic_downloader.gd` — on room entry, send GET_FURNI_REVISIONS (213) and GET_ALIAS_LIST (215); compare received revisions against locally cached revisions; queue downloads for outdated or missing asset packs
  - Asset download queue: fetch packs one at a time (serial download, matching original behavior); store downloaded packs in user's local cache directory
  - `hh_buffer.gd` — while an asset pack is pending download, render a placeholder graphic (grey box with class name) for furniture items from that pack; on download complete, replace placeholders with real graphics
  - Placeholder display: every furni node must check if its asset pack is available; show the buffer placeholder if not
  - Cache management: on startup, read cached revision numbers from local storage; only download packs whose revision has changed

## Acceptance criteria
- [ ] GET_FURNI_REVISIONS (213) is sent on room entry; server responds with FURNI_REVISIONS (214) containing class names and revisions
- [ ] GET_ALIAS_LIST (215) is sent on room entry; server responds with ALIAS_LIST (216)
- [ ] Client compares revisions against cache; only downloads changed or missing asset packs
- [ ] While a pack is downloading, furniture from that pack shows the buffer placeholder graphic
- [ ] After download completes, placeholders are replaced with the real furniture graphics
- [ ] Asset packs are served from the server's static file path; client correctly resolves the URL
- [ ] Revision numbers in DB can be updated to force re-downloads on clients

## Notes
- The buffer placeholder is not an error state — it is intentional UX from the original client. Implement it correctly so the room loads immediately (with placeholders) rather than blocking.
- Serial downloading (one pack at a time) was the original behavior due to bandwidth constraints. For the remake, consider allowing up to 3 parallel downloads but cap at 3 to avoid server hammering.
- Asset packs for the Godot remake will be `.res` or image atlases (not Director `.cct`). The "alias" system still applies: map furniture class names to Godot resource paths.
- This ticket gates TICKET-006 (furniture rendering). Without FURNI_REVISIONS and ALIAS_LIST responses, the client cannot resolve which assets to load for room furniture.
