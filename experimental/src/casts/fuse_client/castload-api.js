/**
 * CastLoad API
 * 
 * Translated from: casts/fuse_client/10_CastLoad API.ls
 * 
 * Global functions for dynamic cast library loading (.cct/.cst files).
 * In the JS version, casts are loaded as ES module bundles.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { createManager, removeManager, getManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

/**
 * Construct the cast load manager
 */
export function constructCastLoader() {
  return createManager('castload_manager', getManagerClassList('castlib'));
}

/**
 * Deconstruct the cast load manager
 */
export function deconstructCastLoader() {
  return removeManager('castload_manager');
}

/**
 * Get the cast load manager (lazy-init)
 */
export function getCastLoadManager() {
  if (!managerExists('castload_manager')) {
    return constructCastLoader();
  }
  return getManager('castload_manager');
}

/**
 * Start loading one or more casts
 * 
 * @param {string|string[]} tCasts - Cast name(s) to load
 * @param {number} [tPermanentFlag] - 0=temporary, 1=permanent
 * @param {number} [tAdd] - 0=replace, 1=add to existing
 * @param {number} [tDoIndexing] - 1=do indexing after load
 * @param {number} [tDoTracking] - 0=don't track
 */
export function startCastLoad(tCasts, tPermanentFlag, tAdd, tDoIndexing, tDoTracking) {
  return getCastLoadManager().startCastLoad(tCasts, tPermanentFlag, tAdd, tDoIndexing, tDoTracking);
}

/**
 * Register a callback for cast load completion
 */
export function registerCastloadCallback(tID, tMethod, tClientObj, tArgument) {
  return getCastLoadManager().registerCallback(tID, tMethod, tClientObj, tArgument);
}

/**
 * Reset cast libraries
 */
export function resetCastLibs(tClean, tForced) {
  return getCastLoadManager().resetCastLibs(tClean, tForced);
}

/**
 * Get load percentage for a task
 */
export function getCastLoadPercent(tID) {
  return getCastLoadManager().getLoadPercent(tID);
}

/**
 * Find cast number by name
 */
export function FindCastNumber(tCastName) {
  return getCastLoadManager().FindCastNumber(tCastName);
}

/**
 * Check if a cast exists by name
 */
export function castExists(tCastName) {
  return getCastLoadManager().exists(tCastName);
}

/**
 * Print loaded casts (debug)
 */
export function printCasts() {
  return getCastLoadManager().print();
}
