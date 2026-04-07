// hh_buffer/3_Buffer Component Class.ls → buffer-component-class.js
// Buffer component - manages furniture download buffering and placeholders

import {
  symbol,
  voidP,
  listp,
  integerp,
  EMPTY,
} from '../../core/lingo-runtime.js'
import { registerMessage, unregisterMessage, executeMessage } from '../../fuse_client/broker-manager-api.js'
import { getThread } from '../../fuse_client/core-thread-api.js'
import { getIntVariable } from '../../fuse_client/variable-api.js'
import { createTimeout, timeoutExists, removeTimeout } from '../../fuse_client/timeout-api.js'

export class BufferComponentClass {
  constructor() {
    this.pMessageBuffer = { active: {}, item: {} }
    this.pPlaceHolderList = { active: {}, item: {} }
    this.pDownloader = null
    this.pTempTimeOutID = 'temp_temp_timeout'
    this.pTempDownloadList = {}
    this.pSimulatedDownload = 0
  }

  construct() {
    registerMessage(symbol('#leaveRoom'), this.getID(), symbol('#leaveRoom'))
    registerMessage(symbol('#changeRoom'), this.getID(), symbol('#leaveRoom'))
    registerMessage(symbol('#downloadObject'), this.getID(), symbol('#downloadObject'))
    this.pPlaceHolderList = { active: {}, item: {} }
    this.pMessageBuffer = { active: {}, item: {} }
    this.pTempDownloadList = {}
    this.pSimulatedDownload = Math.max(0, getIntVariable('buffer.simulateddownload', 0))
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#leaveRoom'), this.getID())
    unregisterMessage(symbol('#changeRoom'), this.getID())
    unregisterMessage(symbol('#downloadObject'), this.getID())
    this.pPlaceHolderList = {}
    this.pMessageBuffer = {}
    if (timeoutExists(this.pTempTimeOutID)) {
      removeTimeout(this.pTempTimeOutID)
    }
    return true
  }

  getID() {
    return 'hh_buffer.component'
  }

  processObject(tObj, ttype) {
    const tClass = this.getClassName(tObj[symbol('#class')], tObj[symbol('#type')])
    const tID = tObj[symbol('#id')]
    if (voidP(tClass) || voidP(tID)) {
      return tObj
    }
    if (ttype !== 'active' && ttype !== 'item') {
      return tObj
    }

    let tIsDownloaded
    if (this.pSimulatedDownload) {
      tIsDownloaded = this.pTempDownloadList[tClass]
    } else {
      const tDynDl = getThread(symbol('#dynamicdownloader'))
      if (!tDynDl) {
        tIsDownloaded = 1
      } else {
        tIsDownloaded = tDynDl.getComponent().isAssetDownloaded(tClass)
      }
    }

    if (!tIsDownloaded) {
      if (voidP(this.pPlaceHolderList[ttype])) {
        this.pPlaceHolderList[ttype] = {}
      }
      const tObjCopy = { ...tObj } // duplicate
      if (voidP(this.pPlaceHolderList[ttype][tID])) {
        this.pPlaceHolderList[ttype][tID] = tObjCopy
      } else {
        this.pPlaceHolderList[ttype][tID] = tObjCopy
      }

      let tAssetType = EMPTY
      if (ttype === 'active') {
        tObj[symbol('#dimensions')] = [1, 1]
        tObj[symbol('#class')] = 'active_placeholder'
        tAssetType = symbol('#Active')
      } else if (ttype === 'item') {
        tObj[symbol('#class')] = 'item_placeholder'
        tObj[symbol('#type')] = EMPTY
        tAssetType = symbol('#item')
      }
      this.downloadClass(tClass, tAssetType)
    }
    return tObj
  }

