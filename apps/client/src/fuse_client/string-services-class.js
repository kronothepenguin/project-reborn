// fuse_client/37_String Services Class.ls → string-services-class.js
// String services - character conversion, encoding, obfuscation

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  length,
  offset,
  chars,
  charToNum,
  numToChar,
  random,
  bitAnd,
  bitOr,
  createPropList,
  error,
  value,
  float,
  variableExists,
  getVariableValue,
  getObject,
  objectExists,
  createObject,
  SPACE,
  EMPTY,
} from '../core/lingo-runtime.js'

export class StringServicesClass {
  constructor() {
    this.pConvList = createPropList()
    this.pDigits = '0123456789ABCDEF'
    this.pUsesUTF8 = null
    this.pUnicodeDirector = true // JS is always Unicode
  }

  construct() {
    this.pConvList = createPropList()
    this.pDigits = '0123456789ABCDEF'
    this.pUsesUTF8 = null
    this.pUnicodeDirector = true
    this.initConvList()
    return true
  }

  getUTF8ObjInstance() {
    const tUTF8ObjectName = 'Localized UTF8 converter'
    const tutf8convclassname = 'UTF8 To Locale Class'
    if (objectExists(tUTF8ObjectName)) {
      return getObject(tUTF8ObjectName)
    } else {
      if (variableExists('local.utf8.conversion')) {
        const tConversionFormat = getVariableValue('local.utf8.conversion')
        const tUTF8Object = createObject(tUTF8ObjectName, tutf8convclassname)
        if (!voidP(tUTF8Object)) {
          tUTF8Object.defineLocale(tConversionFormat)
        }
        return tUTF8Object
      } else {
        return null
      }
    }
  }

  convertToPropList(tStr, tDelim) {
    const tOldDelim = ',' // placeholder for itemDelimiter
    if (voidP(tDelim)) tDelim = ','
    const tProps = createPropList()
    const items = tStr.split(tDelim)
    for (let i = 0; i < items.length; i++) {
      const tPair = items[i].trim()
      const eqIdx = tPair.indexOf('=')
      if (eqIdx > 0) {
        const tProp = tPair.substring(0, eqIdx).trim()
        const tValue = tPair.substring(eqIdx + 1).trim()
        tProps.setaProp(tProp, tValue)
      }
    }
    return tProps
  }

  convertToLowerCase(tString) {
    return tString.toLowerCase()
  }

  convertToHigherCase(tString) {
    return tString.toUpperCase()
  }

  convertSpecialChars(tString, tDirection) {
    let tRetString = ''
    const tLength = tString.length
    if (voidP(tDirection)) tDirection = 0
    if (tDirection === 0) {
      for (let pos = 0; pos < tLength; pos++) {
        const tChar = tString[pos]
        const tConv = this.pConvList.getaProp(tChar)
        if (!voidP(tConv)) {
          tRetString += tConv
          continue
        }
        tRetString += tChar
      }
    } else {
      for (let pos = 0; pos < tLength; pos++) {
        const tChar = tString[pos]
        const tPos = this.pConvList.keys().indexOf(tChar)
        if (tPos >= 0) {
          tRetString += this.pConvList.getPropAt(tPos + 1)
          continue
        }
        tRetString += tChar
      }
    }
    return tRetString
  }

  convertIntToHex(tInt) {
    if (tInt <= 0) {
      return '00'
    }
    let tHexstr = ''
    while (tInt > 0) {
      const tD = tInt % 16
      tInt = Math.floor(tInt / 16)
      tHexstr = this.pDigits[tD] + tHexstr
    }
    if (tHexstr.length % 2 === 1) {
      tHexstr = '0' + tHexstr
    }
    return tHexstr
  }

  convertHexToInt(tHex) {
    return parseInt(tHex, 16)
  }

  explode(tStr, tDelim, tLimit) {
    const tList = []
    if (voidP(tStr)) return tList
    if (voidP(tLimit)) tLimit = Number.MAX_SAFE_INTEGER
    const tDelimLength = tDelim.length
    while (true) {
      const tPos = tStr.indexOf(tDelim)
      if (tPos === -1) break
      const tSubStr = tStr.substring(0, tPos)
      tList.push(tSubStr)
      tStr = tStr.substring(tPos + tDelimLength)
      if (tList.length === (tLimit - 1)) {
        tList.push(tStr)
        return tList
      }
    }
    tList.push(tStr)
    return tList
  }

