---
type: Reference
title: Two versions of HoloCMS
description: HoloCMS 3.1.1.60 of February 2009, made for the V26 emulator, is the source reference in source/holocms; HoloCMS 1.3.1 of April 2008, which the first ported pages follow, is in source/holocms-1.3.1.
---

# What was found

On 2026-11-24 the site was set beside the user's running HoloCMS, and pages differed from the HoloCMS of the
repository. The two are different versions.

| | HoloCMS 1.3.1 | HoloCMS 3.1.1 |
| --- | --- | --- |
| Version | 1.3.1-TRUNK "The Revolution", STABLE | 3.1.1.60 "ATLANTA", UNSTABLE |
| Date | 18 April 2008 | 19 February 2009 |
| Files | 854 | 4,282 |
| Made for | Holograph Emulator of 2008 | "Eucalypt C#, HoloEMU Vista4life & Shine-Away's V26 Source" (`includes/version.php`) |
| In the repository | `source/holocms-1.3.1`, with its pictures | `source/holocms`, without its pictures, `r26/` and `config.php` |
| The user's copy | — | `/mnt/media/Laboratory/habbo/holo/cms`, served by the user's Docker stack on `http://localhost:11300` |

- The emulator is the same in both places: `source/holoemu` and the stack's "HoloEMU FULL V26" differ in three files
  (`Source/Console/IO.cs`, `Source/Core/Core.cs`, `Resources/holodb.sql`).
- The running copy ships Sulake's client under `r26/` (`habbo.dcr`, the `.cct` casts, `c_images`), which
  [stays out of the repository](/decisions/reborn/0011-no-habbo-files-in-the-repository.md).

# What 3.1.1 has that 1.3.1 lacks, as seen so far

- The Me page: My Messages (the minimail), Holos (friends and invitations), Events, Recommended, with Tags and Groups in
  the second column.
- The top bar: My Friends and My Rooms beside My Groups.
- The community page: Rooms and Groups boxes, and the tags box titled "Tags" in green.
- Credits: a "Collectables" page, "Refer Options" and "Leaderboard" boxes.
- Register: the two columns swapped. The client: the password asked again (`reauthenticate.php`).
- Files with no like in 1.3.1: `minimail/`, `myhabbo/`, `collectables.php`, `group_forum.php`, `invite.php`, `rss.php`,
  `reauthenticate.php`, `_upgrade.php`. `locale/` is the same in both.
- [HoloCMS 3.1.1 against 1.3.1](/sources/holocms/3.1.1-against-1.3.1.md) compares the two page by page.

# Where each version lives

- `source/holocms` is HoloCMS 3.1.1, the source reference. It holds the PHP, CSS, scripts and XML of the user's copy,
  byte for byte. Its `README.md` lists what was left out.
- `source/holocms-1.3.1` is HoloCMS 1.3.1. Every page ported before 2026-11-24 follows it, and the notes that cite it
  name this folder.
- Which pages and features of 3.1.1 the port takes is the user's to decide.

The user: "i might downloaded two different versions, but i want to keep the latest r26 version for the source
reference", and chose "Copy its code into source/".
