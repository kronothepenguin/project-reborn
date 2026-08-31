export function goToFrame(spriteRef, frameNameOrNum) {
  if (spriteRef && typeof spriteRef.goToFrame === "function") {
    spriteRef.goToFrame(frameNameOrNum);
  }
}
