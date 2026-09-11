export default class {
  pWindowID;
  pElemName;
  pScrollOn;
  pMaxOffset;
  pOffset;
  pSpeed;
  pDelayLeft;
  pDelay;

  construct() {
    this.pScrollOn = 0;
    this.pOffset = 0;
    this.pSpeed = 1;
    this.pDelay = 36;
    return 1;
  }

  deconstruct() {
    return 1;
  }

  registerElement(tWindowID, tElementName) {
    let tValidParams = this.checkWindowAndElemExistence(tWindowID, tElementName);
    if (!tValidParams) {
      return 0;
    }
    this.pWindowID = tWindowID;
    this.pElemName = tElementName;
    let tElem = getWindow(tWindowID).getElement(tElementName);
    let tImage = tElem.getProperty(Symbol.for("image"));
    if (tImage.ilk != Symbol.for("image")) {
      return 0;
    }
    this.pMaxOffset = tImage.width - tElem.getProperty(Symbol.for("width"));
    if (this.pMaxOffset < 0) {
      this.centerText();
    }
    return 1;
  }

  centerText() {
    if (!this.checkWindowAndElemExistence()) {
      return 0;
    }
    let tElem = getWindow(this.pWindowID).getElement(this.pElemName);
    tElem.adjustOffsetTo(this.pMaxOffset / 2, 0);
    return 1;
  }

  checkWindowAndElemExistence(tWindowID, tElementName) {
    if (voidp(tWindowID) && voidp(tElementName)) {
      tWindowID = this.pWindowID;
      tElementName = this.pElemName;
    }
    if (!windowExists(tWindowID)) {
      return 0;
    }
    let tWndObj = getWindow(tWindowID);
    if (!tWndObj.elementExists(tElementName)) {
      return 0;
    }
    return 1;
  }

  setScroll(tScrollOn) {
    if (!this.checkWindowAndElemExistence(this.pWindowID, this.pElemName)) {
      this.pScrollOn = 0;
      return 0;
    }
    if (tScrollOn) {
      if (this.pMaxOffset <= 0) {
        return 0;
      }
      this.pScrollOn = 1;
      this.resetScroll();
      receiveUpdate(this.getID());
    } else {
      this.pScrollOn = 0;
      removeUpdate(this.getID());
    }
    return 1;
  }

  resetScroll() {
    this.pDelayLeft = this.pDelay;
    this.pOffset = 0;
    this.pSpeed = 1;
  }

  update() {
    if (!this.pScrollOn) {
      return 0;
    }
    if (this.pMaxOffset < 0) {
      return 0;
    }
    if (this.pDelayLeft > 0) {
      this.pDelayLeft = this.pDelayLeft - 1;
      return 1;
    }
    if (!this.checkWindowAndElemExistence()) {
      return 0;
    }
    this.pOffset = this.pOffset + this.pSpeed;
    if ((this.pOffset >= this.pMaxOffset) || (this.pOffset <= 0)) {
      this.pSpeed = -this.pSpeed;
      this.pDelayLeft = this.pDelay;
    }
    let tElem = getWindow(this.pWindowID).getElement(this.pElemName);
    tElem.adjustOffsetTo(this.pOffset, 0);
    return 1;
  }
}
