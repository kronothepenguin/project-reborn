// @owner player
import { _getPlayer } from "../../engine/subsystem/singletons.js";

export function alert(displayString) {
  _getPlayer().alert(displayString);
}
