# Spec: 011 — Scripting Objects (Fileio, NetLingo, SpeechXtra, XMLParser)

**Feature**: `011-scripting-objects` | **Date**: 2026-09-10 | **Depends on**: 003.

## Scope

Author the 4 scripting Xtra objects missing from `src/engine/core/`, surface verbatim from
`docs/drmx2004_scripting_ref/scripting_objects.txt` (176 lines — method summaries + shared
`xtra()` creation, `new xtra("fileio")`):

- **Fileio** — 27 documented methods (closeFile, createFile, readChar/Line/Word/Token,
  writeChar/String/Return, set/getPosition, setFinderInfo, error, status, version, …).
- **NetLingo** — 20 documented methods (overlap with 006 net API: netDone/netError/netMIME/
  netLastModDate/downloadNetThing/…; delegate to 006 NetState). Plus properties.
- **SpeechXtra** — speech methods (say/stopSpeaking/…).
- **XMLParser** — parse/parseString/child/makeList…; can be REAL for XML strings (KISS: DOM-free
  lightweight regex tokenizer is overkill — decided at clarify, likely real for parse/child via
  DOMParser when available else stub).

## Decisions (confirmed at clarify)

- **D1**: `xtra()` is a top-level api method (`@owner top`, registry entry) →
  `new xtra("fileio")` returns FileioObject; unknown → null.
- **D2 (user directive)**: NetLingo **implements** the net methods — net state
  + logic live on `NetLingoObject` (over the NetState registry as internal
  state); the top-level 006 net api methods **delegate to it**.
- **D3**: full documented surface for all 4; Fileio (no FS) + SpeechXtra (no
  TTS) deterministic stubs; XMLParser minimal real (DOMParser when available);
  NetLingo real where possible (URLEncode, status accessors over NetState).

## Verification

- `scripting-objects.test.js` (8 tests): xtra creation, Fileio/SpeechXtra
  surfaces, XML parsing (incl. malformed), NetLingo net flow through the ctx +
  top-level delegates, context ownership of exactly one NetLingo.
- Gate `pnpm --filter @project-reborn/director test` — 350 green.