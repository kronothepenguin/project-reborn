export default class {
  pEndTime;
  pUpdateCounter;
  pWindowHidden;

  update() {
    this.ancestor.update();
    this.pUpdateCounter = this.pUpdateCounter + 1;
    if (this.pUpdateCounter < 4) {
      return 1;
    }
    this.pUpdateCounter = 0;
    const tTimeLeft = this.getTimeLeft();
    if (tTimeLeft <= 0) {
      return 1;
    }
    if (tTimeLeft > 30) {
      return 1;
    } else {
      if (this.pWindowHidden) {
        this.pWindowHidden = 0;
        return this.ancestor.createWindows();
      }
    }
    if (this.pWindowList.count < 1) {
      return 0;
    }
    const tWndObj = getWindow(this.pWindowList[1]);
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_tip_title");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(this.getTitleText());
    return 1;
  }

  setTitleField(tWindowID, tMode) {
    const tWndObj = getWindow(tWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    let tLocY = tLocY + tWndObj.getProperty(Symbol.for("height"));
    const tElem = tWndObj.getElement("ig_tip_title");
    const tTitleText = this.getTitleText();
    if (tMode) {
      tWndObj.resizeTo((tTitleText.length * 8) + 19 + 15 + 6, tWndObj.getProperty(Symbol.for("height")));
    } else {
      tWndObj.resizeTo((tTitleText.length * 8) + 19 + 15 + 6, tWndObj.getProperty(Symbol.for("height")));
    }
    if (tElem != 0) {
      tElem.setText(tTitleText);
    }
    return 1;
  }

  showInfo(tWindowList, tdata, tMode) {
    if (tWindowList.count < 1) {
      return 1;
    }
    this.pWindowID = tWindowList[1];
    this.pEndTime = tdata;
    return 1;
  }

  getTitleText() {
    return replaceChunks(getText("ig_tip_time_to_join_x"), "\x", this.getFormatTime());
  }

  createWindows() {
    this.pEndTime = this.pData;
    if (this.getTimeLeft() > 30) {
      this.pWindowHidden = 1;
      return 1;
    } else {
      return this.ancestor.createWindows();
    }
  }

  getLayout(tMode) {
    let tLayout;
    if (tMode) {
      tLayout = list("ig_ag_tip_jointime_close.window");
    } else {
      tLayout = list("ig_ag_tip_jointime.window");
    }
    return tLayout;
  }

  getFormatTime() {
    const tTimeLeft = integer((this.pEndTime - the.milliSeconds) / 1000.0);
    if (tTimeLeft < 0) {
      return "0:00";
    }
    const tMinutes = tTimeLeft / 60;
    let tSeconds = tTimeLeft % 60;
    if (tSeconds < 10) {
      tSeconds = `0${tSeconds}`;
    }
    return `${tMinutes}:${tSeconds}`;
  }

  getTimeLeft() {
    const tTimeLeft = (this.pEndTime - the.milliSeconds) / 1000.0;
    if (tTimeLeft < 0) {
      return 0;
    }
    return tTimeLeft;
  }
}
