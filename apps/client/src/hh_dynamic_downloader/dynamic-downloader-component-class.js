// hh_dynamic_downloader/3_Dynamic Downloader Component Class.ls → dynamic-downloader-component-class.js
// Dynamic downloader component - manages furniture/sound downloads, aliases, revisions

import {
  symbol,
  voidP,
  error,
  value,
  string,
  chars,
  offset,
  EMPTY,
  replaceChunks,
  theMilliSeconds,
  member,
  getmemnum,
  castLib,
  createMember,
  getCastLoadManager,
  startCastLoad,
  registerCastloadCallback,
} from '../../core/lingo-runtime.js'
import { getVariable, variableExists, getClassVariable } from '../../fuse_client/variable-api.js'
import { getConnection, getVariableValue } from '../../fuse_client/connection-api.js'
import { createObject } from '../../fuse_client/object-api.js'
import { createTimeout } from '../../fuse_client/timeout-api.js'
import { getObject } from '../../fuse_client/object-api.js'
import { getResourceManager } from '../../fuse_client/resource-api.js'
import { stringp } from '../../core/lingo-runtime.js'

export class DynamicDownloaderComponentClass {
  constructor() {
    this.pDynDownloadURL = 'dynamic_content/'
    this.pFurniCastNameTemplate = 'hh_furni_xx_%typeid%.cct'
    this.pSoundDownloadUrl = 'sound/%typeid%.cct'
    this.pDownloadQueue = {}
    this.pPriorityDownloadQueue = {}
    this.pCurrentDownLoads = {}
    this.pDownloadedAssets = {}
    this.pBypassList = []
    this.pFurniRevisionList = {}
    this.pRevisionsReceived = 0
    this.pRevisionsLoading = 0
    this.pAliasList = {}
    this.pAliasListReceived = 0
    this.pAliasListLoading = 0
    this.pBinCastName = 'bin'
  }

  construct() {
    if (variableExists('dynamic.download.url')) {
      this.pDynDownloadURL = getVariable('dynamic.download.url')
    }
    if (variableExists('dynamic.download.name.template')) {
      this.pFurniCastNameTemplate = getVariable('dynamic.download.name.template')
    }
    if (variableExists('sound.download.url')) {
      this.pSoundDownloadUrl = getVariable('sound.download.url')
    }
    this.pBypassList = value(getVariable('dyn.download.bypass.list', []))
    return true
  }

  isAssetDownloaded(tAssetId) {
    for (const tBypassItem of this.pBypassList) {
      const tBypassWildLength = tBypassItem.length
      const tBypassClean = replaceChunks(tBypassItem, '?', EMPTY)
      if (tAssetId === tBypassClean) {
        return true
      }
      if (tAssetId.startsWith(tBypassClean) && tAssetId.length === tBypassWildLength) {
        return true
      }
    }
    const tStatus = this.checkDownloadStatus(tAssetId)
    switch (tStatus) {
      case symbol('#downloaded'):
      case symbol('#failed'):
        return true
      default:
        return false
    }
  }

  downloadCastDynamically(tAssetId, tAssetType, tCallbackObjectID, tCallBackHandler, tPriorityDownload, tCallbackParams, tParentId) {
    if (tAssetId === EMPTY || voidP(tAssetId)) {
      error(this, 'tAssetId was empty, returning with true just to prevent download sequence!', symbol('#downloadCastDynamically'), symbol('#minor'))
      return true
    }
    const tStatus = this.checkDownloadStatus(tAssetId)
    switch (tStatus) {
      case symbol('#nodata'):
      case symbol('#downloading'):
      case symbol('#inqueue'):
        this.addToDownloadQueue(tAssetId, tCallbackObjectID, tCallBackHandler, tPriorityDownload, 0, tCallbackParams, tAssetType, tParentId)
        this.tryNextDownload()
        return true
      case symbol('#downloaded'):
      case symbol('#failed'):
        return false
    }
    return error(this, 'Invalid status type found: ' + tStatus, symbol('#downloadCastDynamically'), symbol('#major'))
  }

  handleCompletedCastDownload(tAssetId) {
    const tDownloadObj = this.pCurrentDownLoads[tAssetId]
    const tCastName = tDownloadObj.getDownloadName()
    const tCastNum = this.FindCastNumber(tCastName)
    if (tCastNum === 0) {
      tDownloadObj.purgeCallbacks(0)
      this.pDownloadedAssets[tAssetId] = symbol('#failed')
      delete this.pCurrentDownLoads[tAssetId]
      this.tryNextDownload()
      return error(this, 'Cast ' + tCastName + ' was not available', symbol('#handleCompletedCastDownload'), symbol('#minor'))
    }
    this.acquireAssetsFromCast(tCastNum, tAssetId)
    const tResetOk = getCastLoadManager().ResetOneDynamicCast(tCastNum)
    if (!tResetOk) {
      error(this, 'Cast reset failed: ' + tCastNum, symbol('#handleCompletedCastDownload'), symbol('#major'))
    }
    delete this.pCurrentDownLoads[tAssetId]
    this.pDownloadedAssets[tAssetId] = symbol('#downloaded')
    tDownloadObj.purgeCallbacks(1)
    this.tryNextDownload()
  }

