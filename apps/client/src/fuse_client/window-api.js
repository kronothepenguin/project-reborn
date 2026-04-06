// fuse_client/18_Window API.ls → window-api.js
// Window manager API facade

import {
  symbol,
  voidP,
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructWindowManager() {
  return createManager(symbol('#window_manager'), getClassVariable('window.manager.class'))
}

function deconstructWindowManager() {
  return removeManager(symbol('#window_manager'))
}

export function getWindowManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#window_manager'))) {
    return constructWindowManager()
  }
  return tMgr.getManager(symbol('#window_manager'))
}

export function createWindow(tID, tLayout, tLocX, tLocY, tSpecial) {
  return getWindowManager().create(tID, tLayout, tLocX, tLocY, tSpecial)
}

export function removeWindow(tID) {
  return getWindowManager().Remove(tID)
}

export function getWindow(tID) {
  return getWindowManager().GET(tID)
}

export function getWindowIDList() {
  return getWindowManager().getIDList()
}

export function windowExists(tID) {
  return getWindowManager().exists(tID)
}

export function mergeWindow(tID, tLayout) {
  if (windowExists(tID)) {
    return getWindow(tID).merge(tLayout)
  } else {
    return false
  }
}

export function activateWindowObj(tID) {
  if (voidP(tID)) {
    return false
  }
  return getWindowManager().Activate(tID)
}

export function deactivateWindowObj(tID) {
  if (voidP(tID)) {
    return false
  }
  return getWindowManager().deactivate(tID)
}

export function registerClient(tID, tClientID) {
  if (windowExists(tID)) {
    return getWindow(tID).registerClient(tClientID)
  } else {
    return false
  }
}

export function registerProcedure(tID, tHandler, tClientID, tEvent) {
  if (windowExists(tID)) {
    return getWindow(tID).registerProcedure(tHandler, tClientID, tEvent)
  } else {
    return false
  }
}

export function showWindows() {
  return getWindowManager().showAll()
}

export function hideWindows() {
  return getWindowManager().hideAll()
}

export function lockWindowLayering() {
  return getWindowManager().lock()
}

export function unlockWindowLayering() {
  return getWindowManager().unlock()
}

export function printWindows() {
  return getWindowManager().print()
}
