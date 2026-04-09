// Multiuser API
// Translated from: 24_Multiuser API.ls

export default function () {
  return {
    constructMultiuserManager() {
      return _director.createManager(
        Symbol.for("multiuser_manager"),
        _director.getClassVariable("multiuser.manager.class"),
      );
    },

    deconstructMultiuserManager() {
      return _director.removeManager(Symbol.for("multiuser_manager"));
    },

    getMultiuserManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("multiuser_manager"))) {
        return this.constructMultiuserManager();
      }
      return tMgr.getManager(Symbol.for("multiuser_manager"));
    },

    createMultiuser(tID, tHost, tPort) {
      return this.getMultiuserManager().create(tID, tHost, tPort);
    },

    removeMultiuser(tID) {
      return this.getMultiuserManager().Remove(tID);
    },

    getMultiuser(tID) {
      return this.getMultiuserManager().GET(tID);
    },

    multiuserExists(tID) {
      return this.getMultiuserManager().exists(tID);
    },

    printMultiusers() {
      return this.getMultiuserManager().print();
    },
  };
}
