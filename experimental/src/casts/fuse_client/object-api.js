/**
 * Object API
 * 
 * Translated from: casts/fuse_client/6_Object API.ls
 * 
 * Global functions for object/manager lifecycle.
 * These are the public API that all other scripts use to
 * create, access, and manage objects and managers.
 * 
 * Original Lingo pattern:
 *   global gCore
 *   on constructObjectManager me ...
 *   on createObject tID ...
 *   on getManager tID ...
 */

import { VOID, voidp, listp } from '../../core/lingo-runtime.js';
import { getManagerClassList } from '../../system/system-props.js';
import { ObjectManager } from './object-manager-class.js';

/**
 * Global core object manager instance (equivalent of `global gCore`)
 * @type {ObjectManager|null}
 */
let gCore = null;

/**
 * Construct the object manager
 * 
 * Original Lingo:
 *   on constructObjectManager me
 *     if objectp(gCore) then return gCore
 *     tClass = value(... "object.manager.class" ...)[1]
 *     gCore = script(tClass).new()
 *     gCore.construct()
 *     return gCore
 *   end
 */
export function constructObjectManager() {
  if (gCore !== null) {
    return gCore;
  }

  // Get the class list from system props
  const tClassList = getManagerClassList('object');
  gCore = new ObjectManager();
  gCore.construct();
  return gCore;
}

/**
 * Deconstruct the object manager
 */
export function deconstructObjectManager() {
  if (gCore === null) return 0;
  gCore.deconstruct();
  gCore = null;
  return 1;
}

/**
 * Get the object manager (lazy-init if needed)
 * 
 * Original Lingo:
 *   on getObjectManager
 *     if voidp(gCore) then return constructObjectManager()
 *     return gCore
 *   end
 */
export function getObjectManager() {
  if (gCore === null) {
    return constructObjectManager();
  }
  return gCore;
}

/**
 * Create an object with the given ID and class list
 * 
 * Original Lingo:
 *   on createObject tID
 *     tClassList = []
 *     repeat with i = 2 to the paramCount
 *       tParam = param(i)
 *       if listp(tParam) then
 *         repeat with tClass in tParam
 *           tClassList.add(tClass)
 *         end repeat
 *         next repeat
 *       end if
 *       tClassList.add(tParam)
 *     end repeat
 *     return getObjectManager().create(tID, tClassList)
 *   end
 * 
 * In JS, we use rest params instead of param(i):
 *   createObject(tID, ...classNames)
 */
export function createObject(tID, ...classArgs) {
  const tClassList = [];

  for (const tParam of classArgs) {
    if (listp(tParam)) {
      // Flatten nested lists
      for (const tClass of tParam) {
        tClassList.push(tClass);
      }
    } else {
      tClassList.push(tParam);
    }
  }

  return getObjectManager().create(tID, tClassList);
}

/**
 * Remove an object by ID
 */
export function removeObject(tID) {
  return getObjectManager().remove(tID);
}

/**
 * Get an object by ID
 */
export function getObject(tID) {
  return getObjectManager().get(tID);
}

/**
 * Check if an object exists
 */
export function objectExists(tID) {
  return getObjectManager().exists(tID);
}

/**
 * Print all objects (debug)
 */
export function printObjects() {
  return getObjectManager().print();
}

/**
 * Register an object directly
 */
export function registerObject(tID, tObject) {
  return getObjectManager().registerObject(tID, tObject);
}

/**
 * Unregister an object
 */
export function unregisterObject(tID) {
  return getObjectManager().unregisterObject(tID);
}

/**
 * Create a manager object
 * 
 * Original Lingo:
 *   on createManager tID
 *     tClassList = []
 *     repeat with i = 2 to the paramCount
 *       tParam = param(i)
 *       if listp(tParam) then
 *         repeat with tClass in tParam
 *           tClassList.add(tClass)
 *         end repeat
 *         next repeat
 *       end if
 *       tClassList.add(tParam)
 *     end repeat
 *     tObjMngr = getObjectManager()
 *     tObjInst = tObjMngr.create(tID, tClassList)
 *     tObjMngr.registerManager(tID)
 *     tObjMngr.setaProp(tID, tObjInst)
 *     return tObjInst
 *   end
 */
export function createManager(tID, ...classArgs) {
  const tClassList = [];

  for (const tParam of classArgs) {
    if (listp(tParam)) {
      for (const tClass of tParam) {
        tClassList.push(tClass);
      }
    } else {
      tClassList.push(tParam);
    }
  }

  const tObjMngr = getObjectManager();
  const tObjInst = tObjMngr.create(tID, tClassList);
  tObjMngr.registerManager(tID);
  tObjMngr.setProp(tID, tObjInst);
  return tObjInst;
}

/**
 * Remove a manager
 */
export function removeManager(tID) {
  return getObjectManager().remove(tID);
}

/**
 * Get a manager by ID
 */
export function getManager(tID) {
  return getObjectManager().getManager(tID);
}

/**
 * Check if a manager exists
 */
export function managerExists(tID) {
  return getObjectManager().managerExists(tID);
}

/**
 * Print managers (debug)
 */
export function printManagers() {
  return getObjectManager().printManagers();
}

/**
 * Register a manager ID
 */
export function registerManager(tID) {
  return getObjectManager().registerManager(tID);
}

/**
 * Unregister a manager
 */
export function unregisterManager(tID) {
  return getObjectManager().unregisterManager(tID);
}

// ── Receive/Remove prepare/update hooks ──────────────────────────────────

export function receivePrepare(tID) {
  return getObjectManager().receivePrepare(tID);
}

export function removePrepare(tID) {
  return getObjectManager().removePrepare(tID);
}

export function receiveUpdate(tID) {
  return getObjectManager().receiveUpdate(tID);
}

export function removeUpdate(tID) {
  return getObjectManager().removeUpdate(tID);
}

export function pauseUpdate() {
  return getObjectManager().pauseUpdate();
}

export function unpauseUpdate() {
  return getObjectManager().resumeUpdate();
}

// ── Export for internal use ──────────────────────────────────────────────

export { gCore };
