---
type: Spec
title: "Look and feel: Holo's look at today's sizes"
description: The site has Holo's two layouts and housekeeping a look of its own; the site matches HoloCMS where it drifted and moves to a 16px base with a wider layout that keeps Holo's look and feel.
status: planned
projects: [packages/cms, packages/components, packages/housekeeping, packages/installer]
---

# What

The public site has Holo's two layouts: the signed-out process pages and the community pages with Holo's header, tabs
and footer. The footer names Project Reborn. Housekeeping has a look of its own, after Habbo's original housekeeping.
Pages take Holo's colours as the Tailwind classes of [the colours](/colours.md).

Next:

The site looks like HoloCMS, at sizes made for today's screens.

The user: "the community layout looks like holo cms, but not as holo cms. the link-buttons in the navbar are plain and
not bold, but holo used to be bold."

The user: "i know holo used to have font-size of 11px, but that's because screens back them used to be small compared to
today's screens. 1360 vs 1960. i want to redesign but keep the look & feel of holo cms. my idea is use today's sizes
like font-size: 16px. and make the layout's a little bigger to match this new font-size."

# Behaviours

## Signed-out layout

- A visitor opens a signed-out page: the title reads `<short name> ~ Home`, and `/register` reads `<short name> ~
  Register`.
- A visitor opens a signed-out page: the header shows `N users online now` and `N registered users`, counting habbos,
  and the logo links to `/`.
- A visitor opens a signed-out page: it carries Holo's `description` and `keywords` meta tags.
- A visitor reads the footer: its links are separated by ` | `, and it reads `Powered by Project Reborn ©` (decision
  holo-port/0048).
- A staff member reads the signed-out footer: it shows a `Housekeeping` link.

## Community layout

- A signed-in habbo opens a page: the main tabs show its name, Community and Credits, over Holo's sub-tabs.
- A guest opens a page: the main tab reads `Register now!`, and the header shows the mini login.
- A habbo with `housekeeping.access` opens a page: a Housekeeping tab shows, linking to `site.housekeepingUrl`.
- A signed-in habbo reads the header: it shows Help, Sign Out, a switch link with several habbos, and the habbo search.
- A visitor reads the header: it shows `N users online now` and `<site> is offline`.
- Staff pass maintenance: `Alert: The site is currently turned off!` shows above and below the page.

## Housekeeping

- Staff open housekeeping: a grey top bar shows who is logged in, their previous login, `Log out` and the clock box
  (decision holo-port/0060).
- Staff read a page: navy tabs, the active one `sky-700`, over a blue strip, and a left column of boxes with `sky-700`
  titles (decision holo-port/0060).
- Staff read a data list: an `amber-300` header over `amber-100` rows; a form has a `sky-700` title and plain rows
  (decision holo-port/0060).

# Open questions

- The ten questions of [the redesign
  study](/features/look-and-feel/research-redesign.md#questions-for-the-owner-recommended-answer-first): what is
  redesigned, whether it replaces "exactly as Holo" for sizes only
  ([holo-port 0034](/decisions/holo-port/0034-behaviour-matches-holo.md)), the font and its size, fixed or fluid, the
  factor, avatars and badges, home pages, the Help Tool, screenshot baselines, the order.
- Whether the differences from HoloCMS are fixed on today's 11px layout first, or with the redesign.
- Of [the comparison](/features/look-and-feel/research-holo-look.md): whether Holo's tab image `tabs.png` is copied or
  its look redrawn in CSS, and where the font is set, on the community layout alone or for the whole site.
