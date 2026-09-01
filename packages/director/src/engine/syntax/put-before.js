// putBefore(value, chunkStart, chunkEnd, str)
// Lingo: put expression before chunkExpression
// Inserts value before the chunk in str. Positions are 1-based and inclusive.
export function putBefore(value, chunkStart, chunkEnd, str) {
  if (typeof str !== "string") {
    return "";
  }
  if (typeof value !== "string") {
    value = String(value ?? "");
  }
  if (chunkEnd < chunkStart) {
    return str;
  }
  if (chunkStart < 1) {
    chunkStart = 1;
  }
  if (chunkEnd > str.length) {
    chunkEnd = str.length;
  }
  return str.substring(0, chunkStart - 1) + value + str.substring(chunkStart - 1);
}
