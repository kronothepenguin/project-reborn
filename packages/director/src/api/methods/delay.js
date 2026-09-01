// @owner movie
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function delay(intTicks) {
  _getMovie().delay(intTicks);
}
