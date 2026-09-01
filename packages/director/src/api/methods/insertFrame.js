// @owner movie
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function insertFrame() {
  _getMovie().insertFrame();
}
