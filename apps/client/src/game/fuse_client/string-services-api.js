// String Services API
// Translated from: 16_String Services API.ls

import {
  charOf,
  itemOf,
  length,
  offset,
  propList,
  the,
  voidp,
  wordOf,
} from "../../director";

export default function () {
  return {
    constructStringServices() {
      return _director.createManager(
        Symbol.for("string_services"),
        _director.getClassVariable("string.services.class"),
      );
    },

    deconstructStringServices() {
      return _director.removeManager(Symbol.for("string_services"));
    },

    getStringServices() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("string_services"))) {
        return this.constructStringServices();
      }
      return tMgr.getManager(Symbol.for("string_services"));
    },

    convertToPropList(tString, tDelimiter) {
      let tOldDelim = the.itemDelimiter;
      if (voidp(tDelimiter)) {
        tDelimiter = ",";
      }
      the.itemDelimiter = tDelimiter;
      const tProps = propList();
      for (let i = 1; i <= itemOf(tString).count; i++) {
        let tPair = wordOf(itemOf(tString)[i]).slice(
          1,
          wordOf(itemOf(tString)[i]).count,
        );
        let tProp = charOf(tPair).slice(1, offset("=", tPair) - 1);
        let tValue = charOf(tPair).slice(
          offset("=", tPair) + 1,
          length(tString),
        );
        tProps[wordOf(tProp).slice(1, wordOf(tProp).count)] = wordOf(
          tValue,
        ).slice(1, wordOf(tValue).count);
      }
      the.itemDelimiter = tOldDelim;
      return tProps;
    },

    convertToLowerCase(tString) {
      return this.getStringServices().convertToLowerCase(tString);
    },

    convertToHigherCase(tString) {
      return this.getStringServices().convertToHigherCase(tString);
    },

    convertSpecialChars(tString, tDirection) {
      return this.getStringServices().convertSpecialChars(tString, tDirection);
    },

    convertIntToHex(tInt) {
      return this.getStringServices().convertIntToHex(tInt);
    },

    convertHexToInt(tHex) {
      return this.getStringServices().convertHexToInt(tHex);
    },

    explode(tString, tDelimiter, tLimit) {
      return this.getStringServices().explode(tString, tDelimiter, tLimit);
    },

    implode(tList, tDelimiter) {
      return this.getStringServices().implode(tList, tDelimiter);
    },

    replaceChars(tString, tCharA, tCharB) {
      return this.getStringServices().replaceChars(tString, tCharA, tCharB);
    },

    replaceChunks(tString, tChunkA, tChunkB) {
      return this.getStringServices().replaceChunks(tString, tChunkA, tChunkB);
    },

    urlEncode(tString) {
      return this.getStringServices().urlEncode(tString);
    },

    obfuscate(tString) {
      return this.getStringServices().obfuscate(tString);
    },

    deobfuscate(tString) {
      return this.getStringServices().deobfuscate(tString);
    },

    getLocalFloat(tStrFloat) {
      return this.getStringServices().getLocalFloat(tStrFloat);
    },

    encodeUTF8(tStr) {
      return this.getStringServices().encodeUTF8(tStr);
    },

    decodeUTF8(tStr, tForceDecode) {
      return this.getStringServices().decodeUTF8(tStr, tForceDecode);
    },
  };
}
