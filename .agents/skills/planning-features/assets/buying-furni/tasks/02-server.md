---
type: Task
title: Run the purchase in the server
description: The purchase message spends the credits and puts the furni in the hand.
scope: [packages/server]   # repo folders the task changes
depends_on: [01-store]   # NN-<slug> of this feature, <feature>/NN-<slug> of another; [] when none
skills: [testing-behaviours]   # skills the slave loads
---

# Goal

A habbo buys a furni through the server, as the spec's behaviours say.

# Context

- [Spec](/features/buying-furni/spec.md)
- [Plan](/features/buying-furni/plan.md)
- `packages/server/knowledge/index.md`

# Steps

1. Handle the purchase message with the query of `01-store`.
2. Send the new credits and the hand to the client.
3. Test both behaviours of the spec.

# Checks

- `go test ./packages/server/...`
