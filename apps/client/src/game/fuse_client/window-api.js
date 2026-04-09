// Window API
// Translated from: 18_Window API.ls

export default function () {
  return {
    constructWindowManager() {
      return _director.createManager(
        Symbol.for("window_manager"),
        _director.getClassVariable("window.manager.class"),
      );
    },

    deconstructWindowManager() {
      return _director.removeManager(Symbol.for("window_manager"));
    },

    getWindowManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("window_manager"))) {
        return this.constructWindowManager();
      }
      return tMgr.getManager(Symbol.for("window_manager"));
    },

    createWindow(tID, tLayout, tLocX, tLocY, tSpecial) {
      return this.getWindowManager().create(tID, tLayout, tLocX, tLocY, tSpecial);
    },

    removeWindow(tID) {
      return this.getWindowManager().Remove(tID);
    },

    getWindow(tID) {
      return this.getWindowManager().GET(tID);
    },

    getWindowIDList() {
      return this.getWindowManager().getIDList();
    },

    windowExists(tID) {
      return this.getWindowManager().exists(tID);
    },

    mergeWindow(tID, tLayout) {
      if (this.windowExists(tID)) {
        return this.getWindow(tID).merge(tLayout);
      } else {
        return 0;
      }
    },

    activateWindowObj(tID) {
      if (voidp(tID)) {
        return 0;
      }
      return this.getWindowManager().Activate(tID);
    },

    deactivateWindowObj(tID) {
      if (voidp(tID)) {
        return 0;
      }
      return this.getWindowManager().deactivate(tID);
    },

    registerClient(tID, tClientID) {
      if (this.windowExists(tID)) {
        return this.getWindow(tID).registerClient(tClientID);
      } else {
        return 0;
      }
    },

    registerProcedure(tID, tHandler, tClientID, tEvent) {
      if (this.windowExists(tID)) {
        return this.getWindow(tID).registerProcedure(tHandler, tClientID, tEvent);
      } else {
        return 0;
      }
    },

    showWindows() {
      return this.getWindowManager().showAll();
    },

    hideWindows() {
      return this.getWindowManager().hideAll();
    },

    lockWindowLayering() {
      return this.getWindowManager().lock();
    },

    unlockWindowLayering() {
      return this.getWindowManager().unlock();
    },

    printWindows() {
      return this.getWindowManager().print();
    },
  };
}
