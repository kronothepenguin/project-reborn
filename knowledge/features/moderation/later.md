---
type: Note
title: "Moderation: later"
description: Work set aside for moderation: staff tools for groups, Holo's chat commands and the word filter.
---

# Staff tools for groups

A housekeeping page, behind its own attribute, that renames a group, resets its badge or deletes it, so that staff can
deal with an offensive group ([holo-port 0085](/decisions/holo-port/0085-no-housekeeping-group-tools-yet.md)). Holo's
housekeeping only counted groups, and P5 keeps to that.

# Holo's chat commands

The chat commands Holo's server answered, behind fuses access groups already grant
([server 0045](/decisions/server/0045-fuses-holos-club-set-and-every-checked-fuse.md)): `:alert` and `:ra`
(`fuse_alert`), `:roomalert` (`fuse_room_alert`), `:kick` (`fuse_kick`), `:roomkick` (`fuse_room_kick`), `:shutup` and
`:unmute` (`fuse_mute`), `:roomshutup` and `:roomunmute` (`fuse_room_mute`), `:ban` (`fuse_ban`), `:superban`
(`fuse_superban`), `:commandlist`, `:teletome`, `:jatlook`, `:userinfo` and `:whosonline` (`fuse_moderator_access`),
`:refresh`, `:cat_transform`, `:ha`, `:offline`, `:mycoords` and `:masscredits` (`fuse_administrator_access`),
`:teleport` and `:warp` (`fuse_teleport`), `:credits` (`fuse_credits`), and `:freeze` and `:unfreeze` (`fuse_freeze`).
The game server has no phase for chat commands yet. [The Holograph Emulator](/sources/holoemu.md#fuses) says
where Holo handled each.

The user chose "Every checked fuse (Recommended)": "The client's 14 and Holo's server's 15, 29 in all. Our server checks
each one when the phase of its feature comes (S3 navigator, S4 rooms, S7 mod tool and calls for help); Holo's chat
commands (:ha, :teleport, :freeze) have no phase yet and go to plans/later.md. The 11 unchecked names stay out."

# The word filter

Holo replaced each word of its `wordfilter` table with `wordfilter_censor`, `bobba`, ignoring case, in chat, room
names and descriptions, and messenger messages, while `wordfilter_enable` was on. The game server filters nothing yet
([server 0077](/decisions/server/0077-the-word-filter-waits.md)); a task of its own brings a word list that housekeeping
edits and filters the three together.

The user chose "Later, on its own (Recommended)": "No filter in S4. plans/later.md keeps Holo's filter, a word list
that housekeeping edits, for one task that covers chat, room names and messages together. Example: in S4, chat shows
exactly what was typed."
