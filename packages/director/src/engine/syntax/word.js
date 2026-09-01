import { splitWords, createChunkSelector } from "./chunk-split.js";

export const word = createChunkSelector(splitWords, "word", () => " ");

export function wordRange(start, end) {
  return word(start).to(end);
}