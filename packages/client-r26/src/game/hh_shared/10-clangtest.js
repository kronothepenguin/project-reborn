export default class {
  m_cWindowID;

  deconstruct() {
    if (windowExists(this.m_cWindowID)) {
      return removeWindow(this.m_cWindowID);
    } else {
      return 1;
    }
  }

  setWord(tWord) {
    if (tWord.ilk != Symbol.for("string")) {
      return error(this, "String expected!", Symbol.for("setWord"), Symbol.for("minor"));
    }
    this.m_cWindowID = "lang_test_wnd";
    if (!windowExists(this.m_cWindowID)) {
      if (!createWindow(this.m_cWindowID)) {
        return error(this, "Failed to create window!", Symbol.for("construct"), Symbol.for("major"));
      }
    }
    const tWndObj = getWindow(this.m_cWindowID);
    tWndObj.merge("habbo_simple.window");
    tWndObj.merge("habbo_lang_test.window");
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("keyDown"));
    tWndObj.getElement("lang_test_example").setText(tWord);
    tWndObj.center();
    setText("lang_test_text", getText("lang_test_text_2"));
  }

  testWord() {
    const tWord = getWindow(this.m_cWindowID).getElement("lang_test_field").getText();
    if (tWord == EMPTY) {
      return 0;
    }
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("LANGCHECK", propList("string", tWord));
    }
    removeObject(this.getID());
  }

  eventProc(tEvent, tElemID) {
    switch (tEvent) {
      case Symbol.for("mouseUp"):
        if (tElemID == "ok") {
          this.testWord();
          return 1;
        }
        break;
      case Symbol.for("keyDown"):
        if (the.key == RETURN) {
          this.testWord();
          return 1;
        } else {
          return 0;
        }
    }
  }
}
