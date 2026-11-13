---
type: Reference
title: Suites
description: The browser suites of tests/e2e and what each one covers.
---

# Suites

Each suite is a module in `suites/`, registered in `run.mjs`.

| Suite | Covers |
| --- | --- |
| `signed-out` | Landing, sign-in, forgot and reset, legal pages, ban, throttle |
| `register` | The registration form, with and without JavaScript |
| `me`, `looks`, `details`, `habbos` | The Me page and the account tabs, with the club wardrobe on Looks |
| `homes` | A home read by a guest, profile tags, the editor, and the Webstore and Inventory |
| `maintenance` | The site closed, and staff signing in |
| `news` | The archive, an article, a category and the headlines, as a guest reads them |
| `tags` | The cloud, a search, the tag fight and tagging yourself |
| `groups` | The Me page's Groups box, buying a group, group pages, membership, the admins' tools, decorating, and My Groups |
| `forum` | The discussion board and its threads, as a guest and signed in, moderated with Holo's Moderation Tools, posts reported in the Help Tool window, and the board switched off |
| `club` | The club page as a guest, buying club months with Holo's dialogs, the month limit, a short purse, and `HC1` given to the user's habbos and taken when the club ends |
| `community` | The random habbos, the news promo turning, the tag cloud and the banners |
| `staff` | The staff list, the two boxes and their settings, and the page switched off |
| `credits` | The credits page as a guest reads it, vouchers redeemed into the shared purse, used twice, in other case and unknown, and the account transactions of two habbos, fifty at most |
| `art` | The home art, served by the binary |
| `housekeeping-access` | Every route as a guest, a player and staff |
| `housekeeping-admin` | Access groups, members, the guard and the log |
| `housekeeping-settings` | The settings forms |
| `housekeeping-maintenance` | Maintenance saved in housekeeping, read by the CMS |
| `housekeeping-users` | Habbos and users, badges, credits, bans, alerts and the help queue, with a post's report |
| `housekeeping-store` | The home store's items, added from the art and edited |
| `housekeeping-news` | News composed, listed, edited and deleted, with the top-story picker, its preview and the image editor |
| `housekeeping-images` | Uploaded pictures listed with their articles, ten a page, and deleted only once no article shows them |
| `housekeeping-banners` | Banners added, listed, edited and deleted, with Holo's texts and the right messages |
| `housekeeping-vouchers` | Vouchers created with Holo's random code, listed while unused, refused when blank, bad or taken, and deleted unless redeemed |
| `economy` | P6 from end to end: a voucher made in housekeeping and redeemed once on the credits page, then a club month bought, counted on every page that shows it and opening the club's skins, wide playground and wardrobe until it ends |
| `help` | The help tool: a visitor sent to sign in, the header's Help opening the Help Tool window, Holo's answers to blank, long and waiting requests, and a request picked up in housekeeping's Help Queries |
| `updates` | A hotel installed before updates: maintenance, the update page, the copy, config.json's new keys |
| `together` | The installer's forms, then the CMS and housekeeping side by side |
