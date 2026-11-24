---
type: Reference
title: Primitives
description: Facts about the primitives that the pages rely on, from the Icon sprite to the Select marker.
---

# Icon

- `Icon` keeps Holo's seven names from `buttons.css`: `search`, `envelope`, `save`, `cancel`, `edit`, `purse` and
  `newtopic`.
- The sprite draws `save`, `cancel` and `edit` in white, for coloured buttons. `purse` is a black check mark, which Holo
  used on the voucher submit button.
- The sprite `src/assets/button_icons2.png` is 285 bytes, so Vite inlines it in the CSS and it is absent from `dist`.
- `Icon` is hidden from assistive technology, so an icon-only button carries an `aria-label`.

# Checkbox

- `Checkbox` puts `class` on its label, which is what a page lays out. Every other prop goes to the input.
- It spreads the props before `type`, so a page keeps it a checkbox.

# Select

`Select` takes its options as children, so that Go can render them with `[[ range ]]`. Svelte's server renderer ends
such a `<select>` with a `<!>` marker, which `packages/astro` removes.

# Avatar

`Avatar` builds its image from `imagingUrl` and the figure (decision holo-port/0008), in the sizes `s` and `b`, the two
Holo used. It joins the values without encoding, because at build time they can be `[[ ]]` placeholders.

# Bubble

`Bubble` carries `relative` for its tail, so a caller positions it through a wrapper.

# Sizes

The primitives clone Holo's styling at Holo's sizes, in Tailwind's closest common classes
(`knowledge/features/look-and-feel/plan.md`): Holo's 10px and 11px text is `text-xs`, its 14px `text-sm`; a padding
or gap of 5px is `1` or `1.5`, of 8px `2`, of 10px to 12px `2.5` or `3`. A primitive sets no body size: it takes the
page's, `text-xs` on the site. Borders, corner radii and pictures keep Holo's sizes.

# Button

- `Button` writes its label bold in `text-xs`, Holo's 11px, `py-0.5` inside its 2px border, so it is 24px tall, Holo's
  25. `wide` pads it `px-4` and `compact` `px-2`.
- `Button` draws its raised face, its 2px border and its radius in every variant but `plain`. `plain` is housekeeping's
  submit button: a 1px black border, square corners and an `olive-200` face that turns white on hover.
- `plain` with `size="compact"` matches housekeeping's `submit.astro` in every computed style and in its size.
- `Button` defaults `type` to `button`, so a submit button passes `type="submit"`.

# Box

`Box` is housekeeping's titled section: a `title` heading in a `blue` (`sky-700`, white text) or `gold` (`amber-300`,
black text) bar above its children (decision holo-port/0060). `title` is the heading text, never a tooltip.

# Paper and Card

- `Paper` draws Holo's frame: a 1px `black/20` edge with a 3px bottom and 4px corners. Its background stops at the
  edge (`bg-clip-padding`), so the page shows through it, as Holo's #b5b5af on #e3e3db.
- `Card` insets its title bar `px-1 pt-1` from the frame, Holo's 4px, and its content `px-4 py-2`, Holo's `8px 15px`.
- `Card`'s title bar is bold `text-sm` on a 17px line, padded `px-2.5 py-1`, so it is 25px tall as Holo's bold 14px on
  17px with its rounded 4px above and below. Its colours are those of `knowledge/colours.md`.
- A box with tabs is a `Paper` with a `TabList` at its top, as Holo's box with tabs has no inset: the line under the
  tabs runs from one edge of the box to the other.

# Tabs

- `Tabs` holds the selected value and the group's `color`: `blue`, `green` or `orange`, `blue` by default.
  `TabList` and `Tab` read both from the tabs' context, so the row's line and every tab follow the group.
- `TabList` is the `tablist`: it takes the arrow keys, draws the line under the row and keeps the tabs at its right
  edge, in their order, 4px apart and 4px from the edge. The row is Holo's 25px over its 1px line, and as wide as its
  parent. It does not wrap: a page with more tabs than its width passes `flex-wrap`, and one that starts
  them at the left `justify-start!`, as the installer's settings step does. `TabPanel` goes beside it, inside `Tabs`.
- `Tab` is 25px tall with `text-xs`, filled with the colour, in white text, and lighter while pointed at; the selected
  one is white with an outline in the colour and bold black text. It sits 1px low, so it covers the row's line. Blue
  is `blue-400`, Holo's #528dc9; green `lime-600`; orange `amber-500`.

# Stepper

- `Stepper` is an `<ol>` in one row that wraps: it resets a CSS counter, and each `Step` counts itself, so the steps
  number themselves in their order. `Step` draws a chevron after itself by `::after`, hidden on the last.
- `Step` takes `href`, a step passed, drawn as a link; `current`, the open step, with a dark point, a bold black name
  and `aria-current="step"`; or neither, a step still to come, plain and faded. `current` wins over `href`. Its other
  attributes go to the `<li>`.
- The number sits in the point's `::before`, on an `aria-hidden` span, so a link's name is the step's name alone.
- Under 640px only the current step shows its name; the others keep it for assistive technology.
- `Stepper` holds no state and no context: a page the server fills writes its own condition around each `Step`, and
  uses both with no client directive. The caller puts it in a `<nav>` with its own label.

# Table

- `list` shades the header `amber-300` and every second body row `amber-100`, and pads every cell.
- `form` pads every cell and aligns it to the top, with no colours.
- `plain` gives only `w-full border-collapse`: the page styles its cells, its header and its rows.

# PaginationItem

`PaginationItem` gives its other attributes to the link. The current page is a plain `<span>` with none of them.
