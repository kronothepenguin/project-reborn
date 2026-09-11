export default class {
  pWindowID;
  pTimeOutID;
  pActivateID;

  construct() {
    this.pWindowID = getUniqueID();
    this.pTimeOutID = getUniqueID();
    this.pActivateID = getUniqueID();
    registerMessage(Symbol.for("externalLinkClick"), this.getID(), Symbol.for("notifyExternalLinkClick"));
    return 1;
  }

  deconstruct() {
    this.removeTooltipWindow();
    this.removeWindowTimeout();
    this.removeActivateTimeout();
    unregisterMessage(Symbol.for("externalLinkClick"));
    return 1;
  }

  removeTooltipWindow() {
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
  }

  removeWindowTimeout() {
    if (timeoutExists(this.pTimeOutID)) {
      removeTimeout(this.pTimeOutID);
    }
  }

  createWindowTimeout() {
    this.removeWindowTimeout();
    const tTimeoutTime = integer(getVariable("external_link_win_timeout", 2000));
    createTimeout(this.pTimeOutID, tTimeoutTime, Symbol.for("removeTooltipWindow"), this.getID(), VOID, 1);
  }

  createActivateTimeout() {
    this.removeActivateTimeout();
    const tTimeoutTime = integer(getVariable("external_link_win_activate_timeout", 500));
    createTimeout(this.pActivateID, tTimeoutTime, Symbol.for("activateToolTip"), this.getID(), VOID, 1);
  }

  removeActivateTimeout() {
    if (timeoutExists(this.pActivateID)) {
      removeTimeout(this.pActivateID);
    }
  }

  activateToolTip() {
    const tWndObj = getWindow(this.pWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    activateWindowObj(this.pWindowID);
  }

  createTooltipWindow() {
    createWindow(this.pWindowID, "tooltip_external_link.window");
    const tWndObj = getWindow(this.pWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
  }

  notifyExternalLinkClick(tClickLocation) {
    if (voidp(tClickLocation)) {
      return 0;
    }
    if (ilk(tClickLocation) != Symbol.for("point")) {
      return 0;
    }
    if (!windowExists(this.pWindowID)) {
      this.createTooltipWindow();
    }
    const tWndObj = getWindow(this.pWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tWndWidth = tWndObj.getProperty(Symbol.for("width"));
    const tWndHeight = tWndObj.getProperty(Symbol.for("height"));
    const tMarginH = getVariable("external_link_win_offset_h");
    const tMarginV = getVariable("external_link_win_offset_v");
    const tScreenWidth = the.stageRight - the.stageLeft;
    let tOpenLocH = tClickLocation[1] + tMarginH;
    if ((tOpenLocH + tWndWidth) > tScreenWidth) {
      tOpenLocH = tClickLocation[1] - tMarginH - tWndWidth;
    }
    let tOpenLocV = tClickLocation[2] - tMarginV - tWndHeight;
    if ((tOpenLocV - tMarginV) < 0) {
      tOpenLocV = tClickLocation[2] + tMarginV;
    }
    tWndObj.moveTo(tOpenLocH, tOpenLocV);
    this.createWindowTimeout();
    this.createActivateTimeout();
  }

  eventProc(tEvent, tElemID, tParam) {
    const tWndObj = getWindow(this.pWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (tEvent == Symbol.for("mouseUp")) {
      this.removeTooltipWindow();
    }
  }
}
