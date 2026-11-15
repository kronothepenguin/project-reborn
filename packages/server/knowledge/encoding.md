---
type: Go Package
title: Encoding
description: How packages/server/internal/encoding reads and writes the values of the R26 wire format.
tags: [server]
---

`encoding` reads and writes the values of the R26 wire format byte for byte as
the client's scripts do (`fuse_client/51_Connection Instance Class.ls`, described
in [fuse_client](/r26/fuse_client.md)). A reader takes its value from
the front of an `io.Reader` and reads no further; a writer writes it to an
`io.Writer`.

| Value | In the client | Read | Write |
| --- | --- | --- | --- |
| B64 of 2 characters: ids, shorts and string lengths | `msghandler`, `sendNew` `#short` | `ReadB64(r, 2)` | `WriteB64(w, v, 2)` |
| B64 of 3 characters: the length of a client's packet | `send`, `sendNew` | `ReadB64(r, 3)` | `WriteB64(w, v, 3)` |
| A byte, 0 to 63 | `GetByteFrom` | `ReadB64(r, 1)` | `WriteB64(w, v, 1)` |
| VL64, a 32-bit integer | `GetIntFrom`, `sendNew` `#integer` | `ReadVL64` | `WriteVL64` |
| A string that ends with `chr(2)` | `GetStrFrom` | `ReadString` | `WriteString` |
| A string after its B64 length | `sendNew` `#string` | `ReadB64String` | `WriteB64String` |
| A boolean, `@` or `A` | `GetBoolFrom`, `sendNew` `#boolean` | `ReadBool` | `WriteBool` |
| The raw rest of a body, as text | `tMsg.content`, `send` with text | `ReadRaw` | `WriteRaw` |

- Text is UTF-8 (`knowledge/decisions/server/0014-text-is-utf8.md`), with no locale
  conversion. The writers write UTF-8 as it is. The client's `decodeUTF8`
  misreads two kinds of characters: those whose UTF-8 starts with the byte `E0`,
  U+0800 to U+0FFF (Thai and the Indic scripts among them), which it takes for
  2-byte sequences, and those above U+FFFF, whose 4 bytes it reads as 3.
- A reader returns `io.EOF` when nothing is left, `io.ErrUnexpectedEOF` when the
  value is cut short, and an error wrapping `ErrMalformed` for bytes that are not
  the value: a VL64 count of 0 or 7, a VL64 beyond 32 bits, or text that is not
  UTF-8. It never panics.
- A writer refuses with an error wrapping `ErrUnencodable` a value the client
  would not read back as it was given: a B64 number too large for its
  characters, a string holding `chr(2)` or a B64-length string over 4095 bytes,
  or text that is not UTF-8.
