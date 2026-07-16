export function value(stringExpression) {
  if (stringExpression === "TRUE") return true;
  if (stringExpression === "FALSE") return false;
  if (stringExpression === "VOID") return undefined;
  if (stringExpression === "EMPTY") return "";
  const num = parseFloat(stringExpression);
  if (!isNaN(num) && /^\s*[-+]?[\d.]/.test(stringExpression)) return num;
  return stringExpression;
}
