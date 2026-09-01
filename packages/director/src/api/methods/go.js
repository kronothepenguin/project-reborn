// @owner movie
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function go(frameNameOrNum, movieName) {
  _getMovie().go(frameNameOrNum, movieName);
}
