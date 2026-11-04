---
type: Decision
title: The forum refuses blank posts and posts within 30 seconds
description: A habbo's new thread or reply within a setting's 30 seconds of its last post answers Holo's unused Spam detected!, and a blank post answers Post may not be blank.
status: accepted
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [forum, settings, p5]
---

# Decision

- A new thread or a reply sent within 30 seconds of the habbo's last post answers "Spam detected!", the text Holo kept
  for it but never used. Edits do not count.
- The 30 seconds are a setting in housekeeping's Discussion Board form, beside Forum Enabled and Smilies Enabled.
- A blank post answers "Post may not be blank", after Holo's "Topic title may not be blank".

# Context

Holo checked neither, and only kept "Spam detected!" in a hidden field of `newtopic.php`. Offered to keep both allowed,
the user answered "i prefer spam detector", then chose 30 seconds as a setting over 15 or 60.
