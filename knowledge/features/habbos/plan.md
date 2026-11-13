---
type: Plan
title: "Habbos: how"
description: The services package carries a habbo's new look from the site and housekeeping to the game, in reborn and over the game's /api/.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/cms` | The Me page, the looks, profile and habbos tabs, the avatar editor's wrapper `habbo/avatar-editor` and the wardrobe `account/wardrobe` |
| `packages/housekeeping` | Finds habbos, edits habbos and users, restores archived habbos |
| `packages/components` | `Avatar`, which builds the image address from `imaging.avatarUrl` |
| `packages/store` | The `avatars`, `profiles` and `alerts` tables and their queries |
| `tests/e2e` | The suites `me` and `looks` |

Planned:

| Project | Part |
| --- | --- |
| `packages/services` | The contracts' package and its first contract, `Habbos.SendLook(ctx, avatarID)` |
| `packages/server` | `SendLook`: reads the habbo again and shows its look and motto to it and its room; its `/api/` for programs run apart |
| `packages/cms`, `packages/housekeeping` | `Inject`; the looks, profile and motto pages and the habbo editor call the service after they save |
| `packages/reborn` | The memory API: the game's instance injected into the site and housekeeping |
| `packages/store`, `packages/config` | The `api_secret` table and its query; `server.api` |

Reborn's core comes from [platform](/features/platform/spec.md), and the client page from [the
client](/features/client/spec.md).

# Decisions

- [Profiles belong to each habbo](/decisions/holo-port/0006-profiles-per-habbo.md) — Each habbo has its own profile,
  which anchors its home and its tags.
- [Avatar images from a configurable URL](/decisions/holo-port/0008-configurable-avatar-imaging.md) — The `Avatar`
  primitive builds its image from `imaging.avatarUrl`, so an own imager can replace the external one.
- [imaging.avatarUrl defaults to the habbo.com imager](/decisions/holo-port/0032-avatar-imager-default.md) — The
  default is `https://www.habbo.com/habbo-imaging/avatarimage`.
- [Staff levels](/decisions/holo-port/0055-staff-levels.md) — Staff act only on users below their own level.
- [Users edit the homes of all their habbos](/decisions/holo-port/0065-owners-edit-all-their-homes.md) — A user edits
  the home of any habbo they own, whichever is active.
- [Habbos are archived, and the forum shows them as
  archived](/decisions/holo-port/0089-archived-habbos-show-as-archived.md) — Staff restore an archived habbo.
- [Save changes opens five seconds after the editor's first
  look](/decisions/holo-port/0107-save-opens-after-the-first-look.md) — The CMS's wrapper of the editor opens Save
  changes as Holo's Flash editor did.
- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md) — Changes the game must show at once
  reach it through small contracts in packages/services, injected into the apps after New; reborn passes in-memory
  implementations, programs run apart call the game's /api/ over HTTP with a secret; calls carry ids only and store
  nothing.
- [A habbo's look and motto reach the game at once, from wherever they
  change](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md) — The site's looks and motto pages
  and housekeeping's habbo editor tell the game through the Habbos service, and the game shows the habbo's new look and
  motto to it and to its room at once.

# Notes

- `alerts` has no type column: an alert with a sender is Holo's staff message, and one without is its notification.
- The installer's administrator look holds a club item, so that habbo sees the club notice until it picks another look,
  as in Holo.
