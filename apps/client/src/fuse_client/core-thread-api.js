// fuse_client/8_Core Thread API.ls → core-thread-api.js
// Thread manager API facade

import {
  symbol,
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructThreadManager() {
  return createManager(symbol('#thread_manager'), getClassVariable('thread.manager.class'))
}

function deconstructThreadManager() {
  return removeManager(symbol('#thread_manager'))
}

export function getThreadManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#thread_manager'))) {
    return constructThreadManager()
  }
  return tMgr.getManager(symbol('#thread_manager'))
}

export function createThread(tID, tInitField) {
  return getThreadManager().create(tID, tInitField)
}

export function removeThread(tID) {
  return getThreadManager().Remove(tID)
}

export function getThread(tID) {
  return getThreadManager().GET(tID)
}

export function threadExists(tID) {
  return getThreadManager().exists(tID)
}

export function initThread(tCastNumOrMemName) {
  return getThreadManager().initThread(tCastNumOrMemName)
}

export function initExistingThreads() {
  return getThreadManager().initAll()
}

export function closeThread(tCastNumOrID) {
  return getThreadManager().closeThread(tCastNumOrID)
}

export function closeExistingThreads() {
  return getThreadManager().closeAll()
}

export function printThreads() {
  return getThreadManager().print()
}
