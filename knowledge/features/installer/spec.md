---
type: Spec
title: "Installer: a first article, optional content and more settings"
description: The installer sets up a new hotel in three steps, and gains a first news article, a choice of seeded content, a catalogue review and more of the hotel's settings.
status: planned
projects: [packages/installer, apps/installer, packages/store, packages/cms, packages/housekeeping, packages/virtual, tests/e2e]
---

# What

The installer sets up a new hotel in three steps: `config.json` with the database, the site's settings, and the first
administrator. A new hotel starts with Holo's ranks as access groups. Once installed, the installer links to the hotel
and changes nothing more.

Next:

The installer does what a hotel of today's size needs.

The user: "after installation i would like to have a news article, because the news card feels empty today."

The user: "i would like to enhance the installer now that we have complex rules. as example, i would be cool to allow
the admin during the installation to seed or not to seed optional stuff like the furnis, and allow them to edit (using
pagination, filters and sorting) the catalogue or furnis during installation as an optional step before writing to the
database. admin can skip or modify as they want. as well as some settings during installation, currenlty we have hotel
name and site only, but would be cool to allow the admin to show up other settings and modify them during the
installation."

# Behaviours

## The config step

- An administrator opens the installer in an empty folder: the status page explains the steps and starts the config
  step.
- The config step gets a database path, a hotel port and a housekeeping port: the database is created with every update,
  `config.json` is written, and the site step follows (decision holo-port/0068).
- A port is not a number or is out of range: the form is refused with its message.
- The database path cannot be opened: the form is refused and no `config.json` is written.
- `/site` or `/admin` is opened before the config step: the browser goes to `/config`.
- The installer restarts halfway: it continues from the `config.json` it wrote.

## The site step

- The site step opens: it offers the Housekeeping Address on the housekeeping port chosen a step before
  (decision reborn/0004).
- The site step gets a name, a short name, the site URL, the Housekeeping Address, start credits and secure cookies:
  each is saved, and the administrator step follows (decision holo-port/0026).
- A value breaks a setting's rule, such as a bad address: the form is refused and names the field.

## The administrator step

- The administrator step gets a habbo name, an email, a birth date and a password twice: the administrator's habbo has
  Holo's figure, gender `M` and 5000 credits, and the hotel is installed (decision holo-port/0026).
- A habbo name has a space or more than 24 characters: the form is refused with "Habbo names are 1 to 24 letters,
  digits or - = ? ! @ : . ," (decision holo-port/0026).
- The two passwords differ: the form is refused.
- A new hotel is installed: Administrator, Moderator, Gold Hobba, Silver Hobba and HabboX are access groups at levels 7
  to 3, and the administrator is in Administrator (decision holo-port/0054).
- The site created the database first and habbos registered: the installer changes the defaults and creates the
  administrator beside them (decision holo-port/0068).

## Installed

- The administrator is created: the done page shows where `config.json` and the database are, and "Go to the hotel"
  leads to `site.url`, where the administrator signs in.
- An installed hotel opens the installer: the status page says it is installed and links to `site.url`, and every
  step leads back to it (decision reborn/0004).
- A page on another site posts a form to the installer: it is refused with status 403.

# Open questions

- The twelve questions of [the study](/features/installer/research-installer.md#questions-for-the-user): where choices
  wait until "Install", what "not seeded" means, which content is optional, what a later release does for content that
  was skipped, what can be edited, during the installation or after it, a database the site already created, who writes
  the article, banners, which settings, where their labels live, the game server's ports.
