import {
  EMPTY,
  VOID,
  call,
  charOf,
  charToNum,
  chars,
  ilk,
  integerp,
  itemOf,
  length,
  numToChar,
  offset,
  propList,
  random,
  rgb,
  stringp,
  the,
  value,
  voidp,
  wordOf,
} from "../../director";

export default function () {
  let tUTF8ObjectName, tutf8convclassname, tUTF8Object, tConversionFormat;
  let tOldDelim, tDelim, tProps, i, tPair, tProp, tValue;
  let tValueStr, tChar, tNum;
  let tRetString, tLength, tDirection, pos, tConv, tPos;
  let tInt, tD, tHexstr, tBase, tVl, tLc, tHex;
  let tList, tLimit, tDelimLength, tSubStr, tStr, tListItem;
  let tChunkA, tChunkB;
  let tEncodedStr, tOkChars;
  let tResult, tNumber, tNewNumber1, tNewNumber2, tRandom, tRawNumbers, tNumbers;
  let tStrFloat, tStrFloatLocal, tVar;
  let tUnicodeData, tUTF8Data, tValue2, tValue3, tResVal;
  let tUTF8Obj, tBinData, tCutPos, tSubResult, j, tCount;
  let tdata, tString;
  let tMachineType, tCharList, tKey, tVal;

  return {
    pConvList: VOID,
    pDigits: VOID,
    pUsesUTF8: VOID,
    pUnicodeDirector: VOID,

    construct() {
      this.pConvList = propList();
      this.pDigits = "0123456789ABCDEF";
      this.pUsesUTF8 = VOID;
      if (value(_player.productVersion) >= 11) {
        this.pUnicodeDirector = 1;
      } else {
        this.pUnicodeDirector = 0;
      }
      this.initConvList();
      return 1;
    },

    getUTF8ObjInstance() {
      tUTF8ObjectName = "Localized UTF8 converter";
      tutf8convclassname = "UTF8 To Locale Class";
      if (_director.objectExists(tUTF8ObjectName)) {
        tUTF8Object = _director.getObject(tUTF8ObjectName);
      } else {
        if (_director.variableExists("local.utf8.conversion")) {
          tConversionFormat = _director.getVariable("local.utf8.conversion");
          tUTF8Object = _director.createObject(tUTF8ObjectName, tutf8convclassname);
          if (tUTF8Object !== VOID) {
            tUTF8Object.defineLocale(tConversionFormat);
          }
        } else {
          return VOID;
        }
      }
      return tUTF8Object;
    },

    convertToPropList(tStr, tDelim) {
      tOldDelim = the.itemDelimiter;
      if (tDelim === VOID) {
        tDelim = ",";
      }
      the.itemDelimiter = tDelim;
      tProps = propList();
      for (i = 1; i <= itemOf(tStr).count; i++) {
        tPair = wordOf(itemOf(tStr)[i]).slice(1, wordOf(itemOf(tStr)[i]).count);
        tProp = charOf(tPair).slice(1, offset("=", tPair) - 1);
        tValue = charOf(tPair).slice(offset("=", tPair) + 1, length(tStr));
        tProps[wordOf(tProp).slice(1, wordOf(tProp).count)] = wordOf(tValue).slice(1, wordOf(tValue).count);
      }
      the.itemDelimiter = tOldDelim;
      return tProps;
    },

    convertToLowerCase(tString) {
      tValueStr = EMPTY;
      for (i = 1; i <= length(tString); i++) {
        tChar = charOf(tString)[i];
        tNum = charToNum(tChar);
        if (tNum >= 65 && tNum <= 90) {
          tChar = numToChar(tNum + 32);
        }
        tValueStr = tValueStr + tChar;
      }
      return tValueStr;
    },

    convertToHigherCase(tString) {
      tValueStr = EMPTY;
      for (i = 1; i <= length(tString); i++) {
        tChar = charOf(tString)[i];
        tNum = charToNum(tChar);
        if (tNum >= 97 && tNum <= 122) {
          tChar = numToChar(tNum - 32);
        }
        tValueStr = tValueStr + tChar;
      }
      return tValueStr;
    },

    convertSpecialChars(tString, tDirection) {
      tRetString = EMPTY;
      tLength = length(tString);
      if (voidp(tDirection)) {
        tDirection = 0;
      }
      if (tDirection === 0) {
        for (pos = 1; pos <= tLength; pos++) {
          tChar = charOf(tString)[pos];
          tConv = this.pConvList[tChar];
          if (!voidp(tConv)) {
            tRetString = tRetString + tConv;
            continue;
          }
          tRetString = tRetString + tChar;
        }
      } else {
        for (pos = 1; pos <= tLength; pos++) {
          tChar = charOf(tString)[pos];
          tPos = this.pConvList.getPos(tChar);
          if (tPos > 0) {
            tRetString = tRetString + this.pConvList.getPropAt(tPos);
            continue;
          }
          tRetString = tRetString + tChar;
        }
      }
      return tRetString;
    },

    convertIntToHex(tInt) {
      if (tInt <= 0) {
        return "00";
      } else {
        tHexstr = EMPTY;
        while (tInt > 0) {
          tD = tInt % 16;
          tInt = Math.floor(tInt / 16);
          tHexstr = charOf(this.pDigits)[tD + 1] + tHexstr;
        }
      }
      if (length(tHexstr) % 2 === 1) {
        tHexstr = "0" + tHexstr;
      }
      return tHexstr;
    },

    convertHexToInt(tHex) {
      tBase = 1;
      tValue = 0;
      while (length(tHex) > 0) {
        tLc = charOf(tHex)[length(tHex)];
        tHex = charOf(tHex).slice(1, length(tHex) - 1);
        tVl = offset(tLc, this.pDigits) - 1;
        tValue = tValue + (tBase * tVl);
        tBase = tBase * 16;
      }
      return tValue;
    },

    explode(tStr, tDelim, tLimit) {
      tList = [];
      if (voidp(tStr)) {
        return tList;
      }
      if (voidp(tLimit)) {
        tLimit = the.maxinteger;
      }
      tDelimLength = length(tDelim);
      while (1) {
        tPos = offset(tDelim, tStr);
        if (tPos === 0) {
          break;
        }
        tSubStr = charOf(tStr).slice(1, tPos - 1);
        tList.add(tSubStr);
        tStr = charOf(tStr).slice(tPos + tDelimLength, length(tStr));
        if (tList.count === (tLimit - 1)) {
          tList.add(tStr);
          return tList;
        }
      }
      if (tPos === 0) {
        tPos = 1 - tDelimLength;
      }
      tList.add(charOf(tStr).slice(tPos + tDelimLength, length(tStr)));
      return tList;
    },

    implode(tList, tDelim) {
      if (voidp(tDelim)) {
        return 0;
      }
      if (voidp(tList)) {
        return 0;
      }
      tStr = EMPTY;
      for (tListItem of tList) {
        tStr = tStr + tListItem + tDelim;
      }
      tStr = chars(tStr, 1, length(tStr) - length(tDelim));
      return tStr;
    },

    replaceChars(tString, tCharA, tCharB) {
      if (tCharA === tCharB) {
        return tString;
      }
      while (offset(tCharA, tString) > 0) {
        tString = charOf(tString).slice(1, offset(tCharA, tString) - 1) + tCharB + charOf(tString).slice(offset(tCharA, tString) + 1, length(tString));
      }
      return tString;
    },

    replaceChunks(tString, tChunkA, tChunkB) {
      tStr = EMPTY;
      if (voidp(tString) || voidp(tChunkA) || voidp(tChunkB)) {
        _director.error(this, "At least one of the parameters was void!", this.getID(), Symbol.for("replaceChunks"), Symbol.for("minor"));
        return tStr;
      }
      while (tString.includes(tChunkA)) {
        tPos = offset(tChunkA, tString) - 1;
        if (tPos > 0) {
          tStr = tStr + charOf(tString).slice(1, tPos);
        }
        tStr = tStr + tChunkB;
        tString = charOf(tString).slice(tPos + length(tChunkA) + 1, length(tString));
      }
      tStr = tStr + tString;
      return tStr;
    },

    urlEncode(tStr) {
      tEncodedStr = EMPTY;
      tOkChars = "-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_";
      for (i = 1; i <= length(tStr); i++) {
        tChar = charOf(tStr)[i];
        if (offset(tChar, tOkChars)) {
          tEncodedStr = tEncodedStr + tChar;
          continue;
        }
        if (tChar === " ") {
          tEncodedStr = tEncodedStr + "+";
          continue;
        }
        tEncodedStr = tEncodedStr + "%" + rgb(charToNum(tChar), 0, 0).hexString().slice(1, 3);
      }
      return tEncodedStr;
    },

    obfuscate(tStr) {
      tResult = EMPTY;
      for (i = 1; i <= length(tStr); i++) {
        tNumber = charToNum(charOf(tStr)[i]);
        tNewNumber1 = (tNumber & 15) * 2;
        tNewNumber2 = Math.floor((tNumber & 240) / 8);
        tRandom = random(6) + 1;
        tNewNumber1 = tNewNumber1 + ((tRandom & 6) * 16) + (tRandom & 1);
        tRandom = random(6) + 1;
        tNewNumber2 = tNewNumber2 + ((tRandom & 6) * 16) + (tRandom & 1);
        tResult = tResult + numToChar(tNewNumber2) + numToChar(tNewNumber1);
      }
      return tResult;
    },

    deobfuscate(tStr) {
      tResult = EMPTY;
      for (i = 1; i <= length(tStr); i++) {
        if (i >= length(tStr)) {
          break;
        }
        tRawNumbers = [charToNum(charOf(tStr)[i + 1]), charToNum(charOf(tStr)[i])];
        tNumbers = [Math.floor((tRawNumbers[0] & 30) / 2), (tRawNumbers[1] & 30) * 8];
        tNumber = tNumbers[0] | tNumbers[1];
        tResult = tResult + numToChar(tNumber);
        i = i + 1;
      }
      return tResult;
    },

    getLocalFloat(tStrFloat) {
      if (!stringp(tStrFloat)) {
        return parseFloat(tStrFloat);
      }
      if (!tStrFloat.includes(".")) {
        return parseFloat(tStrFloat);
      }
      tStrFloatLocal = tStrFloat;
      if (!(value("1.2") > value("1.0"))) {
        tStrFloatLocal = charOf(tStrFloat).slice(1, offset(".", tStrFloat) - 1) + "," + charOf(tStrFloat).slice(offset(".", tStrFloat) + 1, length(tStrFloat));
      }
      return parseFloat(tStrFloatLocal);
    },

    encodeUTF8(tStr) {
      if (voidp(this.pUsesUTF8)) {
        tVar = "client.textdata.utf8";
        if (_director.variableExists(tVar)) {
          this.pUsesUTF8 = _director.getVariableValue(tVar);
        } else {
          this.pUsesUTF8 = VOID;
        }
      }
      if (!this.pUsesUTF8) {
        return tStr;
      }
      tUnicodeData = this.convertToUnicode(tStr);
      tUTF8Data = [];
      for (i = 1; i <= tUnicodeData.count; i++) {
        tValue = tUnicodeData[i];
        if (tValue < 128) {
          tUTF8Data.add(tValue);
          continue;
        }
        if (tValue < 2048) {
          tUTF8Data.add(192 + (Math.floor(tValue / 64) & 31));
          tUTF8Data.add(128 + (tValue & 63));
          continue;
        }
        if (tValue < 65536) {
          tUTF8Data.add(224 + (Math.floor(tValue / (64 * 64)) & 15));
          tUTF8Data.add(128 + (Math.floor(tValue / 64) & 63));
          tUTF8Data.add(128 + (tValue & 63));
        }
      }
      tResult = this.generateStringFromUTF8(tUTF8Data);
      return tResult;
    },

    decodeUTF8(tStr, tForceDecode) {
      if (voidp(this.pUsesUTF8)) {
        tVar = "client.textdata.utf8";
        if (_director.variableExists(tVar)) {
          this.pUsesUTF8 = _director.getVariableValue(tVar);
        } else {
          this.pUsesUTF8 = VOID;
        }
      }
      if (!this.pUsesUTF8) {
        return tStr;
      }
      if (this.pUnicodeDirector && !tForceDecode) {
        return tStr;
      }
      tUTF8Obj = this.getUTF8ObjInstance();
      tBinData = [];
      tCutPos = 1000;
      while (length(tStr) > 0) {
        if (length(tStr) >= tCutPos) {
          tSubStr = charOf(tStr).slice(1, tCutPos);
          tStr = charOf(tStr).slice(tCutPos + 1, length(tStr));
        } else {
          tSubStr = tStr;
          tStr = EMPTY;
        }
        tLength = length(tSubStr);
        for (i = 1; i <= tLength; i++) {
          tChar = charOf(tSubStr)[i];
          tValue = charToNum(tChar);
          if (tValue < 255) {
            tBinData.add(tValue);
            continue;
          }
          tBinData.add(Math.floor(tValue / 256));
          if (tValue % 256 !== 0) {
            tBinData.add(tValue % 256);
          }
        }
      }
      tUnicodeData = [];
      i = 1;
      while (i <= tBinData.count) {
        tValue = tBinData[i];
        if (tValue < 128) {
          tUnicodeData.add(tValue);
        } else {
          if (tValue > 224) {
            if (i <= (tBinData.count - 2)) {
              tValue2 = tBinData[i + 1];
              tValue3 = tBinData[i + 2];
              tResVal = ((((tValue & 15) * 64) + (tValue2 & 63)) * 64) + (tValue3 & 63);
              tUnicodeData.add(tResVal);
            }
            i = i + 2;
          } else {
            if (tValue > 192) {
              if (i <= (tBinData.count - 1)) {
                tValue2 = tBinData[i + 1];
                tResVal = ((tValue & 31) * 64) + (tValue2 & 63);
                tUnicodeData.add(tResVal);
              }
              i = i + 1;
            }
          }
        }
        i = i + 1;
      }
      tResult = this.convertFromUnicode(tUnicodeData);
      return tResult;
    },

    convertToUnicode(tStr) {
      if (!this.pUnicodeDirector) {
        tUTF8Object = this.getUTF8ObjInstance();
        if (!voidp(tUTF8Object)) {
          tdata = call(Symbol.for("convertToUnicode"), [tUTF8Object], tStr);
          if (ilk(tdata) === Symbol.for("list")) {
            return tdata;
          }
        }
      }
      tUnicodeData = [];
      for (i = 1; i <= length(tStr); i++) {
        tChar = charOf(tStr)[i];
        tValue = charToNum(tChar);
        tUnicodeData.add(tValue);
      }
      return tUnicodeData;
    },

    generateStringFromUTF8(tUTF8Data) {
      if (!this.pUnicodeDirector) {
        tUTF8Object = this.getUTF8ObjInstance();
        if (!voidp(tUTF8Object)) {
          tString = call(Symbol.for("generateStringFromUTF8"), [tUTF8Object], tUTF8Data);
          if (ilk(tString) === Symbol.for("string")) {
            return tString;
          }
        }
      }
      tResult = EMPTY;
      for (i = 1; i <= tUTF8Data.count; i++) {
        tResult = tResult + numToChar(tUTF8Data[i]);
      }
      return tResult;
    },

    convertFromUnicode(tUnicodeData) {
      if (!this.pUnicodeDirector) {
        tUTF8Object = this.getUTF8ObjInstance();
        if (!voidp(tUTF8Object)) {
          tdata = call(Symbol.for("convertFromUnicode"), [tUTF8Object], tUnicodeData);
          if (ilk(tdata) === Symbol.for("string")) {
            return tdata;
          }
        }
      }
      tResult = EMPTY;
      tCutPos = 1000;
      i = 0;
      while (i < tUnicodeData.count) {
        if ((i + tCutPos) <= tUnicodeData.count) {
          tCount = tCutPos;
        } else {
          tCount = tUnicodeData.count - i;
        }
        tSubResult = EMPTY;
        for (j = 1; j <= tCount; j++) {
          tSubResult = tSubResult + numToChar(tUnicodeData[i + j]);
        }
        i = i + tCount;
        tResult = tResult + tSubResult;
      }
      return tResult;
    },

    initConvList() {
      if (this.pUnicodeDirector) {
        _director.setVariable("char.conversion.mac", propList());
        _director.setVariable("char.conversion.win", propList());
        return 1;
      }
      if (the.platform.includes("win")) {
        tMachineType = ".win";
      } else {
        tMachineType = ".mac";
      }
      this.pConvList = propList();
      tCharList = _director.getVariableValue("char.conversion" + tMachineType, propList());
      for (i = 1; i <= tCharList.count; i++) {
        tKey = tCharList.getPropAt(i);
        tVal = tCharList[i];
        if (integerp(value(tKey))) {
          tKey = numToChar(value(tKey));
        }
        if (integerp(value(tVal))) {
          tVal = numToChar(value(tVal));
        }
        this.pConvList[tKey] = tVal;
      }
      return 1;
    },
  };
}
