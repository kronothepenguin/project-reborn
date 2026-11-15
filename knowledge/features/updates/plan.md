---
type: Plan
title: "Updates: how"
description: packages/store applies numbered update files with a copy first, the CMS and housekeeping close while updates wait, and housekeeping's update page applies them and config.json's new keys.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/store` | Update files in `migrations/`, the `migrations` table, `ApplyUpdates`, `Backup` and `UpdateCheck`; a test compares a database built from the schema files with one built from the updates (`packages/store/knowledge/database-updates.md`) |
| `packages/cms` | The maintenance page while updates wait, with the way to the update page; automatic updates at start and the error page |
| `packages/housekeeping` | `/housekeeping/updates`: lists and applies the updates and saves `config.json`'s new keys; every other page leads there while updates wait |
| `packages/config` | `Differences` and `Rewrite`: the keys `config.json` lacks and the keys nothing reads |
| `packages/auth` | The `housekeeping.database` attribute |
| `packages/installer` | Creates a new database through `store.Open`; it never applies updates |
| `tests/e2e` | The `updates` suite: a hotel installed before updates, the maintenance page, the update page, the copy and `config.json`'s new keys |

# Decisions

- [Database updates are our own migrations](/decisions/holo-port/0067-updates-are-our-own-migrations.md) — Numbered
  SQL update files apply in order, each in one transaction with its record and a foreign-key check, after a copy of the
  database; the schema files stay beside them.
- [Seeds are updates, and a new database gets every update](/decisions/holo-port/0068-seeds-are-updates.md) — Seeds
  are update files in `packages/store`, and a program that creates a database applies every update to it.
- [Waiting updates close the hotel](/decisions/holo-port/0069-waiting-updates-close-the-hotel.md) — While updates
  wait, the CMS shows maintenance and housekeeping only its update page.
- [Updates that sign-in needs apply at start](/decisions/holo-port/0071-sign-in-updates-apply-at-start.md) — An
  update marked automatic applies when a program starts, after a copy; a failure shows an error page.
- [Update lists reach tests through the internal
  routers](/decisions/holo-port/0073-update-lists-reach-tests-through-the-router.md) — `store.UpdateCheck` takes its
  list of updates, and the error page of a failed automatic update is tested through each program's internal router.
- [Inside reborn the installer lives under /installer/](/decisions/reborn/0004-the-installer-inside-reborn.md) — It
  supersedes holo-port 0070 for the done page and keeps the rest: housekeeping applies the updates and `config.json`'s
  new keys, and the installer never applies updates.

# Notes

- No update up to `0022` is marked `-- automatic`.
- The guard of a failed automatic update stands outside the session reader, because the new code's sessions may need
  the update that failed. Housekeeping's static files stay outside the guard, so its error page finds its styles.
- The copy's path goes in the staff log and in the page that reports a failure, never in a URL.
