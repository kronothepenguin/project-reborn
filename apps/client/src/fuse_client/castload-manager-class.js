// fuse_client/32_CastLoad Manager Class.ls → castload-manager-class.js
// CastLoad manager - handles dynamic cast loading, preloading, and lifecycle

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  offset,
  chars,
  count,
  createPropList,
  castLib,
  getVariable,
  getMoviePath,
  getUniqueID,
  getIntVariable,
  error,
  SystemAlert,
  fatalError,
  receivePrepare,
  removePrepare,
  createObject,
  getClassVariable,
  replaceChunks,
  QUOTE,
  RETURN,
  EMPTY,
  netError,
} from '../core/lingo-runtime.js'
import { getThreadManager } from './core-thread-api.js'
import { getResourceManager } from './resource-api.js'

export class CastLoadManagerClass {
  constructor() {
    this.pWaitList = createPropList()
    this.pTaskList = createPropList()
    this.pAvailableDynCasts = createPropList()
    this.pPermanentLevelList = createPropList()
    this.pLatestTaskID = null
    this.pCurrentDownLoads = createPropList()
    this.pLoadedCasts = createPropList()
    this.pTempWaitList = []
    this.pCastLibCount = 0
    this.pSysCastNum = 0
    this.pBinCastNum = 0
    this.pNullCastName = 'empty'
    this.pFileExtension = '.cct'
    this.pLastError = 0
    this.pID = null
  }

  construct() {
    // In Author mode: pFileExtension = ".cst", else ".cct"
    this.pFileExtension = '.cct'
    this.pLoadedCasts = createPropList()
    this.pTempWaitList = []
    this.pCastLibCount = 0
    this.pNullCastName = 'empty'
    // pSysCastNum = castLib("fuse_client").number
    // pBinCastNum = castLib(getVariable("dynamic.bin.cast")).number
    this.pLastError = 0
    this.verifyReset()
    return true
  }

  startCastLoad(tCasts, tPermanentFlag, tAdd, tDoIndexing, tDoTracking) {
    if (voidP(tPermanentFlag)) tPermanentFlag = 0
    if (voidP(tAdd)) tAdd = 0
    if (voidP(tDoIndexing)) tDoIndexing = 1
    if (voidP(tDoTracking)) tDoTracking = 0
    this.pLastError = 0

    if (tDoTracking) {
      let tCastsStr = '' + tCasts
      tCastsStr = replaceChunks(tCastsStr, QUOTE, EMPTY)
      tCastsStr = replaceChunks(tCastsStr, ' ', EMPTY)
      tCastsStr = replaceChunks(tCastsStr, '[', EMPTY)
      tCastsStr = replaceChunks(tCastsStr, ']', EMPTY)
      tCastsStr = replaceChunks(tCastsStr, RETURN, EMPTY)
    }

    this.pTempWaitList = []
    const tCastList = []

    if (tCasts && typeof tCasts === 'object' && tCasts.count !== undefined) {
      // propList
      for (let f = 1; f <= tCasts.count; f++) {
        const tCastName = tCasts.getAt(f)
        tCastList.push(tCastName)
        this.addOneCastToWaitList(tCastName, tCasts.getPropAt(f))
      }
    } else if (Array.isArray(tCasts)) {
      for (const tCastName of tCasts) {
        tCastList.push(tCastName)
        this.addOneCastToWaitList(tCastName, tPermanentFlag)
      }
    } else {
      const castsArr = [tCasts]
      for (const tCastName of castsArr) {
        tCastList.push(tCastName)
        this.addOneCastToWaitList(tCastName, tPermanentFlag)
      }
    }

    if (count(tCasts) === 0) {
      return 0
    }

    const tID = getUniqueID()
    this.pLatestTaskID = tID
    if (tAdd === 0) {
      this.removeTemporaryCast(tCastList)
    }
    if (this.pTempWaitList.length > 0) {
      this.pWaitList.setaProp(tID, [...this.pTempWaitList])
    }

    let tStatus, tPercent
    if (this.pWaitList.count === 0) {
      tStatus = symbol('#ready')
      tPercent = 1.0
    } else {
      tStatus = symbol('#LOADING')
      tPercent = 0
    }

    this.pTaskList.setaProp(tID, createObject(symbol('#temp'), getClassVariable('castload.task.class')))
    const tProps = {
      id: tID,
      status: tStatus,
      Percent: tPercent,
      sofar: 0,
      casts: [...this.pTempWaitList],
      callback: null,
      doindexing: tDoIndexing,
    }
    const task = this.pTaskList.getaProp(tID)
    if (task && task.define) task.define(tProps)

    this.pLastError = 0
    for (let i = 1; i <= getIntVariable('net.operation.count', 2); i++) {
      this.AddNextpreloadNetThing()
    }
    return tID
  }

