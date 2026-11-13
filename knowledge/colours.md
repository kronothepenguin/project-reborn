---
type: Reference
title: Holo colours mapped to Tailwind
description: The closest Tailwind colour for each Holo colour, computed with tools/tw-color, for the public site, BBCode and housekeeping.
timestamp: 2026-11-07T00:36:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [colours, tailwind]
---

# How to use

Use these classes instead of Holo's hex values. For a colour that is not listed, run
`node tools/tw-color/tw-color.mjs -d "#rrggbb"` and add the result here.

# Box title bars and bodies

| Holo variant | Hex | Tailwind |
| --- | --- | --- |
| default / orange title | #fc6204 / #f66200 | orange-500 |
| blue title | #2767a7 | sky-700 |
| green title | #4ab501 | lime-600 |
| red / hcred / darkred title | #d64242 / #c73c3c | orange-700 |
| brown title | #a67a3e | yellow-700 |
| lightbrown title | #cf9c44 | yellow-600 |
| settings title | #595959 | mist-600 |
| gray title / gray body | #333 / #9a9a91 | olive-800 / stone-400 |
| activehomes title / body | #51a5d5 / #99cadb | sky-500 / sky-300 |
| promogray title | #9c350f | orange-800 |
| loginbox title / body | #6b6b6b / #b4b4ae | neutral-500 / olive-400 |
| rooms title / body | #225e6a / #4596a9 | cyan-800 / cyan-600 |
| hcred body | #ffe8b7 | amber-100 |
| lightgreen body | #d5e7d8 | mist-200 |

# Page and status

| Use | Hex | Tailwind |
| --- | --- | --- |
| page background | #e3e3db | taupe-200 |
| header strip, process pages | #bce0ee | sky-200 |
| default link | #fc6204 | orange-500 |
| sub-navigation links | #134787 | blue-900 |
| links on dark boxes / hover | #ffb648 / #fcce04 | orange-300 / amber-300 |
| error | #e2001a | red-600 |
| success / success border | #3ba800 / #194800 | lime-600 / green-900 |
| warning orange / yellow | #f29400 / #ffcd0a | amber-500 / amber-300 |
| rounded-blue | #3399cc | cyan-600 |
| even rows / separators | #ececec / #e8e8e8 | olive-200 / gray-200 |
| transaction odd rows / headings | #efefef / #999 | taupe-100 / neutral-400 |
| footer text | #777 | neutral-500 |
| maintenance background | #083940 | cyan-950 |
| list hover blue (odd / even) | #f1f8ff / #dceafa | sky-50 / blue-100 |
| list hover default (odd / even) | #fff6ee / #fff0dc | orange-50 / orange-100 |
| list hover green (odd / even) | #ebffd9 / #dafdc2 | lime-100 / lime-100 |

# Help Tool

The window of Holo's `iot` pages, from `iot/content3/styles/style.css` and `style-iot.css`.

| Use | Hex | Tailwind |
| --- | --- | --- |
| window background | #083940 | cyan-950 |
| behind the portlet | #47839d | slate-500 |
| heading | #069 | sky-700 |
| link | #f16100 | orange-600 |
| footer text | #7295aa | slate-400 |

# BBCode

The renderer emits classes, never inline hex.

| Holo colour | Hex | Tailwind |
| --- | --- | --- |
| red | #d80000 | red-600 |
| orange | #fe6301 | orange-500 |
| yellow | #ffce00 | amber-300 |
| green | #6cc800 | lime-500 |
| cyan | #00c6c4 | teal-400 |
| blue | #0070d7 | sky-600 |
| gray | #828282 | olive-500 |
| black | #000000 | black |

# Housekeeping

The design system of [0041](/decisions/holo-port/0041-housekeeping-design-system.md) takes its colours from `docs/hk.png`, measured
on the image and mapped with `tools/tw-color`:

| Use | Hex | Tailwind | Distance |
| --- | --- | --- | --- |
| page, box bodies | #ffffff | white | 0 |
| text, box borders | #000000 | black | 0 |
| top bar, table header cells | #ebebeb | olive-200 | 0.0123 |
| active tab, strip, box title bars | #0066cc | sky-700 | 0.0598 |
| inactive tabs, links | #000099 / #000094 | indigo-900 | 0.0971 |
| visited links | #757575 | neutral-500 | 0.0064 |

The distances to `sky-700` and `indigo-900` are the largest in this bundle, so these two are visibly less saturated than the
image. They are the closest Tailwind colours, which is the rule.

Holo's own panel, which the new design system replaces, used these:

| Use | Hex | Tailwind |
| --- | --- | --- |
| body | #f3f3f3 | mist-100 |
| primary bars, inactive tabs | #3363a1 | sky-700 |
| active tab | #6696d6 | blue-400 |
| frame border | #5d789c | slate-500 |
| sub-header and footer bars | #acbfd9 | blue-300 |
| strip bottom border | #385985 | sky-800 |
| table row 1 / row 2 | #eaedf0 / #f1f1f1 | mauve-100 / taupe-100 |
| menu background | #eff3f7 | slate-100 |
| menu category title | #20476d | sky-900 |
| menu link hover | #e69f06 | amber-500 |
| buttons | #e7e7e7 | stone-200 |
| input focus background | #e9f6fd | blue-50 |
| dashboard section bar | #344966 | slate-700 |
| notes textarea | #f9ffa2 | yellow-200 |
| link hover | #465584 | slate-600 |

# Group badge tints

The 18 badge tints are pixel data shared with the HabboWidgets badge editor; see
[the protocols](/sources/holocms/protocols.md#group-badges). P5 built them twice, with
Holo's exact colours and with the closest Tailwind colours ([0042](/decisions/holo-port/0042-two-badge-palettes.md)), and the
user kept the Tailwind palette ([0102](/decisions/holo-port/0102-badges-keep-the-tailwind-palette.md)).

Its colours are the sRGB values of the Tailwind v4 swatches; seven lie outside sRGB and are clipped to it, as their
usual hex values are. Tint 15, olive-500, looks grey-olive beside Holo's brown, a [known issue](/features/look-and-feel/later.md).

| Tint | Holo | Tailwind | sRGB |
| --- | --- | --- | --- |
| 01 | #ffd601 | amber-300 | #ffd230 |
| 02 | #ee7600 | amber-600 | #e17100 |
| 03 | #84de00 | lime-400 | #9ae600 |
| 04 | #589a00 | lime-600 | #5ea500 |
| 05 | #50c1fb | sky-400 | #00bcff |
| 06 | #006fcf | sky-600 | #0084d1 |
| 07 | #ff98e3 | pink-300 | #fda5d5 |
| 08 | #f334bf | pink-500 | #f6339a |
| 09 | #ff2d2d | red-500 | #fb2c36 |
| 10 | #af0a0a | red-700 | #c10007 |
| 11 | #ffffff | white | #ffffff |
| 12 | #c0c0c0 | mauve-300 | #d7d0d7 |
| 13 | #373737 | taupe-700 | #473c39 |
| 14 | #fbe7ac | amber-100 | #fef3c6 |
| 15 | #977641 | olive-500 | #7c7c67 |
| 16 | #c2eaff | sky-200 | #b8e6fe |
| 17 | #fff165 | yellow-200 | #fff085 |
| 18 | #aaff7d | lime-300 | #bbf451 |
