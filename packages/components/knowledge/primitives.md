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