  implode(tList, tDelim) {
    if (voidP(tDelim)) return 0
    if (voidP(tList)) return 0
    return tList.join(tDelim)
  }

  replaceChars(tString, tCharA, tCharB) {
    if (tCharA === tCharB) return tString
    while (tString.indexOf(tCharA) >= 0) {
      tString = tString.replace(tCharA, tCharB)
    }
    return tString
  }

  replaceChunks(tString, tChunkA, tChunkB) {
    let tStr = ''
    if (voidP(tString) || voidP(tChunkA) || voidP(tChunkB)) {
      error(this, 'At least one of the parameters was void!', this.pID, symbol('#replaceChunks'), symbol('#minor'))
      return tStr
    }
    while (tString.includes(tChunkA)) {
      const tPos = tString.indexOf(tChunkA)
      if (tPos > 0) {
        tStr += tString.substring(0, tPos)
      }
      tStr += tChunkB
      tString = tString.substring(tPos + tChunkA.length)
    }
    tStr += tString
    return tStr
  }

  urlEncode(tStr) {
    let tEncodedStr = ''
    const tOkChars = '-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_'
    for (let i = 0; i < tStr.length; i++) {
      const tChar = tStr[i]
      if (tOkChars.indexOf(tChar) >= 0) {
        tEncodedStr += tChar
        continue
      }
      if (tChar === ' ') {
        tEncodedStr += '+'
        continue
      }
      const hex = charToNum(tChar).toString(16).toUpperCase().padStart(2, '0')
      tEncodedStr += '%' + hex
    }
    return tEncodedStr
  }

  obfuscate(tStr) {
    let tResult = ''
    for (let i = 0; i < tStr.length; i++) {
      const tNumber = charToNum(tStr[i])
      let tNewNumber1 = bitAnd(tNumber, 15) * 2
      let tNewNumber2 = Math.floor(bitAnd(tNumber, 240) / 8)
      const tRandom = random(6) + 1
      tNewNumber1 = tNewNumber1 + (bitAnd(tRandom, 6) * 16) + bitAnd(tRandom, 1)
      const tRandom2 = random(6) + 1
      tNewNumber2 = tNewNumber2 + (bitAnd(tRandom2, 6) * 16) + bitAnd(tRandom2, 1)
      tResult += numToChar(tNewNumber2) + numToChar(tNewNumber1)
    }
    return tResult
  }

  deobfuscate(tStr) {
    let tResult = ''
    for (let i = 0; i < tStr.length; i++) {
      if (i >= tStr.length - 1) break
      const tRawNumbers = [charToNum(tStr[i + 1]), charToNum(tStr[i])]
      const tNumbers = [Math.floor(bitAnd(tRawNumbers[0], 30) / 2), bitAnd(tRawNumbers[1], 30) * 8]
      const tNumber = bitOr(tNumbers[0], tNumbers[1])
      tResult += numToChar(tNumber)
      i++
    }
    return tResult
  }

  getLocalFloat(tStrFloat) {
    if (!stringp(tStrFloat)) {
      return float(tStrFloat)
    }
    if (!tStrFloat.includes('.')) {
      return float(tStrFloat)
    }
    // In JS, decimal separator is always '.'
    return float(tStrFloat)
  }

  encodeUTF8(tStr) {
    if (voidP(this.pUsesUTF8)) {
      if (variableExists('client.textdata.utf8')) {
        this.pUsesUTF8 = getVariableValue('client.textdata.utf8')
      } else {
        this.pUsesUTF8 = null
      }
    }
    if (!this.pUsesUTF8) {
      return tStr
    }
    const tUnicodeData = this.convertToUnicode(tStr)
    const tUTF8Data = []
    for (let i = 0; i < tUnicodeData.length; i++) {
      const tValue = tUnicodeData[i]
      if (tValue < 128) {
        tUTF8Data.push(tValue)
        continue
      }
      if (tValue < 2048) {
        tUTF8Data.push(192 + bitAnd(Math.floor(tValue / 64), 31))
        tUTF8Data.push(128 + bitAnd(tValue, 63))
        continue
      }
      if (tValue < 65536) {
        tUTF8Data.push(224 + bitAnd(Math.floor(tValue / (64 * 64)), 15))
        tUTF8Data.push(128 + bitAnd(Math.floor(tValue / 64), 63))
        tUTF8Data.push(128 + bitAnd(tValue, 63))
      }
    }
    return this.generateStringFromUTF8(tUTF8Data)
  }

