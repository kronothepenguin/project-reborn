// habbo/Internal_3_Loop.ls → loop.js
// exitFrame handler - main frame loop

import { registerMovieHandler } from '../core/lingo-runtime.js'

function exitFrame() {
  // go(the frame) - stay on current frame (infinite loop until state changes)
  // In JS this is handled by the frame loop in main.js
}

// Register as Director exitFrame handler
registerMovieHandler('exitFrame', exitFrame, 'habbo')
