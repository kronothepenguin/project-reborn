// @owner top
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function callFrame(spriteRef, flashFrameNameOrNum) {
  if (spriteRef && typeof spriteRef.callFrame === "function") {
    spriteRef.callFrame(flashFrameNameOrNum);
    return;
  }
  if (typeof spriteRef === "number" && _movie && _getMovie().sprite) {
    const target = _getMovie().sprite[spriteRef];
    if (target && typeof target.callFrame === "function") {
      target.callFrame(flashFrameNameOrNum);
    }
  }
}
