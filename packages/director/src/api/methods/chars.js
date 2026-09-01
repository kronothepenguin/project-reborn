// @owner top
export function chars(stringExpression, firstCharacter, lastCharacter) {
  if (lastCharacter < firstCharacter) {
    return "";
  }
  return stringExpression.substring(firstCharacter - 1, lastCharacter);
}
