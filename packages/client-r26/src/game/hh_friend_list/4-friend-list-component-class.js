export default class {
  pFriendDataContainer;
  pFriendRequestContainer;
  pUpdateIntervalId;
  pReadyFlag;
  pNewMail;
  pHabboSearchResults;
  pHabboSearchLastString;
  pSentFriendRequests;

  construct() {
    let tStamp = EMPTY;
    for (let tNo = 1; tNo <= 100; tNo++) {
      const tChar = numToChar(random(48) + 74);
      tStamp = `${tStamp}${tChar}`;
    }
    const tFuseReceipt = getSpecialServices().getReceipt(tStamp);
    const tReceipt = list();
    for (let tCharNo = 1; tCharNo <= tStamp.length; tCharNo++) {
      let tChar = chars(tStamp, tCharNo, tCharNo);
      tChar = charToNum(tChar);
      tChar = (tChar * tCharNo) + 309203;
      tReceipt[tCharNo] = tChar;
    }
    if (tReceipt != tFuseReceipt) {
      error(this, "Invalid build structure", Symbol.for("checkDataLoaded"), Symbol.for("critical"));
      return 0;
    }
    this.pUpdateIntervalId = getUniqueID();
    this.pFriendDataContainer = createObject(getUniqueID(), "Friend List Container");
    this.pFriendRequestContainer = createObject(getUniqueID(), "Friend Request List Container");
    this.pReadyFlag = 0;
    this.pNewMail = 0;
    this.pHabboSearchResults = [Symbol.for("friends"): propList(), Symbol.for("habbos"): propList()];
    this.pHabboSearchLastString = EMPTY;
    this.pSentFriendRequests = list();
    registerMessage(Symbol.for("externalFriendRequest"), this.getID(), Symbol.for("externalFriendRequest"));
    return 1;
  }

  deconstruct() {
    if (timeoutExists(this.pUpdateIntervalId)) {
      removeTimeout(this.pUpdateIntervalId);
    }
    unregisterMessage(Symbol.for("externalFriendRequest"));
    this.pFriendDataContainer.deconstruct();
    this.pFriendRequestContainer.deconstruct();
    return 1;
  }

  setFriendListInited() {
    const tInterval = getVariable("fr.update.interval");
    createTimeout(this.pUpdateIntervalId, tInterval, Symbol.for("requestFriendListUpdate"), this.getID(), VOID, 0);
    executeMessage(Symbol.for("friendListReady"));
    this.pReadyFlag = 1;
  }

  isFriendListInited() {
    return this.pReadyFlag;
  }

  populateCategoryData(tdata) {
    this.pFriendDataContainer.populateCategoryData(tdata);
    this.getInterface().changeCategory(VOID);
  }

  populateFriendData(tdata) {
    this.pFriendDataContainer.populateFriendData(tdata);
  }

  addFriend(tFriendData) {
    if (listp(tFriendData)) {
      this.pSentFriendRequests.deleteOne(tFriendData.getaProp(Symbol.for("name")));
    }
    this.pFriendDataContainer.addFriend(tFriendData);
    this.getInterface().addFriend(tFriendData);
  }

  updateFriend(tFriendData, tHoldRender) {
    if (ilk(tFriendData) != Symbol.for("propList")) {
      return 0;
    }
    let tOldFriendData = this.pFriendDataContainer.getFriendByID(tFriendData[Symbol.for("id")]);
    if (ilk(tOldFriendData) != Symbol.for("propList")) {
      tOldFriendData = propList();
    }
    this.pSentFriendRequests.deleteOne(tFriendData.getaProp(Symbol.for("name")));
    if (tOldFriendData[Symbol.for("categoryId")] != tFriendData[Symbol.for("categoryId")]) {
      this.getInterface().removeFriend(tOldFriendData[Symbol.for("id")], tOldFriendData[Symbol.for("categoryId")]);
      this.pFriendDataContainer.updateFriend(tFriendData);
      tFriendData = this.pFriendDataContainer.getFriendByID(tFriendData[Symbol.for("id")]);
      if (tFriendData == 0) {
        return 0;
      }
      this.getInterface().addFriend(tFriendData, tHoldRender);
    } else {
      this.pFriendDataContainer.updateFriend(tFriendData);
      tFriendData = this.pFriendDataContainer.getFriendByID(tFriendData[Symbol.for("id")]);
      if (tFriendData == 0) {
        return 0;
      }
      this.getInterface().updateFriend(tFriendData, tHoldRender);
    }
    executeMessage(Symbol.for("friendDataUpdated"), tFriendData[Symbol.for("id")]);
  }

  removeFriend(tFriendID) {
    const tFriendData = this.getFriendByID(tFriendID);
    if (tFriendData == 0) {
      return 0;
    }
    const tCategoryId = tFriendData[Symbol.for("categoryId")];
    this.pFriendDataContainer.removeFriend(tFriendID);
    this.getInterface().removeFriend(tFriendID, tCategoryId);
  }

  addFriendRequest(tRequestData) {
    this.pFriendRequestContainer.addRequest(tRequestData);
    this.getInterface().addFriendRequest(tRequestData);
  }

  setUnreadMailCount(tCount) {
    if (tCount > 0) {
      this.pNewMail = 1;
      this.getInterface().activateMailIcon(1);
      this.getInterface().startInboxBlink();
    } else {
      this.pNewMail = 0;
      this.getInterface().activateMailIcon(0);
      this.getInterface().endInboxBlink();
    }
    this.updateFriendListIconStatus();
  }

  newMailFrom(tUserID) {
    this.pNewMail = 1;
    this.updateFriendListIconStatus();
    this.getInterface().activateMailIcon(1);
    const tSoundMemName = getVariable("fr.new.mail.sound");
    playSound(tSoundMemName, Symbol.for("cut"), [Symbol.for("loopCount"): 1, Symbol.for("infiniteloop"): 0, Symbol.for("volume"): 255]);
    this.getInterface().startInboxBlink();
  }

  notifyFriendRequests() {
    const tPendingList = this.getPendingFriendRequests();
    const tPendingCount = tPendingList.count;
    executeMessage(Symbol.for("updateFriendRequestCount"), tPendingCount);
    if (tPendingCount > 0) {
      this.getInterface().setCategoryHighlight(-2);
    } else {
      this.getInterface().removeCategoryHighlight(-2);
    }
    this.updateFriendListIconStatus();
  }

  updateFriendListIconStatus() {
    let tActive = 0;
    const tFrList = this.getPendingFriendRequests();
    if (ilk(tFrList) == Symbol.for("propList")) {
      const tFrCount = tFrList.count;
      if (tFrCount > 0) {
        tActive = 1;
      }
    }
    if (this.pNewMail == 1) {
      tActive = 1;
    }
    executeMessage(Symbol.for("updateFriendListIcon"), tActive);
  }

  setFriendLimits(tUserLimit, tNormalLimit, tExtendedLimit) {
    this.pFriendDataContainer.setListLimit(tUserLimit);
  }

  isFriendListFull() {
    return this.pFriendDataContainer.isListFull();
  }

  updateFriendRequest(tRequestData, tstate) {
    if (!(ilk(tRequestData) == Symbol.for("propList"))) {
      return 0;
    }
    switch (tstate) {
      case Symbol.for("rejected"):
        {
          const tMsg = [Symbol.for("integer"): 0, Symbol.for("integer"): 1, Symbol.for("integer"): integer(tRequestData[Symbol.for("id")])];
          const tConn = getConnection(getVariable("connection.info.id"));
          tConn.send("FRIENDLIST_DECLINEFRIEND", tMsg);
          break;
        }
      case Symbol.for("accepted"):
        {
          const tMsg = [Symbol.for("integer"): 1, Symbol.for("integer"): integer(tRequestData[Symbol.for("id")])];
          const tConn = getConnection(getVariable("connection.info.id"));
          tConn.send("FRIENDLIST_ACCEPTFRIEND", tMsg);
          break;
        }
    }
    tRequestData[Symbol.for("state")] = tstate;
    this.pFriendRequestContainer.updateRequest(tRequestData);
    this.notifyFriendRequests();
  }

  handleAllRequests(tstate) {
    if (!connectionExists(getVariable("connection.info.id"))) {
      return 0;
    }
    const tRequests = this.getPendingFriendRequests();
    if (tRequests.count == 0) {
      return 1;
    }
    const tMsgList = propList();
    tMsgList.addProp(Symbol.for("integer"), 0);
    tMsgList.addProp(Symbol.for("integer"), tRequests.count);
    for (const tRequest of tRequests) {
      const tID = tRequest.getaProp(Symbol.for("id"));
      tMsgList.addProp(Symbol.for("integer"), integer(tID));
      tRequest[Symbol.for("state")] = tstate;
      this.pFriendRequestContainer.updateRequest(tRequest);
    }
    if (tstate == Symbol.for("accepted")) {
      tMsgList.deleteAt(1);
      getConnection(getVariable("connection.info.id")).send("FRIENDLIST_ACCEPTFRIEND", tMsgList);
    } else {
      getConnection(getVariable("connection.info.id")).send("FRIENDLIST_DECLINEFRIEND", tMsgList);
    }
    this.notifyFriendRequests();
    return 1;
  }

  getPendingFriendRequests() {
    return this.pFriendRequestContainer.getPendingRequests().duplicate();
  }

  sendRemoveFriend(tFriendID) {
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("FRIENDLIST_REMOVEFRIEND", [Symbol.for("integer"): 1, Symbol.for("integer"): integer(tFriendID)]);
    }
  }

  getFriendByID(tFriendID) {
    const tList = this.pFriendDataContainer.getFriendByID(tFriendID);
    if (ilk(tList) == Symbol.for("propList")) {
      return tList.duplicate();
    } else {
      return 0;
    }
  }

  getFriendByName(tName) {
    const tList = this.pFriendDataContainer.getFriendByName(tName);
    if (ilk(tList) == Symbol.for("propList")) {
      return tList.duplicate();
    } else {
      return 0;
    }
  }

  getFriendsInCategory(tCategoryId) {
    const tFriends = this.pFriendDataContainer.getFriendsInCategory(tCategoryId);
    if (ilk(tFriends) == Symbol.for("propList")) {
      return tFriends.duplicate();
    } else {
      return 0;
    }
  }

  getCategoryList() {
    const tList = this.pFriendDataContainer.getCategoryList();
    if (ilk(tList) == Symbol.for("propList")) {
      return tList.duplicate();
    } else {
      return 0;
    }
  }

  getCategoryName(tID) {
    return this.pFriendDataContainer.getCategoryName(tID);
  }

  getItemCountForcategory(tCategoryId) {
    let tList;
    if (tCategoryId >= -1) {
      tList = this.pFriendDataContainer.getFriendsInCategory(tCategoryId);
    } else {
      if (tCategoryId == -2) {
        tList = this.pFriendRequestContainer.getPendingRequests();
      } else {
        if (tCategoryId == -3) {
          return this.pHabboSearchResults[Symbol.for("friends")].count + this.pHabboSearchResults[Symbol.for("habbos")].count;
        }
      }
    }
    let tCount;
    if (ilk(tList) == Symbol.for("propList")) {
      tCount = tList.count;
    } else {
      tCount = 0;
    }
    return tCount;
  }

  requestFriendListUpdate() {
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("FRIENDLIST_UPDATE");
    }
  }

  externalFriendRequest(tTargetUserName) {
    if (isFriendListFull()) {
      executeMessage(Symbol.for("alert"), "console_fr_limit_exceeded_error");
      return 0;
    }
    if ((tTargetUserName == VOID) || (tTargetUserName == EMPTY)) {
      return 1;
    }
    let tText = `${tTargetUserName} ${getText("console_request_1")}`;
    tText = `${tText}${RETURN}`;
    tText = `${tText}${getText("console_request_2")}`;
    executeMessage(Symbol.for("alert"), tText);
    if (!this.pSentFriendRequests.findPos(tTargetUserName)) {
      this.pSentFriendRequests.append(tTargetUserName);
    }
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("FRIENDLIST_FRIENDREQUEST", [Symbol.for("string"): tTargetUserName]);
    }
  }

  sendAskForFriendRequests() {
    this.pFriendRequestList = list();
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("FRIENDLIST_GETFRIENDREQUESTS");
    }
  }

  sendHabboSearch(tSearchString) {
    if (!stringp(tSearchString)) {
      return error(this, "Search string must be stringp()", Symbol.for("sendHabboSearch"));
    }
    if (tSearchString == EMPTY) {
      return 0;
    }
    if (tSearchString == this.pHabboSearchLastString) {
      return 0;
    }
    this.pHabboSearchLastString = tSearchString;
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("MESSENGER_HABBOSEARCH", [Symbol.for("string"): tSearchString]);
    }
  }

  setFriendRequestResult(tdata) {
    const tErrorList = propList();
    const tNamesPerAlert = 10;
    let tNames = RETURN;
    for (let tNameNum = 1; tNameNum <= tErrorList.count; tNameNum++) {
      const tName = tErrorList.getPropAt(tNameNum);
      this.pSentFriendRequests.deleteOne(tName);
      tNames = `${tNames}${RETURN}${tName}`;
      let tReason;
      switch (tErrorList[tNameNum]) {
        case 1:
          tReason = getText("console_fr_limit_exceeded_error");
          break;
        case 2:
          tReason = getText("console_target_friend_list_full");
          break;
        case 3:
          tReason = getText("console_target_does_not_accept");
          break;
        case 4:
          tReason = getText("console_friend_request_not_found");
          break;
        case 42:
          tReason = getText("console_concurrency_error");
          break;
      }
      tNames = `${tNames} - ${tReason}`;
      if ((tNameNum % tNamesPerAlert) == 0) {
        const tMessage = `${getText("console_friend_request_error")}${tNames}`;
        executeMessage(Symbol.for("alert"), [Symbol.for("msg"): tMessage]);
        tNames = RETURN;
      }
    }
    if (tNames.line.count > 2) {
      const tMessage = `${getText("console_friend_request_error")}${tNames}`;
      executeMessage(Symbol.for("alert"), [Symbol.for("msg"): tMessage]);
    }
  }

  setHabboSearchResults(tResultsFriends, tResultsHabbos) {
    this.pHabboSearchResults[Symbol.for("friends")] = tResultsFriends;
    for (const tItem of tResultsHabbos) {
      if (this.pSentFriendRequests.findPos(tItem.getaProp(Symbol.for("name")))) {
        tItem.setaProp(Symbol.for("fr_pending"), 1);
      }
    }
    this.pHabboSearchResults[Symbol.for("habbos")] = tResultsHabbos;
    this.getInterface().updateCategoryCounts();
  }

  getHabboSearchResults() {
    return this.pHabboSearchResults;
  }

  getHabboSearchLastString() {
    return this.pHabboSearchLastString;
  }
}
