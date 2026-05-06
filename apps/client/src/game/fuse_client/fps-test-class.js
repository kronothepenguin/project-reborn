import { _global, VOID } from "../../director";

export default function () {
  let tWndObj, tTime, tCurrMs;

  return {
    pWndID: VOID,
    pTimerA: VOID,
    pTimerB: VOID,
    pFrames: VOID,
    pCurrMs: VOID,

    construct() {
      this.pWndID = "PerfTest";
      this.pTimerA = the.milliSeconds;
      this.pTimerB = the.milliSeconds;
      this.pFrames = 0;
      this.pCurrMs = 0;
      if (!_director.createWindow(this.pWndID)) {
        return 0;
      }
      tWndObj = _director.getWindow(this.pWndID);
      tWndObj.merge("performance.window");
      tWndObj.center();
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
      tWndObj.getElement("perf_per_frm").setEdit(0);
      tWndObj.getElement("perf_total").setEdit(0);
      tWndObj.getElement("close").setEdit(0);
      tWndObj.getElement("close").setText("x");
      return _director.receiveUpdate(this.getID());
    },

    deconstruct() {
      _director.removeUpdate(this.getID());
      _director.removeWindow(this.pWndID);
      return 1;
    },

    update() {
      this.pFrames = (this.pFrames + 1) % the.frameTempo;
      tTime = the.milliSeconds - this.pTimerA;
      tWndObj = _director.getWindow(this.pWndID);
      tWndObj.getElement("perf_per_frm").setText(tTime + " ms.");
      if (this.pFrames === 0) {
        tCurrMs = the.milliSeconds - this.pTimerB;
        if (tCurrMs !== this.pCurrMs) {
          this.pCurrMs = tCurrMs;
          tWndObj.getElement("perf_total").setText(this.pCurrMs + " ms.");
        }
        this.pTimerB = the.milliSeconds;
      }
      this.pTimerA = the.milliSeconds;
    },

    eventProc(tEvent, tElemID, tParam) {
      if (tElemID === "close") {
        return _director.removeObject(this.getID());
      } else {
        return 0;
      }
    },
  };
}
