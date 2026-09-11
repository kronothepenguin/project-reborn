export default class {
  pWindowID;
  pWindowList;
  pCloseTimer;
  pLocX;
  pLocY;
  pLocZ;
  pMaxModeZOffset;
  pFinalLocX;
  pLocStep;
  pmode;
  pcolor;
  pFlagType;
  pData;

  deconstruct() {
    this.removeWindows();
  }

  define(tID, tLocY, tlocz, tColor, tFlagType, tdata) {
    this.pLocY = tLocY;
    this.pWindowID = tID;
    this.pcolor = tColor;
    this.pFlagType = tFlagType;
    this.pData = tdata;
    this.pLocZ = tlocz;
    this.pLocX = 10;
    this.pMaxModeZOffset = 1000;
    this.pFinalLocX = 199;
    this.pLocStep = 1;
    this.pmode = 0;
    this.pWindowList = list();
    return 1;
  }

  toggle() {
    this.pCloseTimer = 0;
    if (this.pData == VOID) {
      return error(this, "This flag has no data to display!", Symbol.for("toggle"));
    }
    this.pmode = !this.pmode;
    this.createWindows();
    return 1;
  }

  open() {
    this.pCloseTimer = 0;
    if (this.pmode) {
      return 1;
    }
    return this.toggle();
  }

  close() {
    if (!this.pmode) {
      return 1;
    }
    return this.toggle();
  }

  dumpLocZ(tWndID) {
    const tWndObj = getWindow(tWndID);
    if (tWndObj == 0) {
      return 0;
    }
    put(`${tWndID} ${tWndObj.getProperty(Symbol.for("locZ"))}`);
    for (let i = 1; i <= tWndObj.pSpriteList.count; i++) {
      put("---", `${tWndObj.pSpriteList.getPropAt(i)} ${tWndObj.pSpriteList[i]} ${tWndObj.pSpriteList[i].locZ}`);
    }
  }

  update() {
    let tResult;
    if (this.pLocX != this.pFinalLocX) {
      const tDiff = this.pFinalLocX - this.pLocX;
      if (tDiff < 2) {
        this.pLocX = this.pFinalLocX;
      } else {
        this.pLocX = this.pLocX + (tDiff / 2);
      }
      this.moveTo(this.pLocX, this.pLocY);
      tResult = 1;
    }
    return tResult;
  }

  getState() {
    return this.pmode;
  }

  removeWindows() {
    if (this.pWindowList == VOID) {
      this.pWindowList = list();
    }
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    for (const tID of this.pWindowList) {
      tWrapObjRef.removeOneWindow(tID);
    }
    this.pWindowList = list();
  }

  createWindows() {
    this = getObject(this.getID());
    const tSetID = this.getSetId();
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    if (!tWrapObjRef.existsSet(tSetID)) {
      tWrapObjRef.createSet(tSetID, 2);
    }
    this.removeWindows();
    if (this.pWindowList == VOID) {
      this.pWindowList = list();
    }
    let tLocY = this.pLocY;
    const tLayoutList = this.getLayout(this.pmode);
    if (!listp(tLayoutList)) {
      return 0;
    }
    for (let i = 1; i <= tLayoutList.count; i++) {
      const tWindowID = `${this.getBasicId()}_${i}`;
      if (i == 1) {
        tWrapObjRef.addOneWindow(tWindowID, tLayoutList[i], tSetID, propList("locX", this.pLocX, "locY", tLocY));
      } else {
        tWrapObjRef.addOneWindow(tWindowID, tLayoutList[i], tSetID, propList("locX", this.pLocX + 10, "locY", tLocY));
      }
      const tWndObj = getWindow(tWindowID);
      if (tWndObj == 0) {
        return 0;
      }
      tLocY = tLocY + tWndObj.getProperty(Symbol.for("height"));
      this.setTitleField(tWindowID);
      this.setBackgroundColoring(tWindowID);
      this.pWindowList.append(tWindowID);
    }
    this.alignZ();
    this.showInfo(this.pWindowList, this.pData, this.pmode);
    return 1;
  }

  moveTo(tLocX, tLocY) {
    this.pLocX = tLocX;
    this.pLocY = tLocY;
    for (const tID of this.pWindowList) {
      const tWndObj = getWindow(tID);
      if (tWndObj == 0) {
        break;
      }
      tWndObj.moveTo(tLocX, tLocY);
      tLocY = tLocY + tWndObj.getProperty(Symbol.for("height"));
    }
    return 1;
  }

  alignZ(tlocz) {
    if (tlocz != VOID) {
      this.pLocZ = tlocz;
    }
    for (let i = 1; i <= this.pWindowList.count; i++) {
      const tWndObj = getWindow(this.pWindowList[i]);
      if (tWndObj == 0) {
        break;
      }
      tWndObj.moveZ(this.pLocZ + (this.pmode * this.pMaxModeZOffset));
    }
    return 1;
  }

  getSetId() {
    return `ig_fg_${this.getBasicId()}`;
  }

  getBasicId() {
    return this.pWindowID;
  }

  getLayout(tMode) {
  }

  showInfo(tWindowList, tdata, tMode) {
  }

  getTitleText() {
  }

  setTitleField(tWindowID) {
    const tWndObj = getWindow(tWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_tip_title");
    const tTitleText = getObject(this.getID()).getTitleText();
    if (this.pmode == 0) {
      const tWidth = 19 + 6 + integer(tTitleText.length * 8);
      tWndObj.resizeTo(tWidth, tWndObj.getProperty(Symbol.for("height")));
    }
    if (tElem != 0) {
      tElem.setText(tTitleText);
    }
    return 1;
  }

  setBackgroundColoring(tWindowID) {
    const tWndObj = getWindow(tWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (this.pcolor == VOID) {
      return 1;
    }
    if (!listp(this.pcolor)) {
      const tElem = tWndObj.getElement("ig_title_bg");
      if (tElem != 0) {
        tElem.setProperty(Symbol.for("bgColor"), this.pcolor);
      }
      return 1;
    }
    for (let i = 1; i <= this.pcolor.count; i++) {
      const tElemID = `ig_title_bg_${this.pcolor.getPropAt(i)}`;
      const tColor = this.pcolor[i];
      const tElem = tWndObj.getElement(tElemID);
      if (tElem != 0) {
        tElem.setProperty(Symbol.for("bgColor"), tColor);
      }
    }
    return 1;
  }

  dumpElements() {
    put("** UIFlag windows and elements:");
    if (this.pWindowList == VOID) {
      this.pWindowList = list();
    }
    for (const tID of this.pWindowList) {
      const tWndObj = getWindow(tID);
      put(`${tID} -->`, `${tWndObj.pElemList}`);
    }
  }

  getWindowWrapper() {
    return getObject(Symbol.for("ig_window_wrapper"));
  }
}
