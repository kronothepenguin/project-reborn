---
type: Go Package
title: assets
description: The shared module for the hotel's assets, with its parts; the assets folder sits beside config.json, named by assets.path.
resource: packages/assets
---

# What it is

`packages/assets` holds everything about the hotel's assets. The assets are files in the assets folder, which
`config.json` names in `assets.path` (`assets` by default, beside `config.json`). Git ignores `/assets/`: Habbo's files
never enter the repository (decision reborn/0011).

# Parts

| Package | Holds |
| --- | --- |
| `packages/assets/dcr` | The client's external variables and texts: their import into the database and the files written for the client ([dcr](/dcr.md)) |

Planned with the assets feature: `packages/assets/astro` (today's `packages/astro`, moved) and
`packages/assets/download`, the downloader with checksums.

# The folder

| Path | Holds |
| --- | --- |
| `<assets.path>/dcr/` | The client's folder: the `.dcr`, the casts, the furni, the XMLs, `external_variables.txt` and `external_texts.txt`; the CMS serves it at `/dcr/` |
| `<assets.path>/c_images/` | The image libraries, served at `/c_images/` |
