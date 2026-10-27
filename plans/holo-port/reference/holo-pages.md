---
type: Reference
title: Holo public site
description: Holo's public pages, layouts, navigation, UI building blocks and interactive behaviours, and the phase that ports each of them.
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [cms, holo]
---

# Layouts

Holo pages are ISO-8859-1 XHTML 1.0 with a fixed 930 px layout. Every page boots through `source/holo/core.php`.

| Holo template | Used by | New layout |
| --- | --- | --- |
| `templates/community/{subheader,header,footer}.php` | most pages; columns 460/310/160 (`body#home`) or 210/560/160 (`#news`, `#tags`) | `layouts/community.astro` ([P2](/phases/p2-me-account.md)) |
| `templates/community/hsubheader.php` | homes; playground 922 px (groups, club owners) or 752 px, by 1360 px | community layout + homes canvas ([P3](/phases/p3-homes.md)) |
| `templates/login/*` (process template) | index, logout, forgot, legal, client errors; 766 px box | `layouts/signed-out.astro` (exists) |
| `templates/login/register_*` | register | `layouts/signed-out.astro` |
| `templates/client/*` | client popup | deferred |
| `web-gallery/maintenance/style.css` | maintenance | `maintenance.astro` ([P1](/phases/p1-signed-out.md)) |

# Navigation

- Header (signed in): logo; quick menus My Friends / My Groups / My Rooms (`quickmenu.php`); "Enter {sitename}";
  Help | Sign Out; habbo search box → `user_profile.php?tag=NAME`.
- Header (guest): mini login form (username, password, remember me, forgot, register).
- Main tabs: `{habbo name}` or "Register now!", Community, Credits, and Housekeeping for staff.
- Sub-tabs: Me → Homepage, My Page, Account Settings, Habbo Club. Community → Community, News, Staff, Discussion
  Board, Tags. Credits → Credits, Habbo Club.
- "N users online now" box (emulator count; deferred, shown as offline).
- Footer: Homepage | Terms of Service | Privacy Policy, copyright, and Housekeeping for staff on the login footer.

# Pages

| Holo page | What it does | New route | Phase |
| --- | --- | --- | --- |
| `index.php` | landing, login box, Flash promo, tag cloud | `GET/POST /{$}` | P1 |
| `register.php` + `ajax_*check.php` | registration with Flash avatar editor, name check | `GET/POST /register`, `POST /register/check-name` | P1 |
| `logout.php` | sign out (also shows the ban message) | `POST /logout` | P1 |
| `forgot.php` | emailed the md5 hash | `/forgot`, `/reset/{token}` | P1 |
| `disclaimer.php`, `privacy.php` | legal text from `locale/en/policies.php` | `GET /disclaimer`, `GET /privacy` | P1 |
| `maintenance.php` | site closed page | middleware + `maintenance.astro` | P1 |
| `xml/promo_habbos.php` | 10 random habbos for the Flash promo | `GET /xml/promo-habbos.xml` | P1 |
| `me.php` | personal info, motto, feed (alerts, birthday, last visit, staff help count), groups and tags habblets, news promo, rooms, banners | `GET /me` + JSON actions | P2 (habblets in P4/P5) |
| `update_motto.php`, `removefeeditem.php` | motto save, alert dismiss | `POST /me/motto`, `POST /me/alerts/{id}/dismiss` | P2 |
| `account.php` tabs 1–5 | looks (Flash editor + club wardrobe), motto, email, password, refer | `/account/*` | P2 (wardrobe P6) |
| `welcome.php` | first-login room picker | deferred | — |
| `user_profile.php` | habbo home with stickers, notes, widgets, edit mode | `/home/{name}`, `/home/{name}/edit` | P3 |
| `savehome.php`, `widget_*.php`, `edit_*.php`, `delete_*.php`, `store.php` | home editor and store backend | `/homes/{id}/…`, `/home-store/…`, `/me/inventory` | P3 |
| `tags_ajax.php` | add and remove tags | `/me/tags…` | P3 |
| `community.php` | random habbos, news promo, tag cloud, rooms, banners | `GET /community` | P4 |
| `news.php` | archive, category list, article | `/news`, `/news/{id}` | P4 |
| `tags.php`, `tagfight.php`, `tagcloud.php` | tag search, tag yourself, tag fight | `/tags`, `POST /tags/fight` | P4 |
| `staff.php` | staff list and two content boxes | `GET /staff` | P4 |
| `group_profile.php` and `group*.php`, `groups_*.php`, `joingroup.php`, `leavegroup.php`, `randomgroups.php` | group homes, purchase, membership, settings, badge | `/groups/…` | P5 |
| `forum.php`, `viewthread.php` and the post/topic endpoints | site-wide discussion board | `/forum/…` | P5 |
| `credits.php`, `redeemvoucher.php`, `transactions.php` | purse, vouchers, history | `/credits/…` | P6 |
| `club.php`, `club_*.php`, `ajax_club.php` | club info and purchase | `/club`, `POST /club/subscriptions` | P6 |
| `wardrobestore.php` | club wardrobe slots | `POST /account/looks/wardrobe/{slot}` | P6 |
| `iot/go.php` | help tool and post reports | `/help`, `POST /forum/posts/{id}/report` | P7 / P5 |
| `client.php`, `clientutils.php`, `unloadclient.php` | Shockwave client | deferred | — |
| `minimail.php` | stub | not ported | — |

