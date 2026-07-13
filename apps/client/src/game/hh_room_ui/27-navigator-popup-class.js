export default class {
  pPopupWindowID;
  pVisible;
  pNodeInfo;
  pBlend;
  pTargetElementID;

  construct() {
    this.pPopupWindowID = getUniqueID();
    this.pHideTimeoutID = getUniqueID();
    this.pShowTimeOutID = getUniqueID();
    this.pVisible = 0;
    this.pNodeInfo = propList();
    this.pBlend = 0;
    registerMessage(Symbol.for("show_hide_navigator"), this.getID(), Symbol.for("hide"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("show_hide_navigator"), this.getID());
    return 1;
  }

  Init(tTargetElementID) {
    this.pTargetElementID = tTargetElementID;
    let tNavComponent = getObject(Symbol.for("navigator_component"));
    if (tNavComponent != 0) {
      tNavComponent.updateRecomRooms();
    }
  }

  show() {
    if (this.pVisible) {
      return 1;
    }
    let tNavInterface = getObject(Symbol.for("navigator_interface"));
    if (tNavInterface != 0) {
      if (tNavInterface.isOpen()) {
        return 0;
      }
    }
    createWindow(this.pPopupWindowID, "nav_popup_bg.window");
    let tWindow = getWindow(this.pPopupWindowID);
    tWindow.merge("navigator_popup.window");
    let tRoomBar = getWindow("RoomBarID");
    let tNavIcon = tRoomBar.getElement(this.pTargetElementID);
    let tBarLocX = tRoomBar.getProperty(Symbol.for("locX"));
    let tBarLocY = tRoomBar.getProperty(Symbol.for("locY"));
    let tIconLocX = tNavIcon.getProperty(Symbol.for("locX"));
    let tIconLocY = tNavIcon.getProperty(Symbol.for("locY"));
    let tIconWidth = tNavIcon.getProperty(Symbol.for("width"));
    let tMargin = 2;
    let tLocX = tBarLocX + tIconLocX + (tIconWidth / 2) - (tWindow.getProperty(Symbol.for("width")) / 2);
    let tLocY = tBarLocY + tIconLocY - tWindow.getProperty(Symbol.for("height"));
    let tOffset = tWindow.getProperty(Symbol.for("width")) + tLocX - the.stage.rect.width - tMargin;
    if (tOffset > 0) {
      tLocX = tLocX - tOffset;
      let tPointerElem = tWindow.getElement("pointer");
      tPointerElem.moveBy(tOffset, 0);
    }
    tWindow.moveTo(tLocX, tLocY);
    tWindow.registerProcedure(Symbol.for("popupEntered"), this.getID(), Symbol.for("mouseEnter"));
    tWindow.registerProcedure(Symbol.for("popupLeft"), this.getID(), Symbol.for("mouseLeave"));
    tWindow.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
    this.fetchNodeInfo();
    for (let i = 1; i <= 3; i++) {
      if (i > this.pNodeInfo.children.count) {
        break;
      }
      let tRoom = this.pNodeInfo.children[i];
      let tElem = tWindow.getElement(`nav_popup_link${i}`);
      let tRoomName = tRoom.getaProp(Symbol.for("name"));
      tElem.setText(tRoomName);
      let tOccupancy;
      if (tRoom[Symbol.for("usercount")] && tRoom[Symbol.for("maxUsers")]) {
        tOccupancy = float(tRoom[Symbol.for("usercount")]) / tRoom[Symbol.for("maxUsers")];
      } else {
        tOccupancy = 0;
      }
      tElem = tWindow.getElement(`nav_popup_occupancy${i}`);
      let tmember;
      if (tOccupancy > 0.67000000000000004) {
        tmember = `room.occupancy.${3}`;
      } else {
        if (tOccupancy > 0.34000000000000002) {
          tmember = `room.occupancy.${2}`;
        } else {
          if (tOccupancy > 0) {
            tmember = `room.occupancy.${1}`;
          } else {
            tmember = `room.occupancy.${0}`;
          }
        }
      }
      let tImage = member(getmemnum(tmember)).image;
      tElem = tWindow.getElement(`nav_popup_link_occupancy${i}`);
      tElem.feedImage(tImage);
    }
    tWindow.setBlend(0);
    this.pBlend = 0;
    receiveUpdate(this.getID());
    this.pVisible = 1;
  }

  hide() {
    if (!this.pVisible) {
      return 1;
    }
    removeUpdate(this.getID());
    removeWindow(this.pPopupWindowID);
    executeMessage(Symbol.for("popupClosed"), this.getID());
    this.pVisible = 0;
  }

  fetchNodeInfo() {
    this.pNodeInfo = getObject(Symbol.for("navigator_component")).getRecomNodeInfo();
  }

  update() {
    this.pBlend = this.pBlend + 25;
    if (this.pBlend >= 100) {
      this.pBlend = 100;
      removeUpdate(this.getID());
    }
    let tWindow = getWindow(this.pPopupWindowID);
    tWindow.setBlend(this.pBlend);
  }

  popupEntered() {
    executeMessage(Symbol.for("popupEntered"), this.pTargetElementID);
  }

  popupLeft() {
    executeMessage(Symbol.for("popupLeft"), this.pTargetElementID);
  }

  eventProc(tEvent, tSprID, tParam, tWndID) {
    if (tEvent != Symbol.for("mouseUp")) {
      return 0;
    }
    if (tSprID contains "nav_popup_link") {
      let tLinkNum = value(tSprID.char[tSprID.length]);
      let tRoom = this.pNodeInfo.children[tLinkNum];
      if (!voidp(tRoom)) {
        let tRoomID = tRoom[Symbol.for("id")];
        executeMessage(Symbol.for("roomForward"), tRoomID, Symbol.for("private"));
      }
    }
    if (tSprID == "nav_popup_nav_link") {
      this.hide();
      executeMessage(Symbol.for("show_navigator"));
    }
  }
}
