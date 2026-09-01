import { resolveChunkTarget, stringifyChunkValue } from "./chunk-split.js";

// Lingo: put expression before chunkExpression
// Inserts value before the target chunk without replacing the container's
// contents. A plain-string target addresses the whole container. A nonexistent
// target chunk inserts the value at the end of the container ("as appropriate").
// Returns the new string (JS strings are immutable).
export function putBefore(chunk, value) {
  const { str, start, end } = resolveChunkTarget(chunk);
  const text = stringifyChunkValue(value);
  if (start < 0) return str + text;
  return str.substring(0, start) + text + str.substring(start);
}