// @owner sound
import { _getSound } from "../../engine/subsystem/singletons.js";

export function sound(intSoundChannel) {
  return _getSound().channel(intSoundChannel);
}
