---
type: Note
title: To settle
description: Lists the code to change and the work in progress.
---

Each entry is removed by the task that settles it.

# Code to change

- The CMS's `credits/transactions-table.astro` builds its own `<table>`: it uses the shared `Table` primitive. Rule:
  `building-astro-components`.

# In progress

- Slaves remove the old tests the user decided on: tests of a tool alone, SQL rules a program already proves, and
  details no user or client observes. They keep the guards. Rule: `testing-behaviours`.
- Slaves propose the spec lines for tests that prove a behaviour no spec lists; the user approves them per feature.
