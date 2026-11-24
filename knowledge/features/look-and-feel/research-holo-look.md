---
type: Reference
title: Research: where the site's look differs from HoloCMS
description: HoloCMS and the site run side by side and measured: the font family that makes the navbar look plain, the tabs, the sub-navigation, the boxes, the title bars, the header and the footer, with Holo's values, ours and the file to change.
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [research, look-and-feel, cms, components]
---

A study of 2026-11-12, made by a research agent for the [look and feel feature](/features/look-and-feel/spec.md): both
systems ran, were photographed at 1366x768 and 1920x1080, and were measured in Chromium. Nothing here is decided.

# In short

- The navbar looks "plain, not bold" because of the font, not the font's weight. Holo's own CSS makes unselected tabs
  `font-weight: normal` and the selected one bold, and wraps Housekeeping in `<b>`
  (`source/holocms-1.3.1/web-gallery/v2/styles/style.css:362`, `:383`); ours does the same.
- Holo sets `Verdana, Arial, Helvetica, sans-serif` on `body`. The public site sets no font, so Tailwind's default
  stack applies: Roboto here, Segoe UI on Windows, San Francisco on macOS, all narrower and lighter than Verdana. With
  Holo's stack injected into `/me`, the tabs look as heavy as Holo's.
- The second difference anyone sees is the tabs' artwork: Holo draws two-tone tabs from an image, with dark outlines
  and pixel corners, the selected one opening into the sub-navigation; ours are flat, with a black 2px border, an 8px
  radius and a black line under the selected tab.

# How each system was run

The files are in the session's scratch folder, which does not outlive the session; the steps are here so that it can
be done again.

- HoloCMS: a copy of `source/holocms-1.3.1`, since `install.php` writes `config.php`; `source/holoemu/Resources/holodb.sql`
  loaded by MariaDB's init folder; a compose stack of three containers: MariaDB with `--sql-mode=` and latin1, PHP
  5.6 fpm with the mysql, mysqli and gd extensions, and nginx on `127.0.0.1:18911`. PHP 5.6 no longer has
  `session_is_registered()`, which `core.php:143` calls, so a one-function shim defines it through
  `auto_prepend_file`; no file of HoloCMS was edited. The installer was driven with curl: step 1 with the database,
  step 2, step 3 with the administrator; then `install.php` was moved away, since `core.php` refuses to run beside it.
  Housekeeping is a separate login at `/housekeeping/`.
- The site: the three frontends built; `cms`, `housekeeping` and `installer` built from `apps/`; the installer posted
  to as `tests/e2e/lib/hotel.mjs` does (`/config`, `/site`, `/admin`); one news article inserted to match Holo's
  first; the CMS on 18921 and housekeeping on 18922.
- Screenshots and measures: Playwright 1.64 of `tests/e2e/node_modules`, each page at both sizes, viewport and full
  page; computed fonts, colours and boxes read from the page; the fonts Chromium really used.
- Pages: the signed-out front page, `/me`, a news article, credits, club, community, a home, account settings, and
  housekeeping's dashboard.

# Differences, by priority

Measured at 1366 wide unless the CSS is named. "style.css" is `source/holocms-1.3.1/web-gallery/v2/styles/style.css`.

## 1. The font family of the whole community layout

- Holo: `body { font-size: 11px; font-family: Verdana, Arial, Helvetica, sans-serif }` (style.css:1-5), the same on
  inputs, textareas and selects (style.css:11-14).
- Ours: no font-family in `packages/cms/src` or `packages/components/src`; the built CSS uses Tailwind's default
  `--font-sans`.
- It could go on the root of `packages/cms/src/layouts/community.astro:30`, or as a `--font-sans` theme value in
  `packages/cms/src/styles/global.css:1-3`, which would also cover the signed-out layout and every shared component.
- Holo gets Verdana only where the viewer has it installed, as Windows and macOS do.

## 2. Line height

- Holo: `line-height: normal`, about 13.4px for 11px Verdana. `#navi2` uses 18px (style.css:693) and `h2.title` 17px
  (style.css:56).
