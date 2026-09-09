// Input handler (008 R6 / US3) — worker-side ingestion of forwarded
// key/mouse/focus messages from the host element (001 custom-elements.md
// protocol: {kind:"keydown"|"keyup"|"mousedown"|"mouseup"|"mousemove"|
// "focus"|"blur", …}). Feeds the `_key`/`_mouse` core-object fields; mouse
// coordinates are translated to stage space (scaled to the stage size,
// y-flipped per Director's bottom-left origin) and clamped to the stage
// rect.

export function handleInputMessage(ctx, msg) {
  if (!ctx || !msg) return;
  const { kind } = msg;

  switch (kind) {
    case "keydown":
      ctx.key.key = msg.key ?? "";
      ctx.key.keyCode = msg.keyCode ?? 0;
      return;
    case "keyup":
      ctx.key.key = "";
      ctx.key.keyCode = 0;
      return;
    case "mousedown":
      ctx.mouse.mouseDown = true;
      ctx.mouse.clickLoc = toStage(ctx, msg.clientX, msg.clientY);
      return;
    case "mouseup":
      ctx.mouse.mouseDown = false;
      return;
    case "mousemove": {
      const p = toStage(ctx, msg.clientX, msg.clientY);
      ctx.mouse.mouseH = p.h;
      ctx.mouse.mouseV = p.v;
      return;
    }
    case "focus":
      return;
    case "blur":
      ctx.key.key = "";
      ctx.key.keyCode = 0;
      return;
    default:
      return;
  }
}

// clientX/clientY → stage space. Assumes the canvas fills the stage (origin
// top-left in client coords; Director stage origin is bottom-left, so the
// vertical axis is flipped). Clamps to [0, width]×[0, height].
function toStage(ctx, clientX, clientY) {
  const w = ctx.width || 640;
  const h = ctx.height || 480;
  const x = Math.max(0, Math.min(w, Math.trunc(Number(clientX) || 0)));
  const yRaw = Number(clientY) || 0;
  const y = Math.max(0, Math.min(h, Math.trunc(yRaw)));
  return { h: x, v: h - y }; // flip vertical (bottom-left origin)
}