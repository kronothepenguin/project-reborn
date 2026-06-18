let lastClickTime = 0;

export function lastClick() {
  return lastClickTime;
}

export function _setLastClickForTests(ticks) {
  lastClickTime = Number(ticks) || 0;
}
