export default class {
  pWndID;
  pObjList;
  pObjMode;
  pWriterObj;
  pListHeight;

  construct() {
    this.pWndID = "Chooser.";
    this.pObjMode = Symbol.for("user");
    this.pObjList = propList();
    let tMetrics = getStructVariable("struct.font.plain");
    tMetrics.setaProp(Symbol.for("lineHeight"), 14);
    createWriter(`${this.getID()} Writer`, tMetrics);
    this.pWriterObj = getWriter(`${this.getID()} Writer`);
    if (!createWindow(this.pWndID, "habbo_system.window", 5, 345)) {
      return 0;
    }
    let tWndObj = getWindow(this.pWndID);
    if (!tWndObj.merge("chooser.window")) {
      return tWndObj.close();
    }
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcChooser"), this.getID(), Symbol.for("mouseUp"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("clear"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("clear"));
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("update"));
    registerMessage(Symbol.for("create_user"), this.getID(), Symbol.for("update"));
    registerMessage(Symbol.for("remove_user"), this.getID(), Symbol.for("update"));
    return this.update();
  }

  deconstruct() {
    if (windowExists(this.pWndID)) {
      removeWindow(this.pWndID);
    }
    this.pWriterObj = VOID;
    removeWriter(`${this.getID()} Writer`);
    this.pObjList = propList();
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    unregisterMessage(Symbol.for("enterRoom"), this.getID());
    unregisterMessage(Symbol.for("create_user"), this.getID());
    unregisterMessage(Symbol.for("remove_user"), this.getID());
    return 1;
  }

  setMode(tMode) {
    switch (tMode) {
      case Symbol.for("user"):
        this.pObjMode = Symbol.for("user");
        break;
      case Symbol.for("Active"):
        this.pObjMode = Symbol.for("Active");
        break;
      case Symbol.for("item"):
        this.pObjMode = Symbol.for("item");
        break;
      default:
        return error(this, `Unsupported obj type: ${tMode}`, Symbol.for("setMode"), Symbol.for("minor"));
    }
    return this.update();
  }

  update() {
    if (!threadExists(Symbol.for("room"))) {
      return removeObject(this.getID());
    }
    if (!windowExists(this.pWndID)) {
      return removeObject(this.getID());
    }
    this.pObjList = propList();
    this.pObjList.sort();
    let tObjList = getThread(Symbol.for("room")).getComponent().getUserObject(Symbol.for("list"));
    for (const tObj of tObjList) {
      this.pObjList.setaProp(convertToLowerCase(tObj.getName()), propList("id", tObj.getID(), "name", tObj.getName()));
    }
    let tObjStr = EMPTY;
    for (let i = 1; i <= this.pObjList.count; i++) {
      tObjStr = `${tObjStr} ${this.pObjList[i].getaProp(Symbol.for("name"))}${RETURN}`;
    }
    delete char -30003 of tObjStr;
    let tImg = this.pWriterObj.render(tObjStr);
    let tElem = getWindow(this.pWndID).getElement("list");
    tElem.feedImage(tImg);
    this.pListHeight = tImg.height;
    return 1;
  }

  clear() {
    this.pObjList = propList();
    this.pListHeight = 0;
    getWindow(this.pWndID).getElement("list").feedImage(image(1, 1, 8));
    return 1;
  }

  eventProcChooser(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "close":
        return removeObject(this.getID());
      case "list":
        let tCount = count(this.pObjList);
        if (tCount == 0) {
          return 0;
        }
        let tLineNum = (tParam.locV / (this.pListHeight / tCount)) + 1;
        if (tLineNum < 1) {
          tLineNum = 1;
        }
        if (tLineNum > tCount) {
          tLineNum = tCount;
        }
        if (!threadExists(Symbol.for("room"))) {
          return removeObject(this.getID());
        }
        let tObjID = this.pObjList[tLineNum].getaProp(Symbol.for("id"));
        getThread(Symbol.for("room")).getInterface().eventProcUserObj(Symbol.for("mouseUp"), tObjID);
        getThread(Symbol.for("room")).getInterface().getArrowHiliter().show(tObjID, 1);
        break;
    }
  }
}
