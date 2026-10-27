---
type: Phase
title: P3 Homes
description: Habbo home pages with stickers, notes and widgets, the home editor, the home store and inventory, profile tags, and the store seed and admin.
status: planned
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [p3, cms, housekeeping, installer]
---

# Goal

Every habbo has a home page that guests can read and the owner can decorate with items bought in the home store.

# Scope

| Holo source | Routes | Astro pages | Composed UI (⚡ = island) |
| --- | --- | --- | --- |
| `user_profile.php` | `GET /home/{name}`, `GET /home?name=`, `GET /home/{name}/edit` | `home/name.astro`, `home/name/edit.astro` | `homes/home-canvas`, `homes/sticker`, `homes/note`, `homes/widgets/profile-widget`, ⚡`homes/home-editor` (drag, z-order, skin, remove, place, background, save; `homes.maxItems`) |
| `savehome.php`, `widget_*.php`, `edit_widget.php`, `edit_stickie.php`, `delete_sticker.php`, `delete_stickie.php` | `POST /homes/{id}/layout`, `POST /homes/{id}/items`, `POST /homes/{id}/items/{item}/skin`, `POST /homes/{id}/items/{item}/delete` | — | owner or group admin checked per request; a deleted sticker returns to the inventory, a note is consumed |
| `store.php?key=*` | `GET /home-store`, `GET /home-store/categories/{id}`, `POST /home-store/items/{id}/purchase`, `GET /me/inventory` | — | ⚡`homes/home-store-dialog`, ⚡`homes/note-editor` (BBCode, `homes.noteMaxLength`) |
| `tags_ajax.php` (profile) | `POST /me/tags`, `POST /me/tags/{tag}/delete` | — | ⚡ tag panel in the profile widget (`homes.maxTags`) |
| housekeeping `add_homes_stuff.php` | `/housekeeping/home-store` (GET/POST), `POST /housekeeping/home-store/{id}` | — | `housekeeping.homeStore`; image paths from re-hosted assets, no URL fetch, no CSS writes |
| `install.php:469-772` | installer seed step | — | Holo's categories and 303 items as `packages/installer/internal/seed` |

- Club skins (hc_machine, hc_pillow) need the habbo's active club subscription; the staff category and the staff
  skin need `homes.staffItems`.
- Playground: 922 px wide for group homes and club owners, 752 px otherwise, by 1360 px high.
- Primitives: Badge, Tag. Settings: `homes.*`.

# Exit criteria

- A guest reads a home; its owner places, moves, re-skins and removes items and saves; purchases debit credits with
  a ledger row in the same transaction.

# Tasks

Created when the phase starts.

# Open questions

- **Art:** Holo hotlinked dead Habbo CDNs for about 430 stickers, 112 backgrounds, the widget skins and the user
  badge images. They must be re-hosted under `packages/cms/public` before this phase; where they come from is not
  decided yet.
