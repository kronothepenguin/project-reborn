export default class {
  pUpdateCounter;
  pCurrentIndex;
  pState;

  deconstruct() {
    if (windowExists(this.getWindowId())) {
      removeWindow(this.getWindowId());
    }
    return this.ancestor.deconstruct();
  }

  addWindows() {
    const tTimeLeftSec = this.getTimeLeftSec();
    if ((tTimeLeftSec <= 0) || (tTimeLeftSec > 5)) {
      return 0;
    }
    if (this.pState) {
      return 0;
    }
    this.pState = 1;
    this.pWindowID = "cd";
    const tService = this.getIGComponent("PreGame");
    if (tService == 0) {
      return 0;
    }
    const tGameRef = tService.getJoinedGame();
    if (tGameRef == 0) {
      return 0;
    }
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    createWindow(this.getWindowId(), "ig_pg_countdown.window");
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.moveTo(370, 200);
    return 1;
  }

  render() {
    this.pUpdateCounter = this.pUpdateCounter + 1;
    if ((this.pState < 2) && (this.pUpdateCounter < 4)) {
      return 1;
    }
    if ((this.pState >= 2) && (this.pUpdateCounter < 2)) {
      return 1;
    }
    this.pUpdateCounter = 0;
    if (!this.pState) {
      if (!this.addWindows()) {
        return 1;
      }
    }
    const tTimeLeftSec = this.getTimeLeftSec();
    if (tTimeLeftSec > 6) {
      return 1;
    }
    let tIndex;
    if (tTimeLeftSec > 0) {
      tIndex = 5 - tTimeLeftSec;
    } else {
      tIndex = this.pState + 4;
      this.pState = this.pState + 1;
    }
    if (tIndex == this.pCurrentIndex) {
      return 1;
    }
    this.pCurrentIndex = tIndex;
    if (tTimeLeftSec == 4) {
      playSound("ig-countdown");
    }
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElement = tWndObj.getElement("ig_countdown");
    if (tElement == 0) {
      return 0;
    }
    const tMemNum = getmemnum(`ig_countdown_${tIndex}`);
    if (tMemNum == 0) {
      if (windowExists(this.getWindowId())) {
        removeWindow(this.getWindowId());
      }
      this.pUpdateCounter = -1000;
      return 1;
    }
    tElement.setProperty(Symbol.for("member"), member(tMemNum));
    return 1;
  }

  getTimeLeftSec() {
    const tService = this.getIGComponent("PreGame");
    if (tService == 0) {
      return 0;
    }
    const tGameRef = tService.getJoinedGame();
    if (tGameRef == 0) {
      return 0;
    }
    const tTimeLeftSec = integer((tService.getMsecAtNextState() - the.milliSeconds) / 1000);
    if (tTimeLeftSec < 0) {
      return 0;
    }
    return tTimeLeftSec;
  }
}
