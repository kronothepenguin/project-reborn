---
type: Reference
title: Errors and exit codes
description: What tw-color prints and the status it exits with for each kind of input.
---

# Exit codes

| Condition        | Behavior                                          |
| ---------------- | ------------------------------------------------- |
| Invalid color    | warning on stderr, processing continues, exit `1` |
| Unknown option   | usage on stderr, exit `2`                         |
| Stdin unreadable | error on stderr, exit `2`                         |
| All inputs valid | exit `0`                                          |
