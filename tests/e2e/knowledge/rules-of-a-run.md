---
type: Reference
title: Rules of a run
description: How a run of the browser suites keeps clear of development servers and what makes a suite fail.
---

# Rules

- The CMS and housekeeping listen on free ports, so a run does not disturb a development server.
- The installer's port, 17306, is baked in its runners. A run refuses to start while it is busy, and it never talks to
  a server it did not start.
- The runner passes everything to the suites as arguments, the helpers of their default export.
- Each suite gets a fresh copy of the installed hotel.
- The suites read the database with `node:sqlite`.
- A suite fails if a program logs anything beyond its start-up line.
- Screenshots and server logs stay in `.run/`, which is git-ignored.
