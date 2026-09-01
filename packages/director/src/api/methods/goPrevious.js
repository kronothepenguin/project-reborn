// @owner movie
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function goPrevious() {
  _getMovie().goPrevious();
}
