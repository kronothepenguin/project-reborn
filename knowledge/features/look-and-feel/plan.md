---
type: Plan
title: "Look and feel: Holo's look at today's sizes: how"
description: The CMS, housekeeping and components hold the layouts, and the site's sizes move into theme tokens, then to a 16px design, after the differences from HoloCMS.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/components` | The primitives every app shares, at Holo's sizes: `Button`, `Card`, `Paper`, `Tabs color` with `TabList` and `Tab` and the line under a box's tabs at the box's full width, `Stepper` and `Step`, `Table`, the inputs |
| `packages/cms` | Both layouts as Holo's: the 930px page, the header, the two-tone main tabs, the sub-navigation, the habbo search on one line, the footer, in Holo's font; the front, community and Me pages matched beside Holo's; news, staff, tags, credits, club, the account pages, help, register, forgot, reset and the client's pages set beside Holo's; the board, a thread, a home and a group's page, in view and in edit, set beside Holo's; the board and a thread in a box of the sub-navigation's 761px, under the layout's own sub-navigation |
| `packages/housekeeping` | `layouts/housekeeping.astro`: the grey bar, the tabs, the left column of `box` components and the content; `Box color="gold"` for data lists; at Holo's sizes, the body `text-xs` |
| `packages/installer` | `layouts/setup.astro`: one `Card color="blue"` per step, on one column whose first row is the shared `Stepper`; the sticky row of buttons; the settings step's collapsible sections; the body `text-xs` on a 574px column |
| `packages/store` | `CountAvatars`, the header's registered count |
| `tests/e2e` | The `layout` and `sizes` suites check Holo's page and sizes on every page; `myhabbo` checks the board's box under the sub-navigation's edges, its forms inside it, and the homes' box, canvas and widgets; `installer-layout` checks the installer |

Planned:

| Project | Part |
| --- | --- |
| `packages/cms` | The forum, the homes and the groups matched beside Holo's, as the first three |

## The sizes

The site is Holo's, at Holo's own sizes, in Tailwind's closest common classes.

| Holo | Ours |
| --- | --- |
| 9px to 12px text | `text-xs` |
| 14px text | `text-sm` |
| 16px, 18px text | `text-base`, `text-lg` |
| 3px to 5px | `1` (4px) or `1.5` (6px) |
| 7px, 8px | `2` |
| 10px | `2.5` |
| 15px | `4` |
| The page's grid: 930, 460 / 310 / 160, 404 / 310, 758, 761 | Holo's pixels |

- The font is Holo's, `Verdana, Arial, Helvetica, sans-serif`, set once per app as the theme's `--font-sans`.
- Pictures keep their own size and fill their box as in Holo.
- Colours are the Tailwind classes of [the colours](/colours.md), the closest class of Holo's hue.
- BBCode's small text stays 10px, under the body's 12px.
- The shared parts fit the 12px text: a `Step`'s numbered point is 20px (`size-5`) with a 1px border, its arrow 6px,
  and the stepper's gaps 6px; a `Notice` reads at `text-xs`; a `FormField`'s help line is `neutral-500`, the grey of
  housekeeping's help.
- Housekeeping and the installer keep their own looks at the site's `text-xs`. Housekeeping has its widths of before
  the bigger design: a tab `w-44`, the left column `w-46`. The installer's page is 640px (`max-w-160`), its box 608px
  and its column 574px.
- The live HoloCMS of the comparison differs from `source/holocms`, which the port follows: its Me page holds its
  boxes in other columns, and its community page titles the tags box "Tags" in green.
- The live HoloCMS shows other staff, credits and club pages (a Collectables tab, Refer Options, a Leaderboard),
  has no Refer Options tab in the account, swaps register's columns, and asks for the password again before the
  client. The port follows the source.
