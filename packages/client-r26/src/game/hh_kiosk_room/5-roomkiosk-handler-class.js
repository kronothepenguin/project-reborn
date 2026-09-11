export default class {
  construct() {
    tMessages = propList();
    tMessages.setaProp(59, Symbol.for("handle_flatcreated"));
    tMessages.setaProp(33, Symbol.for("handle_error"));
    tMessages.setaProp(353, Symbol.for("handle_webShortcut"));
    registerListener(getVariable("connection.info.id"), this.getID(), tMessages);
    registerCommands(getVariable("connection.info.id"), this.getID(), propList("CREATEFLAT", 29));
    return 1;
  }

  deconstruct() {
    tMessages = propList();
    tMessages.setaProp(59, Symbol.for("handle_flatcreated"));
    tMessages.setaProp(33, Symbol.for("handle_error"));
    tMessages.setaProp(353, Symbol.for("handle_webShortcut"));
    unregisterListener(getVariable("connection.info.id"), this.getID(), tMessages);
    unregisterCommands(getVariable("connection.info.id"), this.getID(), propList("CREATEFLAT", 29));
    return 1;
  }

  handle_flatcreated(tMsg) {
    tID = tMsg.content.line[1].word[1];
    tName = tMsg.content.line[2];
    this.getInterface().flatcreated(tName, tID);
  }

  handle_error(tMsg) {
    tErr = tMsg.content;
    switch (tErr) {
      case "Error creating a private room":
        executeMessage(Symbol.for("alert"), propList(Symbol.for("Msg"), getText("roomatic_create_error")));
        return this.getInterface().showHideRoomKiosk();
        break;
    }
    return 1;
  }

  handle_webShortcut(tMsg) {
    tConn = tMsg.getaProp(Symbol.for("connection"));
    if (!tConn) {
      return error(this, "Connection not found.", Symbol.for("handle_webShortcut"), Symbol.for("major"));
    }
    tRequestId = tConn.GetIntFrom();
    if (tRequestId == 1) {
      executeMessage(Symbol.for("open_roomkiosk"));
      return 1;
    }
    return 0;
  }
}
