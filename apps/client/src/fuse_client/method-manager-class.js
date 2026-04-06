// fuse_client/41_Method Manager Class.ls → method-manager-class.js
// Method manager - caches and routes connection commands to object methods

import {
  symbol,
  symbolp,
  stringp,
  voidP,
  objectp,
  createPropList,
  error,
} from '../core/lingo-runtime.js'
import { ManagerTemplateClass } from './manager-template-class.js'

export class MethodManagerClass extends ManagerTemplateClass {
  constructor() {
    super()
    this.pMethodCache = createPropList()
  }

  construct() {
    this.pMethodCache = createPropList()
    return true
  }

  deconstruct() {
    this.pItemList = createPropList()
    this.pMethodCache = createPropList()
    return true
  }

  create(tID, tObject) {
    if (!this.register(tID, tObject)) {
      return error(this, 'Failed to register object: ' + tID, symbol('#create'), symbol('#major'))
    } else {
      this.pItemList.setaProp(tID, tObject)
      return true
    }
  }

  getMethod(tConnectionID, tCommand) {
    const tMethods = this.pMethodCache.getaProp(tConnectionID)
    if (voidP(tMethods)) {
      return error(this, 'Method list for connection not found: ' + tConnectionID, symbol('#getMethod'), symbol('#major'))
    } else {
      return tMethods.getaProp(tCommand)
    }
  }

  Remove(tID) {
    if (voidP(this.pItemList.getaProp(tID))) {
      return error(this, 'Object not found: ' + tID, symbol('#Remove'), symbol('#minor'))
    } else {
      this.unregister(tID)
      this.pItemList.deleteProp(tID)
      return true
    }
  }

  register(tID, tObject) {
    if (!tObject.getCommands || typeof tObject.getCommands !== 'function') {
      return error(this, 'Invalid method object: ' + tID, symbol('#register'), symbol('#major'))
    }
    const tMethodList = tObject.getCommands()
    if (!tMethodList || !tMethodList.count) {
      return error(this, 'Invalid method object: ' + tID, symbol('#register'), symbol('#major'))
    }
    for (let i = 1; i <= tMethodList.count; i++) {
      const tMethod = tMethodList.getPropAt(i)
      if (voidP(this.pMethodCache.getaProp(tMethod))) {
        this.pMethodCache.setaProp(tMethod, createPropList())
      }
      const tCurrentList = this.pMethodCache.getaProp(tMethod)
      const commands = tMethodList.getAt(i)
      if (Array.isArray(commands)) {
        for (let j = 0; j < commands.length; j++) {
          const cmdName = commands[j]
          if (tObject[cmdName] && typeof tObject[cmdName] === 'function') {
            tCurrentList.setaProp(cmdName, [cmdName, tID])
            continue
          }
          error(this, 'Method #' + cmdName + ' not found in object: ' + tID, symbol('#register'), symbol('#major'))
        }
      }
    }
    return true
  }

  unregister(tObjectOrID) {
    let tID
    if (objectp(tObjectOrID)) {
      tID = tObjectOrID.getID ? tObjectOrID.getID() : null
    } else if (stringp(tObjectOrID) || symbolp(tObjectOrID)) {
      if (!this.GET(tObjectOrID)) {
        return error(this, 'Object not found: ' + tObjectOrID, symbol('#unregister'), symbol('#minor'))
      }
      tID = tObjectOrID
    }
    if (!tID) return false

    const connKeys = this.pMethodCache.keys()
    for (const tConnection of connKeys) {
      const connList = this.pMethodCache.getaProp(tConnection)
      const cmdKeys = connList.keys()
      for (let j = cmdKeys.length - 1; j >= 0; j--) {
        const tCommand = cmdKeys[j]
        const entry = connList.getaProp(tCommand)
        if (entry && entry[1] === tID) {
          connList.deleteProp(tCommand)
        }
      }
    }
    return true
  }
}
