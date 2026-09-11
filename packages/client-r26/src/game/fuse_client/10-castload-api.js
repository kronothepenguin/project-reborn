export function constructCastLoader() {
  return createManager(Symbol.for("castload_manager"), getClassVariable("castlib.manager.class"));
}

export function deconstructCastLoader() {
  return removeManager(Symbol.for("castload_manager"));
}

export function getCastLoadManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("castload_manager"))) {
    return constructCastLoader();
  }
  return tMgr.getManager(Symbol.for("castload_manager"));
}

export function startCastLoad(tCastlibs, tPermanentOrNot, tAddFlag, tDoIndexing, tDoTracking) {
  return getCastLoadManager().startCastLoad(tCastlibs, tPermanentOrNot, tAddFlag, tDoIndexing, tDoTracking);
}

export function registerCastloadCallback(tID, tMethod, tClientObj, tArgument) {
  return getCastLoadManager().registerCallback(tID, tMethod, tClientObj, tArgument);
}

export function resetCastLibs(tClean, tForced) {
  return getCastLoadManager().resetCastLibs(tClean, tForced);
}

export function getCastLoadPercent(tID) {
  return getCastLoadManager().getLoadPercent(tID);
}

export function FindCastNumber(tCastName) {
  return getCastLoadManager().FindCastNumber(tCastName);
}

export function castExists(tCastName) {
  return getCastLoadManager().exists(tCastName);
}

export function printCasts() {
  return getCastLoadManager().print();
}
