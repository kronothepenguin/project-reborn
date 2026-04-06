// fuse_client/22_Binary API.ls → binary-api.js
// Binary manager API facade

import {
  symbol,
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructBinaryManager() {
  return createManager(symbol('#binary_data_manager'), getClassVariable('binary.manager.class'))
}

function deconstructBinaryManager() {
  return removeManager(symbol('#binary_data_manager'))
}

export function getBinaryManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#binary_data_manager'))) {
    return constructBinaryManager()
  }
  return tMgr.getManager(symbol('#binary_data_manager'))
}

export function retrieveBinaryData(tID, tAuth, tCallBackObject) {
  return getBinaryManager().retrieveData(tID, tAuth, tCallBackObject)
}

export function storeBinaryData(tdata, tCallBackObject) {
  return getBinaryManager().storeData(tdata, tCallBackObject)
}

export function addMessageToBinaryQueue(tMsg) {
  return getBinaryManager().addMessageToQueue(tMsg)
}