# UI building blocks

Small primitives (go to `packages/components`):

- Box ("cbb"): `habblet-container > cbb.{variant} > h2.title + box-content`; JS-rounded corners; coloured title
  bar ([colours](/reference/colours.md)). → `Card` + `Paper`.
- Box tabs (`box-tabs-container`, lazy `tab-ajax` panels). → `Tabs`.
- Buttons `a.new-button` (default, red, green, dark, disabled, fill, icon variants) and form buttons
  (`input.submit`, `continue`, `cancel`). → `Button`, `Icon`.
- Links: default #fc6204, sub-nav #134787, on dark boxes #ffb648. → `Link`.
- Message pills `div.rounded-*` and flash messages. → `Notice`.
- Bubbles (`bottom-bubble`, `bubbletip`, `redtip`). → `Bubble`.
- Dialogs (`cbb topdialog`, overlay). → `Dialog`.
- Inputs, selects, the date selector, checkboxes, textarea with a BBCode toolbar. → `Input`, `Select`, `Checkbox`,
  `Textarea`.
- Lists (`habblet-list` even/odd rows), tables (`tx-history`, `group-topiclist`), pagination. → `Table`,
  `Pagination`.
- Avatar image, user badge, group badge, online indicator, spinner. → `Avatar`, `Badge`, `GroupBadge`, `Spinner`.

Composed UI (goes to `packages/cms/src/components/<feature>/`): login box, personal info plate, feed, groups and
tags habblets, news promo, random habbos, tag cloud, purse, club membership, staff list, homes canvas and widgets,
home store dialog, note editor, group tools and member list, forum topic list and post list.

# Interactive behaviours

Holo used Prototype 1.6 + script.aculo.us, `X-JSON` response headers and HTML fragments. The new islands call JSON
endpoints instead.

| Behaviour | Holo endpoint | Island |
| --- | --- | --- |
| motto inline editor | `update_motto.php` | `me/motto-editor` |
| feed item removal | `removefeeditem.php` | `me/feed` |
| lazy box tabs | `randomgroups.php`, `tagcloud.php` | `Tabs` + fetch |
| group purchase dialog | `grouppurchase.php` | `groups/group-purchase` |
| my tags and profile tags | `tags_ajax.php` | `me/tags-habblet`, profile tag panel |
| news promo slideshow | — | `news/news-promo` |
| random habbos with tooltips | — | `community/random-habbos` |
| voucher redemption | `redeemvoucher.php` | `credits/purse` |
| club purchase dialogs | `club_confirm.php`, `club_subscribe.php`, `ajax_club.php` | `club/membership` |
| tag fight | `tagfight.php` | `tags/tag-fight` |
| registration checks | `ajax_namecheck.php` | `register/name-check` |
| avatar editor (Flash) | `HabboRegistration.swf` | `habbo/avatar-editor` (`vendor/HabboWidgets/habbo-registration/version-2.0`) |
| wardrobe | `wardrobestore.php` | `account/wardrobe` |
| homes editor, store, note editor | `savehome.php`, `widget_*.php`, `store.php?key=*` | `homes/home-editor`, `homes/home-store-dialog`, `homes/note-editor` |
| group tools, member list, settings | `group_settings.php`, `groups_memberlist.php`, `groups_*.php` | `groups/group-tools`, `groups/member-list`, `groups/group-settings` |
| badge editor (Flash) | `show_badge_editor.php`, `save_group_badge.php` | `groups/badge-editor` (`vendor/HabboWidgets/badge-editor`) |
| landing promo (Flash) | `xml/promo_habbos.php` | `landing/promo-widget` (`vendor/HabboWidgets/habbos_v2_landing`) |
| forum post, reply, preview, moderation | `savetopic.php`, `savepost.php`, `updatepost.php`, `previewpost.php`, `savetopicsettings.php` | `forum/new-thread`, `forum/reply-form`, `forum/moderation` |

# Assets

- Local: chrome sprites in `web-gallery/v2/images/`, legacy images in `web-gallery/images/` (progress, status,
  group icons, tag fight, widget skins), group badge parts in `habbo-imaging/badges/`.
- Missing: all sticker and background art (about 428 stickers and 112 backgrounds in `assets.css`, hotlinked from
  `img*.cdn1.habbo.com` and `upload.meth0d.org`), user badge images (`images.habbohotel.co.uk/c_images/album1584`),
  several images of the remote homes stylesheets.
- Fonts: Verdana 11 px; no webfont.
