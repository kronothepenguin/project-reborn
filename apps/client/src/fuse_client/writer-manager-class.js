// fuse_client/43_Writer Manager Class.ls → writer-manager-class.js
// Writer manager - handles text writers with font metrics

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  listp,
  createPropList,
  error,
  getObjectManager,
  createObject,
  getClassVariable,
  getStructVariable,
  call,
} from '../core/lingo-runtime.js'

export class WriterManagerClass {
  constructor() {
    this.pWriterClass = null
    this.pPlainStruct = null
    this.pItemList = createPropList()
  }

  construct() {
    this.pWriterClass = getClassVariable('writer.instance.class')
    this.pPlainStruct = getStructVariable('struct.font.plain')
    this.pItemList = createPropList()
    return true
  }

  deconstruct() {
    const keys = this.pItemList.keys()
    for (const key of keys) {
      const obj = this.pItemList.getaProp(key)
      if (obj && obj.deconstruct) obj.deconstruct()
    }
    this.pItemList = createPropList()
    return true
  }

  create(tID, tMetrics) {
    if (!voidP(this.pItemList.getaProp(tID))) {
      return error(this, 'Writer already exists: ' + tID, symbol('#create'), symbol('#minor'))
    }
    const tObj = getObjectManager().create(symbol('#temp'), this.pWriterClass)
    if (!tObj) {
      return false
    }
    if (tMetrics && tMetrics.setFont) {
      tObj.setFont(tMetrics)
    } else {
      tObj.setFont(this.pPlainStruct)
      if (tObj.define) tObj.define(tMetrics)
    }
    this.pItemList.setaProp(tID, tObj)
    if (tObj.setID) tObj.setID(tID)
    return true
  }

  Remove(tID) {
    const tObj = this.pItemList.getaProp(tID)
    if (voidP(tObj)) {
      return error(this, 'Writer not found: ' + tID, symbol('#Remove'), symbol('#minor'))
    }
    if (tObj.deconstruct) tObj.deconstruct()
    return this.pItemList.deleteProp(tID)
  }

  GET(tID) {
    const tObj = this.pItemList.getaProp(tID)
    if (voidP(tObj)) {
      return 0
    }
    return tObj
  }

  exists(tID) {
    return !voidP(this.pItemList.getaProp(tID))
  }
}
