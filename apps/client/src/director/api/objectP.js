export function objectP(expression) {
  if (expression === null || expression === undefined) return false;
  return typeof expression === "object" || typeof expression === "function";
}
