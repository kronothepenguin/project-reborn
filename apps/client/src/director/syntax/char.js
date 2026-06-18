export function char(n, str) {
  if (typeof str !== "string" || str.length === 0) {
    return "";
  }
  if (n < 1 || n > str.length) {
    return "";
  }
  return str[n - 1];
}

export function charRange(start, end, str) {
  if (typeof str !== "string" || str.length === 0) {
    return "";
  }
  if (end < start) {
    return "";
  }
  if (start < 1) {
    start = 1;
  }
  if (end > str.length) {
    end = str.length;
  }
  return str.substring(start - 1, end);
}
