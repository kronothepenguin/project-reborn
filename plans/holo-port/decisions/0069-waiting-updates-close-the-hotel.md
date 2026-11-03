---
type: Decision
title: Waiting updates close the hotel
description: While a database lacks updates of the running binary, the CMS shows the maintenance page and housekeeping only its update page, until the updates are applied.
status: accepted
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
tags: [cms, housekeeping, updates]
---

# Decision

- While updates wait, the CMS answers every page with its maintenance page and status 503, with the staff sign-in form,
  and housekeeping shows only its update page. Both open again by themselves once the updates are applied.
- Every waiting update closes the hotel. Updates are not sorted into minor and major.
- The discussion of minor and major updates is kept in
  `packages/store/knowledge/discussions/minor-and-major-updates.md`, and nothing is planned from it.

# Context

Offered a page that waits for the updates, the user answered: "the wait page, like a maintenance is ok, but i want to
know if there is a way to detect if an update is minor or major, as example, minor update allows the cms+housekeeping to
run normally without breaking user experience, but a major update will break user experience and the db update is a
must. for major updates i expect to show up the maintenance until admin updates the db."

Shown that a program can compare its schema files with the database but cannot see data, the user answered: "it's not
that simple. [...] we can go with every update configures the hotel into maintenance mode for now, but keep this
discussion into a file in the knownledge for the future, do not plan anything about minor and major, just keep the
information if for some reason we would discuss this in the future." The user chose the store's knowledge for that file,
and later said: "i think we should go with show up maintenance only during updates".

# Consequences

- New code never serves pages from a database it was not written for. Sign-in is the exception that
  [0071](/decisions/0071-sign-in-updates-apply-at-start.md) keeps working, so that staff can reach the update page.
- `site.maintenanceBypass` does not open the hotel while updates wait, and scheduled tasks do not run.
