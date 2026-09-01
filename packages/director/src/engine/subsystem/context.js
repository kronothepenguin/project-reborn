// DirectorContext (FR-003/FR-016/FR-027/FR-028/FR-037)
//
// One `DirectorContext` per worker (one movie per worker — research.md R2).
// `extends EventTarget` so lifecycle events (`prepareMovie`, `startMovie`,
// `stopMovie`, `prepareFrame`, `enterFrame`, `exitFrame`, …) are dispatched on
// the context itself (FR-028/FR-037). `activate()` writes the context's
// singleton instances into (a) the module-level live-binding slots in
// `runtime/singletons.js` AND (b) the worker's `globalThis` slots — so both
// `import { _movie } from "@/lingo"` and unqualified `_movie` reads inside a
// bundle resolve to this context's instances (FR-003/FR-016/FR-027; R3).
//
// Subsystem instances (`MemberRegistry`, `NetState`, `WindowRegistry`) are
// instantiated in the constructor and exposed as plain fields (FR-005 — no
// statics on classes; cross-class shared state lives here). Each context owns
// exactly one of each.

import { MovieObject } from "../core/movie.js";
import { PlayerObject } from "../core/player.js";
import { SoundObject } from "../core/sound.js";
import { KeyObject } from "../core/key.js";
import { MouseObject } from "../core/mouse.js";
import { SystemObject } from "../core/system.js";
import { GlobalObject } from "../core/global.js";
import { MemberRegistry } from "./member-registry.js";
import { NetState } from "./net-state.js";
import { WindowRegistry } from "./window-registry.js";
import { Score } from "./score.js";
import { _installSingletons } from "./singletons.js";

export class DirectorContext extends EventTarget {
  constructor(options = {}) {
    super();
    this.movie = new MovieObject();
    this.player = new PlayerObject();
    this.sound = new SoundObject();
    this.key = new KeyObject();
    this.mouse = new MouseObject();
    this.system = new SystemObject();
    this.global = new GlobalObject();

    this.name = options.name ?? "";
    this.src = options.src ?? "";
    this.tempo = options.tempo ?? 30;
    this.width = options.width ?? 640;
    this.height = options.height ?? 480;

    this.castLibs = [];

    this.memberRegistry = new MemberRegistry();
    this.netState = new NetState();
    this.windowRegistry = new WindowRegistry();

    this.score = new Score({
      frames: options.score?.frames ?? [],
      tempo: options.tempo ?? 30,
    });

    this.audioContext = null;
    this.canvas = null;
    this.eventLoopHandle = null;

    this.externalParams = Object.freeze(
      Array.isArray(options.externalParams) ? options.externalParams.map((p) => ({ ...p })) : []
    );

    this.destroyed = false;
  }

  activate(globalObject = null) {
    _installSingletons(this);
    if (globalObject !== null) {
      _installSingletonsOnGlobal(this, globalObject);
    }
    return this;
  }

  destroy() {
    if (this.destroyed) return this;
    this.stopMovie();
    if (this.eventLoopHandle) {
      try { this.eventLoopHandle.stop?.(); } catch { /* noop */ }
      this.eventLoopHandle = null;
    }
    if (this.audioContext && typeof this.audioContext.close === "function") {
      try { this.audioContext.close(); } catch { /* noop */ }
    }
    this.canvas = null;
    this.destroyed = true;
    return this;
  }

  // ── Score-independent lifecycle dispatch (FR-037) ──────────────────────
  //
  // Each hook dispatches a `CustomEvent` on `this` (the `DirectorContext` is
  // the `EventTarget`—research.md R2 / FR-028). The event-loop driver in
  // `runtime/player/event-loop.js` (US7) calls these per tick. They fire
  // REGARDLESS of Score sprite placement: v1 has no Score data, but the
  // lifecycle event sequence is still emitted (FR-037 explicit).
  //
  // Documented order (per `docs/drmx2004_scripting_ref/events_and_messages.txt`
  // and contracts/imperative-runtime.md):
  //   prepareMovie → startMovie → (prepareFrame → enterFrame →
  //     beginSprite (per sprite) → endSprite (per sprite) → exitFrame)ⁿ →
  //     … → stopMovie (on destroy)
  //
  // `prepareFrame`/`enterFrame`/`exitFrame` are kept as separate dispatch
  // entry-points so the event-loop can call them in the order the docs
  // specify; `beginSprite`/`endSprite` are per-sprite and are NOT context-
  // level events in v1 (no Score → no sprites), so they are intentionally not
  // implemented here (FR-031).

