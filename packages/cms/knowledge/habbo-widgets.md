---
type: Reference
title: HabboWidgets
description: The HTML5 ports of Holo's Flash widgets, built from the vendored HabboWidgets submodule into public/habbo-widgets.
---

# Builds

`vendor/HabboWidgets` is a git submodule. Each widget is built there and its output is committed under
`packages/cms/public/habbo-widgets/`.

| Widget | Built from | Into | Used by |
| --- | --- | --- | --- |
| Landing promo | `vendor/HabboWidgets/habbos_v2_landing` | `public/habbo-widgets/landing/` | `landing/promo-widget` |
| Badge editor | `vendor/HabboWidgets/badge-editor/badge-editor` (`npm ci && npm run build`) | `public/habbo-widgets/badge-editor/`: `badge-editor.js`, `data/` and `sprites/`, without the zip | `groups/badge-editor` |

- The landing promo reads `GET /xml/promo-habbos.xml`, and its button sends `gender` and `figure` to `/register`.
- The badge editor draws itself into `#editor-container` when its script first runs. Its script runs once a page,
  when the dialog first opens, and a save reloads the page.
- The submodule stays empty in a new worktree, so a build there reads the main checkout's copy.
