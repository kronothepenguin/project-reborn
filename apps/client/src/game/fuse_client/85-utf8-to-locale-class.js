export default class {
  pUnicodeValues;
  plocalevalues;
  plocaleformat;

  construct() {
    this.pUnicodeValues = propList();
    this.plocalevalues = propList();
    this.plocaleformat = EMPTY;
  }

  defineLocale(tlocaleformat) {
    if ((tlocaleformat != "sjis") && (tlocaleformat != "windows-1251")) {
      return error(this, `Invalid locale format: ${tlocaleformat}`, Symbol.for("defineLocale"), Symbol.for("major"));
    }
    this.plocaleformat = tlocaleformat;
    const tResult = this.createcharacterconversionarrays(tlocaleformat);
    this.pUnicodeValues = tResult["unicode_values"];
    this.plocalevalues = tResult["locale_values"];
  }

  convertToUnicode(tStr) {
    if ((this.pUnicodeValues.count == 0) || (this.plocalevalues.count == 0)) {
      return 0;
    }
    const tUnicodeData = list();
    for (let i = 1; i <= tStr.length; i++) {
      const tChar = tStr.char[i];
      const tValue = charToNum(tChar);
      let tUnicodeValue = 0;
      const tIndex = tValue + 1;
      if (tValue < 128) {
        tUnicodeValue = tValue;
      } else {
        if (tIndex <= this.pUnicodeValues.count) {
          tUnicodeValue = this.pUnicodeValues[tIndex];
        }
      }
      if (tUnicodeValue > 0) {
        tUnicodeData.add(tUnicodeValue);
        continue;
      }
    }
    return tUnicodeData;
  }

  convertFromUnicode(tUnicodeData) {
    if ((this.pUnicodeValues.count == 0) || (this.plocalevalues.count == 0)) {
      return 0;
    }
    let tResult = EMPTY;
    for (let i = 1; i <= tUnicodeData.count; i++) {
      const tUnicodeValue = tUnicodeData[i];
      let tlocalevalue = 0;
      const tIndex = tUnicodeValue + 1;
      if (tUnicodeValue < 128) {
        tlocalevalue = tUnicodeValue;
      } else {
        if (tIndex <= this.plocalevalues.count) {
          tlocalevalue = this.plocalevalues[tIndex];
        }
      }
      if (tlocalevalue > 0) {
        tResult = `${tResult}${numToChar(tlocalevalue)}`;
        continue;
      }
    }
    return tResult;
  }

  generateStringFromUTF8(tUTF8Data) {
    if (this.plocaleformat == "windows-1251") {
      return VOID;
    }
    let tResult = EMPTY;
    let i = 1;
    while (i <= tUTF8Data.count) {
      let tValue = tUTF8Data[i];
      i = i + 1;
      if (((tValue >= 129) && (tValue <= 159)) || ((tValue >= 224) && (tValue <= 239))) {
        if (i <= tUTF8Data.count) {
          tValue = (tValue * 256) + tUTF8Data[i];
          i = i + 1;
        } else {
        }
      }
      tResult = `${tResult}${numToChar(tValue)}`;
    }
    return tResult;
  }

  createcharacterconversionarrays(tencodingformat) {
    const tUnicodeValues = list();
    const tlocalevalues = list();
    let tText = EMPTY;
    switch (tencodingformat) {
      case "sjis":
        tText = member("Shift JIS to Unicode map").text;
        break;
      case "windows-1251":
        tText = member("Windows-1251 to Unicode map").text;
        break;
    }
    if (ilk(tText) == Symbol.for("string")) {
      const tLineCount = the.numberOfLinesIn(tText);
      const tChunkSize = 100;
      let tChunkCount = tLineCount / tChunkSize;
      if ((tLineCount % tChunkSize) != 0) {
        tChunkCount = tChunkCount + 1;
      }
      for (let j = 1; j <= tChunkCount; j++) {
        const tFirstLineIndex = 1 + ((j - 1) * tChunkSize);
        const tLastLineIndex = tFirstLineIndex + tChunkSize - 1;
        const tSubText = tText.line[`${tFirstLineIndex}..${tLastLineIndex}`];
        const tSubLineCount = the.numberOfLinesIn(tSubText);
        for (let i = 1; i <= tSubLineCount; i++) {
          const tLine = line(1).of(tSubText);
          deleteLine(tSubText, 1);
          let tvaluelocale = word(1).of(tLine);
          if (tvaluelocale.char[`1..2`] == "0x") {
            let tValueUnicode = word(2).of(tLine);
            tvaluelocale = tvaluelocale.char[`3..${tvaluelocale.length}`];
            if (tValueUnicode.char[`1..2`] == "0x") {
              tValueUnicode = tValueUnicode.char[`3..${tValueUnicode.length}`];
              tValueUnicode = this.hextoint(tValueUnicode);
              tvaluelocale = this.hextoint(tvaluelocale);
              tUnicodeValues[tvaluelocale + 1] = tValueUnicode;
              tlocalevalues[tValueUnicode + 1] = tvaluelocale;
            }
          }
        }
      }
    }
    return propList("unicode_values", tUnicodeValues, "locale_values", tlocalevalues);
  }

  hextoint(tStr) {
    let tValue = 0;
    for (let i = 1; i <= tStr.length; i++) {
      tValue = tValue * 16;
      const tChar = tStr.char[i];
      let tVal = value(tChar);
      if (voidp(tVal)) {
        if (tChar == "a") {
          tVal = 10;
        } else {
          if (tChar == "b") {
            tVal = 11;
          } else {
            if (tChar == "c") {
              tVal = 12;
            } else {
              if (tChar == "d") {
                tVal = 13;
              } else {
                if (tChar == "e") {
                  tVal = 14;
                } else {
                  if (tChar == "f") {
                    tVal = 15;
                  }
                }
              }
            }
          }
        }
      }
      tValue = tValue + tVal;
    }
    return tValue;
  }
}
