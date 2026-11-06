---
type: Task
title: Moderate threads
description: Holders of forum.edit open Holo's Moderation Tools on a thread to rename it within 30 characters, open or close it, make it sticky or normal, and delete it after Holo's confirmation.
status: done
phase: p5
depends_on: [p5-13]
packages: [packages/cms, tests/e2e]
holo: [source/holo/opentopicsettings.php, source/holo/savetopicsettings.php, source/holo/deletetopic.php, source/holo/confirm_delete_topic.php]
timestamp: 2026-11-06T17:13:26+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T17:13:26+00:00"}
---

# Goal

Moderators keep the board in order, as with Holo's Moderation Tools ([0015](/decisions/0015-attribute-names-and-fuses.md)).

# Steps

- [x] `Moderation Tools »` for `forum.edit`: ⚡`forum/moderation` with Holo's dialog, the title up to 30
  characters, Open or Closed, Normal or Sticky topic, `Cancel`, `Delete` and `Save`.
- [x] `POST /forum/threads/{id}/settings` answers `The thread has been updated successfully.` and refuses a blank
  title.
- [x] `POST /forum/threads/{id}/delete`, after Holo's confirmation, deletes the thread with its posts.
- [x] Go tests, and the `forum` browser suite renames, closes, sticks and deletes a thread.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs forum
```

Results (2026-11-06):

- `gofmt` and `go vet ./...` in `packages/cms`: clean.
- `go test ./... -race` in `packages/cms`: every package passes, among them `TestModeratorsRenameCloseAndStickAThread`,
  `TestOnlyModeratorsReachTheModerationTools`, `TestModeratorsDeleteAThreadWithItsPosts` and
  `TestOnlyModeratorsSeeTheModerationToolsLink`.
- `pnpm test forum` in `tests/e2e`: 47 checks pass. Admin-1 opens the Moderation Tools on Frank's thread, which show
  its title, Open and Normal; a blank title is refused with `Topic title may not be empty`; Save renames, closes and
  sticks it, Holo's answer takes the post list's place, and Proceed opens the closed, renamed thread, which the board
  lists with the stickies; Delete asks first, Cancel keeps the thread and Proceed deletes it with its posts. Frank gets
  no Moderation Tools. The screenshots `forum-moderation-tools`, `forum-moderation-saved` and
  `forum-moderation-delete` were read by eye.

# Notes

- Resumed from the uncommitted work of a cancelled session on the branch `p5`: its two routes and handlers stayed,
  with Holo's own words for a blank title in the Moderation Tools, `Topic title may not be empty`
  (`viewthread.php:264`), in place of `savetopic.php`'s `Topic title may not be blank`.
- The Moderation Tools load the thread as it is when they open, from `GET /forum/threads/{id}/settings`, as Holo's
  `opentopicsettings.php` did, so they never show a state another moderator has changed since the page loaded.
- Holo's `savetopicsettings.php` checked nothing on the server, so the port's refusals of a blank or long title are in
  [Where the port differs from Holo](/reference/holo-differences.md), with Enter, which no longer reloads the page, and
  a failed save, which opens the Moderation Tools again with the reason.
- `You are about to delete a compelete topic.` keeps Holo's spelling, as the port keeps Holo's texts.

