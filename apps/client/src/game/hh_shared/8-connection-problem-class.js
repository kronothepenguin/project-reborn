export default class {
  pTimeOutID;
  pWindowID;
  pDelayLength;

  construct() {
    this.pTimeOutID = "connection_problem_timeout";
    this.pWindowID = "connection_problem_window";
    if (variableExists("failed.connection.delay")) {
      this.pDelayLength = getIntVariable("failed.connection.delay");
    } else {
      this.pDelayLength = 20000;
    }
    registerMessage(Symbol.for("userlogin"), this.getID(), Symbol.for("Remove"));
    if (this.pDelayLength == 0) {
      return removeObject(this.getID());
    } else {
      return createTimeout(this.pTimeOutID, this.pDelayLength, Symbol.for("showDialog"), this.getID(), VOID, 1);
    }
  }

  deconstruct() {
    if (timeoutExists(this.pTimeOutID)) {
      removeTimeout(this.pTimeOutID);
    }
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    unregisterMessage(Symbol.for("userlogin"), this.getID());
    return 1;
  }

  Remove() {
    return removeObject(this.getID());
  }

  showDialog() {
    if (createWindow(this.pWindowID)) {
      const tWndObj = getWindow(this.pWindowID);
      tWndObj.setProperty(Symbol.for("title"), getText("log_problem_title"));
      tWndObj.merge("habbo_basic.window");
      tWndObj.merge("habbo_alert_c.window");
      tWndObj.resizeBy(40, 30);
      tWndObj.center();
      tWndObj.getElement("alert_title").setText(getText("log_problem_title"));
      tWndObj.getElement("alert_text").setText(getText("log_problem_text"));
      tWndObj.getElement("alert_link").setText(getText("log_problem_link"));
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
    }
  }

  eventProc(tEvent, tElemID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "close":
        case "alert_ok":
          return removeObject(this.getID());
        case "alert_link":
          executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          return openNetPage(getText("log_problem_url"));
      }
    }
  }
}
