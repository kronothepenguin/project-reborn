export default class {
  construct() {
    this.updatePurseSaldo();
    this.updatePurseTickets();
    this.updatePurseFilm();
    registerMessage(Symbol.for("updateCreditCount"), this.getID(), Symbol.for("updatePurseSaldo"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("updateCreditCount"), this.getID());
  }

  updatePurseSaldo() {
    if (!threadExists(Symbol.for("catalogue"))) {
      return 0;
    }
    let tWndObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (objectp(tWndObj)) {
      if (tWndObj.elementExists("purse_amount")) {
        let tSaldo;
        if (getObject(Symbol.for("session")).exists("user_walletbalance")) {
          tSaldo = getObject(Symbol.for("session")).GET("user_walletbalance");
        } else {
          tSaldo = "-";
        }
        tWndObj.getElement("purse_amount").setText(tSaldo);
      }
    }
  }

  updatePurseTickets() {
    let tWndObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (objectp(tWndObj)) {
      if (tWndObj.elementExists("purse_info_tickets")) {
        let tFieldTxt = `${getObject(Symbol.for("session")).GET("user_ph_tickets")} ${getText("purse_info_tickets")}`;
        tWndObj.getElement("purse_info_tickets").setText(tFieldTxt);
      }
      return 1;
    }
  }

  updatePurseFilm() {
    let tWndObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (objectp(tWndObj)) {
      if (tWndObj.elementExists("purse_info_film")) {
        let tFieldTxt = `${getObject(Symbol.for("session")).GET("user_photo_film")} ${getText("purse_info_film")}`;
        tWndObj.getElement("purse_info_film").setText(tFieldTxt);
      }
      return 1;
    }
  }

  eventProc(tEvent, tSprID, tProp) {
    if (tEvent == Symbol.for("mouseUp")) {
      if (tSprID == "close") {
        return 0;
      }
    }
    if (tEvent == Symbol.for("mouseDown")) {
      let tloc = the.mouseLoc;
      switch (tSprID) {
        case "coins_btn":
          executeMessage(Symbol.for("externalLinkClick"), tloc);
          openNetPage(getText("url_purselink"));
          break;
        case "vouchers_btn":
          executeMessage(Symbol.for("externalLinkClick"), tloc);
          openNetPage(getText("purse_vouchers_helpurl"));
          break;
        default:
          return 0;
      }
    }
    return 1;
  }
}
