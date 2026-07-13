export default class {
  pWindowID;
  pFurniID;
  pPrice;

  construct() {
    registerMessage(Symbol.for("openOneClickGameBuyWindow"), this.getID(), Symbol.for("createUiWindow"));
    this.pWindowID = getText("notickets_window_header");
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("openOneClickGameBuyWindow"), this.getID());
    this.closeUiWindow();
    return 1;
  }

  Init() {
  }

  createUiWindow() {
    if (!createWindow(this.pWindowID, "habbo_full.window")) {
      return 0;
    }
    const tWndObj = getWindow(this.pWindowID);
    tWndObj.merge("habbo_games_notickets.window");
    tWndObj.center();
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcMouseUp"), this.getID(), Symbol.for("mouseUp"));
    return 1;
  }

  closeUiWindow() {
    const tWndObj = getWindow(this.pWindowID);
    if (!(tWndObj == VOID)) {
      tWndObj.close();
    }
    return 1;
  }

  eventProcMouseUp(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "notickets_buygame":
        this.sendBuyTwoCredits();
        this.closeUiWindow();
        break;
      case "close":
      case "notickets_cancel":
        this.closeUiWindow();
        break;
      case "notickets_store_link":
        executeMessage(Symbol.for("show_ticketWindow"));
        this.closeUiWindow();
        break;
    }
    return 1;
  }

  sendBuyTwoCredits() {
    const tMyName = getObject(Symbol.for("session")).GET("user_name");
    const tAmount = 1;
    const tParams = propList("integer", tAmount, "string", tMyName);
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("BTCKS", tParams);
    }
    return 1;
  }
}
