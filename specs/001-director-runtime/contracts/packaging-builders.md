# Contract: Packaging Builders (FR-017/FR-018/FR-026/FR-032)

The packaging DSL lives in `runtime/package/` and is exported from `@/browser` (FR-022). It produces **pure, frozen, plain-object movie/cast/member definitions** (never live Director core objects). A movie definition is the `default` export of a bundle ES module loaded inside the worker via dynamic `import()` (FR-026).

## Design principles (YAGNI / KISS)

- **No premature abstraction**: each builder method constructs its member definition inline — no factory functions, no shared `applyCommon()` helpers, no indirection layers.
- **Code lives in the method body**: builder methods don't delegate to external files or helper functions. The plain-object construction happens directly in the `.bitmap(name, opts) { … }` / `.field(name, opts) { … }` method.
- **Builders produce data only**: `.build()` returns a frozen plain object — never a live Director core object. Runtime ingestion (cast-loader in the worker) is a separate concern.
- **No `defineMovie`/`defineCast` convenience layers**: the builder chain IS the API. No lookup tables, no re-dispatchers.
- **Two files only**: `movie.js` and `cast.js`. No `member-factories.js`, no `define-*.js`.

## Builder shape

### `movie(name: string): MovieBuilder`
- `.cast(castDefinition: CastDefinition): MovieBuilder` — append a cast; ordered (order is Movie.castLib order).
- `.dimension(width: number, height: number): MovieBuilder` — stage size (default 640×480).
- `.tempo(fps: number): MovieBuilder` — frames per second (default 30, ≥1).
- `.build(): MovieDefinition` — returns frozen `MovieDefinition` (`Object.freeze`).

### `cast(name: string): CastBuilder`
- Per-type member-registration helpers (name-first; payload optional/required per type). All register in order; **member numbers auto-assigned 1-indexed sequentially by registration order, gaps compacted** (FR-017). The `.number` field on each `MemberDefinition` is set by `.build()`, NOT authored.
- Included types (full payloads — per docs):
  - `.bitmap(name, { pixels, ... })`
  - `.button(name, { ... })`
  - `.colorPalette(name, { colors })`
  - `.cursor(name, { glyph })`
  - `.field(name, { text })`
  - `.font(name, { glyphs })`
  - `.sound(name, { audioBytes })` — `audioBytes` typed array; decoded by `SoundMember` via `AudioContext.decodeAudioData` (FR-034/FR-032)
  - `.text(name, { text, ... })`
  - `.movieScript(name, { content })` — script member; `content` is already-translated JS (translation itself is out of scope per FR-024)
- Generic fallback (covers all 19 documented media types, including the 11 excluded ones as stubs):
  - `.member(name, { type: string, payload?: * })` — `type` is one of the 19 documented media types (FR-011/FR-012). Excluded types ignore `payload`.
- `.build(): CastDefinition` — returns frozen `CastDefinition`.

### Field shapes (built objects; full table in [data-model.md](../data-model.md))
- `MovieDefinition`: `{ kind:"movie", name, source?, width, height, tempo, casts: CastDefinition[] }`
- `CastDefinition`:  `{ kind:"cast", name, members: MemberDefinition[] }`
- `MemberDefinition`: `{ kind:"member", name, number (auto), mediaType, payload? }`

### Immutability
- All `.build()` outputs are deep-frozen (`Object.freeze` recursively over the definition and its arrays/payload typed-arrays are pass-through — typed arrays are not frozen as they're view-backed but are sole-owner of the bundle).
- Mutation only happens during the build phase (spec assumption).

## Bundle contract (FR-026)
A bundle is an ES module:
```js
import { movie, cast } from "@project-reborn/director/browser";

export default movie("habbo")
  .cast(cast("Internal").field("Intro", { text: "Welcome" }).build())
  .tempo(30)
  .build();
```
- The runtime loader (inside the worker) calls `await import(bundleUrl)` and reads `.default`.
- `bundleUrl` is the ES module URL on the host (origin/page URL) — loaded ONLY by dynamic `import()` (FR-026). No `fetch()`+`eval`, no `import-map`, no in-memory manifest.
- Validation: `bundle.default` MUST be a `MovieDefinition` (`kind === "movie"` && non-empty `name` && non-empty `casts[]` of `CastDefinition`s). On invalid → `InvalidBundleError` raised in the worker; the imperative handle reports it.

## Inline media payload (FR-032)
- Member payloads (`pixels`, `audioBytes`, `text`, `colors`, `glyph`, `glyphs`, `content`) MUST be **inline typed arrays/strings**, NOT URLs.
- The worker decodes them in-memory via JS-native backends (`AudioContext.decodeAudioData`, `OffscreenCanvas`/`createImageBitmap` from `Blob`, plain string use for field/text/font).
- The ONLY network fetch in the runtime is: (a) the bundle's own dynamic `import()` (FR-026) and (b) net-operations `fetch()` initiated by `getNetText`/`postNetText`/`preloadNetThing`/`downloadNetThing`/`gotoNetMovie` (FR-033, exempt from FR-032 — they fetch remote resources at runtime by URL, NOT bundled media).

## Testability
- Building a definition and asserting the frozen output's shape and assigned numbers is a pure-data unit test (no worker/DOM).
- Two independently built definitions produce independent casts/members (per-context isolation enforced downstream — per FR-003).
- Invalid bundle default exports raise `InvalidBundleError` (cast-loader structural check).