# Quickstart — Engine Core functional sprites (003)

**Gate**: `pnpm --filter @project-reborn/director test` — 328 green (49 files).

## Live sprite resolution

```js
import { sprite } from "@project-reborn/director"; // top-level (006)

const logo = sprite(1);          // live SpriteObject for channel 1 (current frame)
logo.locH;                       // 10 (from the Score cell's loc[10,20])
logo.locV;                       // 20
logo.visible = false;            // mutate the live object — persists across calls
```

- `sprite(n)` resolves puppet register → Score cell → hydrated live `SpriteObject`.
- Channel `0` = stage (inert, no-op safe). Unpopulated channels → `null`.
- Live objects are cached per channel; they re-hydrate when the playhead
  moves, but script mutations between frames persist (T012).

## Puppet register (context-level)

```js
_movie.puppetSprite(1, true);    // script control: live sprite preempts the Score cell
sprite(1).locH = 500;            // script moves it
_movie.puppetSprite(1, false);   // restore Score control (cell rehydrates)

_movie.puppetSprite(5, true);    // unpopulated channel → empty scripted sprite
spriteChannel(5)                 // -> SpriteChannelObject
  .makeScriptedSprite(member("Logo")); // centers on stage by default
spriteChannel(5).removeScriptedSprite();
```

## hitTest

```js
const under = sprite(1).hitTest(point(120, 120));
// topmost live sprite (Score ∪ puppeted) whose bounds contain the point, else VOID (null)
hitTest(sprite(1), point(5, 5)); // top-level form delegates
```

Bounds derive from `locH/locV` + `width/height` (plain fields can't intercept
assignment — FR-004).

## Constraint

```js
_movie.constrainH(1, 2);  // clamp sprite 2's locH into sprite 1's bounds
_movie.constrainV(1, 2);  // same for locV
sprite(2).constraint = 1; // field → clamped via constrainIfNeeded
```

## Live lifecycle events

`frameStep()` dispatches `beginSprite`/`endSprite` per populated + puppeted
channel (ascending) with `detail.sprite` = the **live SpriteObject** (`channel`
+ `cell` kept for the 008 renderer).

```js
ctx.addEventListener("beginSprite", (e) => {
  e.detail.sprite; // SpriteObject — move it, and the renderer reflects it next frame
});
```

## Notes

- All sprite fields stay plain documented fields (AGENTS.md FR-013/FR-005);
  hydration/bounds logic lives in `engine/subsystem/sprite-hydrate.js`.
- 004's cell `loc: [h,v]`/`size: [w,h]` shape is the hydration source.
- Rendering (ink/blend/rotation composition) is 008-later; fields are data-only.
- Member classes (010) and scripting objects (011) are the follow-up splits.