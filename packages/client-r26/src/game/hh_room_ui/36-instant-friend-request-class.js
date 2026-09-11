export default class {
  pWindowID;
  pParentWindowID;
  pParentElementID;
  pParentObjId;
  pData;

  construct() {
    this.pWindowID = "Instant Friend Request Window";
    return 1;
  }

  deconstruct() {
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    return 1;
  }

  define(tParentWindowID, tParentElementID, tdata, tParentObjId) {
    this.pParentWindowID = tParentWindowID;
    this.pParentElementID = tParentElementID;
    this.pData = tdata;
    this.pParentObjId = tParentObjId;
  }

  show() {
    if (this.pData.ilk != Symbol.for("propList")) {
      return 0;
    }
    if (voidp(this.pData.findPos(Symbol.for("name")))) {
      return 0;
    }
    if (!windowExists(this.pParentWindowID)) {
      return 0;
    }
    let tWindow;
    if (!windowExists(this.pWindowID)) {
      createWindow(this.pWindowID, "instant_friend_request.window");
      tWindow = getWindow(this.pWindowID);
      tWindow.registerProcedure(Symbol.for("eventProcRequest"), this.getID(), Symbol.for("mouseUp"));
    } else {
      tWindow = getWindow(this.pWindowID);
    }
    let tRoomComp = getThread(Symbol.for("room")).getComponent();
    let tUsersRoomId = tRoomComp.getUsersRoomId(this.pData[Symbol.for("name")]);
    let tUserObj = tRoomComp.getUserObject(tUsersRoomId);
    if (!voidp(tUserObj)) {
      if (objectExists("Figure_Preview")) {
        let tPartList = tUserObj.pPartListSubSet[Symbol.for("head")];
        let tFigure = tUserObj.getRawFigure();
        let tUserImg = getObject("Figure_Preview").getHumanPartImg(tPartList, tFigure, 2, "sh");
      }
      let tFaceElem = tWindow.getElement("user_head");
      tFaceElem.feedImage(tUserImg);
    }
    tWindow.getElement("user_name").setText(this.pData[Symbol.for("name")]);
    if (!this.align()) {
      return 0;
    }
  }

  align() {
    if (!windowExists(this.pParentWindowID)) {
      return 0;
    }
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tTargetWindow = getWindow(this.pParentWindowID);
    let tRequestWindow = getWindow(this.pWindowID);
    if (!tTargetWindow.elementExists(this.pParentElementID)) {
      return 0;
    }
    let tElem = tTargetWindow.getElement(this.pParentElementID);
    if (!tElem.getProperty(Symbol.for("visible"))) {
      return 0;
    }
    let tWinLocX = tTargetWindow.getProperty(Symbol.for("locX"));
    let tWinLocY = tTargetWindow.getProperty(Symbol.for("locY"));
    let tElemLocX = tElem.getProperty(Symbol.for("locX"));
    let tElemLocY = tElem.getProperty(Symbol.for("locY"));
    let tElemWidth = tElem.getProperty(Symbol.for("width"));
    let tOwnWidth = tRequestWindow.getProperty(Symbol.for("width"));
    let tOwnHeight = tRequestWindow.getProperty(Symbol.for("height"));
    let tLocX = tWinLocX + tElemLocX + (tElemWidth / 2) - (tOwnWidth / 2);
    let tLocY = tWinLocY + tElemLocY - tOwnHeight;
    let tOffset = tLocX + tOwnWidth - the.stage.rect.width;
    if (tOffset > 0) {
      tLocX = tLocX - tOffset;
      let tPointerElem = tRequestWindow.getElement("pointer");
      tPointerElem.moveBy(tOffset, 0);
    }
    tRequestWindow.moveTo(tLocX, tLocY);
    return 1;
  }

  eventProcRequest(tEvent, tSprID) {
    switch (tSprID) {
      case "button_accept":
        if (objectExists(this.pParentObjId)) {
          let tParent = getObject(this.pParentObjId);
          tParent.confirmFriendRequest(1, this.pData[Symbol.for("id")]);
          createTimeout(Symbol.for("room_bar_extension_next_update"), 1000, Symbol.for("viewNextItemInStack"), this.pParentObjId, VOID, 1);
        }
        break;
      case "button_deny":
        if (objectExists(this.pParentObjId)) {
          let tParent = getObject(this.pParentObjId);
          tParent.confirmFriendRequest(0, this.pData[Symbol.for("id")]);
          createTimeout(Symbol.for("room_bar_extension_next_update"), 1000, Symbol.for("viewNextItemInStack"), this.pParentObjId, VOID, 1);
        }
        break;
      case "user_head":
        if (listp(this.pData)) {
          let tRoomComp = getThread(Symbol.for("room")).getComponent();
          let tRoomInterface = getThread(Symbol.for("room")).getInterface();
          let tUsersRoomId = tRoomComp.getUsersRoomId(this.pData[Symbol.for("name")]);
          if (tUsersRoomId > -1) {
            tRoomInterface.eventProcUserObj(Symbol.for("mouseDown"), tUsersRoomId);
          }
        }
        break;
      case "popup_button_close":
        if (objectExists(this.pParentObjId)) {
          let tParent = getObject(this.pParentObjId);
          tParent.ignoreInstantFriendRequests();
          tParent.viewNextItemInStack();
        }
        break;
    }
  }
}
