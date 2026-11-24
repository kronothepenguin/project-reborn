---
type: Plan
title: "Look and feel: Holo's look at today's sizes: how"
description: The CMS, housekeeping and components hold the layouts, and the site's sizes move into theme tokens, then to a 16px design, after the differences from HoloCMS.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/cms` | `layouts/signed-out.astro` and `layouts/community.astro`, with the `header/*` components and the footers; Holo's font on the 16px base, the 1240px page, the two-tone main tabs, the sub-navigation, the header with its inline search, and the footer as Holo's ([the layouts](/packages/cms/knowledge/layouts.md)) |
| `packages/housekeeping` | `layouts/housekeeping.astro`: the grey bar, the tabs, the left column of `box` components and the content; `Box color="gold"` for data lists |
| `packages/components` | The primitives both apps share; `Table` and `Table variant="form"` give housekeeping's lists and forms; every primitive at the new sizes; `Tabs color`, with Holo's tabs inside boxes; the box's frame and the title bars as Holo's |
| `packages/store` | `CountAvatars`, the header's registered count |
| `packages/housekeeping` | Its own look at the new sizes: 16px in Verdana as the theme's `--font-sans`, widths by 1240/960, paddings and gaps by 4/3; every page fits a 1366px screen |
| `packages/installer` | `layouts/setup.astro`: the logo over one `Card color="blue"` per step, whose first row is the `step-tabs` island; Holo's font and the 16px base |

Planned:

| Project | Part |
| --- | --- |
| `packages/cms` | Every page at the new sizes |
| `tests/e2e` | The suites follow the pages; screenshots of every page are the exit check's evidence |

## The sizes

The user's rule: Holo's 11px is today's 16px, a smaller text takes a smaller variant and a bigger one a larger variant.

| Holo | Now | Tailwind |
| --- | --- | --- |
| 8px, 9px | 12px | `text-xs` |
| 10px | 14px | `text-sm` |
| 11px | 16px | `text-base` |
| 12px | 18px | `text-lg` |
| 14px | 20px | `text-xl` |
| 16px and more | 24px and more | `text-2xl` and up, one step per Holo size |

- A fixed size class, such as `text-[11px]`, becomes the class of this table. Line heights follow Tailwind's for the
  class, and Holo's own where Holo set one, scaled.
- The font is Holo's, `Verdana, Arial, Helvetica, sans-serif`, set once per app as the theme's `--font-sans`.
- The page is 1240px wide, Holo's 960px times about 1.29. A width becomes Holo's width times 1240/960, and a padding
  or a gap Holo's times 4/3, each rounded to Tailwind's scale.
- Borders, corner radii and pictures keep Holo's sizes: a picture is never scaled by a fraction.
- Colours are the Tailwind classes of [the colours](/colours.md). Where a class has another hue than Holo's colour,
  as the red title bar has today, the closest class of Holo's hue takes its place and the table there is corrected.

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

[The comparison](/features/look-and-feel/research-holo-look.md) ran both systems and measured them. The navbar looks
plain because the public site never sets Holo's font, Verdana, so the browser falls back to a lighter one; the weights
already match. After the font come the line height, the tabs' artwork, the sub-navigation, the inner tabs, the boxes'
frame and padding, the title bars' size and colours, the header and the footer.

[The redesign study](/features/look-and-feel/research-redesign.md) recommends moving every size into theme tokens first,
with nothing changing on screen, then setting the tokens to a 16px design about 4/3 wider (a 1240px page), with bitmaps
never scaled by a fraction. An exact 16/11 scale gives a page of about 1382px, which does not fit a 1366 screen.

The known issue of [later](/features/look-and-feel/later.md), group badge tint 15 is not brown, belongs here.

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
  highligthing the current step, as before, use claude skill." The stepper is the installer's own component, drawn on
  the server. The `href` on the shared `Tab`, approved for the steps earlier that day, is dropped: nothing uses it.

Earlier:


- [Housekeeping gets its own simple design system](/decisions/holo-port/0041-housekeeping-design-system.md) —
  Housekeeping follows Habbo's original housekeeping, simple tables with white and blue sections.
- [The footer names Project Reborn](/decisions/holo-port/0048-footer-names-reborn.md) — The footer keeps `Powered by
  Project Reborn ©` in place of Holo's line.
- [Housekeeping components have one look each](/decisions/holo-port/0060-housekeeping-components.md) — Blue
  navigation, gold data lists, blue forms and a grey top bar, the same on every page.

# Notes

- The `landing-page-design` and `figma-designer` skills were installed in the project on 2026-11-23 and removed the
  same day (the user: "uninstall [...] as we do not use them really"). The installer's layout takes its guidance from
  Claude's own design skill, and keeps Holo's font, colours and shared parts.
- The order is the shared parts first, then each app: the pages of an app look uneven between the first task and its
  own.

- Holo's `registered users` counted its `users` table, which held one row per habbo, so the header counts habbos.
- Astro drops whitespace that holds a line break next to an element, so such a sentence stays on one line.
- `>>` is wider than the `»` it replaced, and its box is half the button, so it needs `whitespace-nowrap`.
