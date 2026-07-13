export default class {
  pWndID;
  pTimerA;
  pTimerB;
  pFrames;
  pCurrMs;

  construct() {
    this.pWndID = "PerfTest";
    this.pTimerA = the.milliSeconds;
    this.pTimerB = the.milliSeconds;
    this.pFrames = 0;
    this.pCurrMs = 0;
    if (!createWindow(this.pWndID)) {
      return 0;
    }
    const tWndObj = getWindow(this.pWndID);
    tWndObj.merge("performance.window");
    tWndObj.center();
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.getElement("perf_per_frm").setEdit(0);
    tWndObj.getElement("perf_total").setEdit(0);
    tWndObj.getElement("close").setEdit(0);
    tWndObj.getElement("close").setText("x");
    return receiveUpdate(this.getID());
  }

  deconstruct() {
    removeUpdate(this.getID());
    removeWindow(this.pWndID);
    return 1;
  }

  update() {
    this.pFrames = (this.pFrames + 1) % the.frameTempo;
    const tTime = the.milliSeconds - this.pTimerA;
    const tWndObj = getWindow(this.pWndID);
    tWndObj.getElement("perf_per_frm").setText(`${tTime} ms.`);
    if (this.pFrames == 0) {
      const tCurrMs = the.milliSeconds - this.pTimerB;
      if (tCurrMs != this.pCurrMs) {
        this.pCurrMs = tCurrMs;
        tWndObj.getElement("perf_total").setText(`${this.pCurrMs} ms.`);
      }
      this.pTimerB = the.milliSeconds;
    }
    this.pTimerA = the.milliSeconds;
  }

  eventProc(tEvent, tElemID, tParam) {
    if (tElemID == "close") {
      return removeObject(this.getID());
    } else {
      return 0;
    }
  }
}
