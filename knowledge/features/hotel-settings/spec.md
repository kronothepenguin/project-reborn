---
type: Spec
title: Hotel settings
description: Staff change the hotel's settings in housekeeping's forms, close the site for maintenance, and read the dashboard with its shared note.
status: done
projects: [packages/virtual, packages/housekeeping, packages/cms, packages/server]
---

# What

Housekeeping is the single writer of the hotel's settings. Staff with `housekeeping.settings` edit them in one form per
section, Recycler Options among them, and close or open the site. A running CMS or game server reads a change within
`cms.refresh` seconds. Every staff member opens the dashboard, with the hotel's counts and a note they share.

# Behaviours

## Settings forms

- Staff with `housekeeping.settings` open Settings: the first form shows, and the menu lists General Configuration,
  Turn your site on/off, Sign-in and Sessions, Registration, Referrals, Mail, Avatar Imaging, Homes, Groups, Club, Help,
  Game and Recycler Options, then the content forms Manage Site Content, Staff Module, Credits Page and Discussion Board
  Module.
- Staff without `housekeeping.settings` open Settings: Holo's Access Denied page.
- Staff save a form with valid values: every field is saved, the page reloads with "Settings saved successfully.", and
  one staff log row lists the keys that changed.
- Staff save a form with one bad value: nothing is saved, and the form comes back with Holo's refusal and what was
  typed.
- A form saves the keys of its own section only.
- Staff save an address setting: an ad takes nothing or an absolute http or https URL, the housekeeping address a path
  or such a URL, and the imager a URL with a path and no query; anything else is refused.
- Staff set a value back to its default: its row goes, and the default applies.
- Staff save a form unchanged: nothing is written.
- Staff open the Mail form: the password field is blank. A blank password keeps the current one, and a checkbox clears
  it.
- Mail has a host and a from address: mails go through that server, signed in with `mail.username` when it is set.
- Mail has no host or no from address: no mail goes out.
- The mail server does not answer: the mail is given up.
- Staff raise or lower both password limits in one save: both are saved.
- A setting without a label of its own: it gets a form field, with its key as its label.
- Staff open any settings form: it offers the settings, without the startup keys of `config.json` or the hidden
  settings.
- Staff open the Game form: it holds the ten session parameters of the game client and the game server's numbers
  (decision server/0034).
- Staff open Recycler Options: it holds the recycler's four settings, saved and logged like the other forms (decision
  server/0119).
- A post from another site: it is refused, and nothing changes.
- Staff write a BBCode box in the settings: the editor shows it as the site will; without JavaScript it is a plain
  field.

## Maintenance

- Staff choose Site Closed in Turn your site on/off: a running CMS answers every page with 503 and the maintenance
  page within `cms.refresh` seconds, with no restart.
- The site is closed: its files, such as pictures and styles, still load.
- Staff choose Site Open: the row goes, and the running CMS opens again.
- A guest opens the closed site: Frank's maintenance page, with a sign-in form.
- A holder of `site.maintenanceBypass` signs in on it: they use the site, with "The site is currently turned off!"
  above and below the page.

## Reaching the programs

- Housekeeping and a CMS share one mux: a change applies at once.
- A CMS or a game server runs alone: it reads the settings again every `cms.refresh` seconds, 1 by default.
- Staff change `cms.refresh`: the new value applies when the program restarts.
- Staff save a setting and the program restarts: the change stays.
- A hotel without setting rows: every setting holds its default.
- A stored setting holds a bad value, a key nothing declares, or a `config.json` key: it is ignored, the default or the
  config value applies, and the log names it once per reason.
- Stored settings break a rule together: those rows go back to their defaults, and the log names them.

## The dashboard

- Staff open the dashboard: it counts habbos, groups, active bans, staff log rows, rooms with the public rooms among
  them, and furni.
- The dashboard lists up to 20 holders of `housekeeping.accessGroups` by their display habbo, with their emails for
  holders of `housekeeping.usersPrivate`.
- Any staff member saves the note: everyone reads it on the dashboard, and the staff log records it. An empty note
  deletes its row.
