---
type: Decision
title: Housekeeping applies the updates and config.json's new keys
description: Holders of housekeeping.database or housekeeping.accessGroups apply waiting updates and a release's new config.json keys from housekeeping, and the installer only installs and links to the hotel.
status: accepted
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
tags: [housekeeping, installer, config, updates]
---

# Decision

- Housekeeping has an update page. It lists the waiting updates and the applied ones, saves a copy of the database, and
  applies the waiting updates with a staff log row.
- Holders of a new attribute, `housekeeping.database`, may apply updates, and so may holders of
  `housekeeping.accessGroups`, who can give themselves any attribute. New hotels give `housekeeping.database` to the
  Administrator group, and existing hotels get it from an update that grants it to the holders of
  `housekeeping.accessGroups`.
- The same page lists the keys a release added to config.json, with their defaults, and the keys nothing reads any more,
  and rewrites config.json once confirmed. Only the new keys can be edited there, and a difference in config.json never
  closes the hotel.
- The installer only installs. It refuses to run once an administrator exists, as before, and never applies updates. Its
  done page and its "already installed" page link to the hotel at `site.url`.

# Context

The user first asked for the installer to detect and apply updates, and for "a link in the installer to the cms, so
after creating the admin user and everything is done, the admin can go to the index of the cms to do a login." Asked
about config.json, the user answered: "i like the idea of enabling the installer anytime, but that should be an admin
descision and should be blocked and secured because the installer is a vector of attack, a malicius moderator or someone
with smaller rank would try to enable the installer to set them as the administrator. i think anyway it is possible to
update config.json from the housekeeping. [...] i think we should go with show up maintenance only during updates and
from the housekeeping update everything including the config.json".

The user chose "New attribute" for the permission. Told that no hotel holds the new attribute yet, so nobody could apply
the update that grants it, the user chose "Database or admins". At least one user always holds
`housekeeping.accessGroups` ([0053](/decisions/0053-attributes-on-groups-and-users.md)), so a hotel always has someone who
can apply its updates.

# Consequences

- Housekeeping writes config.json, and [How the programs work together](/reference/architecture.md) changes with it.
- Opening the installer again on an installed hotel waits in `plans/later.md`
  ([0072](/decisions/0072-later-work-in-plans-later.md)).
