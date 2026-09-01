import { _player } from "../../engine/subsystem/singletons.js";

export function quit() {
  _player.quit();
}
