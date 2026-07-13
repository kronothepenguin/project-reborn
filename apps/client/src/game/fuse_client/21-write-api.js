export function constructWriterManager() {
  return createManager(Symbol.for("writer_manager"), getClassVariable("writer.manager.class"));
}

export function deconstructWriterManager() {
  return removeManager(Symbol.for("writer_manager"));
}

export function getWriterManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("writer_manager"))) {
    return constructWriterManager();
  }
  return tMgr.getManager(Symbol.for("writer_manager"));
}

export function createWriter(tID, tMetrics) {
  return getWriterManager().create(tID, tMetrics);
}

export function removeWriter(tID) {
  return getWriterManager().Remove(tID);
}

export function getWriter(tID, tDefault) {
  return getWriterManager().GET(tID, tDefault);
}

export function writerExists(tID) {
  return getWriterManager().exists(tID);
}

export function printWriters() {
  return getWriterManager().print();
}
