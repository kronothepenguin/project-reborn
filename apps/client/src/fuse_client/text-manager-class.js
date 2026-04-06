// fuse_client/36_Text Manager Class.ls → text-manager-class.js
// Text manager - handles localized text strings

import {
  symbol,
  voidP,
  chars,
  memberExists,
  field,
  error,
  decodeUTF8,
  RETURN,
  TAB,
  SPACE,
  EMPTY,
  getItemDelimiter,
  setItemDelimiter,
  createPropList,
} from '../core/lingo-runtime.js'
import { getStringServices } from './string-services-api.js'
import { ManagerTemplateClass } from './manager-template-class.js'

export class TextManagerClass extends ManagerTemplateClass {
  constructor() {
    super()
    this.pItemList = createPropList()
  }

  GET(tKey, tDefault) {
    let tText = this.pItemList.getaProp(tKey)
    if (voidP(tText)) {
      let tError = 'Text not found: ' + tKey
      if (!voidP(tDefault)) {
        tText = tDefault
        tError = tError + '\n' + 'Using given default: ' + tDefault
      } else {
        tText = tKey
      }
      error(this, tError, symbol('#GET'), symbol('#minor'))
    }
    tText = getStringServices().convertSpecialChars(tText)
    return tText
  }

  dump(tField, tDelimiter) {
    if (!memberExists(tField)) {
      return error(this, 'Field member expected: ' + tField, symbol('#dump'), symbol('#major'))
    }
    let tRawStr = field(tField)
    tRawStr = decodeUTF8(tRawStr)
    const tStrServices = getStringServices()
    const tSpecialChunks = {
      '\\r': RETURN,
      '\\t': TAB,
      '\\s': SPACE,
      '<BR>': RETURN,
    }
    const tLineChunks = []
    const tMaxLinesPerChunk = 100
    const tTotalChunkCount = Math.floor(tRawStr.split('\n').length / tMaxLinesPerChunk) + 1
    for (let tChunk = 1; tChunk <= tTotalChunkCount; tChunk++) {
      const tStartChunkIndex = ((tChunk - 1) * tMaxLinesPerChunk) + 1
      const tEndChunkIndex = tStartChunkIndex + tMaxLinesPerChunk - 1
      const lines = tRawStr.split('\n')
      const tLines = lines.slice(tStartChunkIndex - 1, tEndChunkIndex).join('\n')
      tLineChunks[tChunk] = tLines
    }
    const tDelim = getItemDelimiter()
    setItemDelimiter('=')
    for (const tStr of tLineChunks) {
      const tLineCount = tStr.split('\n').length
      for (let tLineNo = 1; tLineNo <= tLineCount; tLineNo++) {
        const tPair = tStr.split('\n')[tLineNo - 1]
        if ((chars(tPair, 1, 1) !== '#') && (tPair !== EMPTY)) {
          const parts = tPair.split('=')
          const tProp = parts[0]
          let tValue = parts.slice(1).join('=')
          for (const tMark of Object.keys(tSpecialChunks)) {
            if (tValue.includes(tMark)) {
              tValue = tStrServices.replaceChunks(tValue, tMark, tSpecialChunks[tMark])
            }
          }
          this.pItemList.setaProp(tProp, tValue)
        }
      }
    }
    setItemDelimiter(tDelim)
    return true
  }
}
