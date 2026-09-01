// @owner movie
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function goNext() {
  _getMovie().goNext();
}
