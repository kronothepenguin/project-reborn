---
type: Decision
title: Updates that sign-in needs apply at start
description: An update marked automatic applies when a program starts, after a copy of the database; a failure shows an error page and goes to the log, and a test keeps sign-in working on the database start-up leaves.
status: accepted
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
tags: [store, cms, housekeeping, updates]
---

# Decision

- An update file is marked `-- automatic` when the new code's sign-in, its housekeeping access check or the update page
  read what it adds.
- When the CMS or housekeeping starts, it saves a copy of the database and applies every waiting update up to the last
  automatic one. Updates keep their order, so unmarked updates before it apply with it.
- If one fails, the program writes the error to its log and answers every page with an error page and status 503. Each
  start tries again.
- A test signs in and opens the update page on the database as start-up leaves it, so a missing mark fails the test.

# Context

Told that a waiting update could add a column that sign-in reads, so that nobody could sign in to apply it, the user
answered: "these kind of updates should be automatic though... but keeping a backup always if db gets broken, the failed
update should be notified to the admin somehow... like an error page in the cms if db gets broken an noone could access".

# Consequences

- Most releases have no automatic update, and their updates wait for an administrator
  ([0069](/decisions/0069-waiting-updates-close-the-hotel.md)).
- The error page tells visitors that the hotel could not be updated. The error itself stays in the log, which only the
  server's administrator reads.
