// @owner movie
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function goLoop() {
  _getMovie().goLoop();
}
