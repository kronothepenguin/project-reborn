---
type: Decision
title: One waiting request per habbo, and reports in the Help Tool's window
description: A habbo may have one help request or post report that staff have not picked up, and reporting a post opens Holo's Help Tool window, whose Proceed button sends the report.
status: accepted
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [forum, help, p5]
---

# Decision

- A habbo may have one help request or post report that staff have not picked up yet. Another answers Holo's "Unable
  to report post: you still have a pending support request. Please try again later. Note that post reports also count
  as support requests."
- The rule counts per habbo, not per address as Holo did, and P7's help requests follow the same rule.
- Reporting a post opens Holo's small Help Tool window with its question, "Is the post you have selected offensive or
  breaking the rules? Are you sure you want to report this post?". Proceed is a button that sends the report, and the
  window then answers "Thank you for reporting this post."
- P5 builds the window, and P7 reuses it.

# Context

Holo allowed one waiting request per address, help and reports together, so people sharing a connection blocked each
other, and it reported through a plain link. The user chose the rule per habbo and the window built in P5.

# Consequences

- The store's help ticket notes, which leave reports unlimited, change with P5's report task.
