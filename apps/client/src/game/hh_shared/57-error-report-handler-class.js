export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handle_error_report(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tErrorList = propList();
    tErrorList[Symbol.for("errorId")] = tConn.GetIntFrom();
    tErrorList[Symbol.for("errorMsgId")] = tConn.GetIntFrom();
    tErrorList[Symbol.for("time")] = tConn.GetStrFrom();
    if (variableExists("reload.client.on.server.errors")) {
      const tSpecialErrorArray = getVariableValue("reload.client.on.server.errors");
      if (listp(tSpecialErrorArray)) {
        if (tSpecialErrorArray.getPos(tErrorList[Symbol.for("errorId")]) != 0) {
          gotoNetPage(getVariable("client.reload.url"));
          return 1;
        }
      }
    }
    tErrorList[Symbol.for("errorId")] = `SERVER-${tErrorList[Symbol.for("errorId")]}`;
    this.getComponent().storeErrorReport(tErrorList);
    this.getInterface().showErrors();
  }

  regMsgList(tBool) {
    const tMsgs = propList();
    tMsgs.setaProp(299, Symbol.for("handle_error_report"));
    const tCmds = propList();
    if (tBool) {
      registerListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
