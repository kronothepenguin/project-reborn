---
type: Reference
title: "Research: Habbo Club's monthly gifts"
description: Which furni Habbo Club gave in each month from 2005 to 2009, what came after the last gift, when a gift was given, what a break changed, what Holo did, and what the hotel can start with.
timestamp: 2026-11-24T16:30:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-24T16:30:00+00:00"}
tags: [research, club, gifts, furni]
sources:
  - id: com-furni-2006
    resource: https://web.archive.org/web/20060701050202/http://www.habbo.com/club/habbo_club_furni.html
  - id: com-furni-2007
    resource: https://web.archive.org/web/20070430145543/http://www.habbo.com/club/habbo_club_furni.html
  - id: com-benefits-2006
    resource: https://web.archive.org/web/20061208003303/http://www.habbo.com/club/habbo_club_benefits.html
  - id: uk-club-2008
    resource: https://web.archive.org/web/20080215010214/http://www.habbo.co.uk/club
  - id: uk-gifts-2007
    resource: https://web.archive.org/web/20071115171931/http://www.habbo.co.uk:80/credits/habboclub?month=2&catalogpage=0
  - id: com-gifts-2007
    resource: https://web.archive.org/web/20071207204912/http://www.habbo.com:80/credits/habboclub?month=2&catalogpage=0
  - id: habborator-2007
    resource: https://web.archive.org/web/20070325221754/http://habborator.org/furniture/hc.html
  - id: habborator-2008
    resource: https://web.archive.org/web/20081223130502/http://habborator.org/furniture/hc.html
  - id: fansites-2004
    resource: http://hhhc.50megs.com/furni.htm
  - id: habboclue
    resource: http://habboclue.mysite.com/catalog.html
  - id: forum-2006
    resource: https://habboxforum.com/showthread.php?t=287222
  - id: habbox-2015
    resource: https://habbox.com/all-articles/special-report-the-history-of-hc-and-vip
  - id: habboxwiki
    resource: https://habboxwiki.com/Habbo_Club
  - id: texts
    resource: assets/dcr/external_texts.txt
  - id: hh-club
    resource: packages/server/knowledge/r26/hh_club.md
  - id: catalogue
    resource: packages/store/migrations/0013-catalogue.sql
  - id: holocms
    resource: source/holocms/core.php
  - id: holoemu
    resource: source/holoemu/Source/Virtual/Users/virtualUser.cs
---

A study of 2026-11-24 for the [club feature](/features/club/spec.md). Nothing here is decided.

# In short

- After a year the list goes on with new furni. From January 2007 the list holds 23 gifts, one per club month.
- After the 23rd gift the list neither restarts nor stops. From month 24, Habbo repeats only the 13 newer furni of
  2007, in their order, every 13 months: month 24 is the Mega TV Set again, month 36 the Electric Butler, month 37
  the Mega TV Set.[^habborator-2008]
- The Club sofa comes in month 1 only. The 10 older furni come once each.
- Before 2007 the list held 11 gifts. After it, the older gifts repeated, from the Mochamaster on.[^forum-2006]
- A hotel of 2008, as ours, matches the list of 2007. All 23 furni are in our catalogue today.

# The gifts, in order

The list of 2007 to 2009. Names are the catalogue's, codes the furni definitions'.[^catalogue]

| Month | Name | Furni code | Repeats from month 24 | In our catalogue |
| --- | --- | --- | --- | --- |
| 1 | Club sofa | `club_sofa` | No: month 1 only | Yes, item 977 |
| 2 | Mega TV Set | `hc_tv` | Yes: 24, 37, 50 | Yes, item 993 |
| 3 | Tubmaster | `hcamme` | No | Yes, item 982 |
| 4 | Antique Drapery | `hc_crtn` | Yes: 25, 38 | Yes, item 992 |
| 5 | Mochamaster | `mocchamaster` | No | Yes, item 980 |
| 6 | Persian Carpet | `hc_crpt` | Yes: 26, 39 | Yes, item 990 |
| 7 | Dicemaster | `edicehc` | No | Yes, item 981 |
| 8 | Retro Wall Lamp | `hc_wall_lamp` | Yes: 27, 40 | Yes, item 1001 |
| 9 | Imperial Teleport, 2 of them | `doorD` | No | Yes, item 983, sold as 1 |
| 10 | HC Rollers Set, 5 of them | `hc_rllr` | Yes: 28, 41 | Yes, item 1000, sold as 1 |
| 11 | Throne Sofa | `hcsohva` | No | Yes, item 984 |
| 12 | Medieval Bookcase | `hc_bkshlf` | Yes: 29, 42 | Yes, item 995 |
| 13 | Oil Lamp | `hc_lmp` | No | Yes, item 985 |
| 14 | Drinks Trolley | `hc_trll` | Yes: 30, 43 | Yes, item 989 |
| 15 | Nordic Table | `hc_tbl` | No | Yes, item 986 |
| 16 | Weird Science Machine | `hc_machine` | Yes: 31, 44 | Yes, item 997 |
| 17 | Majestic Chair | `hc_chr` | No | Yes, item 987 |
| 18 | X-Ray Divider | `hc_rntgn` | Yes: 32, 45 | Yes, item 996 |
| 19 | Study Desk | `hc_dsk` | No | Yes, item 988 |
| 20 | The Grammophon | `hc_djset` | Yes: 33, 46 | Yes, item 999 |
| 21 | Victorian Street Light | `hc_lmpst` | Yes: 34, 47 | Yes, item 991 |
| 22 | Heavy Duty Fireplace | `hc_frplc` | Yes: 35, 48 | Yes, item 998 |
| 23 | Electric Butler | `hc_btlr` | Yes: 36, 49 | Yes, item 994 |

