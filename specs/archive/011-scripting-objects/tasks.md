# Tasks: 011 — Scripting Objects

**Gate**: `pnpm --filter @project-reborn/director test` (342 green before; 350 after).

- [x] T001 — `scripting/net-lingo.js`: NetLingoObject — net state + logic (getNetText/postNetText/preloadNetThing/downloadNetThing/gotoNetMovie/gotoNetPage + netDone/netError/netMIME/netLastModDate/netTextResult/netAbort/getStreamStatus/getLatestNetID + browserName/cacheSize/clearCache/netStatus/proxyServer/URLEncode/tellStreamStatus/externalEvent) over an internal NetState. (D2)
- [x] T002 — `scripting/fileio.js`: FileioObject (27 documented methods, deterministic stubs).
- [x] T003 — `scripting/speech-xtra.js`: SpeechXtraObject (17 documented methods, deterministic stubs).
- [x] T004 — `scripting/xml-parser.js`: XMLParserObject (count/doneParsing/getError/ignoreWhiteSpace/makeList/makeSubList/parseString/parseURL + attributeName/attributeValue/child/name; minimal real via DOMParser). (D3)
- [x] T005 — `scripting/index.js` barrel + XTRA_CLASSES; export from `engine/core/index.js`.
- [x] T006 — api `xtra(name)` factory (`@owner top` + registry entry + api/index.js export). (D1)
- [x] T007 — `context.js` owns `netLingo` (netState → `netLingo.netState` compat alias).
- [x] T008 — Rewrite 13 api net methods (getNetText/postNetText/preloadNetThing/downloadNetThing/gotoNetMovie/gotoNetPage/netDone/netError/netMIME/netLastModDate/netTextResult/netAbort/getStreamStatus) to delegate to `_getNetLingo()`; singletons `_getNetLingo()`.
- [x] T009 — `scripting-objects.test.js` (8 tests: xtra creation/unknown/case, Fileio/SpeechXtra surface, XML parsing incl. malformed, NetLingo net flow through ctx + top-level delegates, context ownership).
- [x] T010 — quickstart + plan docs.
- [x] T011 — Full gate (350 green) + review before commit.