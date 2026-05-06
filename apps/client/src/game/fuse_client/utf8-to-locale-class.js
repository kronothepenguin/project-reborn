import { VOID, EMPTY, charToNum, numToChar, list, member, ilk, value, voidp } from "../../director";
import { lineOf, charOf, wordOf } from "../../director";

export default function () {
  let tResult, tValue, tIndex, tUnicodeValue, tChar, tVal, tUnicodeData, tlocalevalue, tUTF8Data, tLineCount, tChunkSize, tChunkCount, j, tFirstLineIndex, tLastLineIndex, tSubText, tSubLineCount, i, tLine, tvaluelocale, tValueUnicode, tUnicodeValues, tlocalevalues, tText, tencodingformat, tStr;

  return {
    pUnicodeValues: VOID,
    plocalevalues: VOID,
    plocaleformat: VOID,

    construct() {
      this.pUnicodeValues = list();
      this.plocalevalues = list();
      this.plocaleformat = EMPTY;
    },

    defineLocale(tlocaleformat) {
      if ((tlocaleformat !== "sjis") && (tlocaleformat !== "windows-1251")) {
        return _director.error(this, "Invalid locale format: " + tlocaleformat, Symbol.for("defineLocale"), Symbol.for("major"));
      }
      this.plocaleformat = tlocaleformat;
      tResult = this.createcharacterconversionarrays(tlocaleformat);
      this.pUnicodeValues = tResult["unicode_values"];
      this.plocalevalues = tResult["locale_values"];
    },

    convertToUnicode(tStr) {
      if ((this.pUnicodeValues.count === 0) || (this.plocalevalues.count === 0)) {
        return 0;
      }
      tUnicodeData = list();
      for (let i = 1; i <= tStr.length; i++) {
        tChar = charOf(tStr)[i];
        tValue = charToNum(tChar);
        tUnicodeValue = 0;
        tIndex = tValue + 1;
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
    },

    convertFromUnicode(tUnicodeData) {
      if ((this.pUnicodeValues.count === 0) || (this.plocalevalues.count === 0)) {
        return 0;
      }
      tResult = EMPTY;
      for (let i = 1; i <= tUnicodeData.count; i++) {
        tUnicodeValue = tUnicodeData[i];
        tlocalevalue = 0;
        tIndex = tUnicodeValue + 1;
        if (tUnicodeValue < 128) {
          tlocalevalue = tUnicodeValue;
        } else {
          if (tIndex <= this.plocalevalues.count) {
            tlocalevalue = this.plocalevalues[tIndex];
          }
        }
        if (tlocalevalue > 0) {
          tResult = tResult + numToChar(tlocalevalue);
          continue;
        }
      }
      return tResult;
    },

    generateStringFromUTF8(tUTF8Data) {
      if (this.plocaleformat === "windows-1251") {
        return VOID;
      }
      tResult = EMPTY;
      i = 1;
      while (i <= tUTF8Data.count) {
        tValue = tUTF8Data[i];
        i = i + 1;
        if (((tValue >= 129) && (tValue <= 159)) || ((tValue >= 224) && (tValue <= 239))) {
          if (i <= tUTF8Data.count) {
            tValue = (tValue * 256) + tUTF8Data[i];
            i = i + 1;
          } else {
          }
        }
        tResult = tResult + numToChar(tValue);
      }
      return tResult;
    },

    createcharacterconversionarrays(tencodingformat) {
      tUnicodeValues = list();
      tlocalevalues = list();
      tText = EMPTY;
      switch (tencodingformat) {
        case "sjis":
          tText = member("Shift JIS to Unicode map").text;
          break;
        case "windows-1251":
          tText = member("Windows-1251 to Unicode map").text;
          break;
      }
      if (ilk(tText) === Symbol.for("string")) {
        tLineCount = lineOf(tText).count;
        tChunkSize = 100;
        tChunkCount = tLineCount / tChunkSize;
        if ((tLineCount % tChunkSize) !== 0) {
          tChunkCount = tChunkCount + 1;
        }
        for (let j = 1; j <= tChunkCount; j++) {
          tFirstLineIndex = 1 + ((j - 1) * tChunkSize);
          tLastLineIndex = tFirstLineIndex + tChunkSize - 1;
          tSubText = lineOf(tText).slice(tFirstLineIndex, tLastLineIndex);
          tSubLineCount = lineOf(tSubText).count;
          for (let i = 1; i <= tSubLineCount; i++) {
            tLine = lineOf(tSubText)[1];
            // delete line 1 of tSubText — mutate by removing first element
            tSubText = lineOf(tSubText).slice(2, lineOf(tSubText).count);
            tvaluelocale = wordOf(tLine)[1];
            if (charOf(tvaluelocale).slice(1, 2) === "0x") {
              tValueUnicode = wordOf(tLine)[2];
              tvaluelocale = charOf(tvaluelocale).slice(3, tvaluelocale.length);
              if (charOf(tValueUnicode).slice(1, 2) === "0x") {
                tValueUnicode = charOf(tValueUnicode).slice(3, tValueUnicode.length);
                tValueUnicode = this.hextoint(tValueUnicode);
                tvaluelocale = this.hextoint(tvaluelocale);
                tUnicodeValues[tvaluelocale + 1] = tValueUnicode;
                tlocalevalues[tValueUnicode + 1] = tvaluelocale;
              }
            }
          }
        }
      }
      return { "unicode_values": tUnicodeValues, "locale_values": tlocalevalues };
    },

    hextoint(tStr) {
      tValue = 0;
      for (let i = 1; i <= tStr.length; i++) {
        tValue = tValue * 16;
        tChar = charOf(tStr)[i];
        tVal = value(tChar);
        if (voidp(tVal)) {
          if (tChar === "a") {
            tVal = 10;
          } else if (tChar === "b") {
            tVal = 11;
          } else if (tChar === "c") {
            tVal = 12;
          } else if (tChar === "d") {
            tVal = 13;
          } else if (tChar === "e") {
            tVal = 14;
          } else if (tChar === "f") {
            tVal = 15;
          }
        }
        tValue = tValue + tVal;
      }
      return tValue;
    },
  };
}