  downloadCompleted(tClassID, tSuccess) {
    const tTypeNames = Object.keys(this.pPlaceHolderList)
    for (let ttype = 0; ttype < tTypeNames.length; ttype++) {
      let tUpdated = false
      const tTypeName = tTypeNames[ttype]
      const tPlaceHolderList = this.pPlaceHolderList[tTypeName]
      const tIDs = Object.keys(tPlaceHolderList).reverse()

      for (const tID of tIDs) {
        const tObj = tPlaceHolderList[tID]
        const tClass = this.getClassName(tObj[symbol('#class')], tObj[symbol('#type')])
        if (tClass === tClassID) {
          let tExists = false
          const tRoomComp = getThread(symbol('#room')).getComponent()
          if (tTypeName === 'active') {
            tExists = tRoomComp.activeObjectExists(tID)
          } else if (tTypeName === 'item') {
            tExists = tRoomComp.itemObjectExists(tID)
          }

          if (tExists && tSuccess) {
            if (tTypeName === 'active') {
              tRoomComp.validateActiveObjects(tObj)
              if (!voidP(tObj[symbol('#stripId')])) {
                tRoomComp.getActiveObject(tID).setaProp(symbol('#stripId'), tObj[symbol('#stripId')])
              }
            } else if (tTypeName === 'item') {
              tRoomComp.validateItemObjects(tObj)
              if (!voidP(tObj[symbol('#stripId')])) {
                tRoomComp.getItemObject(tID).setaProp(symbol('#stripId'), tObj[symbol('#stripId')])
              }
            }
            this.processMessageBuffer(tID, ttype)
            tUpdated = true
            executeMessage(symbol('#objectFinalized'), tID)
          } else {
            if (!voidP(this.pMessageBuffer[tTypeName])) {
              delete this.pMessageBuffer[tTypeName][tID]
            }
          }
          delete tPlaceHolderList[tID]
        }
      }

      if (tUpdated) {
        if (tTypeName === 'active') {
          executeMessage(symbol('#activeObjectsUpdated'))
          continue
        }
        if (tTypeName === 'item') {
          executeMessage(symbol('#itemObjectsUpdated'))
        }
      }
    }
  }

  downloadObject(tdata) {
    if (typeof tdata !== 'object' || tdata === null || Array.isArray(tdata)) {
      return false
    }
    const tClass = this.getClassName(tdata[symbol('#class')], tdata[symbol('#type')])
    const tDynDl = getThread(symbol('#dynamicdownloader'))
    const tIsDownloaded = !tDynDl ? 1 : tDynDl.getComponent().isAssetDownloaded(tClass)
    if (tIsDownloaded) {
      tdata[symbol('#ready')] = 1
      return true
    }
    tdata[symbol('#ready')] = 0
    this.downloadClass(tClass, tdata[symbol('#type')])
    return true
  }

  removeObject(tID, ttype) {
    if (!voidP(this.pPlaceHolderList[ttype])) {
      delete this.pPlaceHolderList[ttype][tID]
    }
    if (!voidP(this.pMessageBuffer[ttype])) {
      delete this.pMessageBuffer[ttype][tID]
    }
  }

  bufferMessage(tMsg, tID, ttype) {
    if (!listp(tMsg)) {
      return false
    }
    const tSubject = tMsg[symbol('#subject')]
    if (voidP(tID) || voidP(ttype) || voidP(tSubject)) {
      return false
    }
    if (voidP(this.pPlaceHolderList[ttype]) || voidP(this.pMessageBuffer[ttype])) {
      return false
    }
    if (voidP(this.pPlaceHolderList[ttype][tID])) {
      if (voidP(this.pMessageBuffer[ttype][tID])) {
        this.pMessageBuffer[ttype][tID] = []
      }
      const tBuffer = this.pMessageBuffer[ttype][tID]
      for (let tIndex = 0; tIndex < tBuffer.length; tIndex++) {
        const tMsg_old = tBuffer[tIndex]
        const tSubjectOld = tMsg_old[symbol('#subject')]
        if (tSubject === tSubjectOld) {
          tBuffer.splice(tIndex, 1)
          break
        }
      }
      this.pMessageBuffer[ttype][tID].push(tMsg)
    }
  }

