// @owner channel
import { _getSound } from "../../engine/subsystem/singletons.js";

export function breakLoop(soundChannel) {
  if (soundChannel && typeof soundChannel.breakLoop === "function") {
    soundChannel.breakLoop();
    return;
  }
  if (typeof soundChannel === "number" && _sound && _getSound().channel) {
    const ch = _getSound().channel(soundChannel);
    if (ch && typeof ch.breakLoop === "function") {
      ch.breakLoop();
    }
  }
}
