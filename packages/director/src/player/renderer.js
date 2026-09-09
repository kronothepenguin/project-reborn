// Renderer (008 R4 / US2) — flat-2D per-frame Score rendering.
//
// Iterates the current frame's populated channels in ascending order (z-order),
// and for each cell draws the member's media at the cell's placement
// (loc / size / visible) — flat 2D (C6: no ink/rotation/blend v1). An empty
// frame clears the stage to `ctx.movie.bgColor`. `updateStage()` renders the
// current frame synchronously.
//
// Two paths (C5):
//   - "offscreen": draw to an explicit 2d context (OffscreenCanvas primary —
//     the caller passes the canvas/context; in tests the drawContext is the
//     fake 2d).
//   - "paint": no canvas available — produce an ImageData and emit
//     `{kind:"paint", imageData, width, height, seq}` via `onPaint`
//     (latest-wins backpressure: the host paints the most recent).

export function createRenderer({ mode = "offscreen", onPaint = null, width = 0, height = 0, bgColor = "#000000" } = {}) {
  let seq = 0;
  const api = {
    _mode: mode,
    _onPaint: onPaint,
    _width: width,
    _height: height,
    _bgColor: bgColor,
    _drawContext: null,
    _resolveImage: null,

    renderFrame(ctx) {
      const movie = ctx.movie;
      const score = ctx.score;
      const bg = `#${String(movie?.bgColor ?? bgColor).replace(/^#/, "")}` || "#000000";
      api._bgColor = bg;

      if (api._mode === "offscreen" && api._drawContext) {
        const d = api._drawContext;
        d.fillStyle = bg;
        d.fillRect(0, 0, ctx.width || api._width, ctx.height || api._height);
        const channels = score.populatedChannels();
        for (const channel of channels) {
          const cell = score.channel(channel);
          if (!cell || cell.visible === false) continue;
          const memberName = cell.member;
          const img = api._resolveImage ? api._resolveImage(memberName) : null;
          if (!img) continue; // missing media -> no draw (no throw)
          const [x, y] = cell.loc ?? [0, 0];
          const [w, h] = cell.size ?? [img.width, img.height];
          try {
            d.drawImage(img, Math.trunc(x), Math.trunc(y), Math.trunc(w), Math.trunc(h));
          } catch {
            // a non-drawable image is treated as missing
          }
        }
        return;
      }

      if (api._mode === "paint" && api._onPaint) {
        const w = api._width || ctx.width || 0;
        const h = api._height || ctx.height || 0;
        const imageData = { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
        api._onPaint({ kind: "paint", imageData, width: w, height: h, seq: ++seq });
      }
    },

    updateStage(ctx) {
      api.renderFrame(ctx);
    },
  };
  return api;
}