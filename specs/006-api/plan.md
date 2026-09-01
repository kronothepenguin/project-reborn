# Implementation Plan: 006 — API (Method Surface × Active-Context Ownership + Palette + value() Eval + Singleton Retirement)

**Branch**: `006-api` | **Date**: 2026-09-01 | **Spec**: [/specs/006-api/spec.md](./spec.md)

**Input**: Feature spec 006 (C1–C8 resolved), master roadmap `docs/shockwave-player-runtime.md` §006, `director_core_objects.txt` (authoritative owner table), `methods.txt` + `properties.txt` (per-method doc semantics), current `packages/director/src/{api,engine}/*`.

## Summary

Build the engine-api layer: (1) **audit the 108-method set** against `methods.txt` — verify each implemented method matches its documented semantics, recreate any that don't (C1 "delete and recreate it" per the user); (2) **owner-based state tags** via `director_core_objects.txt` (C2) — registry `{name → owner}` where owner ∈ `{movie, player, sound, key, mouse, system, global, member, window, top, net}`; (3) **route stateful methods through the active `DirectorContext`** — retiling C8 (singletons = bad idea; state is the core-object consts on the context); (4) **full palette support for `color()`** (C5) + creators as the api-methods layer with barrel flip (C6); (5) **expression evaluation for `value()`** (C7); (6) `symbol()/ilk()/*P` type introspection; rewrite deleted per-method tests red-green.

**Constitutional check** (I. Defined-Before-Built / II. No Silent Interpretation / III. Spec-Driven / IV. Test Discipline / V. KISS / VI. YAGNI): all behaviors defined by spec 006 C1–C8 or this plan's R1–R7 below; the two plan-level interpretations beyond the spec text — (R5) the proxy's `SINGLETONS` map resolves through a single `getActiveDirectorContext()` (the "retire singletons" user directive) and (R6) the palette built-ins table — are recorded plan decisions shown in the review summary, not silent guesses.

## Technical Context

**Language/Version**: JavaScript, ES modules; Node ≥ 20; zero runtime deps; vitest ^4.1.8 + jsdom ^29.1.1.
**Testing**: gate `pnpm --filter @project-reborn/director test`, jsdom env, services external.