- The months and the repeats come from Habborator's chart, December 2008.[^habborator-2008] Habbox's history of
  2015 gives the same 23 months with the same names.[^habbox-2015]
- Habbo UK's own gift catalogue of November 2007 shows #2 Mega TV Set, #3 Tubmaster and #4 Antique
  Drapery.[^uk-gifts-2007] Habbo US shows #3 Tubmaster in December 2007.[^com-gifts-2007] Only these months are
  archived.
- Habborator names the gifts of months 8 and 21 "Club lamp" and "Lantern". Its pictures show the wall lamp and the
  street light.[^habborator-2008]
- The 2 teleports and the 5 rollers come from Habbox and HabboxWiki.[^habbox-2015][^habboxwiki]

## The list before 2007

Habbo US's own club page, from 2006 to April 2007:[^com-furni-2006][^com-furni-2007]

| Month | Name | Furni code |
| --- | --- | --- |
| 1 | HC Sofa | `club_sofa` |
| 2 | HC Plasto | `chair_plasto*14`, `table_plasto_4leg*14` |
| 3 | Mochamaster | `mocchamaster` |
| 4 | Dicemaster | `edicehc` |
| 5 | Tubmaster | `hcamme` |
| 6 | Imperial Teleporters | `doorD` |
| 7 | Throne Sofa | `hcsohva` |
| 8 | Oil Lamp | `hc_lmp` |
| 9 | Nordic Table | `hc_tbl` |
| 10 | Majestic Chair | `hc_chr` |
| 11 | Study Desk | `hc_dsk` |

- Fan sites of 2004 give the same order.[^fansites-2004][^habboclue]
- HabboxWiki puts the Tubmaster at 3, the Mochamaster at 4 and the Dicemaster at 5.[^habboxwiki] Habbo's own page
  is more reliable: it is the hotel's, and it was written at the time.
- Our catalogue has the two plasto pieces as items 978 and 979. Which pieces the set held is not found.

## After the last gift

| Years | Length of the list | After the last gift | Sure? |
| --- | --- | --- | --- |
| Until 2006 | 11 gifts | The older gifts repeat, from the Mochamaster: month 12 Mochamaster, month 13 Dicemaster | Low: forum posts of December 2006, "IIRC"[^forum-2006] |
| 2007 to 2009 | 23 gifts | The 13 newer gifts repeat in their order, every 13 months | High: two Habborator versions and Habbox agree[^habborator-2008][^habbox-2015] |
| From 2010 | Replaced | HC furniture was replaced, then VIP came in April 2010 | After our time[^habbox-2015] |

- HabboxWiki says month 12 of the old list gave a gold badge and a Mochamaster, and that the gifts then
  repeat.[^habboxwiki] This matches the forum.
- Habborator's version of March 2007 said "after 12th month"; its version of December 2008 says "after 24th month".
  The later one matches the months it lists, so it is the reliable one.[^habborator-2007][^habborator-2008]
- No source says a member of 24 months or more gets the Club sofa or an older gift again.

# Timing and breaks

- The first gift comes on the day the member joins. Each further gift comes 31 days after the one
  before.[^com-furni-2006]
- Months bought in advance give no gift at once: "Your gifts will come once a month every month".[^com-furni-2006]
- A gift follows the member's elapsed club months, not the purchase.
- "Club time is cumulative": after a break in membership, a member who rejoins starts back in the same place it
  left off.[^uk-club-2008] The gift after a break is the one of the next month number.
