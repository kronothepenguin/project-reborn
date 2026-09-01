import { _sound } from "../../engine/subsystem/singletons.js";

export function sound(intSoundChannel) {
  return _sound.channel(intSoundChannel);
}
