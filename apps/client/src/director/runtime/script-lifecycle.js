// Dispatch Director script lifecycle events on a movie/canvas target.
// Matches Director MX 2004 Chapter 10: Events and Messages.

const LIFECYCLE_EVENTS = [
  "prepareMovie",
  "startMovie",
  "stopMovie",
  "prepareFrame",
  "enterFrame",
  "exitFrame",
];

export function dispatchPrepareMovie(target, detail = {}) {
  return _dispatch(target, "prepareMovie", detail);
}

export function dispatchStartMovie(target, detail = {}) {
  return _dispatch(target, "startMovie", detail);
}

export function dispatchStopMovie(target, detail = {}) {
  return _dispatch(target, "stopMovie", detail);
}

export function dispatchPrepareFrame(target, frame, detail = {}) {
  return _dispatch(target, "prepareFrame", { frame, ...detail });
}

export function dispatchEnterFrame(target, frame, detail = {}) {
  return _dispatch(target, "enterFrame", { frame, ...detail });
}

export function dispatchExitFrame(target, frame, detail = {}) {
  return _dispatch(target, "exitFrame", { frame, ...detail });
}

export function dispatchAll(target, detail = {}) {
  for (const name of LIFECYCLE_EVENTS) {
    _dispatch(target, name, detail);
  }
}

function _dispatch(target, type, detail) {
  if (!target) return false;
  const event = new CustomEvent(type, { detail, bubbles: true, cancelable: true });
  return target.dispatchEvent(event);
}

export { LIFECYCLE_EVENTS };
