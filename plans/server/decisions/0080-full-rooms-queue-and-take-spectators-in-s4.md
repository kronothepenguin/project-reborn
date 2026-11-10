---
type: Decision
title: Full rooms queue habbos and take spectators in S4
description: S4 builds the R26 client's queue for a full room and its spectator mode, in a task of their own whose details are asked when it starts.
status: accepted
timestamp: 2026-11-10T19:40:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T19:40:12+00:00"}
tags: [server, rooms, queue]
---

# Decision

- S4 builds the queue the R26 client shows for a full room (259, `ROOM_QUEUE_CHANGE`) and its spectator mode (254,
  283, 298, `GET_SPECTATOR_AMOUNT`), in memory ([0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md)).
- Its details, such as the queue sets, a priority for club members and the spectators' limit, are asked when its task
  starts.

# Context

Holo had neither, and their texts (`queue_set.*`) come with the client's files, which are not served yet. Offered
refusing full rooms now and queueing later, or queueing in S4, the user chose "Queue in S4": "s4-07 builds the queue
and spectator mode now; its details (sets, club priority, spectator limits) come as more questions. Example: the 26th
habbo waits in line and sees its position until a place frees."

# Consequences

- [s4-12](/tasks/s4-12-queue-and-spectators.md), split from [s4-07](/tasks/s4-07-room-extras.md), builds them once
  its questions are answered.
