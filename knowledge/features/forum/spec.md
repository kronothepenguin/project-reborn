---
type: Spec
title: Forum
description: Holo's Discussion Board, one for the whole site, where habbos start threads, reply, edit, report posts and moderators run the threads.
status: done
projects: [packages/cms, packages/store, packages/components]
---

# What

The site has one Discussion Board at `/forum`. Anyone reads it. A signed-in habbo starts threads and replies in the
BBCode editor, and edits or deletes its own posts. Holders of `forum.edit` edit any post and rename, close, stick and
delete threads. A habbo reports a post in Holo's Help Tool window.

# Behaviours

## Reading

- Anyone opens the board: Holo's title, sub-tab, box and columns show (decision holo-port/0017).
- Every sticky thread heads every page, then ten other threads by their newest post (decision holo-port/0088).
- A board has no thread: it says so; a board of stickies alone is not empty.
- A thread's row shows its pages, its opener, its last post, its replies and its views.
- A post is deleted: its thread's row shows the post before it as the last one, with one reply less.
- A thread's page holds ten posts, with `RE:` on all but the first.
- A post's box shows the habbo's name, its online picture, its messages, avatar, favourite group, worn badge and motto
  ([hotel status](/features/hotel-status/spec.md)).
- A post of an archived habbo shows `archived` in place of its name, with no link, avatar, messages or motto
  (decision holo-port/0089).
- An edited post says who modified it, and when.
- Every load of a thread adds one to its views, reloads included (decision holo-port/0094).
- A guest reads the board and a thread: Holo's line shows, with no New Thread and no report flags.
- A signed-in habbo opens a closed thread: Holo's Closed Thread shows in place of Post reply.
- `features.forum` is off: the board sends visitors away, as Holo's did.

## Writing

- A habbo presses New Thread: Holo's form takes the list's place, and Save opens the new thread.
- A habbo presses Post reply: the form opens under the posts, and the button hides.
- A habbo writes a post: the BBCode editor shows it as it will look, with smilies while `features.smilies` is on
  (decision holo-port/0092).
- A habbo presses Preview: the post shows in the habbo's own box, and `« Modify` goes back to the form as typed.
- A habbo presses Quote: the form opens with the post quoted, and the reply goes to the last page.
- A blank title or a blank post is refused (decision holo-port/0091).
- A title over 30 characters or a post over 65,535 characters is refused.
- A new post within `forum.spamSeconds`, 30 by default, of the habbo's last is refused with Holo's `Spam detected!`;
  0 lets every post through (decision holo-port/0091).
- A habbo replies to a thread closed meanwhile: the thread shows closed, and nothing is added.
- Only the active habbo's posts count as the user's own (decision holo-port/0086).

## Editing and deleting

- The author of a post gets Modify and the delete button on its own posts only, closed threads included.
- A holder of `forum.edit` gets Modify on any post.
- The delete button asks first in Holo's words, and Proceed deletes the post and returns to the thread.
- A habbo deletes the last post of a thread: the thread goes too, and the board opens.

## Moderating

- A holder of `forum.edit` opens the Moderation Tools: they load the thread as it is now.
- A moderator saves a title, Open or Closed, and Normal or Sticky: the thread is renamed, closed and stuck.
- A moderator saves a blank title: it is refused in Holo's words.
- A moderator deletes a thread: Holo's question asks first, and the thread goes with its posts.
- A habbo without `forum.edit` gets no Moderation Tools.
- Staff open the Discussion Board Module: Forum Enabled, Smilies Enabled and Spam Check (30 seconds) show in Holo's
  order, and Group Purchasing Enabled stays in the general options.

## Reporting

- A signed-in habbo gets a report flag on the posts of others.
- A flag opens Holo's Help Tool in its own window at `/forum/posts/{id}/report`, which asks first
  (decisions holo-port/0090 and holo-port/0095).
- Proceed sends the report as a help ticket with the post's text and address, and thanks the habbo.
- A habbo reports a post that does not exist: Holo's "Invalid post specified" shows with 404, and nothing is written.
- A habbo with a help request or report that staff have not picked up reports again: Holo's refusal shows, and
  nothing is written (decision holo-port/0090).
