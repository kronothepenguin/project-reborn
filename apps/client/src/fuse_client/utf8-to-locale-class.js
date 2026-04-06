// fuse_client/85_UTF8 To Locale Class.ls → utf8-to-locale-class.js
// UTF8 To Locale - character encoding conversion between locale and Unicode

import {
  symbol,
  stringp,
  voidP,
  length,
  charToNum,
  numToChar,
  member,
  error,
  createPropList,
  EMPTY,
} from '../core/lingo-runtime.js'

export class UTF8ToLocaleClass {
  constructor() {
    this.pUnicodeValues = []
    this.plocalevalues = []
    this.plocaleformat = ''
  }

  construct() {
    this.pUnicodeValues = []
    this.plocalevalues = []
    this.plocaleformat = ''
  }

  defineLocale(tlocaleformat) {
    if ((tlocaleformat !== 'sjis') && (tlocaleformat !== 'windows-1251')) {
      return error(this, 'Invalid locale format: ' + tlocaleformat, symbol('#defineLocale'), symbol('#major'))
    }
    this.plocaleformat = tlocaleformat
    const tResult = this.createcharacterconversionarrays(tlocaleformat)
    this.pUnicodeValues = tResult.unicode_values || []
    this.plocalevalues = tResult.locale_values || []
  }

  convertToUnicode(tStr) {
    if ((this.pUnicodeValues.length === 0) || (this.plocalevalues.length === 0)) {
      return 0
    }
    const tUnicodeData = []
    for (let i = 0; i < tStr.length; i++) {
      const tChar = tStr[i]
      const tValue = charToNum(tChar)
      let tUnicodeValue = 0
      const tIndex = tValue + 1
      if (tValue < 128) {
        tUnicodeValue = tValue
      } else {
        if (tIndex <= this.pUnicodeValues.length) {
          tUnicodeValue = this.pUnicodeValues[tIndex - 1]
        }
      }
      if (tUnicodeValue > 0) {
        tUnicodeData.push(tUnicodeValue)
      }
    }
    return tUnicodeData
  }

  convertFromUnicode(tUnicodeData) {
    if ((this.pUnicodeValues.length === 0) || (this.plocalevalues.length === 0)) {
      return 0
    }
    let tResult = ''
    for (let i = 0; i < tUnicodeData.length; i++) {
      const tUnicodeValue = tUnicodeData[i]
      let tlocalevalue = 0
      const tIndex = tUnicodeValue + 1
      if (tUnicodeValue < 128) {
        tlocalevalue = tUnicodeValue
      } else {
        if (tIndex <= this.plocalevalues.length) {
          tlocalevalue = this.plocalevalues[tIndex - 1]
        }
      }
      if (tlocalevalue > 0) {
        tResult += numToChar(tlocalevalue)
      }
    }
    return tResult
  }

  generateStringFromUTF8(tUTF8Data) {
    if (this.plocaleformat === 'windows-1251') {
      return null
    }
    let tResult = ''
    let i = 0
    while (i < tUTF8Data.length) {
      let tValue = tUTF8Data[i]
      i++
      if (((tValue >= 129) && (tValue <= 159)) || ((tValue >= 224) && (tValue <= 239))) {
        if (i < tUTF8Data.length) {
          tValue = (tValue * 256) + tUTF8Data[i]
          i++
        }
      }
      tResult += numToChar(tValue)
    }
    return tResult
  }

  createcharacterconversionarrays(tencodingformat) {
    const tUnicodeValues = []
    const tlocalevalues = []
    let tText = ''
    switch (tencodingformat) {
      case 'sjis':
        // tText = member('Shift JIS to Unicode map').text
        tText = ''
        break
      case 'windows-1251':
        // tText = member('Windows-1251 to Unicode map').text
        tText = ''
        break
    }
    if (stringp(tText) && tText.length > 0) {
      const lines = tText.split('\n')
      for (const tLine of lines) {
        const trimmed = tLine.trim()
        if (!trimmed) continue
        const parts = trimmed.split(/\s+/)
        if (parts.length >= 2) {
          let tvaluelocale = parts[0]
          let tValueUnicode = parts[1]
          if (tvaluelocale.startsWith('0x')) {
            tvaluelocale = tvaluelocale.substring(2)
            if (tValueUnicode.startsWith('0x')) {
              tValueUnicode = tValueUnicode.substring(2)
              const localeInt = this.hextoint(tvaluelocale)
              const unicodeInt = this.hextoint(tValueUnicode)
              tUnicodeValues[localeInt] = unicodeInt
              tlocalevalues[unicodeInt] = localeInt
            }
          }
        }
      }
    }
    return { unicode_values: tUnicodeValues, locale_values: tlocalevalues }
  }

  hextoint(tStr) {
    let tValue = 0
    for (let i = 0; i < tStr.length; i++) {
      tValue *= 16
      const tChar = tStr[i].toLowerCase()
      let tVal = parseInt(tChar, 10)
      if (isNaN(tVal)) {
        switch (tChar) {
          case 'a': tVal = 10; break
          case 'b': tVal = 11; break
          case 'c': tVal = 12; break
          case 'd': tVal = 13; break
          case 'e': tVal = 14; break
          case 'f': tVal = 15; break
          default: tVal = 0
        }
      }
      tValue += tVal
    }
    return tValue
  }
}
