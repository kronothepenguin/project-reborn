export default class {
  pPopupList;
  pShowTimeOutID;
  pHideTimeoutID;

  construct() {
    this.pPopupList = propList();
    this.pShowTimeOutID = getUniqueID();
    this.pHideTimeoutID = getUniqueID();
    registerMessage(Symbol.for("popupEntered"), this.getID(), Symbol.for("popupEntered"));
    registerMessage(Symbol.for("popupLeft"), this.getID(), Symbol.for("popupLeft"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("removePopups"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("removePopups"));
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("removePopups"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("popupEntered"), this.getID());
    unregisterMessage(Symbol.for("popupLeft"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    unregisterMessage(Symbol.for("enterRoom"), this.getID());
    return 1;
  }

  handleEvent(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "int_nav_image":
      case "int_controller_image":
        break;
      default:
        return 0;
    }
    switch (tEvent) {
      case Symbol.for("mouseEnter"):
        this.timeoutShow(tSprID);
        break;
      case Symbol.for("mouseLeave"):
        this.timeoutHide(tSprID);
        break;
    }
  }

  timeoutShow(tPopupID) {
    if (voidp(tPopupID)) {
      return 0;
    }
    let tObject = this.getPopup(tPopupID);
    if (!objectp(tObject)) {
      return 0;
    }
    tObject.Init(tPopupID);
    if (timeoutExists(this.pHideTimeoutID)) {
      removeTimeout(this.pHideTimeoutID);
    }
    if (!timeoutExists(this.pShowTimeOutID)) {
      createTimeout(this.pShowTimeOutID, 500, Symbol.for("showPopup"), this.getID(), tPopupID, 1);
    }
  }

  timeoutHide(tPopupID) {
    if (voidp(tPopupID)) {
      return 0;
    }
    if (timeoutExists(this.pShowTimeOutID)) {
      removeTimeout(this.pShowTimeOutID);
    }
    if (!timeoutExists(this.pHideTimeoutID)) {
      createTimeout(this.pHideTimeoutID, 200, Symbol.for("hidePopup"), this.getID(), tPopupID, 1);
    }
  }

  showPopup(tPopupID) {
    let tPopup = this.getPopup(tPopupID);
    if (!objectp(tPopup)) {
      return 0;
    }
    tPopup.show();
  }

  hidePopup(tPopupID) {
    let tPopup = this.getPopup(tPopupID);
    if (!objectp(tPopup)) {
      return 0;
    }
    tPopup.hide();
  }

  getPopup(tPopupID) {
    if (voidp(this.pPopupList.getaProp(tPopupID))) {
      let tPopupClass;
      switch (tPopupID) {
        case "int_nav_image":
          tPopupClass = "Navigator Popup Class";
          break;
        case "int_controller_image":
          tPopupClass = "IG Popup Class";
          break;
        default:
          return 0;
      }
      if (!memberExists(tPopupClass)) {
        return 0;
      }
      let tObject = createObject(Symbol.for("random"), tPopupClass);
      if (tObject == 0) {
        return 0;
      }
      this.pPopupList.setaProp(tPopupID, tObject);
    }
    return this.pPopupList.getaProp(tPopupID);
  }

  removePopups() {
    for (const tPopup of this.pPopupList) {
      tPopup.hide();
    }
    if (timeoutExists(this.pShowTimeOutID)) {
      removeTimeout(this.pShowTimeOutID);
    }
    if (timeoutExists(this.pHideTimeoutID)) {
      removeTimeout(this.pHideTimeoutID);
    }
  }

  popupEntered(tTarget) {
    this.timeoutShow(tTarget);
  }

  popupLeft(tTarget) {
    this.timeoutHide(tTarget);
  }
}
