---
type: Plan
title: Buying furni
description: The store keeps credits and furni; the server runs the purchase.
---

# Architecture

- `store`: a query that takes the credits and gives the furni in one transaction.
- `server`: the purchase message calls the query and sends the new credits and hand to the client.

# Decisions

- The credits and the furni change in one transaction: a purchase either completes or leaves both as they were.
