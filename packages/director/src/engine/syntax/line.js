import { splitLines, createChunkSelector } from "./chunk-split.js";

export const line = createChunkSelector(splitLines, "line", () => "\r");

export function lineRange(start, end) {
  return line(start).to(end);
}