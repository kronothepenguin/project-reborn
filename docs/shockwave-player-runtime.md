# Director Shockwave Player Simulator — Build Plan (specs 002–009)

**Goal**: Rebuild the Macromedia Director MX 2004 / Shockwave runtime as a
browser "Shockwave player simulator" in JavaScript. Every `.ls` LingoScript that
was translated to JS (in `apps/client/src/game/`) runs unmodified in the browser.

**Definition**: NOT a reimplementation of Director UI, NOT a binary `.dcr/.dir/
.cct/.cst` player. Everything is translated JavaScript; movies and casts are
folders of JS ("virtual files"). `<x-embed src=".../habbo/index.js">` loads the
bundled movie and plays it, exactly as `<embed src="habbo.dcr">` did with the
Shockwave plugin in 2008.

**Package**: `@project-reborn/director` (`packages/director/`) — the single
workspace package for all layers. Public subpaths: `.` (root), `/lingo` (API
surface → `src/api/index.js`), `/browser` (host integration → `src/browser/index.js`).

---

## Layer taxonomy (current source layout — established in 002)

```text
packages/director/src/
├── index.js                  # root barrel (re-exports api + browser)
├── engine/
│   ├── base/                 # data-types (Color/List/PropList/Point/Rect) + Lingo constants
│   ├── core/                 # 13 core X…Object + 4 scripting X…Object + media/ member classes
│   ├── subsystem/            # DirectorContext + singletons + member-registry/net-state/window-registry
│   │                         #   (+ Score subsystem added in 004)
│   └── syntax/               # chunk expressions (char/item/line/word) + `the` proxy + put-*
├── api/                      # @/lingo public surface: index.js barrel + methods/ (~130 top-level)
├── player/                   # runner: event-loop, worker-host/shims, canvas, cast-loader, mount
├── pack/                     # movie()/cast() builders (pure frozen data definitions)
└── browser/
    ├── index.js              # createContext/destroyContext/resetSingletons + builders + register
    └── custom-elements/      # <x-object>, <x-embed>, <x-param>
```

Your 8 target layers map to the specs as follows (folder = layer; 002–009):

| # | Spec | Layer | Source folder |
|---|------|-------|---------------|
| 002 | engine-base | Engine (base) | `src/engine/base/` |
| 003 | engine-core | Engine (core) | `src/engine/core/` |
| 004 | engine-subsystem | Engine (subsystem: glue + state) + Score | `src/engine/subsystem/` |
| 005 | engine-syntax | Engine (syntax) | `src/engine/syntax/` |
| 006 | api | API (global methods + internal state refs) | `src/api/` |
| 007 | pack | Packaging / Pack (virtual files) | `src/pack/` + game folders |
| 008 | player | Player (runner, worker, rendering, media/net) | `src/player/` |
| 009 | browser | Browser (custom elements) | `src/browser/` |

---

## Cross-cutting conventions (apply to every spec)

- **No `#` private** on documented members; **no `static`** members; **one class
  per module**; **verbatim JSDoc** quoted from `docs/drmx2004_scripting_ref/`
  (methods.txt / properties.txt / essentials); no fabricated behavior (package
  AGENTS.md rules 1–8; FR-013/014).
- **Red-green tests** (vitest + jsdom, no custom shims): write tests → observe
  FAIL → implement → green. Gate: `pnpm --filter @project-reborn/director test`.
- **Spec-driven**: every feature flows through speckit: `/speckit.specify` →
  `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`,
  artifacts under `specs/<NNN-name>/`, `.specify/feature.json` updated per active
  feature.
- **Review-before-commit**: after each spec's `tasks` step (and implementation),
  the user is shown a summary to VERIFY before any commit lands.
- LP-sized specs **may split during planning** (speckit rule). Natural seams
  noted per spec below; splits become new sequential feature numbers.
- Constitution v2.0.0 is the governing charter (Defined-Before-Built, No Silent
  Interpretation, KISS/YAGNI/SOLID, Test Discipline). `specs/001-director-runtime/`
  stays as historical reference; where these specs supersede its decisions, that
  is recorded in each spec (001 has no spearate deprecation step — speckit leaves
  specs in place).

---

## Spec-by-spec detail

Each entry records: status, priority, scope, size, what already exists (to reuse),
key decisions already agreed, open items for clarify, supersedes-from-001,
dependencies.

---

### 002 — engine-base (DONE ✔ — committed `f67f8b4f`)

