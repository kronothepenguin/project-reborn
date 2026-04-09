// Binary API
// Translated from: 22_Binary API.ls

export default function () {
  return {
    constructBinaryManager() {
      return _director.createManager(
        Symbol.for("binary_data_manager"),
        _director.getClassVariable("binary.manager.class"),
      );
    },

    deconstructBinaryManager() {
      return _director.removeManager(Symbol.for("binary_data_manager"));
    },

    getBinaryManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("binary_data_manager"))) {
        return this.constructBinaryManager();
      }
      return tMgr.getManager(Symbol.for("binary_data_manager"));
    },

    retrieveBinaryData(tID, tAuth, tCallBackObject) {
      return this.getBinaryManager().retrieveData(tID, tAuth, tCallBackObject);
    },

    storeBinaryData(tdata, tCallBackObject) {
      return this.getBinaryManager().storeData(tdata, tCallBackObject);
    },

    addMessageToBinaryQueue(tMsg) {
      return this.getBinaryManager().addMessageToQueue(tMsg);
    },
  };
}
