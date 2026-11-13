---
type: Spec
title: Updates
description: A release reaches an installed hotel through database updates, applied from housekeeping's update page or at start, while the hotel stays closed until none waits.
status: done
projects: [packages/store, packages/cms, packages/housekeeping, packages/config, packages/installer, tests/e2e]
---

# What

An administrator updates a hotel by replacing the binaries and restarting the programs. The database follows through
update files, without being recreated. While updates wait, the hotel is closed and housekeeping shows its update page.
The same page offers the keys a release added to `config.json`.

# Behaviours

## A new database

- A program finds no database, or one with no table: it creates it with every update, seeds included, and nothing
  waits (decision holo-port/0068).
- A new hotel opens: it holds Holo's home store, 20 categories and 298 items, and Holo's ranks as access groups
  (decision holo-port/0068).

## While updates wait

- A guest opens any page of the site: the maintenance page answers with status 503 and the staff sign-in form
  (decision holo-port/0069).
- Staff holding `site.maintenanceBypass` open the site: it stays closed (decision holo-port/0069).
- An administrator signs in on the maintenance page: it offers "Apply them in housekeeping", a link to
  `/housekeeping/updates` (decision reborn/0004).
- Staff who may apply updates open any housekeeping page: they land on the update page (decision holo-port/0069).
- Other staff open housekeeping: it answers with status 503 and says that the hotel is being updated
  (decision holo-port/0069).
- Scheduled tasks are due: they do not run (decision holo-port/0069).

## The update page

- An administrator opens `/housekeeping/updates`: it lists the waiting updates with their number and title, and the
  applied ones with their date (decision reborn/0004).
- A holder of `housekeeping.database` or `housekeeping.accessGroups` applies them: a copy is saved beside the database
  as `<database>.backup-<YYYYMMDD-HHMMSS>`, every waiting update applies in order, a staff log row names them, and the
  hotel opens (decision holo-port/0067).
- Staff without either attribute open the update page: the page is refused.
- An update fails: it leaves no trace, the updates before it stay, and the page names the update, its error and the
  copy's path (decision holo-port/0067).
- Nothing waits and the administrator applies: nothing changes.
- The last update is applied: the site and housekeeping open by themselves (decision holo-port/0069).

## Automatic updates

- The CMS or housekeeping starts with an automatic update waiting: it saves a copy and applies every waiting update up
  to the last automatic one (decision holo-port/0071).
- An automatic update fails at start: the error goes to the log, every page answers with an error page and status
  503, and the next start tries again (decision holo-port/0071).

## config.json

- A release adds a key to `config.json`: the update page lists it with its default, beside the keys nothing reads any
  more (decision reborn/0004).
- The administrator saves `config.json`: it gains the new keys, keeps the others as they are and loses the unused
  ones; the values apply at the next restart (decision reborn/0004).
- A new key gets a bad value: `config.json` stays as it was.
- `config.json` differs from the release: the hotel stays open (decision reborn/0004).

## A hotel installed before updates

- It starts on a new release: every update waits, starting with `0001-baseline.sql`, which changes nothing on it.
- Its administrator applies them: users, habbos and homes stay, and the hotel receives Holo's home store.
