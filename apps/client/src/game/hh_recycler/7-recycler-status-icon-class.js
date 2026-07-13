export default class {
  pRecyclerButtonSpr;
  pButtonLoc;
  pNormalMem;
  pHighlightMem;
  pSkippedFrames;
  pFLashOn;
  pStatusWindowID;

  construct() {
    pRecyclerButtonSpr = VOID;
    pButtonLoc = point(40, 5);
    pNormalMem = member(getmemnum(getVariableValue("recycler.status.icon.normal")));
    pHighlightMem = member(getmemnum(getVariableValue("recycler.status.icon.highlight")));
    pStatusWindowID = getText("recycler_status_window_title");
  }

  deconstruct() {
    removePrepare(this.getID());
    if (ilk(pRecyclerButtonSpr) == Symbol.for("sprite")) {
      pRecyclerButtonSpr.visible = 0;
    }
    pRecyclerButtonSpr = VOID;
  }

  showRecyclerButton(tstate) {
    if (voidp(tstate)) {
      tstate = "normal";
    }
    if (pRecyclerButtonSpr.ilk != Symbol.for("sprite")) {
      pRecyclerButtonSpr = sprite(reserveSprite(this.getID()));
      if (pRecyclerButtonSpr == sprite(0)) {
        return 0;
      }
    }
    pRecyclerButtonSpr.member = pNormalMem;
    pRecyclerButtonSpr.ink = 8;
    pRecyclerButtonSpr.loc = pButtonLoc;
    pRecyclerButtonSpr.locZ = 200000000;
    pRecyclerButtonSpr.visible = 1;
    setEventBroker(pRecyclerButtonSpr.spriteNum, `${this.getID()}_spr`);
    pRecyclerButtonSpr.registerProcedure(Symbol.for("eventProcRecyclerButton"), this.getID(), Symbol.for("mouseUp"));
    pRecyclerButtonSpr.setcursor("cursor.finger");
    if (tstate == "highlight") {
      this.setFlashing(1);
    } else {
      this.setFlashing(0);
    }
    return 1;
  }

  hideRecyclerButton() {
    if (pRecyclerButtonSpr.ilk != Symbol.for("sprite")) {
      return 0;
    }
    pRecyclerButtonSpr.visible = 0;
  }

  setFlashing(tFlashingOn) {
    if (voidp(tFlashingOn)) {
      tFlashingOn = 0;
    }
    if (tFlashingOn) {
      receivePrepare(this.getID());
    } else {
      removePrepare(this.getID());
      if (pRecyclerButtonSpr.ilk == Symbol.for("sprite")) {
        pRecyclerButtonSpr.member = pNormalMem;
      }
    }
  }

  openCloseStatusWindow() {
    if (windowExists(pStatusWindowID)) {
      this.closeStatusWindow();
    } else {
      this.createStatusWindow();
    }
  }

  eventProcRecyclerButton(tEvent, tSprID, tProp) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "recycler_note_ok":
        case "rec_status_icon_spr":
          this.openCloseStatusWindow();
          break;
      }
    }
  }

  createStatusWindow() {
    if (!createWindow(pStatusWindowID, "habbo_full.window")) {
      return error(this, "Failed to create status window", Symbol.for("createStatusWindow"), Symbol.for("major"));
    }
    tWindowObj = getWindow(pStatusWindowID);
    tWindowObj.merge("recycler_notification.window");
    tWindowObj.registerProcedure(Symbol.for("eventProcRecyclerButton"), this.getID(), Symbol.for("mouseUp"));
  }

  closeStatusWindow() {
    removeWindow(pStatusWindowID);
  }

  prepare() {
    pSkippedFrames = pSkippedFrames - 1;
    if (pSkippedFrames < 0) {
      pSkippedFrames = 15;
    } else {
      return 0;
    }
    if (pFLashOn) {
      pRecyclerButtonSpr.member = pNormalMem;
      pFLashOn = 0;
    } else {
      pRecyclerButtonSpr.member = pHighlightMem;
      pFLashOn = 1;
    }
  }
}
