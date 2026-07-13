export default class {
  pUpdateCounter;
  pStateCounter;
  pBlend;

  deconstruct() {
    if (windowExists(this.getWindowId())) {
      removeWindow(this.getWindowId());
    }
    return this.ancestor.deconstruct();
  }

  addWindows() {
    this.pWindowID = "go";
    this.pBlend = 100;
    if (windowExists(this.getWindowId())) {
      return 1;
    }
    createWindow(this.getWindowId(), "ig_ag_gameover.window");
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.moveTo(270, 200);
    tWndObj.lock();
    this.pStateCounter = 30;
    return 1;
  }

  update() {
    if (this.pBlend <= 0) {
      return 1;
    }
    this.pUpdateCounter = this.pUpdateCounter + 1;
    if (this.pUpdateCounter < 2) {
      return 1;
    }
    this.pUpdateCounter = 0;
    if (this.pStateCounter > 0) {
      this.pStateCounter = this.pStateCounter - 1;
      return 1;
    }
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    this.pBlend = this.pBlend - 15;
    const tElem = tWndObj.getElement("ig_gameover");
    tElem.setProperty(Symbol.for("blend"), this.pBlend);
    if (this.pBlend < 10) {
      if (windowExists(this.getWindowId())) {
        removeWindow(this.getWindowId());
      }
    }
    return 1;
  }
}
