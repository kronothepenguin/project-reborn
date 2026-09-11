export default class {
  pWndID;
  pObjList;
  pWriterObj;
  pListHeight;

  construct() {
    this.pWndID = "Furniture Chooser.";
    this.pObjList = propList();
    let tMetrics = getStructVariable("struct.font.plain");
    tMetrics.setaProp(Symbol.for("lineHeight"), 14);
    createWriter(`${this.getID()} Writer`, tMetrics);
    this.pWriterObj = getWriter(`${this.getID()} Writer`);
    if (!createWindow(this.pWndID, "habbo_system.window", 5, 315)) {
      return 0;
    }
    let tWndObj = getWindow(this.pWndID);
    if (!tWndObj.merge("chooser.window")) {
      return tWndObj.close();
    }
    tWndObj.resizeTo(260, 170);
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcChooser"), this.getID(), Symbol.for("mouseUp"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("close"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("close"));
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("update"));
    registerMessage(Symbol.for("activeObjectRemoved"), this.getID(), Symbol.for("update"));
    registerMessage(Symbol.for("itemObjectRemoved"), this.getID(), Symbol.for("update"));
    registerMessage(Symbol.for("activeObjectsUpdated"), this.getID(), Symbol.for("update"));
    registerMessage(Symbol.for("itemObjectsUpdated"), this.getID(), Symbol.for("update"));
    return 1;
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
    unregisterMessage(Symbol.for("activeObjectRemoved"), this.getID());
    unregisterMessage(Symbol.for("itemObjectRemoved"), this.getID());
    unregisterMessage(Symbol.for("activeObjectsUpdated"), this.getID());
    unregisterMessage(Symbol.for("itemObjectsUpdated"), this.getID());
    return 1;
  }

  showList() {
    return this.update();
  }

  close() {
    return removeObject(this.getID());
  }

  update() {
    if (!threadExists(Symbol.for("room"))) {
      return removeObject(this.getID());
    }
    if (!windowExists(this.pWndID)) {
      return removeObject(this.getID());
    }
    let tRoomComponent = getThread(Symbol.for("room")).getComponent();
    if (!objectp(tRoomComponent)) {
      return propList();
    }
    let tActiveObjList = tRoomComponent.getActiveObject(Symbol.for("list"));
    let tItemObjList = tRoomComponent.getItemObject(Symbol.for("list"));
    this.pObjList = propList();
    this.pObjList.sort();
    let tClickAction = EMPTY;
    let tMoverClientId = 0;
    let tObjectMover = getThread(Symbol.for("room")).getInterface().getObjectMover();
    if (objectp(tObjectMover)) {
      tMoverClientId = tObjectMover.getProperty(Symbol.for("clientID"));
      tClickAction = getThread(Symbol.for("room")).getInterface().getProperty(Symbol.for("clickAction"));
    }
    let tAdminChooser = getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_any_room_controller");
    for (const tObj of tActiveObjList) {
      if (tAdminChooser) {
        this.pObjList.setaProp(`a${tObj.getID()}`, `Id:${tObj.getID()} ${tObj.getLocation()} ${tObj.getInfo().name}`);
        continue;
      }
      this.pObjList.setaProp(`a${tObj.getID()}`, tObj.getInfo().name);
    }
    for (const tObj of tItemObjList) {
      if (tAdminChooser) {
        this.pObjList.setaProp(`i${tObj.getID()}`, `Id:${tObj.getID()} ${tObj.getLocation()} ${tObj.getInfo().name}`);
        continue;
      }
      this.pObjList.setaProp(`i${tObj.getID()}`, tObj.getInfo().name);
    }
    let tImgArray = list();
    let tObjStr = EMPTY;
    for (let i = 1; i <= this.pObjList.count; i++) {
      tObjStr = `${tObjStr} ${i}. ${this.pObjList[i]}${RETURN}`;
      if (i >= 100) {
        delete char -30003 of tObjStr;
        tImgArray.append(this.pWriterObj.render(tObjStr));
        tObjStr = EMPTY;
      }
    }
    if (!(tObjStr == EMPTY)) {
      delete char -30003 of tObjStr;
      tImgArray.append(this.pWriterObj.render(tObjStr));
    }
    let tTotalHeight = 0;
    let tMaxWidth = 0;
    for (let i = 1; i <= tImgArray.count; i++) {
      tTotalHeight = tTotalHeight + tImgArray[i].height;
      if (tImgArray[i].width > tMaxWidth) {
        tMaxWidth = tImgArray[i].width;
      }
    }
    let tImg;
    if (tImgArray.count == 0) {
      tImg = image(1, 1, 8);
    } else {
      tImg = image(tMaxWidth, tTotalHeight, tImgArray[1].depth);
      let tYOffset = 0;
      for (let i = 1; i <= tImgArray.count; i++) {
        let tOffsetRect = tImgArray[i].rect + rect(0, tYOffset, 0, tYOffset);
        tImg.copyPixels(tImgArray[i], tOffsetRect, tImgArray[i].rect);
        tYOffset = tYOffset + tImgArray[i].height;
      }
    }
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
        let tObjID = this.pObjList.getPropAt(tLineNum);
        let tRoomInt = getThread(Symbol.for("room")).getInterface();
        if (!tRoomInt) {
          return 0;
        }
        let tRoomComponent = getThread(Symbol.for("room")).getComponent();
        if (!tRoomComponent) {
          return 0;
        }
        tObjID = this.pObjList.getPropAt(tLineNum);
        let tObjType = tObjID.char[1];
        tObjID = tObjID.char[`2..${tObjID.length}`];
        let tActiveObj = 0;
        let tItemObj = 0;
        if (tObjType == "a") {
          tActiveObj = tRoomComponent.getActiveObject(tObjID);
        } else {
          if (tObjType == "i") {
            tItemObj = tRoomComponent.getItemObject(tObjID);
          }
        }
        let tSelectedObjIdWas = tRoomInt.getSelectedObject();
        if (!(objectp(tActiveObj) || objectp(tItemObj))) {
          return 0;
        }
        let ttype = "";
        if (objectp(tItemObj)) {
          ttype = "item";
        }
        if (objectp(tActiveObj)) {
          ttype = "active";
        }
        tRoomInt.cancelObjectMover();
        tRoomInt.pSelectedObj = tObjID;
        tRoomInt.pSelectedType = ttype;
        executeMessage(Symbol.for("showObjectInfo"), ttype);
        tRoomInt.hideArrowHiliter();
        if ((ttype == "item") && !(tSelectedObjIdWas == tObjID)) {
          tRoomComponent.getItemObject(tObjID).select();
        }
        break;
    }
  }
}