  registerCallback(tID, tMethod, tClientID, tArgument) {
    if (voidP(this.pTaskList.getaProp(tID))) {
      return 0
    } else {
      const task = this.pTaskList.getaProp(tID)
      if (task && task.addCallBack) {
        return task.addCallBack(tID, tMethod, tClientID, tArgument)
      }
    }
  }

  resetCastLibs(tClean, tForced) {
    if (tClean !== 1) tClean = 0
    const tTempList = []
    // In Author mode, load cast.dev.* variables
    this.pCastLibCount = 0 // the number of castLibs
    let tEmptyCastNum = 1
    for (let tCastNum = 2; tCastNum <= this.pCastLibCount; tCastNum++) {
      if ((tCastNum !== this.pSysCastNum) && (tCastNum !== this.pBinCastNum)) {
        const tCastName = '' // castLib(tCastNum).name
        if (tTempList.indexOf(tCastName) === -1) {
          if (tClean) {
            getThreadManager().closeThread(tCastNum)
          }
          if (tClean) {
            getResourceManager().unregisterMembers(tCastNum)
          }
          // castLib(tCastNum).name = this.pNullCastName + ' ' + tEmptyCastNum
          // castLib(tCastNum).fileName = getMoviePath() + this.pNullCastName + this.pFileExtension
          tEmptyCastNum++
          continue
        }
        this.pLoadedCasts.setaProp(tCastName, String(tCastNum))
      }
    }
    return this.InitPreloader()
  }

  getLoadPercent(tID) {
    if (voidP(tID)) tID = this.pLatestTaskID
    const task = this.pTaskList.getaProp(tID)
    if (!voidP(task)) {
      if (task.getTaskState && task.getTaskState() === symbol('#ready')) {
        return 1.0
      } else {
        return task.getTaskPercent ? task.getTaskPercent() : 0
      }
    } else {
      return 1.0
    }
  }

  FindCastNumber(tCast) {
    // In Director: iterate castLibs and match by name
    // In JS: check loaded casts registry
    if (this.pLoadedCasts.getaProp(tCast)) {
      return parseInt(this.pLoadedCasts.getaProp(tCast))
    }
    return 0
  }

  exists(tCastName) {
    if (tCastName === 'internal') {
      return true
    }
    return !voidP(this.pLoadedCasts.getaProp(tCastName))
  }

  print() {
    for (const key of this.pLoadedCasts.keys()) {
      console.log(key, '->', this.pLoadedCasts.getaProp(key))
    }
    for (const key of this.pCurrentDownLoads.keys()) {
      const obj = this.pCurrentDownLoads.getaProp(key)
      console.log(obj ? obj.pFile : key, obj ? obj.pPercent : 0)
    }
  }

  GetLastError() {
    return this.pLastError
  }

  prepare() {
    if (count(this.pTaskList) > 0) {
      this.AddNextpreloadNetThing()
      // call(#resetPercentCounter, pTaskList)
      // call(#update, pCurrentDownLoads)
    }
  }

  InitPreloader() {
    this.pWaitList = createPropList()
    this.pTaskList = createPropList()
    this.pAvailableDynCasts = createPropList()
    this.pPermanentLevelList = createPropList()
    this.pCurrentDownLoads = createPropList()
    this.pLatestTaskID = EMPTY
    return true
  }

  AddNextpreloadNetThing() {
    if (this.pCurrentDownLoads.count < getIntVariable('net.operation.count', 2)) {
      if (this.pWaitList.count > 0) {
        const firstKey = this.pWaitList.getPropAt(1)
        const waitList = this.pWaitList.getaProp(firstKey)
        if (waitList && waitList.length > 0) {
          let tFile = waitList[0]
          let tParsedFile = tFile
          let tFileExtension = this.pFileExtension
          let tURL = ''
          let tParamString = ''

          const tParamOffset = offset('?', tFile)
          if (tParamOffset > 0) {
            tParamString = tFile.substring(tParamOffset - 1)
            tFile = tFile.substring(0, tParamOffset - 1)
          }

          const tPossibleExtension = tFile.substring(Math.max(0, tFile.length - 4))
          if ((tPossibleExtension === '.cst') || (tPossibleExtension === '.cct')) {
            tFileExtension = tPossibleExtension
            tParsedFile = tFile.substring(0, tFile.length - tPossibleExtension.length)
          }

          if (!tParsedFile.includes('http://')) {
            tURL = getMoviePath() + tParsedFile + tFileExtension + tParamString
          } else {
            tURL = tParsedFile + tFileExtension + tParamString
          }

          waitList.shift()
          if (waitList.length === 0) {
            this.pWaitList.deleteProp(firstKey)
          }

          // In JS, dynamic cast loading uses import()
          // Instead of preloadNetThing, we use dynamic import
          this.pCurrentDownLoads.setaProp(tFile, createObject(getUniqueID(), getClassVariable('castload.instance.class')))
          const instance = this.pCurrentDownLoads.getaProp(tFile)
          if (instance && instance.define) {
            instance.define(tFile, tURL, firstKey)
          }

          const task = this.pTaskList.getaProp(firstKey)
          if (task && task.changeLoadingCount) {
            task.changeLoadingCount(1)
          }
          receivePrepare(this.pID)
          return true
        }
      }
    }
    return false
  }

