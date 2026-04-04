/**
 * Internal_3_Loop
 * 
 * Translated from: casts/habbo/Internal_3_Loop.ls
 * 
 * Equivalent of Lingo's exitFrame handler on the Loop sprite.
 * Simple frame loop - just stays on the current frame.
 * 
 * Original Lingo:
 *   on exitFrame me
 *     go(the frame)
 *   end
 * 
 * This is the simplest possible exitFrame handler. In Director,
 * "go(the frame)" tells the playhead to stay on the current frame,
 * creating a loop. The exitFrame handler is called every frame,
 * so this creates an infinite loop until something changes the frame.
 * 
 * In JS, this is equivalent to just letting the requestAnimationFrame
 * loop continue running. The frame loop is managed by FrameLoop.
 */

import { frameLoop } from '../../core/frame-loop.js';

/**
 * exitFrame handler - called every frame
 * 
 * In Lingo: go(the frame) keeps the playhead on the current frame.
 * In JS: the frame loop continues naturally via requestAnimationFrame.
 * 
 * This handler exists as a 1:1 translation placeholder. In the JS
 * version, the frame loop is always running once started, so there's
 * nothing to do here.
 */
export function exitFrameLoop() {
  // In Lingo: go(the frame)
  // In JS: the frame loop continues via requestAnimationFrame
  // No action needed - the loop is already running
}
