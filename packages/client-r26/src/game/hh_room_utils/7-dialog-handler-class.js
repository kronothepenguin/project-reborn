export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handle_get_pending_response(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tCount = tConn.GetIntFrom();
    if (tCount == 0) {
      this.getComponent().openCfhWindow();
    } else {
      this.getComponent().openPendingCFHWindow(tMsg);
    }
  }

  handle_pending_CFHs_deleted(tMsg) {
    this.getComponent().openCfhWindow();
  }

  handle_cfh_sending_response(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tStatus = tConn.GetIntFrom();
    if (tStatus == 0) {
      this.getComponent().showAlertSentWindow();
    }
  }

  regMsgList(tBool) {
    let tMsgs = propList();
    tMsgs.setaProp(319, Symbol.for("handle_get_pending_response"));
    tMsgs.setaProp(320, Symbol.for("handle_pending_CFHs_deleted"));
    tMsgs.setaProp(321, Symbol.for("handle_cfh_sending_response"));
    let tCmds = propList();
    tCmds.setaProp("GET_PENDING_CALLS_FOR_HELP", 237);
    tCmds.setaProp("DELETE_PENDING_CALLS_FOR_HELP", 238);
    if (tBool) {
      registerListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tCmds);
    }
    return 1;
  }
}
