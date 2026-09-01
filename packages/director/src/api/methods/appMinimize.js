// @owner player
import { _getPlayer } from "../../engine/subsystem/singletons.js";

export function appMinimize() {
  _getPlayer().appMinimize();
}
