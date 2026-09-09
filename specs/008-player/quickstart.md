# Quickstart — Player (008) + Pack (007 slice)

**Gate**: `pnpm --filter @project-reborn/director test` — every scenario here is a
vitest case (co-located `__tests__/`), mirroring real TDD tests.

## run() — boot a movie bundle

```js
import { run } from "../player/run.js";

const handle = run("https://cdn/habbo/index.js", { canvas, externalParams: [{ name: "sw1", value: "1" }] });
handle.addEventListener("ready", () => {
  handle.start();               // begin the tempo-driven loop
  // handle.stop()  -> pause (resumable)
  // handle.goToFrame(5)
  // handle.poll()  -> requests a lifecycle snapshot (FR-028, poll-only)
});
handle.addEventListener("externalEvent", (e) => console.log(e.detail)); // {name, args}
handle.addEventListener("gotoNetMovie", (e) => console.log("navigate", e.detail.url));
handle.destroy();               // posts destroy + terminates the worker (idempotent)
```

The host worker imports the bundle itself (`bundleUrl`; C7). The bundle's default
export is the movie definition (C8).

## InstallGlobals — worker sandbox

```js
import { installGlobals } from "../player/worker-shim.js";
installGlobals(workerGlobalThis);
// _movie/_player/.../the/go/beep/... are FROZEN GETTERS:
//   _movie === ctx.movie (active context's instance, always live)
// assignment silently fails; no mutable slots, no globalThis writes (008 C1)
```

## ingestDefinition — build a context from a definition

```js
import { ingestDefinition } from "../player/ingest.js";
import { DirectorContext } from "../engine/subsystem/context.js";

const ctx = new DirectorContext({});
ingestDefinition(ctx, {
  name: "habbo",
  totalCastSlots: 73,
  casts: [
    { kind: "cast", name: "Internal", members: [
      { kind: "member", name: "Logo", mediaType: "bitmap", payload: { data: "data:image/png;base64,...", width: 32, height: 32 } },
    ]},
  ],
  options: { tempo: 15, width: 720, height: 480 },
});
ctx.castLibs[0].name;           // "Internal"
ctx.movie.castLib["Internal"].member["Logo"];  // member
ctx.score;                      // from optional `score` section
```

## Renderer — flat-2D + paint fallback

```js
import { createRenderer } from "../player/renderer.js";

// OffscreenCanvas path (primary): give it a 2d context
const renderer = createRenderer({ mode: "offscreen" });
renderer._drawContext = offscreen2d;
renderer._resolveImage = (memberName) => images[memberName]; // ImageBitmap/HTMLImageElement
// per tick:
renderer.renderFrame(ctx);     // bg fill + channels ascending (z-order) + loc/size
renderer.updateStage(ctx);     // synchronous re-render of current frame

// Paint fallback (no OffscreenCanvas — jsdom/tests):
const paintRenderer = createRenderer({
  mode: "paint",
  onPaint: (msg) => workerHost.postMessage(msg),   // {kind:"paint", imageData, width, height, seq}
  width: 720, height: 480,
});
```

## Input forwarding

```js
import { handleInputMessage } from "../player/input.js";
handleInputMessage(ctx, { kind: "keydown", key: "q", keyCode: 81 }); // -> ctx.key
handleInputMessage(ctx, { kind: "mousemove", clientX: 360, clientY: 240 }); // stage-space, y-flipped
handleInputMessage(ctx, { kind: "blur" }); // releases held keys
```

## Audio — 8 Web Audio channels

```js
import { createAudioEngine } from "../player/audio.js";
const engine = createAudioEngine(new AudioContext()); // worker-side
const ch = engine.channels[0];
await ch.play(memberWithBytes);   // decodeAudioData + gain→panner→destination
ch.setVolume(0.5); ch.setPan(-100);
ch.fadeOut(30);                    // ramp over ticks; call ch.tick() per frame
```

## Pack generation (007)

```bash
node packages/director/scripts/generate-pack.mjs cast  apps/client/src/game/fuse_client   # 89 members
node packages/director/scripts/generate-pack.mjs cast  apps/client/src/game/habbo        # Internal 4 (Internal_Members.csv)
node packages/director/scripts/generate-pack.mjs movie apps/client/src/game/habbo        # 73 slots; fuse_client imported
```

Generated `index.js` files export a frozen C8 definition (default export) that
`ingestDefinition` consumes directly.

## Message protocol (001 table + paint only, 008 C2)

MT→W `init(init{bundleUrl|definition, externalParams, offscreenCanvas?})` → W→MT `ready` → MT→W `start|stop|destroy|goToFrame|poll-lifecycle`; W→MT `error|lifecycle|externalEvent|gotoNetMovie|gotoNetPage|paint`; W←MT input `{kind: keydown|keyup|mousedown|mouseup|mousemove|focus|blur}`.