import { _movie } from "../core/index.js";

export function callFrame(spriteRef, flashFrameNameOrNum) {
  if (spriteRef && typeof spriteRef.callFrame === "function") {
    spriteRef.callFrame(flashFrameNameOrNum);
    return;
  }
  if (typeof spriteRef === "number" && _movie && _movie.sprite) {
    const target = _movie.sprite[spriteRef];
    if (target && typeof target.callFrame === "function") {
      target.callFrame(flashFrameNameOrNum);
    }
  }
}
