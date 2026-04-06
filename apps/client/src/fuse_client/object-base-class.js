// fuse_client/46_Object Base Class.ls → object-base-class.js
// Base class for all objects - provides ID, delays, and lifecycle

import {
  symbol,
  symbolp,
  integerp,
  voidP,
  string,
  integer,
  error,
  call,
  createPropList,
  Timeout,
  theMilliSeconds,
} from '../core/lingo-runtime.js'

export class ObjectBaseClass {
  constructor() {
    this.id = null
    this.valid = true
    this.delays = createPropList()
  }

  construct() {
    this.valid = true
    this.delays = createPropList()
    return true
  }

  deconstruct() {
    if (this.delays.count > 0) {
      const keys = this.delays.keys()
      for (const key of keys) {
        const timeout = this.delays.getaProp(key)
        if (timeout && timeout.stop) timeout.stop()
      }
    }
    this.delays = createPropList()
    return true
  }

  setID(tID) {
    if (voidP(this.id)) {
      this.id = tID
    } else {
      error(this, "Attempted to redefine object's ID:\n" + this.id + ' -> ' + tID, symbol('#setID'), symbol('#minor'))
    }
  }

  getID() {
    return this.id
  }

  delay(tTime, tMethod, tArgument) {
    if (!integerp(tTime)) {
      return error(this, 'Integer expected: ' + tTime, symbol('#delay'), symbol('#major'))
    }
    if (!symbolp(tMethod)) {
      return error(this, 'Symbol expected: ' + tMethod, symbol('#delay'), symbol('#major'))
    }
    const tUniqueId = 'Delay' + this.getID() + theMilliSeconds()
    const tTimeout = new Timeout(tUniqueId, tTime, (t) => this.executeDelay(t), this, null, false)
    tTimeout.start()
    const tList = { method: tMethod, argument: tArgument }
    this.delays.setaProp(tUniqueId, tList)
    return tUniqueId
  }

  Cancel(tDelayID) {
    if (voidP(this.delays.getaProp(tDelayID))) {
      return false
    }
    const timeout = this.delays.getaProp(tDelayID)
    if (timeout && timeout.stop) timeout.stop()
    return this.delays.deleteProp(tDelayID)
  }

  getRefCount() {
    // Lingo: integer(string(param(1)).word[string(param(1)).word.count - 1]) - 3
    // Not directly applicable in JS
    return 0
  }

  print() {
    console.log(this)
  }

  executeDelay(tTimeout) {
    const tID = tTimeout.name
    const tTask = this.delays.getaProp(tID)
    this.Cancel(tID)
    call(tTask.method, this, tTask.argument)
  }
}
