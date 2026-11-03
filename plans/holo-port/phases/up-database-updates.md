---
type: Phase
title: UP Database updates
description: A release reaches an installed hotel through database updates applied from housekeeping, with automatic updates for sign-in, a copy before each run, config.json's new keys, and an installer that links to the hotel.
status: active
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
tags: [up, store, cms, housekeeping, installer, config]
---

# Goal

An administrator updates a hotel by replacing the binaries and restarting the programs, and the database follows
without being recreated.

# Scope

The design is [How database updates work](/reference/database-updates.md).

- Update files and their runner in `packages/store`, the baseline, and the test that compares them with the schema files
  ([0067](/decisions/0067-updates-are-our-own-migrations.md)).
- Seeds as updates, and a new database with every update ([0068](/decisions/0068-seeds-are-updates.md)).
- The hotel closed while updates wait ([0069](/decisions/0069-waiting-updates-close-the-hotel.md)).
- Housekeeping's update page, the `housekeeping.database` attribute, config.json's new keys, and the installer's links to
  the hotel ([0070](/decisions/0070-housekeeping-applies-updates.md)).
- Automatic updates at start, and the error page when one fails
  ([0071](/decisions/0071-sign-in-updates-apply-at-start.md)).

| Holo source | Where it goes |
| --- | --- |
| `upgrade.php` | update files in `packages/store/migrations/`, applied from `/housekeeping/updates` |
| `maintenance.php` | the maintenance page, shown while updates wait |
| `install.php` (home store) and `staff.php` (ranks) | `0002-home-store.sql` and `0003-ranks.sql` |

Out of scope:

- the orchestrator and the single binary (`plans/later.md`, [0072](/decisions/0072-later-work-in-plans-later.md));
- minor and major updates (`packages/store/knowledge/discussions/minor-and-major-updates.md`).

# Exit criteria

- A hotel installed before updates existed reaches the current database through updates applied in housekeeping, keeps
  its users, habbos and homes, and receives Holo's home store.
- A new database holds every update, and a database built from the schema files matches one built from the updates.
- While updates wait, the CMS shows maintenance and housekeeping its update page. An administrator signs in and applies
  them after a copy is saved, and the hotel opens.
- A failed update leaves the database as it was before that update and names it. A failed automatic update shows the
  error page.
- config.json gains a release's new keys from housekeeping.
- The installer's done page leads to the hotel.

# Tasks

- [up-01 Apply update files](/tasks/up-01-update-runner.md) — done
- [up-02 Start the updates from a baseline](/tasks/up-02-baseline.md) — done
- [up-03 Turn the seeds into updates](/tasks/up-03-seed-updates.md) — done
- [up-04 Add the database attribute](/tasks/up-04-database-attribute.md) — done
- [up-05 Build housekeeping's update page](/tasks/up-05-update-page.md) — done
- [up-06 Close the hotel while updates wait](/tasks/up-06-close-while-waiting.md) — done
- [up-07 Apply automatic updates at start](/tasks/up-07-automatic-updates.md) — done
- [up-08 Offer config.json's new keys in housekeeping](/tasks/up-08-config-keys.md) — done
- [up-09 Link the installer to the hotel](/tasks/up-09-installer-links.md) — done
- [up-10 Test updates in a real browser](/tasks/up-10-browser-suite.md) — done
- [up-11 Verify UP](/tasks/up-11-exit-check.md) — todo
