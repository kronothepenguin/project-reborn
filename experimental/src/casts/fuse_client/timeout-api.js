/**
 * Timeout API
 * 
 * Translated from: casts/fuse_client/14_Timeout API.ls
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { createManager, removeManager, getManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructTimeoutManager() {
  return createManager('timeout_manager', getManagerClassList('timeout'));
}

export function deconstructTimeoutManager() {
  return removeManager('timeout_manager');
}

export function getTimeoutManager() {
  if (!managerExists('timeout_manager')) {
    return constructTimeoutManager();
  }
  return getManager('timeout_manager');
}

export function createTimeout(tID, tTime, tHandler, tClientID, tArguments, tIterations) {
  return getTimeoutManager().create(tID, tTime, tHandler, tClientID, tArguments, tIterations);
}

export function removeTimeout(tID) {
  return getTimeoutManager().remove(tID);
}

export function getTimeout(tID) {
  return getTimeoutManager().get(tID);
}

export function timeoutExists(tID) {
  return getTimeoutManager().exists(tID);
}

export function printTimeouts() {
  return getTimeoutManager().print();
}
