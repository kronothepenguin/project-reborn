// Write API
// Translated from: 21_Write API.ls

export default function () {
  return {
    constructWriterManager() {
      return _director.createManager(
        Symbol.for("writer_manager"),
        _director.getClassVariable("writer.manager.class"),
      );
    },

    deconstructWriterManager() {
      return _director.removeManager(Symbol.for("writer_manager"));
    },

    getWriterManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("writer_manager"))) {
        return this.constructWriterManager();
      }
      return tMgr.getManager(Symbol.for("writer_manager"));
    },

    createWriter(tID, tMetrics) {
      return this.getWriterManager().create(tID, tMetrics);
    },

    removeWriter(tID) {
      return this.getWriterManager().Remove(tID);
    },

    getWriter(tID, tDefault) {
      return this.getWriterManager().GET(tID, tDefault);
    },

    writerExists(tID) {
      return this.getWriterManager().exists(tID);
    },

    printWriters() {
      return this.getWriterManager().print();
    },
  };
}
