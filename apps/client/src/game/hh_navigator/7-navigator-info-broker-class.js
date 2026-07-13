export default class {
  pClientList;

  construct() {
    this.pClientList = propList();
    registerMessage(Symbol.for("requestRoomData"), this.getID(), Symbol.for("requestRoomData"));
  }

  deconstruct() {
    this.pClientList = VOID;
    unregisterMessage(Symbol.for("requestRoomData"), this.getID());
  }

  requestRoomData(tRoomID, ttype, tCallback) {
    const tNavComponent = this.getNavComponent();
    if (tNavComponent == 0) {
      return 0;
    }
    if (tRoomID == VOID) {
      return error(this, "Must specify room ID.", Symbol.for("requestRoomData"), Symbol.for("major"));
    }
    if (!listp(tCallback)) {
      return error(this, "Callback list in format [obj, handler] expected.", Symbol.for("requestRoomData"), Symbol.for("major"));
    }
    if (voidp(tCallback[1]) || voidp(tCallback[2])) {
      return error(this, "Callback list in format [obj, handler] expected.", Symbol.for("requestRoomData"), Symbol.for("major"));
    }
    let tID;
    if ((ttype == Symbol.for("private")) && !tRoomID.contains("f_")) {
      tID = `f_${tRoomID}`;
    } else {
      tID = tRoomID;
    }
    if (this.pClientList.findPos(tID) == 0) {
      this.pClientList.addProp(tID, []);
    }
    const tList = this.pClientList[tID];
    tList.append(tCallback);
    if (ttype == Symbol.for("private")) {
      return tNavComponent.sendGetFlatInfo(tRoomID);
    } else {
      return tNavComponent.sendNavigate(tRoomID, 1, 0);
    }
  }

  processNavigatorData(tdata) {
    if (!listp(tdata)) {
      return 0;
    }
    const tList = this.pClientList[tdata[Symbol.for("id")]];
    this.pClientList.deleteProp(tdata[Symbol.for("id")]);
    if (tList == VOID) {
      return 1;
    }
    for (const tCallback of tList) {
      const tTargetObject = getObject(tCallback[1]);
      const tTargetMethod = tCallback[2];
      if (tTargetObject != 0) {
        call(tTargetMethod, tTargetObject, tdata);
      }
    }
    return 1;
  }

  getNavComponent() {
    const tObject = getObject(Symbol.for("navigator_component"));
    if (tObject == 0) {
      return error(this, "Navigator component not found!", Symbol.for("getNavigator"), Symbol.for("major"));
    }
    return tObject;
  }
}
