---
type: Reference
title: Holo colours mapped to Tailwind
description: The Tailwind class or new shade for each Holo colour, with its distance, computed with tools/tw-color, for the public site, BBCode and housekeeping.
timestamp: 2026-11-24T00:00:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [colours, tailwind]
---

# How to use

Use these classes instead of Holo's hex values. A colour within the margin of Tailwind's palette, an OKLab distance of
0.031, takes its closest Tailwind class. A colour beyond it takes a new shade of the nearest hue's family, of Holo's
exact colour, from `packages/components/src/styles/shades.css`; a colour within the margin of a new shade takes that
shade. For a colour that is not listed, run `node tools/tw-color/tw-color.mjs -d "#rrggbb"`: it prints the class, or
`new <shade> <hex>` for a colour beyond the margin, and `-w "<use>"` writes that shade into the stylesheet. Add the
result here.

# Box title bars and bodies

| Holo variant | Hex | Tailwind | Distance |
| --- | --- | --- | --- |
| default title | #fc6204 | orange-500 | 0.0279 |
| orange title | #f66200 | orange-550 | 0 |
| blue title | #2767a7 | sky-700 | 0.0242 |
| green title | #4ab501 | lime-550 | 0 |
| red / hcred title | #d64242 | red-550 | 0 |
| darkred title | #c73c3c | red-650 | 0 |
| brown title | #a67a3e | yellow-650 | 0 |
| lightbrown title | #cf9c44 | yellow-550 | 0 |
| settings title | #595959 | mist-600 | 0.022 |
| gray title / gray body | #333 / #9a9a91 | neutral-750 / stone-400 | 0 / 0.0274 |
| activehomes title / body | #51a5d5 / #99cadb | sky-450 / sky-350 | 0 / 0 |
| promogray title | #9c350f | orange-800 | 0.0131 |
| loginbox title / body | #6b6b6b / #b4b4ae | neutral-500 / stone-350 | 0.0282 / 0 |
| rooms title / body | #225e6a / #4596a9 | cyan-800 / cyan-550 | 0.0257 / 0 |
| hcred body | #ffe8b7 | amber-100 | 0.028 |
| lightgreen body | #d5e7d8 | mist-200 | 0.0298 |
| box frame | #b5b5af, 20% black on #e3e3db | black/20 | |

The box frame stays `black/20`, which draws Holo's #b5b5af on the page's background.

# Tabs inside boxes

The fills of Holo's `inner-tabs.png`. Its line, the tab's outline and an unselected tab's fill share one colour; the
selected tab is white.

| Colour | Fill and line | Hover | Tailwind | Hover class | Distance |
| --- | --- | --- | --- | --- | --- |
| blue | #528dc9 | #66ade4 | blue-450 | sky-425 | 0 / 0 |
| green | #3ba800 | #49c700 | lime-600 | lime-525 | 0.0269 / 0 |
| orange | #ff9900 | #ffba00 | amber-500 | amber-400 | 0.0227 / 0.02 |

# Main tabs

The fills of Holo's `tabs.png`, drawn in CSS.

| Tab | Hex | Tailwind | Distance |
| --- | --- | --- | --- |
| blue outline | #134787 | blue-850 | 0 |
| blue upper / lower | #408fcc / #2373b2 | blue-450 / sky-650 | 0.015 / 0 |
| blue hover upper / lower | #50afe6 / #2c8fd2 | sky-425 / blue-450 | 0.0177 / 0.0285 |
| green outline | #276604 | lime-800 | 0.0213 |
| green upper / lower | #49cf04 / #38aa00 | lime-525 / lime-600 | 0.0223 / 0.0286 |
| green hover upper / lower | #5cff06 / #49cf04 | lime-350 / lime-525 | 0 / 0.0223 |

# Page and status

| Use | Hex | Tailwind | Distance |
| --- | --- | --- | --- |
| page background | #e3e3db | taupe-200 | 0.0133 |
| header strip, process pages | #bce0ee | sky-200 | 0.0231 |
| default link | #fc6204 | orange-500 | 0.0279 |
| sub-navigation links | #134787 | blue-850 | 0 |
| links on dark boxes / hover | #ffb648 / #fcce04 | orange-300 / amber-300 | 0.029 / 0.0152 |
| error | #e2001a | red-600 | 0.0116 |
| success / success border | #3ba800 / #194800 | lime-600 / lime-925 | 0.0269 / 0 |
| warning orange / yellow | #f29400 / #ffcd0a | amber-550 / amber-300 | 0 / 0.014 |
| rounded-blue | #3399cc | sky-550 | 0 |
| even rows / separators | #ececec / #e8e8e8 | olive-200 / gray-200 | 0.0148 / 0.0067 |
| transaction odd rows / headings | #efefef / #999 | taupe-100 / neutral-400 | 0.0081 / 0.025 |
| footer text | #777 | neutral-500 | 0.0133 |
| habbo search placeholder | #8e8e8e | neutral-450 | 0 |
| maintenance background | #083940 | cyan-950 | 0.0249 |
| list hover blue (odd / even) | #f1f8ff / #dceafa | sky-50 / blue-100 | 0.0029 / 0.006 |
| list hover default (odd / even) | #fff6ee / #fff0dc | orange-50 / orange-100 | 0.0036 / 0.0104 |
| list hover green (odd / even) | #ebffd9 / #dafdc2 | lime-100 / lime-100 | 0.0176 / 0.0263 |

# Help Tool