  DoneCurrentDownLoad(tFile, tURL, tID, tstate) {
    if (voidP(this.pCurrentDownLoads.getaProp(tFile))) {
      return error(this, 'CastLoad task was lost! ' + tFile + ' ' + tID, symbol('#DoneCurrentDownLoad'), symbol('#major'))
    }
    const tTask = this.pTaskList.getaProp(tID)
    if (voidP(tTask)) {
      return error(this, 'Task list item was lost! ' + tFile + ' ' + tID, symbol('#DoneCurrentDownLoad'), symbol('#major'))
    }
    if (tstate !== symbol('#done')) {
      // pLastError = netError(this.pCurrentDownLoads.getaProp(tFile).pNetId)
    }
    if (tstate !== symbol('#error')) {
      const tCastNumber = this.getAvailableEmptyCast()
      if (tCastNumber > 0) {
        const tCastName = tFile
        const tPreIndexing = tTask.getIndexingAllowed ? tTask.getIndexingAllowed() : true
        this.setImportedCast(tCastNumber, tCastName, tURL, tPreIndexing)
      }
    }
    if (tTask.OneCastDone) tTask.OneCastDone(tFile)
    if (tTask.changeLoadingCount) tTask.changeLoadingCount(-1)
    const instance = this.pCurrentDownLoads.getaProp(tFile)
    if (instance && instance.deconstruct) instance.deconstruct()
    // this.delay(50, symbol('#removeCastLoadInstance'), tFile)
    this.removeCastLoadInstance(tFile)
    this.removeCastLoadTask(tID, tstate)
    return true
  }

  removeCastLoadInstance(tFile) {
    if (!stringp(tFile)) {
      return 0
    }
    if (voidP(this.pCurrentDownLoads.getaProp(tFile))) {
      return error(this, 'CastLoad instance was lost! ' + tFile, symbol('#removeCastLoadInstance'), symbol('#minor'))
    } else {
      return this.pCurrentDownLoads.deleteProp(tFile)
    }
  }

  removeCastLoadTask(tID, tstate) {
    const tTask = this.pTaskList.getaProp(tID)
    if (tstate === symbol('#failed')) {
      if (tTask && tTask.setFailed) tTask.setFailed()
    }
    if (tTask && tTask.getTaskState && tTask.getTaskState() === symbol('#ready')) {
      if (tTask.getFailed && tTask.getFailed()) {
        tstate = symbol('#failed')
      }
      if (tTask.DoCallBack) tTask.DoCallBack(tstate)
      if (tTask.deconstruct) tTask.deconstruct()
      this.pTaskList.deleteProp(tID)
      if (count(this.pTaskList) === 0) {
        removePrepare(this.pID)
      }
    }
  }

  TellStreamState(tFileName, tstate, tPercent, tID) {
    const tObject = this.pTaskList.getaProp(tID)
    if (!voidP(tObject)) {
      if (tObject.UpdateTaskPercent) tObject.UpdateTaskPercent(tPercent, tFileName)
    } else {
      return error(this, 'Task list instance was lost! ' + tFileName + ' ' + tID, symbol('#TellStreamState'), symbol('#major'))
    }
  }

  setImportedCast(tCastNum, tCastName, tFileName, tDoIndexing) {
    if (voidP(tDoIndexing)) tDoIndexing = true
    // In Director: castLib(tCastNum).fileName = tFileName; castLib(tCastNum).name = tCastName
    // In JS: register the cast in the loaded casts registry
    this.pPermanentLevelList.setaProp(tCastName, [0, tCastNum])
    if (tDoIndexing) {
      getResourceManager().preIndexMembers(tCastNum)
    }
    this.pLoadedCasts.setaProp(tCastName, String(tCastNum))
    this.verifyReset()
  }

