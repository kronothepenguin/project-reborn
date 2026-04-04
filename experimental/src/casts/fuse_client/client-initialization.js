/**
 * Client Initialization Script
 * 
 * Translated from: casts/fuse_client/4_Client Initialization Script.ls
 * 
 * Bootstrap functions that initialize the core system.
 * Called from habbo/init.js after preload completes.
 */

import { VOID, voidp, contains, lingoGlobals } from '../../core/lingo-runtime.js';
import {
  constructObjectManager,
  deconstructObjectManager,
  getObjectManager,
  createManager,
  getManager,
  managerExists,
} from './object-api.js';
import { setStopClient } from '../../casts/habbo/initialization.js';
import { frameLoop } from '../../core/frame-loop.js';
import { getManagerClassList } from '../../system/system-props.js';

// Forward reference to stopClient
let gCore = null;

/**
 * Dump variable field - parse system properties
 * In JS, system props are imported directly from system-props.js
 */
function dumpVariableField(fieldName) {
  console.log(`[initCore] Dump variable field: ${fieldName}`);
  return 1;
}

/**
 * Reset cast libraries
 * In JS, casts are loaded as modules, so this is a no-op for now
 */
function resetCastLibs(clean, forced) {
  console.log(`[initCore] Reset castLibs: clean=${clean}, forced=${forced}`);
  return 1;
}

/**
 * Dump text field - parse system texts/localized strings
 */
function dumpTextField(fieldName) {
  console.log(`[initCore] Dump text field: ${fieldName}`);
  return 1;
}

/**
 * Deconstruct connection manager (forward ref)
 */
function deconstructConnectionManager() {
  // Defined in Connection API when translated
}

/**
 * Deconstruct error manager (forward ref)
 */
function deconstructErrorManager() {
  // Defined in Error API when translated
}

/**
 * Initialize the core FuseClient system
 */
export function initCore() {
  // Step 1: Construct the object manager
  if (!constructObjectManager()) {
    console.error('[initCore] Failed to construct object manager');
    return 0;
  }
  gCore = getObjectManager();

  // Step 2: Dump system properties
  if (!dumpVariableField('System Props')) {
    return stopClient();
  }

  // Step 3: Reset cast libraries
  if (!resetCastLibs(0, 0)) {
    return stopClient();
  }

  // Step 4: Pre-index members (resource manager)
  // Create resource manager if system props defines it
  try {
    const resourceClassList = getManagerClassList('resource');
    if (resourceClassList.length > 0) {
      const resourceManager = createManager('resource_manager', resourceClassList);
      if (resourceManager && typeof resourceManager.preIndexMembers === 'function') {
        if (!resourceManager.preIndexMembers()) {
          return stopClient();
        }
      }
    }
  } catch (e) {
    console.warn('[initCore] Resource manager not yet available, skipping preIndexMembers');
  }

  // Step 5: Dump system texts
  if (!dumpTextField('System Texts')) {
    return stopClient();
  }

  // Step 6: Create core thread
  try {
    const threadClassList = getManagerClassList('thread');
    if (!managerExists('thread_manager')) {
      createManager('thread_manager', threadClassList);
    }
    const threadManager = getManager('thread_manager');
    if (threadManager && typeof threadManager.create === 'function') {
      if (!threadManager.create('core', 'core')) {
        return stopClient();
      }
    }
  } catch (e) {
    console.error('[initCore] Failed to create core thread:', e);
    return stopClient();
  }

  console.log('[initCore] Core initialization complete');

  // Start the frame loop at system tempo
  frameLoop.setTempo(24);
  frameLoop.start();

  return 1;
}

/**
 * Stop the client
 */
export function stopClient() {
  const runMode = lingoGlobals.runMode;

  if (contains(runMode, 'Author')) {
    if (voidp(gCore)) {
      return 0;
    }

    deconstructConnectionManager();
    deconstructObjectManager();
    deconstructErrorManager();
  }

  return 0;
}

/**
 * Reset the client (reload/restart)
 */
export function resetClient() {
  if (contains(lingoGlobals.runMode, 'Author')) {
    stopClient();
  } else {
    console.log('[resetClient] Would redirect to client URL');
  }
  return 1;
}

// Register stopClient reference for habbo initialization
setStopClient(stopClient);
