// fuse_client/6_Object API.ls → object-api.js
// Global API facade for the object manager system

import {
  voidP,
  listp,
  value,
  field,
  convertToPropList,
  script,
  RETURN,
} from '../core/lingo-runtime.js'

// Global variable (Lingo: global gCore)
let gCore = null

function constructObjectManager() {
  if (typeof gCore === 'object' && gCore !== null) {
    return gCore
  }
  const tClass = value(convertToPropList(field('System Props'), RETURN).getaProp('object.manager.class'))[0]
  gCore = script(tClass).new()
  gCore.construct()
  return gCore
}

function deconstructObjectManager() {
  if (voidP(gCore)) {
    return false
  }
  gCore.deconstruct()
  gCore = null
  return true
}

export function getObjectManager() {
  if (voidP(gCore)) {
    return constructObjectManager()
  }
  return gCore
}

export function createObject(tID, ...args) {
  const tClassList = []
  for (let i = 0; i < args.length; i++) {
    const tParam = args[i]
    if (listp(tParam)) {
      for (const tClass of tParam) {
        tClassList.push(tClass)
      }
      continue
    }
    tClassList.push(tParam)
  }
  return getObjectManager().create(tID, tClassList)
}

export function removeObject(tID) {
  return getObjectManager().Remove(tID)
}

export function getObject(tID) {
  return getObjectManager().GET(tID)
}

export function objectExists(tID) {
  return getObjectManager().exists(tID)
}

export function printObjects() {
  return getObjectManager().print()
}

export function registerObject(tID, tObject) {
  return getObjectManager().registerObject(tID, tObject)
}

export function unregisterObject(tID) {
  return getObjectManager().unregisterObject(tID)
}

export function createManager(tID, ...args) {
  const tClassList = []
  for (let i = 0; i < args.length; i++) {
    const tParam = args[i]
    if (listp(tParam)) {
      for (const tClass of tParam) {
        tClassList.push(tClass)
      }
      continue
    }
    tClassList.push(tParam)
  }
  const tObjMngr = getObjectManager()
  const tObjInst = tObjMngr.create(tID, tClassList)
  tObjMngr.registerManager(tID)
  tObjMngr.setaProp(tID, tObjInst)
  return tObjInst
}

export function removeManager(tID) {
  return getObjectManager().Remove(tID)
}

export function getManager(tID) {
  return getObjectManager().getManager(tID)
}

export function managerExists(tID) {
  return getObjectManager().managerExists(tID)
}

export function printManagers() {
  return getObjectManager().print()
}

export function registerManager(tID) {
  return getObjectManager().registerManager(tID)
}

export function unregisterManager(tID) {
  return getObjectManager().unregisterManager(tID)
}

export function receivePrepare(tID) {
  return getObjectManager().receivePrepare(tID)
}

export function removePrepare(tID) {
  return getObjectManager().removePrepare(tID)
}

export function receiveUpdate(tID) {
  return getObjectManager().receiveUpdate(tID)
}

export function removeUpdate(tID) {
  return getObjectManager().removeUpdate(tID)
}

export function pauseUpdate() {
  return getObjectManager().pauseUpdate()
}

export function unpauseUpdate() {
  return getObjectManager().resumeUpdate()
}
