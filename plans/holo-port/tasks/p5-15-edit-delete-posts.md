---
type: Task
title: Edit and delete posts
description: The author's active habbo, or anyone with forum.edit, modifies a post in the editor, which then shows when and by whom, and deletes it after Holo's confirmation, a thread going with its last post.
status: todo
phase: p5
depends_on: [p5-14]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/updatepost.php, source/holocms/deletepost.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Authors and moderators correct and remove posts, as in Holo
([0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [ ] `Modify` and the delete button show on the active habbo's own posts and, with `forum.edit`, on every post.
- [ ] `POST /forum/posts/{id}` saves the edit with its time and editor, and the post shows `Last modified ... by
  ...`.
- [ ] `POST /forum/posts/{id}/delete`, after Holo's `Are you sure you want to delete this post? This cannot be
  reverted.`, deletes the post and returns to its thread, or to the board when the thread went with it.
- [ ] Go tests, and the `forum` browser suite edits and deletes as author and as moderator.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs forum
```
