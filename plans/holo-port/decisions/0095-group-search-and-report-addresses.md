---
type: Decision
title: The group search and the report window get their own addresses
description: GET /groups?name= opens the group with exactly that name, ignoring case, or shows the not-found page with Holo's no-results line, and GET /forum/posts/{id}/report shows the Help Tool window whose Proceed posts the report.
status: accepted
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
tags: [groups, forum, p5]
---

# Decision

- The `Search for group` box of a group's `Page not found!` sends `GET /groups?name=<name>`. It opens the group with
  exactly that name, ignoring case, like the header's habbo search `/home?name=`. Otherwise the not-found page shows
  again with Holo's `Sorry, but no results were found for '<name>'.`
- `%` and `_` are plain characters, not the wildcards of Holo's `LIKE`.
- `GET /forum/posts/{id}/report` shows the Help Tool window of [0090](/decisions/0090-post-reports.md), and its
  Proceed button posts to the plan's `POST /forum/posts/{id}/report`.

# Context

The plan listed no address for either. The user chose these over a search that keeps Holo's wildcards.
