/**
 * Resource API
 * 
 * Translated from: casts/fuse_client/9_Resource API.ls
 * 
 * Global functions for member/resource management.
 * Members are named assets (bitmaps, scripts, fields) registered by name.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { createManager, removeManager, managerExists, getManager } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

/**
 * Construct the resource manager
 */
export function constructResourceManager() {
  return createManager('resource_manager', getManagerClassList('resource'));
}

/**
 * Deconstruct the resource manager
 */
export function deconstructResourceManager() {
  return removeManager('resource_manager');
}

/**
 * Get the resource manager (lazy-init)
 */
export function getResourceManager() {
  const tMgr = getManager('resource_manager');
  if (voidp(tMgr)) {
    return constructResourceManager();
  }
  return tMgr;
}

/**
 * Create a member (resource) by name and type
 */
export function createMember(tMemName, ttype, tForcedDuplicate) {
  return getResourceManager().createMember(tMemName, ttype, tForcedDuplicate);
}

/**
 * Remove a member by name
 */
export function removeMember(tMemName) {
  return getResourceManager().removeMember(tMemName);
}

/**
 * Get a member by name
 */
export function getMember(tMemName) {
  return getResourceManager().getMember(tMemName);
}

/**
 * Update/re-register a member
 */
export function updateMember(tMemName) {
  return getResourceManager().updateMember(tMemName);
}

/**
 * Register a member by name
 */
export function registerMember(tMemName, tOptionalMemNum) {
  return getResourceManager().registerMember(tMemName, tOptionalMemNum);
}

/**
 * Unregister a member
 */
export function unregisterMember(tMemName) {
  return getResourceManager().unregisterMember(tMemName);
}

/**
 * Replace an existing member with another
 */
export function replaceMember(tExistingMemName, tReplacingMemName) {
  return getResourceManager().replaceMember(tExistingMemName, tReplacingMemName);
}

/**
 * Check if a member exists by name
 */
export function memberExists(tMemName) {
  return getResourceManager().exists(tMemName);
}

/**
 * Get member number by name
 */
export function getmemnum(tMemName) {
  return getResourceManager().getmemnum(tMemName);
}

/**
 * Print members (debug)
 */
export function printMembers() {
  return getResourceManager().print();
}