- **Scope**: five data-types (Color/List/PropList/Point/Rect) + 11 Lingo constants +
  package stabilization (broken imports) + test cleanup (132 stale tests, shims).
- **Status**: complete. 7 test files / 73 tests green; empty-tree layout in place;
  `@/lingo` exports classes + creators (amendment: `color()` RGB-only, palette→006).
- **Supersedes 001**: experts the creators into 002 (were 006); layer taxonomy.

---

### 005 — engine-syntax

- **Priority**: P1 foundation (pure, independent; unblocks `the`-backed scripts).
- **Scope**: chunk-expression stand-ins — `char`, `item`, `line`, `word` (+
  `…Range` variants) — and the `the` proxy, plus `putInto`/`putBefore`/`putAfter`.
  These are the Lingo `.char[]`/`.item[]`/`of`/`the` constructs the translation
  maps to function calls.
- **Size**: M.
- **Reuses**: `src/engine/syntax/` already implemented (char/item/line/word/
  put-*/the-proxy), imports repaired in 002, exported from `@/lingo`. Port +
  write real tests (tests were deleted). `the-proxy` already reads the singleton
  slots and installs `globalThis.the`.
- **Key decisions already agreed**: translated code calls `char(n).of(str)`,
  `char(n).to(m).of(str)`, `item(...)`, `the.frame` etc. (see the
  `lingoscript-to-javascript` skill mapping tables — char/item/line/word/put and
  `the.camelCase` translation rules are the contract source).
- **Size seam if it splits**: chunk-helpers vs `the`-proxy (M each).
- **Open for clarify**: the full `the`-property list to expose in v1 and which
  read/write/read-only per docs; out-of-range chunk behavior (`char 0`,
  `char 99 of "hi"`, empty string); how `the` resolves properties that belong to
  Score/stage (deferred behavior to 004 — proxy surface defined now, stage-backed
  values wired when 004 lands).
- **Supersedes 001**: none significant (001 listed syntax surface).
- **Depends on**: 002 (done). 004 only for score-backed `the` values (landed in 004).

---

### 004 — engine-subsystem (+ Score)

- **Priority**: P1 — the glue that makes core objects (003), API (006), and the
  player (008) valid.
- **Scope**: `DirectorContext` (owns per-movie singletons + subsystems +
  audioContext + canvas + loop handle + externalParams; extends EventTarget;
  `activate()` installs into worker `globalThis` slots AND the singletons module
  live-bindings), singleton live-binding slots (`_movie`…`_global`), and the
  shared subsystems: `member-registry`, `net-state`, `window-registry` — **plus
  the new Score subsystem** (the runtime's playhead/channel/rendering data model).
- **Size**: M.
- **Reuses**: `src/engine/subsystem/` already implemented (context, singletons,
  3 registries); imports repaired in 002; tests deleted → rewritten per-spec.
- **Score decision (the crux)**: the Score is part of the `.dcr` movie data and
  IS implicit in the Shockwave player (playback head advances through frames;
  48 sprite channels per frame; each cell = cast member + placement). So the
  runtime implements **full Score playback semantics**: frames × 48 channels,
  playhead, tempo, frame navigation (`go`/`goLoop`/`goNext`/`goPrevious`),
  `beginSprite`/`endSprite`, `sprite(0)` = stage, `the.frame`, `updateStage`.
  **But**: our decompiled folders contain NO score data (it lives only in the
  `.dcr` binary; ProjectorRays cannot emit it). Therefore:
  - 004 models the Score data structure; playback runs even with an empty score
    (Lingo-driven stage, `newInstance` placement, `puppetTempo`).
  - 007's pack schema gets an **optional `score` section**, specified as a
    contract the user verifies/derives by opening a `.cst` in Macromedia Director
    when 004/007 planning reaches it.
- **Lifecycle (from 001 research R7, kept)**: `prepareMovie` → `startMovie` →
  per tick `prepareFrame → enterFrame → (beginSprite → endSprite) → exitFrame`
  → `stopMovie` on destroy; `on idle` / `on timeout`. Score-independent (runs
  with empty sprite data).
- **Open for clarify**: exact score data-model shape (to be verified against
  Director), frame/channel representation, temporal semantics (tempo, frame-duration),
  how begin/endSprite fire against live `Sprite` objects (wired with 003), and
  whether `puppetSprite`/`puppetTempo` surface as methods on Movie/player.
- **Supersedes 001**: FR-031 (Score stubbed in 001) — Score is now real; the
  sprite shells in 003 become functional via this subsystem.
- **Depends on**: 002 (done).

---

### 006 — api

- **Priority**: P1 — the full top-level Lingo method surface + 7 singletons every
  translated script calls (`go`, `beep`, `postNetText`, `member()`, `netDone()`,
  `castLib()`, `halt`, `propList()`, …).
- **Scope**: ~130 documented top-level methods (one file each in `src/api/methods/`;
  108 files exist) + the 7 singletons (`_movie` `_player` `_sound` `_key` `_mouse`
  `_system` `_global`) bound as live slots to the active context. **Per-method
  "depends-on-active-context" tagging**: each method is classified as pure (no
  player state), or stateful (reads/writes `_movie`/`_sound`/`_player`/`_global`
  or `member()`/`castLib()`/net) — this is the documented boundary between the
  API layer and the player's superset state management (008 keeps the context
  valid; API just reads it through the singletons). **No extra store
  abstraction** (decided).
