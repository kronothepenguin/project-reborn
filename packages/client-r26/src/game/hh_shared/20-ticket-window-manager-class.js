export default class {
  pWndID;
  pChosenAmount;
  pGiftActive;

  construct() {
    this.pWndID = getText("ph_tickets_title");
    this.pChosenAmount = 1;
    this.pGiftActive = 0;
    registerMessage(Symbol.for("show_ticketWindow"), this.getID(), Symbol.for("showTicketWindow"));
    registerMessage(Symbol.for("hide_ticketwindow"), this.getID(), Symbol.for("hideTicketWindow"));
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("hideTicketWindow"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("hideTicketWindow"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("hideTicketWindow"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("show_ticketWindow"), this.getID());
    unregisterMessage(Symbol.for("hide_ticketwindow"), this.getID());
    unregisterMessage(Symbol.for("enterRoom"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    if (windowExists(this.pWndID)) {
      removeWindow(this.pWndID);
    }
    return 1;
  }

  showTicketWindow() {
    if (windowExists(this.pWndID)) {
      return 1;
    }
    const tList = propList();
    tList["showDialog"] = 1;
    executeMessage(Symbol.for("getHotelClosingStatus"), tList);
    if (tList["retval"] == 1) {
      return 1;
    }
    createWindow(this.pWndID, "habbo_basic.window");
    const tWndObj = getWindow(this.pWndID);
    if (tWndObj == 0) {
      return error(this, "Cannot open tickets window", Symbol.for("showTicketWindow"), Symbol.for("major"));
    }
    if (!this.ChangeWindowView("habbo_ph_tickets.window")) {
      return 0;
    }
    tWndObj.center();
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcTicketsWindow"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.registerProcedure(Symbol.for("eventProcTicketsWindow"), this.getID(), Symbol.for("keyDown"));
    return 1;
  }

  ChangeWindowView(tView) {
    if (!windowExists(this.pWndID)) {
      return 1;
    }
    const tWndObj = getWindow(this.pWndID);
    tWndObj.unmerge();
    if (!tWndObj.merge(tView)) {
      return error(this, "Cannot open tickets window", Symbol.for("ChangeWindowView"), Symbol.for("major"));
    }
    const tTickets = getObject(Symbol.for("session")).GET("user_ph_tickets");
    const tText = replaceChunks(getText("ph_tickets_txt"), "\x1", tTickets);
    let tElem = tWndObj.getElement("ph_tickets_number");
    if (tElem != 0) {
      tElem.setText(string(tTickets));
    }
    tElem = tWndObj.getElement("ph_tickets_txt");
    if (tElem != 0) {
      tElem.setText(string(tText));
    }
    this.activateGiftBox(this.pGiftActive);
    return this.setCheckBox(this.pChosenAmount);
  }

  hideTicketWindow() {
    if (windowExists(this.pWndID)) {
      removeWindow(this.pWndID);
    }
    this.pChosenAmount = 1;
    this.pGiftActive = 0;
    return 1;
  }

  eventProcTicketsWindow(tEvent, tSprID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
          this.hideTicketWindow();
          break;
        case "ph_tickets_buy_button": {
          let tName;
          if (this.pGiftActive) {
            tName = getWindow(tWndID).getElement("ph_tickets_namefield").getText();
          } else {
            tName = getObject(Symbol.for("session")).GET("user_name");
          }
          if (tName != EMPTY) {
            this.buyGameTickets(tName);
            this.hideTicketWindow();
          }
          break;
        }
        case "tickets_checkbox_1":
          this.setCheckBox(1);
          this.pChosenAmount = 1;
          break;
        case "tickets_checkbox_2":
          this.setCheckBox(2);
          this.pChosenAmount = 2;
          break;
        case "tickets_button_info_1":
          return this.ChangeWindowView("habbo_ph_ticketinfo1.window");
        case "tickets_button_info_2":
          return this.ChangeWindowView("habbo_ph_ticketinfo2.window");
        case "tickets_button_info_hide":
          return this.ChangeWindowView("habbo_ph_tickets.window");
        case "tickets_gift_check":
          this.pGiftActive = not this.pGiftActive;
          this.activateGiftBox(this.pGiftActive);
          break;
        case "ph_tickets_cancel_button":
          this.hideTicketWindow();
          break;
      }
    }
  }

  setCheckBox(tNr) {
    if (!windowExists(this.pWndID)) {
      return 0;
    }
    const tWndObj = getWindow(this.pWndID);
    const tOnImg = getMember("button.radio.on").image;
    const tOffImg = getMember("button.radio.off").image;
    for (let i = 1; i <= 2; i++) {
      const tElem = tWndObj.getElement(`tickets_checkbox_${i}`);
      if (tElem != 0) {
        if (tNr == i) {
          tElem.feedImage(tOnImg);
          continue;
        }
        tElem.feedImage(tOffImg);
      }
    }
    return 1;
  }

  buyGameTickets(tName) {
    const tParams = propList("integer", this.pChosenAmount, "string", tName);
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("BTCKS", tParams);
    }
    return 1;
  }

  activateGiftBox(tActive) {
    if (!windowExists(this.pWndID)) {
      return 0;
    }
    const tWndObj = getWindow(this.pWndID);
    const tOnMember = "button.checkbox.on";
    const tOffMember = "button.checkbox.off";
    const tCheckElem = tWndObj.getElement("tickets_gift_check");
    if (tCheckElem == 0) {
      return 0;
    }
    if (tActive) {
      tCheckElem.setProperty(Symbol.for("member"), tOnMember);
      tWndObj.getElement("ph_tickets_gift_bg").setProperty(Symbol.for("visible"), 1);
      tWndObj.getElement("ph_tickets_namefield").setProperty(Symbol.for("visible"), 1);
      tWndObj.getElement("ph_tickets_namefield").setText(EMPTY);
    } else {
      tCheckElem.setProperty(Symbol.for("member"), tOffMember);
      tWndObj.getElement("ph_tickets_gift_bg").setProperty(Symbol.for("visible"), 0);
      tWndObj.getElement("ph_tickets_namefield").setProperty(Symbol.for("visible"), 0);
    }
  }
}
