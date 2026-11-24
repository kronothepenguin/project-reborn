---
type: Reference
title: Suites
description: The browser suites of tests/e2e and what each one covers.
---

# Suites

Each suite is a module in `suites/`, registered in `run.mjs`. A suite proves only what a browser shows: an island, a
primitive working inside a page, the text and layout of the real page, and a change made in one program that another
program shows. What a test through a Go router proves stays there.

| Suite | Covers |
| --- | --- |
| `signed-out` | Landing, sign-in, forgot and reset, legal pages |
| `layout` | Both layouts at today's sizes: Holo's font at 16px, the 1240px page at 1366 wide, the two-tone main tabs with hover, green and selected tabs, the sub-navigation and the inline habbo search; screenshots of `/`, `/register`, `/me` and `/community` at 1366 and 1920 |
| `register` | The registration form, with and without JavaScript |
| `me`, `looks`, `details`, `habbos` | The Me page and the account tabs, with the club wardrobe on Looks |
| `homes` | A home read by a guest, profile tags, the editor, and the Webstore and Inventory |
| `maintenance` | The site closed, and staff signing in |
| `news` | The archive, an article, a category and the headlines, as a guest reads them |
| `tags` | The cloud, a search, the tag fight and tagging yourself |
| `groups` | The Me page's Groups box, buying a group, group pages, membership, the admins' tools, decorating, and My Groups |
| `forum` | The discussion board and its threads, as a guest and signed in, moderated with Holo's Moderation Tools, and posts reported in the Help Tool window |
| `club` | The club page as a guest, buying club months with Holo's dialogs, the month limit, a short purse, and `HC1` given to the user's habbos and taken when the club ends |
| `community` | The random habbos, the news promo turning, the tag cloud and the banners |
| `staff` | The staff list, the two boxes and their settings, and the page switched off |
| `credits` | The credits page as a guest reads it, vouchers redeemed in the purse with Holo's answers in place, and the account transactions page with the purse beside it |
| `art` | The home art, served by the binary |
| `housekeeping-access` | Every route as a guest, a player and staff |
| `housekeeping-admin` | Access groups, members, the guard and the log |
| `housekeeping-settings` | The settings forms |
| `housekeeping-maintenance` | Maintenance saved in housekeeping, read by the CMS |
| `housekeeping-users` | Habbos and users, badges, credits, bans, alerts and the help queue, with a post's report |
| `housekeeping-store` | The home store's items, added from the art and edited |
| `housekeeping-news` | News composed, listed, edited and deleted, with the top-story picker, its preview and the image editor |
| `housekeeping-images` | Uploaded pictures listed with their articles, ten a page, and deleted only once no article shows them, after which the CMS no longer serves them |
| `housekeeping-banners` | Banners added, listed, edited and deleted, with Holo's texts and the right messages |
| `housekeeping-vouchers` | Holo's vouchers page, a code of dots created and deleted through its address, and a voucher deleted unless redeemed |
| `economy` | P6 from end to end: a voucher made in housekeeping and redeemed once on the credits page, then a club month bought, counted on every page that shows it and opening the club's skins, wide playground and wardrobe until it ends |
| `help` | The help tool: a visitor sent to sign in, the header's Help opening the Help Tool window, Holo's answers to blank, long and waiting requests, and a request picked up in housekeeping's Help Queries |
| `client` | The header's Enter opening the client page in the window named `client`, brought forward by a second Enter, and narrow on a small screen |
| `hotel-status` | The header, the Me page, the client page and its Hotel Closed window, homes and housekeeping's forms and dashboard while the game runs and while it is stopped, with a habbo inside that the hotel's switch sends out after its notice, a restart that keeps the hotel closed, and the site's switch stopping and starting the game |
| `installer-layout` | The installer's layout from an empty folder: every step on one column with the stepper, its links with and without scripts, the row of buttons in one place and order and in sight on a long step, and the settings step's groups as tabs: one at a time, changes under several tabs saved, a refused field's tab opened, and every group shown with scripts off |
| `updates` | A hotel installed before updates: maintenance, the update page, the copy, config.json's new keys |
| `reborn` | The whole hotel in one process from an empty folder: `/` sent to the installer, the move to a new port that closes the old one, the settings and client files steps skipped, the site's front page after "Create administrator" with `/installer/` gone, housekeeping, the game's first message, a second start straight to the hotel, and Ctrl-C logging the habbo inside out with its last time online saved |
| `together` | The installer's forms, with More settings folded, a referral reward saved in the settings step and read in housekeeping, the client files step finding no file and skipped, the administrator kept in the club with 2500 credits and read on `/credits` and `/club`, then the CMS and housekeeping side by side, in one walk that waits for both settings it saves, with the habbo limit from housekeeping stopping the CMS form and the server |
