// fuse_client/52_Multiuser Instance Class.ls → multiuser-instance-class.js
// Multiuser instance - handles MUS (Multiuser Server) communication via WebSocket

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  listp,
  count,
  createPropList,
  error,
  call,
  memberExists,
  getmemnum,
  member,
  encodeUTF8,
  RETURN,
  SPACE,
} from '../core/lingo-runtime.js'
import { objectExists, getObject, getObjectManager } from './object-api.js'
import { getIntVariable, variableExists, getVariable } from './variable-api.js'
import { getStringServices } from './string-services-api.js'
import { getStructVariable } from './variable-api.js'

export class MultiuserInstanceClass {
  constructor() {
    this.pHost = null
    this.pPort = null
    this.pXtra = null // WebSocket
    this.pMsgStruct = null
    this.pConnectionOk = false
    this.pConnectionSecured = false
    this.pConnectionShouldBeKilled = false
    this.pLastContent = ''
    this.pContentChunk = ''
    this.pCommandsPntr = null
    this.pListenersPntr = null
    this.pBinDataCallback = { client: '', method: null }
    this.pLogMode = 0
    this.pLogfield = null
    this.pUnicodeDirector = true
    this.pID = null
  }

  construct() {
    this.pUnicodeDirector = true
    this.pBinDataCallback = { client: '', method: null }
    this.pConnectionShouldBeKilled = false
    this.pCommandsPntr = getStructVariable('struct.pointer')
    this.pListenersPntr = getStructVariable('struct.pointer')
    this.setLogMode(getIntVariable('connection.log.level', 0))
    this.pMsgStruct = getStructVariable('struct.message')
    return true
  }

  deconstruct() {
    return this.disconnect(true)
  }

  connect(tHost, tPort) {
    this.pHost = tHost
    this.pPort = tPort
    // In Director: pXtra = new(xtra("Multiuser"))
    // In JS: WebSocket connection
    this.pXtra = new WebSocket('ws://' + tHost + ':' + tPort)
    this.pXtra.binaryType = 'arraybuffer'
    this.pXtra.onopen = () => {
      this.pConnectionOk = true
    }
    this.pXtra.onmessage = (event) => {
      this._handleMessage(event)
    }
    this.pXtra.onerror = () => {
      this.disconnect()
    }
    this.pXtra.onclose = () => {
      this.pConnectionOk = false
    }
    return true
  }

  disconnect(tControlled) {
    if (tControlled !== true) {
      this.forwardMsg('DISCONNECT')
    }
    this.pConnectionShouldBeKilled = true
    if (this.pXtra) {
      this.pXtra.close()
    }
    this.pXtra = null
    if (!tControlled) {
      error(this, 'Connection disconnected: ' + this.pID, symbol('#disconnect'), symbol('#minor'))
    }
    return true
  }

  connectionReady() {
    return this.pConnectionOk
  }

  send(tMsg) {
    if (this.pConnectionOk && this.pXtra) {
      if (this.pLogMode > 0) {
        this.log('<-- ' + tMsg)
      }
      // Parse message: first word is command, rest is params
      const spaceIdx = tMsg.indexOf(' ')
      let tPartOne, tPartTwo
      if (spaceIdx >= 0) {
        tPartOne = tMsg.substring(0, spaceIdx)
        tPartTwo = tMsg.substring(spaceIdx + 1)
      } else {
        tPartOne = tMsg
        tPartTwo = ''
      }
      if (!this.pUnicodeDirector) {
        tPartOne = encodeUTF8(tPartOne)
        tPartTwo = encodeUTF8(tPartTwo)
      }
      this.pXtra.send(JSON.stringify({ subject: tPartOne, content: tPartTwo }))
    } else {
      return error(this, 'Connection not ready: ' + this.pID, symbol('#send'), symbol('#major'))
    }
    return true
  }

  sendBinary(tObject) {
    if (this.pConnectionOk && this.pXtra) {
      // Send binary data as ArrayBuffer
      if (tObject instanceof ArrayBuffer) {
        this.pXtra.send(tObject)
      } else {
        this.pXtra.send(JSON.stringify({ subject: 'BINDATA', content: tObject }))
      }
    }
  }

  registerBinaryDataHandler(tObjID, tMethod) {
    this.pBinDataCallback.client = tObjID
    this.pBinDataCallback.method = tMethod
    return true
  }

  getWaitingMessagesCount() {
    // Not applicable in WebSocket - messages are event-driven
    return 0
  }

