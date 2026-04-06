// fuse_client/47_Variable Container Class.ls → variable-container-class.js
// Variable container - stores and retrieves key-value pairs

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  floatp,
  voidP,
  integer,
  float,
  value,
  string,
  length,
  chars,
  charToNum,
  field,
  error,
  createPropList,
  getItemDelimiter,
  setItemDelimiter,
  RETURN,
  SPACE,
  EMPTY,
  QUOTE,
} from '../core/lingo-runtime.js'

export class VariableContainerClass {
  constructor() {
    this.pItemList = createPropList()
  }

  construct() {
    this.pItemList = createPropList()
    return true
  }

  deconstruct() {
    this.pItemList = createPropList()
    return true
  }

  create(tVariable, tValue) {
    if (!stringp(tVariable) && !symbolp(tVariable)) {
      return error(this, 'String or symbol expected: ' + tVariable, symbol('#create'), symbol('#major'))
    }
    this.pItemList.setaProp(tVariable, tValue)
    return true
  }

  set(tVariable, tValue) {
    if (!stringp(tVariable) && !symbolp(tVariable)) {
      return error(this, 'String or symbol expected: ' + tVariable, symbol('#set'), symbol('#major'))
    }
    this.pItemList.setaProp(tVariable, tValue)
    return true
  }

  GET(tVariable, tDefault) {
    let tValue = this.pItemList.getaProp(tVariable)
    if (voidP(tValue)) {
      let tError = 'Variable not found: ' + QUOTE + tVariable + QUOTE
      if (!voidP(tDefault)) {
        tValue = tDefault
        tError = tError + '\n' + 'Using given default: ' + tDefault
      } else {
        tValue = 0
      }
      error(this, tError, symbol('#GET'), symbol('#minor'))
    }
    return tValue
  }

  getInt(tVariable, tDefault) {
    let tValue = integer(this.pItemList.getaProp(tVariable))
    if (!integerp(tValue)) {
      let tError = 'Variable not found: ' + QUOTE + tVariable + QUOTE
      if (!voidP(tDefault)) {
        tValue = tDefault
        tError = tError + '\n' + 'Using given default: ' + tDefault
      }
      error(this, tError, symbol('#getInt'), symbol('#minor'))
    }
    return tValue
  }

  GetValue(tVariable, tDefault) {
    let tValue = value(this.pItemList.getaProp(tVariable))
    if (voidP(tValue)) {
      let tError = 'Variable not found: ' + QUOTE + tVariable + QUOTE
      if (!voidP(tDefault)) {
        tValue = tDefault
        tError = tError + '\n' + 'Using given default: ' + tDefault
      }
      error(this, tError, symbol('#GetValue'), symbol('#minor'))
    }
    if (Array.isArray(tValue) || (tValue && tValue.count !== undefined)) {
      return JSON.parse(JSON.stringify(tValue))
    }
    return tValue
  }

  Remove(tVariable) {
    return this.pItemList.deleteProp(tVariable)
  }

  exists(tVariable) {
    return !voidP(this.pItemList.getaProp(tVariable))
  }

  dump(tField, tDelimiter, tOverride) {
    const tStr = field(tField)
    const tDelim = getItemDelimiter()
    if (voidP(tDelimiter)) {
      tDelimiter = '\n'
    }
    setItemDelimiter(tDelimiter)
    if (voidP(tOverride)) {
      tOverride = true
    }
    const items = tStr.split(tDelimiter)
    for (let i = 0; i < items.length; i++) {
      const tPair = items[i]
      if ((tPair[0] !== '#') && (tPair !== '')) {
        setItemDelimiter('=')
        const parts = tPair.split('=')
        const tProp = parts[0].trim()
        let tValue = parts.slice(1).join('=').trim()
        if (!tValue.includes(' ')) {
          if (tValue[0] === '#') {
            tValue = symbol(tValue.substring(1))
          } else if (integerp(parseInt(tValue))) {
            if (String(parseInt(tValue)).length === tValue.length) {
              tValue = parseInt(tValue)
            }
          }
        } else if (floatp(parseFloat(tValue))) {
          tValue = parseFloat(tValue)
        }
        if (stringp(tValue)) {
          // Character processing (no-op in JS)
        }
        const tPos = this.pItemList.keys().indexOf(tProp)
        if (tOverride || tPos < 0) {
          this.pItemList.setaProp(tProp, tValue)
        }
        setItemDelimiter(tDelimiter)
      }
    }
    setItemDelimiter(tDelim)
    return true
  }

  clear() {
    this.pItemList = createPropList()
  }
}
