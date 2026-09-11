export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handle_ok(tMsg) {
    tMsg.getaProp(Symbol.for("connection")).send("SCR_GET_USER_INFO", propList("string", "club_habbo"));
  }

  handle_scr_sinfo(tMsg) {
    tProdName = tMsg.connection.GetStrFrom();
    tDaysLeft = tMsg.connection.GetIntFrom();
    tElapsedPeriods = tMsg.connection.GetIntFrom();
    tPrepaidPeriods = tMsg.connection.GetIntFrom();
    tResponseFlag = tMsg.connection.GetIntFrom();
    tList = propList();
    tList[Symbol.for("productName")] = tProdName;
    tList[Symbol.for("daysLeft")] = tDaysLeft;
    tList[Symbol.for("ElapsedPeriods")] = tElapsedPeriods;
    tList[Symbol.for("PrepaidPeriods")] = tPrepaidPeriods;
    this.getComponent().setStatus(tList, tResponseFlag);
  }

  handle_gift(tMsg) {
    tGiftCount = tMsg.connection.GetIntFrom();
    this.getComponent().showGifts(tGiftCount);
  }

  regMsgList(tBool) {
    tMsgs = propList();
    tMsgs.setaProp(3, Symbol.for("handle_ok"));
    tMsgs.setaProp(7, Symbol.for("handle_scr_sinfo"));
    tMsgs.setaProp(280, Symbol.for("handle_gift"));
    tCmds = propList();
    tCmds.setaProp("SCR_GET_USER_INFO", 26);
    tCmds.setaProp("SCR_BUY", 190);
    tCmds.setaProp("SCR_GIFT_APPROVAL", 210);
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
