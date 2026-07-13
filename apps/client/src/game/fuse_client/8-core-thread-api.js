export function constructThreadManager() {
  return createManager(Symbol.for("thread_manager"), getClassVariable("thread.manager.class"));
}

export function deconstructThreadManager() {
  return removeManager(Symbol.for("thread_manager"));
}

export function getThreadManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("thread_manager"))) {
    return constructThreadManager();
  }
  return tMgr.getManager(Symbol.for("thread_manager"));
}

export function createThread(tID, tInitField) {
  return getThreadManager().create(tID, tInitField);
}

export function removeThread(tID) {
  return getThreadManager().Remove(tID);
}

export function getThread(tID) {
  return getThreadManager().GET(tID);
}

export function threadExists(tID) {
  return getThreadManager().exists(tID);
}

export function initThread(tCastNumOrMemName) {
  return getThreadManager().initThread(tCastNumOrMemName);
}

export function initExistingThreads() {
  return getThreadManager().initAll();
}

export function closeThread(tCastNumOrID) {
  return getThreadManager().closeThread(tCastNumOrID);
}

export function closeExistingThreads() {
  return getThreadManager().closeAll();
}

export function printThreads() {
  return getThreadManager().print();
}
