export default class {
  pData;
  pWindowID;

  construct() {
    this.pWindowID = Symbol.for("invitationWindowID");
    registerMessage(Symbol.for("hideInvitation"), this.getID(), Symbol.for("close"));
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("close"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("close"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("close"));
    return 1;
  }

  deconstruct() {
    this.pData = VOID;
    unregisterMessage(Symbol.for("hideInvitation"), this.getID());
    unregisterMessage(Symbol.for("enterRoom"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
  }

  close() {
    return removeObject(this.getID());
  }

  show(tdata, tWindowID, tElemID) {
    if (tdata.ilk != Symbol.for("propList")) {
      return 0;
    }
    if (voidp(tdata.findPos(Symbol.for("name")))) {
      return 0;
    }
    this.pData = tdata;
    if (!this.align(tWindowID, tElemID)) {
      return 0;
    }
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tWindow = getWindow(this.pWindowID);
    let tHeader = tdata[Symbol.for("name")];
    tWindow.getElement("invitation_header").setText(tHeader);
    let tText = getText("receive_invitation_text");
    tWindow.getElement("invitation_text").setText(tText);
    let tYes = getText("yes");
    tWindow.getElement("invitation_button_accept_text").setText(tYes);
    let tNo = getText("no");
    tWindow.getElement("invitation_button_deny_text").setText(tNo);
    tWindow.show();
    return 1;
  }

  align(tWindowID, tElemID) {
    if (!windowExists(tWindowID)) {
      return 0;
    }
    let tTargetWindow = getWindow(tWindowID);
    if (!tTargetWindow.elementExists(tElemID)) {
      return 0;
    }
    let tElem = tTargetWindow.getElement(tElemID);
    if (!tElem.getProperty(Symbol.for("visible"))) {
      return 0;
    }
    createWindow(this.pWindowID, "popup_bg_white.window");
    let tWindow = getWindow(this.pWindowID);
    tWindow.merge("invitation.window");
    tWindow.registerProcedure(Symbol.for("eventProcInvitation"), this.getID(), Symbol.for("mouseUp"));
    tWindow.hide();
    let tWinLocX = tTargetWindow.getProperty(Symbol.for("locX"));
    let tWinLocY = tTargetWindow.getProperty(Symbol.for("locY"));
    let tElemLocX = tElem.getProperty(Symbol.for("locX"));
    let tElemLocY = tElem.getProperty(Symbol.for("locY"));
    let tElemWidth = tElem.getProperty(Symbol.for("width"));
    let tInvitationWindow = getWindow(this.pWindowID);
    let tOwnWidth = tInvitationWindow.getProperty(Symbol.for("width"));
    let tOwnHeight = tInvitationWindow.getProperty(Symbol.for("height"));
    let tLocX = tWinLocX + tElemLocX + (tElemWidth / 2) - (tOwnWidth / 2);
    let tLocY = tWinLocY + tElemLocY - tOwnHeight;
    let tOffset = tLocX + tOwnWidth - the.stage.rect.width;
    if (tOffset > 0) {
      tLocX = tLocX - tOffset;
      let tPointerElem = tInvitationWindow.getElement("pointer");
      tPointerElem.moveBy(tOffset, 0);
    }
    tInvitationWindow.moveTo(tLocX, tLocY);
    return 1;
  }

  eventProcInvitation(tEvent, tSprID) {
    switch (tSprID) {
      case "invitation_button_accept":
      case "invitation_button_accept_text":
        executeMessage(Symbol.for("acceptInvitation"));
        this.close();
        break;
      case "invitation_button_deny":
      case "invitation_button_deny_text":
      case "popup_button_close":
        executeMessage(Symbol.for("rejectInvitation"));
        this.close();
        break;
    }
  }
}
