---
type: Reference
title: How database updates work
description: How a release's schema and seed changes reach an installed hotel through update files in packages/store, automatic and waiting updates, a copy before each run, and housekeeping's update page with config.json's new keys.
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
tags: [store, updates, architecture]
---

# Why

- Every program applies the schema files with `CREATE TABLE IF NOT EXISTS` when it opens the database. A new table
  reaches an existing database that way, but a changed table or a new seed never does, so a hotel had to be recreated.
- Reborn is released as binaries that an administrator replaces and restarts, and later as one binary (`plans/later.md`).
  Each binary carries the updates its code needs.
- Holo's `upgrade.php` was one button that ran the changes since the last release, with no record of what had run.

Decided in [0067](/decisions/0067-updates-are-our-own-migrations.md), [0068](/decisions/0068-seeds-are-updates.md),
[0069](/decisions/0069-waiting-updates-close-the-hotel.md), [0070](/decisions/0070-housekeeping-applies-updates.md) and
[0071](/decisions/0071-sign-in-updates-apply-at-start.md). Names of routes and files below are the planned ones.

# Update files

| Part | Rule |
| --- | --- |
| Place | `packages/store/migrations/`, embedded in every program |
| Name | `NNNN-<slug>.sql`, four digits, applied in number order |
| First line | `-- <one sentence>`, the title housekeeping shows |
| Mark | a line `-- automatic` when sign-in needs the update ([Automatic updates](#automatic-updates)) |
| Content | plain SQL: schema changes and data |

- A released update never changes; a fix is a new update.
- A feature branch renumbers its updates when another branch merged the same numbers first.
- The schema files in `packages/store/schema/` stay the picture of the current database, for sqlc and the docs. A change
  is written in its schema file and as a new update, in the same commit. A test builds one database from the schema files
  and one from the updates, and fails when their tables, columns, indexes or foreign keys differ.

The first updates:

| Update | Content |
| --- | --- |
| `0001-baseline.sql` | The schema files as they were before updates existed, with `IF NOT EXISTS`, so a database created then passes through it unchanged |
| `0002-home-store.sql` | Holo's 20 categories and 298 items, with Holo's ids |
| `0003-ranks.sql` | Holo's ranks as access groups, written only when the hotel has no access group |
| `0004-database-attribute.sql` | `housekeeping.database` for the holders of `housekeeping.accessGroups` |

# The migrations table

`migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at DATETIME NOT NULL)` has one row per applied
update. A database without the table has no update applied. The first run creates the table inside its transaction, so
reading a database never writes to it.

# Applying updates

Updates apply in number order, each in its own transaction with its row:

1. `PRAGMA foreign_keys = OFF`, outside the transaction: SQLite ignores the pragma inside one, and a table rebuild needs
   it off.
2. `BEGIN IMMEDIATE`, then skip the update if another program applied it meanwhile.
3. Run the file.
4. `PRAGMA foreign_key_check`: any row it returns aborts the update.
5. Insert the row into `migrations`, then `COMMIT`.
6. `PRAGMA foreign_keys = ON`.

- The first failure stops the run. The failed update leaves no trace, the ones before it stay, and the error names it.
- Before an existing database is updated, a copy is saved beside it as `<database>.backup-<YYYYMMDD-HHMMSS>`, in UTC,
  with `VACUUM INTO`, which works while the hotel runs.
- Updates only go forward. Undoing a run means stopping the programs and putting back the copy and the previous binaries.
- Updates are never picked out of order.

# A new database

A program that finds no database, or one with no table, creates it with every update at once, seeds included. It needs
no copy.

# Automatic updates

- An update is marked `-- automatic` when the new code's sign-in, its housekeeping access check or the update page read
  what it adds.
- When the CMS or housekeeping starts, it saves a copy and applies every waiting update up to the last automatic one, in
  order, so unmarked updates before it apply too.
- If one fails, the program writes the error to its log and answers every page with an error page and status 503, which
  says that the hotel could not be updated. Each start tries again.
- A test signs in and opens the update page on the database as start-up leaves it: with every update up to the last
  automatic one, then with each later one. A missing mark fails it.

# Waiting updates close the hotel

While updates wait, after start-up has applied the automatic ones:

- The CMS answers every page with its maintenance page and status 503, with the staff sign-in form.
  `site.maintenanceBypass` does not open it.
- Housekeeping shows its update page to those who may apply updates, and tells other staff that the hotel is being
  updated.
- Scheduled tasks do not run.
- Both programs read `migrations` again on each request, and open as soon as nothing waits.

Every waiting update closes the hotel. Telling minor updates from major ones is kept as a discussion in
`packages/store/knowledge/discussions/minor-and-major-updates.md`.

# Housekeeping's update page

- `GET /housekeeping/updates` lists the waiting updates with their number and title, the applied ones with their date,
  and config.json's differences.
- `POST /housekeeping/updates` saves a copy, applies every waiting update in order, and writes a staff log row with the
  updates applied. A failure shows the update, its error and the copy's path.
- Holders of `housekeeping.database` or `housekeeping.accessGroups` may use it. At least one user always holds
  `housekeeping.accessGroups`, so a hotel always has someone who can apply its updates.

# config.json

- A release can add a key to config.json or stop reading one. A program uses the default of a missing key and ignores an
  unknown one, so a difference never closes the hotel.
- The update page lists the keys config.json lacks, with their defaults, and the keys nothing reads any more. Only the new
  keys can be edited there.
- Saving rewrites config.json with the existing keys as they are, the new keys, and without the unused ones, through a
  temporary file renamed over it. The values apply when the programs restart.

# The installer

- It installs, and refuses to once an administrator exists. It never applies updates.
- Its done page and its "already installed" page link to the hotel at `site.url`.

# A release, step by step

1. The administrator replaces the binaries and restarts the programs.
2. Each program saves a copy and applies the automatic updates, when there are any.
3. While updates wait, the CMS shows maintenance. The administrator signs in on it and opens housekeeping's update page.
4. The page saves a copy and applies the updates, and the hotel opens.
5. When config.json lacks new keys, the same page offers them, and they apply at the next restart.

# Writing an update

- Change the schema file and add the update in the same commit; the comparison test checks them.
- Rebuild a table with SQLite's procedure: create the new table, copy the rows, drop the old table, rename the new one,
  and create its indexes again.
- Seed rows carry fixed ids and use `INSERT OR IGNORE`, so rows an administrator changed stay as they are.
- An update never relies on values an administrator can change, such as a group's name.
- A new attribute in the catalogue of `packages/auth` comes with an update that grants it to the holders of
  `housekeeping.accessGroups`. A test checks that, on a new database, they hold every attribute.
- Mark the update `-- automatic` when sign-in will read what it adds; the sign-in test fails when a mark is missing.

# A hotel installed before updates

It has no `migrations` table, so every update waits, starting with `0001-baseline.sql`, which changes nothing on it. Its
administrator holds `housekeeping.accessGroups` and applies them from housekeeping. A hotel installed before P3 receives
Holo's home store this way.
