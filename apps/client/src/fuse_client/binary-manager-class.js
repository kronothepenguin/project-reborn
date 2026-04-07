// fuse_client/42_Binary Manager Class.ls → binary-manager-class.js
// Binary manager - handles binary data storage/retrieval via MUS connection

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
  call,
} from '../core/lingo-runtime.js'
import { getVariable, getIntVariable } from './variable-api.js'
import { getObject, createObject } from './object-api.js'
import { getMultiuserManager, getMultiuser, multiuserExists, createMultiuser, removeMultiuser } from './multiuser-api.js'
import { createTimeout, timeoutExists, removeTimeout } from './timeout-api.js'

export class BinaryManagerClass {
  constructor() {
    this.pConnectionId = symbol('#mus')
    this.pTimeOutID = 'mus_close_delay'
    this.pQueue = []
    this.pCrypto = null
    this.pUseCrypto = 0
    this.pHandshakeFinished = 0
    this.pCallBacks = createPropList()
    this.pID = null
  }

  construct() {
    this.pConnectionId = getVariable('connection.mus.id', symbol('#mus'))
    this.pTimeOutID = 'mus_close_delay'
    this.pCallBacks = createPropList()
    this.pQueue = []
    this.pCrypto = createObject(symbol('#temp'), ['RC4 Class'])
    this.pUseCrypto = 0
    this.pHandshakeFinished = 0
    return this.registerCmds(1)
  }

  deconstruct() {
    this.registerCmds(0)
    this.pHandshakeFinished = 0
    this.pUseCrypto = 0
    return removeMultiuser(this.pConnectionId)
  }

  retrieveData(tID, tAuth, tCallBackObj) {
    this.pQueue.push({ type: symbol('#retrieve'), id: tID, auth: tAuth, callback: tCallBackObj })
    if ((count(this.pQueue) === 1) || !multiuserExists(this.pConnectionId)) {
      this.next()
    }
  }

  storeData(tdata, tCallBackObj) {
    this.pQueue.push({ type: symbol('#store'), data: tdata, callback: tCallBackObj })
    if ((count(this.pQueue) === 1) || !multiuserExists(this.pConnectionId)) {
      this.next()
    }
  }

  addMessageToQueue(tMsg) {
    this.pQueue.push({ type: symbol('#fusemsg'), message: tMsg })
    if ((count(this.pQueue) === 1) || !multiuserExists(this.pConnectionId)) {
      this.next()
    }
  }

  checkConnection() {
    if (!multiuserExists(this.pConnectionId)) {
      return error(this, 'MUS connection not found: ' + this.pConnectionId, symbol('#checkConnection'), symbol('#minor'))
    }
    if (getMultiuser(this.pConnectionId).connectionReady() && this.pHandshakeFinished) {
      const tUserID = getObject(symbol('#session')).GET(symbol('#user_user_id'))
      const tMachineID = getSpecialServices().getMachineID()
      let sendUserID = tUserID
      let sendMachineID = tMachineID
      if (this.pUseCrypto) {
        sendUserID = this.pCrypto.encipher(tUserID)
        sendMachineID = this.pCrypto.encipher(tMachineID)
      }
      getMultiuser(this.pConnectionId).send('LOGIN ' + sendUserID + ' ' + sendMachineID)
      this.next()
    } else {
      this.delay(1000, symbol('#checkConnection'))
    }
  }

  next() {
    if (!multiuserExists(this.pConnectionId)) {
      createMultiuser(this.pConnectionId, getVariable('connection.mus.host'), getIntVariable('connection.mus.port'))
      getMultiuser(this.pConnectionId).registerBinaryDataHandler(this.pID, symbol('#binaryDataReceived'))
      this.delay(1000, symbol('#checkConnection'))
    } else {
      if (getMultiuser(this.pConnectionId).connectionReady()) {
        if (timeoutExists(this.pTimeOutID)) {
          removeTimeout(this.pTimeOutID)
        }
        if (count(this.pQueue) > 0) {
          const tTask = this.pQueue[0]
          switch (tTask.type) {
            case symbol('#store'):
              return getMultiuser(this.pConnectionId).sendBinary(tTask.data)
            case symbol('#retrieve'):
              return getMultiuser(this.pConnectionId).send('GETBINDATA ' + tTask.id + ' ' + tTask.auth)
            case symbol('#fusemsg'):
              this.pQueue.shift()
              getMultiuser(this.pConnectionId).send(tTask.message)
              this.next()
              return true
          }
        } else {
          createTimeout(this.pTimeOutID, 30000, symbol('#delayedClosing'), this.pID, null, 1)
        }
      }
    }
  }

  binaryDataStored(tMsg) {
    const tTask = this.pQueue[0]
    if (tTask.callback !== null) {
      const tObject = getObject(tTask.callback)
      if (tObject && typeof tObject === 'object') {
        call(symbol('#binaryDataStored'), tObject, tMsg.getaProp ? tMsg.getaProp(symbol('#content')) : tMsg)
      }
    }
    this.pQueue.shift()
    this.next()
  }

  binaryDataAuthKeyError() {
    this.pQueue.shift()
    this.next()
  }

  binaryDataReceived(tdata) {
    const tTask = this.pQueue[0]
    this.pQueue.shift()
    if (tTask.callback !== null) {
      const tObject = getObject(tTask.callback)
      if (tObject && typeof tObject === 'object') {
        call(symbol('#binaryDataReceived'), tObject, tdata, tTask.id)
      }
    }
    this.next()
  }

  delayedClosing() {
    if (multiuserExists(this.pConnectionId) && (count(this.pQueue) === 0)) {
      removeMultiuser(this.pConnectionId)
    }
  }

  registerCmds(tBool) {
    const tList = {}
    tList['BINDATA_SAVED'] = symbol('#binaryDataStored')
    tList['BINDATA_AUTHKEYERROR'] = symbol('#binaryDataAuthKeyError')
    tList['DISCONNECT'] = symbol('#deconstruct')
    tList['HELLO'] = symbol('#helloReply')
    tList['U_RTS'] = symbol('#foo')
    if (tBool) {
      return getMultiuserManager().registerListener(this.pConnectionId, this.pID, tList)
    } else {
      return getMultiuserManager().unregisterListener(this.pConnectionId, this.pID, tList)
    }
  }

  foo() {
    // No-op handler
  }

  helloReply(tMsg) {
    let tSecretKey = tMsg[symbol('#content')]
    tSecretKey = integer(tSecretKey)
    if (voidP(tSecretKey) || (tSecretKey === '') || (tSecretKey === 0)) {
      this.pUseCrypto = 0
    } else {
      this.pCrypto.setKey(tSecretKey, symbol('#initPremix'))
      this.pUseCrypto = 1
    }
    this.pHandshakeFinished = 1
  }

  delay(ms, method) {
    setTimeout(() => {
      if (this[method]) this[method]()
    }, ms)
  }
}
