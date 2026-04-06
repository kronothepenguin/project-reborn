// fuse_client/50_CastLoad Task Class.ls → castload-task-class.js
// CastLoad task - tracks a group of cast downloads and progress

import {
  symbol,
  symbolp,
  integerp,
  voidP,
  listp,
  integer,
  count,
  createPropList,
  error,
  objectExists,
  getObject,
  call,
  getCastLoadManager,
  getThreadManager,
  castLib,
} from '../core/lingo-runtime.js'

export class CastLoadTaskClass {
  constructor() {
    this.pGroupId = null
    this.pStatus = null
    this.pLoadedSoFar = 0
    this.pCastList = createPropList()
    this.pCastcount = 0
    this.pCallBack = null
    this.pCurrPercent = 0
    this.pTempPercent = 0
    this.pLastPercent = 0
    this.pTmpLoadCount = 0
    this.pCurLoadCount = 0
    this.pAllowindexing = true
    this.pContainsFailedItems = 0
  }

  define(tdata) {
    this.pGroupId = tdata.id
    this.pStatus = tdata.status
    this.pLoadedSoFar = tdata.sofar
    this.pCastcount = tdata.casts.length
    this.pCallBack = tdata.callback
    this.pCurrPercent = tdata.Percent
    this.pAllowindexing = tdata.doindexing
    this.pTempPercent = 0
    this.pLastPercent = 0
    this.pCurLoadCount = 0
    this.pTmpLoadCount = 0
    this.pContainsFailedItems = 0
    this.pCastList = createPropList()
    for (const tCast of tdata.casts) {
      this.pCastList.setaProp(tCast, 0)
    }
    return true
  }

  OneCastDone(tFile) {
    this.pLoadedSoFar = this.pLoadedSoFar + 1.0
    if (integer(this.pLoadedSoFar) === this.pCastcount) {
      this.pStatus = symbol('#ready')
    }
    this.pCastList.setaProp(tFile, 1)
    while (true) {
      if (this.pCastList.count === 0) {
        break
      }
      if (this.pCastList.getAt(1) === 1) {
        const tCastName = this.pCastList.getPropAt(1)
        if (getCastLoadManager().exists(tCastName)) {
          // getThreadManager().initThread(castLib(tCastName).number)
        }
        this.pCastList.deleteProp(tCastName)
        continue
      }
      break
    }
    return true
  }

  changeLoadingCount(tPosOrNeg) {
    this.pCurLoadCount = this.pCurLoadCount + tPosOrNeg
  }

  resetPercentCounter() {
    this.pTempPercent = 0
    this.pTmpLoadCount = 0
    return true
  }

  UpdateTaskPercent(tInstancePercent, tFile) {
    this.pTmpLoadCount = this.pTmpLoadCount + 1
    this.pTempPercent = this.pTempPercent + tInstancePercent
    if (this.pTmpLoadCount === this.pCurLoadCount) {
      let tTemp = 1.0 * (this.pTempPercent + this.pLoadedSoFar) / this.pCastcount
      if ((tTemp <= 1.0) && (this.pLastPercent <= tTemp)) {
        this.pCurrPercent = tTemp
      } else {
        this.pCurrPercent = this.pLastPercent
      }
    }
  }

  getTaskState() {
    return this.pStatus
  }

  getTaskPercent() {
    return this.pCurrPercent
  }

  getIndexingAllowed() {
    return this.pAllowindexing
  }

  DoCallBack(tstate) {
    let tSuccess = 1
    if (tstate !== symbol('#done')) {
      tSuccess = 0
    }
    if (this.pStatus === symbol('#ready')) {
      if (Array.isArray(this.pCallBack)) {
        for (const tCall of this.pCallBack) {
          if (objectExists(tCall.client)) {
            call(tCall.method, getObject(tCall.client), tCall.argument, tSuccess)
          }
        }
      }
    }
  }

  addCallBack(tID, tMethod, tClientID, tArgument) {
    if (!symbolp(tMethod)) {
      return error(this, 'Symbol referring to handler expected: ' + tMethod, symbol('#addCallBack'), symbol('#major'))
    }
    if (!objectExists(tClientID)) {
      return error(this, 'Object not found: ' + tClientID, symbol('#addCallBack'), symbol('#major'))
    }
    if (!getObject(tClientID).handler || !getObject(tClientID).handler(tMethod)) {
      return error(this, 'Handler not found in object: ' + tMethod + '/' + tClientID, symbol('#addCallBack'), symbol('#major'))
    }
    if (this.pStatus === symbol('#ready')) {
      call(tMethod, getObject(tClientID), tArgument)
      getCastLoadManager().removeCastLoadTask(this.pGroupId)
    } else if (this.pStatus === symbol('#LOADING')) {
      const entry = { method: tMethod, client: tClientID, argument: tArgument }
      if (voidP(this.pCallBack)) {
        this.pCallBack = [entry]
      } else {
        this.pCallBack.push(entry)
      }
    }
    return true
  }

  setFailed() {
    this.pContainsFailedItems = 1
  }

  getFailed() {
    return this.pContainsFailedItems
  }
}
