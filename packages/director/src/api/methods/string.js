// @owner top
export function string(expression) {
  if (typeof expression === "symbol") {
    return expression.description;
  }
  return String(expression);
}
