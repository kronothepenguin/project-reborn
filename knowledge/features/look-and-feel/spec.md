---
type: Spec
title: "Look and feel: Holo's look at today's sizes"
description: The site has Holo's two layouts and housekeeping a look of its own; the site matches HoloCMS where it drifted and moves to a 16px base with a wider layout that keeps Holo's look and feel.
status: active
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

The user, on 2026-11-23: "i want to enhance the installer design, maybe make it look more like habbo style. the
community is not similar to holocms, if you see holocms it has navigation tabs with two colors, kind of
`packages/components/src/components/button.svelte` styling, please make sure look & feel is as similar as possible. for
the text remember that 11px back them is what regular 16px (1rem) is today. so we should replace 11px -> 16px, anything
lower should be the smaller variants and anything bigger should be the large ones. also, the
`packages/components/src/components/tab.svelte` has not complete style yet, please fix it and add color variants as in
holocms." And: "in the community layout, i expect the search for user profiles to be inline the input and button, same
height and close as possible aligned to right as a group".

# Behaviours

## Signed-out layout

- A visitor opens a signed-out page other than the maintenance page: the title reads `<short name> ~ Home`, and
  `/register` reads `<short name> ~ Register`.
- A visitor opens the maintenance page: the title is the bare short name.
- A visitor opens a signed-out page: the header shows `N users online now` and `N registered users`, counting habbos,
  and the logo links to `/`.
- A visitor opens a signed-out page: it carries Holo's `description` and `keywords` meta tags.
- A visitor reads the footer: its links are separated by ` | `, and it reads `Powered by Project Reborn ©` (decision
  holo-port/0048).
- A staff member reads the signed-out footer: it shows a `Housekeeping` link.

## Community layout

- A signed-in habbo opens a page: the title reads `<short name> ~ <habbo name>`.
- A signed-in habbo opens a page: the main tabs show its name, Community and Credits, over Holo's sub-tabs.
- A guest opens a page: the main tab reads `Register now!`, and the header shows the mini login.
- A habbo with `housekeeping.access` opens a page: a Housekeeping tab shows, linking to `site.housekeepingUrl`.
- A signed-in habbo reads the header: it shows Help, Sign Out, a switch link with several habbos, and the habbo search.
- A visitor reads the header: it shows `N users online now` and `<site> is offline`.
- Staff pass maintenance: `Alert: The site is currently turned off!` shows above and below the page.
- A visitor reads the main tabs: each tab has two tones, the upper half lighter, inside a dark outline, and pointing at
  it lightens both.
- A visitor reads the main tabs: Housekeeping and "Register now!" are green, and the selected tab is white with bold
  black text and opens into the sub-navigation below it.
- A visitor reads the sub-navigation: Holo's items, separated by thin lines, the selected one bold and black, a link
  underlined while pointed at.
- A signed-in habbo reads the header: the habbo search shows its field and its button on one line, the same height,
  as one group at the right edge.
- A visitor reads a box: Holo's frame, its title bar in Holo's colour and size, and its content inset as Holo's.

## Housekeeping

- Staff open housekeeping: a grey top bar shows who is logged in, their previous login, `Log out` and the clock box
  (decision holo-port/0060).
- Staff read their previous login: it is their last successful sign-in before the newest, and failed sign-ins do not
  count.
- Staff read the clock box: the local and server times tick each second.
- Staff read a page: navy tabs, the active one `sky-700`, over a blue strip, and a left column of boxes with `sky-700`
  titles (decision holo-port/0060).
- Staff follow any link of housekeeping's tabs and menu boxes: the page opens.
- Staff read a data list: an `amber-300` header over `amber-100` rows; a form has a `sky-700` title and plain rows
  (decision holo-port/0060).
- Staff read a data list in housekeeping: its rows alternate in shade.

### Housekeeping at today's sizes

- Staff open housekeeping: its own look stays, the grey bar, the navy tabs and the gold lists, at the new sizes.

## Every page

- A page shows a select whose options the server fills in: it shows only the options.

## Tabs inside boxes

- A box shows tabs: an unselected tab is filled with the box's colour and has white text, and the selected one is
  white with an outline in that colour and bold black text.
- A box shows tabs: a line in the box's colour runs under the row, and the colour is blue, green or orange.

## The installer

- An administrator opens the installer: a page of its own, built from the site's parts: the title bars, the two-tone
  buttons and the steps as tabs, in Holo's colours and font.

## Sizes

- A visitor opens a page of the site, the installer or housekeeping: its body text is 16px, in Holo's font.
- A page shows a text Holo drew smaller than its body text: it shows in a smaller size; a text Holo drew bigger shows
  in a bigger size.
- A visitor opens a page of the site on a screen 1366px wide: the page is 1240px wide and centred, and nothing scrolls
  sideways.
- A page shows a picture, such as an avatar, a badge or an icon: it shows at its own size, sharp.

## Next

### Tabs that are links

- A page gives a tab an address: the tab is a link, drawn as the other tabs, and opens the address with a click, the
  keyboard or in a new browser tab.
- An administrator opens the installer with scripts off: the steps show as tabs, and a step already passed opens
  from its tab.

# Open questions

- Four questions of [the redesign
  study](/features/look-and-feel/research-redesign.md#questions-for-the-owner-recommended-answer-first): avatars and
  badges doubled or kept, home pages, the Help Tool's popup, and screenshot baselines in the browser suites. Until
  they are answered, pictures keep their size, and home pages and the Help Tool keep their canvas.
