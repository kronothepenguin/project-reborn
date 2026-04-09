// CastLoad API
// Translated from: 10_CastLoad  API.ls

export default function () {
  return {
    constructCastLoader() {
      return _director.createManager(
        Symbol.for("castload_manager"),
        _director.getClassVariable("castlib.manager.class"),
      );
    },

    deconstructCastLoader() {
      return _director.removeManager(Symbol.for("castload_manager"));
    },

    getCastLoadManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("castload_manager"))) {
        return this.constructCastLoader();
      }
      return tMgr.getManager(Symbol.for("castload_manager"));
    },

    startCastLoad(tCastlibs, tPermanentOrNot, tAddFlag, tDoIndexing, tDoTracking) {
      return this.getCastLoadManager().startCastLoad(tCastlibs, tPermanentOrNot, tAddFlag, tDoIndexing, tDoTracking);
    },

    registerCastloadCallback(tID, tMethod, tClientObj, tArgument) {
      return this.getCastLoadManager().registerCallback(tID, tMethod, tClientObj, tArgument);
    },

    resetCastLibs(tClean, tForced) {
      return this.getCastLoadManager().resetCastLibs(tClean, tForced);
    },

    getCastLoadPercent(tID) {
      return this.getCastLoadManager().getLoadPercent(tID);
    },

    FindCastNumber(tCastName) {
      return this.getCastLoadManager().FindCastNumber(tCastName);
    },

    castExists(tCastName) {
      return this.getCastLoadManager().exists(tCastName);
    },

    printCasts() {
      return this.getCastLoadManager().print();
    },
  };
}
