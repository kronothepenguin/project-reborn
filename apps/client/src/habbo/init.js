// habbo/Internal_2_Init.ls → init.js
// exitFrame handler - waits for netDone then initializes core

import { netDone, registerMovieHandler } from '../core/lingo-runtime.js'

function exitFrame() {
  if (netDone()) {
    // initCore() - called after fuse_client is loaded
    // Handled by the boot sequence in main.js
  } else {
    // go(the frame) - stay on current frame (loop)
    // In JS this is handled by the frame loop
  }
}

// Register as Director exitFrame handler
registerMovieHandler('exitFrame', exitFrame, 'habbo')