**Constraints**:
- **No `#` private fields / no static members** (package AGENTS.md); plain underscore-prefixed fields.
- **`director_core_objects.txt` is the ground truth for owner** (C2) — not a heuristic.
- **The 7 core-object instances are consts ON DirectorContext** (C8). The module-level mutable slot mechanism in `engine/subsystem/singletons.js` (`export let _ovie` rewritten by `_installSingletons`, `_resetSingletons`) is **retired**. API methods, the `the` proxy, and browser layer resolve the active context via ONE accessor: `getActiveDirectorContext()` (new tiny module, no globalThis installs, no mutable module-level bindings). `_installSingletonsOnGlobal` (globalThis slots) — retired alongside.
- **Methods must match docs** (C1): if an implemented method file is wrong per docs, delete + recreate (not patch over).
- **Net ops fail-soft** (C3) — never throw; completes Error, `netDone()`=true, `netError()`=truthy, `netTextResult()`="".
- **`rgb()` stays absent**; **creators live in `.methods/`** (C6), barrel flips to re-export from `.methods/`; base classes stay in engine/base.
- **`value()` = expression evaluation** (C7) — not parseFloat-only.
- **Color palette = full** (C5): single-int = palette index (0–255 truncate), RGB clamped via base; built-in palettes by symbol (#systemMac/#rainbow/…) + paletteRef semantics.

**Scale/Scope**: ~108 existing method files audited & tagged (every file touched for the tag header even if unchanged); 5 creator files stay as the method layer (bodies change); 1 new registry file `api/methods/registry.js`; 1 new accessor module (replaces singletons); `api/index.js` barrel flips (singletons→accessor, creators→methods); `engine/base/color.js` (palette form) ; `engine/subsystem/{context,singletons}.js` (context consts stay; singletons retired); `engine/syntax/the-proxy.js` (singletons→accessor; SINGLETONS map vs active ctx); `engine/core/*` untouched except where a method delegates to a core object field that 003 owns (delegate stays). ~12–15 test files (audit, per-method groups, palette, value, singletons-retirement, proxy-wiring).

## R decisions (research/design, all user-shown)

- **R1 — Owner table build**: parse `director_core_objects.txt` Method-summary sections into a owner map. Free functions not in any core-object section → `"top"` (pure). Registry ops → `"net"`. Member.castLibSprite.SpriteChannel.Window objects → `"member"`/`"castLib"`/`"sprite"`/`"channel"`/`"window"`. Tag header in every file: `// @owner <owner>` + audit test asserts registry == file set, each file has the header, and the header matches the registry.
- **R2 — active context accessor**: new `src/engine/subsystem/accessor.js`: `getActiveDirectorContext()` returns the last-activated context (a module-level `let` — single binding, NOT per-singleton rebiding; the user's "consts declared in the context" stays: the object consts are on the context, the accessor just points at which context is active). `setActiveDirectorContext(ctx)` called by `DirectorContext.activate()`. Methods do `const ctx = getActiveDirectorContext(); if (!ctx) return neutral;`. No globalThis installs.
- **R3 — retirement surface**: delete `singletons.js` mutable exports; keep 7 names imported by 005 tests valid via a compat shim? NO — retire cleanly: `api/index.js` changes `_ovie`/`_ayer`/… exports to re-export from the accessor's active-context getters (which return `ctx.movie` etc.); `the`-proxy imports flip to the accessor; `browser/index.js` + the 004/005 tests that import `_installSingletons/_resetSingletons/_ovie` get rewritten to bind the context instance directly (the context consts ARE the state — a test creates `new DirectorContext()`, reads `.movie`/`.score`). `_score` internal slot stays (004; score-slot.js) — not a singleton.
- **R4 — method corrections (C1)**: audit each of the 108; document files to delete+recreate (e.g. `color.js` single-arg gray → palette regex; `value.js` → expression engine; any whose body diverges from docs). List produced during Phase 0 audit, committed as `research.md` table.
- **R5 — the-proxy**: `SINGLETONS` map replaced by `ctx = getActiveDirectorContext()`, resolve `row.owner` → `ctx[owner]` when owner ∈ core-object names, else fall back to the default no-context objects (constructed fresh per read or a module default — KISS: build the 7 default instances once at module scope so no-context reads still work; the user's "consts in the context" is satisfied because the LIVE objects live on the ctx; the defaults are not mutable bindings). Core-row reads/writes go through the ctx instance when present.
- **R6 — palette builtins**: engine/base/color.js gains: `class Color { red green blue paletteIndex; }` + `PALETTES` (Web-safe 216 + grayscale, this is the default runtime palette) keyed by symbol (`#systemMac`, `#systemWin`, `#rainbow`, `#grayscale`…) → arrays of 256 [r,g,b]; `color(i)` single-int → index into the active palette (default = the built-in) → `{paletteIndex:i, red/green/blue:pal[i]}`; `color(r,g,b)` → RGB; `paletteRef`-style symbol keys resolve in `PALETTES`; `paletteMissing` → the "no palette" neutral. Real cast-member palettes + per-movie palette objects → 008. `rgb()` NOT added.
- **R7 — expression evaluation (C7)**: `value(string)`: try parse as (in order, per docs Lingo expressions): literal number / unary ± / the constants (TRUE/FALSE/VOID/EMPTY) / chained math `+ - * /` on plain-number operands (docs claim `value("3+4")` → 7) / bracketed list strings ("[cat, dog]" → live list) / symbol strings ("#sym") / a quoted string → the string / initial-token parse: on any syntax error return the leading parsable portion ("3 5" → 3; "penny" → VOID). Safeguard: NO eval()-based execution — a tiny recursive-descent arithmetic+list parser on plain data (no handler invocation; docs warn value() can run handlers — we do NOT run handlers in 006, documented deviation: no user-handler execution, listed in spec edge cases as out-of-scope).
- **R8 — owner→neutral map**: neutral per owner (no ctx): movie→null/0/"", player→null, sound→null, key→false/0/""(no conv), system→null, global→undefined, net→false/""(no conv), member/castLib→null, top→N/A(always works). Mirrors the docs' "no context" no-op behavior.
- **R9 — net registry + module-global timers → subsystem (user direction 2026-09-01)**: the network transaction registry belongs in the **engine/subsystem `NetState`** (context-owned, 004), NOT as `api/methods/_netRegistry.js` module-global. Extend `NetState` (lastId, findByUrl, errorString, hasFinished, bytes*, url/localFile, get(id)); rewrite the 13 net method files to route through `_getNetState()` (active ctx's netState, else module-default); **delete `_netRegistry.js`**. Also move `lastClick.js`/`lastEvent.js` module-global timers → read `PlayerObject.lastClick/.lastEvent` fields (already the docs' Player property home; core owns them).

## Phase 0 — Method audit & owner table (research, no code)

0.1. Build the inventory diff: `director_core_objects.txt` Method summaries → owner map; `methods.txt` top-level callables → method set; `src/api/methods/*.js` → existing set; diff → missing/extra/wrong.
0.2. Per existing file: body vs docs check → flag WRONG (delete+recreate list).
0.3. Commit `research.md` (inventory table + wrong list + owner map).

## Phase 1 — Accessor + retirement (T0x)

- Create `engine/subsystem/accessor.js` (get/set active context).
- Retire `singletons.js` mutable exports; api barrel re-exports `_ovie` etc. from accessor; the-proxy uses accessor; browser/index.js rewrite.
- Rewrite 004/005 tests (context/singletons/movie-bridge/the-wiring) to the new shape.
- Gate: green (209 existing tests still pass, minus rewrites).

## Phase 2 — Method corrections (T1x)

- Whatever R4 flagged WRONG → delete + recreate (docs-verbatim bodies, owner header, fail-soft/no-op conventions per C3/C4).
- value() expression engine (R7), symbol()/ilk()/type-predicates (006 US5).
- Gate.

## Phase 3 — Palette + creators (T2x)

- engine/base/color.js palette form + PALETES table (R6).
- 5 creator method files (color/list/point/propList/rect) as the method layer over base; barrel flips to re-export from `.methods/`.
- rgb stays absent.
- Gate.

## Phase 4 — Ownership registry + tag audit (T3x)

- Add `api/methods/registry.js` (owner map + file-set check).
- R1 header + audit test. new per-method tests grouped by owner for delegation.

## Phase 5 — Net fail-soft + no-context neutrals (T4x)

- net ops C3 (catch fetch reject → Error state); no-context neutrals per R8; tests.

## Phase 6 — Docs + review

- roadmap status (006 done or in-progress), quickstart, table; review summary; commit workflow.

**Verification**: `pnpm --filter @project-reborn/director test` = the gate; also `pnpm --filter @project-reborn/director build` if present; `go vet`-style n/a (JS). Full suite must stay green after each phase.

**Dependencies**: engine/subsystem/context.js (consts exist); engine/core/* (fields 003 owns — method deegation stays); engine/base/color.js (palette form); api/index.js (barrel flips).

**Out of scope (008)**: worker runner, real browser fetch, event-loop scheduling, sprite rendering bodies (003), real cast-member palettes (008), user-handler execution inside value() (R7).