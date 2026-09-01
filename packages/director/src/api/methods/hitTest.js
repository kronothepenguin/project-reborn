// @owner top
export function hitTest(spriteRef, testPoint) {
  if (spriteRef && typeof spriteRef.hitTest === "function") {
    return spriteRef.hitTest(testPoint);
  }
  return "background";
}
