/**
 * Internal_2_Init
 * 
 * Translated from: casts/habbo/Internal_2_Init.ls
 * 
 * Equivalent of Lingo's exitFrame handler on the Init sprite.
 * Waits for preload to complete, then calls initCore().
 * 
 * Original Lingo:
 *   on exitFrame me
 *     if netDone() then
 *       initCore()
 *     else
 *       go(the frame)
 *     end if
 *   end
 */

import { initCore } from '../../casts/fuse_client/client-initialization.js';
import { frameLoop } from '../../core/frame-loop.js';
import { networkManager } from '../../system/network.js';

// Track whether initCore has been called
let initCalled = false;

/**
 * Simulate netDone() - returns true when preload/download is complete
 * 
 * In the original Lingo, this checks if preloadNetThing() has finished
 * loading castLib(2) (fuse_client.cst). In JS, modules are loaded
 * synchronously via import, so we simulate async readiness.
 */
function netDone() {
  return networkManager.netDone();
}

/**
 * exitFrame handler - called every frame while on this frame
 * 
 * In Lingo, this handler is called each frame cycle. The handler
 * checks if the preload is done and transitions to initCore().
 * 
 * In JS, we replicate this by calling the check once during startup
 * (since modules are pre-loaded), but keeping the structure 1:1.
 */
export function exitFrameInit() {
  if (netDone()) {
    if (!initCalled) {
      initCalled = true;
      initCore();
    }
  } else {
    // go(the frame) - loop on current frame
    // In JS, the frame loop naturally continues
    frameLoop.start();
  }
}
