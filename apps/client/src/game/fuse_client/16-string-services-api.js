export function constructStringServices() {
  return createManager(Symbol.for("string_services"), getClassVariable("string.services.class"));
}

export function deconstructStringServices() {
  return removeManager(Symbol.for("string_services"));
}

export function getStringServices() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("string_services"))) {
    return constructStringServices();
  }
  return tMgr.getManager(Symbol.for("string_services"));
}

export function convertToPropList(tString, tDelimiter) {
  const tOldDelim = the.itemDelimiter;
  if (voidp(tDelimiter)) {
    tDelimiter = ",";
  }
  the.itemDelimiter = tDelimiter;
  const tProps = propList();
  for (let i = 1; i <= tString.item.count; i++) {
    const tPair = tString.item[i].word[`1..${tString.item[i].word.count}`];
    const tProp = tPair.char[`1..${offset("=", tPair) - 1}`];
    const tValue = tPair.char[`${offset("=", tPair) + 1}..${length(tString)}`];
    tProps[tProp.word[`1..${tProp.word.count}`]] = tValue.word[`1..${tValue.word.count}`];
  }
  the.itemDelimiter = tOldDelim;
  return tProps;
}

export function convertToLowerCase(tString) {
  return getStringServices().convertToLowerCase(tString);
}

export function convertToHigherCase(tString) {
  return getStringServices().convertToHigherCase(tString);
}

export function convertSpecialChars(tString, tDirection) {
  return getStringServices().convertSpecialChars(tString, tDirection);
}

export function convertIntToHex(tInt) {
  return getStringServices().convertIntToHex(tInt);
}

export function convertHexToInt(tHex) {
  return getStringServices().convertHexToInt(tHex);
}

export function explode(tString, tDelimiter, tLimit) {
  return getStringServices().explode(tString, tDelimiter, tLimit);
}

export function implode(tList, tDelimiter) {
  return getStringServices().implode(tList, tDelimiter);
}

export function replaceChars(tString, tCharA, tCharB) {
  return getStringServices().replaceChars(tString, tCharA, tCharB);
}

export function replaceChunks(tString, tChunkA, tChunkB) {
  return getStringServices().replaceChunks(tString, tChunkA, tChunkB);
}

export function urlEncode(tString) {
  return getStringServices().urlEncode(tString);
}

export function obfuscate(tString) {
  return getStringServices().obfuscate(tString);
}

export function deobfuscate(tString) {
  return getStringServices().deobfuscate(tString);
}

export function getLocalFloat(tStrFloat) {
  return getStringServices().getLocalFloat(tStrFloat);
}

export function encodeUTF8(tStr) {
  return getStringServices().encodeUTF8(tStr);
}

export function decodeUTF8(tStr, tForceDecode) {
  return getStringServices().decodeUTF8(tStr, tForceDecode);
}