  checkDownloadStatus(tAssetId) {
    const tDownloadStatus = this.pDownloadedAssets[tAssetId]
    if (tDownloadStatus !== undefined) {
      return tDownloadStatus
    }
    if (this.pDownloadQueue[tAssetId] !== undefined) {
      return symbol('#inqueue')
    }
    if (this.pPriorityDownloadQueue[tAssetId] !== undefined) {
      return symbol('#inqueue')
    }
    if (this.pCurrentDownLoads[tAssetId] !== undefined) {
      return symbol('#downloading')
    }
    return symbol('#nodata')
  }

  addToDownloadQueue(tAssetId, tCallbackObjectID, tCallBackHandler, tPriorityDownload, tAllowIndexing, tCallbackParams, tAssetType, tParentId) {
    if (voidP(tAllowIndexing)) {
      tAllowIndexing = 0
    }
    let tDownloadObj = null
    if (this.pDownloadQueue[tAssetId] !== undefined) {
      tDownloadObj = this.pDownloadQueue[tAssetId]
    } else if (this.pPriorityDownloadQueue[tAssetId] !== undefined) {
      tDownloadObj = this.pPriorityDownloadQueue[tAssetId]
    } else if (this.pCurrentDownLoads[tAssetId] !== undefined) {
      tDownloadObj = this.pCurrentDownLoads[tAssetId]
    } else {
      tDownloadObj = createObject('dyndownload-' + tAssetId, getClassVariable('dyn.download.instance'))
      if (!tDownloadObj) {
        error(this, 'Could not create download object. Could it be a duplicate: ' + tAssetId, symbol('#addToDownloadQueue'), symbol('#major'))
        return false
      }
      tDownloadObj.setAssetId(tAssetId)
      tDownloadObj.setAssetType(tAssetType)
      tDownloadObj.setIndexing(tAllowIndexing)
      tDownloadObj.setParentId(tParentId)
      if (tPriorityDownload) {
        this.pPriorityDownloadQueue[tAssetId] = tDownloadObj
      } else {
        this.pDownloadQueue[tAssetId] = tDownloadObj
      }
    }
    tDownloadObj.addCallbackListener(tCallbackObjectID, tCallBackHandler, tCallbackParams)
  }

  tryNextDownload() {
    if (!this.pAliasListReceived) {
      if (!this.pAliasListLoading) {
        this.pAliasList = {}
        this.pAliasListLoading = 1
        const tConn = getConnection(getVariableValue('connection.info.id'))
        tConn.send('GET_ALIAS_LIST')
      }
      return false
    }
    if (!this.pRevisionsReceived) {
      if (!this.pRevisionsLoading) {
        this.pFurniRevisionList = {}
        this.pRevisionsLoading = 1
        getConnection(getVariableValue('connection.room.id')).send('GET_FURNI_REVISIONS')
      }
      return false
    }
    const tMaxItemsInProcess = 1
    if (Object.keys(this.pCurrentDownLoads).length >= tMaxItemsInProcess) {
      return false
    }
    let tDownloadObj = null
    let tAssetId = null
    const priorityKeys = Object.keys(this.pPriorityDownloadQueue)
    if (priorityKeys.length > 0) {
      tAssetId = priorityKeys[0]
      tDownloadObj = this.pPriorityDownloadQueue[tAssetId]
      delete this.pPriorityDownloadQueue[tAssetId]
    } else {
      const queueKeys = Object.keys(this.pDownloadQueue)
      if (queueKeys.length > 0) {
        tAssetId = queueKeys[0]
        tDownloadObj = this.pDownloadQueue[tAssetId]
        delete this.pDownloadQueue[tAssetId]
      } else {
        return false
      }
    }
    if (this.checkDownloadStatus(tAssetId) === symbol('#downloaded')) {
      tDownloadObj.purgeCallbacks(1)
      return this.tryNextDownload()
    }
    this.pCurrentDownLoads[tAssetId] = tDownloadObj
    let tAliasedAssetId = tAssetId
    if (!voidP(this.pAliasList[tAssetId])) {
      tAliasedAssetId = this.pAliasList[tAssetId]
    }
    let tDownloadURL = this.pDynDownloadURL + this.pFurniCastNameTemplate
    if (tDownloadObj.getAssetType() === symbol('#sound')) {
      const tParentId = tDownloadObj.getParentId()
      if (!voidP(tParentId)) {
        if (variableExists('dynamic.download.samples.template')) {
          tDownloadURL = this.pDynDownloadURL + getVariable('dynamic.download.samples.template')
        }
      }
    }
    const tFixedAssetId = replaceChunks(tAliasedAssetId, ' ', '_')
    tDownloadURL = replaceChunks(tDownloadURL, '%typeid%', tFixedAssetId)
    let tRawAssetId = tAssetId
    if (chars(tAssetId, 1, 2) === 's_') {
      tRawAssetId = chars(tAssetId, 3, tAssetId.length)
    }
    let tRevision = null
    const tParentId = tDownloadObj.getParentId()
    if (!voidP(tParentId)) {
      tRevision = string(this.pFurniRevisionList[tParentId])
    } else if (this.pFurniRevisionList[tRawAssetId] !== undefined) {
      tRevision = string(this.pFurniRevisionList[tRawAssetId])
    } else {
      if (tAssetId.includes('poster')) {
        tRevision = string(this.pFurniRevisionList['poster'])
      } else {
        tRevision = EMPTY
      }
    }
    tDownloadURL = replaceChunks(tDownloadURL, '%revision%', tRevision)
    tDownloadObj.setDownloadName(tDownloadURL)
    const tAllowIndexing = tDownloadObj.getIndexing()
    if (variableExists('dynamic.download.delay')) {
      const tTimeout = getVariable('dynamic.download.delay')
      createTimeout('dynamicdelay' + theMilliSeconds(), tTimeout, symbol('#executeDownloadRequest'), 'hh_dynamic_downloader.component', [tAssetId, tDownloadURL, tAllowIndexing], 1)
    } else {
      this.executeDownloadRequest([tAssetId, tDownloadURL, tAllowIndexing])
    }
  }