  processWaitingMessages(tCount) {
    // Not applicable in WebSocket - messages are event-driven
    return 0
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#host'):
        return this.pHost
      case symbol('#port'):
        return this.pPort
      case symbol('#listener'):
        return this.pListenersPntr
      case symbol('#commands'):
        return this.pCommandsPntr
      case symbol('#message'):
        return this.pMsgStruct
      default:
        return 0
    }
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case symbol('#listener'):
        this.pListenersPntr = tValue
        return true
      case symbol('#commands'):
        this.pCommandsPntr = tValue
        return true
      default:
        return false
    }
  }

  setLogMode(tMode) {
    if (!integerp(tMode)) {
      return error(this, 'Invalid argument: ' + tMode, symbol('#setLogMode'), symbol('#minor'))
    }
    this.pLogMode = tMode
    if (this.pLogMode === 2) {
      if (memberExists('connectionLog.text')) {
        this.pLogfield = member(getmemnum('connectionLog.text'))
      } else {
        this.pLogfield = null
        this.pLogMode = 1
      }
    }
    return true
  }

  _handleMessage(event) {
    if (this.pConnectionShouldBeKilled) {
      return
    }
    this.pConnectionOk = true
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      const tSubject = data.subject || ''
      const tContent = data.content || ''
      const tErrCode = data.errorCode || 0

      if (tErrCode !== 0) {
        this.disconnect()
        return
      }

      if (this.pLogMode > 0) {
        this.log('--> ' + tSubject + '\n' + tContent)
      }

      if (typeof tContent === 'string') {
        this.forwardMsg(tSubject + '\n' + tContent)
      } else if (tContent === undefined || tContent === null) {
        if (tSubject !== 'ConnectToNetServer') {
          error(this, 'Message content is VOID!!!', symbol('#xtraMsgHandler'), symbol('#major'))
        }
      } else {
        // Binary data
        if (voidP(this.pBinDataCallback.method)) {
          return error(this, 'No callback registered!', symbol('#xtraMsgHandler'), symbol('#major'))
        }
        if (!objectExists(this.pBinDataCallback.client)) {
          return error(this, 'Callback client not found!', symbol('#xtraMsgHandler'), symbol('#major'))
        }
        call(this.pBinDataCallback.method, getObject(this.pBinDataCallback.client), tContent)
      }
    } catch (e) {
      error(this, 'Message parse error: ' + e.message, symbol('#xtraMsgHandler'), symbol('#major'))
    }
  }

  forwardMsg(tMessage) {
    if (this.pConnectionShouldBeKilled === true) {
      return false
    }
    tMessage = getStringServices().convertSpecialChars(tMessage)
    const words = tMessage.split(/\s+/)
    const tSubject = words[0]
    const tContent = words.slice(1).join(' ')

    if (!this.pMsgStruct || !this.pMsgStruct.setaProp) {
      this.pMsgStruct = getStructVariable('struct.message')
      this.pMsgStruct.setaProp('#connection', this)
      error(this, 'Multiuser instance had problems...', symbol('#forwardMsg'), symbol('#major'))
    }

    const listeners = this.pListenersPntr.value || {}
    const tCallbackList = listeners[tSubject]
    if (Array.isArray(tCallbackList)) {
      const tObjMngr = getObjectManager()
      for (let i = 0; i < tCallbackList.length; i++) {
        const tCallback = tCallbackList[i]
        const tObject = tObjMngr.GET(tCallback[0])
        if (tObject !== 0) {
          this.pMsgStruct.setaProp('#message', tMessage)
          this.pMsgStruct.setaProp('#subject', tSubject)
          this.pMsgStruct.setaProp('#content', tContent)
          call(tCallback[1], tObject, this.pMsgStruct)
          continue
        }
        error(this, 'Listening obj not found, removed: ' + tCallback[0], symbol('#forwardMsg'), symbol('#minor'))
        tCallbackList.shift()
        i--
      }
    } else {
      error(this, 'Listener not found: ' + tSubject + '/' + this.pID, symbol('#forwardMsg'), symbol('#minor'))
    }
  }

  log(tMsg) {
    if (true) { // not Author mode check in JS
      return true
    }
    switch (this.pLogMode) {
      case 1:
        console.log('[Connection ' + this.pID + '] :', tMsg)
        break
      case 2:
        if (this.pLogfield) {
          this.pLogfield.text += '\n[Connection ' + this.pID + '] :' + tMsg
        }
        break
    }
  }
}
