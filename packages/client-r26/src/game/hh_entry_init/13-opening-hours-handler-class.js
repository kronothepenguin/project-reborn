export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handleAvailabilityStatus(tMsg) {
    let tIsOpen = tMsg.connection.GetIntFrom();
    let tShutDown = tMsg.connection.GetIntFrom();
    let tClosingState = 0;
    if (!tIsOpen) {
      if (tShutDown) {
        tClosingState = 1;
      } else {
        tClosingState = 2;
      }
    }
    this.getComponent().setHotelClosingStatus(tClosingState);
  }

  handleInfoHotelClosing(tMsg) {
    let tMinutesUntil = tMsg.connection.GetIntFrom();
    this.getInterface().showHotelClosingAlert(tMinutesUntil);
  }

  handleInfoHotelClosed(tMsg) {
    let tOpenHour = tMsg.connection.GetIntFrom();
    let tOpenMinute = tMsg.connection.GetIntFrom();
    let tDisconnect = tMsg.connection.GetIntFrom();
    if (tDisconnect) {
      this.getComponent().setHotelClosedDisconnect(tOpenHour, tOpenMinute);
    } else {
      this.getInterface().showHotelClosedNotice(tOpenHour, tOpenMinute);
    }
  }

  handleAvailabilityTime(tMsg) {
    let tIsOpen = tMsg.connection.GetIntFrom();
    let tTimeUntil = tMsg.connection.GetIntFrom();
    executeMessage(Symbol.for("hotelAvailabilityTime"), tIsOpen, tTimeUntil);
  }

  handleLoginFailedHotelClosed(tMsg) {
    let tOpenHour = tMsg.connection.GetIntFrom();
    let tOpenMinute = tMsg.connection.GetIntFrom();
    this.getComponent().setHotelClosedDisconnect(tOpenHour, tOpenMinute);
  }

  regMsgList(tBool) {
    let tMsgs = propList();
    tMsgs.setaProp(290, Symbol.for("handleAvailabilityStatus"));
    tMsgs.setaProp(291, Symbol.for("handleInfoHotelClosing"));
    tMsgs.setaProp(292, Symbol.for("handleInfoHotelClosed"));
    tMsgs.setaProp(293, Symbol.for("handleAvailabilityTime"));
    tMsgs.setaProp(294, Symbol.for("handleLoginFailedHotelClosed"));
    let tCmds = propList();
    tCmds.setaProp("GET_AVAILABILITY_TIME", 212);
    let tConn = getVariable("connection.info.id", Symbol.for("Info"));
    if (tBool) {
      registerListener(tConn, this.getID(), tMsgs);
      registerCommands(tConn, this.getID(), tCmds);
    } else {
      unregisterListener(tConn, this.getID(), tMsgs);
      unregisterCommands(tConn, this.getID(), tCmds);
    }
    return 1;
  }
}
