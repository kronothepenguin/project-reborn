# Quickstart — Engine Subsystem + Score (004)

**Gate**: `pnpm --filter @project-reborn/director test` — every scenario here is a
vitest case (co-located `__tests__/`), mirroring real TDD tests, not node one-liners.

## Score — the data model

```js
import { Score } from "../engine/subsystem/score.js";

const score = new Score({
  frames: [
    { marker: "intro", channels: { 1: { member: "logo" }, 7: { member: "text" } } },
    { channels: [] },                       // array form; index+1 = channel
    { marker: "loop", channels: {} },
  ],
  tempo: 30,
});

score.advance();            // playhead → frame 1
score.frame;                // 1
score.frameLabel;           // "intro"
score.tempo;                // 30
score.setTempo(45);         // puppetTempo — clamped ≥1, floored
score.channel(1);           // { member: "logo" }
score.channel(0);           // STAGE (channel 0 = stage)
score.populatedChannels();  // [1, 7]
score.go("loop");           // → frame 3; unknown marker → no-op
score.goNext();             // … next marker; none → last marker / frame 1
score.goLoop();             // previous marker + docs fallback chain
score.goPrevious();         // one-back on a marker frame, two-back otherwise
```

Empty score (canonical, C1): `frame` stays `0`, `advance()`/`go*` no-op, `populatedChannels()`
→ `[]` — playback runs with no frames.

## DirectorContext

```js
import { DirectorContext } from "../engine/subsystem/context.js";

const ctx = new DirectorContext({ name: "habbo", src: "/habbo", tempo: 15, width: 720, height: 480 });
ctx.score;                 // Score (own)
ctx.memberRegistry;        // etc. — exactly one of each subsystem
ctx.externalParams;        // frozen [{name, value}] (sw1..sw9 → 008)
ctx.activate(globalThis);  // dual-binding; object arg is the global target
ctx.destroy();             // idempotent; releases loop handle/audio/canvas
```

Lifecycle:
```js
ctx.addEventListener("enterFrame", (e) => console.log(e.detail.frame, e.detail.score));
ctx.frameStep();        // advance → prepareFrame → enterFrame → (beginSprite→endSprite per
                        //   populated channel, ascending) → exitFrame — events on ctx
ctx.idle(); ctx.timeout();   // idle / timeout hooks (loop-driven per 001 model)
```

## the-proxy × Score (004-spin)

```js
import { the } from "../engine/syntax/the-proxy.js";
import { DirectorContext } from "../engine/subsystem/context.js";

the.frame;        // 0 (no context / empty score)
const ctx = new DirectorContext({ tempo: 20, score: { frames: [{ marker: "intro" }] } });
ctx.activate({});
ctx.score.advance();
the.frame;        // 1
the.frameLabel;   // "intro"
the.frameTempo;   // 20 — live; puppetTempo(45) → 45 on next read
the.frame = 2;    // THROWS (read-only, C5; playhead mutates via go*)
```

## Movie bridge (004 wire-up)

```js
import { _movie } from "../engine/subsystem/singletons.js";
const ctx = new DirectorContext({ score: { frames: [{ marker: "a" }, { marker: "b" }] } });
ctx.activate({});
_movie.go("b");       // → ctx.score.frame 2
_movie.puppetTempo(60); // → ctx.score.tempo 60
```

## Declarations to remember

- `_score` is a live slot import (`../engine/subsystem/singletons.js` or `score-slot.js`) —
  NOT a `globalThis` singleton (only the 7 documented Director singletons are installed).
- `populatedChannels()` excludes `channel(0)` (the stage is not a sprite channel).
- `markers()` derives `[{ marker, frame }]` from the frames array (frame 1-based).