  decodeUTF8(tStr, tForceDecode) {
    if (voidP(this.pUsesUTF8)) {
      if (variableExists('client.textdata.utf8')) {
        this.pUsesUTF8 = getVariableValue('client.textdata.utf8')
      } else {
        this.pUsesUTF8 = null
      }
    }
    if (!this.pUsesUTF8) {
      return tStr
    }
    if (this.pUnicodeDirector && !tForceDecode) {
      return tStr
    }
    const tUTF8Obj = this.getUTF8ObjInstance()
    const tBinData = []
    const tCutPos = 1000
    while (tStr.length > 0) {
      let tSubStr, tStrRemainder
      if (tStr.length >= tCutPos) {
        tSubStr = tStr.substring(0, tCutPos)
        tStrRemainder = tStr.substring(tCutPos)
      } else {
        tSubStr = tStr
        tStrRemainder = ''
      }
      tStr = tStrRemainder
      for (let i = 0; i < tSubStr.length; i++) {
        const tValue = charToNum(tSubStr[i])
        if (tValue < 255) {
          tBinData.push(tValue)
          continue
        }
        tBinData.push(Math.floor(tValue / 256))
        if ((tValue % 256) !== 0) {
          tBinData.push(tValue % 256)
        }
      }
    }
    const tUnicodeData = []
    let i = 0
    while (i < tBinData.length) {
      const tValue = tBinData[i]
      if (tValue < 128) {
        tUnicodeData.push(tValue)
      } else if (tValue > 224) {
        if (i <= (tBinData.length - 2)) {
          const tValue2 = tBinData[i + 1]
          const tValue3 = tBinData[i + 2]
          const tResVal = (((bitAnd(tValue, 15) * 64) + bitAnd(tValue2, 63)) * 64) + bitAnd(tValue3, 63)
          tUnicodeData.push(tResVal)
        }
        i += 2
      } else if (tValue > 192) {
        if (i <= (tBinData.length - 1)) {
          const tValue2 = tBinData[i + 1]
          const tResVal = (bitAnd(tValue, 31) * 64) + bitAnd(tValue2, 63)
          tUnicodeData.push(tResVal)
        }
        i += 1
      }
      i++
    }
    return this.convertFromUnicode(tUnicodeData)
  }

  convertToUnicode(tStr) {
    if (!this.pUnicodeDirector) {
      const tUTF8Object = this.getUTF8ObjInstance()
      if (!voidP(tUTF8Object)) {
        const tdata = tUTF8Object.convertToUnicode ? tUTF8Object.convertToUnicode(tStr) : null
        if (Array.isArray(tdata)) {
          return tdata
        }
      }
    }
    const tUnicodeData = []
    for (let i = 0; i < tStr.length; i++) {
      tUnicodeData.push(tStr.charCodeAt(i))
    }
    return tUnicodeData
  }

  generateStringFromUTF8(tUTF8Data) {
    if (!this.pUnicodeDirector) {
      const tUTF8Object = this.getUTF8ObjInstance()
      if (!voidP(tUTF8Object)) {
        const tString = tUTF8Object.generateStringFromUTF8 ? tUTF8Object.generateStringFromUTF8(tUTF8Data) : null
        if (typeof tString === 'string') {
          return tString
        }
      }
    }
    let tResult = ''
    for (let i = 0; i < tUTF8Data.length; i++) {
      tResult += numToChar(tUTF8Data[i])
    }
    return tResult
  }

  convertFromUnicode(tUnicodeData) {
    if (!this.pUnicodeDirector) {
      const tUTF8Object = this.getUTF8ObjInstance()
      if (!voidP(tUTF8Object)) {
        const tdata = tUTF8Object.convertFromUnicode ? tUTF8Object.convertFromUnicode(tUnicodeData) : null
        if (typeof tdata === 'string') {
          return tdata
        }
      }
    }
    let tResult = ''
    const tCutPos = 1000
    let i = 0
    while (i < tUnicodeData.length) {
      const tCount = (i + tCutPos) <= tUnicodeData.length ? tCutPos : tUnicodeData.length - i
      let tSubResult = ''
      for (let j = 1; j <= tCount; j++) {
        tSubResult += numToChar(tUnicodeData[i + j - 1])
      }
      i += tCount
      tResult += tSubResult
    }
    return tResult
  }

  initConvList() {
    if (this.pUnicodeDirector) {
      // In Unicode mode (JS), no conversion needed
      return true
    }
    // Non-Unicode mode - load platform-specific conversion table
    // Placeholder for platform-specific char conversion
    return true
  }
}
