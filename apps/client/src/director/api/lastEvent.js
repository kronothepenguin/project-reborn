let lastEventTime = 0;

export function lastEvent() {
  return lastEventTime;
}

export function _setLastEventForTests(ticks) {
  lastEventTime = Number(ticks) || 0;
}
