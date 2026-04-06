// fuse_client/33_Connection Manager Class.ls → connection-manager-class.js
// Connection manager - handles connections, listeners, and command registration

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  numToChar,
  bitOr,
  bitAnd,
  createPropList,
  member,
  memberExists,
  getmemnum,
  createMember,
  error,
  getObject,
  objectExists,
  removeObject,
  createObject,
  getClassVariable,
  getStructVariable,
  getIntVariable,
  rect,
  RETURN,
} from '../core/lingo-runtime.js'
import { getObjectManager } from './object-api.js'

export class ConnectionManagerClass {
  constructor() {
    this.pListenerList = createPropList()
    this.pCommandsList = createPropList()
    this.pClassString = 'connection.instance.class'
    this.pLastMessageData = createPropList()
    this.pItemList = []
  }

  construct() {
    this.pLastMessageData = createPropList()
    this.pItemList = []
    this.pListenerList = createPropList()
    this.pCommandsList = createPropList()
    this.pClassString = 'connection.instance.class'
    return true
  }

  deconstruct() {
    this.closeAll()
    return true
  }

  create(tID, tHost, tPort) {
    if (!symbolp(tID) && !stringp(tID)) {
      return error(this, 'Symbol or string expected: ' + tID, symbol('#create'), symbol('#major'))
    }
    if (!stringp(tHost)) {
      return error(this, 'String expected: ' + tHost, symbol('#create'), symbol('#major'))
    }
    if (!integerp(tPort)) {
      return error(this, 'Integer expected: ' + tPort, symbol('#create'), symbol('#major'))
    }
    if ((getIntVariable('connection.log.level') === 2)) {
      if (!memberExists('connectionLog.text')) {
        const tLogField = member(createMember('connectionLog.text', symbol('#field')))
        tLogField.boxType = symbol('#scroll')
        tLogField.rect = rect(0, 0, 300, 250)
      } else {
        const tLogField = member(getmemnum('connectionLog.text'))
        tLogField.text = tLogField.text + RETURN + 'Connection logging ' + tID + RETURN
      }
    }
    if (!this.exists(tID)) {
      if (!createObject(tID, getClassVariable(this.pClassString))) {
        return error(this, 'Failed to initialize connection: ' + tID, symbol('#create'), symbol('#major'))
      }
      this.pItemList.push(tID)
    }
    if (voidP(this.pListenerList.getaProp(tID))) {
      const tMsgPtr = getStructVariable('struct.pointer')
      tMsgPtr.setaProp(symbol('#value'), createPropList())
      this.pListenerList.setaProp(tID, tMsgPtr)
    } else {
      var tMsgPtr = this.pListenerList.getaProp(tID)
    }
    if (voidP(this.pCommandsList.getaProp(tID))) {
      const tCmdPtr = getStructVariable('struct.pointer')
      tCmdPtr.setaProp(symbol('#value'), createPropList())
      this.pCommandsList.setaProp(tID, tCmdPtr)
    } else {
      var tCmdPtr = this.pCommandsList.getaProp(tID)
    }
    const connObj = this.GET(tID)
    if (connObj) {
      connObj.setProperty(symbol('#listener'), tMsgPtr)
      connObj.setProperty(symbol('#commands'), tCmdPtr)
      connObj.connect(tHost, tPort)
    }
    return true
  }

  closeAll() {
    for (let i = 0; i < this.pItemList.length; i++) {
      if (objectExists(this.pItemList[i])) {
        removeObject(this.pItemList[i])
      }
    }
    this.pItemList = []
  }

