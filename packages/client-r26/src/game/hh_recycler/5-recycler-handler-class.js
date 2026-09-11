export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handle_recycler_configuration(tMsg) {
    tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    tServiceEnabled = tConn.GetIntFrom();
    tQuarantineMinutes = tConn.GetIntFrom();
    tRecyclingMinutes = tConn.GetIntFrom();
    tMinutesToTimeout = tConn.GetIntFrom();
    tNumOfRewardItems = tConn.GetIntFrom();
    tRewardItems = list();
    for (let tNo = 1; tNo <= tNumOfRewardItems; tNo++) {
      tItem = propList();
      tItem[Symbol.for("furniValue")] = tConn.GetIntFrom();
      tItem[Symbol.for("type")] = tConn.GetIntFrom();
      switch (tItem[Symbol.for("type")]) {
        case 0:
          tItem[Symbol.for("class")] = tConn.GetStrFrom();
          tItem[Symbol.for("defaultDirection")] = tConn.GetIntFrom();
          tItem[Symbol.for("xDimension")] = tConn.GetIntFrom();
          tItem[Symbol.for("yDimension")] = tConn.GetIntFrom();
          tItem[Symbol.for("partColors")] = tConn.GetStrFrom();
          tItem[Symbol.for("name")] = getText(`furni_${tItem[Symbol.for("class")]}_name`);
          break;
        case 1:
          tItem[Symbol.for("class")] = tConn.GetStrFrom();
          tItem[Symbol.for("name")] = getText(`wallitem_${tItem[Symbol.for("class")]}_name`);
          break;
        case 2:
          tItem[Symbol.for("name")] = tConn.GetStrFrom();
          break;
      }
      tRewardItems.add(tItem);
    }
    tComponent = this.getComponent();
    tComponent.enableService(tServiceEnabled);
    tComponent.setRewardItems(tRewardItems);
    tComponent.setRecyclingTimes(tQuarantineMinutes, tRecyclingMinutes);
    tComponent.setRecyclingTimeout(tMinutesToTimeout);
  }

  handle_recycler_status(tMsg) {
    tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    tStatus = tConn.GetIntFrom();
    switch (tStatus) {
      case 0:
        tStatus = "open";
        break;
      case 1:
        tStatus = "progress";
        tRewardType = tConn.GetIntFrom();
        tFurniClass = tConn.GetStrFrom();
        tMinutesLeft = tConn.GetIntFrom();
        if (tRewardType == 0) {
          tRewardType = Symbol.for("roomItem");
        } else {
          tRewardType = Symbol.for("wallItem");
        }
        this.getComponent().setRewardProps(tRewardType, tFurniClass);
        this.getComponent().setTimeLeftProps(tMinutesLeft);
        tTimeoutTime = (tMinutesLeft + 1) * 60 * 1000;
        createTimeout("recycler_status_request", tTimeoutTime, Symbol.for("statusRequestTimeout"), this.getID(), VOID, 1);
        break;
      case 2:
        tStatus = "ready";
        tRewardType = tConn.GetIntFrom();
        tFurniClass = tConn.GetStrFrom();
        if (tRewardType == 0) {
          tRewardType = Symbol.for("roomItem");
        } else {
          tRewardType = Symbol.for("wallItem");
        }
        this.getComponent().setRewardProps(tRewardType, tFurniClass);
        break;
      case 3:
        tStatus = "timeout";
        break;
    }
    this.getComponent().openRecyclerWithState(tStatus);
  }

  handle_approve_recycling_result(tMsg) {
    tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    tResult = tConn.GetIntFrom();
    if (!tResult) {
      nothing();
    } else {
      this.getComponent().requestRecyclerState();
    }
  }

  handle_start_recycling_result(tMsg) {
    tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    tResult = tConn.GetIntFrom();
    if (!tResult) {
      nothing();
    } else {
      this.getComponent().requestRecyclerState();
    }
  }

  handle_confirm_recycling_result(tMsg) {
    tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    tResult = tConn.GetIntFrom();
    if (!tResult) {
      nothing();
    } else {
      this.getComponent().setStateTo("open");
    }
  }

  statusRequestTimeout() {
    this.getComponent().requestRecyclerState();
  }

  regMsgList(tBool) {
    tMsgs = propList();
    tMsgs.setaProp(303, Symbol.for("handle_recycler_configuration"));
    tMsgs.setaProp(304, Symbol.for("handle_recycler_status"));
    tMsgs.setaProp(305, Symbol.for("handle_approve_recycling_result"));
    tMsgs.setaProp(306, Symbol.for("handle_start_recycling_result"));
    tMsgs.setaProp(307, Symbol.for("handle_confirm_recycling_result"));
    tCmds = propList();
    tCmds.setaProp("GET_FURNI_RECYCLER_CONFIGURATION", 222);
    tCmds.setaProp("GET_FURNI_RECYCLER_STATUS", 223);
    tCmds.setaProp("APPROVE_RECYCLED_FURNI", 224);
    tCmds.setaProp("START_FURNI_RECYCLING", 225);
    tCmds.setaProp("CONFIRM_FURNI_RECYCLING", 226);
    if (tBool) {
      registerListener(getVariable("connection.room.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.room.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.room.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.room.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
