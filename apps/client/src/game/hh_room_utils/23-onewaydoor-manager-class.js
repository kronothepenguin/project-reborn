export default class {
  construct() {
    this.regMessageListener(1);
  }

  deconstruct() {
    this.regMessageListener(0);
  }

  changeStatus(tMsg) {
    let tConnection = tMsg.getaProp(Symbol.for("connection"));
    if (voidp(tConnection)) {
      return 0;
    }
    let tID = tConnection.GetIntFrom();
    let tStatus = tConnection.GetIntFrom();
    if (!threadExists(Symbol.for("room"))) {
      error(this, "Room thread not found.", Symbol.for("changeStatus"), Symbol.for("critical"));
      return 0;
    }
    let tComponent = getThread(Symbol.for("room")).getComponent();
    if (voidp(tComponent)) {
      error(this, "Room component not found.", Symbol.for("changeStatus"), Symbol.for("critical"));
      return 0;
    }
    let tActiveObject = tComponent.getActiveObject(tID);
    if (voidp(tActiveObject) || (tActiveObject == 0)) {
      error(this, `One way door object ${tID} not found.`, Symbol.for("changeStatus"), Symbol.for("minor"));
      return 0;
    }
    if (tActiveObject.handler(Symbol.for("setDoor"))) {
      tActiveObject.setDoor(tStatus);
    }
    return 1;
  }

  regMessageListener(tBool) {
    let tMsgs = propList();
    tMsgs.setaProp(312, Symbol.for("changeStatus"));
    let tCmds = propList();
    tCmds.setaProp("ENTER_ONEWAY_DOOR", 232);
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
