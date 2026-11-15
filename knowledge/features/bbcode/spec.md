---
type: Spec
title: BBCode
description: One formatter turns the BBCode of news, forum posts, home notes and the settings' boxes into HTML, and one editor shows it as it will look while it is written.
status: done
projects: [packages/cms, packages/components, packages/housekeeping]
---

# What

News, forum posts, home notes and the boxes of the staff and credits pages are BBCode. The CMS formats it into HTML as
HoloCMS did, with every piece of the text escaped. Every field that takes BBCode has one shared editor that shows the
text as it will look.

# Behaviours

- A text holds BBCode tags in any case: each turns into its HTML.
- A text holds line breaks: they show as line breaks.
- A text holds an unknown or unclosed tag: it stays as typed.
- A link tag holds an address other than http or https: it stays as typed.
- A colour tag holds a name outside Holo's colours: it stays as typed.
- A text holds HTML: it shows escaped.
- A text holds a smiley: it shows as its picture, found before the text is escaped.
- Any text is formatted: the HTML that comes out is well formed.
