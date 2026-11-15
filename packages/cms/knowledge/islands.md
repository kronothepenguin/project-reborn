---
type: Reference
title: Islands
description: How the Svelte islands of the CMS read the values Go writes into the page, and the islands that need care.
---

# Reading Go values

- Islands get no `[[ ]]` values, so the page keeps the values in inputs and elements that Go fills in.
- `habbo/avatar-editor` reads the hidden `figure`, `gender` and `editorState` inputs on start and writes every change
  back, which is how the look reaches the backend.
- Values that may hold quotes, such as a group's description, reach the island through a hidden element's `data-`
  attributes.

# Islands on every page

- `header/my-groups` is the header's `My Groups`. Like every island that stands on every page, it sits outside the
  layout's `[[ if .SignedIn ]]` and hides itself from guests, so that Astro's island script is never left out of a
  page.
- The first island of a page carries Astro's script for every island of it. `groups/group-tools` stands on every
  group page and shows itself only to the owner's active habbo for the same reason.
- `islands_test.go` checks that every built page with several islands wakes them for everyone.

# Homes

- `homes/home-editor` edits a habbo's home at `/home/{name}/edit` and a group's at `/groups/{id}/edit`. It reads the
  element named by `config`: `data-home`, `data-view` (where Cancel and Save go), `data-group`, the skins in its
  `<select>`, and `data-widgets`, the widgets the Widgets tab offers.
- For each widget the element holds `<template id="widget-NAME-template">`, the widget as the page draws it, which the
  editor copies when the widget is placed.
- `homes/group-info-boxes` listens on the playground for clicks on the groups of any MY GROUPS widget, the ones the
  editor places included, and mounts `homes/group-info-box` in the widget.

# Several dialogs on a page

- The header's purchase dialog shares a page with the Me page's, and the group settings dialog with the header's. Each
  takes its ids from `$props.id()`.
