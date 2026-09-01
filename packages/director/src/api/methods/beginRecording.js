// @owner movie
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function beginRecording() {
  _getMovie().beginRecording();
}
