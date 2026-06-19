// Director runtime - browser plugin replacement
// Custom elements, canvas, event loop, cast loader, script lifecycle

export {
  registerCustomElements,
  _createMovie,
} from "./custom-elements.js";

export {
  startEventLoop,
  stopEventLoop,
  setTempo,
  isEventLoopRunning,
} from "./event-loop.js";

export { loadCast } from "./cast-loader.js";

export {
  dispatchPrepareMovie,
  dispatchStartMovie,
  dispatchStopMovie,
  dispatchPrepareFrame,
  dispatchEnterFrame,
  dispatchExitFrame,
  dispatchAll,
  LIFECYCLE_EVENTS,
} from "./script-lifecycle.js";

export {
  setCanvas,
  getCanvas,
  getContext,
  updateStage,
  resizeCanvas,
  setBackgroundColor,
  getStageSize,
  resetCanvas,
} from "./canvas.js";
