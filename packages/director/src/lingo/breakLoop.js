import { _sound } from "../core/index.js";

export function breakLoop(soundChannel) {
  if (soundChannel && typeof soundChannel.breakLoop === "function") {
    soundChannel.breakLoop();
    return;
  }
  if (typeof soundChannel === "number" && _sound && _sound.channel) {
    const ch = _sound.channel(soundChannel);
    if (ch && typeof ch.breakLoop === "function") {
      ch.breakLoop();
    }
  }
}