- Ours: `text-[11px]` brings 16.5px, and `text-xs` 16px. Tailwind's `leading-normal` is 1.5; `leading-[normal]` would
  match.

## 3. The main tabs

Holo (style.css:342-417): `#navi { font-size: 12px }`; a tab is 28px tall with a 5px gap; `padding: 6px 16px 0 22px`;
drawn from `tabs.png`; white text of normal weight; the selected tab black and bold; a hover state; a green tab for
Housekeeping and "Register now!".

| Tab | Outline | Upper half | Lower half | Bottom |
| --- | --- | --- | --- | --- |
| Normal | 2px #134787 | 12px #408fcc | 12px #2373b2 | 2px #000 |
| Hover | 2px #134787 | 12px #50afe6 | 12px #2c8fd2 | 2px #000 |
| Green | 2px #276604 | 12px #49cf04 | 12px #38aa00 | 2px #000 |
| Green hover | 2px #276604 | 12px #5cff06 | 12px #49cf04 | 2px #000 |
| Selected | 2px #000 | white | white | none |

- The selected tab has no bottom line and opens into the white sub-navigation. Corners are steps of 2 to 3 pixels.
- Ours, `packages/cms/src/components/header/main-tabs.astro:10-17`: `border-2 border-b-0 border-black rounded-t-lg
  px-5 pt-1 pb-1.5 text-xs`; flat `bg-sky-700` and `bg-lime-600`; a black outline on every tab; no hover; a 4px gap.
  The text's padding and the 28px height already match.
- The black line under the selected tab is the `border-t-2 border-black` of
  `packages/cms/src/components/header/sub-tab-list.astro:9`.
- Holo's header strip is 104px, ours `h-[102px]` (`community.astro:34`).
- `tabs.png` is not among our assets: copying it or redrawing the look is a choice for the user.

## 4. The sub-navigation

- Holo (style.css:685-738): 12px text on an 18px line; a 1px rgba(0,0,0,.2) border on each side; 6px of white and a 3px
  shadow below; items separated by `1.3em` on each side of a 1px #e8e8e8 line; the selected item bold and black;
  links #134787, underlined on hover. The bar runs from y=104 to 137.
- Ours (`community.astro:72-76`, `sub-tab-list.astro:9-29`): `w-[760px] rounded-b border-b-2 border-black/20`; items
  with `pr-5 pl-5` and `border-l border-gray-200`; links `text-blue-900`, no underline on hover. The bar runs from 102
  to 134, has no side borders, a 2px shadow, and the content starts 3px higher.

## 5. The tabs inside boxes

- Holo (style.css:792-1000): the row 25px tall with a 1px line in #528dc9, #3ba800 or #ff9900; tabs to the right with
  a 4px gap; the unselected tab filled with the colour and white text; the selected one white with a coloured outline
  and black bold text.
- Ours: `packages/components/src/components/tab.svelte:30`: both tabs white with a black outline and normal weight;
  the row of `packages/cms/src/components/me/groups-habblet.svelte:90` uses `border-cyan-600`.

## 6. The box's frame and padding

- Holo: a 1px #b5b5af border with a 3px bottom, corners of about 4px in steps. A box with tabs has no inset; a box with
  a coloured title insets the title by 4px and its content by `8px 15px` (style.css:212-219).
- Ours: `packages/components/src/components/paper.svelte:37`, `rounded-lg border border-b-[3px] border-black/20`: the
  white background shows through the translucent border, so the edge is #cccccc (`bg-clip-padding` would fix it), and
  the radius is 8px. `card.svelte:65` and `:75` inset all content by 12px.

## 7. The coloured title bars

- Holo (style.css:50-57, 104-202): bold 14px on a 17px line, `padding: 4px 10px`, white, centred.
- Ours (`packages/components/src/components/card.svelte:36-53`, `:67-71`): `rounded p-1 text-center font-bold` with no
  size, so 11px.