- **Size**: L — candidate to split (`methods/` group by category: math+string /
  movie+player / sound+media / net / members+castLib / object+list / xtra).
- **Reuses**: 108 method files exist with real bodies (net ops = real `fetch` +
  `AbortController` + NetState; system/key/mouse read-only fields); all imports
  repaired in 002. Tests deleted → rewritten (per-method + state-tagging audit).
- **Boundaries already decided**: creators `color()/list()/point()/propList()/rect()`
  now come from `engine/base` (002 amendment); 006 reconciles or retires the 5
  dormant `src/api/methods/` creator modules and implements the **palette form of
  `color()`**; `symbol()/value()/ilk()` type-relationship work lands here;
  `rgb()` must stay absent.
- **Open for clarify**: the authoritative method inventory (docs methods.txt vs
  the 108 files — what's missing/extra), the state-tagging classification for the
  ambiguous ones, net-op no-network behaviors under vitest, error/throw vs
  no-op conventions per method (docs "script error").
- **Supersedes 001**: FR-013/015/016 (export set + singletons) — reconciled to the
  creators-in-002 decision.
- **Depends on**: 002, 004 (context state), 005 (syntax used by some methods).

---

### 008 — player

- **Priority**: P1 — the runner. This is where the movie actually plays.
- **Scope**: Web-Worker runner.
  - **Loading (decided)**: main thread reads `<x-param>`s (`sw1..sw9`), transfers
    the `OffscreenCanvas`, spawns the worker with the **bundle URL**; the worker
    **imports the bundle itself** (`import(url)` inside the worker — default
    export = the movie definition; JS classes stay in-realm; no postMessage of
    definitions). One worker per `<x-embed>` (decided).
  - **Globals**: install the API + singletons on worker `globalThis` BEFORE the
    bundle import (translated scripts read `_movie`, `the`, `_key`, … as globals).
  - **Event loop**: tempo-driven per tick; lifecycle dispatch per 004.
  - **Rendering (in scope now — decides)**: per-frame Score rendering — iterate
    the frame's channels in channel order (z-order), apply sprite placement
    (loc, size, rotation, ink, blend), draw cast-member media (PNG via
    `createImageBitmap` on base64 data), `updateStage` semantics. Worker owns
    the canvas pixels via `OffscreenCanvas`; fallback (no OffscreenCanvas) =
    worker posts ImageData/commands, main thread paints.
  - **Input**: forwarded from the element as messages → feeds `_key`/`_mouse`;
    coordinates translated to stage space; `sprite(n).hitTest` via 003.
  - **Media/audio**: Web Audio inside worker — 8 `SoundChannel`s, gain/pan chains,
    `decodeAudioData` on inline bytes.
  - **Net**: net-* fully via `fetch`; `gotoNetMovie`/`gotoNetPage` relayed to main.
  - **externalEvent**: worker→main tagged message → DOM `CustomEvent`.
- **Size**: L — candidate to split: runner-core (worker bootstrap+event loop+
  lifecycle) / score-rendering / media-net-audio.
- **Reuses**: `src/player/` (worker-host scaffold, event-loop, canvas, worker-shim,
  cast-loader, script-lifecycle, mount); imports repaired in 002.
- **Open for clarify**: main↔worker message protocol (keep 001's table as a base),
  lifecycle polling vs push, audio depth for v1 (all 8 channels now, or subset),
  OffscreenCanvas fallback scope, sprite-rendering fidelity level (flat 2D draw vs
  ink/rotation — docs define the sprite props; rendering approach decided at plan).
- **Supersedes 001**: FR-026 (bundle = single static module — kept, now produced
  by Vite + 007 packs), FR-020/029/030 (canvas handoff + input), FR-032 (inline
  media — kept, PNG base64), FR-033/034/035 (net/audio/externalEvent).
- **Depends on**: 002, 004 (context+Score), 005 (`the` proxy used by scripts),
  006 (methods), 007 (movie pack shape), 003 (objects referenced by scenes).

---

### 007 — pack

- **Priority**: P1 — the virtual-file model + the actual habbo movie/cast packs.
- **Scope**:
  - **Virtual files (decided)**: `habbo/index.js` ↔ `habbo.dcr`; per-cast
    `fuse_client/index.js` ↔ `fuse_client.cst`. `index.js` is the Vite-bundled
    module; default export = the movie/cast **definition** (pure data: members,
    media, optional score). Vite turns script imports + PNG imports into a single
    inline bundle, so **PNGs become base64 inline data** (no runtime fetch of
    siblings).
  - **Identity (decided)**: cast member **name + type are canonical**; `number`
    is implicit in registration order (CSV row order preserved) and kept as
    metadata only. `Members.csv` (`Number,Type,Name,Registration Point,Filename`)
    and `Casts.csv` (`Number,Name,Filename`) are the generators' input.
  - **Movie ↔ cast wiring (decided)**: the movie pack declares its castLibs
    table (slot#, name, optional cast-file ref — `Casts.csv` slot 2 →
    `fuse_client.cst`); each cast pack registers its own members. Empty slots
    (70 of 73 in habbo) are filled by the movie pack as empty casts. `fileName`/
    `castLib(n)` naming resolution is the player's job (008), against
    already-in-memory casts — no on-demand fetch.
  - **Builders**: `movie(name).cast(...).tempo(...).build()` and
    `cast(name).member(...)...build()` already exist (`src/pack/`) and produce
    frozen definitions; this spec aligns them with the folder/CSV model + the
    optional `score` section.
  - **The `director-cast-to-javascript` skill becomes real**: it is currently a
    placeholder; 007 defines what it generates — per-cast `index.js` from
    `Members.csv`, movie `index.js` from `Casts.csv` aggregating the cast modules.
    Then generate packs for the 63 cast folders under `apps/client/src/game/`
    (habbo first: Internal members + fuse_client + empty slots).
- **Size**: M (generation spec + generated output is large but mechanical).
- **Open for clarify**: exact pack schema (scope of the skill's generated code vs
  hand-authored movie script), score-section shape (in 004-derived contract, to
  be verified in Director), PNG import pattern, and how many casts to generate in
  this spec vs incrementally.
- **Supersedes 001**: US6/FR-017/018 (builder DSL only → folder+CSV model).
- **Depends on**: 002; 004 (score contract); verified against 008 (player must
  consume the shape — plan 007 and 008 together for the definition contract).

---

### 009 — browser

- **Priority**: P2 (thin; last because it needs 008).
- **Scope**: `<x-object>`, `<x-embed>`, `<x-param>` custom elements — the
  replacement for HTML4 `<object>`/`<param>`/`<embed>` + NPAPI.
  `<x-embed src=".../habbo/index.js">` → reads params (`sw1..sw9` via `<x-param>`),
  inserts canvas + `transferControlToOffscreen`, collects param snapshot, calls
  the imperative `run()` (008), re-dispatches `externalEvent` as DOM `CustomEvent`,
  forwards input (key/mouse → messages, coords → stage space). `disconnectedCallback`
  → destroy. **element ≡ imperative handle equivalence** (asserted).
- **Size**: S.
- **Reuses**: `src/browser/custom-elements/` (exists, imports repaired);
  `createContext`/`destroyContext` in `src/browser/index.js`.
- **Open for clarify**: attribute/child surface (src/data, width/height defaults
  640×480, tempo), `enabled`-style params, stale-param-snapshot handling,
  main-thread paint fallback path for canvas.
- **Supersedes 001**: US8/FR-029/030 (element surface), SC-010 equivalence.
- **Depends on**: 008, 007.

---

### 003 — engine-core

- **Priority**: P1 surface, P2 behavior-depth; placed LATE because its realism
  (Sprite/SpriteChannel functional) depends on 004's Score and it is the largest
  pure-surface pass.
- **Scope**: 13 core objects — `CastLibrary`, `Global`, `Key`, `Member`, `Movie`,
  `Mouse`, `Player`, `Sound`, `SoundChannel`, `Sprite`, `SpriteChannel`, `System`,
  `Window`; 4 scripting objects — `Fileio`, `NetLingo`, `SpeechXtra`, `XMLParser`;
  19 member media classes — 8 included (real bodies: Bitmap, Button, ColorPalette,
  Cursor, Field, Font, Sound, Text) + 11 excluded stubs (AnimatedGIF, DVD,
  FilmLoop, FlashComponent, LinkedMovie, QuickTime, RealMedia, Shockwave3D,
  ShockwaveAudio, VectorShape, WindowsMedia).
- **Size**: L — candidate to split: core-objects (13) / scripting-objects (4) /
  member-classes (19).
- **Reuses**: `src/engine/core/` already carries the full documented *surface*
  (plain fields + verbatim JSDoc, method bodies stubbed); 001's T023–T038 did
  surface work on player/sound-channel/sprite-channel/sprite/window. Media
  classes: bitmap/field/text have real bodies, 11 are tiny stubs.
- **Key decisions**: Sprite/SpriteChannel are **functional** (not 001's shells) —
  wired to 004's Score (`sprite(n)`, `puppetSprite`, `beginSprite/endSprite`,
  `hitTest`, `the.frame`-driven `go`); `Window.openMovie`/MIAW stay stubbed
  (documented no-op); member media classes expose their **PNG data** (no
  rendering — rendering is 008's job).
- **Open for clarify**: member-class data shape (how a BitmapMember holds decoded
  image data consumed by 008; Field/Text text storage), `Member.member` lookup via
  the MemberRegistry, and which scripting-object methods get real behavior.
- **Supersedes 001**: FR-007/010 (Sprite/SpriteChannel functional vs shells).
- **Depends on**: 002, 004 (Score + MemberRegistry), 005 (chunk ops used by
  Field/Text members).

---

## Dependencies & execution order

```
002 engine-base ──► 005 engine-syntax ──► 004 engine-subsystem(+Score)
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
                 006 api               008 player ──► 007 pack ──► 009 browser
                     │                        │   (definition contract
                     └────────────────────────┘    planned with 008)
                                             ▼
                                         003 engine-core (wires Sprite→Score; placed last)
```

Rationale: 002 proves the package and types. 005 syntax is fast and independent.
004 gives the Score + state glue. 006 is the full method surface on that context.
008 (player) and 007 (pack) are co-planned so the movie-definition contract is
stable; 008 consumes, 007 produces. 009 closes the DOM loop. 003 finishes last —
it depends on 004's Score (functional sprites), 006 (methods it routes), and 005
chunk ops.

## Workflow / verification protocol (per the user's requirement)

1. For each spec in order: `/speckit.specify` → `/speckit.clarify` →
   `/speckit.plan` → `/speckit.tasks` (artifacts in `specs/<NNN-name>/`,
   `.specify/feature.json` updated). Subagents research/draft to keep the main
   context clean; the user is asked anything ambiguous (No Silent Interpretation).
2. **Before any commit** (docs or code), the user is shown a **summary** of what
   will be committed and a go/no-go. Commits happen only after user verification.
3. Implementation per tasks.md: red-green, `pnpm --filter @project-reborn/director
   test` as gate, commit per task/logical group (still after user-aware check at
   each phase boundary / at least before pushing).
4. LP-specs that split during planning (003, 006, 008) spawn new sequential
   feature numbers and re-run the pipeline per split.
5. `specs/001-director-runtime/` remains untouched as reference; each new spec
   records which 001 FRs it supersedes.

## Status

| # | Spec | Status | Notes |
|---|------|--------|-------|
| 002 | engine-base | ✅ complete (`f67f8b4f`) | 73 tests green |
| 005 | engine-syntax | ⬜ next | port + tests |
| 004 | engine-subsystem + Score | ⬜ | Score model to verify in Director |
| 006 | api | ⬜ | state-tagging audit |
| 008 | player | ⬜ | co-plan definition with 007 |
| 007 | pack | ⬜ | virtual files + generator skill |
| 009 | browser | ⬜ | thin layer over 008 |
| 003 | engine-core | ⬜ | largest; functional sprites |
```
