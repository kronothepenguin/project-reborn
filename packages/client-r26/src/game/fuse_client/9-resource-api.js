export function constructResourceManager() {
  return createManager(Symbol.for("resource_manager"), getClassVariable("resource.manager.class"));
}

export function deconstructResourceManager() {
  return removeManager(Symbol.for("resource_manager"));
}

export function getResourceManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("resource_manager"))) {
    return constructResourceManager();
  }
  return tMgr.getManager(Symbol.for("resource_manager"));
}

export function createMember(tMemName, ttype, tForcedDuplicate) {
  return getResourceManager().createMember(tMemName, ttype, tForcedDuplicate);
}

export function removeMember(tMemName) {
  return getResourceManager().removeMember(tMemName);
}

export function getMember(tMemName) {
  return getResourceManager().getMember(tMemName);
}

export function updateMember(tMemName) {
  return getResourceManager().updateMember(tMemName);
}

export function registerMember(tMemName, tOptionalMemNum) {
  return getResourceManager().registerMember(tMemName, tOptionalMemNum);
}

export function unregisterMember(tMemName) {
  return getResourceManager().unregisterMember(tMemName);
}

export function replaceMember(tExistingMemName, tReplacingMemName) {
  return getResourceManager().replaceMember(tExistingMemName, tReplacingMemName);
}

export function memberExists(tMemName) {
  return getResourceManager().exists(tMemName);
}

export function getmemnum(tMemName) {
  return getResourceManager().getmemnum(tMemName);
}

export function printMembers() {
  return getResourceManager().print();
}
