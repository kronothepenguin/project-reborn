---
type: Reference
title: Research: the site at a 16px base
description: How sizes and bitmaps are set in the site today, Holo's reference numbers, and the strategies weighed for a redesign at 16px that keeps Holo's look.
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [research, look-and-feel, cms, components]
---

A read-only study of 2026-11-12, made by a research agent for the [look and feel slice](/slices/look-and-feel.md).
Nothing here is decided: the slice lists the questions the user answers before any task is written.

Recommendation: strategy B, a redesign through theme tokens, built on step 1 of A. First move every size into tokens
with no visible change, then set the tokens to a 16px design with a layout about 4/3 wider (container 1240px). Bitmaps
stay at 1x or go to exactly 2x, never a fractional scale.

# How sizes are set today

- Tailwind 4.3 (`@tailwindcss/vite`), configured in CSS. No `@theme` block, no `tailwind.config`, no custom tokens. Each
  app's `src/styles/global.css` only imports tailwindcss and `@project-reborn/components/styles.css`. So cms,
  housekeeping and installer can each get their own tokens. Named utilities are rem; arbitrary values like `w-[460px]`
  are fixed px. Nothing changes the root font size.
- 11px: `packages/cms/src/layouts/community.astro` sets `min-w-[950px] ... text-[11px]` on its wrapper (18 of 36
  pages); 22 more `text-[11px]` in components. Help Tool `layouts/help-tool.astro` uses `text-[12px]` and a fixed 720px
  table with gif chrome. Signed-out pages (7: landing, register, forgot, reset, two legal pages, logout) use
  `layouts/signed-out.astro` with `text-xs`/`text-sm` inside a fluid `Paper`: the site already mixes sizes.
  Housekeeping: `packages/housekeeping/src/layouts/document.astro` sets `font-[Verdana,...] text-[11px]` on the body,
  layout already fluid. Installer: Tailwind defaults, `max-w-md` card, fluid.
- Fonts: no pixel font, no `@font-face`. The public cms sets no font-family, so it shows the system sans, not Holo's
  Verdana. Only housekeeping uses Verdana.
- Fixed widths in cms (Holo's numbers): container `w-[930px]` (4 uses), header `h-[102px]`; Me columns 460/310/160;
  news and tags columns 210/560; sub-tabs 760; header user area 572. Home canvas `w-[752px]` or `w-[922px]` by
  `h-[1360px]`, items at database coordinates with inline `left/top` px (`components/homes/home-view.astro`,
  `note.astro`, `home-editor.svelte`); widget skin widths in `styles/homes.css` (847 lines).

| Package | Source files | Files with `[Npx]` | Arbitrary px utilities | Raw px in CSS/style | Standard spacing steps |
|---|---|---|---|---|---|
| packages/cms/src | 116 | 61 | 439 (w 118, h 50, text 46, mb 30, pl 29, pb 20, px 19, pt 18, mt 16) | 257, mostly homes.css | 643 |
| packages/housekeeping/src | 42 | 5 | 10 | 0 | 186 |
| packages/installer/src | 9 | 0 | 0 | 0 | 26 |
| packages/components/src | 30 | 4 | 7 | 13 | 36 |

- Text sizes in cms: `text-[11px]` 23, `[10px]` 17, `[9px]` 3; `text-xs` 24, `text-sm` 23. Most common arbitrary
  values: `mb-[7px]` 23, `mt-[5px]` 11, `pb-[3px]` 10, `w-[460px]` and `w-[310px]` 9 each, `w-[160px]` 8, `h-[25px]` 8.
- Files with the most: `homes/home-store-dialog.svelte` 27, `me/personal-info.astro` 26, `groups/group-tools.svelte`
  26, `forum/post.astro` 23, `layouts/help-tool.astro` 22, `layouts/community.astro` 18, `pages/club.astro` 16.
- Other px: 52 width/height attributes on `<img>`, 12 inline styles, 131 `url()` backgrounds in cms.
- A size class in three places: `[size=small]` becomes `text-[10px]` in `packages/cms/internal/bbcode/bbcode.go:135`
  (and tests), `packages/components/src/bbcode.ts:20`, and the selector at `tests/e2e/suites/housekeeping-news.mjs:732`.

# Bitmaps that carry the look

The port already redrew Holo's chrome in CSS (main tabs and sub-tabs `header/main-tabs.astro`, `Paper`, `Card`
headers, `Button`, `Bubble`, dialogs, housekeeping tabs), so it scales freely. What remains as bitmaps:

| Kind | Where | Size | Can it scale? |
|---|---|---|---|
| Logo | `cms/public/habbo.png` | 111x54 | Exact 2x pixelated, or redraw as SVG |
| Community background | `cms/src/assets/community/bg.png` | tile | Tiles at any size |
| Icon sprite sheets | `components/src/assets/button_icons2.png`, `web-gallery/v2/images/myhabbo_icons.png`, `info_icons`, `quickmenu`, `subnavi-arrows` | 16px cells | Keep 1x, or 2x with doubled offsets |
| Home widget skins | `c_images/skins` (39 files, 67 uses) | framed borders | Exact 2x only, else redraw |
| Stickers | `c_images/stickers` (419 GIFs) | at stored px positions | 1x, or the whole canvas at 2x |
| Home backgrounds | `c_images/backgrounds2` (106) | tiles | Any size |
| Achievement badges | `c_images/album1584` (494 GIFs) | about 39x39 | 1x or exact 2x pixelated |
| Group badges | `cms/internal/badge/badge.go` (`Size = 39`) | 39x39 | Could render at 2x on the server |
| Avatars | external imager (`packages/virtual/settings/catalogue.go:52`); `Avatar` sizes `s`, `b` | `b` is 64x110 | habbo.com also serves `size=l` (2x); never stretch by a fraction |
| HTML5 widgets (landing promo, badge editor, look editor) | `public/habbo-widgets/*`, `vendor/HabboWidgets` | canvas 396x377, editor 300x375 | 1x or exact 2x pixelated |
| Help Tool chrome | `public/iot/content3/images/process/*.gif`; popup 980x597 (`components/help/open-help.svelte:13`) | fixed | Redraw in CSS, or 1x |
| Club, top-story, discussion images | `web-gallery/*` | various | 1x or 2x pixelated |
| Game client page | `plans/client` (stage 720x540 or 960x540) | fixed | Out of scope |

# Holo's reference numbers

`source/holocms/web-gallery/v2/styles/style.css`: body 11px Verdana (also form fields); `#container` and `#header`
930px, outer containers add 10px padding each side, `min-width: 930px`; Me columns 460/310/160; news and tags
210/560/160; boxes `.cb` 8px right margin, 7px bottom margin; online counter left 781 width 110; sub-navigation 572.
Font sizes across v2 stylesheets: 11px x23, 10px x20, 12px x10, 14px x7, 18px x6, 9px x5, 16px x5.

| Factor | Body text | Container | Whole page | Fits a 1366 screen? |
|---|---|---|---|---|
| 16/11 = 1.45 | 16px | 1353px | about 1382px | No (about 1349px usable) |
| 1.5 | 16.5px | 1395px | about 1425px | No |
| 4/3 | 14.7px | 1240px | about 1267px | Yes |

A 1920 laptop at Windows' 150% scaling is 1280 CSS px wide; at 125% it is 1536.

# Strategies

- A. Make every size relative, then turn one dial: px to Tailwind steps (`w-[460px]` to `w-115`, `mb-[7px]` to
  `mb-1.75`), font sizes to `@theme` tokens, homes.css through `--spacing`, then scale `--spacing` and text tokens per
  app. Touches about 61 cms files (439 values), 5 housekeeping, 4 components, homes.css, bbcode.go, the e2e selector.
  Wrong: bitmaps keep their size while boxes grow, or blur at fractional scale; homes break (stored px); 1382px page.
  A bigger Holo, not a redesign; but its step 1 is the right first move.
