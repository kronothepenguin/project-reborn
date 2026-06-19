// Frame-based event loop driven by requestAnimationFrame.
// Tempo is frames-per-second.

let _running = false;
let _rafId = 0;
let _lastFrameTime = 0;
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
  _lastFrameTime = 0;
  _running = true;

  const tick = (timestamp) => {
    if (!_running) return;
    if (_lastFrameTime === 0) {
      _lastFrameTime = timestamp;
    }
    const elapsed = timestamp - _lastFrameTime;
    if (elapsed >= _frameDuration) {
      _processFrame();
      _lastFrameTime = timestamp - (elapsed % _frameDuration);
    }
    _rafId = globalThis.requestAnimationFrame?.(tick) ?? 0;
  };

  if (typeof globalThis.requestAnimationFrame === "function") {
    _rafId = globalThis.requestAnimationFrame(tick);
  } else {
    _rafId = setInterval(_processFrame, _frameDuration);
  }
}

export function stopEventLoop() {
  _running = false;
  if (_rafId) {
    if (typeof globalThis.cancelAnimationFrame === "function") {
      globalThis.cancelAnimationFrame(_rafId);
    } else {
      clearInterval(_rafId);
    }
    _rafId = 0;
  }
  _lastFrameTime = 0;
}

export function isEventLoopRunning() {
  return _running;
}

export function setTempo(tempo) {
  _frameDuration = 1000 / Math.max(1, Number(tempo) || 30);
  if (_movie) {
    _movie.frameTempo = Number(tempo);
  }
}

function _processFrame() {
  if (!_movie) return;

  _movie.frame = (_movie.frame ?? 1) + 1;
  _movie.dispatchEvent(new CustomEvent("prepareFrame", { detail: { frame: _movie.frame } }));
  _movie.dispatchEvent(new CustomEvent("enterFrame", { detail: { frame: _movie.frame } }));

  if (typeof _onFrame === "function") {
    try {
      _onFrame(_movie);
    } catch (err) {
      console.error("[event-loop] onFrame handler threw", err);
    }
  }

  _movie.dispatchEvent(new CustomEvent("exitFrame", { detail: { frame: _movie.frame } }));
}
