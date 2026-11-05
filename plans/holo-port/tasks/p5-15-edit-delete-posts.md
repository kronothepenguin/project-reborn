---
type: Task
title: Edit and delete posts
description: The author's active habbo, or anyone with forum.edit, modifies a post in the editor, which then shows when and by whom, and deletes it after Holo's confirmation, a thread going with its last post.
status: done
phase: p5
depends_on: [p5-14]
packages: [packages/cms, tests/e2e]
holo: [source/holo/updatepost.php, source/holo/deletepost.php]
timestamp: 2026-11-05T22:52:34+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T22:52:34+00:00"}
---

# Goal

Authors and moderators correct and remove posts, as in Holo
([0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [x] `Modify` and the delete button show on the active habbo's own posts and, with `forum.edit`, on every post.
- [x] `POST /forum/posts/{id}` saves the edit with its time and editor, and the post shows `Last modified ... by
  ...`.
- [x] `POST /forum/posts/{id}/delete`, after Holo's `Are you sure you want to delete this post? This cannot be
  reverted.`, deletes the post and returns to its thread, or to the board when the thread went with it.
- [x] Go tests, and the `forum` browser suite edits and deletes as author and as moderator.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs forum
```

Results (2026-11-05T22:52:34+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`; `pnpm build` passes and `svelte-check` finds nothing in
  the forum's components.
- The CMS tests let the author's active habbo and a holder of `forum.edit` edit a post, with the time and the editor,
  and refuse Dora, Frank's other habbo, a guest, a missing post, a blank text and a switched-off board; take an edit at
  once, on a closed thread; delete a reply and stay on the thread, refuse another's post, and send a moderator who
  deletes the last post to the board with the thread gone; and show Modify to the author, a moderator, and no one else.
- `node run.mjs forum` passes all 37 checks. The new ones find Modify and the delete button on Frank's five posts of a
  page only; Modify saving, on a closed thread, with `Last modified ... by Frank`; Holo's question before a delete, and
  Proceed coming back to the thread; and Admin-1 deleting the thread's last post and landing on the board. The
  screenshot `forum-delete-post` was read by eye.
- Breaking these on purpose fails a test: either half of who may change a post, the switched-off board, the editor,
  the blank check, the board answer and the empty thread, and each part of who sees Modify; in the browser, the edit's
  address, Modify for everyone and the form missing on closed threads. Reloading after every deletion instead of
  following the answer changes nothing, since a deleted thread's page sends the visitor to the board anyway.

# Notes

- The form, the delete button and Modify stay on closed threads, as in Holo, since edits are not replies.

