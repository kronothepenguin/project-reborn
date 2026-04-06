// fuse_client/40_Broker Manager Class.ls → broker-manager-class.js
// Broker manager - handles message registration and execution

import {
  symbol,
  symbolp,
  stringp,
  voidP,
  createPropList,
  error,
  objectExists,
  getObjectManager,
  call,
  EMPTY,
} from '../core/lingo-runtime.js'

export class BrokerManagerClass {
  constructor() {
    this.pItemList = createPropList()
    this.pLastExecutedMessage = ''
  }

  construct() {
    this.pLastExecutedMessage = ''
    this.pItemList = createPropList()
    return true
  }

  deconstruct() {
    this.pItemList = createPropList()
    return true
  }

  create(tMessage) {
    if (!symbolp(tMessage) && !stringp(tMessage)) {
      return error(this, 'Symbol or string expected: ' + tMessage, symbol('#create'), symbol('#major'))
    }
    if (!voidP(this.pItemList.getaProp(tMessage))) {
      return error(this, 'Broker task already exists: ' + tMessage, symbol('#create'), symbol('#major'))
    }
    this.pItemList.setaProp(tMessage, createPropList())
    return true
  }

  Remove(tMessage) {
    if (!symbolp(tMessage) && !stringp(tMessage)) {
      return error(this, 'Symbol or string expected: ' + tMessage, symbol('#Remove'), symbol('#minor'))
    }
    if (voidP(this.pItemList.getaProp(tMessage))) {
      return error(this, 'Broker task not found: ' + tMessage, symbol('#Remove'), symbol('#minor'))
    }
    return this.pItemList.deleteProp(tMessage)
  }

  register(tMessage, tClientID, tMethod) {
    if (!symbolp(tMessage) && !stringp(tMessage)) {
      return error(this, 'Symbol or string expected: ' + tMessage, symbol('#register'), symbol('#major'))
    }
    if (!objectExists(tClientID)) {
      return error(this, 'Object not found: ' + tClientID, symbol('#register'), symbol('#major'))
    }
    if (voidP(this.pItemList.getaProp(tMessage))) {
      this.pItemList.setaProp(tMessage, createPropList())
    }
    this.pItemList.getaProp(tMessage).setaProp(tClientID, tMethod)
    return true
  }

  unregister(tMessage, tClientID) {
    if (!symbolp(tMessage) && !stringp(tMessage)) {
      return error(this, 'Symbol or string expected: ' + tMessage, symbol('#unregister'), symbol('#major'))
    }
    const tList = this.pItemList.getaProp(tMessage)
    if (voidP(tList)) {
      return false
    }
    tList.deleteProp(tClientID)
    if (tList.count === 0) {
      this.Remove(tMessage)
    }
    return true
  }

  Execute(tMessage, tArgA, tArgB, tArgC) {
    const tList = this.pItemList.getaProp(tMessage)
    if (voidP(tList)) {
      return false
    }
    const keys = tList.keys()
    for (let i = keys.length - 1; i >= 0; i--) {
      const tID = keys[i]
      const tMethod = tList.getaProp(tID)
      const tObject = getObjectManager().GET(tID)
      if (tObject === 0) {
        this.unregister(tMessage, tID)
        continue
      }
      if (tMethod !== symbol('#invalidateCrapFixer')) {
        this.pLastExecutedMessage = tMethod
      }
      call(tMethod, tObject, tArgA, tArgB, tArgC)
    }
    return true
  }

  exists(tMessage) {
    return !voidP(this.pItemList.getaProp(tMessage))
  }

  print(tMessage) {
    for (let i = 1; i <= this.pItemList.count; i++) {
      const msgKey = this.pItemList.getPropAt(i)
      console.log(msgKey)
      const innerList = this.pItemList.getAt(i)
      for (let j = 1; j <= innerList.count; j++) {
        const clientID = innerList.getPropAt(j)
        const method = innerList.getAt(j)
        console.log('\t', clientID, '->', method)
      }
    }
    return true
  }

  getLastExecutedMessageId() {
    return this.pLastExecutedMessage
  }
}