  processMessageBuffer(tID, ttype) {
    if (voidP(tID) || voidP(ttype)) {
      return false
    }
    if (voidP(this.pMessageBuffer[ttype])) {
      return false
    }
    const tBuffer = this.pMessageBuffer[ttype][tID]
    if (!voidP(tBuffer)) {
      for (const tMsg of tBuffer) {
        const tSubject = tMsg[symbol('#subject')]
        const tContent = tMsg.content
        const tConn = tMsg.connection
        if (!voidP(tConn)) {
          const tMsgStr = tConn.getProperty(symbol('#message'))
          const tMsgCopy = {}
          const props = Object.keys(tMsgStr)
          for (let tIndex = 0; tIndex < props.length; tIndex++) {
            const tProp = props[tIndex]
            const tValue = tMsgStr[tProp]
            tMsgCopy[tProp] = tValue
            tMsgStr[tProp] = tMsg[tProp] !== undefined ? tMsg[tProp] : null
          }
          switch (tSubject) {
            case '88':
              getThread(symbol('#room')).getHandler().handle_stuffdataupdate(tMsg)
              break
            case '95':
              getThread(symbol('#room')).getHandler().handle_activeobject_update(tMsg)
              break
            case '85':
              getThread(symbol('#room')).getHandler().handle_updateitem(tMsg)
              break
          }
          const copyProps = Object.keys(tMsgCopy)
          for (let tIndex = 0; tIndex < copyProps.length; tIndex++) {
            const tProp = copyProps[tIndex]
            tMsgStr[tProp] = tMsgCopy[tProp]
          }
        }
      }
      delete this.pMessageBuffer[ttype][tID]
    }
    return true
  }

  leaveRoom() {
    this.pPlaceHolderList = { active: {}, item: {} }
    this.pMessageBuffer = { active: {}, item: {} }
  }

  getClassName(tClass, ttype) {
    let tName = tClass
    if (tName && tName.includes('*')) {
      const parts = tName.split('*')
      tName = parts[0]
    }
    if (getThread(symbol('#room')).getInterface().getGeometry().getTileWidth() < 64) {
      tName = 's_' + tName
    }
    if (!voidP(ttype) && ttype !== EMPTY && tClass === 'poster') {
      tName = tName + ' ' + String(ttype)
    }
    return tName
  }

  downloadClass(tClass, ttype) {
    if (this.pSimulatedDownload) {
      if (voidP(Object.keys(this.pTempDownloadList).indexOf(tClass))) {
        this.pTempDownloadList[tClass] = 0
      }
      if (timeoutExists(this.pTempTimeOutID)) {
        removeTimeout(this.pTempTimeOutID)
      }
      createTimeout(this.pTempTimeOutID, this.pSimulatedDownload, symbol('#tempCallback'), this.getID(), null, 1)
    } else {
      getThread(symbol('#dynamicdownloader')).getComponent().downloadCastDynamically(tClass, ttype, this.getID(), symbol('#downloadCompleted'))
    }
  }

  tempCallback() {
    const tKeys = Object.keys(this.pTempDownloadList)
    let tIndex = -1
    for (let i = 0; i < tKeys.length; i++) {
      if (this.pTempDownloadList[tKeys[i]] === 0) {
        tIndex = i
        break
      }
    }
    if (tIndex >= 0) {
      const tKey = tKeys[tIndex]
      this.pTempDownloadList[tKey] = 1
      this.downloadCompleted(tKey, 1)
      if (timeoutExists(this.pTempTimeOutID)) {
        removeTimeout(this.pTempTimeOutID)
      }
      createTimeout(this.pTempTimeOutID, this.pSimulatedDownload, symbol('#tempCallback'), this.getID(), null, 1)
    }
  }
}
