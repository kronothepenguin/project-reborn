/**
 * Multiuser API
 * 
 * Translated from: casts/fuse_client/24_Multiuser API.ls
 * 
 * Global functions for multi-user connections (extends Connection API).
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { createManager, removeManager, getManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructMultiuserManager() {
  return createManager('multiuser_manager', getManagerClassList('multiuser'));
}

export function deconstructMultiuserManager() {
  return removeManager('multiuser_manager');
}

export function getMultiuserManager() {
  if (!managerExists('multiuser_manager')) {
    return constructMultiuserManager();
  }
  return getManager('multiuser_manager');
}

export function createMultiuser(tID, tHost, tPort) {
  return getMultiuserManager().create(tID, tHost, tPort);
}

export function removeMultiuser(tID) {
  return getMultiuserManager().remove(tID);
}

export function getMultiuser(tID) {
  return getMultiuserManager().get(tID);
}

export function multiuserExists(tID) {
  return getMultiuserManager().exists(tID);
}

export function printMultiusers() {
  return getMultiuserManager().print();
}
