import { splitChars, createChunkSelector, ChunkBound } from "./chunk-split.js";

export { ChunkBound };

export const char = createChunkSelector(splitChars, "char");

export function charRange(start, end) {
  return char(start).to(end);
}