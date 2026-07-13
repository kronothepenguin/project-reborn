export default class {
  pWindowID;
  pElemIdList;
  pBounceOn;
  pOrigXList;
  pOrigYList;
  pOffset;
  pSpeed;
  pTimeOutID;

  construct() {
    this.pTimeOutID = `bouncer_timeout_${getUniqueID()}`;
    this.pOrigXList = propList();
    this.pOrigYList = propList();
    return 1;
  }

  deconstruct() {
    if (timeoutExists(this.pTimeOutID)) {
      removeTimeout(this.pTimeOutID);
    }
    return 1;
  }

  registerElement(tWindowID, tElemIdList) {
    if (!listp(tElemIdList)) {
      tElemIdList = list(tElemIdList);
    }
    if (!this.checkWindowAndElemExistence(tWindowID, tElemIdList)) {
      return 0;
    }
    this.pWindowID = tWindowID;
    this.pElemIdList = tElemIdList;
    const tWindowObj = getWindow(tWindowID);
    for (const tElemID of tElemIdList) {
      const tElem = tWindowObj.getElement(tElemID);
      this.pOrigXList.setaProp(tElemID, tElem.getProperty(Symbol.for("locX")));
      this.pOrigYList.setaProp(tElemID, tElem.getProperty(Symbol.for("locY")));
    }
    return 1;
  }

  checkWindowAndElemExistence(tWindowID, tElemIdList) {
    if (voidp(tWindowID) && voidp(tElemIdList)) {
      tWindowID = this.pWindowID;
      tElemIdList = this.pElemIdList;
    }
    if (!windowExists(tWindowID)) {
      return 0;
    }
    const tWndObj = getWindow(tWindowID);
    for (const tElemID of tElemIdList) {
      if (!tWndObj.elementExists(tElemID)) {
        return 0;
      }
    }
    return 1;
  }

  getState() {
    return this.pBounceOn || timeoutExists(this.pTimeOutID);
  }

  setBounce(tBounceOn) {
    if (!this.checkWindowAndElemExistence()) {
      this.pBounceOn = 0;
      return 0;
    }
    if (tBounceOn) {
      this.pBounceOn = 1;
      this.resetBounce();
      receiveUpdate(this.getID());
    } else {
      if (timeoutExists(this.pTimeOutID)) {
        removeTimeout(this.pTimeOutID);
      }
      this.pBounceOn = 0;
      this.resetPosition();
      removeUpdate(this.getID());
    }
    return 1;
  }

  resetBounce() {
    this.pBounceOn = 1;
    this.pOffset = 0;
    this.pSpeed = 6;
  }

  resetPosition() {
    if (!this.checkWindowAndElemExistence()) {
      return 0;
    }
    const tWndObj = getWindow(this.pWindowID);
    for (const tElemID of this.pElemIdList) {
      const tOrigX = this.pOrigXList[tElemID];
      const tOrigY = this.pOrigYList[tElemID];
      tWndObj.getElement(tElemID).moveTo(tOrigX, tOrigY);
    }
  }

  update() {
    if (!this.pBounceOn) {
      return 0;
    }
    if (!this.checkWindowAndElemExistence()) {
      return 0;
    }
    this.pSpeed = this.pSpeed - 1;
    this.pOffset = this.pOffset + this.pSpeed;
    if (this.pOffset <= 0) {
      this.pOffset = 0;
      this.pSpeed = abs(this.pSpeed);
      if (integer(this.pSpeed) == 0) {
        this.setBounce(0);
      }
    }
    for (const tElemID of this.pElemIdList) {
      const tElem = getWindow(this.pWindowID).getElement(tElemID);
      tElem.moveTo(this.pOrigXList[tElemID], this.pOrigYList[tElemID] - this.pOffset);
    }
    return 1;
  }
}
