---
type: Decision
title: A teleport takes a habbo past every check of the room's door
description: A habbo that comes into a room by a teleport skips the doorbell, the password, a room ban and the room's last free place, as Holo let it.
status: accepted
timestamp: 2026-11-11T18:05:11+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:05:11+00:00"}
tags: [server, furni, teleports, rooms]
---

# Decision

- A habbo that arrives by a teleport comes in past the doorbell, the password, a room ban and a full room.

# Context

Holo skipped every check of the door for a habbo that came by a teleport. Offered the doorbell and the password only,
everything, or nothing, the user chose "Everything, as Holo": "Past the doorbell, the password, a room ban and a full
room. Example: a banned habbo whose teleport's partner stands in the room walks straight back in, and a room for 25 can
hold 26." The recommendation was the doorbell and the password only.

# Consequences

- [s5-13](/tasks/s5-13-teleports.md) builds it. A room may hold more habbos than its most while habbos arrive by
  teleport.
