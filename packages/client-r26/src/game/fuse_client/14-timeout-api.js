export function constructTimeoutManager() {
  return createManager(Symbol.for("timeout_manager"), getClassVariable("timeout.manager.class"));
}

export function deconstructTimeoutManager() {
  return removeManager(Symbol.for("timeout_manager"));
}

export function getTimeoutManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("timeout_manager"))) {
    return constructTimeoutManager();
  }
  return tMgr.getManager(Symbol.for("timeout_manager"));
}

export function createTimeout(tID, tTime, tHandler, tClientID, tArguments, tIterations) {
  return getTimeoutManager().create(tID, tTime, tHandler, tClientID, tArguments, tIterations);
}

export function removeTimeout(tID) {
  return getTimeoutManager().Remove(tID);
}

export function getTimeout(tID) {
  return getTimeoutManager().GET(tID);
}

export function timeoutExists(tID) {
  return getTimeoutManager().exists(tID);
}

export function printTimeouts() {
  return getTimeoutManager().print();
}
