export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handle_furni_revisions(tMsg) {
    const tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    const tTypeList = list(1, 0);
    for (let ttype = 1; ttype <= tTypeList.count; ttype++) {
      const tCount = tConn.GetIntFrom();
      for (let tIndex = 1; tIndex <= tCount; tIndex++) {
        const tClass = tConn.GetStrFrom();
        const tRevision = tConn.GetIntFrom();
        this.getComponent().setFurniRevision(tClass, tRevision, tTypeList[ttype]);
      }
    }
    this.getComponent().setFurniRevision(VOID, VOID, VOID);
    return 1;
  }

  handle_alias_list(tMsg) {
    const tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    const tCount = tConn.GetIntFrom();
    for (let tIndex = 1; tIndex <= tCount; tIndex++) {
      const tOriginalClass = tConn.GetStrFrom();
      const tAliasClass = tConn.GetStrFrom();
      this.getComponent().setAssetAlias(tOriginalClass, tAliasClass);
    }
    this.getComponent().setAssetAlias(VOID, VOID);
    this.getComponent().tryNextDownload();
  }

  regMsgList(tBool) {
    const tMsgs = propList();
    tMsgs.setaProp(295, Symbol.for("handle_furni_revisions"));
    tMsgs.setaProp(297, Symbol.for("handle_alias_list"));
    const tCmds = propList();
    tCmds.setaProp("GET_FURNI_REVISIONS", 213);
    tCmds.setaProp("GET_ALIAS_LIST", 215);
    if (tBool) {
      registerListener(getVariable("connection.room.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.room.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.room.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.room.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
