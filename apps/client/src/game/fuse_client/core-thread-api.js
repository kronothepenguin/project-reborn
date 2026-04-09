// Core Thread API
// Translated from: 8_Core Thread API.ls

export default function () {
  return {
    constructThreadManager() {
      return _director.createManager(
        Symbol.for("thread_manager"),
        _director.getClassVariable("thread.manager.class"),
      );
    },

    deconstructThreadManager() {
      return _director.removeManager(Symbol.for("thread_manager"));
    },

    getThreadManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("thread_manager"))) {
        return this.constructThreadManager();
      }
      return tMgr.getManager(Symbol.for("thread_manager"));
    },

    createThread(tID, tInitField) {
      return this.getThreadManager().create(tID, tInitField);
    },

    removeThread(tID) {
      return this.getThreadManager().Remove(tID);
    },

    getThread(tID) {
      return this.getThreadManager().GET(tID);
    },

    threadExists(tID) {
      return this.getThreadManager().exists(tID);
    },

    initThread(tCastNumOrMemName) {
      return this.getThreadManager().initThread(tCastNumOrMemName);
    },

    initExistingThreads() {
      return this.getThreadManager().initAll();
    },

    closeThread(tCastNumOrID) {
      return this.getThreadManager().closeThread(tCastNumOrID);
    },

    closeExistingThreads() {
      return this.getThreadManager().closeAll();
    },

    printThreads() {
      return this.getThreadManager().print();
    },
  };
}
