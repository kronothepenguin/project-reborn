// fuse_client/51_Connection Instance Class.ls → connection-instance-class.js
// Connection instance - handles TCP/WebSocket communication with game server

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  listp,
  integer,
  value,
  string,
  length,
  offset,
  chars,
  charToNum,
  numToChar,
  bitOr,
  bitAnd,
  createPropList,
  error,
  fatalError,
  getIntVariable,
  getVariable,
  variableExists,
  memberExists,
  getmemnum,
  member,
  getObjectManager,
  getConnectionManager,
  getStringServices,
  sendProcessTracking,
  createTimeout,
  timeoutExists,
  removeTimeout,
  call,
  executeMessage,
  encodeUTF8,
  decodeUTF8,
  RETURN,
  EMPTY,
  TAB,
} from '../core/lingo-runtime.js'

export class ConnectionInstanceClass {
  constructor() {
    this.pHost = null
    this.pPort = null
    this.pXtra = null // WebSocket in JS
    this.pMsgStruct = null
    this.pConnectionOk = false
    this.pConnectionSecured = false
    this.pConnectionShouldBeKilled = false
    this.pEncryptionOn = false
    this.pDecoder = null
    this.pEncoder = null
    this.pLastContent = ''
    this.pContentChunk = ''
    this.pLogMode = 0
    this.pLogfield = null
    this.pCommandsPntr = null
    this.pListenersPntr = null
    this.pDecipherOn = false
    this.pD = false
    this.pUnicodeDirector = true // JS is always Unicode
    this.pLastError = 0
    this.pConnectionEstablishing = true
    this.pConnectionRetryDelay = 2000
    this.pConnectionRetryCount = 5
    this.pConnectionTries = 0
    this.pID = null
  }

  construct() {
    this.pUnicodeDirector = true
    this.pDecipherOn = false
    this.pEncryptionOn = false
    this.pMsgStruct = { connection: this }
    this.pDecoder = null
    this.pEncoder = null
    this.pLastContent = ''
    this.pConnectionShouldBeKilled = false
    this.pCommandsPntr = { value: {} }
    this.pListenersPntr = { value: {} }
    this.setLogMode(getIntVariable('connection.log.level', 0))
    this.pLastError = 0
    this.pConnectionEstablishing = true
    this.pConnectionRetryDelay = getIntVariable('connection.retry.delay', 2000)
    this.pConnectionRetryCount = getIntVariable('connection.retry.count', 5)
    this.pConnectionTries = 0
    this.pHost = null
    this.pPort = null
    return true
  }

  deconstruct() {
    return this.disconnect(true)
  }

  connect(tHost, tPort) {
    if (voidP(this.pHost) && voidP(this.pPort)) {
      sendProcessTracking(30)
      this.pHost = tHost
      this.pPort = tPort
    }
    this.pConnectionTries++
    if (timeoutExists('RetryConnection')) {
      removeTimeout('RetryConnection')
    }
    // In Director: pXtra = new(xtra("Multiuser"))
    // In JS: WebSocket connection
    this.pXtra = new WebSocket('ws://' + tHost + ':' + tPort)
    this.pXtra.binaryType = 'arraybuffer'
    this.pXtra.onopen = () => {
      this.pConnectionOk = true
      this.pConnectionEstablishing = false
      if (this.pLogMode > 0) {
        this.log('Connection initialized: ' + this.pID + ' ' + tHost + ' ' + tPort)
      }
    }
    this.pXtra.onmessage = (event) => {
      this._handleMessage(event.data)
    }
    this.pXtra.onerror = () => {
      this.pLastError = 'connection_error'
      if (!this.pConnectionEstablishing) {
        this.disconnect()
      } else {
        if (this.pConnectionTries > this.pConnectionRetryCount) {
          error(this, 'Failed connection retry ' + this.pConnectionTries + ' times.', symbol('#connect'), symbol('#critical'))
          this.disconnect()
        } else {
          this.pConnectionOk = false
          createTimeout('RetryConnection', this.pConnectionRetryDelay, symbol('#connect'), this.pID, null, false)
        }
      }
    }
    this.pXtra.onclose = () => {
      this.pConnectionOk = false
    }
    this.pLastContent = ''
    return true
  }

