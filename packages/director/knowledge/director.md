---
type: JavaScript Package
title: The Director runtime
description: What packages/director holds, a JavaScript runtime of Macromedia Director for the translated Lingo scripts, and how its folders are laid out.
tags: [client, director]
---

# The package

`@project-reborn/director`, an ES module package. `packages/client-r26` depends on it.

| Export | File | Holds |
| --- | --- | --- |
| `.` | `src/index.js` | Both entries below |
| `./lingo` | `src/api/index.js` | The Lingo surface for translated `.ls` code: the singletons `_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system` and `_global`, the constants, the syntax stand-ins and the top-level Lingo methods |
| `./browser` | `src/browser/index.js` | The browser layer: `createContext`, `destroyContext`, `resetSingletons`, `registerCustomElements` and the builders `movie` and `cast` |

# Layout

| Folder | Holds |
| --- | --- |
| `src/api/methods/` | One file per top-level Lingo method, such as `charToNum.js` and `go.js` |
| `src/engine/base/` | `List`, `PropList`, `Point`, `Rect`, colours and the constants |
| `src/engine/core/` | The core objects: movie, player, sound, key, mouse, system, global, members, cast libraries, sprites, sprite and sound channels, windows |
| `src/engine/core/media/` | 20 member classes: bitmap, button, colour palette, cursor, field, font, sound and text work, and the other 12 are stubs |
| `src/engine/core/scripting/` | The Xtra scripting objects, `fileio`, `netlingo`, `speechxtra` and `xmlparser`, and `XTRA_CLASSES`, the map `xtra()` reads |
| `src/engine/subsystem/` | `DirectorContext`, the accessor of the active context, the singletons, the member registry, the score, the net state and the window registry |
| `src/engine/syntax/` | Lingo syntax as functions: `char`, `item`, `line`, `word`, `the`, `putInto`, `putBefore`, `putAfter` |
| `src/pack/` | The builders: `cast(name)` and `movie(name)` return frozen plain-data definitions |
| `src/player/` | Running a movie: `run`, the ingester, the event loop, the renderer, audio, input, cast loading and the Web Worker entry, host and shim |
| `src/browser/custom-elements/` | `<x-object>`, `<x-embed>` and `<x-param>` |
| `scripts/generate-pack.mjs` | The pack generator |

# How a movie runs

- A `DirectorContext` holds one movie's state: the seven core objects and the subsystems. `activate()` makes it the
  active context, which the singletons, the `the` proxy and the methods read through `src/engine/subsystem/accessor.js`.
- A pack is pure data: a movie definition `{ name, casts, options, score? }`, each cast `{ kind, name, members }`, each
  member `{ kind, name, mediaType, payload, registrationPoint? }`.
- `run(input, { canvas, externalParams })` starts a Web Worker on `src/player/worker-entry.js` and returns a handle.
  The worker imports the pack, ingests it into a `DirectorContext`, renders and plays it, one movie per worker.
- The event loop ticks at the movie's tempo, in frames per second, and runs each frame's lifecycle through
  `ctx.frameStep()`.
- `<x-object>` and `<x-embed>` read `src` (or `data`), `width`, `height` and `tempo`, insert a `<canvas>`, pass their
  `<x-param>` children as the external parameters to `run`, relay `externalEvent`, `error`, `gotoNetMovie` and
  `gotoNetPage` as events of the element, and forward the keyboard and the mouse. The stage defaults to 640 × 480 at
  30 frames per second. Importing the package in a DOM registers the elements.
- `createContext({ worker })` runs the context on the main thread for every value of `worker`.

# Packs

`scripts/generate-pack.mjs` writes the `index.js` of a cast or a movie folder:

```sh
node scripts/generate-pack.mjs cast <castDir>     # reads <castDir>/Members.csv
node scripts/generate-pack.mjs movie <movieDir>   # reads <movieDir>/Casts.csv and the cast folders beside it
```

- A script member's payload is the `.js` translation beside it, or the `.ls` file when it has none.
- A bitmap's payload is its file as a base64 data URI.
- An empty slot of `Casts.csv` becomes an empty cast, and the movie's `totalCastSlots` is the highest slot number.

# Tests

Vitest with jsdom runs the 52 files of `src/**/__tests__/`: `make check` in `packages/director`, which runs
the `test` script.