- A member of over a year gets a sparkly badge.[^com-benefits-2006] Forum posts place it at the start of month
  13.[^forum-2006]

## In the client of release 26

- The server sends message 280 with the number of gifts waiting. The client asks once per gift.[^hh-club]
- The dialog's title is `club_confirm_gift_title`: "You have received a Habbo club gift!"[^texts]
- Its text is `club_confirm_gift_text`: "A new club gift has arrived. Please push OK if you want to receive it now. If
  you click cancel you will be asked again next time you log in to the Hotel."[^texts]
- OK accepts one gift. The client then sends `SCR_GIFT_APPROVAL` (210) with the number accepted. Cancel keeps the
  rest for the next login.[^hh-club]
- The status window shows the elapsed months, `club_general_elapsed`, and the prepaid months,
  `club_general_prepaid`.[^texts]
- `club_extend_text` promises: "you won't lose any of the advantages or ongoing furni gifts."[^texts]
- The text `club_gift.message` is "Happy Habbo Club! Love Callie :)". Where the client shows it is not found.[^texts]

# What Holo did

- HoloCMS 3.1.1 and 1.3.1 give no club gifts. Their club page copies Habbo's text, "club time is cumulative".
- The `gift` and `lastgift` columns of 3.1.1's `users` count the welcome gifts of a new habbo, the stool and the
  plant, one per day. They are not club gifts.[^holocms]
- HoloCMS deletes the `users_club` row when the club ends, so the elapsed months are lost at a break.[^holocms]
- The emulator reads `months_expired` for the club status and never raises it. It sends no message 280.[^holoemu]

# For our hotel

## A default order

The hotel can start with the 23 gifts of the table, in its order. A default order needs, per gift:

- its position, which drag and drop changes;
- the furni definition it gives;
- the amount: 2 for the teleport, 5 for the rollers, 1 for the rest;
- whether it repeats after the last gift.

All 23 furni exist in the store's furni definitions and on the Club Furni page.[^catalogue]

## Choices left to the user

1. What comes after the last gift.
   - The gifts marked "repeats" come again, in their order. This is Habbo of 2008. Example: month 24 gives the Mega
     TV Set. Recommended first.
   - The whole list starts again at month 1. Example: month 24 gives the Club sofa.
   - The gifts stop. Example: a member of 24 months gets nothing more.
2. How housekeeping marks the repeats.
   - A checkbox per gift. The repeats follow the main order. Recommended first: it keeps one list to drag.
   - A second list, ordered by its own drag and drop.
3. When the first gift comes. The spec gives a gift for each full month; Habbo gave the first on the day of joining.
   - On the day of joining, then every 31 days. This is Habbo's rule. Recommended first. Example: a member of 1 day
     has the Club sofa.
   - After the first full month. Example: a member of 1 day has no gift yet.
4. What a break does.
   - The elapsed months stay, and the next gift is the next month's. This is Habbo's rule. Recommended first.
   - The count starts again at month 1, as HoloCMS does.
5. What a refused or unseen gift does.
   - It waits, and the client asks again at the next login, as its own text says. Recommended first.
   - It is lost.

[^com-furni-2006]: Habbo US, "Rare Habbo Club Furni", 2006-07-01
[^com-furni-2007]: Habbo US, "Rare Habbo Club Furni", 2007-04-30, same list
[^com-benefits-2006]: Habbo US, "Habbo Club Benefits", 2006-12-08
[^uk-club-2008]: Habbo UK, club page, 2008-02-15
[^uk-gifts-2007]: Habbo UK, monthly gifts, 2007-11-15, also `month=1` and `month=3`
[^com-gifts-2007]: Habbo US, monthly gifts, 2007-12-07
[^habborator-2007]: Habborator, "HC Furniture", 2007-03-25
[^habborator-2008]: Habborator, "HC Furniture", 2008-12-23, the same text today
[^fansites-2004]: Happy Habbo Help Center, "Furni Values", 2004
[^habboclue]: Habbo Clue, "Habbo Club, Rare Values", undated, about 2004
[^forum-2006]: HabboxForum, "Gold HC Badge Help?", 2006-12-28 to 2006-12-30
[^habbox-2015]: Habbox, "The history of HC and VIP", 2015-07-04
[^habboxwiki]: HabboxWiki, "Habbo Club", read 2026-11-24
[^texts]: The client's external texts
[^hh-club]: The R26 client's `hh_club` cast
[^catalogue]: The store's catalogue, page 54 "Club Furni", items 977 to 1001
[^holocms]: HoloCMS 3.1.1 `core.php`, `habblet/ajax_nextgift.php` and `club.php`
[^holoemu]: Holograph emulator, `refreshClub`
