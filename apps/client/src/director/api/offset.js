export function offset(stringExpression1, stringExpression2) {
  const index = stringExpression2.indexOf(stringExpression1);
  return index === -1 ? 0 : index + 1;
}
