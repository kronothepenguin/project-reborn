# Contract — Pack Definition (C8) and Generator

**Feature**: `015-director-runtime` | **Spec**: [../spec.md](../spec.md) | **Source**:
`packages/director/src/pack/`, `packages/director/scripts/generate-pack.mjs`

Requirements: FR-049–FR-053, FR-057, R-16, SC-010. The C8 shape is frozen, pure data — no
functions, classes, or live Director objects (R-16 supersedes 001's flat builder shape and inline
typed-array bitmap wording). Builders, generator, and ingester all speak this shape.

## 1. TypeScript-like shapes

```ts
type MovieDefinition = {
  kind: "movie";                   // FR-053 validation discriminator
  name: string;                    // canonical movie identity
  totalCastSlots: number;          // cast slot count (habbo: 73); the ingester tolerates its
                                   // absence by defaulting to casts.length
  casts: CastDefinition[];         // slot order 1..totalCastSlots
  options: {
    tempo: number;                 // frames/second, integer >= 1 (default 30)
    width: number;                 // stage width (default 640)
    height: number;                // stage height (default 480)
    src: string;                   // source URL recorded on the movie
  };
  score?: ScoreDefinition;         // optional; playback runs with an empty score otherwise
};

type CastDefinition = {
  kind: "cast";
  name: string;                    // cast-library identity; also the slot name
  members: MemberDefinition[];     // registration order
};

type MemberDefinition = {
  kind: "member";
  name: string;                    // canonical identity (number is metadata)
  mediaType: MediaType;
  payload?: MemberPayload;         // inline data only (never a URL reference)
  registrationPoint?: string;      // "(x, y)" metadata from Members.csv
  number?: number;                 // 1-based registration order (metadata only)
};

type ScoreDefinition = {
  frames: Array<{
    marker?: string;               // per-frame marker label
    channels?: { [channel: number]: Cell } | Cell[]; // channels 1..48
  }>;
  tempo?: number;                  // movie tempo; Score normalizes to >= 1 (default 30)
};

type Cell = {
  member?: string | null;          // member name (resolved by the ingester)
  loc?: [h: number, v: number];
  size?: [w: number, h: number];
  visible?: boolean;
  ink?: number;
  blend?: number;
  rotation?: number;
  // ...remaining sprite placement fields pass through opaquely (see data-model.md §9)
};
```

`options` is nested (not flat); `registrationPoint` and `number` are metadata; `score` is optional
(`totalCastSlots`, optional `score`, base64 bitmap `data`, and `number`-as-metadata are the
R-16 rulings).

## 2. Identity rules

- **Name is canonical.** `MemberDefinition.name` identifies the member. A member whose name and
  number disagree is resolved by name (edge case).
- **Number is metadata.** Assigned sequentially by registration position within a cast library
  (1-based, compacted) by builders/generator; the registry preserves an explicit number and keeps
  a per-castLib counter beyond it. `number` is never an authoring input.
- **Cast lookup order.** `Movie.member(name)` searches castLibs in declaration order; the first
  match wins. Two castLibs with the same member name → first declaration wins.
- **Empty cast slots.** Represented as `{ kind: "cast", name, members: [] }`; habbo declares 73
  slots with `Internal` + imported `fuse_client` populated and the rest empty (FR-051).
- **Missing members.** A member referenced by a cast/Score but not declared in the bundle resolves
  to the documented empty result without crashing.

## 3. `mediaType` set (FR-050)

`"script" | "bitmap" | "field" | "text" | "sound" | "button" | "colorPalette" | "cursor" |
"font" | "empty"`.

The 19 documented media types map onto these payload families; any unrecognized CSV type maps to
`"empty"` in the generator.

## 4. Payload variants (inline only)

| mediaType | Payload |
|-----------|---------|
| `script` | `{ content: string }` — already-translated JS source (`.js` sibling) or the `.ls` text |
| `bitmap` | `{ data: string /* base64 data URI */, width?: number, height?: number }` |
| `field`, `text`, `button` | `{ text: string }` |
| `sound` | `{ audioBytes: … }` — inline bytes decoded via `decodeAudioData` |
| `colorPalette` | `{ colors: … }` |
| `cursor` | `{ glyph: … }` |
| `font` | `{ glyphs: … }` |
| `empty` / media row with no file | `{}` |

All payloads are embedded inline; runtime fetch is limited to bundle `import()` and explicit net
operations. Media classes must not mirror payload data into fields — the payload stays on
`MemberObject.payload` (FR-037).

## 5. Validation and `InvalidBundleError` (FR-053)

