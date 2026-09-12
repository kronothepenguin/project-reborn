# Quickstart — Director Runtime (Consolidated 015)

Validation guide for the consolidated contract in [spec.md](./spec.md). Work through
the scenarios in order; each one is runnable and ends with an expected outcome.

**Read the shapes, not this file, for the contract details**:
[data-model.md](./data-model.md) (types, Score, context, definitions) and
[contracts/](./contracts/) (protocol, lifecycle, syntax, elements).

**Status labels**:

- **[verify]** — implemented in `packages/director/src`; run the command and confirm.
- **[gap]** — contract point that the consistency pass (`/speckit.analyze`, R-27) must
  close or reconcile. The numbered gap register lives in
  [data-model.md § Known implementation gaps](./data-model.md#known-implementation-gaps);
  the callouts below cite the ones that affect a scenario's assertions, plus
  observations from this authoring pass.

## Prerequisites

- Node ≥ 20 (the pack generator's documented floor; the workspace currently runs
  Node 24).
- pnpm 10.x (`packageManager: pnpm@10.30.2` in `packages/director/package.json`).
- From the repo root: `pnpm install`.

## Test gate

```bash
pnpm --filter @project-reborn/director test
```

Expected at the consolidation baseline: `Test Files 52 passed (52)`,
`Tests 350 passed (350)`, no pre-existing failures. After the consistency pass the
counts grow; "all green" is the invariant (FR-007, SC-014). The jsdom notice
`Not implemented: HTMLCanvasElement's getContext()` is informational (paint fallback
is the tested path).

Targeted runs in the scenarios below use:

```bash
pnpm --filter @project-reborn/director exec vitest run <path-or-file>
```

---

## 1. Entry-point import audit

**Goal**: three entries import cleanly and expose exactly their categories
(FR-002/FR-006, SC-013).

**Step 1 — jsdom audit [verify]**:

```bash
pnpm --filter @project-reborn/director exec vitest run src/__tests__
```

Expected: `src/__tests__/entry-points.test.js` passes — 5 data-type classes, 5
creators, 11 constants, 7 singletons, 12 syntax stand-ins, spot-checked methods, and
no `defineMovie`/`defineCast`. Current count: 1 file / 11 tests.

**Step 2 — fresh Node process, lingo [verify]**:

```bash
node --input-type=module -e "const m=await import('./packages/director/src/api/index.js'); if(!('the' in m)) throw new Error('the missing'); if('rgb' in m) throw new Error('rgb leaked'); console.log('lingo ok', Object.keys(m).length);"
```

Expected: `lingo ok <n>` with no error; `the` present, `rgb` absent, and importing
`the` does not install it on `globalThis` (R-26/FR-018).

**Step 3 — fresh Node process, root/browser [gap]**:

```bash
node --input-type=module -e "await import('./packages/director/src/index.js'); console.log('root ok');"
```

Current: `ReferenceError: HTMLElement is not defined` — the browser entry evaluates
`class ... extends HTMLElement` at module load and root re-exports it. FR-006
requires fresh-process imports with no import-time side effects; make the entry
DOM-lazy while keeping `registerCustomElements()`.

- **[gap] export surface**: `run` / the imperative handle are not re-exported from
  `@/browser` or the package root (FR-002 includes the imperative runtime; FR-054
  defines `run()` as the entry). Reachable today only via
  `packages/director/src/player/run.js`.
- **[gap] register #18/#19**: `worker-host.js` points consumers at a non-existent
  `@/worker` subpath, and `createContext({ worker: "auto" })` falls through to
  main-thread behavior, so isolation currently exists only on the `run()` path.

---

## 2. Data types and constants

**Goal**: documented surfaces only; clamping, 1-based lists, palette `color()`, R-01
Rect edges, R-10 constants (FR-008–FR-014).

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/base
```

Expected: 7 files / 68 tests pass. Assertions exercised there:

- `color(300, -1, 12.9)` → red 255, green 0, blue 12; `Color` has no
  `hex`/`rgb`/`equals` (FR-009).
- `Rect` exposes only `left/top/right/bottom`; `r[3] - r[1]` works (R-01/FR-012).
- `BACKSPACE === "\b"`, `ENTER === "\x03"`, `RETURN === "\r"`, `VOID === null`,
  `FALSE` behaves as 0 (R-10/FR-014).
- `List.getLast()` on empty is `VOID`; `List.setAt` pads with `0`; `PropList`
  missing `getaProp` is `VOID` (FR-010/FR-011).

**[gap] register #20**: `Color` stores accessor-backed `_red`/`_green`/`_blue` and a
`paletteIndex` getter instead of FR-004's plain public fields; confirm the field
surface after the consistency pass.

---

## 3. Syntax stand-ins and `the`

**Goal**: chained chunks, `put*`, the property table, score-backed rows, no-context
parity (FR-015–FR-020, R-25).

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax
```

Expected: 10 files / 77 tests pass. Assertions exercised there:

- `item(3).of("red,yellow,blue green,orange") === "blue green"`; `item(3).to(5)`
  clamps to `"blue green, orange"`; item reads follow the live `itemDelimiter`
  (FR-015/FR-016).
- `putBefore(word(2).of("fox dog cat"), "elk ") === "fox elk dog cat"` (FR-017).
- Writing a read-only `the` row throws; unknown rows throw; `the.numberOfItemsIn`
  and `the.lastWordIn` work; `the.wordDelimiter`/`lineDelimiter` are absent
  (FR-018/FR-019).
- `the.frame` is `0` before the first advance and `the.frameTempo` defaults to 30;
  with a context they read the live Score (FR-019).
- The 12 export names behave identically with no context (FR-020).

**[gap] register #17**: `the.movieName` reads a proxy-local row that ingest never
writes, so it stays `""` instead of tracking the context (FR-018).

---

## 4. Context, accessor, Score, lifecycle

**Goal**: one context, accessor resolution, score model/navigation, idempotent
destroy, and the ratified per-tick order (FR-021–FR-027, R-04/R-05/R-06).

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/subsystem
```

Expected: 9 files / 69 tests pass. Assertions exercised there:

- Two contexts do not leak state; without a context the default instances resolve
  (FR-022).
- Playhead starts at 0 and the first `advance()` reaches 1; empty-score playback
  still fires frame events (R-05, FR-026).
- `go("marker")`/`goNext`/`goPrevious`/`goLoop` follow the marker fallbacks; unknown
  marker is a no-op (R-06/FR-025).
- `puppetTempo(n)` changes the value the loop reads (R-07).
- `destroy()` twice releases resources once and allows no further events (FR-023).

**[gap] register #1**: R-04/FR-026 require **all** `beginSprite` in ascending channel
order, then **all** `endSprite`, then `exitFrame`; `frameStep()` currently
interleaves the two per channel and `lifecycle.test.js` asserts that interleaved
order, so code and test change together.

**[gap] handler errors**: a lifecycle handler that throws must be posted to the host
and halt the movie (`stopMovie`) with no further ticks (spec Clarifications,
FR-026). The current event loop has no worker-side throw path that posts an error.

**[gap] register #9**: `context.destroy()` fires `stopMovie` once, but
`worker-entry.destroy()` calls `ctx.stopMovie()` and then `ctx.destroy()` (which
fires it again); FR-023/FR-058 require exactly one.

---

## 5. Sprites, puppets, hitTest, constraints

**Goal**: live sprite resolution, puppet register, topmost hitTest, helper-based
constraint clamping (FR-028–FR-032, R-03/R-08/R-09).

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/core/__tests__/sprite-functional.test.js src/engine/core/__tests__/puppet-register.test.js src/engine/core/__tests__/hit-test.test.js src/engine/core/__tests__/movie-score-bridge.test.js
```

Expected: all pass. Assertions exercised there:

- `sprite(n)` hydrates from the current cell, returns `null` for unknown channels,
  and `sprite(0)` is the inert stage sprite (FR-029).
- `puppetSprite(n, TRUE)` preempts the Score; `puppetSprite(n, FALSE)` restores it;
  `makeScriptedSprite`/`removeScriptedSprite` use the register (FR-030).
- `hitTest` returns the topmost visible sprite by `(locZ, channel)` from loc + size,
  else `VOID` (R-08/FR-031).
- `constrainH`/`constrainV` and the `constraint` field clamp `loc` into the
  constrainer's bounds; no `loc` interception (R-09/FR-032).

---

## 6. API methods, owner audit, net fail-soft

**Goal**: one module per method with matching `@owner`, registry equals the file
set, pure/stateful behavior, net errors never throw (FR-043–FR-048, R-15/R-23/R-24).

```bash
pnpm --filter @project-reborn/director exec vitest run src/api/methods
```

Expected: 5 files / 25 tests pass, including the registry audit (every method file
has a matching tag and the registry equals the file set — R-24), pure math/string/
bit/type results, neutral no-context returns, and a rejecting `fetch` that ends
`netDone() === true`, truthy `netError()`, `netTextResult() === ""` (FR-046). HTTP
failures report `"HTTP 404"`-style messages and unknown `netAbort` ids are no-ops
(R-15).

- **[gap] register #3**: `api/methods/externalEvent.js` is a no-op while the working
  worker→host bridge lives in `player/external-event.js`; the worker global installs
  the no-op, so script `externalEvent()` cannot reach the host (FR-063).
- **[gap] register #14**: `halt()` delegates to an empty `PlayerObject.halt()`, so the
  movie is not stopped through the Player (FR-048/R-23).
- **[gap] register #16**: the registry uses an owner category `channel` while FR-043
  names `soundchannel`/`spritechannel`; align categories without changing the
  file-set equality rule.

---

## 7. Member classes and `newMember`

**Goal**: 8 functional classes, 11 stubs (+ legacy `FlashMember`), payload stays on
`MemberObject.payload`, `newMember` mapping/registration (FR-034–FR-038, R-22).

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/core/media src/engine/core/__tests__/new-member.test.js
```

Expected: 2 files / 14 tests pass. Assertions exercised there:

- Exactly the documented fields on the 8 functional classes; `FlashMember` is
  unclassified (FR-035); payload stays on `MemberObject.payload` with no mirroring or
  rendering (FR-037).
- `newMember(#button)`/`newMember("button")` return a `ButtonMember` registered in
  the first empty cast slot when a context is active, unregistered when none;
  unknown types yield a generic member (FR-038).

**[gap] register #10**: `AnimatedGIFMember` and `LinkedMovieMember` are not empty
(the test even labels 12 classes as "11 excluded stubs"), contradicting R-22/FR-036;
the stubs must expose no media-specific behavior.

---

## 8. Scripting objects and `xtra()`

**Goal**: four objects with full documented surfaces; `xtra()` is `@owner top`;
NetLingo owns state and `context.netState === context.netLingo.netState`
(FR-039–FR-042, R-14).

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/core/scripting src/api/methods/__tests__/net-failsoft.test.js
```

Expected: all pass. Assertions exercised there:

- `new xtra("fileio")`/`"netlingo"`/`"speechxtra"`/`"xmlparser"` construct the right
  object; lookup is case-insensitive; unknown names return `null` (FR-040).
- Fileio/SpeechXtra return deterministic stub results; XMLParser parses well-formed
  XML via `DOMParser` with `child` as a property and reports malformed input
  (FR-042).
- A net flow through the context is visible through the top-level delegates, and the
  `netState` alias holds (FR-041).

Note: `NetLingoObject.externalEvent` is a stub per register #3; the top-level bridge
is the contract path (FR-063).

---

## 9. Builders, generator, and generated packs

**Goal**: builder- and generator-produced definitions conform to the frozen C8
shape, generated packs are committed and idempotent, and ingestion builds 73 habbo
slots with name/number lookup (FR-049–FR-053, SC-010).

**Step 1 — builder shape [verify + gap]**:

```bash
pnpm --filter @project-reborn/director exec vitest run src/pack
```

Expected: 1 file / 3 tests pass (frozen plain data, sequential member numbers).

- **[gap] register #7**: `movie().build()` omits `totalCastSlots` and does not pad
  empty cast slots, unlike the generator; FR-049/FR-051 and
  [contracts/pack-definition.md](./contracts/pack-definition.md) expect both.

**Step 2 — ingestion [verify + gap]**:

```bash
pnpm --filter @project-reborn/director exec vitest run src/player/__tests__/ingest.test.js src/player/__tests__/ingest-habbo.test.js
```

Expected: 73 casts built (slots 1–2 populated, 3–73 empty), `member("Logo")` and
`castLib(2)` resolve.

- **[gap] register #12**: `ingestDefinition` performs no `kind`/`name`/`casts`
  validation; FR-053 requires the surfaced `InvalidBundleError` path
  ([contracts/pack-definition.md](./contracts/pack-definition.md) §validation).
- **[gap] register #2**: the legacy `player/cast-loader.js` references statics that
  do not exist; it is unused by `worker-entry.js` but must not survive the pass as a
  contract-shaped path.

**Step 3 — generator idempotence [verify]**:

```bash
node packages/director/scripts/generate-pack.mjs cast packages/client-r26/src/game/fuse_client
node packages/director/scripts/generate-pack.mjs cast packages/client-r26/src/game/habbo
node packages/director/scripts/generate-pack.mjs movie packages/client-r26/src/game/habbo
git diff --exit-code -- packages/client-r26/src/game
```

Expected: `wrote ... (89 members)`, `wrote ... (4 members)`, `wrote ... (73 slots)`,
and an empty diff (regeneration is stable; verified at consolidation). The generated
`index.js` files use inline imports for populated casts and empty entries for the
rest.

**[verify] data note** — the committed `Members.csv` files carry an empty `Filename`
column, so generated member `payload` objects are `{}`. The generator embeds base64
bitmap/script payloads when a filename is present; whether the committed packs must
carry payloads (FR-050/FR-052) depends on that data or a naming rule, which the
consistency pass should settle rather than invent here.

---

## 10. Player `run()` with a mocked worker

**Goal**: worker boot/protocol, tempo loop, rendering fallback, input, audio,
externalEvent, resumable stop and terminal destroy (FR-054–FR-065, R-17–R-21).

```bash
pnpm --filter @project-reborn/director exec vitest run src/player
```

Expected: 10 files / 41 tests pass. Assertions exercised there:

- Boot sequence: `init` carries the bundle URL or definition plus `externalParams`
  (and a transferred `OffscreenCanvas` when the canvas supports it) → worker `ready`
  → `start`; boot order is globals → import → ingest → activate (FR-054–FR-057).
- Loop: each tick calls `frameStep()` and the render hook; `stop` is resumable and
  `destroy` posts `destroy`, terminates, and is idempotent; `goToFrame` and
  `poll-lifecycle` answer (FR-058).
- Rendering: populated channels draw in ascending order with loc/size, empty frames
  clear to `bgColor`, `updateStage` re-renders; jsdom exercises the `paint` message
  path (FR-059).
- Input: key/mouse/focus update `_key`/`_mouse` with stage-scaled, y-flipped,
  clamped coordinates (FR-060).
- Audio: 8 channels each with gain + panner; `play`/`setVolume`/`setPan`/fades; a bad
  decode leaves the channel idle (FR-061, R-21).
- Host-side relays: the handle re-dispatches `gotoNetMovie`/`gotoNetPage`/
  `externalEvent` when a worker message arrives (the tests deliver `detail`
  wrappers).

**[gap] register #4**: real worker posts are **flat**
(`{ kind:"externalEvent", name, args }`, `{ kind:"paint", imageData, ... }`) while
`run.js` reads `e.data.detail?...`, so real `externalEvent`/`paint` payloads arrive
empty; make the wire shape and the handle agree with
[contracts/player-protocol.md](./contracts/player-protocol.md).

**[gap] register #5**: `gotoNetMovie` has no worker-side sender (only the handle
receiver exists), and the method touches `window.location` in the worker and throws
on a missing URL despite R-15; wire the drain to a tagged post.

**[gap] register #8**: only `start()` queues until `ready` (R-19/FR-064 require all
main-thread messages queued and flushed in order); `lifecycle` messages are ignored
and there is no `getLifecycleSnapshot()` (FR-055).

**[gap] register #9**: `stopMovie` double-fires on destroy (FR-023/FR-058) — see
scenario 4.

**[gap] register #11**: the `paint` fallback emits an all-zero frame instead of
drawing the current frame and does not coalesce latest-wins (FR-059).

**[gap] register #13/#14/#15**: `externalParamName`/`externalParamValue` do not read
the frozen snapshot (FR-063); `PlayerObject.halt()` and `MovieObject.updateStage()`
are empty; `SoundObject.channel(n)` builds stub channels instead of reaching the Web
Audio graph.

**[gap] observed in this pass**: `createAudioEngine().play(member)` reads
`member.payload.bytes` while the C8 pack contract carries sound payloads as
`audioBytes` ([contracts/pack-definition.md](./contracts/pack-definition.md));
align the key (FR-050/FR-061).

---

## 11. Custom elements and element ≡ `run()` equivalence

**Goal**: declarative mount, param snapshot, input forwarding, paint drawing,
disconnect teardown, and proof that the element is a thin wrapper (FR-066–FR-070,
SC-012).

```bash
pnpm --filter @project-reborn/director exec vitest run src/browser
```

Expected: 2 files / 8 tests pass. Assertions exercised there (jsdom + mocked
worker):

- `<x-embed>`/`<x-object>` with `src`/`data`, `width`/`height`, optional `tempo`,
  and `<x-param>` children create a sized canvas, snapshot params in order, call
  `run()`, and `start()` after `ready` (FR-066/FR-067).
- Missing `src` is a no-op rather than a crash; plugin-era attributes are ignored
  (FR-066).
- `paint` details are drawn to the element canvas when no `OffscreenCanvas` exists;
  post-connect `<x-param>` changes do not alter the snapshot (FR-068).
- Input events are forwarded with element→stage scaling; disconnect destroys the
  handle; `.handle`/`.movieName`/`.frame` are exposed (FR-069).
- Equivalence: the same movie via the element and via `run()` produces the same
  handle kind, events, and forwarded params (FR-070/SC-012).

**[gap] register #11**: the element draws `paint` but does not re-dispatch it as a
`CustomEvent` on the element; FR-067 requires the relay.

## Full gate

Close with:

```bash
pnpm --filter @project-reborn/director test
```

Expected: the full suite green. Every **[gap]** above is either closed or explicitly
reconciled by the `/speckit.analyze` consistency pass (R-27) before this quickstart
is treated as fully passing.
