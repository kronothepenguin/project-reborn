import { _movie } from "../../engine/subsystem/singletons.js";

export function go(frameNameOrNum, movieName) {
  _movie.go(frameNameOrNum, movieName);
}