  prepareMovie() {
    this.dispatchEvent(new CustomEvent("prepareMovie", { detail: { movie: this.movie } }));
  }

  startMovie() {
    this.dispatchEvent(new CustomEvent("startMovie", { detail: { movie: this.movie } }));
  }

  stopMovie() {
    this.dispatchEvent(new CustomEvent("stopMovie", { detail: { movie: this.movie } }));
  }

  prepareFrame() {
    this.dispatchEvent(new CustomEvent("prepareFrame", { detail: { movie: this.movie, score: this.score, frame: this.score.frame } }));
  }

  enterFrame() {
    this.dispatchEvent(new CustomEvent("enterFrame", { detail: { movie: this.movie, score: this.score, frame: this.score.frame } }));
  }

  exitFrame() {
    this.dispatchEvent(new CustomEvent("exitFrame", { detail: { movie: this.movie, score: this.score, frame: this.score.frame } }));
  }

  // 004 Score-backed sprite hooks. Deferred while 001 had no Score (FR-031):
  // now real per populated channel. Live `Sprite` objects joining these events
  // is 003's job (C3) — 004 dispatches payloads (channel number + cell data).
  beginSprite(channel, cell) {
    this.dispatchEvent(
      new CustomEvent("beginSprite", {
        detail: { movie: this.movie, score: this.score, frame: this.score.frame, channel, cell },
      })
    );
  }

  endSprite(channel, cell) {
    this.dispatchEvent(
      new CustomEvent("endSprite", {
        detail: { movie: this.movie, score: this.score, frame: this.score.frame, channel, cell },
      })
    );
  }

  // 004 Score-backed frame step (contracts/lifecycle.md; plan R4). The 008
  // event loop calls this once per timer tick (after prepareMovie/startMovie).
  // Order: score.advance() → prepareFrame → enterFrame → (beginSprite →
  // endSprite per populated channel, ascending) → exitFrame. Frame events fire
  // every tick regardless of score content; sprite events fire only for
  // populated channels (FR-037 preserved — nothing suppressed).
  frameStep() {
    this.score.advance();
    const channels = this.score.populatedChannels();
    this.prepareFrame();
    this.enterFrame();
    for (const n of channels) {
      const cell = this.score.channel(n);
      this.beginSprite(n, cell);
      this.endSprite(n, cell);
    }
    this.exitFrame();
  }

  // `on idle` / `on timeout` (FR-037). The event-loop fires `idle` on a tick
  // when no input is buffered, and `timeout` when `the timeout` threshold
  // elapses. Hook names use the Director lifecycle event names verbatim.
  idle() {
    this.dispatchEvent(new CustomEvent("idle", { detail: { movie: this.movie } }));
  }

  timeout() {
    this.dispatchEvent(new CustomEvent("timeout", { detail: { movie: this.movie } }));
  }
}

// FR-027: install singleton instances onto the worker's globalThis so bundle
// code that does not import `@/lingo` can resolve `_movie`/`_player`/etc. as
// unqualified globals. The worker has its own `globalThis`; calling this from
// the main thread is allowed (it just writes to whatever global is passed).
function _installSingletonsOnGlobal(ctx, globalObject) {
  globalObject._movie = ctx.movie;
  globalObject._player = ctx.player;
  globalObject._sound = ctx.sound;
  globalObject._key = ctx.key;
  globalObject._mouse = ctx.mouse;
  globalObject._system = ctx.system;
  globalObject._global = ctx.global;
}