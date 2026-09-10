# Tasks: 003 — Functional Sprites (Sprite ↔ Score)

**Gate**: `pnpm --filter @project-reborn/director test` (303 green before, must stay green).

## Phase A — Resolution + hydration
- [x] T001 — `DirectorContext.sprite(n)` (public): puppet register → `score.channel(n)` → hydrated live `SpriteObject`; `n===0` → stage sprite; unknown → null. RED: sprite-functional.test.js.
- [x] T002 — Hydration helper (subsystem): copies placement fields from Score cell onto the live object (`loc/locH/locV/width/height/visible/member/puppet/left/top/right/bottom/rect/ink/blend/rotation`). RED: hydration test.
- [x] T003 — `api/methods/sprite.js` re-points to active context sprite path (never stale `movie.sprite` map). RED: api sprite test.
- [x] T004 — Stage sprite object (`sprite(0)`) — no-op safe inert object.
- [x] T005 — Refactor 008's `ingest`/`renderer` to hydrate via the shared helper (no behavior change; gate green).

## Phase B — Puppet register
- [x] T006 — `ctx.puppetSprites` Map + `ctx.puppetSprite(n, TRUE/FALSE)` register/unregister. RED: register test.
- [x] T007 — Channel resolution preempts Score with the register entry while registered.
- [x] T008 — `SpriteChannelObject.makeScriptedSprite(member, loc)` → registers a live sprite (loc default = stage center per docs); `removeScriptedSprite()` → unregisters.
- [x] T009 — `MovieObject.puppetSprite(n, bool)` delegates to context register.
- [x] T010 — `puppet` field maintained on channel resolution (`isScripted(n)`).

## Phase C — hitTest + constraint
- [x] T011 — `SpriteObject.hitTest(point)` → active-context topmost live sprite by (locZ, channel) whose bounds contain the point; VOID when none. RED: hit-test.test.js.
- [x] T012 — Bounds = sprite `left/top/right/bottom`; updates `rect` on hydration.
- [x] T013 — `locZ` defaults to channel number; ordering correct.
- [x] T014 — `MovieObject.constrainH/V(constrainer, constrained)` clamp `constrained.loc` into `constrainer` bounds. RED: constraint.test.js.
- [x] T015 — `SpriteObject.constraint` field honored by the clamp helper.

## Phase D — Live lifecycle dispatch
- [x] T016 — `context.frameStep()` passes live `SpriteObject` as `detail.sprite` on begin/endSprite (keep `channel` + `cell` for 008 compat). RED: frame-step-sprite.test.js.
- [x] T017 — Puppeted channels also dispatch live sprites.
- [x] T018 — 008 renderer + worker-entry still drive from cells (gate green).

## Phase E — Docs + review + commit
- [ ] T019 — roadmap status row (003 split: functional sprites done; 010/011 pending).
- [ ] T020 — `specs/003-engine-core/quickstart.md` (sprite(n)/puppet/hitTest/constrain examples).
- [ ] T021 — Full gate + review summary before commit.