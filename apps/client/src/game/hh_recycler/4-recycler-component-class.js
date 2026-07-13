export default class {
  pServiceEnabled;
  pRecyclerState;
  pGiveFurniPool;
  pGetFurniPool;
  pRewardProps;
  pREwardItems;
  pTimeProps;
  pQuarantineMinutes;
  pRecyclingMinutes;
  pIsVisible;
  pRecyclingTimeoutMinutes;
  pOpeningRequestPending;

  construct() {
    pIsVisible = 0;
    pRecyclerState = VOID;
    pGiveFurniPool = list();
    pGetFurniPool = propList();
    pRewardProps = propList();
    pTimeProps = propList();
    pREwardItems = propList();
    pServiceEnabled = 0;
    pOpeningRequestPending = 0;
    pRecyclingTimeoutMinutes = 0;
    registerMessage(Symbol.for("userloggedin"), this.getID(), Symbol.for("Initialize"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("userloggedin"), this.getID());
    if (objectExists(Symbol.for("recyclingFinished"))) {
      removeTimeout(Symbol.for("recyclingFinished"));
    }
    return 1;
  }

  Initialize() {
    tConn = getConnection(getVariableValue("connection.info.id"));
    tConn.send("GET_FURNI_RECYCLER_CONFIGURATION");
    this.requestRecyclerState();
  }

  enableService(tEnabled) {
    if (tEnabled) {
      pServiceEnabled = 1;
    } else {
      pServiceEnabled = 0;
    }
  }

  requestRecyclerState() {
    tConn = getConnection(getVariableValue("connection.info.id"));
    tConn.send("GET_FURNI_RECYCLER_STATUS");
  }

  openRecycler() {
    pOpeningRequestPending = 1;
    this.requestRecyclerState();
  }

  openRecyclerWithState(tstate) {
    if (pOpeningRequestPending == 1) {
      pIsVisible = 1;
      pOpeningRequestPending = 0;
    }
    this.setStateTo(tstate);
  }

  closeRecycler() {
    pIsVisible = 0;
    pOpeningRequestPending = 0;
    if (threadExists(Symbol.for("room"))) {
      tRoomInterface = getThread(Symbol.for("room")).getInterface();
      tContainer = tRoomInterface.getContainer();
      pGiveFurniPool = list();
      this.getInterface().setHostWindowObject(VOID);
      this.clearObjectMover();
      tContainer.Refresh();
    }
  }

  startRecycling() {
    tSafeTrader = getThread(Symbol.for("room")).getInterface().getSafeTrader();
    if (!voidp(tSafeTrader)) {
      if (tSafeTrader.getState() == Symbol.for("open")) {
        executeMessage(Symbol.for("alert"), propList("Msg", getText("recycler_trader_open_alert"), "modal", 1));
        return 0;
      }
    }
    tRoomItemIds = list();
    tWallItemIds = list();
    tTargetItem = this.getRewardItemForCurrentAmount();
    if (voidp(tTargetItem) || (ilk(tTargetItem) != Symbol.for("propList"))) {
      return 0;
    }
    tGiveAmount = tTargetItem[Symbol.for("furniValue")];
    if (tGiveAmount > pGiveFurniPool.count) {
      return 0;
    }
    for (let tIndexNo = 1; tIndexNo <= tGiveAmount; tIndexNo++) {
      tItem = pGiveFurniPool[tIndexNo];
      if (tItem[Symbol.for("props")][Symbol.for("type")] == "active") {
        tRoomItemIds.add(integer(tItem[Symbol.for("props")][Symbol.for("id")]));
        continue;
      }
      tWallItemIds.add(integer(tItem[Symbol.for("props")][Symbol.for("id")]));
    }
    tParams = propList();
    tParams.addProp(Symbol.for("integer"), tRoomItemIds.count);
    for (const tItem of tRoomItemIds) {
      tParams.addProp(Symbol.for("integer"), tItem);
    }
    tParams.addProp(Symbol.for("integer"), tWallItemIds.count);
    for (const tItem of tWallItemIds) {
      tParams.addProp(Symbol.for("integer"), tItem);
    }
    getConnection(getVariable("connection.info.id")).send("START_FURNI_RECYCLING", tParams);
  }

  acceptRecycling() {
    tConn = getConnection(getVariable("connection.info.id"));
    if (pRecyclerState == "progress") {
      tConn.send("APPROVE_RECYCLED_FURNI", propList("integer", 1));
    } else {
      tConn.send("CONFIRM_FURNI_RECYCLING", propList("integer", 1));
    }
  }

  cancelRecycling() {
    tConn = getConnection(getVariable("connection.info.id"));
    if (pRecyclerState == "progress") {
      tConn.send("CONFIRM_FURNI_RECYCLING", propList("integer", 0));
    } else {
      if (pRecyclerState == "ready") {
        tConn.send("CONFIRM_FURNI_RECYCLING", propList("integer", 0));
      } else {
        if (pRecyclerState == "timeout") {
          tConn.send("CONFIRM_FURNI_RECYCLING", propList("integer", 0));
        }
      }
    }
    this.clearObjectMover();
  }

  clearObjectMover() {
    tRoomInterface = getThread(Symbol.for("room")).getInterface();
    tObjMover = tRoomInterface.getObjectMover();
    if (!voidp(tObjMover)) {
      tObjMover.clear();
    }
    tRoomInterface.setProperty(Symbol.for("clickAction"), "moveHuman");
  }

  isRecyclerOpenAndVisible() {
    return (pRecyclerState == "open") && pIsVisible;
  }

  getGiveFurniPool() {
    return pGiveFurniPool;
  }

  getState() {
    return pRecyclerState;
  }

  removeFurniFromGivePool(tGiveFurniIndex) {
    if (pGiveFurniPool.count >= tGiveFurniIndex) {
      pGiveFurniPool.deleteAt(tGiveFurniIndex);
    }
  }

  setRewardProps(tObjectType, tFurniClass) {
    pRewardProps[Symbol.for("objectType")] = tObjectType;
    pRewardProps[Symbol.for("class")] = tFurniClass;
    if (tObjectType == Symbol.for("roomItem")) {
      tNameLocalizationKey = `furni_${tFurniClass}_name`;
    } else {
      tNameLocalizationKey = `wallitem_${tFurniClass}_name`;
    }
    pRewardProps[Symbol.for("name")] = getText(tNameLocalizationKey);
  }

  getRewardProps(tProp) {
    switch (tProp) {
      case Symbol.for("name"):
        return pRewardProps[Symbol.for("name")];
      case Symbol.for("type"):
        return pRewardProps[Symbol.for("objectType")];
      case Symbol.for("class"):
        return pRewardProps[Symbol.for("class")];
      default:
        return VOID;
    }
  }

  setRewardItems(tItemList) {
    pREwardItems = tItemList;
  }

  getRewardItemForCurrentAmount() {
    tAmount = pGiveFurniPool.count;
    tRewardItem = VOID;
    tFurniValue = 0;
    for (let tNo = 1; tNo <= pREwardItems.count; tNo++) {
      tItem = pREwardItems[tNo];
      if (tItem[Symbol.for("furniValue")] == tAmount) {
        return tItem;
        continue;
      }
      if ((tItem[Symbol.for("furniValue")] > tFurniValue) && (tItem[Symbol.for("furniValue")] < tAmount)) {
        tFurniValue = tItem[Symbol.for("furniValue")];
        tRewardItem = tItem;
      }
    }
    return tRewardItem;
  }

  getNextRewardItemForCurrentAmount() {
    tAmount = pGiveFurniPool.count;
    tNextItem = VOID;
    tDifferenceToNext = 1000000;
    for (let tNo = 1; tNo <= pREwardItems.count; tNo++) {
      tItem = pREwardItems[tNo];
      if (tItem[Symbol.for("furniValue")] > tAmount) {
        if ((tItem[Symbol.for("furniValue")] - tAmount) < tDifferenceToNext) {
          tNextItem = tItem;
          tDifferenceToNext = tItem[Symbol.for("furniValue")] - tAmount;
        }
      }
    }
    return tNextItem;
  }

  setRecyclingTimes(tQuarantineMinutes, tRecyclingMinutes) {
    pQuarantineMinutes = tQuarantineMinutes;
    pRecyclingMinutes = tRecyclingMinutes;
  }

  setRecyclingTimeout(tMinutesToTimeout) {
    pRecyclingTimeoutMinutes = tMinutesToTimeout;
  }

  getQuarantineMinutes() {
    return pQuarantineMinutes;
  }

  getRecyclingMinutes() {
    return pRecyclingMinutes;
  }

  setTimeLeftProps(tMinutesLeft) {
    pTimeProps[Symbol.for("minutesLeft")] = tMinutesLeft;
    pTimeProps[Symbol.for("timeStamp")] = the.milliSeconds;
  }

  getMinutesLeftToRecycle() {
    if (ilk(pTimeProps) != Symbol.for("propList")) {
      return VOID;
    }
    tMillisSinceStarted = the.milliSeconds - pTimeProps[Symbol.for("timeStamp")];
    tMinutesSinceStarted = tMillisSinceStarted / 1000 / 60;
    tMinutesLeft = pTimeProps[Symbol.for("minutesLeft")] - tMinutesSinceStarted;
    if (tMinutesLeft < 0) {
      tMinutesLeft = 0;
    }
    return tMinutesLeft;
  }

  addFurnitureToGivePool(tClass, tID, tProps) {
    if (this.isFurniInRecycler(tID)) {
      return 0;
    }
    pGiveFurniPool.add(propList("class", tClass, "id", tID, "props", tProps));
  }

  isFurniInRecycler(tStripID) {
    if ((pRecyclerState != "open") || (pGiveFurniPool.count == 0)) {
      return 0;
    }
    for (let tNo = 1; tNo <= pGiveFurniPool.count; tNo++) {
      if (pGiveFurniPool[tNo][Symbol.for("props")][Symbol.for("stripId")] == tStripID) {
        return 1;
      }
    }
    return 0;
  }

  setStateTo(tstate) {
    pRecyclerState = tstate;
    pStateRequestPending = 0;
    if (!threadExists(Symbol.for("room"))) {
      return 0;
    }
    tRoomInterface = getThread(Symbol.for("room")).getInterface();
    tObjMover = tRoomInterface.getObjectMover();
    switch (tstate) {
      case "open":
        if (!pServiceEnabled) {
          return this.setStateTo("disabled");
        }
        pGiveFurniPool = list();
        pGetFurniPool = propList();
        tRoomInterface.cancelObjectMover();
        tRoomInterface.setProperty(Symbol.for("clickAction"), "tradeItem");
        if (tObjMover != 0) {
          tObjMover.moveTrade();
        }
        break;
      case "progress":
        this.clearObjectMover();
        break;
      case "ready":
        this.clearObjectMover();
        break;
      case "disabled":
        this.clearObjectMover();
        break;
      case "timeout":
        this.clearObjectMover();
        break;
      default:
        this.clearObjectMover();
        break;
    }
    executeMessage(Symbol.for("recyclerStateChange"));
    this.getInterface().setViewToState(tstate);
  }
}
