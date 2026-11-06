---
type: Task
title: Start threads and reply
description: Signed-in habbos start threads and reply in the BBCode editor, quote posts and preview a post in its box, and blank, long, hasty and closed-thread posts are refused with Holo's texts.
status: done
phase: p5
depends_on: [p5-13]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/newtopic.php, source/holocms/savetopic.php, source/holocms/savepost.php, source/holocms/previewpost.php]
timestamp: 2026-11-05T22:40:53+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T22:40:53+00:00"}
---

# Goal

Habbos write on the board, as in Holo, in the editor of [ED](/phases/ed-bbcode-editor.md)
([0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md), [0091](/decisions/0091-forum-spam-check.md),
[0092](/decisions/0092-bbcode-editor.md)).

# Steps

- [x] ⚡`forum/new-thread`: Holo's form with `Topic:` and `Post:`, `Preview »`, `Cancel` and `Save`;
  `POST /forum/threads` creates the thread with its first post and opens it.
- [x] ⚡`forum/reply-form`: `Post reply` and `Quote` open the form under the posts; `POST
  /forum/threads/{id}/posts` adds the reply and shows the last page.
- [x] The editor shows smilies while `features.smilies` is on, and the preview shows the post in the habbo's box.
- [x] Refusals: a blank title, a title over 30 characters, a blank post, a post over 65,535 characters, a post within
  `forum.spamSeconds` of the habbo's last, and a reply to a thread closed meanwhile, which then shows closed.
- [x] Go tests, and the `forum` browser suite posts, quotes, previews and is refused.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs forum
```

Results (2026-11-05T22:40:53+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms` and `packages/store`; `make check-docs` passes; `pnpm
  build` passes, `svelte-check` finds nothing in the forum's components, and the island guard passes.
- The CMS tests open a thread with its trimmed title and first post; refuse a blank title, 31 characters, a blank post
  and 65,536 characters with their texts while 30 and 65,535 pass; refuse a guest and a switched-off board; send a
  reply to the thread's last page; refuse a blank reply, a missing thread and a guest; answer `closed` for a closed
  thread before anything else; refuse a thread and a reply within `forum.spamSeconds` of the habbo's last post, but not
  31 seconds on or with the check off; and give both forum pages the signed-in habbo's own box.
- `node run.mjs forum` passes all 31 checks. The new ones follow Frank through New Thread, which swaps the list for the
  form with its title ready; Holo's empty-title words; a title over 30 characters; Preview in his own box and « Modify
  back; Save opening the thread; Post reply opening the form and hiding itself; a blank reply; Holo's spam; a reply once
  the check is off; Quote with the post quoted, going to the last page; and a reply to a thread closed meanwhile showing
  it closed. The screenshots `forum-new-thread-preview` and `forum-quoted` were read by eye.
- Breaking these on purpose fails a test: the blank check, the lengths in characters and their limits, the trimmed
  title, the spam checks and their direction, the order of the closed check, the last page, the habbo's box and the
  quote's text; in the browser, the empty-title check, the hidden Post reply, the quote, the reload on a closed thread,
  the hidden list and the preview's messages. Removing the guard for `forum.spamSeconds` 0 changes nothing, since no
  post is dated later than now; it stays, saying that 0 turns the check off.

# Notes

- Holo has no text for a title over 30 characters or a post over 65,535, which its columns cut short, so the port
  says `Topic title may not be longer than 30 characters` and `Post may not be longer than 65535 characters`, after
  Holo's `Topic title may not be blank`.
- Holo's error bubble under the title stays until the page reloads, as here.
- The posts and the forms sit in tables of their own, since an island cannot sit inside a table's rows; they keep the
  same columns.

