// Score subsystem (004 US2; supersedes 001 FR-031)
//
// The runtime's playhead/channel/rendering data model: ordered frames (each
// carrying up to 48 sprite channels + an optional marker label), the playhead,
// the movie-level tempo (C2 — the single tick authority), marker navigation.
//
// Not a Director core object (engine/core is 003's surface, verbatim JSDoc);
// this is subsystem state owned by `DirectorContext`. Cells are opaque
// passthrough values (`{ member, ...placement }`): 007 ships the serialized
// shape, 003 consumes cells for live sprites, 008 renders them (plan R1).
//
// Empty-score playback is canonical (C1): zero frames → playhead stays 0,
// go*/advance no-op safely, populatedChannels() → []. Frame numbers are
// 1-based (array index + 1); channels are 1..48.
//
// Navigation semantics (R6) trace the verbatim JSDoc of Movie.go/goLoop/
// goNext/goPrevious in `src/engine/core/movie.js` (quoted from
// `docs/drmx2004_scripting_ref/methods.txt`).

const MAX_CHANNELS = 48;

// Shared immutable stage marker: sprite channel 0 is the stage.
export const STAGE = Object.freeze({ isStage: true, member: null });

export class Score {
  constructor({ frames = [], tempo = 30 } = {}) {
    this.frames = Array.isArray(frames) ? frames.map(normalizeFrame) : [];
    this.tempo = toTempo(tempo);
    this._playhead = 0;
  }

  get frame() {
    return this._playhead;
  }

  get frameLabel() {
    if (!this.frames[this._playhead - 1]?.marker) return "";
    return this.frames[this._playhead - 1].marker;
  }

  // puppetTempo: live tempo mutation; next tick reads the new value (C2).
  setTempo(n) {
    this.tempo = toTempo(n);
  }

  advance() {
    if (this.frames.length === 0) return;
    if (this._playhead < this.frames.length) this._playhead += 1;
  }

  go(frameNameOrNum) {
    if (this.frames.length === 0) return;
    if (typeof frameNameOrNum === "string") {
      const target = this.frames.findIndex((f) => f.marker === frameNameOrNum);
      if (target === -1) return; // unknown marker → no-op (FR-008)
      this._playhead = target + 1;
      return;
    }
    const n = Number(frameNameOrNum);
    if (!Number.isFinite(n)) return;
    this._playhead = clamp(Math.floor(n), 1, this.frames.length);
  }

  goLoop() {
    const current = this.frames[this._playhead - 1];
    const hasMarker = current?.marker;
    const at = this.markers();
    let idx;
    if (hasMarker) {
      idx = at.findIndex((m) => m.frame === this._playhead);
      if (idx > 0) {
        this._playhead = at[idx - 1].frame;
        return;
      }
    } else {
      for (let i = at.length - 1; i >= 0; i--) {
        if (at[i].frame < this._playhead) {
          this._playhead = at[i].frame;
          return;
        }
      }
    }
    // No markers to the left: next marker right (markerless), current frame
    // (has marker), or frame 1 (no markers at all).
    if (at.length === 0) {
      this._playhead = 1;
      return;
    }
    if (!hasMarker) {
      const right = at.find((m) => m.frame > this._playhead);
      if (right) {
        this._playhead = right.frame;
        return;
      }
    }
    this._playhead = this._playhead || 1;
  }

  goNext() {
    if (this.frames.length === 0) return;
    const at = this.markers();
    if (at.length === 0) {
      this._playhead = 1;
      return;
    }
    const right = at.find((m) => m.frame > this._playhead);
    this._playhead = right ? right.frame : at[at.length - 1].frame;
  }

  goPrevious() {
    const at = this.markers();
    if (at.length === 0) {
      this._playhead = 1;
      return;
    }
    const current = this.frames[this._playhead - 1];
    const hasMarker = current?.marker;
    let idx;
    if (hasMarker) {
      idx = at.findIndex((m) => m.frame === this._playhead);
      if (idx > 0) {
        this._playhead = at[idx - 1].frame;
        return;
      }
    } else {
      idx = -1;
      for (let i = at.length - 1; i >= 0; i--) {
        if (at[i].frame < this._playhead) {
          idx = i;
          break;
        }
      }
      if (idx >= 0) {
        const twoBack = idx - 1;
        this._playhead = twoBack >= 0 ? at[twoBack].frame : at[idx].frame;
        return;
      }
    }
    // No markers to the left → docs fallback (same chain as goLoop).
    if (at.length === 0) {
      this._playhead = 1;
      return;
    }
    if (!hasMarker) {
      const right = at.find((m) => m.frame > this._playhead);
      if (right) {
        this._playhead = right.frame;
        return;
      }
    }
    this._playhead = this._playhead || 1;
  }

  channel(n) {
    const i = Number(n);
    if (i === 0) return STAGE;
    if (!Number.isFinite(i)) return null;
    const frame = this.frames[this._playhead - 1];
    if (!frame) return null;
    return frame.channels.get(i) ?? null;
  }

  populatedChannels() {
    const frame = this.frames[this._playhead - 1];
    if (!frame) return [];
    return [...frame.channels.keys()].sort((a, b) => a - b);
  }

  markers() {
    const out = [];
    for (let i = 0; i < this.frames.length; i++) {
      const m = this.frames[i].marker;
      if (m) out.push({ marker: m, frame: i + 1 });
    }
    return out;
  }
}

function toTempo(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 30;
  return Math.max(1, Math.floor(v));
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function normalizeFrame(frame) {
  const raw = frame ?? {};
  const channels = new Map();
  if (Array.isArray(raw.channels)) {
    for (let i = 1; i <= Math.min(MAX_CHANNELS, raw.channels.length); i++) {
      const cell = raw.channels[i - 1];
      if (cell != null) channels.set(i, cell);
    }
  } else if (raw.channels && typeof raw.channels === "object") {
    for (const [key, cell] of Object.entries(raw.channels)) {
      const n = Number(key);
      if (Number.isFinite(n) && n >= 1 && n <= MAX_CHANNELS && cell != null) {
        channels.set(n, cell);
      }
    }
  }
  return { marker: raw.marker, channels };
}