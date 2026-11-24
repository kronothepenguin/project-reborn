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

The primitives follow the 16px design of the look and feel (`knowledge/features/look-and-feel/plan.md`): Holo's
11px text is `text-base`, its 14px `text-xl`, and its paddings and gaps are Holo's times 4/3 on Tailwind's scale.
Borders, corner radii and pictures keep Holo's sizes.

# Button

- `Button` writes its label bold in `text-base`, Holo's 11px. `wide` pads it `px-6` and `compact` `px-2.5`.
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
- `Card` insets its title bar `px-1.5 pt-1.5` from the frame, and its content `px-5 py-2.5`, Holo's `8px 15px`.
- `Card`'s title bar is bold `text-xl` on `leading-6`, padded `px-3.5 py-1.5`, Holo's bold 14px on 17px with
  `4px 10px`. Its colours are those of `knowledge/colours.md`.

# Tabs

- `Tabs` holds the selected value and the group's `color`: `blue`, `green` or `orange`, `blue` by default.
  `TabList` and `Tab` read both from the tabs' context, so the row's line and every tab follow the group.
- `TabList` is the `tablist`: it takes the arrow keys, draws the line under the row and keeps the tabs at its right
  edge, in their order. `TabPanel` goes beside it, inside `Tabs`.
- `Tab` is filled with the colour, in white text, and lighter while pointed at; the selected one is white with an
  outline in the colour and bold black text. It sits 1px low, so it covers the row's line.

# Table

- `list` shades the header `amber-300` and every second body row `amber-100`, and pads every cell.
- `form` pads every cell and aligns it to the top, with no colours.
- `plain` gives only `w-full border-collapse`: the page styles its cells, its header and its rows.

# PaginationItem

`PaginationItem` gives its other attributes to the link. The current page is a plain `<span>` with none of them.
