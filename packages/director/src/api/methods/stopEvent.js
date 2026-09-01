// @owner movie
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function stopEvent() {
  _getMovie().stopEvent();
}
