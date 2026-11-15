---
type: Decision
title: What the server saves and what lives only in memory
description: Placed furni, last time online, friend requests, room rights, bans, rating, chat history, furni state, ignore lists and the Game Hall of Fame are saved; positions, loaded rooms, who is online, instant messages and room events live only in memory.
status: accepted
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, data]
---

# Decision

Saved in the database, and hot while in use ([0009](/decisions/server/0009-virtual-holds-the-server-state.md)):

| Data | Example |
| --- | --- |
| Furni placed in rooms | Where each item stands |
| Last time online | Shown in friends lists and on homes |
| Friend requests | A request to someone offline waits for them |
| Room rights | Habbos the owner gave rights to (`ASSIGNRIGHTS`) |
| Room bans | A habbo banned from a room (`BANUSER`) stays banned |
| Chat history | What was said in rooms, kept for moderators |
| Furni state | A lamp on or off, the number on a dice, a gate open or closed |
| Room rating | A room's rating and who already voted (`RATEFLAT`) |
| Ignore lists | Habbos someone chose to ignore (`IGNOREUSER`) |
| Game Hall of Fame | Instant game scores |

Only in memory, gone after a restart:

| Data | Example |
| --- | --- |
| Positions | Where each habbo stands in a room |
| Loaded rooms | The rooms in use and the habbos in them |
| Who is online | The online status and the online count |
| Instant messages | They reach only a friend who is online at that moment |
| Room events | An owner's event listed in the navigator |

Everything else is asked when its phase starts, and each answer is a new decision.

# Context

The user: "every room is unload on a server reset and every user too but something like furnis in the room is
persistent in the database, please ask and do not make assumptions about what is a temporal data and what is
persistent". The other rows are the user's answers on 2026-11-05 to which of twelve kinds of data must survive a
restart.

# Consequences

- When the CMS runs apart from the server, it cannot know who is online, which lives only in the server's memory. How
  the site shows online status is asked when that work starts; until then the hotel shows as offline
  (`knowledge/decisions/holo-port/0013-defer-game-server-features.md`, `knowledge/decisions/holo-port/0087-online-picture-stays-offline.md`).
- The tables for saved data come with the phases that need them, through the `adding-data-persistence` skill.
