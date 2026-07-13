export default class {
  pState;
  pValidPartProps;
  pValidPartGroups;

  construct() {
    registerMessage(Symbol.for("userlogin"), this.getID(), Symbol.for("checkWebShortcuts"));
    return this.updateState("start");
  }

  deconstruct() {
    unregisterMessage(Symbol.for("userlogin"), this.getID());
    return this.updateState("reset");
  }

  showHideRoomKiosk() {
    return this.getInterface().showHideRoomKiosk();
  }

  sendNewRoomData(tFlatData) {
    if (connectionExists(getVariable("connection.info.id"))) {
      return getConnection(getVariable("connection.info.id")).send("CREATEFLAT", tFlatData);
    } else {
      return 0;
    }
  }

  sendSetFlatInfo(tFlatMsg) {
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("SETFLATINFO", tFlatMsg);
    } else {
      return 0;
    }
  }

  sendFlatCategory(tNodeId, tCategoryId) {
    if (voidp(tNodeId)) {
      return error(this, "Node ID expected!", Symbol.for("sendFlatCategory"), Symbol.for("major"));
    }
    if (voidp(tCategoryId)) {
      return error(this, "Category ID expected!", Symbol.for("sendFlatCategory"), Symbol.for("major"));
    }
    if (connectionExists(getVariable("connection.info.id"))) {
      return getConnection(getVariable("connection.info.id")).send("SETFLATCAT", propList(Symbol.for("integer"), integer(tNodeId), Symbol.for("integer"), integer(tCategoryId)));
    } else {
      return 0;
    }
  }

  updateState(tstate, tProps) {
    switch (tstate) {
      case "reset":
        this.pState = tstate;
        return unregisterMessage(Symbol.for("open_roomkiosk"), this.getID());
      case "start":
        this.pState = tstate;
        return registerMessage(Symbol.for("open_roomkiosk"), this.getID(), Symbol.for("showHideRoomKiosk"));
      default:
        return error(this, `${"Unknown state:"} ${tstate}`, Symbol.for("updateState"), Symbol.for("minor"));
    }
  }

  getState() {
    return this.pState;
  }

  checkWebShortcuts(tChecked) {
    if (tChecked == 1) {
      executeMessage(Symbol.for("open_roomkiosk"));
      return 1;
    }
    if (variableExists("shortcut.id")) {
      tShortcutID = getIntVariable("shortcut.id");
      if (tShortcutID == 1) {
        tTimeoutID = Symbol.for("roommatic_opening_timeout");
        if (!timeoutExists(tTimeoutID)) {
          createTimeout(Symbol.for("tTimeoutID"), 2500, Symbol.for("checkWebShortcuts"), this.getID(), 1, 1);
        }
      }
    }
    return 1;
  }
}
