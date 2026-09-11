export default class {
  pWindowID;
  pElementID;
  pBlockTime;
  pUpdateTimer;

  Init(tWindowID, tElementId, tBlockTime) {
    this.pWindowID = tWindowID;
    this.pElementID = tElementId;
    this.pBlockTime = the.milliSeconds + tBlockTime;
    this.pUpdateTimer = the.milliSeconds - 999;
    let tWndObj = getWindow(this.pWindowID);
    if (tWndObj == 0) {
      return removeObject(this.getID());
    }
    let tElem = tWndObj.getElement(this.pElementID);
    if (tElem == 0) {
      return removeObject(this.getID());
    }
    tElem.setEdit(0);
    receiveUpdate(this.getID());
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    return 1;
  }

  update() {
    if (this.pUpdateTimer > the.milliSeconds) {
      return;
    } else {
      this.pUpdateTimer = the.milliSeconds + 1000;
    }
    let tWndObj = getWindow(this.pWindowID);
    if (tWndObj == 0) {
      return removeObject(this.getID());
    }
    let tElem = tWndObj.getElement(this.pElementID);
    if (tElem == 0) {
      return removeObject(this.getID());
    }
    if (the.milliSeconds < this.pBlockTime) {
      let tText = getText("floodblocking", "YOU TYPE TOO FAST! YOU MUST WAIT A MOMENT");
      tElem.setText(`${tText} ${(this.pBlockTime - the.milliSeconds) / 1000}`);
    } else {
      tElem.setText(EMPTY);
      tElem.setEdit(1);
      removeObject(this.getID());
    }
  }
}
