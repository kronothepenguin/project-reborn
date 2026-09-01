import { _movie } from "../../engine/subsystem/singletons.js";

export function delay(intTicks) {
  _movie.delay(intTicks);
}