  registerListener(tID, tObjID, tMsgList) {
    if ((typeof tID !== 'symbol') && (typeof tID !== 'string')) {
      return error(this, 'Invalid message header ID: ' + tID, symbol('#registerListener'), symbol('#major'))
    }
    const tObject = getObject(tObjID)
    if (tObject === 0) {
      return error(this, 'Object not found: ' + tObjID, symbol('#registerListener'), symbol('#major'))
    }
    if (voidP(this.pListenerList.getaProp(tID))) {
      var tPtr = getStructVariable('struct.pointer')
      tPtr.setaProp(symbol('#value'), createPropList())
      this.pListenerList.setaProp(tID, tPtr)
    } else {
      tPtr = this.pListenerList.getaProp(tID)
    }
    for (let i = 0; i < tMsgList.length; i++) {
      const tMsg = tMsgList[i][0] // getPropAt equivalent
      const tMethod = tMsgList[i][1]
      if (!tObject.handler || !tObject.handler(tMethod)) {
        error(this, 'Method not found: ' + tMethod + '/' + tObjID, symbol('#registerListener'), symbol('#major'))
        continue
      }
      const valueMap = tPtr.getaProp(symbol('#value'))
      if (voidP(valueMap.getaProp(tMsg))) {
        valueMap.setaProp(tMsg, [])
      }
      valueMap.getaProp(tMsg).push([tObjID, tMethod])
    }
    return true
  }

  unregisterListener(tID, tObjID, tMsgList) {
    if ((typeof tID !== 'symbol') && (typeof tID !== 'string')) {
      return error(this, 'Invalid message header ID: ' + tID, symbol('#registerListener'), symbol('#major'))
    }
    const tPtr = this.pListenerList.getaProp(tID)
    if (voidP(tPtr)) {
      return false
    }
    const tList = tPtr.getaProp(symbol('#value'))
    for (let i = 0; i < tMsgList.length; i++) {
      const tMsg = tMsgList[i][0]
      const tMethod = tMsgList[i][1]
      if (voidP(tList.getaProp(tMsg))) {
        error(this, 'No listeners for message: ' + tMsg + '/' + tID, symbol('#unregisterListener'), symbol('#minor'))
        continue
      }
      const msgListeners = tList.getaProp(tMsg)
      for (let j = 0; j < msgListeners.length; j++) {
        const tCallback = msgListeners[j]
        if ((tCallback[0] === tObjID) && (tCallback[1] === tMethod)) {
          msgListeners.splice(j, 1)
          break
        }
      }
    }
    return true
  }

  registerCommands(tID, tObjID, tCmdList) {
    if ((typeof tID !== 'symbol') && (typeof tID !== 'string')) {
      return error(this, 'Invalid message header ID: ' + tID, symbol('#registerListener'), symbol('#major'))
    }
    if (voidP(this.pCommandsList.getaProp(tID))) {
      var tPtr = getStructVariable('struct.pointer')
      tPtr.setaProp(symbol('#value'), createPropList())
      this.pCommandsList.setaProp(tID, tPtr)
    } else {
      tPtr = this.pCommandsList.getaProp(tID)
    }
    const valueMap = tPtr.getaProp(symbol('#value'))
    for (let i = 0; i < tCmdList.length; i++) {
      const tCmd = tCmdList[i][0]
      const tNum = tCmdList[i][1]
      const tOld = valueMap.getaProp(tCmd)
      const tBy1 = numToChar(bitOr(64, Math.floor(tNum / 64)))
      const tBy2 = numToChar(bitOr(64, bitAnd(63, tNum)))
      const tNew = tBy1 + tBy2
      if (!voidP(tOld)) {
        if (tOld !== tNew) {
          error(this, 'Registered command override: ' + tCmd + '/' + tOld + '->' + tNew, symbol('#minor'))
        }
      }
      valueMap.setaProp(tCmd, tNew)
    }
    return true
  }

  unregisterCommands(tID, tObjID, tCmdList) {
    if ((typeof tID !== 'symbol') && (typeof tID !== 'string')) {
      return error(this, 'Invalid message header ID: ' + tID, symbol('#registerListener'), symbol('#major'))
    }
    const tPtr = this.pCommandsList.getaProp(tID)
    if (voidP(tPtr)) {
      return false
    }
    return true
  }

  registerLastMessage(tmessageId, tMessage) {
    this.pLastMessageData.setaProp(symbol('#id'), tmessageId)
    this.pLastMessageData.setaProp(symbol('#message'), tMessage)
  }

  getLastMessageData() {
    return this.pLastMessageData.getaProp(symbol('#id'))
  }

  GET(tID) {
    return getObjectManager().GET(tID)
  }

  exists(tID) {
    return this.pItemList.indexOf(tID) >= 0
  }
}
