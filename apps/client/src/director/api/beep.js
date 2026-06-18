import { _sound } from "../core/index.js";

export function beep(intBeepCount) {
  const count = intBeepCount == null ? 1 : Math.max(0, Math.trunc(Number(intBeepCount)));
  for (let i = 0; i < count; i++) {
    _sound.beep();
  }
}
