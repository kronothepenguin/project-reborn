---
type: Spec
title: "Look and feel: Holo's look at today's sizes"
description: The site has Holo's two layouts and housekeeping a look of its own; the site clones HoloCMS's styling at Holo's sizes, in Tailwind's closest common classes.
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
- Staff read a page: navy tabs, the active one `blue-550`, over a blue strip, and a left column of boxes with `blue-550`
  titles (decision holo-port/0060).
- Staff follow any link of housekeeping's tabs and menu boxes: the page opens.
- Staff read a data list: an `amber-300` header over `amber-100` rows; a form has a `blue-550` title and plain rows
  (decision holo-port/0060).
- Staff read a data list in housekeeping: its rows alternate in shade.

### Housekeeping at Holo's sizes

- Staff open housekeeping: its own look stays, the grey bar, the navy tabs and the gold lists, at Holo's sizes, with
  the site's 12px text.

## Every page

- A page shows a select whose options the server fills in: it shows only the options.

## Tabs inside boxes

- A box shows tabs: an unselected tab is filled with the box's colour and has white text, and the selected one is
  white with an outline in that colour and bold black text.
- A box shows tabs: a line in the box's colour runs under the row, and the colour is blue, green or orange.

## The installer

- An administrator opens the installer: a page of its own, built from the site's parts: the title bars, the two-tone
  buttons and the steps as a stepper, in Holo's colours and font.
- An administrator opens any step of the installer: the title, the steps, the fields and the buttons share one column
  and one left edge, and the box is as wide as its content, with no empty side.
- An administrator reads the steps: they show in one row as a stepper, each step a point with its name and an arrow to
  the next, starting at the left edge, with the current step highlighted.
- An administrator reads the stepper: a step already passed is a link to it, and a step still to come is plain.
- An administrator opens the installer: its text is the site's 12px, on a column fitted to it.
- An administrator opens the installer with scripts off: the stepper shows, and its links work.
- An administrator opens any step: its buttons sit in the same place and order, the way on and then the main button.
- An administrator scrolls a long step: "Skip" and "Save settings" stay in sight at the bottom of the screen.
- An administrator opens the settings step: each of its six groups is a section that opens and closes with a click on
  its title, the first one open, and "More settings" is the last section, closed.
- An administrator changes fields in several sections and saves: every change is saved, also from a closed section.
- A field in a closed section is refused: its section opens and the form names the field.
- An administrator opens the settings step with scripts off: the sections open and close as with scripts on.

## Sizes

- A visitor opens a page of the site: its text is in Holo's font, Holo's 11px at 12px, Tailwind's closest common size.
- A page shows a text Holo drew in another size: it shows in Tailwind's common size closest to Holo's.
- A visitor opens a community page on a screen 1366px wide: it is Holo's 930px page, centred, with Holo's columns, and
  nothing scrolls sideways.
- A visitor opens a signed-out page: it is Holo's 758px box, 12px from the top, centred as Holo's.
- A page shows a picture, such as an avatar, a badge or an icon: it shows at its own size, sharp.
- The Me page shows its Groups and Tags boxes: the line under their tabs runs from one edge of the box to the other.

## Holo's colours

- A page shows one of Holo's colours that Tailwind's palette holds within the margin: it uses that class.
- A page shows one of Holo's colours beyond the margin: it uses a new shade of the nearest family, of Holo's exact
  colour.
- A text stands on a coloured panel: it reads clearly, as Holo's.

## Next

### Holo's styling, cloned

- A visitor opens a page of the site on a wide screen: it matches Holo's page at Holo's own sizes, box for box, in
  its widths, its gaps, its text, its colours and its pictures.
- A page shows a text Holo drew at 11px: it shows at 12px, Tailwind's closest common size; a gap Holo drew at 5px
  shows at 4px or 6px.
- A page shows one of Holo's pictures: the picture keeps its own size and fills its box as in Holo, as the news
  picture and the Me page's hotel view do.
- A box shows tabs: the line in the box's colour runs under the tabs from one edge of the box to the other.

### The forum inside the navigation

- A visitor opens any page of the community layout: the sub-navigation has the same width and place.
- A visitor opens the discussion board or a thread: its box is as wide as the sub-navigation, and its rows fill it.

### Shared parts at 12px

- A page shows a stepper, a notice or a field with help: the stepper's points are in proportion to its names, the
  notice's text is the page's size, and the help line is grey beside its label.

# Open questions

- Four questions of [the redesign
  study](/features/look-and-feel/research-redesign.md#questions-for-the-owner-recommended-answer-first): avatars and
  badges doubled or kept, home pages, the Help Tool's popup, and screenshot baselines in the browser suites. Until
  they are answered, pictures keep their size, and home pages and the Help Tool keep their canvas.
