// Director runtime - low-level host-API wrappers
// Canvas, event loop, cast loader, script lifecycle.
// Custom elements moved to director-browser (../browser/).

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
