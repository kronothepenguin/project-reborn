/**
 * Thread API
 * 
 * Translated from: casts/fuse_client/8_Core Thread API.ls
 * 
 * Global functions for thread lifecycle management.
 * Threads in Lingo are persistent object containers associated with
 * cast members, used to organize code into logical modules.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { getObjectManager, createManager, getManager, managerExists, removeManager } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

/**
 * Construct the thread manager
 */
export function constructThreadManager() {
  return createManager('thread_manager', getManagerClassList('thread'));
}

/**
 * Deconstruct the thread manager
 */
export function deconstructThreadManager() {
  return removeManager('thread_manager');
}

/**
 * Get the thread manager (lazy-init if needed)
 */
export function getThreadManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists('thread_manager')) {
    return constructThreadManager();
  }
  return tMgr.getManager('thread_manager');
}

/**
 * Create a thread with the given ID and init field
 */
export function createThread(tID, tInitField) {
  return getThreadManager().create(tID, tInitField);
}

/**
 * Remove a thread
 */
export function removeThread(tID) {
  return getThreadManager().remove(tID);
}

/**
 * Get a thread by ID
 */
export function getThread(tID) {
  return getThreadManager().get(tID);
}

/**
 * Check if a thread exists
 */
export function threadExists(tID) {
  return getThreadManager().exists(tID);
}

/**
 * Initialize a thread from a cast member
 */
export function initThread(tCastNumOrMemName) {
  return getThreadManager().initThread(tCastNumOrMemName);
}

/**
 * Initialize all existing threads
 */
export function initExistingThreads() {
  return getThreadManager().initAll();
}

/**
 * Close a thread
 */
export function closeThread(tCastNumOrID) {
  return getThreadManager().closeThread(tCastNumOrID);
}

/**
 * Close all existing threads
 */
export function closeExistingThreads() {
  return getThreadManager().closeAll();
}

/**
 * Print thread info (debug)
 */
export function printThreads() {
  return getThreadManager().print();
}