The window of Holo's `iot` pages, from `iot/content3/styles/style.css` and `style-iot.css`.

| Use | Hex | Tailwind | Distance |
| --- | --- | --- | --- |
| window background | #083940 | cyan-950 | 0.0249 |
| behind the portlet | #47839d | cyan-650 | 0 |
| heading | #069 | sky-700 | 0.0248 |
| link | #f16100 | orange-550 | 0.0099 |
| footer text | #7295aa | slate-450 | 0 |

# BBCode

The renderer emits classes, never inline hex.

| Holo colour | Hex | Tailwind | Distance |
| --- | --- | --- | --- |
| red | #d80000 | red-600 | 0.03 |
| orange | #fe6301 | orange-500 | 0.0243 |
| yellow | #ffce00 | amber-300 | 0.0132 |
| green | #6cc800 | lime-525 | 0.0275 |
| cyan | #00c6c4 | teal-450 | 0 |
| blue | #0070d7 | blue-550 | 0 |
| gray | #828282 | neutral-475 | 0 |
| black | #000000 | black | 0 |

# Housekeeping

The design system of [0041](/decisions/holo-port/0041-housekeeping-design-system.md) takes its colours from `docs/hk.png`, measured
on the image and mapped with `tools/tw-color`:

| Use | Hex | Tailwind | Distance |
| --- | --- | --- | --- |
| page, box bodies | #ffffff | white | 0 |
| text, box borders | #000000 | black | 0 |
| top bar, table header cells | #ebebeb | olive-200 | 0.0123 |
| active tab, strip, box title bars | #0066cc | blue-550 | 0.0303 |
| inactive tabs, links | #000099 / #000094 | blue-925 | 0 / 0.009 |
| visited links | #757575 | neutral-500 | 0.0064 |

Holo's own panel, which the new design system replaces, used these. No page shows them, so the ones beyond the margin
have no shade; the table gives their closest Tailwind class and its distance.

| Use | Hex | Tailwind | Distance |
| --- | --- | --- | --- |
| body | #f3f3f3 | mist-100 | 0.0023 |
| primary bars, inactive tabs | #3363a1 | sky-700 | 0.0352 |
| active tab | #6696d6 | blue-400 | 0.0695 |
| frame border | #5d789c | slate-500 | 0.022 |
| sub-header and footer bars | #acbfd9 | blue-300 | 0.0636 |
| strip bottom border | #385985 | sky-800 | 0.041 |
| table row 1 / row 2 | #eaedf0 / #f1f1f1 | mauve-100 / taupe-100 | 0.0163 / 0.0027 |
| menu background | #eff3f7 | slate-100 | 0.0057 |
| menu category title | #20476d | sky-900 | 0.0177 |
| menu link hover | #e69f06 | amber-500 | 0.0402 |
| buttons | #e7e7e7 | stone-200 | 0.0058 |
| input focus background | #e9f6fd | blue-50 | 0.0082 |
| dashboard section bar | #344966 | slate-700 | 0.0315 |
| notes textarea | #f9ffa2 | yellow-200 | 0.0392 |
| link hover | #465584 | slate-600 | 0.0403 |

# Group badge tints

The 18 badge tints are pixel data shared with the HabboWidgets badge editor; see
[the protocols](/sources/holocms/protocols.md#group-badges). P5 built them twice, with
Holo's exact colours and with the closest Tailwind colours ([0042](/decisions/holo-port/0042-two-badge-palettes.md)), and the
user kept the Tailwind palette ([0102](/decisions/holo-port/0102-badges-keep-the-tailwind-palette.md)).

Its colours are the sRGB values of the Tailwind v4 swatches; seven lie outside sRGB and are clipped to it, as their
usual hex values are. The tints keep the Tailwind palette beyond the margin too, by that decision. Tint 15,
olive-500, looks grey-olive beside Holo's brown, a [known issue](/features/look-and-feel/later.md).

| Tint | Holo | Tailwind | sRGB | Distance |
| --- | --- | --- | --- | --- |
| 01 | #ffd601 | amber-300 | #ffd230 | 0.0171 |
| 02 | #ee7600 | amber-600 | #e17100 | 0.0326 |
| 03 | #84de00 | lime-400 | #9ae600 | 0.0346 |
| 04 | #589a00 | lime-600 | #5ea500 | 0.0399 |
| 05 | #50c1fb | sky-400 | #00bcff | 0.0382 |
| 06 | #006fcf | sky-600 | #0084d1 | 0.0563 |
| 07 | #ff98e3 | pink-300 | #fda5d5 | 0.0403 |
| 08 | #f334bf | pink-500 | #f6339a | 0.0566 |
| 09 | #ff2d2d | red-500 | #fb2c36 | 0.0121 |
| 10 | #af0a0a | red-700 | #c10007 | 0.036 |
| 11 | #ffffff | white | #ffffff | 0 |
| 12 | #c0c0c0 | mauve-300 | #d7d0d7 | 0.0584 |
| 13 | #373737 | taupe-700 | #473c39 | 0.0342 |
| 14 | #fbe7ac | amber-100 | #fef3c6 | 0.0375 |
| 15 | #977641 | olive-500 | #7c7c67 | 0.0572 |
| 16 | #c2eaff | sky-200 | #b8e6fe | 0.0162 |
| 17 | #fff165 | yellow-200 | #fff085 | 0.0302 |
| 18 | #aaff7d | lime-300 | #bbf451 | 0.0388 |
