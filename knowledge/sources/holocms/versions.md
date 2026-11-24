---
type: Reference
title: Two versions of HoloCMS
description: The repository's source/holocms is HoloCMS 1.3.1 of April 2008, and the user's running copy is HoloCMS 3.1.1.60 of February 2009, made for the V26 emulator; the port follows the first.
---

# What was found

On 2026-11-24 the site was set beside the user's running HoloCMS, and pages differed from `source/holocms`. The two
are different versions.

| | `source/holocms` | The running copy |
| --- | --- | --- |
| Version | 1.3.1-TRUNK "The Revolution", STABLE | 3.1.1.60 "ATLANTA", UNSTABLE |
| Date | 18 April 2008 | 19 February 2009 |
| Files | 854 | 4,282 |
| Made for | Holograph Emulator of 2008 | "Eucalypt C#, HoloEMU Vista4life & Shine-Away's V26 Source" (`includes/version.php`) |
| Where | the repository | `/mnt/media/Laboratory/habbo/holo/cms`, served by the user's Docker stack on `http://localhost:11300` |

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
- Files with no like in 1.3.1: `minimail/`, `collectables.php`, `group_forum.php`, `invite.php`, `newsletter/`,
  `rss.php`, `locale/`, `myhabbo/`, `_upgrade.php`.

# What the port follows

Every ported page follows 1.3.1, the copy in the repository. The user wants the latest version for R26 as the
reference: "i might downloaded two different versions, but i want to keep the latest r26 version for the source
reference." How the reference moves to 3.1.1, and which of its pages and features the port takes, is the user's to
decide.
