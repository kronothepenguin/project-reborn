/**
 * Method Manager Class
 * Translated from: 41_Method Manager Class.ls
 * Caches method lookups for connection command routing.
 */
import { VOID, voidp, stringp, symbolp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { error } from './error-api.js';

export class MethodManager extends ObjectBase {
  constructor() {
    super();
    this.itemList = new Map();
    this.methodCache = new Map();
  }

  construct() { this.itemList = new Map(); this.methodCache = new Map(); return 1; }
  deconstruct() { this.itemList.clear(); this.methodCache.clear(); return 1; }

  create(tID, tObject) {
    if (!this.register(tID, tObject)) {
      error(this, `Failed to register object: ${tID}`, 'create', 'major');
      return 0;
    }
    this.itemList.set(tID, tObject);
    return 1;
  }

  getMethod(tConnectionID, tCommand) {
    const methods = this.methodCache.get(tConnectionID);
    if (voidp(methods)) {
      error(this, `Method list for connection not found: ${tConnectionID}`, 'getMethod', 'major');
      return VOID;
    }
    return methods[tCommand];
  }

  remove(tID) {
    if (!this.itemList.has(tID)) {
      error(this, `Object not found: ${tID}`, 'remove', 'minor');
      return 0;
    }
    this.unregister(tID);
    this.itemList.delete(tID);
    return 1;
  }

  register(tID, tObject) {
    // In Lingo: tObject.handler(#getCommands)
    // In JS: check if getCommands method exists
    if (typeof tObject.getCommands !== 'function') {
      error(this, `Invalid method object: ${tID}`, 'register', 'major');
      return 0;
    }

    const methodList = tObject.getCommands();
    if (typeof methodList !== 'object' || Array.isArray(methodList)) {
      error(this, `Invalid method object: ${tID}`, 'register', 'major');
      return 0;
    }

    for (const [method, handlers] of Object.entries(methodList)) {
      if (!this.methodCache.has(method)) {
        this.methodCache.set(method, {});
      }
      const currentList = this.methodCache.get(method);

      for (const [handlerKey, handlerName] of Object.entries(handlers)) {
        if (typeof tObject[handlerName] === 'function') {
          currentList[handlerKey] = [handlerName, tID];
        } else {
          error(this, `Method #${handlerName} not found in object: ${tID}`, 'register', 'major');
        }
      }
    }
    return 1;
  }

  unregister(tObjectOrID) {
    let tID;
    if (tObjectOrID && typeof tObjectOrID === 'object' && tObjectOrID.getID) {
      tID = tObjectOrID.getID();
    } else if (stringp(tObjectOrID) || symbolp(tObjectOrID)) {
      tID = tObjectOrID;
    } else {
      error(this, `Object not found: ${tObjectOrID}`, 'unregister', 'minor');
      return 0;
    }

    for (const [connection, commands] of this.methodCache) {
      for (const [cmd, [handler, objID]] of Object.entries(commands)) {
        if (objID === tID) {
          delete commands[cmd];
        }
      }
    }
    return 1;
  }
}

ObjectManager.registerClass('Method Manager Class', MethodManager);
