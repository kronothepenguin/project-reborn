// @owner player
import { _getPlayer } from "../../engine/subsystem/singletons.js";

export function quit() {
  _getPlayer().quit();
}
