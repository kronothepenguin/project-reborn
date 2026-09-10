# Tasks: 009 — Browser (custom elements over 008's run())

**Gate**: `pnpm --filter @project-reborn/director test` (288 green before; must stay green).

## Phase A — Handle relay + element rewrite
- [x] T000 — Real-worker bootstrap (user-approved scope). `worker-entry.js`: installGlobals → import(bundleUrl) → ingest → renderer (offscreen|paint) → audio → ready → start/stop/destroy/goToFrame/poll-lifecycle/setTempo + input; `run.js` points its Worker at the entry. Tests: worker-entry.test.js (6).
- [x] T001 — run.js relaying `paint` as `CustomEvent("paint")` (run.test.js).
- [x] T002 — Rewrite `custom-elements/index.js`: `<x-object>`/`<x-embed>` = thin `run()` wrapper (canvas, `<x-param>` snapshot → externalParams, relay externalEvent/error/gotoNetMovie/gotoNetPage/paint, input stage-translated, destroy on disconnect). Deleted `_createMovie`/`_setCanvas`/`loadCast` paths.
- [x] T003 — `registerCustomElements()` idempotent + auto-register; `x-object` aliases `x-embed`; `x-param` declarative-only.
- [x] T004 — Element tests: custom-elements.test.js (6: canvas+init, auto-start+tempo, relay+paint→.frame, input translation, disconnect→destroy, x-object alias).

## Phase B — Equivalence (SC-010)
- [x] T005 — equivalence.test.js (2): element vs `run()` — identical externalParams snapshot + event surface + protocol surface; element is a wrapper.

## Phase C — Docs + review + commit
- [ ] T006 — Update roadmap status table (009 row → in progress/complete).
- [ ] T007 — `specs/009-browser/quickstart.md` (declarative usage + equivalence note).
- [ ] T008 — Full gates + review summary before commit.

<!-- Phase boundary: commit after user review per workflow. -->