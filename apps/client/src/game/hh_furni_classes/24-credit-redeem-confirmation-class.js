export default class {
  pWindowID;
  pFurniID;
  pPrice;

  construct() {
    this.pWindowID = getText("credit_redeem_window");
    return 1;
  }

  deconstruct() {
    const tWndObj = getWindow(this.pWindowID);
    if (!(tWndObj == VOID)) {
      tWndObj.close();
    }
    return 1;
  }

  Init(tFurniID, tPrice) {
    this.pPrice = tPrice;
    this.pFurniID = tFurniID;
    if (!this.createUiWindow()) {
      removeObject(this.getID());
      return 0;
    }
    return 1;
  }

  createUiWindow() {
    if (!createWindow(this.pWindowID, "habbo_full.window")) {
      return 0;
    }
    const tWndObj = getWindow(this.pWindowID);
    tWndObj.merge("credit_redeem.window");
    tWndObj.center();
    const tText = replaceChunks(getText("credit_redeem_text"), "%value%", string(this.pPrice));
    if (tWndObj.elementExists("credit_redeem_txt")) {
      tWndObj.getElement("credit_redeem_txt").setText(tText);
    }
    if (getText("credit_redeem_url") == "credit_redeem_url") {
      if (tWndObj.elementExists("credit_redeem_info")) {
        tWndObj.getElement("credit_redeem_info").hide();
      }
    }
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcMouseUp"), this.getID(), Symbol.for("mouseUp"));
    return 1;
  }

  eventProcMouseUp(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "credit_redeem":
        this.sendCreditRedeem();
        removeObject(this.getID());
        break;
      case "close":
      case "credit_cancel":
        removeObject(this.getID());
        break;
      case "credit_redeem_info":
        this.openHelpURL();
        break;
    }
    return 1;
  }

  sendCreditRedeem() {
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("CONVERT_FURNI_TO_CREDITS", propList("integer", integer(this.pFurniID)));
    return 1;
  }

  openHelpURL() {
    executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
    openNetPage("credit_redeem_url");
    return 1;
  }
}
