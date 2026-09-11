export default class {
  construct() {
    return 1;
  }

  deconstruct() {
    return 1;
  }

  eventProc(tEvent, tSprID, tProp) {
    if (tEvent == Symbol.for("mouseUp")) {
      if (tSprID == "ctlg_text_3") {
        let tURL = getText("url_pets");
        executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
        openNetPage(tURL, "_new");
      }
    }
    return 0;
  }
}
