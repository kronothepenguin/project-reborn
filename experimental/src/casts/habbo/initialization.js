/**
 * Internal_1_Initialization
 * 
 * Translated from: casts/habbo/Internal_1_Initialization.ls
 * 
 * Equivalent of Lingo's prepareMovie handler.
 * Called once when the movie loads.
 * 
 * Original Lingo:
 *   - Parses URL parameters (sw1..sw9 bundles with ; and = delimiters)
 *   - Posts processlog URL with account_id
 *   - Disables debug playback
 *   - Preloads castLib(2) (fuse_client.cst)
 *   - Moves stage to front, sets exitLock, puppetTempo(15)
 */

import { lingoGlobals, lingoTheSet, lingoThe, contains } from '../../core/lingo-runtime.js';
import { stage } from '../../core/stage.js';
import { frameLoop } from '../../core/frame-loop.js';

// Simulated external parameter storage (set by HTML/URL query params)
const externalParams = new Map();

/**
 * Register an external parameter value (called before init to simulate URL params)
 * In production, these come from the URL query string
 */
export function registerExternalParam(key, value) {
  externalParams.set(key, value);
}

/**
 * Simulate externalParamValue() Lingo builtin
 */
function externalParamValue(key) {
  return externalParams.get(key) || undefined;
}

/**
 * Simulate postNetText() - sends POST request
 */
function postNetText(url, data) {
  // In production, this would be a real POST
  console.log('[Initialization] postNetText:', url, data);
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {
    // Silent fail for processlog (non-critical)
  });
}

/**
 * Simulate stopClient() - defined in Client Initialization
 */
let stopClientRef = null;

/**
 * Set the stopClient reference (circular dependency resolver)
 */
export function setStopClient(fn) {
  stopClientRef = fn;
}

/**
 * prepareMovie - Main initialization handler
 * 
 * Original Lingo:
 *   on prepareMovie
 *     if not (the runMode contains "Author") then
 *       ... parse params ...
 *     end if
 *     the debugPlaybackEnabled = 0
 *     castLib(2).preloadMode = 1
 *     preloadNetThing(castLib(2).fileName)
 *     moveToFront(the stage)
 *     set the exitLock to 1
 *     puppetTempo(15)
 *   end
 */
export function prepareMovie() {
  const runMode = lingoThe('runMode');

  // Skip processlog in Author mode
  if (!contains(runMode, 'Author')) {
    let tProcessLogURL = '';
    let tAccountID = '';
    const tDelim = lingoThe('itemDelimiter');

    // Parse parameter bundles sw1..sw9
    for (let i = 1; i <= 9; i++) {
      const tParamBundle = externalParamValue('sw' + i);
      if (tParamBundle !== undefined) {
        // Parse bundle: items delimited by ";", key=value by "="
        const items = tParamBundle.split(';');
        for (const tParam of items) {
          const eqIdx = tParam.indexOf('=');
          if (eqIdx > 0) {
            const tKey = tParam.substring(0, eqIdx);
            const tValue = tParam.substring(eqIdx + 1);

            if (tKey === 'processlog.url') {
              tProcessLogURL = tValue;
            } else if (tKey === 'account_id') {
              tAccountID = tValue;
            }
          }
        }
      }
    }

    // Post processlog
    if (tProcessLogURL !== '') {
      postNetText(tProcessLogURL, { step: 8, account_id: tAccountID });
    }
  }

  // Disable debug playback
  lingoTheSet('debugPlaybackEnabled', 0);

  // Preload castLib(2) - fuse_client.cst
  // In Lingo: castLib(2).preloadMode = 1; preloadNetThing(castLib(2).fileName)
  // In JS: the fuse_client module is imported directly, no preloading needed
  console.log('[Initialization] Preloading castLib 2 (fuse_client)...');

  // Move stage to front
  stage.moveToFront();

  // Lock exit (prevent user from closing/switching)
  lingoTheSet('exitLock', 1);
  stage.setExitLock(true);

  // Set tempo to 15 FPS
  frameLoop.setTempo(15);

  console.log('[Initialization] prepareMovie complete');
}

/**
 * stopMovie handler
 * 
 * Original Lingo:
 *   on stopMovie
 *     stopClient()
 *     go(1)
 *   end
 */
export function stopMovie() {
  if (stopClientRef) {
    stopClientRef();
  }
  // go(1) equivalent - would reset to frame 1
  // In JS, we just stop the frame loop
  frameLoop.stop();
}
