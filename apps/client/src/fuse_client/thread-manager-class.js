// fuse_client/29_Thread Manager Class.ls → thread-manager-class.js
// Thread manager - manages thread initialization and lifecycle

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  listp,
  value,
  member,
  script,
  getmemnum,
  error,
  createPropList,
} from '../core/lingo-runtime.js'
import { createObject, getObjectManager } from './object-api.js'
import { getClassVariable, getVariable } from './variable-api.js'
import { getResourceManager } from './resource-api.js'

export class ThreadManagerClass {
  constructor() {
    this.pThreadList = createPropList()
    this.pVarMngrObj = null
    this.pIndexField = null
    this.pObjBaseCls = null
  }

  construct() {
    this.pThreadList = createPropList()
    this.pVarMngrObj = createObject(symbol('#temp'), getClassVariable('variable.manager.class'))
    this.pIndexField = getVariable('thread.index.field')
    this.pObjBaseCls = script(getmemnum('Object Base Class'))
    return true
  }

  deconstruct() {
    this.closeAll()
    this.pVarMngrObj = null
    this.pIndexField = null
    this.pObjBaseCls = null
    return true
  }

  create(tID, tInitField) {
    return this.initThread(tInitField, tID)
  }

  Remove(tID) {
    return this.closeThread(tID)
  }

  GET(tID) {
    const tThreadObj = this.pThreadList.getaProp(tID)
    if (voidP(tThreadObj)) {
      return 0
    } else {
      return tThreadObj
    }
  }

  exists(tID) {
    return !voidP(this.pThreadList.getaProp(tID))
  }

  initThread(tCastNumOrMemName, tID) {
    let tMemNum, tThreadField, tCastNum

    if (stringp(tCastNumOrMemName)) {
      tMemNum = getResourceManager().getmemnum(tCastNumOrMemName)
      if (tMemNum === 0) {
        return error(this, 'Thread index field not found: ' + tCastNumOrMemName, symbol('#initThread'), symbol('#major'))
      } else {
        tThreadField = tCastNumOrMemName
        tCastNum = member(tMemNum).castLibNum
      }
    } else if (symbolp(tCastNumOrMemName)) {
      tThreadField = this.pIndexField
      // iterate castLibs - simplified for JS
      // In Director: repeat with i = 2 to the number of castLibs
      // For now, skip multi-cast iteration
    } else if (!integerp(tCastNumOrMemName)) {
      return error(this, 'Cast number expected: ' + tCastNumOrMemName, symbol('#initThread'), symbol('#major'))
    } else {
      tThreadField = this.pIndexField
      tCastNum = tCastNumOrMemName
      if (member(tThreadField, tCastNum).number < 1) {
        return 0
      }
    }

    if (this.pVarMngrObj.clear) this.pVarMngrObj.clear()
    if (this.pVarMngrObj.dump) this.pVarMngrObj.dump(member(tThreadField, tCastNum).number)

    let tThreadID
    if (symbolp(tID)) {
      tThreadID = tID
    } else {
      tThreadID = symbol(this.pVarMngrObj.GET('thread.id'))
    }
    if (!symbolp(tThreadID)) {
      return error(this, 'Invalid thread ID: ' + tThreadID, symbol('#initThread'), symbol('#major'))
    }

    const tThreadKeys = listp(value(this.pVarMngrObj.GET('thread.id')))
      ? this.pVarMngrObj.GetValue('thread.id')
      : [this.pVarMngrObj.GET('thread.id')]

    for (const tThreadKey of tThreadKeys) {
      tThreadID = symbol(tThreadKey)
      if (!this.exists(tThreadID)) {
        const tThreadObj = createObject(symbol('#temp'), getClassVariable('thread.instance.class'))
        tThreadObj.setID(tThreadID)

        for (const tModule of [symbol('#interface'), symbol('#component'), symbol('#handler')]) {
          const tSymbol = symbol(tThreadKey + '_' + tModule)
          let tPreIndex = ''
          if (listp(value(this.pVarMngrObj.GET('thread.id')))) {
            tPreIndex = tThreadKey + '.'
          }
          if (this.pVarMngrObj.exists(tPreIndex + tModule + '.class')) {
            let tClass = this.pVarMngrObj.GET(tPreIndex + tModule + '.class')
            if (String(tClass)[0] === '[') {
              tClass = value(tClass)
            }
            if (!listp(tClass)) {
              tClass = [tClass]
            }
            const tObject = this.buildThreadObj(tSymbol, tClass, tThreadObj)
            tThreadObj.setaProp(tModule, tObject)
          }
        }
        this.pThreadList.setaProp(tThreadID, tThreadObj)
      }
    }
    return true
  }

