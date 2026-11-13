---
type: Decision
title: Plans are feature slices in one bundle
description: New work is planned in plans/reborn by feature slice, each across every project it touches, with one folder of tasks; the bundles holo-port, server and client stay as history.
status: accepted
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [process, plans]
---

# Decision

- All new work is planned in one bundle, `plans/reborn`. A slice is one feature across every project it touches: the
  store, the game server, the site, housekeeping, the installer, the client.
- The bundles `plans/holo-port`, `plans/server` and `plans/client` are history. Nothing moves: their tasks, decisions
  and logs keep their files and their numbers, and are never added to. Their reference documents stay in use.
- The phases that had not started, S6 to S9 of the server and C1 to C3 of the client, are `moved`, each naming the
  slices that took its work. `plans/later.md` keeps its text, and names the slice of each section.
- New decisions are numbered from 0001 in this bundle and cited as "reborn NNNN" outside it. A decision of a history
  bundle keeps being cited by its bundle and number, as "server 0045".

# Context

The plans were split by project: the port of HoloCMS, the game server and the client. From S5 on the work was no longer
split that way: 15 of its 22 tasks changed the site or housekeeping, and their decisions sat in the server's bundle.

The user: "currently we split per project in @plans/ but i would like to start thinking on feature slices as we can do
this now. e.g. credits: housekeeping allow modify credits, cms show credits and allow to spend them and server manages.
and furnis kind of the same, housekeeping allow to modify them, cms manages own furnis and server show and controls
states..." And: "if for some reason you decide to modify the old plans folder layout go ahead."

Three layouts were weighed: this one; one merged bundle, which would move about 500 files, renumber 238 decisions and
rewrite about 300 comments of the code that cite them; and the three bundles kept with a board across them, which leaves
a slice such as credits split over three series of tasks and decisions.

# Consequences

- The rules are the only rules for new work.
- The `tracking-plans` skill and its checker work on this layout, and the skill `tracking-holo-port` goes, since the
  port is done.
- The slices and where each came from are in the slice index (`plans/reborn/slices/index.md`).
