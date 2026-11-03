---
type: Phase
title: P3 Homes
description: Habbo home pages with stickers, notes and widgets, the home editor, the home store and inventory, profile tags, and the store seed and admin.
status: active
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
| `install.php:469-772` | seed of the program that uses it, merged by the installer ([0049](/decisions/0049-store-is-the-global-database.md)) | — | Holo's categories and 303 items as `packages/installer/internal/seed` |

- Club skins (hc_machine, hc_pillow) need the user's active club membership; the staff category and the staff
  skin need `homes.staffItems`.
- The art is in the repository ([0061](/decisions/0061-art-in-the-repository.md)).
- Stickers, notes and backgrounds belong to the user while they are not placed
  ([0056](/decisions/0056-wallet-club-and-inventory-per-user.md)), and archiving a habbo returns its placed stickers and
  notes ([0058](/decisions/0058-habbos-are-archived.md)).
- Playground: 922 px wide for group homes and club owners, 752 px otherwise, by 1360 px high.
- Primitives: Badge, Tag. Settings: `homes.*`.

# Exit criteria

- A guest reads a home; its owner places, moves, re-skins and removes items and saves; purchases debit credits with
  a ledger row in the same transaction.

# Tasks

- [p3-01 Declare the homes settings](/tasks/p3-01-homes-settings.md) — done
- [p3-02 Seed the home store](/tasks/p3-02-store-seed.md) — done
- [p3-03 Turn BBCode into HTML](/tasks/p3-03-bbcode.md) — todo
- [p3-04 Show a home](/tasks/p3-04-home-page.md) — todo
- [p3-05 Edit profile tags](/tasks/p3-05-profile-tags.md) — todo
- [p3-06 Sell home items](/tasks/p3-06-home-store.md) — done
- [p3-07 Change a home](/tasks/p3-07-home-changes.md) — done
- [p3-08 Build the home editor](/tasks/p3-08-home-editor.md) — todo
- [p3-09 Build the store and inventory dialogs](/tasks/p3-09-store-dialogs.md) — todo
- [p3-10 Manage the home store in housekeeping](/tasks/p3-10-housekeeping-store.md) — done
- [p3-11 Return placed items on archive](/tasks/p3-11-archive-returns-items.md) — done
- [p3-12 Verify P3](/tasks/p3-12-exit-check.md) — todo
