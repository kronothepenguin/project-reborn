---
type: Decision
title: The queue sets are room and spectators
description: 259 names the room's line room, target 1, and the spectators' spectators, target 2, which the client's texts queue_set.<name>.info take as keys.
status: accepted
timestamp: 2026-11-10T20:58:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T20:58:46+00:00"}
tags: [server, rooms, queue, client]
---

# Decision

- 259 names the room's line `room`, target 1, and the spectators' line `spectators`, target 2. The client's texts
  `queue_set.room.info` and `queue_set.spectators.info`, with `queue_current_<target>` and `queue_other_<target>`,
  come with the client's files ([the client feature](/features/client/spec.md)).
- Each set holds two queues, after the club line first ([0088](/decisions/server/0088-club-members-first-in-a-queue.md)):
  `club`, the club members ahead, and the set's own name, everyone else ahead; the texts take them as `%club%` and
  `%room%` or `%spectators%`.

# Context

Offered these names or placeholders settled later, the user chose "room and spectators (Recommended)": "The set
'room', target 1, and the set 'spectators', target 2; the texts queue_set.room.info and queue_set.spectators.info, with
%room% and %spectators% for the lengths, come with the client's texts. Example: queue_set.room.info could read 'There
are %room% habbos ahead of you'." With club members first, the club line adds `%club%`.

# Consequences

- s4-12 applies it.