  executeDownloadRequest(tParams) {
    const tAssetId = tParams[0]
    const tDownloadURL = tParams[1]
    const tAllowIndexing = tParams[2]
    const tDownloadRefId = startCastLoad(tDownloadURL, 1, 1, tAllowIndexing)
    registerCastloadCallback(tDownloadRefId, symbol('#handleCompletedCastDownload'), 'hh_dynamic_downloader.component', tAssetId)
  }

  acquireAssetsFromCast(tCastNum, tAssetId) {
    if (voidP(tAssetId)) {
      tAssetId = EMPTY
    }
    const tCast = castLib(tCastNum)
    if (typeof tCast !== 'object') {
      error(this, 'Download seems invalid, item is not a cast!', symbol('#acquireAssetsFromCast'), symbol('#minor'))
      return false
    }
    // Simplified: actual member copying needs full Director emulation
  }

  copyMemberToBin(tSourceMember, tTargetAssetClass) {
    if (voidP(tTargetAssetClass)) {
      tTargetAssetClass = EMPTY
    }
    // Simplified placeholder
  }

  doAliasReplacing(tSourceString, tTargetAssetClass) {
    let tAliasedString = tSourceString
    if (chars(tTargetAssetClass, 1, 2) === 's_') {
      tTargetAssetClass = chars(tTargetAssetClass, 3, tTargetAssetClass.length)
    }
    if (!voidP(this.pAliasList[tTargetAssetClass])) {
      const tSourceAssetClass = this.pAliasList[tTargetAssetClass]
      if (!voidP(tSourceAssetClass)) {
        tAliasedString = replaceChunks(tAliasedString, tSourceAssetClass, tTargetAssetClass)
      }
    }
    return tAliasedString
  }

  setAssetAlias(tOriginalClass, tAliasClass) {
    if (voidP(tOriginalClass) && voidP(tAliasClass)) {
      this.pAliasListLoading = 0
      this.pAliasListReceived = 1
      return true
    }
    this.pAliasList[tOriginalClass] = tAliasClass
    this.pAliasList['s_' + tOriginalClass] = 's_' + tAliasClass
  }

  setFurniRevision(tClass, tRevision, tIsFurni) {
    if (voidP(tClass)) {
      this.pRevisionsReceived = 1
      this.pRevisionsLoading = 0
      this.tryNextDownload()
      return true
    }
    const tOffset = offset('*', tClass)
    if (tOffset) {
      tClass = tClass.substring(0, tOffset - 1)
    }
    if (this.pFurniRevisionList[tClass] !== undefined) {
      this.pFurniRevisionList[tClass] = Math.max(this.pFurniRevisionList[tClass], tRevision)
    } else {
      this.pFurniRevisionList[tClass] = tRevision
    }
    return true
  }

  FindCastNumber(tCastName) {
    // Placeholder: needs castLib lookup implementation
    return 0
  }
}
