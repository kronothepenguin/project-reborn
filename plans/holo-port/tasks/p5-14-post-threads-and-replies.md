---
type: Task
title: Start threads and reply
description: Signed-in habbos start threads and reply in the BBCode editor, quote posts and preview a post in its box, and blank, long, hasty and closed-thread posts are refused with Holo's texts.
status: todo
phase: p5
depends_on: [p5-13]
packages: [packages/cms, tests/e2e]
holo: [source/holo/newtopic.php, source/holo/savetopic.php, source/holo/savepost.php, source/holo/previewpost.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Habbos write on the board, as in Holo, in the editor of [ED](/phases/ed-bbcode-editor.md)
([0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md), [0091](/decisions/0091-forum-spam-check.md),
[0092](/decisions/0092-bbcode-editor.md)).

# Steps

- [ ] ⚡`forum/new-thread`: Holo's form with `Topic:` and `Post:`, `Preview »`, `Cancel` and `Save`;
  `POST /forum/threads` creates the thread with its first post and opens it.
- [ ] ⚡`forum/reply-form`: `Post reply` and `Quote` open the form under the posts; `POST
  /forum/threads/{id}/posts` adds the reply and shows the last page.
- [ ] The editor shows smilies while `features.smilies` is on, and the preview shows the post in the habbo's box.
- [ ] Refusals: a blank title, a title over 30 characters, a blank post, a post over 65,535 characters, a post within
  `forum.spamSeconds` of the habbo's last, and a reply to a thread closed meanwhile, which then shows closed.
- [ ] Go tests, and the `forum` browser suite posts, quotes, previews and is refused.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs forum
```
