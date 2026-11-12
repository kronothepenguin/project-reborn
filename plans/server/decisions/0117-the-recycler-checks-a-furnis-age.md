---
type: Decision
title: The recycler checks a furni's age, from when it was made
description: A furni younger than the recycler's minimum owned time, 30 days by default and 0 for no rule, is refused; its age counts from the day it was created, whoever held it since.
status: accepted
timestamp: 2026-11-12T01:11:06+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-12T01:11:06+00:00"}
tags: [server, furni, recycler, settings]
---

# Decision

- The recycler refuses a furni younger than its minimum owned time, a setting, 30 days by default. 0 turns the rule off.
- A furni's age counts from the day it was bought or created, which the store keeps. Trading it, or getting it as a
  present, does not start the count again.

# Context

The client tells habbos that a furni must be owned for a minimum time, which Holo sent, 30 days, and never checked.
Offered a check from the furni's creation, a check from when the habbo got it, or no check as Holo, the user chose
"Checked, from when the furni was made (Recommended)": "A furni younger than the setting (30 days by default, 0 turns
the rule off) is refused. Its age counts from the day it was bought or created, which the database already keeps;
trading it or receiving it as a present does not restart the clock. Example: a chair bought 10 days ago cannot be
recycled yet, even after being traded."

# Consequences

- [s5-16](/tasks/s5-16-recycler.md) compares the furni's `created_at` with the setting.