  disconnect(tControlled) {
    if (tControlled !== true) {
      this.forwardMsg(-1)
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
    return this.pConnectionOk && this.pConnectionSecured
  }

  setDecoder(tDecoder) {
    if (!objectp(tDecoder)) {
      return error(this, 'Decoder object expected: ' + tDecoder, symbol('#setDecoder'), symbol('#major'))
    }
    this.pDecoder = tDecoder
    return true
  }

  getDecoder() {
    return this.pDecoder
  }

  setEncoder(tEncoder) {
    if (!objectp(tEncoder)) {
      return error(this, 'Encoder object expected: ' + tEncoder, symbol('#setEncoder'), symbol('#major'))
    }
    this.pEncoder = tEncoder
    return true
  }

  getEncoder() {
    return this.pEncoder
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

  getLogMode() {
    return this.pLogMode
  }

  setEncryption(tBoolean) {
    this.pEncryptionOn = tBoolean
    this.pConnectionSecured = true
    return true
  }

  send(tCmd, tMsg) {
    if (this.pConnectionShouldBeKilled) {
      return false
    }
    if (tMsg && typeof tMsg === 'object' && !Array.isArray(tMsg)) {
      return this.sendNew(tCmd, tMsg)
    }
    if (!(this.pConnectionOk && this.pXtra)) {
      return error(this, 'Connection not ready: ' + this.pID, symbol('#send'), symbol('#major'))
    }
    if (typeof tMsg !== 'string') {
      tMsg = String(tMsg)
    }
    tMsg = encodeUTF8(tMsg)
    let tStr = tCmd
    if (typeof tCmd !== 'number') {
      tStr = tCmd
      tCmd = this.pCommandsPntr.value[tStr]
    }
    if (voidP(tCmd)) {
      return error(this, 'Unrecognized command!', symbol('#send'), symbol('#major'))
    }
    if (this.pLogMode > 0) {
      this.log('<-- ' + tStr + '(' + tCmd + ') ' + tMsg)
    }
    tMsg = tCmd + tMsg
    // Encode length and send via WebSocket
    this._sendBinary(tMsg)
    return true
  }

  sendNew(tCmd, tParmArr) {
    if (!(this.pConnectionOk && this.pXtra)) {
      return error(this, 'Connection not ready: ' + this.pID, symbol('#send'), symbol('#major'))
    }
    let tMsg = ''
    let tLength = 2
    if (Array.isArray(tParmArr)) {
      // Simplified - in Director this handles typed parameters
      // In JS, we serialize to JSON for simplicity
      tMsg = JSON.stringify(tParmArr)
      tLength = tMsg.length + 2
    }
    let tStr = tCmd
    if (typeof tCmd !== 'number') {
      tStr = tCmd
      tCmd = this.pCommandsPntr.value[tStr]
    }
    if (voidP(tCmd)) {
      return error(this, 'Unrecognized command!', symbol('#send'), symbol('#major'))
    }
    if (this.pLogMode > 0) {
      this.log('<-- ' + tStr + '(' + tCmd + ') ' + tMsg)
    }
    tMsg = tCmd + tMsg
    this._sendBinary(tMsg)
    return true
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#xtra'):
        return this.pXtra
      case symbol('#host'):
        return this.pHost
      case symbol('#port'):
        return this.pPort
      case symbol('#decoder'):
        return this.getDecoder()
      case symbol('#encoder'):
        return this.getEncoder()
      case symbol('#logmode'):
        return this.getLogMode()
      case symbol('#listener'):
        return this.pListenersPntr
      case symbol('#commands'):
        return this.pCommandsPntr
      case symbol('#message'):
        return this.pMsgStruct
      case symbol('#deciphering'):
        return this.pDecipherOn
      default:
        return 0
    }
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case symbol('#decoder'):
        return this.setDecoder(tValue)
      case symbol('#encoder'):
        return this.setEncoder(tValue)
      case symbol('#logmode'):
        return this.setLogMode(tValue)
      case symbol('#listener'):
        this.pListenersPntr = tValue
        return true
      case symbol('#commands'):
        this.pCommandsPntr = tValue
        return true
      case symbol('#deciphering'):
        this.pDecipherOn = tValue
        return true
      default:
        return false
    }
  }

  GetLastError() {
    return this.pLastError
  }

  _handleMessage(data) {
    if (this.pConnectionShouldBeKilled) {
      return
    }
    // In Director: pXtra.getNetMessage()
    // In JS: data is the message from WebSocket
    if (this.pEncryptionOn && this.pDecipherOn && this.pDecoder) {
      data = this.pDecoder.decode(data)
    }
    this.msghandler(data)
  }

  msghandler(tContent) {
    if (typeof tContent !== 'string') {
      return false
    }
    if (this.pLastContent.length > 0) {
      tContent = this.pLastContent + tContent
      this.pLastContent = ''
    }
    while (tContent.length > 0) {
      if (tContent.length < 3) {
        this.pLastContent = this.pLastContent + tContent
        return
      }
      const tByte1 = bitAnd(charToNum(tContent[1]), 63)
      const tByte2 = bitAnd(charToNum(tContent[0]), 63)
      const tMsgType = bitOr(tByte2 * 64, tByte1)
      let tLength = tContent.indexOf(String.fromCharCode(1))
      if (tLength === -1) {
        this.pLastContent = tContent
        return
      }
      const tParams = tContent.substring(2, tLength)
      tContent = tContent.substring(tLength + 1)
      const decodedParams = decodeUTF8(tParams)
      this.forwardMsg(tMsgType, decodedParams)
    }
  }

  forwardMsg(tSubject, tParams) {
    if (this.pLogMode > 0) {
      this.log('--> ' + tSubject + '\n' + tParams)
    }
    tParams = getStringServices().convertSpecialChars(tParams)
    const listeners = this.pListenersPntr.value
    const tCallbackList = listeners[tSubject]
    if (!Array.isArray(tCallbackList)) {
      return error(this, 'Listener not found: ' + tSubject + '/' + this.pID, symbol('#forwardMsg'), symbol('#minor'))
    }
    const tObjMgr = getObjectManager()
    for (let i = 0; i < tCallbackList.length; i++) {
      const tCallback = tCallbackList[i]
      const tObject = tObjMgr.GET(tCallback[0])
      if (tObject !== 0) {
        this.pMsgStruct.subject = tSubject
        this.pMsgStruct.content = tParams
        getConnectionManager().registerLastMessage(tSubject, tParams)
        call(tCallback[1], tObject, this.pMsgStruct)
        continue
      }
      error(this, 'Listening obj not found, removed: ' + tCallback[0], symbol('#forwardMsg'), symbol('#minor'))
      tCallbackList.shift()
      i--
    }
  }

  log(tMsg) {
    if (!this.pD) {
      if (true) { // not Author mode check in JS
        return true
      }
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
      case 3:
        executeMessage(symbol('#logdata'), tMsg)
        break
    }
  }

  _sendBinary(tMsg) {
    if (this.pXtra && this.pXtra.readyState === WebSocket.OPEN) {
      this.pXtra.send(tMsg)
    }
  }
}
