---
type: Decision
title: Sticky threads head every page of the forum
description: Every sticky thread shows at the top of every page of the board, then ten other threads, with pages counted from the other threads so that none is skipped.
status: accepted
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [forum, p5]
---

# Decision

- Every sticky thread shows at the top of every page of the board, then 10 other threads, each list ordered by its
  newest post as in Holo.
- Pages are counted from the other threads, so no thread is skipped and any number of stickies works. A page with
  stickies holds more than 10 rows.

# Context

Holo's arithmetic skipped threads from page 3 on: with 2 stickies and 30 other threads, threads 17, 18, 27 and 28 were
on no page, and 10 stickies hid every other thread. The user chose stickies on every page over stickies on page 1 only.