  getAvailableEmptyCast() {
    if (this.pAvailableDynCasts.count > 0) {
      const tCastNum = this.pAvailableDynCasts.getAt(this.pAvailableDynCasts.count)
      this.pAvailableDynCasts.deleteProp(this.pAvailableDynCasts.getPropAt(this.pAvailableDynCasts.count))
      return tCastNum
    } else {
      SystemAlert(this, 'Out of free cast entries! CastLoad failed.')
      return 0
    }
  }

  removeTemporaryCast(tNewLoadListOfcasts) {
    const tTempList = this.pPermanentLevelList.duplicate()
    for (let f = 1; f <= tTempList.count; f++) {
      const tPermanent = tTempList.getAt(f)[0]
      const tCstNumber = tTempList.getAt(f)[1]
      if ((tPermanent === 0) && (tCstNumber > 0)) {
        const tCastName = tTempList.getPropAt(f)
        if (tNewLoadListOfcasts.indexOf(tCastName) === -1) {
          this.pPermanentLevelList.deleteProp(tCastName)
          this.ResetOneDynamicCast(tCstNumber)
        }
      }
    }
  }

  addOneCastToWaitList(tCastName, tPermanentOrNot) {
    if (!this.FindCastNumber(tCastName) && !this.pWaitList.getaProp(tCastName)) {
      this.pTempWaitList.push(tCastName)
      const tOffset = offset('?', tCastName)
      let tCastNameNoParams = tCastName
      if (tOffset !== 0) {
        tCastNameNoParams = tCastName.substring(0, tOffset - 1)
      }
      this.pPermanentLevelList.setaProp(tCastNameNoParams, [tPermanentOrNot, 0])
    } else {
      if (voidP(this.pLoadedCasts.getaProp(tCastName))) {
        this.pLoadedCasts.setaProp(tCastName, String(this.FindCastNumber(tCastName)))
      }
    }
  }

  ResetOneDynamicCast(tCastNum) {
    const castIdx = this.pLoadedCasts.keys().indexOf(String(tCastNum))
    if (castIdx >= 0) {
      this.pLoadedCasts.deleteProp(this.pLoadedCasts.getPropAt(castIdx + 1))
    } else {
      error(this, "Couldn't remove cast: " + tCastNum, symbol('#ResetOneDynamicCast'), symbol('#minor'))
    }
    getThreadManager().closeThread(tCastNum)
    getResourceManager().unregisterMembers(tCastNum)
    // castLib(tCastNum).name = this.pNullCastName + ' ' + (tCastNum - 2)
    this.pAvailableDynCasts.setaProp(this.pNullCastName + (tCastNum - 2), tCastNum)
    return true
  }

  verifyReset() {
    // In Director: check that empty casts have no members
    // In JS: no-op
  }

  solveNetErrorMsg(tErrorCode) {
    const messages = {
      '': 'Unknown error.',
      'OK': 'OK',
      '-128': 'Operation was cancelled.',
      '0': 'OK',
      '4': 'Bad MOA Class. Network Xtras may be improperly installed.',
      '5': 'Bad MOA Interface. Network Xtras may be improperly installed.',
      '6': 'General transfer error.',
      '20': 'Internal error.',
      '900': 'Failed attempt to write to locked media.',
      '903': 'Disk is full.',
      '905': 'Bad URL.',
      '4144': 'Failed network operation.',
      '4145': 'Failed network operation.',
      '4146': 'Connection could not be established with the remote host.',
      '4147': 'Failed network operation.',
      '4148': 'Failed network operation.',
      '4149': 'Data supplied by the server was in an unexpected format.',
      '4150': 'Unexpected early closing of connection.',
      '4151': 'Failed network operation.',
      '4152': 'Data returned is truncated.',
      '4153': 'Failed network operation.',
      '4154': 'Operation could not be completed due to timeout.',
      '4155': 'Not enough memory available to complete the transaction.',
      '4156': 'Protocol reply to request indicates an error in the reply.',
      '4157': 'Transaction failed to be authenticated.',
      '4159': 'Invalid URL.',
      '4160': 'Failed network operation.',
      '4161': 'Failed network operation.',
      '4162': 'Failed network operation.',
      '4163': 'Failed network operation.',
      '4164': 'Could not create a socket',
      '4165': 'Requested Object could not be found (URL may be incorrect).',
      '4166': 'Generic proxy failure.',
      '4167': 'Transfer was intentionally interrupted by client.',
      '4168': 'Failed network operation.',
      '4242': 'Download stopped by netAbort(url).',
      '4836': 'Cache download stopped for an unknown reason.',
    }
    return messages[String(tErrorCode)] || 'Other network error: ' + tErrorCode
  }

  delay(ms, method, ...args) {
    // Placeholder for timeout-based delay
    setTimeout(() => {
      if (this[method]) this[method](...args)
    }, ms)
  }
}
