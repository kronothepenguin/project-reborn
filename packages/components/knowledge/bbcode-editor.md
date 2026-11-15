---
type: Reference
title: BBCode editor
description: The WYSIWYG editor of every field that takes BBCode, and the reader and writer it stands on.
---

# BBCode editor

`BBCodeEditor` is one editor for every field that takes BBCode, written on the browser's contenteditable (decision
holo-port/0092).

- The toolbar holds `Bold`, `Italic`, `Underline`, `Strike`, `Quote`, `Code`, `Link`, `Colours` with the 8 names,
  `Small`, `Large`, a `Smiley <code>` button per face when the field gives smilies, and `BBCode`, which swaps in a
  textarea with the raw codes.
- The link row holds `Address`, `Add link`, `Remove link` and `Cancel`, and takes only http and https addresses: "The
  address must start with http:// or https://.".
- Pasting keeps bold, italic, underline, strike, links, quotes and line breaks, and drops other formatting to its text.
- Props: `value`, `field` (the textarea it stands in for, which keeps the BBCode for its form and stays the plain field
  without JavaScript), `smilies`, `variant` (`site` or `housekeeping`), `label`, `rows` and `maxLength`.

# Reader and writer

- `src/bbcode.ts` reads BBCode with the passes of the CMS's renderer (`packages/cms/internal/bbcode`) and leaves the
  nesting to the browser, whose tree construction the renderer emulates. Colours and sizes are `<font>` elements, as in
  Holo's HTML, because the parser nests a `<span>` differently.
- The writer turns the editor's DOM, or pasted HTML, back into BBCode. It never writes a code inside one that ends the
  same way, which Holo's passes could not read back.
- Bold, italic, underline, strike and links use the browser's editing commands; quotes, code, colours, sizes, smilies
  and pastes change the DOM directly. After each, the area is drawn again from the BBCode, so the editor keeps its own
  undo.
- A code typed as text in the editor works as a code once saved, as in the BBCode view.
