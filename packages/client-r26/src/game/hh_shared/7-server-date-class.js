export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  getDate() {
    if (connectionExists(getVariable("connection.info.id"))) {
      return getConnection(getVariable("connection.info.id")).send("GDATE");
    } else {
      return 0;
    }
  }

  handle_date(tMsg) {
    if (stringp(tMsg.content)) {
      tMsg = tMsg.content;
      const tDelim = the.itemDelimiter;
      the.itemDelimiter = "-";
      if (tMsg.item.count == 3) {
        tMsg = `${tMsg.item[1]}.${tMsg.item[2]}.${tMsg.item[3]}`;
        getObject(Symbol.for("session")).set("server_date", tMsg);
        the.itemDelimiter = tDelim;
        return executeMessage(Symbol.for("serverDate"), tMsg);
      }
      the.itemDelimiter = tDelim;
    }
  }

  regMsgList(tBool) {
    const tMsgs = propList();
    tMsgs.setaProp(163, Symbol.for("handle_date"));
    const tCmds = propList();
    tCmds.setaProp("GDATE", 49);
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
