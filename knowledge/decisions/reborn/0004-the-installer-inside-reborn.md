---
type: Decision
title: Inside reborn the installer lives under /installer/, moves the hotel to the address it is given, and goes once installed
description: reborn serves the installer under /installer/ until an administrator exists, asks one host and port for the whole site and moves its listener to them at once, and answers 404 under /installer/ once installed; run alone the installer keeps today's form; the done page goes.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [platform, installer, orchestrator]
---

# Decision

- reborn checks at start whether the hotel is installed: `config.json` exists and someone holds
  `housekeeping.accessGroups`.
- Not installed: reborn listens on the defaults of the `reborn` section without writing `config.json`, mounts the
  installer under `/installer/`, and redirects every other path to `/installer/`.
- Inside reborn, the installer's config step shows one host and port, with reborn's defaults, for the whole site:
  housekeeping lives at `<site address>/housekeeping`, so the form asks no housekeeping port and no housekeeping
  address. When the host or the port changes, reborn opens a new HTTP server on the new address, redirects the browser
  there and closes the old server right after the redirect.
- The installer declares that behaviour as an interface, `installer.Listener`, and takes it as an option,
  `installer.WithListener`. reborn implements it: open the new server, redirect, close the old one. Without the option,
  run by its own runner on its own port, the installer keeps today's form: the site's port, housekeeping's port and the
  housekeeping address.
- The done page goes. After "Create administrator" the installer redirects to `/`: inside reborn the site's front page;
  run alone, the installer's "already installed" page.
- Installed at start: `/installer/` is not mounted. Installed while reborn runs: `/installer/` answers 404 from then on.
  reborn logs where `config.json` and the database are.
- The installer runs only when nothing is installed. Reopening it on an installed hotel stays a later, secured feature
  (`knowledge/features/installer/later.md`).

# Context

The user: "detect installation, if installation is done the /installer is not mounted and / does not redirect. if
installation is pending, then /installer is mounted and / redirects to /installer/. if mount and unmount is not easy or
possible, you can always create a middleware and just serving 404 if installation is done."

On the address: "i want to show up the port page, if port is modified then the installer starts the new http server in
the new port and redirects the user there. what i expect of the installer is dynamic and show live interaction. we might
need to refactor the installer. [...] installer does not show different configuration for cms and housekeeping site
settings, because it's expected to be the same site - once finish, installer redirects to / - after installation,
/installer/ answers 404 always". Asked when the old port closes, the user chose "Right after the redirect".

On the interface: "not a service, some interface in packages/installer. it can be an option as you said. reborn
implements the interface and do exactly this: 1. open new http server in the new host:port 2. redirect connection to the
new host:port 3. close old http server". The proposed name `Mover` became `Listener`.

On the done page: "if it's merely a "all ok" page without any modification, we can just get rid of it and redirect to
root when the installation is done and make /installer/ 404." On running alone: "installer has two runners now, reborn
and standalone. [...] for the standalone it will have its own port different to the reborn's port." Asked whether run
alone it keeps the form for separate programs, the user chose "Yes, one form per runner".

# Consequences

- Supersedes `knowledge/decisions/holo-port/0052-installer-has-no-modes.md`: the option reborn passes decides which form
  shows. The rest of 0052 stands: the fields stay editable, and run alone they default to the development ports.
- Supersedes the done page of `knowledge/decisions/holo-port/0070-housekeeping-applies-updates.md`. The rest of 0070
  stands: housekeeping applies the updates and config.json's new keys, and the installer only installs, refuses to run
  once an administrator exists, never applies updates, and its "already installed" page links to the hotel at
  `site.url`.
- The installer's pages are built for `/installer/` (Astro's `base`), its links, forms and redirects carry the prefix,
  and its `Mount` protects its own routes against cross-origin requests, as the CMS's does. Its own runners serve
  `:17306/installer/` and send `/` there: a change to the user's files, shown and asked.
- The browser suites' harness and their installer and "together" suites follow the prefix.
