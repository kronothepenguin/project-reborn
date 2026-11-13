---
type: Spec
title: Buying furni
description: A habbo spends credits in the catalogue to get a furni.
status: planned          # planned | active | done | parked
projects: [packages/store, packages/server]   # repo folders it touches or will create
---

# What

A habbo buys a furni from the catalogue with credits. The furni goes to the hand.

# Behaviours

- A habbo with credits buys a furni: the credits go down and the furni is in the hand.
- A habbo without credits buys a furni: the purchase is refused and the credits stay.

# Open questions

- Does a refused purchase show a message to the habbo?
