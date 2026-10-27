---
type: Reference
title: Holo colours mapped to Tailwind
description: The closest Tailwind colour for each Holo colour, computed with tools/tw-color, for the public site, BBCode and housekeeping.
timestamp: 2026-10-27T20:48:19+00:00
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
| footer text | #777 | neutral-500 |
| maintenance background | #083940 | cyan-950 |
| list hover blue (odd / even) | #f1f8ff / #dceafa | sky-50 / blue-100 |
| list hover default (odd / even) | #fff6ee / #fff0dc | orange-50 / orange-100 |
| list hover green (odd / even) | #ebffd9 / #dafdc2 | lime-100 / lime-100 |

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

The 18 badge tints are pixel data shared with the HabboWidgets badge editor and are kept as in Holo; see
[the protocols](/reference/holo-protocols.md#group-badges). This exception waits for the user's confirmation
([P5](/phases/p5-groups-forum.md)).
