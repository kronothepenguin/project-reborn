// Visualizer API
// Translated from: 17_Visualizer API.ls

export default function () {
  return {
    constructVisualizerManager() {
      return _director.createManager(
        Symbol.for("visualizer_manager"),
        _director.getClassVariable("visualizer.manager.class"),
      );
    },

    deconstructVisualizerManager() {
      return _director.removeManager(Symbol.for("visualizer_manager"));
    },

    getVisualizerManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("visualizer_manager"))) {
        return this.constructVisualizerManager();
      }
      return tMgr.getManager(Symbol.for("visualizer_manager"));
    },

    createVisualizer(tID, tLayout, tLocX, tLocY) {
      return this.getVisualizerManager().create(tID, tLayout, tLocX, tLocY);
    },

    removeVisualizer(tID) {
      return this.getVisualizerManager().Remove(tID);
    },

    getVisualizer(tID) {
      return this.getVisualizerManager().GET(tID);
    },

    visualizerExists(tID) {
      return this.getVisualizerManager().exists(tID);
    },

    printVisualizers() {
      return this.getVisualizerManager().print();
    },
  };
}
