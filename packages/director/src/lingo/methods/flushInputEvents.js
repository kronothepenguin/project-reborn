import { _player } from "../singletons.js";

export function flushInputEvents() {
  _player.flushInputEvents();
}
