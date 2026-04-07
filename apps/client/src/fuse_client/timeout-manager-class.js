// fuse_client/35_Timeout Manager Class.ls → timeout-manager-class.js
// Timeout manager - handles timed callbacks and iterations

import {
  symbol,
  symbolp,
  integerp,
  voidP,
  objectp,
  listp,
  value,
  createPropList,
  error,
  call,
  Timeout,
} from '../core/lingo-runtime.js'
import { getObject, getObjectManager } from './object-api.js'
import { getUniqueID } from './special-services-api.js'

export class TimeoutManagerClass {
  constructor() {
    this.pItemList = createPropList()
  }

  construct() {
    this.pItemList = createPropList()
    return true
  }

  deconstruct() {
    const tObjMngr = getObjectManager()
    for (let i = 1; i <= this.pItemList.count; i++) {
      const item = this.pItemList.getAt(i)
      const tID = item[symbol('#timerid')]
      if (tObjMngr.exists(tID)) {
        tObjMngr.GET(tID).forget()
      }
    }
    this.pItemList = createPropList()
    return true
  }

  create(tID, tTime, tHandler, tClientID, tArgument, tIterations) {
    if (this.exists(tID)) {
      return error(this, 'Timeout already registered: ' + tID, symbol('#create'), symbol('#major'))
    }
    if (!integerp(tTime)) {
      return error(this, 'Integer expected: ' + tTime, symbol('#create'), symbol('#major'))
    }
    if (!symbolp(tHandler)) {
      return error(this, 'Symbol expected: ' + tHandler, symbol('#create'), symbol('#major'))
    }
    const tObjMngr = getObjectManager()
    if (tObjMngr.exists(tClientID)) {
      if (!tObjMngr.GET(tClientID).handler || !tObjMngr.GET(tClientID).handler(tHandler)) {
        return error(this, 'Handler not found in object: ' + tHandler + ' ' + tClientID, symbol('#create'), symbol('#major'))
      }
    } else {
      if (!voidP(tClientID)) {
        return error(this, 'Object ID or VOID expected: ' + tClientID, symbol('#create'), symbol('#major'))
      }
    }
    const tUniqueId = 'Timeout ' + getUniqueID()
    const tTimeout = new Timeout(tUniqueId, tTime, () => this.executeTimeOut(tTimeout), this, null, tIterations > 1)
    tObjMngr.create(tUniqueId, tTimeout)
    tTimeout.start()

    const tList = createPropList()
    tList.setaProp(symbol('#uniqueid'), tUniqueId)
    tList.setaProp(symbol('#handler'), tHandler)
    tList.setaProp(symbol('#client'), tClientID)
    tList.setaProp(symbol('#argument'), tArgument)
    tList.setaProp(symbol('#iterations'), tIterations)
    tList.setaProp(symbol('#count'), 0)
    tList.setaProp(symbol('#timerid'), tUniqueId)
    this.pItemList.setaProp(tID, tList)
    return true
  }

  GET(tID) {
    if (!this.exists(tID)) {
      return error(this, 'Item not found: ' + tID, symbol('#GET'), symbol('#minor'))
    }
    const tTask = this.pItemList.getaProp(tID)
    if (voidP(tTask.getaProp(symbol('#client')))) {
      value(tTask.getaProp(symbol('#handler')) + '(' + tTask.getaProp(symbol('#argument')) + ')')
    } else {
      const tObjMngr = getObjectManager()
      if (tObjMngr.exists(tTask.getaProp(symbol('#client')))) {
        call(tTask.getaProp(symbol('#handler')), tObjMngr.GET(tTask.getaProp(symbol('#client'))), tTask.getaProp(symbol('#argument')))
      } else {
        return this.Remove(tID)
      }
    }
  }

  Remove(tID) {
    if (!this.exists(tID)) {
      return error(this, 'Item not found: ' + tID, symbol('#Remove'), symbol('#minor'))
    }
    const tObjMngr = getObjectManager()
    const item = this.pItemList.getaProp(tID)
    const tObject = tObjMngr.GET(item.getaProp(symbol('#uniqueid')))
    if (tObject !== 0) {
      tObject.target = null
      tObject.forget()
      tObjMngr.Remove(item.getaProp(symbol('#uniqueid')))
    }
    return this.pItemList.deleteProp(tID)
  }

  exists(tID) {
    return listp(this.pItemList.getaProp(tID))
  }

  executeTimeOut(tTimeout) {
    let tID = null
    let tTask = null

    for (let i = 1; i <= this.pItemList.count; i++) {
      const item = this.pItemList.getAt(i)
      if (item.getaProp(symbol('#uniqueid')) === tTimeout.name) {
        tID = this.pItemList.getPropAt(i)
        tTask = this.pItemList.getaProp(tID)
        break
      }
    }
    if (voidP(tID)) {
      tTimeout.forget()
      return false
    }
    const count = tTask.getaProp(symbol('#count')) + 1
    tTask.setaProp(symbol('#count'), count)
    if (count === tTask.getaProp(symbol('#iterations'))) {
      this.Remove(tID)
    }
    if (voidP(tTask.getaProp(symbol('#client')))) {
      value(tTask.getaProp(symbol('#handler')) + '(' + tTask.getaProp(symbol('#argument')) + ')')
    } else {
      const tObject = getObject(tTask.getaProp(symbol('#client')))
      if (objectp(tObject)) {
        call(tTask.getaProp(symbol('#handler')), tObject, tTask.getaProp(symbol('#argument')))
      } else {
        return this.Remove(tID)
      }
    }
    return true
  }
}
