// Connection API
// Translated from: 12_Connection API.ls

export default function () {
  return {
    constructConnectionManager() {
      return _director.createManager(
        Symbol.for("connection_manager"),
        _director.getClassVariable("connection.manager.class"),
      );
    },

    deconstructConnectionManager() {
      return _director.removeManager(Symbol.for("connection_manager"));
    },

    getConnectionManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("connection_manager"))) {
        return this.constructConnectionManager();
      }
      return tMgr.getManager(Symbol.for("connection_manager"));
    },

    createConnection(tID, tHost, tPort) {
      return this.getConnectionManager().create(tID, tHost, tPort);
    },

    removeConnection(tID) {
      return this.getConnectionManager().Remove(tID);
    },

    getConnection(tID) {
      return this.getConnectionManager().GET(tID);
    },

    connectionExists(tID) {
      return this.getConnectionManager().exists(tID);
    },

    printConnections() {
      return this.getConnectionManager().print();
    },

    registerListener(tID, tObjID, tMsgList) {
      return this.getConnectionManager().registerListener(tID, tObjID, tMsgList);
    },

    unregisterListener(tID, tObjID, tMsgList) {
      return this.getConnectionManager().unregisterListener(tID, tObjID, tMsgList);
    },

    registerCommands(tID, tObjID, tCmdList) {
      return this.getConnectionManager().registerCommands(tID, tObjID, tCmdList);
    },

    unregisterCommands(tID, tObjID, tCmdList) {
      return this.getConnectionManager().unregisterCommands(tID, tObjID, tCmdList);
    },
  };
}
