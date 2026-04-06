// fuse_client/24_Multiuser API.ls → multiuser-api.js
// Multiuser manager API facade

import {
  symbol,
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructMultiuserManager() {
  return createManager(symbol('#multiuser_manager'), getClassVariable('multiuser.manager.class'))
}

function deconstructMultiuserManager() {
  return removeManager(symbol('#multiuser_manager'))
}

export function getMultiuserManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#multiuser_manager'))) {
    return constructMultiuserManager()
  }
  return tMgr.getManager(symbol('#multiuser_manager'))
}

export function createMultiuser(tID, tHost, tPort) {
  return getMultiuserManager().create(tID, tHost, tPort)
}

export function removeMultiuser(tID) {
  return getMultiuserManager().Remove(tID)
}

export function getMultiuser(tID) {
  return getMultiuserManager().GET(tID)
}

export function multiuserExists(tID) {
  return getMultiuserManager().exists(tID)
}

export function printMultiusers() {
  return getMultiuserManager().print()
}
