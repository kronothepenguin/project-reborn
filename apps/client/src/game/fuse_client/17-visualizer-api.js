export function constructVisualizerManager() {
  return createManager(Symbol.for("visualizer_manager"), getClassVariable("visualizer.manager.class"));
}

export function deconstructVisualizerManager() {
  return removeManager(Symbol.for("visualizer_manager"));
}

export function getVisualizerManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("visualizer_manager"))) {
    return constructVisualizerManager();
  }
  return tMgr.getManager(Symbol.for("visualizer_manager"));
}

export function createVisualizer(tID, tLayout, tLocX, tLocY) {
  return getVisualizerManager().create(tID, tLayout, tLocX, tLocY);
}

export function removeVisualizer(tID) {
  return getVisualizerManager().Remove(tID);
}

export function getVisualizer(tID) {
  return getVisualizerManager().GET(tID);
}

export function visualizerExists(tID) {
  return getVisualizerManager().exists(tID);
}

export function printVisualizers() {
  return getVisualizerManager().print();
}
