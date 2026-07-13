export default class {
  pHotelClosingStatus;
  pHotelClosedDisconnectStatus;

  construct() {
    this.pHotelClosingStatus = 0;
    this.pHotelClosedDisconnectStatus = 0;
    registerMessage(Symbol.for("getHotelClosingStatus"), this.getID(), Symbol.for("getHotelClosingStatus"));
    registerMessage(Symbol.for("getHotelClosedDisconnectStatus"), this.getID(), Symbol.for("getHotelClosedDisconnectStatus"));
    registerMessage(Symbol.for("getAvailabilityTime"), this.getID(), Symbol.for("sendGetAvailabilityTime"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("getHotelClosingStatus"), this.getID());
    unregisterMessage(Symbol.for("getOpeningHours"), this.getID());
    unregisterMessage(Symbol.for("getHotelClosedDisconnectStatus"), this.getID());
    return 1;
  }

  getHotelClosingStatus(tList) {
    let tValue = 0;
    if (this.pHotelClosingStatus == 1) {
      tValue = 1;
    }
    if (ilk(tList, Symbol.for("propList"))) {
      tList["retval"] = tValue;
      if (tValue && tList["showDialog"]) {
        this.getInterface().showHotelClosingNotice();
      }
    }
    return tValue;
  }

  getHotelAvailabilityStatus(tList) {
    let tValue = 1;
    if (this.pHotelClosingStatus == 2) {
      tValue = 0;
    }
    if (ilk(tList, Symbol.for("propList"))) {
      tList["retval"] = tValue;
    }
    return tValue;
  }

  getHotelClosedDisconnectStatus(tList) {
    let tValue = this.pHotelClosedDisconnectStatus;
    if (ilk(tList, Symbol.for("propList"))) {
      tList["retval"] = tValue;
    }
    return tValue;
  }

  setHotelClosingStatus(tStatus) {
    this.pHotelClosingStatus = tStatus;
  }

  sendGetAvailabilityTime() {
    getConnection(getVariable("connection.info.id")).send("GET_AVAILABILITY_TIME");
  }

  setHotelClosedDisconnect(tOpenHour, tOpenMinute) {
    this.pHotelClosingStatus = 2;
    this.pHotelClosedDisconnectStatus = 1;
    this.getInterface().showHotelClosedDisconnectNotice(tOpenHour, tOpenMinute);
  }
}
