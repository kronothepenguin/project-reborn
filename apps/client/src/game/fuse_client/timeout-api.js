// Timeout API
// Translated from: 14_Timeout API.ls

export default function () {
  return {
    constructTimeoutManager() {
      return _director.createManager(
        Symbol.for("timeout_manager"),
        _director.getClassVariable("timeout.manager.class"),
      );
    },

    deconstructTimeoutManager() {
      return _director.removeManager(Symbol.for("timeout_manager"));
    },

    getTimeoutManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("timeout_manager"))) {
        return this.constructTimeoutManager();
      }
      return tMgr.getManager(Symbol.for("timeout_manager"));
    },

    createTimeout(tID, tTime, tHandler, tClientID, tArguments, tIterations) {
      return this.getTimeoutManager().create(tID, tTime, tHandler, tClientID, tArguments, tIterations);
    },

    removeTimeout(tID) {
      return this.getTimeoutManager().Remove(tID);
    },

    getTimeout(tID) {
      return this.getTimeoutManager().GET(tID);
    },

    timeoutExists(tID) {
      return this.getTimeoutManager().exists(tID);
    },

    printTimeouts() {
      return this.getTimeoutManager().print();
    },
  };
}