The ingester rejects a definition that is not:

1. a `kind: "movie"` object, with
2. a non-empty `name`, and
3. non-empty `casts` of `kind: "cast"` entries.

On failure the worker posts `{ kind: "error", detail: { message } }`, the host surfaces it on the
handle (and the element for the declarative path), the worker tears down, and the host page is not
crashed. `InvalidBundleError` is the named error semantic for this path. A failed bundle
`import()` (404/CORS/bad module) follows the same surface/teardown contract.

## 6. Generator contract (FR-052)

Script: `packages/director/scripts/generate-pack.mjs` (Node ESM), documented by the
`director-cast-to-javascript` skill.

Invocations:

```bash
node packages/director/scripts/generate-pack.mjs cast  <castDir>
node packages/director/scripts/generate-pack.mjs movie <movieDir>
```

### Inputs

| Mode | CSV | Columns |
|------|-----|---------|
| cast | `<castDir>/Members.csv` (or `<dir>/*_Members.csv`) | `Number, Type, Name, Registration Point, Filename` |
| movie | `<movieDir>/Casts.csv` | `Number, Name, Filename` |

Cast mode: script rows read the sibling `.js` (translated) when present, else the `.ls` text;
PNG filenames become `data:image/png;base64,…`; other filenames become text. Cast name is the
directory basename.

Movie mode: each `Casts.csv` row becomes a cast entry; members for the movie's own cast are read
inline from `<movieDir>/Members.csv` or `<movieDir>/<castName>_Members.csv`; a sibling
`../<name>/index.js` is imported when the sibling cast directory exists; otherwise the slot is an
empty cast. `totalCastSlots` is the max `Number` in `Casts.csv`; empty slots stay in the list.

### Outputs

- `<dir>/index.js`, named export `definition` plus default export, committed to the repo (the
  browser imports these virtual files).
- Header (both modes):
  `// Generated by director generate-pack (007) — do not edit by hand.` followed by
  `// Conforms to the C8 definition contract consumed by the 008 ingester.`
- `Object.freeze(...)` around the definition, casts, and options; cast imports hoisted above the
  definition.
- Generated packs: habbo (73 slots: `Internal` 4 members + `fuse_client` import + 70 empty) and
  fuse_client (89 members) at `packages/client-r26/src/game/`; the other cast folders are
  mechanical re-runs.

## 7. Builder contract (FR-049, R-16)

`pack/movie.js`:

```js
movie(name)                       // MovieBuilder, default name "Movie"
  .cast(castDefinition | castDefinition[])
  .tempo(fps).width(w).height(h).src(url).score(scoreDefinition)
  .build()                        // frozen MovieDefinition (C8)
```

`pack/cast.js`:

```js
cast(name)                        // CastBuilder, default name "Internal"
  .bitmap(name, {data, width, height})
  .button(name, {text, width, height})
  .colorPalette(name, {colors})
  .cursor(name, {glyph})
  .field(name, {text})
  .font(name, {glyphs})
  .sound(name, {audioBytes})
  .text(name, {text})
  .movieScript(name, {content})   // mediaType "script"
  .member(name, {type, payload})  // generic fallback; type defaults to "empty"
  .build()                        // frozen { kind:"cast", name, members[] }
```

Rules: `.build()` assigns `number = position + 1` (1-based, compacted) and returns a frozen plain
object; builders never return live Director objects; builders, generator, and ingester produce and
consume the same C8 shape (FR-049). The builder's current omission of `totalCastSlots`/empty-slot
padding is a known gap recorded in [../data-model.md](../data-model.md#known-implementation-gaps).

## 8. Ingestion contract (FR-057)

`ingestDefinition(ctx, definition)`:

1. Sets `context.name` and `movie.name` from the definition name; `movie.src` from `options.src`.
2. Constructs a `CastLibraryObject` per slot (`name`, `number = slotIndex + 1`, `member` keyed by
   name and number), registering every member in `MemberRegistry`.
3. Fills `context.castLibs` up to `totalCastSlots` with empty casts so `castLib(n)` indexing
   matches the movie's slot numbers; mirrors the table on `movie.castLib` by number and name.
4. Applies `options.tempo/width/height/src` to the context.
5. Loads the optional `score` into a `Score` (frames normalized, channels ≤ 48).
6. Activates the context.

Members are constructed as the base `MemberObject` with `name`, `number`, `mediaType`,
`registrationPoint`, and `payload` (bitmap payload width/height also copied to `width`/`height`);
typed media classes are exposed through `newMember` and the media barrels, not through ingestion.
