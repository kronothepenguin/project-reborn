// @owner top
let ignoreWS = true;

export function ignoreWhiteSpace(trueOrFalse) {
  if (trueOrFalse === undefined || trueOrFalse === null) {
    return ignoreWS;
  }
  ignoreWS = Boolean(trueOrFalse);
  return ignoreWS;
}

export function _resetIgnoreWhiteSpaceForTests() {
  ignoreWS = true;
}
