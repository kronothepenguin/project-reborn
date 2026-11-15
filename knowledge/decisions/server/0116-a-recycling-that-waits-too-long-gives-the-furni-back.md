---
type: Decision
title: A recycling that waits too long loses its reward and gives the furni back
description: After the recycler's time-out the reward can no longer be taken; the habbo cancels and gets the furni it gave back in its hand.
status: accepted
timestamp: 2026-11-12T01:11:06+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-12T01:11:06+00:00"}
tags: [server, furni, recycler]
---

# Decision

- A finished recycling waits for its habbo for the recycler's time-out, 7 days by default. After it, the reward can no
  longer be taken.
- The habbo then cancels, the only button the client shows, and gets the furni it gave back in its hand.

# Context

Holo's client shows a recycling that waited too long as timeout, with only a cancel button, and Holo's cancel gave the
furni back; its server code would have destroyed the furni and given nothing had a redeem arrived that late. Offered the
furni back, everything lost, or no time-out, the user chose "Reward lost, furni come back (Recommended)": "After the
time-out the reward can no longer be taken; the habbo presses cancel and gets its own furni back in the hand. This is
what Holo did in practice, since the client only offers cancel there. Example: you recycle 20 furni for a Palm Chair,
forget for 8 days, press cancel and have your 20 furni again."

# Consequences

- s5-16 builds it: taking the reward works only between the recycling's end and its
  time-out, and never destroys furni without giving the reward.
