// Resource API
// Translated from: 9_Resource API.ls

export default function () {
  return {
    constructResourceManager() {
      return _director.createManager(
        Symbol.for("resource_manager"),
        _director.getClassVariable("resource.manager.class"),
      );
    },

    deconstructResourceManager() {
      return _director.removeManager(Symbol.for("resource_manager"));
    },

    getResourceManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("resource_manager"))) {
        return this.constructResourceManager();
      }
      return tMgr.getManager(Symbol.for("resource_manager"));
    },

    createMember(tMemName, ttype, tForcedDuplicate) {
      return this.getResourceManager().createMember(tMemName, ttype, tForcedDuplicate);
    },

    removeMember(tMemName) {
      return this.getResourceManager().removeMember(tMemName);
    },

    getMember(tMemName) {
      return this.getResourceManager().getMember(tMemName);
    },

    updateMember(tMemName) {
      return this.getResourceManager().updateMember(tMemName);
    },

    registerMember(tMemName, tOptionalMemNum) {
      return this.getResourceManager().registerMember(tMemName, tOptionalMemNum);
    },

    unregisterMember(tMemName) {
      return this.getResourceManager().unregisterMember(tMemName);
    },

    replaceMember(tExistingMemName, tReplacingMemName) {
      return this.getResourceManager().replaceMember(tExistingMemName, tReplacingMemName);
    },

    memberExists(tMemName) {
      return this.getResourceManager().exists(tMemName);
    },

    getmemnum(tMemName) {
      return this.getResourceManager().getmemnum(tMemName);
    },

    printMembers() {
      return this.getResourceManager().print();
    },
  };
}