| Bar | Holo | Ours, as rendered |
| --- | --- | --- |
| blue | #2767a7 | `sky-700` #0069a8 |
| activehomes | #51a5d5 | `sky-500` #00a6f4 |
| green | #4ab501 | `lime-600` #5ea500 |
| red, hcred | #d64242 | `orange-700` #ca3500, another hue |
| darkred | #c73c3c | `orange-700` |
| brown | #a67a3e | `yellow-700` |
| lightbrown | #cf9c44 | `yellow-600` |
| settings | #595959 | `mist-600` |
| loginbox | #6b6b6b | `neutral-500` |
| rooms | #225e6a | `cyan-800` |
| orange | #f66200 | `orange-500` |
| promogray | #9c350f | `orange-800` |

## 8. The header

- Logo: Holo shows a 111x42 box of the 111x54 `habbo.png`, so the tagline is cut off, at x=218; ours shows the whole
  image, 12px taller, 10px further right (`community.astro:35-36`).
- Header colour: Holo #bce0ee (style.css:270); ours `bg-sky-200`, #b8e6fe (`community.astro:33`).
- The top bar: Holo has My Friends, My Groups and My Rooms, bold 11px #888; ours only My Groups
  (`header/my-groups.svelte`).
- Help and Sign Out: 10px in Holo, 11px in ours (`header/user-menu.astro`).
- Search: Holo's input is 171x27 with the browser's inset border, its right edge at x=980; ours 176x27 with a 1px
  border, its right edge at 968 (`header/habbo-search.astro:5-14`).
- The users-online box: 110px wide and two lines in Holo; one line in ours (`community.astro:61-63`).

## 9. The footer

- Holo: both lines 9px #777, links black. Ours (`community.astro:84-97`): the link row is 11px, the small line
  `text-neutral-500`.

## 10. The me page

- "Create/buy a Group" is right-aligned in Holo and left-aligned in ours
  (`packages/cms/src/components/me/groups-habblet.svelte:85`).
- The tags row: Holo puts the question, the input, then "Add tag"; ours puts "Add tag" first.
- Buttons: bold 11px in Holo, bold 12px in ours (`packages/components/src/components/button.svelte`).
- Holo has a "Reccomended Rooms" box in the second column; ours has none, which waits for
  [presence and rooms](/features/presence-and-rooms/spec.md).

## 11. Other pages

- News, credits, club and account have the same structure; their differences come from 1, 2, 6 and 7.
- The signed-out front page is another layout: ours puts the box at y≈78 against Holo's ≈12, and a blue "Join now"
  panel where Holo has a photo and a green button. Not measured piece by piece.
- Housekeeping is a wholly different design: Holo's is a blue-grey admin theme with tabs and icons.

# Holo's numbers

- Container: `#container`, `#header` and `#navi2-container` are 930px, centred (style.css:312-317), with 10px side
  padding around them.
- Columns (style.css:235-260): home and me 460 / 310 / 160; news and tags 210 / 560 / 160; each box
  `margin: 0 8px 7px 0`. On `/me` the columns start at x=218, 678 and 988.
- Base: 11px Verdana, line height normal, text #000, links #fc6204; the page #e3e3db over `bg.png`.
- Headings: box title bars bold 14px on 17px; headings beside inner tabs bold 14px; the front page's news headline bold
  18px; an article's title bold 16px #ff6600; sidebar headings bold 11px.
- Heights: the header strip 104px (16 above the logo, 42 of logo, 18 below, then the tabs); tabs 28px with 12px text;
  the sub-navigation 33px and 761px wide.
- The top bar is at left 190, 572px wide, 28px tall; the users-online box at left 781, top 15, 110px wide.
- Footer text 9px #777.

# Not verified

- Verdana is not installed on the machine that ran this, so Holo rendered in Noto Sans. With Verdana its text is
  heavier still, and its line height about 13.4px.
- Holo's home page rendered without its styles and avatar images, so homes were not compared.
- Images on images.habbohotel.co.uk are offline in both systems.
- Hover states are taken from the CSS, not photographed.
- The hotel's status area differs only because no game server ran.
