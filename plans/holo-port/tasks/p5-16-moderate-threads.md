---
type: Task
title: Moderate threads
description: Holders of forum.edit open Holo's Moderation Tools on a thread to rename it within 30 characters, open or close it, make it sticky or normal, and delete it after Holo's confirmation.
status: todo
phase: p5
depends_on: [p5-13]
packages: [packages/cms, tests/e2e]
holo: [source/holo/opentopicsettings.php, source/holo/savetopicsettings.php, source/holo/deletetopic.php, source/holo/confirm_delete_topic.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Moderators keep the board in order, as with Holo's Moderation Tools ([0015](/decisions/0015-attribute-names-and-fuses.md)).

# Steps

- [ ] `Moderation Tools »` for `forum.edit`: ⚡`forum/moderation` with Holo's dialog, the title up to 30
  characters, Open or Closed, Normal or Sticky topic, `Cancel`, `Delete` and `Save`.
- [ ] `POST /forum/threads/{id}/settings` answers `The thread has been updated successfully.` and refuses a blank
  title.
- [ ] `POST /forum/threads/{id}/delete`, after Holo's confirmation, deletes the thread with its posts.
- [ ] Go tests, and the `forum` browser suite renames, closes, sticks and deletes a thread.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs forum
```
