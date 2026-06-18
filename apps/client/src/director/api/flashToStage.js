import { point } from "../core/index.js";

export function flashToStage(spriteRef, pointInFlashMovie) {
  if (spriteRef && typeof spriteRef.flashToStage === "function") {
    return spriteRef.flashToStage(pointInFlashMovie);
  }
  if (pointInFlashMovie && typeof pointInFlashMovie.locH === "number") {
    return point(pointInFlashMovie.locH, pointInFlashMovie.locV);
  }
  return pointInFlashMovie;
}
