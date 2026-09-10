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

## Decisions pending at clarify

- Minimal real (user decision from 003): full documented surface + deterministic v1 returns;
  Fileio no-ops documented (worker has no FS); NetLingo delegates to NetState.
- `new xtra("type")` factory — do we implement `xtra()` in api (006 owner) or a constructor
  helper exported from engine/core? Resolve at clarify.

## Verification

- New `scripting-objects.test.js` — creation via documented form, documented returns, NetLingo
  delegation where applicable; gate green (303+).