- B. Redesign through tokens at 16px (recommended): A's step 1, then numbers by hand. Text: 11 to 16, 10 to 14, 9 to
  13, 12 to 18, 14 to 20, 18 to 24. Layout about 4/3: container 930 to 1240; columns 460/310/160 to 616/412/212; gaps 8
  to 12. Chrome grows (CSS); borders stay 1-2px. Bitmaps 1x or exactly 2x (avatars `size=l`, group badges at 78px, logo
  pixelated; Help Tool strips redrawn). Homes canvas stays 1x, centred. About 70-80 files plus one `@theme` per app.
  Fits 1280 CSS px and wider.
- C. CSS `zoom`/`transform` wrapper: resamples every bitmap at 1.45x, 1382px wide, drag maths of the home editor and
  canvas widgets need re-testing; same as Ctrl-plus. Only a throwaway preview.

Testing today: no visual-regression tests. `make gates` builds the three frontends, runs gofmt, vet, `go test -race`
per module, the components' Vitest browser tests, svelte-check, sqlc and docs checks. `make e2e` (`tests/e2e`,
Playwright, 31 suites) is functional; some checks depend on layout or classes: `homes.mjs:118-131` (drag positions),
`looks.mjs:129-312`, `credits.mjs:66` (column order), `housekeeping-news.mjs:732` (`text-[10px]`),
`housekeeping-admin.mjs:261` (computed padding). Suggested: Playwright screenshots of every page at 1280 and 1920
before and after each step (`toHaveScreenshot` baselines), a new kind of test the owner must approve.

# Risks

- plan decision 0034 (pages look exactly like Holo): the owner must say the redesign replaces it for sizes only.
- Verdana: the public site does not use it now; Verdana at 16px is noticeably bigger and wider.
- Homes: item coordinates are px in the database.
- Help Tool popup fixed at 980x597 with bitmap chrome.
- Widget skins: content widths fixed at 218px or 290px.
- Shared components reach housekeeping and the installer unless their themes keep old token values.
- BBCode size class in Go, TypeScript, tests and e2e must change together.

# Task breakdown

1. Record the owner's answers as decisions.
2. Add `@theme` tokens at today's values (cms, housekeeping, installer).
3. Move the 7 px values in components to tokens.
4. Move layouts and header to tokens (`community`, `signed-out`, `help-tool`, `components/header/*`).
5. Move cms pages to tokens in batches (me/account, community/news/tags, groups/forum, club/credits, help).
6. Change the BBCode size class in all three places at once.
7. Screenshot sheet of every page at 1280 and 1920, if approved (tests/e2e).
8. Switch the tokens to the 16px design and review every page.
9. Exact 2x bitmaps where agreed (avatar `size` option `l`, badge compositor at 78px, logo and icons, Help Tool chrome).
10. Homes per the owner's answer.
11. Housekeeping and installer, if in scope.

# Questions for the owner (recommended answer first)

1. What gets redesigned? Only the public site first; housekeeping keeps its 11px Verdana for now.
2. Does the redesign replace "looks exactly like Holo" for sizes only? Yes: colours, shapes, borders, tab and box
   styles and behaviour stay Holo's.
3. Which font, and how big? Verdana at 15px for most text and 16px for long reading text; or the system font at 16px;
   or Verdana 16px everywhere.
4. Fixed width or fluid? A fixed 1240px page, centred; or fluid between 1024 and 1240.
5. Exact x1.45 (1353px) or about x1.33 (1240px)? x1.33: fits a 1366 laptop.
6. Avatars and badges normal or double? Normal and sharp; or double only the Me page's big avatar.
7. Home pages? Keep the canvas and widgets at 1x; or 16px text inside widgets.
8. Help Tool popup? Grow to about 1100x700 and redraw its header strips in CSS.
9. May the e2e suite get screenshot baselines? Yes, at 1280 and 1920.
10. Order of work? Tokens first with no visible change, then switch the sizes.
