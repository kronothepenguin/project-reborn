---
type: Reference
title: Access group editing
description: How /access-groups changes groups, members and direct attributes in one transaction with its log row and the keepManager guard.
---

# One transaction

`/access-groups` creates, edits and deletes groups, with their attributes, fuses, levels and members.
`POST /users/{id}/access-groups` adds, changes or removes a member, and `POST /users/{id}/attributes` replaces a user's
direct attributes.

- Every change runs in `inTx`, one transaction with its log row and `keepManager`. The change uses only the queries
  `inTx` hands it, because the pool's one connection is the transaction's until `inTx` returns.
- `keepManager` refuses a change that leaves nobody holding both `housekeeping.access` and `housekeeping.accessGroups`,
  from any group or directly (decision holo-port/0053).
- A refusal is logged after the rollback, through the pool.

# Levels

Nobody edits a group above their level, adds someone to it, or sets a level above their own (decision holo-port/0055).
A level runs from 0 to `maxLevel`, 99.

# The display habbo

The display habbo is one of the user's own habbos, so the group's page finds the user first with `?habbo=`, a habbo's
name or a user's id, and then posts the membership.
