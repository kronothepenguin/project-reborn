/**
 * Binary API
 * Translated from: 22_Binary API.ls
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { getManager, createManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructBinaryManager() {
  return createManager('binary_data_manager', getManagerClassList('binary'));
}

export function deconstructBinaryManager() {
  return removeManager('binary_data_manager');
}

export function getBinaryManager() {
  if (!managerExists('binary_data_manager')) return constructBinaryManager();
  return getManager('binary_data_manager');
}

export function retrieveBinaryData(tID, tAuth, tCallBackObject) {
  return getBinaryManager().retrieveData(tID, tAuth, tCallBackObject);
}

export function storeBinaryData(tdata, tCallBackObject) {
  return getBinaryManager().storeData(tdata, tCallBackObject);
}

export function addMessageToBinaryQueue(tMsg) {
  return getBinaryManager().addMessageToQueue(tMsg);
}
