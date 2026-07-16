import { _sound } from "../singletons.js";

export function sound(intSoundChannel) {
  return _sound.channel(intSoundChannel);
}
