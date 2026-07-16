// putInto(value, chunkStart, chunkEnd, str)
// Lingo: put expression into chunkExpression
// Replaces the chunk in str with value. Positions are 1-based and inclusive.
export function putInto(value, chunkStart, chunkEnd, str) {
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
  return str.substring(0, chunkStart - 1) + value + str.substring(chunkEnd);
}
