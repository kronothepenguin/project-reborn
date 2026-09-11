export default class {
  pConnectionId;
  pTempPassword;

  construct() {
    this.pConnectionId = getVariable("connection.info.id");
    this.pTempPassword = EMPTY;
    return 1;
  }

  deconstruct() {
    if (windowExists(Symbol.for("login_b"))) {
      removeWindow(Symbol.for("login_b"));
    }
    return 1;
  }

  showLogin() {
    getObject(Symbol.for("session")).set(Symbol.for("userName"), EMPTY);
    getObject(Symbol.for("session")).set(Symbol.for("Password"), EMPTY);
    this.pTempPassword = EMPTY;
    if (createWindow(Symbol.for("login_b"), "habbo_simple.window", 444, 230)) {
      let tWndObj = getWindow(Symbol.for("login_b"));
      tWndObj.merge("login_b.window");
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcLogin"), this.getID(), Symbol.for("mouseUp"));
      tWndObj.registerProcedure(Symbol.for("eventProcLogin"), this.getID(), Symbol.for("keyDown"));
      tWndObj.getElement("login_username").setFocus(1);
      if (variableExists("username_input.font.size")) {
        let tElem = tWndObj.getElement("login_username");
        if (tElem == 0) {
          return 0;
        }
        if (tElem.pMember == VOID) {
          return 0;
        }
        if (tElem.pMember.type != Symbol.for("field")) {
          return 0;
        }
        tElem.pMember.fontSize = getIntVariable("username_input.font.size");
        tElem = tWndObj.getElement("login_password");
        if (tElem == 0) {
          return 0;
        }
        if (tElem.pMember == VOID) {
          return 0;
        }
        if (tElem.pMember.type != Symbol.for("field")) {
          return 0;
        }
        tElem.pMember.fontSize = getIntVariable("username_input.font.size");
      }
    }
    if (variableExists("xxx.username") && variableExists("xxx.password")) {
      let tUserName = getVariable("xxx.username");
      let tPassword = getVariable("xxx.password");
      this.pTempPassword = tPassword;
      tWndObj.getElement("login_username").setText(tUserName);
      setVariable("xxx.username", EMPTY);
      setVariable("xxx.password", EMPTY);
      this.tryLogin();
    }
    return 1;
  }

  hideLogin() {
    if (windowExists(Symbol.for("login_b"))) {
      removeWindow(Symbol.for("login_b"));
    }
    return 1;
  }

  showDisconnect() {
    let tList = propList();
    executeMessage(Symbol.for("getHotelClosedDisconnectStatus"), tList);
    if (tList["retval"] == 1) {
      return 1;
    }
    createWindow(Symbol.for("error"), "error.window", 0, 0, Symbol.for("modalcorner"));
    let tWndObj = getWindow(Symbol.for("error"));
    tWndObj.getElement("error_title").setText(getText("Alert_ConnectionFailure"));
    tWndObj.getElement("error_text").setText(getText("Alert_ConnectionDisconnected"));
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcDisconnect"), this.getID(), Symbol.for("mouseUp"));
    the.keyboardFocusSprite = 0;
  }

  tryLogin() {
    if (!windowExists(Symbol.for("login_b"))) {
      return error(this, `${"Window not found:"} ${Symbol.for("login_b")}`, Symbol.for("tryLogin"), Symbol.for("major"));
    }
    let tWndObj = getWindow(Symbol.for("login_b"));
    let tUserName = tWndObj.getElement("login_username").getText();
    let tPassword = this.pTempPassword;
    if (tUserName == EMPTY) {
      return 0;
    }
    if (tPassword == EMPTY) {
      return 0;
    }
    getObject(Symbol.for("session")).set(Symbol.for("userName"), tUserName);
    getObject(Symbol.for("session")).set(Symbol.for("Password"), tPassword);
    tWndObj.getElement("login_ok").hide();
    tWndObj.getElement("login_connecting").setProperty(Symbol.for("blend"), 100);
    this.blinkConnection();
    this.getComponent().setaProp(Symbol.for("pOkToLogin"), 1);
    return this.getComponent().connect();
  }

  blinkConnection() {
    if (!windowExists(Symbol.for("login_b"))) {
      return 0;
    }
    if (timeoutExists(Symbol.for("login_blinker"))) {
      return 0;
    }
    let tElem = getWindow(Symbol.for("login_b")).getElement("login_connecting");
    if (!tElem) {
      return 0;
    }
    if (getWindow(Symbol.for("login_b")).getElement("login_ok").getProperty(Symbol.for("visible")) == 1) {
      return 0;
    }
    tElem.setProperty(Symbol.for("visible"), !tElem.getProperty(Symbol.for("visible")));
    return createTimeout(Symbol.for("login_blinker"), 500, Symbol.for("blinkConnection"), this.getID(), VOID, 1);
  }

  updatePasswordAsterisks() {
    if (!windowExists(Symbol.for("login_b"))) {
      return 0;
    }
    let tPwdTxt = getWindow(Symbol.for("login_b")).getElement("login_password").getText();
    for (let i = 1; i <= tPwdTxt.length; i++) {
      let tChar = char(i).to(i).of(tPwdTxt);
      if (tChar != "*" && tChar != " ") {
        this.pTempPassword = `${char(1).to(i - 1).of(this.pTempPassword)}${tChar}${char(i + 1).to(i + 1).of(this.pTempPassword)}`;
      }
    }
    let tStars = EMPTY;
    for (let i = 1; i <= this.pTempPassword.length; i++) {
      tStars = `${tStars}${"*"}`;
    }
    getWindow(Symbol.for("login_b")).getElement("login_password").setText(tStars);
  }

  eventProcLogin(tEvent, tSprID, tParam) {
    let tWndObj = getWindow(Symbol.for("login_b"));
    if (!tWndObj) {
      return 0;
    }
    switch (tEvent) {
      case Symbol.for("mouseUp"): {
        switch (tSprID) {
          case "login_password":
            let tCount = tWndObj.getElement(tSprID).getText().length;
            the.selStart = tCount;
            the.selEnd = tCount;
            break;
          case "login_ok":
            return this.tryLogin();
        }
        break;
      }
      case Symbol.for("keyDown"): {
        let tTimeoutHideName = `${"pwdhide"}${the.milliSeconds}`;
        if (the.keyCode == 36) {
          this.tryLogin();
          return 1;
        }
        switch (tSprID) {
          case "login_password":
            switch (the.keyCode) {
              case 48:
                return 0;
              case 49:
                return 1;
              case 51:
                if (this.pTempPassword.length > 0) {
                  this.pTempPassword = char(1).to(this.pTempPassword.length - 1).of(this.pTempPassword);
                }
                break;
              case 123:
              case 124:
              case 125:
              case 126:
                return 1;
              case 117:
                if (windowExists(Symbol.for("login_b"))) {
                  tWndObj.getElement(tSprID).setText(EMPTY);
                  this.pTempPassword = EMPTY;
                }
                break;
            }
            createTimeout(tTimeoutHideName, 1, Symbol.for("updatePasswordAsterisks"), this.getID(), VOID, 1);
            break;
        }
        break;
      }
    }
    return 0;
  }

  eventProcDisconnect(tEvent, tElemID, tParam) {
    if (tEvent == Symbol.for("mouseUp")) {
      if (tElemID == "error_close") {
        removeWindow(Symbol.for("error"));
        resetClient();
      }
    }
  }
}
