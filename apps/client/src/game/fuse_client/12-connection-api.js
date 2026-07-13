export function constructConnectionManager() {
  return createManager(Symbol.for("connection_manager"), getClassVariable("connection.manager.class"));
}

export function deconstructConnectionManager() {
  return removeManager(Symbol.for("connection_manager"));
}

export function getConnectionManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("connection_manager"))) {
    return constructConnectionManager();
  }
  return tMgr.getManager(Symbol.for("connection_manager"));
}

export function createConnection(tID, tHost, tPort) {
  return getConnectionManager().create(tID, tHost, tPort);
}

export function removeConnection(tID) {
  return getConnectionManager().Remove(tID);
}

export function getConnection(tID) {
  return getConnectionManager().GET(tID);
}

export function connectionExists(tID) {
  return getConnectionManager().exists(tID);
}

export function printConnections() {
  return getConnectionManager().print();
}

export function registerListener(tID, tObjID, tMsgList) {
  return getConnectionManager().registerListener(tID, tObjID, tMsgList);
}

export function unregisterListener(tID, tObjID, tMsgList) {
  return getConnectionManager().unregisterListener(tID, tObjID, tMsgList);
}

export function registerCommands(tID, tObjID, tCmdList) {
  return getConnectionManager().registerCommands(tID, tObjID, tCmdList);
}

export function unregisterCommands(tID, tObjID, tCmdList) {
  return getConnectionManager().unregisterCommands(tID, tObjID, tCmdList);
}
