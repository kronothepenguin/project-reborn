---
type: Spec
title: "Installer: a first article, optional content and more settings"
description: A new hotel starts with a first news article, and its administrator chooses which content is seeded, reviews the catalogue and sets more of the hotel's settings while installing.
status: planned
projects: [packages/installer, packages/store, packages/cms, packages/housekeeping, packages/virtual]
---

# What

The installer does what a hotel of today's size needs.

The user: "after installation i would like to have a news article, because the news card feels empty today."

The user: "i would like to enhance the installer now that we have complex rules. as example, i would be cool to allow
the admin during the installation to seed or not to seed optional stuff like the furnis, and allow them to edit (using
pagination, filters and sorting) the catalogue or furnis during installation as an optional step before writing to the
database. admin can skip or modify as they want. as well as some settings during installation, currenlty we have hotel
name and site only, but would be cool to allow the admin to show up other settings and modify them during the
installation."

# Behaviours

Written with the user when the feature is planned.

# Open questions

- The twelve questions of [the study](/features/installer/research-installer.md#questions-for-the-user): where choices
  wait until "Install", what "not seeded" means, which content is optional, what a later release does for content that
  was skipped, what can be edited, during the installation or after it, a database the site already created, who writes
  the article, banners, which settings, where their labels live, the game server's ports.
