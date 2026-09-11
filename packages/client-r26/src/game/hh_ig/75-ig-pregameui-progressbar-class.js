export default class {
  pBarHeight;
  pBarMaxWidth;
  pBarOrigX;
  pBarOrigY;
  pUpdateCounter;
  pCacheProgress;

  addWindows() {
    this.pWindowID = "pb";
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.moveTo(10, 10);
    tWrapObjRef.addOneWindow(this.getWindowId(), "ig_pg_loadbar.window", this.pWindowSetId);
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_loadbar");
    if (tElem == 0) {
      return 0;
    }
    this.pBarOrigX = tElem.getProperty(Symbol.for("locX"));
    this.pBarOrigY = tElem.getProperty(Symbol.for("locY"));
    this.pBarMaxWidth = tElem.getProperty(Symbol.for("width"));
    this.pBarHeight = tElem.getProperty(Symbol.for("height"));
    return 1;
  }

  render(tProgress) {
    if (voidp(tProgress)) {
      tProgress = 0;
    }
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_loadmask");
    if (tElem == 0) {
      return 0;
    }
    this.pCacheProgress = tProgress;
    const tNewWidth = integer(this.pBarMaxWidth * ((100 - tProgress) / 100.0));
    tElem.resizeTo(tNewWidth, tElem.getProperty(Symbol.for("height")));
    tElem.moveTo(this.pBarOrigX + (this.pBarMaxWidth - tNewWidth), this.pBarOrigY);
    return 1;
  }

  update() {
    this.pUpdateCounter = this.pUpdateCounter + 1;
    if ((this.pUpdateCounter % 5) > 0) {
      return 1;
    }
    if (this.pUpdateCounter >= 25) {
      this.pUpdateCounter = 0;
    }
    const tPhase = this.pUpdateCounter / 5;
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_loadbar");
    if (tElem == 0) {
      return 0;
    }
    const tMemNum = getmemnum(`ig_icon_loadbar_${tPhase}`);
    if (tMemNum == 0) {
      return 0;
    }
    tElem.setProperty(Symbol.for("member"), member(tMemNum));
    this.render(this.pCacheProgress);
    return 1;
  }
}
