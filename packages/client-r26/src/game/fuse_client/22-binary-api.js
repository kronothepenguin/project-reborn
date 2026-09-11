export function constructBinaryManager() {
  return createManager(Symbol.for("binary_data_manager"), getClassVariable("binary.manager.class"));
}

export function deconstructBinaryManager() {
  return removeManager(Symbol.for("binary_data_manager"));
}

export function getBinaryManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("binary_data_manager"))) {
    return constructBinaryManager();
  }
  return tMgr.getManager(Symbol.for("binary_data_manager"));
}

export function retrieveBinaryData(tID, tAuth, tCallBackObject) {
  return getBinaryManager().retrieveData(tID, tAuth, tCallBackObject);
}

export function storeBinaryData(tdata, tCallBackObject) {
  return getBinaryManager().storeData(tdata, tCallBackObject);
}

export function addMessageToBinaryQueue(tMsg) {
  return getBinaryManager().addMessageToQueue(tMsg);
}
