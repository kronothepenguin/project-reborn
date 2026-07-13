export default class {
  pConvList;
  pDigits;
  pUsesUTF8;
  pUnicodeDirector;

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
  }

  getUTF8ObjInstance() {
    const tUTF8ObjectName = "Localized UTF8 converter";
    const tutf8convclassname = "UTF8 To Locale Class";
    let tUTF8Object;
    if (objectExists(tUTF8ObjectName)) {
      tUTF8Object = getObject(tUTF8ObjectName);
    } else {
      if (variableExists("local.utf8.conversion")) {
        const tConversionFormat = getVariable("local.utf8.conversion");
        tUTF8Object = createObject(tUTF8ObjectName, tutf8convclassname);
        if (!(tUTF8Object == VOID)) {
          tUTF8Object.defineLocale(tConversionFormat);
        }
      } else {
        return VOID;
      }
    }
    return tUTF8Object;
  }

  convertToPropList(tStr, tDelim) {
    const tOldDelim = the.itemDelimiter;
    if (tDelim == VOID) {
      tDelim = ",";
    }
    the.itemDelimiter = tDelim;
    const tProps = propList();
    for (let i = 1; i <= tStr.item.count; i++) {
      const tPair = tStr.item[i].word[`1..${tStr.item[i].word.count}`];
      const tProp = tPair.char[`1..${offset("=", tPair) - 1}`];
      const tValue = tPair.char[`${offset("=", tPair) + 1}..${length(tStr)}`];
      tProps[tProp.word[`1..${tProp.word.count}`]] = tValue.word[`1..${tValue.word.count}`];
    }
    the.itemDelimiter = tOldDelim;
    return tProps;
  }

  convertToLowerCase(tString) {
    let tValueStr = EMPTY;
    for (let i = 1; i <= length(tString); i++) {
      let tChar = tString.char[i];
      const tNum = charToNum(tChar);
      if ((tNum >= 65) && (tNum <= 90)) {
        tChar = numToChar(tNum + 32);
      }
      tValueStr = `${tValueStr}${tChar}`;
    }
    return tValueStr;
  }

  convertToHigherCase(tString) {
    let tValueStr = EMPTY;
    for (let i = 1; i <= length(tString); i++) {
      let tChar = tString.char[i];
      const tNum = charToNum(tChar);
      if ((tNum >= 97) && (tNum <= 122)) {
        tChar = numToChar(tNum - 32);
      }
      tValueStr = `${tValueStr}${tChar}`;
    }
    return tValueStr;
  }

  convertSpecialChars(tString, tDirection) {
    let tRetString = EMPTY;
    const tLength = tString.length;
    if (voidp(tDirection)) {
      tDirection = 0;
    }
    if (tDirection == 0) {
      for (let pos = 1; pos <= tLength; pos++) {
        const tChar = char(pos).of(tString);
        const tConv = this.pConvList[tChar];
        if (!voidp(tConv)) {
          putAfter(tRetString, tConv);
          continue;
        }
        putAfter(tRetString, tChar);
      }
    } else {
      for (let pos = 1; pos <= tLength; pos++) {
        const tChar = char(pos).of(tString);
        const tPos = this.pConvList.getPos(tChar);
        if (tPos > 0) {
          putAfter(tRetString, this.pConvList.getPropAt(tPos));
          continue;
        }
        putAfter(tRetString, tChar);
      }
    }
    return tRetString;
  }

  convertIntToHex(tInt) {
    if (tInt <= 0) {
      return "00";
    } else {
      let tHexstr = EMPTY;
      while (tInt > 0) {
        const tD = tInt % 16;
        tInt = tInt / 16;
        tHexstr = `${this.pDigits.char[tD + 1]}${tHexstr}`;
      }
    }
    if ((length(tHexstr) % 2) == 1) {
      tHexstr = `0${tHexstr}`;
    }
    return tHexstr;
  }

  convertHexToInt(tHex) {
    let tBase = 1;
    let tValue = 0;
    while (length(tHex) > 0) {
      const tLc = the.lastCharIn(tHex);
      deleteChunk(tHex, "-30000");
      const tVl = offset(tLc, this.pDigits) - 1;
      tValue = tValue + (tBase * tVl);
      tBase = tBase * 16;
    }
    return tValue;
  }

  explode(tStr, tDelim, tLimit) {
    const tList = list();
    if (voidp(tStr)) {
      return tList;
    }
    if (voidp(tLimit)) {
      tLimit = the.maxInteger;
    }
    const tDelimLength = length(tDelim);
    let tPos = 0;
    while (1) {
      tPos = offset(tDelim, tStr);
      if (tPos == 0) {
        break;
      }
      const tSubStr = tStr.char[`1..${tPos - 1}`];
      tList.add(tSubStr);
      deleteChunk(tStr, `1..${tPos + tDelimLength - 1}`);
      if (tList.count == (tLimit - 1)) {
        tList.add(tStr);
        return tList;
      }
    }
    if (tPos == 0) {
      tPos = 1 - tDelimLength;
    }
    tList.add(tStr.char[`${tPos + tDelimLength}..${length(tStr)}`]);
    return tList;
  }

  implode(tList, tDelim) {
    if (voidp(tDelim)) {
      return 0;
    }
    if (voidp(tList)) {
      return 0;
    }
    let tStr = EMPTY;
    for (const tListItem of tList) {
      tStr = `${tStr}${tListItem}${tDelim}`;
    }
    tStr = chars(tStr, 1, tStr.length - tDelim.length);
    return tStr;
  }

  replaceChars(tString, tCharA, tCharB) {
    if (tCharA == tCharB) {
      return tString;
    }
    while (offset(tCharA, tString) > 0) {
      putInto(char(offset(tCharA, tString)).of(tString), tCharB);
    }
    return tString;
  }

  replaceChunks(tString, tChunkA, tChunkB) {
    let tStr = EMPTY;
    if (voidp(tString) || voidp(tChunkA) || voidp(tChunkB)) {
      error(this, "At least one of the parameters was void!", this.getID(), Symbol.for("replaceChunks"), Symbol.for("minor"));
      return tStr;
    }
    while (tString.contains(tChunkA)) {
      const tPos = offset(tChunkA, tString) - 1;
      if (tPos > 0) {
        putAfter(tStr, tString.char[`1..${tPos}`]);
      }
      putAfter(tStr, tChunkB);
      deleteChunk(tString, `1..${tPos + length(tChunkA)}`);
    }
    putAfter(tStr, tString);
    return tStr;
  }

  urlEncode(tStr) {
    let tEncodedStr = EMPTY;
    const tOkChars = "-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_";
    for (let i = 1; i <= tStr.length; i++) {
      const tChar = tStr.char[i];
      if (offset(tChar, tOkChars)) {
        putAfter(tEncodedStr, tChar);
        continue;
      }
      if (tChar == SPACE) {
        putAfter(tEncodedStr, "+");
        continue;
      }
      putAfter(tEncodedStr, `%${rgb(charToNum(tChar), 0, 0).hexString().char[`2..3`]}`);
    }
    return tEncodedStr;
  }

  obfuscate(tStr) {
    let tResult = EMPTY;
    for (let i = 1; i <= tStr.length; i++) {
      const tNumber = charToNum(tStr.char[i]);
      let tNewNumber1 = bitAnd(tNumber, 15) * 2;
      let tNewNumber2 = bitAnd(tNumber, 240) / 8;
      let tRandom = random(6) + 1;
      tNewNumber1 = tNewNumber1 + (bitAnd(tRandom, 6) * 16) + bitAnd(tRandom, 1);
      tRandom = random(6) + 1;
      tNewNumber2 = tNewNumber2 + (bitAnd(tRandom, 6) * 16) + bitAnd(tRandom, 1);
      tResult = `${tResult}${numToChar(tNewNumber2)}${numToChar(tNewNumber1)}`;
    }
    return tResult;
  }

  deobfuscate(tStr) {
    let tResult = EMPTY;
    for (let i = 1; i <= tStr.length; i++) {
      if (i >= tStr.length) {
        break;
      }
      const tRawNumbers = list(charToNum(tStr.char[i + 1]), charToNum(tStr.char[i]));
      const tNumbers = list(bitAnd(tRawNumbers[1], 30) / 2, bitAnd(tRawNumbers[2], 30) * 8);
      const tNumber = bitOr(tNumbers[1], tNumbers[2]);
      tResult = `${tResult}${numToChar(tNumber)}`;
      i = i + 1;
    }
    return tResult;
  }

  getLocalFloat(tStrFloat) {
    if (!stringp(tStrFloat)) {
      return float(tStrFloat);
    }
    if (!(tStrFloat.contains("."))) {
      return float(tStrFloat);
    }
    let tStrFloatLocal = tStrFloat;
    if (!(value("1.2") > value("1.0"))) {
      putInto(char(offset(".", tStrFloat)).of(tStrFloatLocal), ",");
    }
    return float(tStrFloatLocal);
  }

  encodeUTF8(tStr) {
    if (voidp(this.pUsesUTF8)) {
      const tVar = "client.textdata.utf8";
      if (variableExists(tVar)) {
        this.pUsesUTF8 = getVariableValue(tVar);
      } else {
        this.pUsesUTF8 = VOID;
      }
    }
    if (!this.pUsesUTF8) {
      return tStr;
    }
    const tUnicodeData = this.convertToUnicode(tStr);
    const tUTF8Data = list();
    for (let i = 1; i <= tUnicodeData.count; i++) {
      const tValue = tUnicodeData[i];
      if (tValue < 128) {
        tUTF8Data.add(tValue);
        continue;
      }
      if (tValue < 2048) {
        tUTF8Data.add(192 + bitAnd(tValue / 64, 31));
        tUTF8Data.add(128 + bitAnd(tValue, 63));
        continue;
      }
      if (tValue < 65536) {
        tUTF8Data.add(224 + bitAnd(tValue / (64 * 64), 15));
        tUTF8Data.add(128 + bitAnd(tValue / 64, 63));
        tUTF8Data.add(128 + bitAnd(tValue, 63));
      }
    }
    const tResult = this.generateStringFromUTF8(tUTF8Data);
    return tResult;
  }

  decodeUTF8(tStr, tForceDecode) {
    if (voidp(this.pUsesUTF8)) {
      const tVar = "client.textdata.utf8";
      if (variableExists(tVar)) {
        this.pUsesUTF8 = getVariableValue(tVar);
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
    this.getUTF8ObjInstance();
    const tBinData = list();
    const tCutPos = 1000;
    while (tStr.length > 0) {
      let tSubStr;
      if (tStr.length >= tCutPos) {
        tSubStr = tStr.char[`1..${tCutPos}`];
        tStr = tStr.char[`${tCutPos + 1}..${tStr.length}`];
      } else {
        tSubStr = tStr;
        tStr = EMPTY;
      }
      const tLength = tSubStr.length;
      for (let i = 1; i <= tLength; i++) {
        const tChar = tSubStr.char[i];
        const tValue = charToNum(tChar);
        if (tValue < 255) {
          tBinData.add(tValue);
          continue;
        }
        tBinData.add(tValue / 256);
        if ((tValue % 256) != 0) {
          tBinData.add(tValue % 256);
        }
      }
    }
    const tUnicodeData = list();
    let i = 1;
    while (i <= tBinData.count) {
      const tValue = tBinData[i];
      if (tValue < 128) {
        tUnicodeData.add(tValue);
      } else {
        if (tValue > 224) {
          if (i <= (tBinData.count + 2)) {
            const tValue2 = tBinData[i + 1];
            const tValue3 = tBinData[i + 2];
            const tResVal = (((bitAnd(tValue, 15) * 64) + bitAnd(tValue2, 63)) * 64) + bitAnd(tValue3, 63);
            tUnicodeData.add(tResVal);
          }
          i = i + 2;
        } else {
          if (tValue > 192) {
            if (i <= (tBinData.count + 1)) {
              const tValue2 = tBinData[i + 1];
              const tResVal = (bitAnd(tValue, 31) * 64) + bitAnd(tValue2, 63);
              tUnicodeData.add(tResVal);
            }
            i = i + 1;
          }
        }
      }
      i = i + 1;
    }
    const tResult = this.convertFromUnicode(tUnicodeData);
    return tResult;
  }

  convertToUnicode(tStr) {
    if (!this.pUnicodeDirector) {
      const tUTF8Object = this.getUTF8ObjInstance();
      if (!voidp(tUTF8Object)) {
        const tdata = call(Symbol.for("convertToUnicode"), list(tUTF8Object), tStr);
        if (ilk(tdata) == Symbol.for("list")) {
          return tdata;
        }
      }
    }
    const tUnicodeData = list();
    for (let i = 1; i <= tStr.length; i++) {
      const tChar = tStr.char[i];
      const tValue = charToNum(tChar);
      tUnicodeData.add(tValue);
    }
    return tUnicodeData;
  }

  generateStringFromUTF8(tUTF8Data) {
    if (!this.pUnicodeDirector) {
      const tUTF8Object = this.getUTF8ObjInstance();
      if (!voidp(tUTF8Object)) {
        const tString = call(Symbol.for("generateStringFromUTF8"), list(tUTF8Object), tUTF8Data);
        if (ilk(tString) == Symbol.for("string")) {
          return tString;
        }
      }
    }
    let tResult = EMPTY;
    for (let i = 1; i <= tUTF8Data.count; i++) {
      tResult = `${tResult}${numToChar(tUTF8Data[i])}`;
    }
    return tResult;
  }

  convertFromUnicode(tUnicodeData) {
    if (!this.pUnicodeDirector) {
      const tUTF8Object = this.getUTF8ObjInstance();
      if (!voidp(tUTF8Object)) {
        const tdata = call(Symbol.for("convertFromUnicode"), list(tUTF8Object), tUnicodeData);
        if (ilk(tdata) == Symbol.for("string")) {
          return tdata;
        }
      }
    }
    let tResult = EMPTY;
    const tCutPos = 1000;
    let i = 0;
    while (i < tUnicodeData.count) {
      let tCount;
      if ((i + tCutPos) <= tUnicodeData.count) {
        tCount = tCutPos;
      } else {
        tCount = tUnicodeData.count - i;
      }
      let tSubResult = EMPTY;
      for (let j = 1; j <= tCount; j++) {
        tSubResult = `${tSubResult}${numToChar(tUnicodeData[i + j])}`;
      }
      i = i + tCount;
      tResult = `${tResult}${tSubResult}`;
    }
    return tResult;
  }

  initConvList() {
    if (this.pUnicodeDirector) {
      setVariable("char.conversion.mac", propList());
      setVariable("char.conversion.win", propList());
      return 1;
    }
    let tMachineType;
    if (the.platform.contains("win")) {
      tMachineType = ".win";
    } else {
      tMachineType = ".mac";
    }
    this.pConvList = propList();
    const tCharList = getVariableValue(`char.conversion${tMachineType}`, propList());
    for (let i = 1; i <= tCharList.count; i++) {
      let tKey = tCharList.getPropAt(i);
      let tVal = tCharList[i];
      if (integerp(integer(tKey))) {
        tKey = numToChar(integer(tKey));
      }
      if (integerp(integer(tVal))) {
        tVal = numToChar(integer(tVal));
      }
      this.pConvList[tKey] = tVal;
    }
    return 1;
  }
}
