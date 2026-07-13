export function constructWindowManager() {
  return createManager(Symbol.for("window_manager"), getClassVariable("window.manager.class"));
}

export function deconstructWindowManager() {
  return removeManager(Symbol.for("window_manager"));
}

export function getWindowManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("window_manager"))) {
    return constructWindowManager();
  }
  return tMgr.getManager(Symbol.for("window_manager"));
}

export function createWindow(tID, tLayout, tLocX, tLocY, tSpecial) {
  return getWindowManager().create(tID, tLayout, tLocX, tLocY, tSpecial);
}

export function removeWindow(tID) {
  return getWindowManager().Remove(tID);
}

export function getWindow(tID) {
  return getWindowManager().GET(tID);
}

export function getWindowIDList() {
  return getWindowManager().getIDList();
}

export function windowExists(tID) {
  return getWindowManager().exists(tID);
}

export function mergeWindow(tID, tLayout) {
  if (windowExists(tID)) {
    return getWindow(tID).merge(tLayout);
  } else {
    return 0;
  }
}

export function activateWindowObj(tID) {
  if (voidp(tID)) {
    return 0;
  }
  return getWindowManager().Activate(tID);
}

export function deactivateWindowObj(tID) {
  if (voidp(tID)) {
    return 0;
  }
  return getWindowManager().deactivate(tID);
}

export function registerClient(tID, tClientID) {
  if (windowExists(tID)) {
    return getWindow(tID).registerClient(tClientID);
  } else {
    return 0;
  }
}

export function registerProcedure(tID, tHandler, tClientID, tEvent) {
  if (windowExists(tID)) {
    return getWindow(tID).registerProcedure(tHandler, tClientID, tEvent);
  } else {
    return 0;
  }
}

export function showWindows() {
  return getWindowManager().showAll();
}

export function hideWindows() {
  return getWindowManager().hideAll();
}

export function lockWindowLayering() {
  return getWindowManager().lock();
}

export function unlockWindowLayering() {
  return getWindowManager().unlock();
}

export function printWindows() {
  return getWindowManager().print();
}
