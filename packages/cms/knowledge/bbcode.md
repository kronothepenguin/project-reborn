---
type: Go Package
title: bbcode
description: The renderer that turns the BBCode of notes, news, posts and settings boxes into HTML, as HoloCMS's bbcode_format did.
resource: packages/cms/internal/bbcode
---

# Use

One renderer serves notes, news, forum posts and the BBCode boxes of the settings (decision holo-port/0020).

| Function | Renders |
| --- | --- |
| `Format(text, smilies)` | Holo's `bbcode_format(nl2br(text))`: a `<br />` before every line break, the smilies when `smilies` is true, then each tag in one pass, in Holo's order, with every piece of the text escaped |
| `Lines(text)` | Holo's `nl2br(htmlspecialchars(text))`: escaped, with a `<br />` before every line break, and neither smilies nor tags |

- A link takes only an http or https address.
- Colours and sizes become Tailwind classes, never inline hex.
- The editor of `packages/components` reads and writes the same tags and shows them with the renderer's classes
  (decision holo-port/0092).

# Inside

- Holo's passes crossed tags, which produced HTML that closed the page's own elements. `tree.go` nests them as a
  browser nested Holo's HTML, inside the text, so no end tag closes the page around it.
- A smiley image keeps `inline align-baseline`, because Tailwind's reset would put each one on its own line.
