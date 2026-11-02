---
type: Reference
title: The home art
description: What art the repository holds under packages/cms/public/c_images, where it came from, and what is still missing.
timestamp: 2026-11-02T02:58:24+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:58:24+00:00"}
tags: [art, homes]
---

# What is here

[0061](/decisions/0061-art-in-the-repository.md) keeps the art in the repository, and the CMS binary embeds it.

| Folder under `packages/cms/public/c_images/` | Files | Holo's names | Came from |
| --- | --- | --- | --- |
| `stickers/` | 419 of 425 | The `s_` rules of `assets.css` | `https://images.habbo.com/c_images/stickers/` |
| `backgrounds2/` | 106 of 111 | The `b_` rules of `assets.css` | 101 from `https://images.habbo.com/c_images/backgrounds2/`, 5 from `git-MiguelGonzalezAravena_HoloCMS.zip` on h4bbo.net |
| `album1584/` | 494 | User badges by code, such as `ADM.gif` | `Misc/banksy_pack.zip` on h4bbo.net |
| `skins/` | 45 of 45 | `skins.css`, with `girl/` as in Holo | 33 from `source/holo`, 12 from `git-MiguelGonzalezAravena_HoloCMS.zip` |

It is 1064 files and 7 MB. Every file was checked to be a GIF, PNG or JPEG.

# What is missing

Five files exist nowhere that was searched: the live CDN, the Wayback Machine, or the three archives:

- stickers: `Evil_easterbunny.gif`, `greenpeace.gif`, `hw_edito_logo.gif`, `zombiehand.gif`;
- backgrounds: `xmas_box_darkred.gif`.

Six names are broken in Holo's own `assets.css`, with no file extension, so they point at nothing: `TEST4`, `TEST5`, `TEST6`,
`anti_eco`, `pro_eco` and `xmas_gifts_bg`.

[P3](/phases/p3-homes.md) leaves these out of the home store.

# Other art

- The three stickers of `upload.meth0d.org` in `assets.css` are HoloCMS's own promotion, and their host is gone.
- The widget previews and the note images are in `source/holo/web-gallery/images/myhabbo/`, for P3 to take.
- Group badge parts are in `source/holo/habbo-imaging/`, for P5.
