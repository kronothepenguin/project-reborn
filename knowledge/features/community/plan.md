---
type: Plan
title: "Community: how"
description: The CMS draws the community and staff pages from the store and the settings, and housekeeping manages banners and the staff boxes.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/cms` | `/community` with the random habbos and news promo islands, the banners column, the tag cloud, and `/staff` |
| `packages/housekeeping` | `/housekeeping/banners`, and the staff boxes in the settings editor |
| `packages/virtual` | The `staffPage.*` settings and `features.staffPage` |
| `packages/store` | Banners, and the staff list from the staff-listed access groups |
| `packages/components` | The BBCode editor of the staff boxes |

# Decisions

- [Guests can read public pages](/decisions/holo-port/0017-guest-read-access.md) — Guests read community and staff;
  acting needs a session.
- [Staff page shows display habbos](/decisions/holo-port/0019-staff-page-display-habbo.md) — For each member, the
  habbo chosen when access was granted.
- [A new hotel starts with no news and no banners](/decisions/holo-port/0075-no-news-or-banner-seeds.md) — Holo's two
  banners are not seeded.
- [The staff page is one list, as Holo's](/decisions/holo-port/0076-one-staff-list.md) — Every member once, sorted by
  habbo name, with its highest listed group as rank.
- [The staff page boxes are BBCode with a colour each](/decisions/holo-port/0077-staff-boxes-in-bbcode.md) — Edited in
  a multi-line field, with one of Holo's four colours.
- [Hotel status](/features/hotel-status/plan.md) — The community and staff pages show each habbo in the hotel online;
  it replaces [0087](/decisions/holo-port/0087-online-picture-stays-offline.md).
- [A WYSIWYG BBCode editor of our own wherever BBCode is
  written](/decisions/holo-port/0092-bbcode-editor.md) — The staff boxes are written in the shared BBCode editor.

# Notes

- Holo gave pages without a `body_id` no column widths, so the community and staff pages take the 460/310/160 of
  `body#home`, which fits the 435-pixel grid and the 300-pixel stories.
- Each habbo on the grid links over its whole picture, where Holo's image map took a 40 by 50 area of it.
- The islands read their data on mount: an `$effect` that wrote the habbos and read them again looped until Svelte
  stopped it.
- The staff avatar keeps Holo's size `b`, direction 2 and head direction 3.
- A banner's addresses are trimmed, and `///host` is refused with `//host`: a browser reads another host from both.
- A banner's text may be blank, as in Holo; only a status of `1` enables a banner.
- The delete confirmation is `GET /housekeeping/banners/{id}/delete`, Holo's `Delete banner` view.
- The staff boxes' labels and help are Holo's `setting_title` and `setting_desc`, and their defaults are Holo's texts.
