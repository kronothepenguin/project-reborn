// DirectorContext (FR-003/FR-016/FR-027/FR-028/FR-037)
//
// One `DirectorContext` per worker (one movie per worker — research.md R2).
// `extends EventTarget` so lifecycle events (`prepareMovie`, `startMovie`,
// `stopMovie`, `prepareFrame`, `enterFrame`, `exitFrame`, …) are dispatched on
// the context itself (FR-028/FR-037). `activate()` installs this context as
// the ACTIVE context (006 C8): the 7 core-object instances live as consts on
// the context — they ARE the global state. The `the` proxy, the api methods,
// and the singleton facade resolve the active context through the accessor
// module; no globalThis installs, no mutable module-level slots.
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
import { getActiveDirectorContext, setActiveDirectorContext } from "./accessor.js";
import { hydrateSprite } from "./sprite-hydrate.js";
import { SpriteObject } from "../core/sprite.js";
import { SpriteChannelObject } from "../core/sprite-channel.js";

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

    // 003: live scripted sprites (puppet register, keyed by channel 1..48).
    // Channel resolution checks the register first, then the Score cell.
    this.puppetSprites = new Map();

    this._liveSprites = new Map();
    this._liveHydratedAt = new Map();
    this._spriteChannels = new Map();
    this._stageSprite = null;

    this.audioContext = null;
    this.canvas = null;
    this.eventLoopHandle = null;

    this.externalParams = Object.freeze(
      Array.isArray(options.externalParams) ? options.externalParams.map((p) => ({ ...p })) : []
    );

    this.destroyed = false;
  }

  activate() {
    setActiveDirectorContext(this);
    return this;
  }

  // ── 003 live sprite resolution ─────────────────────────────────────────
  //
  // `sprite(n)` returns the live SpriteObject for channel n in the current
  // frame: puppet register first, then the Score cell (hydrated). Channel 0
  // is the stage (an inert shared sprite). Unpopulated channels in the
  // current frame return null. Live objects are cached per channel and
  // rehydrated on each frameStep/go, so translated scripts mutate fields and
  // the same instance persists across calls (003 T005).

  sprite(n) {
    const channel = Number(n);
    if (channel === 0) {
      if (!this._stageSprite) {
        this._stageSprite = new SpriteObject(0);
        this._stageSprite.visible = false;
      }
      return this._stageSprite;
    }
    if (this.puppetSprites.has(channel)) return this.puppetSprites.get(channel);
    const cell = this.score.channel(channel);
    if (!cell) return null;

    let sprite = this._liveSprites.get(channel);
    if (!sprite) {
      sprite = new SpriteObject(channel);
      this._liveSprites.set(channel, sprite);
      this._liveHydratedAt.set(channel, -1);
    }
    // Rehydrate only when the playhead moved (a new frame's cell) — script
    // mutations between frames persist on the live object (003 T012).
    if (this._liveHydratedAt.get(channel) !== this.score.frame) {
      hydrateSprite(this, sprite, cell);
      this._liveHydratedAt.set(channel, this.score.frame);
    }
    return sprite;
  }

  // `spriteChannel(n)` — the SpriteChannelObject for a channel (003). Kept
  // small: the channel object wraps this context's live sprite + scripted
  // state for the docs' makeScriptedSprite/removeScriptedSprite surface.
  spriteChannel(n) {
    const channel = Number(n);
    let ch = this._spriteChannels.get(channel);
    if (!ch) {
      ch = new SpriteChannelObject(channel);
      ch._ctx = this;
      ch.sprite = this.sprite(channel);
      this._spriteChannels.set(channel, ch);
    }
    return ch;
  }

  // ── 003 puppet register (R3) ───────────────────────────────────────────
  // scripted sprites live on the context (user decision, 003 clarify):
  // `puppetSprites` Map, channel → live SpriteObject. Channel resolution in
  // `sprite(n)` checks the register first, Score cell second.

  puppetSprite(n, bool) {
    const channel = Number(n);
    if (!Number.isFinite(channel) || channel <= 0) return;
    if (bool) {
      let sprite = this.puppetSprites.get(channel);
      if (!sprite) {
        const cell = this.score.channel(channel);
        if (cell) {
          sprite = this.sprite(channel);
        } else {
          sprite = new SpriteObject(channel);
        }
        sprite.puppet = true;
        this.puppetSprites.set(channel, sprite);
      }
      return sprite;
    }
    const removed = this.puppetSprites.get(channel);
    if (removed) {
      removed.puppet = false;
      this.puppetSprites.delete(channel);
      // Restore Score control: re-hydrate the channel from its cell the next
      // time it's resolved (discard the scripted value).
      this._liveHydratedAt.set(channel, -1);
      this._spriteChannels.get(channel)?.removeScriptedSprite?.();
    }
  }

  isScripted(n) {
    const channel = Number(n);
    return Number.isFinite(channel) && channel > 0 && this.puppetSprites.has(channel);
  }

  destroy() {
    if (this.destroyed) return this;
    if (getActiveDirectorContext() === this) {
      setActiveDirectorContext(null);
    }
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
  // now real per populated channel. 003 T016: `sprite` is the LIVE
  // SpriteObject; `cell` stays for 008 renderer compat.
  beginSprite(channel, cell, sprite) {
    this.dispatchEvent(
      new CustomEvent("beginSprite", {
        detail: { movie: this.movie, score: this.score, frame: this.score.frame, channel, cell, sprite },
      })
    );
  }

  endSprite(channel, cell, sprite) {
    this.dispatchEvent(
      new CustomEvent("endSprite", {
        detail: { movie: this.movie, score: this.score, frame: this.score.frame, channel, cell, sprite },
      })
    );
  }

  // 004 Score-backed frame step (contracts/lifecycle.md; plan R4). The 008
  // event loop calls this once per timer tick (after prepareMovie/startMovie).
  // Order: score.advance() → prepareFrame → enterFrame → (beginSprite →
  // endSprite per populated channel, ascending) → exitFrame. Frame events fire
  // every tick regardless of score content; sprite events fire only for
  // populated channels. 003 T016: sprite events carry a LIVE SpriteObject
  // (`detail.sprite`) — `channel` + `cell` stay for 008 renderer compat.
  frameStep() {
    this.score.advance();
    const channels = this.score.populatedChannels();
    // Puppeted channels always have a live sprite during the step (003 T017).
    const liveChannels = new Set(channels);
    for (const n of this.puppetSprites.keys()) liveChannels.add(n);
    const ordered = [...liveChannels].sort((a, b) => a - b);
    this.prepareFrame();
    this.enterFrame();
    for (const n of ordered) {
      const cell = this.score.channel(n);
      const sprite = this.sprite(n);
      this.beginSprite(n, cell, sprite);
      this.endSprite(n, cell, sprite);
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