- On the myhabbo pages the live HoloCMS shows no home (its first visit fails on "Field 'data' doesn't have a default
  value"), no thread and no group, so they are compared with Holo's own markup of `forum.php`, `viewthread.php`,
  `user_profile.php` and `group_profile.php` on the live stylesheets. The live one also draws the rows of the groups
  and members widgets and the profile's tags on a raster, and another offline picture, which `source/holocms` takes
  from Habbo's gone CDN or lacks.

## The colours

A colour of Holo's takes the Tailwind class closest to it, when that class lies within a margin of distance. Beyond the
margin, the palette gains a shade: a theme colour in one shared stylesheet, named by the nearest hue's family and a
number between its neighbours, such as `red-550` for Holo's #d64242. `tools/tw-color` measures the distance, proposes
the shade, and knows the shades added.

## The tabs

The main tabs are drawn in CSS, as `Button` draws its raised face: an outline, a lighter upper half and a darker lower
half ([the comparison](/features/look-and-feel/research-holo-look.md), "The main tabs", holds Holo's numbers).

The shape the user approved on 2026-11-23 for the tabs inside boxes:

```svelte
<Tabs value="friends" color="green">
  <TabList>
    <Tab value="friends">Friends</Tab>
    <Tab value="groups">Groups</Tab>
  </TabList>
  <TabPanel value="friends">...</TabPanel>
</Tabs>

// color: "blue" | "green" | "orange"
// default: "blue"
```

The row's line and every tab follow the group's colour.

## The stepper

The shape the user approved on 2026-11-23:

```svelte
<Stepper>
  <Step href="/installer/config">Configuration</Step>
  <Step href="/installer/site">Site</Step>
  <Step current>Settings</Step>
  <Step>Client files</Step>
  <Step>Administrator</Step>
</Stepper>
```

- `Stepper` is an ordered list: it numbers the steps and draws the arrows between them.
- `Step` with `href` is a link, a step already passed; with `current` it is highlighted and carries
  `aria-current="step"`; with neither it is plain and faded, a step still to come.
- It holds no state, so a page the server fills chooses each step's form with its own conditions, and it is drawn on
  the server.

[The comparison](/features/look-and-feel/research-holo-look.md) ran both systems and measured them. The navbar looks
plain because the public site never sets Holo's font, Verdana, so the browser falls back to a lighter one; the weights
already match. After the font come the line height, the tabs' artwork, the sub-navigation, the inner tabs, the boxes'
frame and padding, the title bars' size and colours, the header and the footer.

[The redesign study](/features/look-and-feel/research-redesign.md) recommends moving every size into theme tokens first,
with nothing changing on screen, then setting the tokens to a 16px design about 4/3 wider (a 1240px page), with bitmaps
never scaled by a fraction. An exact 16/11 scale gives a page of about 1382px, which does not fit a 1366 screen.

The known issue of [later](/features/look-and-feel/later.md), group badge tint 15 is not brown, belongs here.

## The installer's layout

Built after a review of the first look at 1366px and 375px. Its faults: the steps' tabs sat at the box's right edge
(`TabList` is `justify-end`) while the text sat at the left; the box was 960px and a step kept a 672px column, so a
third of the box stood empty and the buttons ended in its middle; the settings step took the whole box in two CSS
columns, which end at different heights; its buttons ended a 2000px page; the tabs island drew nothing with scripts off;
on a phone the five tabs took three rows.

- One column for every step: the box is 608px and its content one 574px column, shared by the stepper, the text, the
  fields and the buttons. Spacing is flex with `gap`.
- The steps are the shared `Stepper` ([the stepper](#the-stepper)), drawn on the server: an ordered list of numbered
  points, each with its name and an arrow after it, so that a wrapped row breaks after an arrow. Passed steps are
  links, the current one is dark and bold, the ones to come faded. Under 640px only the current step shows its name.
- One row of buttons on every step, sticky at the bottom on a white band with a top line: the way on, then the green
  main button at the right end.
- The settings step's groups are sections the server draws in the one form, each a native `<details>` whose
  `<summary>` is a title row as wide as the column, with a chevron that turns when it opens. The first opens, the
  others are closed, and "More settings" is the last, closed, with its groups as sections inside it. A closed section
  still posts its fields, and the section of a refused field opens. The step needs no script. A field of a short value
  is 128px; a field of an address or a figure takes the column.
- The guidance of Claude's design skill: the project's own system first (Holo's font, colours and parts), one left
  edge and repeated elements with the same edges, flex and `gap` for spacing, a border only where it sets a thing
  apart (the closed sections' title rows), numbering only where the order is real (the steps), and a
  visible focus on every link, tab and section title.

# Decisions

Of 2026-11-23, each the user's words or choice among options put to them:

- Holo's 11px becomes 16px, smaller texts the smaller variants and bigger ones the larger ("11px back them is what
  regular 16px (1rem) is today"). It replaces Holo's sizes alone in
  [holo-port 0034](/decisions/holo-port/0034-behaviour-matches-holo.md): colours, shapes, borders and behaviour stay
  Holo's ("make sure look & feel is as similar as possible").
- The site, the installer and housekeeping all move to the new sizes ("Housekeeping too"). Housekeeping keeps its own
  design ([0041](/decisions/holo-port/0041-housekeeping-design-system.md),
  [0060](/decisions/holo-port/0060-housekeeping-components.md)).
- The page is 1240px wide ("1240px"): it fits a 1366px screen.
- The main tabs are redrawn in CSS with two tones, "kind of `button.svelte` styling", in place of Holo's `tabs.png`.
- `Tabs` takes one `color` for the group ("A color on Tabs").
- The installer keeps a page of its own, built from the shared Habbo parts ("Its own page, Habbo parts").
- The habbo search shows its field and button on one line, the same height, as a group at the right edge.
- The installer's layout is reviewed and rebuilt on one column. The user, 2026-11-23, of its first look: "center the
  tabs or left-aligned, use any claude skill to make it better. for the optional step 3. settings, make sections
  either collapsible or subtabs and make the continue/skip button visible with the save one, so the admin can easily
  go ahead. please do a review on the installer, looks better because has colors now, but the css rules are just bad,
  some pages are right aligned, other pages left aligned, the settings page with two columns looks horrible because
  there are gaps either left or right." The master chose left-aligned tabs, and tabs inside the settings step with the
  buttons kept in sight. A design skill may guide the layout, its spacing and its alignment; Holo's font, colours and
  shared parts stay.
- The installer's steps are a stepper, in place of tabs. The user: "instead of tabs for the installer, an stepper would
  like much better, stepper is just links next to each other in the same row, with arrows and points/bullets also
  highligthing the current step, as before, use claude skill." The stepper is a shared part of `packages/components`
  ("make the stepper a shared component in packages/components"), in the shape the user chose ("Each step says what it
  is"). The `href` on the shared `Tab`, approved for the steps earlier that day, is dropped: nothing uses it.
- The site's pages are reviewed again, page by page, beside HoloCMS. The user, 2026-11-23, of the pages after the
  first pass: "everything in the layout is broken now, look at the columns of the content, and some of the content
  themselves... please start the holocms on docker you had before, and make a comparison pixel-perfect, i want the new
  size bigger, but consistent with the old holocms, i want it looks like a bigger scale." And of the cause, three
  scales at once (text 1.45, widths 1.3, pictures 1): "i want text 1.45, but use flex-box, do not use the old css holo
  has. we can keep using the old images and make it look good, you are just growing everything without reviwing it.
  we can wrap and force sizes to match the new font size".
- The site gets phones and tablets: "for mobile we have one column and everything is full width, for tablet and bigger
  screens we could have two columns. again, design it, make it looks good, compare with the original holocms and fix
  whatever looks odd. holocms does not have mobile support, so just compare againts big screens."
- How Holo's pictures are drawn waits for the user's eyes ("Show me both first"): one page built with the pictures at
  their own size, grown smooth, and grown with sharp pixels.
- The settings step's groups are collapsible sections, in place of the tabs inside the step ("switch to collapsible
  sections"). Seven tabs wrapped onto two rows on a wide screen and five on a phone.
- The site clones Holo's styling at Holo's own sizes; the bigger design is set aside. The user, 2026-11-24, of the
  two pages rebuilt at 16px: "both looks horrible", and of pictures grown with the text: "it's pixel art, looks ugly if
  rescale [...] never scale images". Then: "i got enough, just mark for now cloning pixel perfect the holo cms styling
  but using the closest tailwind common classes, font-size becomes something like text-xs, and the margins and
  paddings that are generally 5px or something like that, become 4px or 6px as tailwind common classes." It replaces
  the decisions above on 16px text, the 1240px page and the sizes' table, for the site and its shared parts.
- Housekeeping and the installer keep their own looks and go back to Holo's sizes with the shared parts, so one scale
  holds everywhere. This is the master's reading; the user spoke of the site.
- The line under the tabs of a box runs the box's full width ("the cards for groups and tags looks odd, compare againts
  holocms and you will see the colored line under tabs is full width in holocms").
- Phones and tablets wait ([later](/features/look-and-feel/later.md)).
- The user passed the first cloned pages ("me looks good, community too") and named the next faults: the forum's box
  and a home's canvas and profile widget. Housekeeping and the installer take the site's text size ("make installer
  and reborn same text-xs font-size as the site for now"; the master reads "reborn" as housekeeping).
- The sub-navigation is the same on every page of the community layout, and the forum shrinks to it ("i prefer to
  shrink the content instead of growing the nav, nav must look the same for all pages of community layout"). It
  replaces the wide sub-navigation of the forum; the homes and the groups wait for the user's word.
- Tailwind's palette gains shades for Holo's colours beyond a margin of distance, and the tool learns them (the user's
  idea, in the task's words).
- The stepper's points, the notice and a field's help line are fitted to 12px ("yes, i think").
- Homes and groups get the 752px canvas under the same navigation, with no advert column ("Canvas of 752px, no
  advert column"). Holo gave club members and groups a 922px canvas; that benefit goes.
- HoloCMS 3.1.1 becomes the source reference, its code copied into `source/` without Sulake's client files and
  pictures ("Copy its code into source/"); see [the two versions](/sources/holocms/versions.md).

Earlier:


- [Housekeeping gets its own simple design system](/decisions/holo-port/0041-housekeeping-design-system.md) —
  Housekeeping follows Habbo's original housekeeping, simple tables with white and blue sections.
- [The footer names Project Reborn](/decisions/holo-port/0048-footer-names-reborn.md) — The footer keeps `Powered by
  Project Reborn ©` in place of Holo's line.
- [Housekeeping components have one look each](/decisions/holo-port/0060-housekeeping-components.md) — Blue
  navigation, gold data lists, blue forms and a grey top bar, the same on every page.

# Notes

- How a page is cloned: Holo's page and ours are opened at the same width, 1366px, and set side by side and one over
  the other; each box is matched in place, size, colour and text until they agree. Sizes are Tailwind's common
  classes closest to Holo's: `text-xs` for 11px and 10px, `text-sm` for 14px, 4px or 6px for 5px. Pictures are never
  scaled.
- Holo's own register page fails on the user's stack ("Unknown column 'newsletter'"), so a habbo for the Me page's
  comparison needs the user's help.

- The review's rules, from the user's words: layouts are flexbox, written new, with Holo's CSS as the measure of
  proportions alone; text is Holo's times 16/11; pictures keep their size and their boxes wrap them; every page is
  looked at beside Holo's, on a wide screen, before it merges. The first pass applied multipliers page by page with
  no such look, and its 1240px page with columns at 4/3 is replaced by what the review builds.
- The review's first two pages, the community page and the Me page, pass `fluid` to the community layout; the other
  pages keep the 1240px page inside the new header until the user has judged the two, and follow them page by page.
- HoloCMS runs from the user's own Docker stack (`/mnt/media/Laboratory/habbo/holo`, `docker start holo-php-1
  holo-nginx-1`), on `http://localhost:11300`.

- The `landing-page-design` and `figma-designer` skills were installed in the project on 2026-11-23 and removed the
  same day (the user: "uninstall [...] as we do not use them really"). The installer's layout takes its guidance from
  Claude's own design skill, and keeps Holo's font, colours and shared parts.
- The order is the shared parts first, then each app: the pages of an app look uneven between the first task and its
  own.

- Holo's `registered users` counted its `users` table, which held one row per habbo, so the header counts habbos.
- Astro drops whitespace that holds a line break next to an element, so such a sentence stays on one line.
- `>>` is wider than the `»` it replaced, and its box is half the button, so it needs `whitespace-nowrap`.
