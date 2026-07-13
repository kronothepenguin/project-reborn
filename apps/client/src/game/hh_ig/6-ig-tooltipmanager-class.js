export default class {
  pWindowID;

  construct() {
    pWindowID = "ig_tooltip";
    return 1;
  }

  deconstruct() {
    this.removeTooltipWindow();
    return 1;
  }

  handleEvent(tEvent, tSprID, tWndID, tKey) {
    if (tEvent == Symbol.for("mouseLeave")) {
      return this.removeTooltipWindow();
    }
    if (tEvent != Symbol.for("mouseEnter")) {
      return 1;
    }
    let tText;
    if (voidp(tKey)) {
      tText = this.getTooltipText(tSprID);
      if (tText == 0) {
        return 1;
      }
    } else {
      tText = getText(tKey);
    }
    const tWndObj = getWindow(tWndID);
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement(tSprID);
    if (tElem == 0) {
      return 0;
    }
    const tsprite = tElem.getProperty(Symbol.for("sprite"));
    if (tsprite == 0) {
      return 0;
    }
    const tLocX = tsprite.locH + (tsprite.width / 2);
    const tLocY = tsprite.locV;
    this.createTooltipWindow(tText, tLocX, tLocY);
    return 1;
  }

  getTooltipText(tSprID) {
    if (tSprID.length < 4) {
      return 0;
    }
    let tKey = `ig_tooltip_${tSprID.char[`4..${tSprID.length}`]}`;
    if (textExists(tKey)) {
      return getText(tKey);
    }
    if (tKey.char[`${tKey.length - 1}`] == "_") {
      tKey = tKey.char[`1..${tKey.length - 2}`];
    }
    if (textExists(tKey)) {
      return getText(tKey);
    }
    return 0;
  }

  createTooltipWindow(tText, tLocX, tLocY) {
    if (windowExists(pWindowID)) {
      this.removeTooltipWindow(pWindowID);
    }
    createWindow(pWindowID, "ig_tooltip.window");
    const tWndObj = getWindow(pWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_tt_text");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(tText);
    tWndObj.moveTo(100, 100);
    tWndObj.moveTo(tLocX - (tWndObj.getProperty(Symbol.for("width")) / 2), tLocY - tWndObj.getProperty(Symbol.for("height")));
    tWndObj.moveZ(10000000);
    return 1;
  }

  removeTooltipWindow() {
    if (windowExists(pWindowID)) {
      removeWindow(pWindowID);
    }
  }
}
