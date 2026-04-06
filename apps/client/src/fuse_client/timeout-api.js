// fuse_client/14_Timeout API.ls → timeout-api.js
// Timeout manager API facade

import {
  symbol,
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructTimeoutManager() {
  return createManager(symbol('#timeout_manager'), getClassVariable('timeout.manager.class'))
}

function deconstructTimeoutManager() {
  return removeManager(symbol('#timeout_manager'))
}

export function getTimeoutManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#timeout_manager'))) {
    return constructTimeoutManager()
  }
  return tMgr.getManager(symbol('#timeout_manager'))
}

export function createTimeout(tID, tTime, tHandler, tClientID, tArguments, tIterations) {
  return getTimeoutManager().create(tID, tTime, tHandler, tClientID, tArguments, tIterations)
}

export function removeTimeout(tID) {
  return getTimeoutManager().Remove(tID)
}

export function getTimeout(tID) {
  return getTimeoutManager().GET(tID)
}

export function timeoutExists(tID) {
  return getTimeoutManager().exists(tID)
}

export function printTimeouts() {
  return getTimeoutManager().print()
}

