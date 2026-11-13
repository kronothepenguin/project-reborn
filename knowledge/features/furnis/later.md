---
type: Note
title: "Furnis, with the catalogue: later"
description: Work set aside for furnis: a catalogue editor, one-way doors, the fortune teller, and limits for post-its and rollers.
---

# A catalogue editor in housekeeping

The hotel's catalogue is Holo's, seeded by a database update, and no page edits it: a new price, furni or page is
another update ([server 0091](/decisions/server/0091-holos-catalogue-changed-by-updates.md)). HoloCMS had no catalogue
editor either, so pages in housekeeping that change the pages, the prices and what is on sale are new, and their design
is asked when this starts.

The user chose "Holo's, changed by updates (Recommended)": "A database update copies Holo's English catalogue
(source/holoemu/Resources/holodb.sql), as S3 did for the categories and public rooms. No page edits it in S5: a new
price or page is another database update. Example: a Throne costs 25 credits because Holo's row says 25. A housekeeping
editor is noted in plans/later.md."

# One-way doors and the fortune teller

The R26 client has a class for a one-way door, which a habbo enters with `ENTER_ONEWAY_DOOR` (232) and whose state 312
tells, and one for a fortune teller, which draws with `SET_RANDOM_STATE` (314)
(`packages/server/knowledge/r26/hh_room_utils.md`). Holo handled neither, and its catalogue sells no
one-way door, so the game server leaves both out (the server's task s5-09): a one-way door
needs its furni in the catalogue first, and the fortune teller's states come from the furni's own data, which the
repository does not hold.

# A room's most post-its and rollers

The R26 client has alerts for a room that holds its most post-its (403, `wallitem_post.it.limit`) and its most rollers
(404, `queue_tile_limit`), beside the one for a room's most furni (405). Holo never sent either, and the server has no
such limits: a room takes post-its and rollers up to `game.maxRoomFurni`
(the server's task s5-12). Limits of their own would be two settings and the two alerts.
