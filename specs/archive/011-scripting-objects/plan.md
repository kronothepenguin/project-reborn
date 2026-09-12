# Implementation Plan: 011 — Scripting Objects (Fileio, NetLingo, SpeechXtra, XMLParser)

**Branch**: `011-scripting-objects` | **Date**: 2026-09-10 | **Spec**: [/specs/011-scripting-objects/spec.md](./spec.md)

## Summary

Author the 4 scripting Xtra objects (surface verbatim from
`scripting_objects.txt`), a top-level `xtra(name)` factory (`@owner top`),
and — per the user's 011 clarify directive — **move the net logic + net state
onto the NetLingo object**: the 006 top-level net api methods become one-line
delegates to the active context's NetLingo instance.

## Clarify decisions (confirmed)

- **D1 — `xtra()` is an api method** (`src/api/methods/xtra.js`, `@owner top`,
  in the registry) returning the scripting class for `fileio`/`netlingo`/
  `speechxtra`/`xmlparser` (unknown → null).
- **D2 — NetLingo OWNS the net logic + state**: `NetLingoObject` implements
  getNetText/postNetText/preloadNetThing/downloadNetThing/gotoNetMovie/
  gotoNetPage + the status accessors (netDone/netError/netMIME/netLastModDate/
  netTextResult/netAbort/getStreamStatus/getLatestNetID), over an internal
  `netState` (the NetState registry — now internal to the object). Top-level
  api net methods delegate to `_getNetLingo()` (active context's NetLingo, else
  module default). `_getNetState()` compat reads `netLingo.netState`.
- **D3 — deterministic v1**: Fileio (no FS) + SpeechXtra (no TTS) = full
  documented surface, stub returns; XMLParser minimal real (DOMParser when
  present; `child` is a documented property, not a method).

## Gate

`pnpm --filter @project-reborn/director test` — 342 baseline; must stay green
(the registry audit + net-failsoft tests keep passing through the delegates).

## Out of scope

- Real filesystem/TTS engines; event-driven stream callbacks.
- The `externalEvent()` object form (deterministic no-op; top-level api bridge stays).