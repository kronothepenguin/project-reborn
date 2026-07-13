let gCore;

export function constructObjectManager() {
  if (objectp(gCore)) {
    return gCore;
  }
  const tClass = value(convertToPropList(field("System Props"), RETURN)["object.manager.class"])[1];
  gCore = script(tClass).new();
  gCore.construct();
  return gCore;
}

export function deconstructObjectManager() {
  if (voidp(gCore)) {
    return 0;
  }
  gCore.deconstruct();
  gCore = VOID;
  return 1;
}

export function getObjectManager() {
  if (voidp(gCore)) {
    return constructObjectManager();
  }
  return gCore;
}

export function createObject(tID) {
  const tClassList = list();
  for (let i = 2; i <= the.paramCount; i++) {
    const tParam = param(i);
    if (listp(tParam)) {
      for (const tClass of tParam) {
        tClassList.add(tClass);
      }
      continue;
    }
    tClassList.add(tParam);
  }
  return getObjectManager().create(tID, tClassList);
}

export function removeObject(tID) {
  return getObjectManager().Remove(tID);
}

export function getObject(tID) {
  return getObjectManager().GET(tID);
}

export function objectExists(tID) {
  return getObjectManager().exists(tID);
}

export function printObjects() {
  return getObjectManager().print();
}

export function registerObject(tID, tObject) {
  return getObjectManager().registerObject(tID, tObject);
}

export function unregisterObject(tID) {
  return getObjectManager().unregisterObject(tID);
}

export function createManager(tID) {
  const tClassList = list();
  for (let i = 2; i <= the.paramCount; i++) {
    const tParam = param(i);
    if (listp(tParam)) {
      for (const tClass of tParam) {
        tClassList.add(tClass);
      }
      continue;
    }
    tClassList.add(tParam);
  }
  const tObjMngr = getObjectManager();
  const tObjInst = tObjMngr.create(tID, tClassList);
  tObjMngr.registerManager(tID);
  tObjMngr.setaProp(tID, tObjInst);
  return tObjInst;
}

export function removeManager(tID) {
  return getObjectManager().Remove(tID);
}

export function getManager(tID) {
  return getObjectManager().getManager(tID);
}

export function managerExists(tID) {
  return getObjectManager().managerExists(tID);
}

export function printManagers() {
  return getObjectManager().print();
}

export function registerManager(tID) {
  return getObjectManager().registerManager(tID);
}

export function unregisterManager(tID) {
  return getObjectManager().unregisterManager(tID);
}

export function receivePrepare(tID) {
  return getObjectManager().receivePrepare(tID);
}

export function removePrepare(tID) {
  return getObjectManager().removePrepare(tID);
}

export function receiveUpdate(tID) {
  return getObjectManager().receiveUpdate(tID);
}

export function removeUpdate(tID) {
  return getObjectManager().removeUpdate(tID);
}

export function pauseUpdate() {
  return getObjectManager().pauseUpdate();
}

export function unpauseUpdate() {
  return getObjectManager().resumeUpdate();
}
