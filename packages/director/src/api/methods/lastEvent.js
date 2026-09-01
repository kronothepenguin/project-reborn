// @owner player
import { _getPlayer } from "../../engine/subsystem/singletons.js";

export function lastEvent() {
  return _getPlayer().lastEvent;
}
