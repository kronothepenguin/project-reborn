# Contract: `@/lingo` Public Director API

The `@project-reborn/director/lingo` subpath exports the public Director API only (FR-015/FR-022). No packaging, imperative, or custom-element surface leaks here.

## Surface categories (all documented, 1:1 vs Director MX 2004 docs)

### Singletons (live-binding bindings to the active worker's `DirectorContext`) — FR-003/FR-016
`_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`

- Imported as `import { _movie } from "@project-reborn/director/lingo"` — resolves to the worker's active context's `MovieObject`/etc. (live binding via `runtime/singletons.js` `let` slots; `DirectorContext.activate()` writes them — research.md R3).
- Inside the worker, also installed on `globalThis` (FR-027) so bundle code that doesn't import them can read them globally.
- Strict output: no undocumented singletons.

### Constants — FR-015
All documented Director MX 2004 constants (Chapter 9 of the docs) re-exported from `runtime/constants.js`.

### Data-types (classes) — FR-001/FR-002
`Color`, `List`, `PropList`, `Point`, `Rect`
- Where the docs map a Director type to a JS native, the runtime uses that native per the documented Director semantics.
- Where the docs require the type's own representation, the runtime exposes its own class strictly per the docs (no fabricated behavior).

### Core objects (classes, `X...Object`) — FR-007/FR-009
13 classes, file `cast-library.js` exports `CastLibraryObject`, etc.:

| Class | File |
| ----- | ---- |
| `CastLibraryObject` | `cast-library.js` |
| `GlobalObject` | `global.js` |
| `KeyObject` | `key.js` |
| `MemberObject` | `member.js` (base; member subclasses in `objects/media/` per FR-011/FR-012, listed below) |
| `MouseObject` | `mouse.js` |
| `MovieObject` | `movie.js` |
| `PlayerObject` | `player.js` |
| `SoundObject` | `sound.js` |
| `SoundChannelObject` | `sound-channel.js` |
| `SpriteObject` | `sprite.js` — Score-dependent surface stubbed in v1 (FR-007/FR-031) |
| `SpriteChannelObject` | `sprite-channel.js` — Score-dependent surface stubbed in v1 |
| `SystemObject` | `system.js` |
| `WindowObject` | `window.js` — full surface; `openMovie`/MIAW stubbed (FR-036) |

All properties are public; no `#` private fields (FR-013). No undocumented `static` methods/registries/subsystems on any class (FR-005).

### Scripting objects (classes, `X...Object`) — FR-008
4 classes living alongside core objects in `runtime/objects/`:

| Class | File |
| ----- | ---- |
| `FileioObject` | `fileio.js` |
| `NetLingoObject` | `netlingo.js` — uses `fetch()` inside worker (FR-033); see [imperative-runtime.md](./imperative-runtime.md) for the net-state subsystem |
| `SpeechXtraObject` | `speech-xtra.js` |
| `XMLParserObject` | `xml-parser.js` |

### Member media-type subclasses (classes, `X...Member`) — FR-011/FR-012
Files in `runtime/objects/media/`. All extend `MemberObject`.

Included (8, fully implemented per docs; documented native media behaviors backed by JS-native APIs; inline payload decoded in worker — FR-032):

`BitmapMember` (`bitmap.js`), `ButtonMember` (`button.js`), `ColorPaletteMember` (`color-palette.js`), `CursorMember` (`cursor.js`), `FieldMember` (`field.js`), `FontMember` (`font.js`), `SoundMember` (`sound.js`; decodes via `AudioContext.decodeAudioData` — FR-034), `TextMember` (`text.js`)

Excluded (11, stubs extending `MemberObject` with no media-specific behavior — accepted by the runtime without failing):

`AnimatedGIFMember`, `DVDMember`, `FilmLoopMember`, `FlashComponentMember`, `LinkedMovieMember`, `QuickTimeMember`, `RealMediaMember`, `Shockwave3DMember`, `ShockwaveAudioMember`, `VectorShapeMember`, `WindowsMediaMember`

### Top-level Lingo methods — FR-015
All documented top-level Lingo methods (~130, one file each in `runtime/methods/`). Net ops delegate to the `NetState` subsystem (FR-033). Member/sprite/sound/type-casting helpers delegate to the relevant singletons/subsystems/registry. Output contract: every name listed in `src/lingo/index.js` corresponds 1:1 to a documented method; no undocumented method exported (FR-016).

Examples (full list lives in `src/lingo/index.js`):
`go` (stubbed — no Score, FR-031), `goNext`/`goPrevious`/`goLoop` (stubbed), `member`, `sprite` (returns API-only shell), `sound`, `point`, `rect`, `list`, `propList`, `symbol`, `integer`, `string`, `float`, `abs`, `sin`, `cos`, `tan`, `sqrt`, `power`, `max`, `min`, `offset`, `chars`, `count`, `length`, `random`, `ilk`, `value`, `beep`, `alert`, `cursor`, `delay`, `halt`, `quit`, `abort`, the net methods (`getNetText`, `postNetText`, `preloadNetThing`, `downloadNetThing`, `gotoNetMovie`, `gotoNetPage`, `netAbort`, `netDone`, `netError`, `netTextResult`, `netMIME`, `netLastModDate`, `getStreamStatus`), `externalEvent`, `externalParamName`, `externalParamValue` (these three host-bridge — see [imperative-runtime.md](./imperative-runtime.md)).

### Syntax stand-ins (classes/functions) — already present under `runtime/syntax/`
`item.js`, `line.js`, `word.js`, `char.js`, `put-before.js`, `put-after.js`, `put-into.js`, `the-proxy.js`. Public surface unchanged; re-exported from `@/lingo`.

## Strict-output enforcement
- `src/lingo/index.js` re-exports ONLY documented names; SC-006/SC-011 require no undocumented top-level method or singleton.
- The package root `src/index.js` re-exports `./lingo/index.js` AND `./browser/index.js` (FR-022).

## Testability
- Each documented singleton resolves to the active context's instance after `DirectorContext.activate()` (FR-003).
- Each class's documented properties/methods are asserted per the docs in co-located `__tests__/` files (existing convention).
- Live-binding: a fresh context activation changes the imported-singleton value (research.md R3).