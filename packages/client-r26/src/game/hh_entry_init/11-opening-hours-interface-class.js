export default class {
  pHotelClosingID;
  pLoginFailedID;

  construct() {
    this.pHotelClosingID = getText("opening_hours_title");
    this.pLoginFailedID = "opening_hours_login_failed";
    return 1;
  }

  deconstruct() {
    return this.hideAll();
  }

  hideAll() {
    this.hideHotelClosingAlert();
    this.hideHotelClosingNotice();
    this.hideHotelClosedNotice();
    this.hideHotelClosedDisconnectNotice();
    return 1;
  }

  showHotelClosingAlert(tTimeDelta) {
    if (!windowExists(this.pHotelClosingID)) {
      createWindow(this.pHotelClosingID, "habbo_basic.window", 0, 0, Symbol.for("modal"));
      let tWndObj = getWindow(this.pHotelClosingID);
      if (tWndObj == 0) {
        return 0;
      }
    } else {
      let tWndObj = getWindow(this.pHotelClosingID);
      tWndObj.unmerge();
    }
    let tWindow = "openhrs";
    if (!tWndObj.merge(`${tWindow}${".window"}`)) {
      return this.hideHotelClosingStatusAlert();
    }
    let tTextId = "opening_hours_text_shutdown";
    let tText = getText(tTextId);
    if (voidp(tTimeDelta)) {
      tText = replaceChunks(tText, "%d%", EMPTY);
    } else {
      tText = replaceChunks(tText, "%d%", string(tTimeDelta));
    }
    tWndObj.getElement("openhrs_txt").setText(tText);
    tWndObj.center();
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcStatus"), this.getID(), Symbol.for("mouseUp"));
  }

  showHotelClosingNotice() {
    if (!windowExists(this.pHotelClosingID)) {
      createWindow(this.pHotelClosingID, "habbo_basic.window", 0, 0, Symbol.for("modal"));
      let tWndObj = getWindow(this.pHotelClosingID);
      if (tWndObj == 0) {
        return 0;
      }
    } else {
      let tWndObj = getWindow(this.pHotelClosingID);
      tWndObj.unmerge();
    }
    if (!tWndObj.merge("openhrs.window")) {
      return this.hideHotelClosingNotice();
    }
    tWndObj.center();
    let tText = getText("opening_hours_text_disabled");
    tWndObj.getElement("openhrs_txt").setText(tText);
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcNotice"), this.getID(), Symbol.for("mouseUp"));
  }

  showHotelClosedDisconnectNotice(tOpenHour, tOpenMinute) {
    if (!windowExists(this.pLoginFailedID)) {
      createWindow(this.pLoginFailedID, "error.window", 0, 0, Symbol.for("modal"));
      let tWndObj = getWindow(this.pLoginFailedID);
      if (tWndObj == 0) {
        return 0;
      }
      tWndObj.center();
      let tText = getText("opening_hours_text_opening_time");
      let tHour = string(tOpenHour);
      if (tHour.length == 1) {
        tHour = `${"0"}${tHour}`;
      }
      let tMinute = string(tOpenMinute);
      if (tMinute.length == 1) {
        tMinute = `${"0"}${tMinute}`;
      }
      tText = replaceChunks(tText, "%h%", tHour);
      tText = replaceChunks(tText, "%m%", tMinute);
      tWndObj.getElement("error_title").setText(getText("Alert_ConnectionFailure"));
      tWndObj.getElement("error_text").setText(tText);
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcLoginFailed"), this.getID(), Symbol.for("mouseUp"));
    }
    return 1;
  }

  showHotelClosedNotice(tOpenHour, tOpenMinute) {
    if (!windowExists(this.pHotelClosingID)) {
      createWindow(this.pHotelClosingID, "habbo_basic.window", 0, 0, Symbol.for("modal"));
      let tWndObj = getWindow(this.pHotelClosingID);
      if (tWndObj == 0) {
        return 0;
      }
    } else {
      let tWndObj = getWindow(this.pHotelClosingID);
      tWndObj.unmerge();
    }
    if (!tWndObj.merge("openhrs.window")) {
      return this.hideHotelClosedNotice();
    }
    tWndObj.center();
    let tText = getText("opening_hours_text_closed");
    let tHour = string(tOpenHour);
    if (tHour.length == 1) {
      tHour = `${"0"}${tHour}`;
    }
    let tMinute = string(tOpenMinute);
    if (tMinute.length == 1) {
      tMinute = `${"0"}${tMinute}`;
    }
    tText = replaceChunks(tText, "%h%", tHour);
    tText = replaceChunks(tText, "%m%", tMinute);
    tWndObj.getElement("openhrs_txt").setText(tText);
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcClosed"), this.getID(), Symbol.for("mouseUp"));
  }

  hideHotelClosingAlert() {
    if (windowExists(this.pHotelClosingID)) {
      return removeWindow(this.pHotelClosingID);
    }
    return 0;
  }

  hideHotelClosingNotice() {
    if (windowExists(this.pHotelClosingID)) {
      return removeWindow(this.pHotelClosingID);
    }
    return 0;
  }

  hideHotelClosedDisconnectNotice() {
    if (windowExists(this.pLoginFailedID)) {
      return removeWindow(this.pLoginFailedID);
    }
    return 0;
  }

  hideHotelClosedNotice() {
    if (windowExists(this.pHotelClosingID)) {
      return removeWindow(this.pHotelClosingID);
    }
    return 0;
  }

  eventProcStatus(tEvent, tElemID, tParam) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "close":
          return this.hideHotelClosingAlert();
        case "openhrs_ok":
          return this.hideHotelClosingAlert();
        default:
          return 0;
      }
    }
    return 1;
  }

  eventProcNotice(tEvent, tElemID, tParam) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "close":
          return this.hideHotelClosingNotice();
        case "openhrs_ok":
          return this.hideHotelClosingNotice();
        default:
          return 0;
      }
    }
    return 1;
  }

  eventProcLoginFailed(tEvent, tElemID, tParam) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        default:
          return 0;
      }
    }
    return 1;
  }

  eventProcClosed(tEvent, tElemID, tParam) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "close":
          return this.hideHotelClosingNotice();
        case "openhrs_ok":
          return this.hideHotelClosingNotice();
        default:
          return 0;
      }
    }
    return 1;
  }
}
