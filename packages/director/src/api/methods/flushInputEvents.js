import { _player } from "../../engine/subsystem/singletons.js";

export function flushInputEvents() {
  _player.flushInputEvents();
}
