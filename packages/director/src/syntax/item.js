function getItemDelimiter() {
  if (typeof globalThis !== "undefined" && globalThis.the) {
    const delim = globalThis.the.itemDelimiter;
    if (typeof delim === "string" && delim.length > 0) {
      return delim;
    }
  }
  return ",";
}

export function item(n, str, delimiter) {
  if (typeof str !== "string") {
    return "";
  }
  const sep = delimiter ?? getItemDelimiter();
  const parts = str.split(sep);
  if (n < 1 || n > parts.length) {
    return "";
  }
  return parts[n - 1];
}

export function itemRange(start, end, str, delimiter) {
  if (typeof str !== "string") {
    return "";
  }
  const sep = delimiter ?? getItemDelimiter();
  const parts = str.split(sep);
  if (end < start) {
    return "";
  }
  if (start < 1) {
    start = 1;
  }
  if (end > parts.length) {
    end = parts.length;
  }
  return parts.slice(start - 1, end).join(sep);
}
