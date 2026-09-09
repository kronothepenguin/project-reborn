// Frame-based event loop driven by setTimeout re-arm (001 contract: "re-arm
// on tick allows tempo changes mid-playback"). Tempo is frames-per-second.
//
// 008 R3: each tick calls `ctx.frameStep()` (004 order: advance → prepareFrame
// → enterFrame → beginSprite→endSprite per populated channel → exitFrame)
// instead of the old bespoke `_movie.frame++` + manual dispatches. The render
// hook (`onFrame`) is invoked after the lifecycle dispatch each tick.

let _running = false;
let _timerId = 0;
let _frameDuration = 1000 / 30;
let _movie = null;
let _onFrame = null;

export function startEventLoop({ tempo = 30, movie = null, onFrame = null } = {}) {
  if (_running) {
    if (movie) _movie = movie;
    if (onFrame) _onFrame = onFrame;
    _frameDuration = 1000 / Math.max(1, Number(tempo) || 30);
    return;
  }

  _movie = movie;
  _onFrame = onFrame;
  _frameDuration = 1000 / Math.max(1, Number(tempo) || 30);
  _running = true;

  const tick = () => {
    if (!_running) return;
    _processFrame();
    _timerId = setTimeout(tick, _frameDuration);
  };

  _timerId = setTimeout(tick, _frameDuration);
}

export function stopEventLoop() {
  _running = false;
  if (_timerId) {
    clearTimeout(_timerId);
    _timerId = 0;
  }
}

export function isEventLoopRunning() {
  return _running;
}

export function setTempo(tempo) {
  _frameDuration = 1000 / Math.max(1, Number(tempo) || 30);
}

function _processFrame() {
  if (!_movie) return;
  const ctx = _movie;

  ctx.frameStep();

  if (typeof _onFrame === "function") {
    try {
      _onFrame(ctx);
    } catch (err) {
      console.error("[event-loop] onFrame handler threw", err);
    }
  }
}