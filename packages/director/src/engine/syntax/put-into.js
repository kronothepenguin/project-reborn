import { resolveChunkTarget, stringifyChunkValue } from "./chunk-split.js";

// Lingo: put expression into chunkExpression
// Replaces the target chunk with the (stringified) value. A plain-string target
// addresses the whole container (its content becomes the value; an empty
// container becomes the value). A nonexistent target chunk inserts the value at
// the end of the container ("as appropriate"). Returns the new string.
export function putInto(chunk, value) {
  const { str, start, end } = resolveChunkTarget(chunk);
  const text = stringifyChunkValue(value);
  if (start < 0) return str + text;
  return str.substring(0, start) + text + str.substring(end);
}