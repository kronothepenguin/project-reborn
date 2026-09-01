// @owner player
import { _getPlayer } from "../../engine/subsystem/singletons.js";

export function cursor(arg1, arg2) {
  _getPlayer().cursor(arg1, arg2);
}
