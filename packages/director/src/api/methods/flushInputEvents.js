// @owner player
import { _getPlayer } from "../../engine/subsystem/singletons.js";

export function flushInputEvents() {
  _getPlayer().flushInputEvents();
}
