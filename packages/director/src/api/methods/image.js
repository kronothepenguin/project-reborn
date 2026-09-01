// @owner top
export function image(intWidth, intHeight, intBitDepth) {
  return {
    width: Math.max(0, Math.trunc(Number(intWidth) || 0)),
    height: Math.max(0, Math.trunc(Number(intHeight) || 0)),
    bitDepth: Math.max(1, Math.trunc(Number(intBitDepth) || 1)),
    pixels: [],
  };
}
