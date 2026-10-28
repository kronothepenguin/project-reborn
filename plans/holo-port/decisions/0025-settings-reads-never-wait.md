---
type: Decision
title: Settings reads never wait on writers
description: virtual.Settings publishes its values through an atomic pointer read without locks, and a mutex used only by Set and Reload serializes the writers.
status: accepted
timestamp: 2026-10-28T00:30:43+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-28T00:30:43+00:00"}
tags: [virtual, settings, concurrency]
---

# Decision

- `Settings` copies its values map on every write and publishes it through an `atomic.Pointer`; the getters read
  it without a lock.
- A `sync.Mutex` used only by `Set` and `Reload` serializes the writers, database calls included. This way two saves
  cannot drop each other's change or together break a rule between settings.
- `Settings` uses no `sync.RWMutex`.

# Context

The user asked why `Settings` has both an atomic pointer and a mutex.

- An `RWMutex` held across the database call would make every getter wait on it. The store has a single
  connection, so a deadlock follows when a request holding that connection in a transaction reads a setting while
  `Set` waits for the connection.
- An `RWMutex` taken only around the map update would leave the writers unserialized.

The user chose to keep the read-mostly pattern of `sync/atomic`'s `ExampleValue_readMostly`, explained by a comment on
the type.

# Consequences

- Getters never block, even while `Set` or `Reload` waits for the database.
- `Set` and `Reload` run one at a time.
