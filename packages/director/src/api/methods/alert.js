import { _player } from "../../engine/subsystem/singletons.js";

export function alert(displayString) {
  _player.alert(displayString);
}
