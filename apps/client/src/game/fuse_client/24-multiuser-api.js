export function constructMultiuserManager() {
  return createManager(Symbol.for("multiuser_manager"), getClassVariable("multiuser.manager.class"));
}

export function deconstructMultiuserManager() {
  return removeManager(Symbol.for("multiuser_manager"));
}

export function getMultiuserManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("multiuser_manager"))) {
    return constructMultiuserManager();
  }
  return tMgr.getManager(Symbol.for("multiuser_manager"));
}

export function createMultiuser(tID, tHost, tPort) {
  return getMultiuserManager().create(tID, tHost, tPort);
}

export function removeMultiuser(tID) {
  return getMultiuserManager().Remove(tID);
}

export function getMultiuser(tID) {
  return getMultiuserManager().GET(tID);
}

export function multiuserExists(tID) {
  return getMultiuserManager().exists(tID);
}

export function printMultiusers() {
  return getMultiuserManager().print();
}
