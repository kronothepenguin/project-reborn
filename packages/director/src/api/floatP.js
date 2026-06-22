export function floatP(numericExpression) {
  return typeof numericExpression === "number" && !Number.isInteger(numericExpression);
}
