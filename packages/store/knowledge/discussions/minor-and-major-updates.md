---
type: Discussion
title: Minor and major updates
description: Whether a hotel could keep running while some database updates wait, kept for a later discussion; today every waiting update closes the hotel.
tags: [store, updates]
timestamp: 2026-11-03T21:02:31+00:00
---

# Status

Nothing is planned from this page. Every waiting update closes the hotel, as decision 0069 of the port says
(`plans/holo-port/decisions/0069-waiting-updates-close-the-hotel.md`). The page keeps the discussion for when it comes
back.

# The question

Could the CMS and housekeeping keep running while some updates wait (minor updates), and close the hotel only for the
updates their code cannot do without (major updates)?

# What the user said

- "i want to know if there is a way to detect if an update is minor or major, as example, minor update allows the
  cms+housekeeping to run normally without breaking user experience, but a major update will break user experience and
  the db update is a must. for major updates i expect to show up the maintenance until admin updates the db."
- "it's not that simple. we can create a new table for something does not affect the user expirience at all, as example,
  suppose we add chat to the forum, it will require a new table, but user can just open forum and it should work because
  the forum code was not modified, only a new chat component was added, the chat would looks like it's broken but the
  forum still working. should something like chat feature make the hotel to go maintenance? my thinking is no, we should
  not close hotel because of a new feature that does not break up things. but in the other hand, if we add a system to
  housekeeping to manage the access roles and attributes, we should block the hotel and allow only the admin to update
  the system, because this can be a security hole..."

# Ideas raised

- **The program checks the database.** A binary carries the schema files, so a program can compare them with the
  database when it starts and find a missing table, column or unique index. It cannot see data: an update that rewrites
  old values into a new format changes no column.
- **The author marks the update.** Whoever writes an update says whether the code needs it. A wrong mark lets the hotel
  run on a database its code cannot use.
- **By feature, not by update.** In the user's forum chat example, the feature whose table is missing breaks alone while
  the rest of the hotel runs. The question becomes which pages need an update, not whether the hotel does.
- **Security closes the hotel.** An update to access groups and attributes closes the hotel until an administrator applies
  it, because running the old rules could open a security hole.
- **Elsewhere.** GitLab separates migrations that must run before new code serves from post-deployment migrations that
  run after it. WordPress keeps its public pages running after an update and blocks its admin pages until the database
  is updated.
