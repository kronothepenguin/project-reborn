// @owner player
// Per director_core_objects.txt (Player method summary), halt() is a Player
// method (despite methods.txt's "Movie method" phrasing — C2 owner table
// wins). Delegates to the active context's player instance.
import { _getPlayer } from "../../engine/subsystem/singletons.js";

export function halt() {
  _getPlayer().halt();
}