  initAll() {
    // iterate castLibs - simplified
    return true
  }

  closeThread(tCastNumOrID) {
    if (this.pVarMngrObj.clear) this.pVarMngrObj.clear()

    let tThreadKeys
    if (integerp(tCastNumOrID)) {
      if (member(this.pIndexField, tCastNumOrID).number > 0) {
        if (this.pVarMngrObj.dump) this.pVarMngrObj.dump(member(this.pIndexField, tCastNumOrID).number)
        if (listp(value(this.pVarMngrObj.GET('thread.id')))) {
          tThreadKeys = this.pVarMngrObj.GetValue('thread.id')
        } else {
          tThreadKeys = [this.pVarMngrObj.GET('thread.id')]
        }
      } else {
        return 0
      }
    } else if (symbolp(tCastNumOrID)) {
      tThreadKeys = [tCastNumOrID]
    } else {
      return error(this, 'Invalid argument: ' + tCastNumOrID, symbol('#closeThread'), symbol('#major'))
    }

    for (const tID of tThreadKeys) {
      const tThread = this.pThreadList.getaProp(tID)
      if (voidP(tThread)) {
        return error(this, 'Thread not found: ' + tID, symbol('#closeThread'), symbol('#minor'))
      }
      const tObjMgr = getObjectManager()
      if (objectp(tThread.getaProp(symbol('#interface')))) {
        tObjMgr.Remove(tThread.getaProp(symbol('#interface')).getID())
      }
      if (objectp(tThread.getaProp(symbol('#component')))) {
        tObjMgr.Remove(tThread.getaProp(symbol('#component')).getID())
      }
      if (objectp(tThread.getaProp(symbol('#handler')))) {
        tObjMgr.Remove(tThread.getaProp(symbol('#handler')).getID())
      }
      this.pThreadList.deleteProp(tID)
    }
    return true
  }

  closeAll() {
    const props = this.pThreadList.keys()
    for (let i = props.length - 1; i >= 0; i--) {
      this.closeThread(props[i])
    }
    return true
  }

  print() {
    for (let i = 1; i <= this.pThreadList.count; i++) {
      console.log(this.pThreadList.getPropAt(i))
    }
  }

  buildThreadObj(tID, tClassList, tThreadObj) {
    let tObject = null
    let tTemp = null
    const tBase = this.pObjBaseCls.new()
    tBase.construct()
    tBase.ancestor = tThreadObj
    tBase.setID(tID)

    const tResMgr = getResourceManager()
    const tObjMgr = getObjectManager()
    tObjMgr.registerObject(tID, tBase)
    tClassList.unshift(tBase)

    for (const tClass of tClassList) {
      if (objectp(tClass)) {
        tObject = tClass
        var tInitFlag = 0
      } else {
        const tMemNum = tResMgr.getmemnum(tClass)
        if (tMemNum < 1) {
          tObjMgr.unregisterObject(tID)
          return error(this, 'Script not found: ' + tMemNum, symbol('#buildThreadObj'), symbol('#major'))
        }
        tObject = script(tMemNum).new()
        tInitFlag = typeof tObject.construct === 'function' ? 1 : 0
      }
      tObject.ancestor = tTemp
      tTemp = tObject
      tObjMgr.unregisterObject(tID)
      tObjMgr.registerObject(tID, tObject)
      if (tInitFlag) {
        tObject.construct()
      }
    }
    return tObject
  }
}
