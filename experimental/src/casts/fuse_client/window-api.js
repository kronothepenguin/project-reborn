/**
 * Window API
 * 
 * Translated from: casts/fuse_client/18_Window API.ls
 * 
 * Global functions for window management.
 * Windows are UI containers with elements (buttons, text fields, images).
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { createManager, removeManager, getManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

/**
 * Construct the window manager
 */
export function constructWindowManager() {
  return createManager('window_manager', getManagerClassList('window'));
}

/**
 * Deconstruct the window manager
 */
export function deconstructWindowManager() {
  return removeManager('window_manager');
}

/**
 * Get the window manager (lazy-init)
 */
export function getWindowManager() {
  const tMgr = getManager('window_manager');
  if (voidp(tMgr)) {
    return constructWindowManager();
  }
  return tMgr;
}

/**
 * Create a window
 * 
 * @param {string} tID - Window ID
 * @param {string} tLayout - Layout file name (e.g., "modal.window.txt")
 * @param {number} [tLocX] - X position
 * @param {number} [tLocY] - Y position
 * @param {string} [tSpecial] - Special flags
 */
export function createWindow(tID, tLayout, tLocX, tLocY, tSpecial) {
  return getWindowManager().create(tID, tLayout, tLocX, tLocY, tSpecial);
}

/**
 * Remove a window
 */
export function removeWindow(tID) {
  return getWindowManager().remove(tID);
}

/**
 * Get a window by ID
 */
export function getWindow(tID) {
  return getWindowManager().get(tID);
}

/**
 * Get list of all window IDs
 */
export function getWindowIDList() {
  return getWindowManager().getIDList();
}

/**
 * Check if a window exists
 */
export function windowExists(tID) {
  return getWindowManager().exists(tID);
}

/**
 * Merge a layout into an existing window
 */
export function mergeWindow(tID, tLayout) {
  if (!windowExists(tID)) return 0;
  return getWindow(tID).merge(tLayout);
}

/**
 * Activate a window object
 */
export function activateWindowObj(tID) {
  if (voidp(tID)) return 0;
  return getWindowManager().activate(tID);
}

/**
 * Deactivate a window object
 */
export function deactivateWindowObj(tID) {
  if (voidp(tID)) return 0;
  return getWindowManager().deactivate(tID);
}

/**
 * Register a client for a window
 */
export function registerClient(tID, tClientID) {
  if (!windowExists(tID)) return 0;
  return getWindow(tID).registerClient(tClientID);
}

/**
 * Register an event procedure on a window element
 */
export function registerProcedure(tID, tHandler, tClientID, tEvent) {
  if (!windowExists(tID)) return 0;
  return getWindow(tID).registerProcedure(tHandler, tClientID, tEvent);
}

/**
 * Show all windows
 */
export function showWindows() {
  return getWindowManager().showAll();
}

/**
 * Hide all windows
 */
export function hideWindows() {
  return getWindowManager().hideAll();
}

/**
 * Lock window layering (prevent z-order changes)
 */
export function lockWindowLayering() {
  return getWindowManager().lock();
}

/**
 * Unlock window layering
 */
export function unlockWindowLayering() {
  return getWindowManager().unlock();
}

/**
 * Print windows (debug)
 */
export function printWindows() {
  return getWindowManager().print();
}
