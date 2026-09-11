export default class {
  pCatAliases;

  construct() {
    this.pCatAliases = propList();
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  clearCatAliases() {
    this.pCatAliases = propList();
  }

  getSlotCatAlias(tUniqueCatID) {
    tUniqueCatID = string(tUniqueCatID);
    if (tUniqueCatID <= 0) {
      return tUniqueCatID;
    }
    if (this.pCatAliases.findPos(tUniqueCatID)) {
      return this.pCatAliases[tUniqueCatID];
    }
    const tMaxFreeCount = getVariable("fr.window.max.free.categories", 5);
    for (let tSlotNo = 1; tSlotNo <= tMaxFreeCount; tSlotNo++) {
      const tSlotStr = string(tSlotNo);
      const tPropID = this.pCatAliases.getOne(tSlotStr);
      if (tPropID == 0) {
        this.pCatAliases[tUniqueCatID] = tSlotStr;
        return tSlotStr;
      }
    }
    error(this, `Could not map category id to a slot: ${tUniqueCatID}`, Symbol.for("getSlotCatAlias"), Symbol.for("major"));
    return 0;
  }

  removeUnusedCategories(tIdsInUse) {
    const tAliasList = this.pCatAliases.duplicate();
    for (let tNo = 1; tNo <= tAliasList.count; tNo++) {
      const tID = tAliasList.getPropAt(tNo);
      if (!tIdsInUse.getOne(tID)) {
        this.pCatAliases.deleteProp(tID);
      }
    }
  }

  handleOk(tMsg) {
    const tConn = tMsg.connection;
    tConn.send("FRIENDLIST_INIT");
  }

  handleFriendListInit(tMsg) {
    const tConn = tMsg.connection;
    if (tConn == 0) {
      return 0;
    }
    const tUserLimit = tConn.GetIntFrom();
    const tNormalLimit = tConn.GetIntFrom();
    const tExtendedLimit = tConn.GetIntFrom();
    const tCategoryCount = tConn.GetIntFrom();
    const tCategories = propList();
    for (let tCatNo = 1; tCatNo <= tCategoryCount; tCatNo++) {
      const tUniqueId = string(tConn.GetIntFrom());
      const tName = tConn.GetStrFrom();
      const tID = this.getSlotCatAlias(tUniqueId);
      if (tID != 0) {
        tCategories[tID] = tName;
      }
    }
    const tFriendCount = tConn.GetIntFrom();
    const tFriendList = propList();
    for (let tFriendNo = 1; tFriendNo <= tFriendCount; tFriendNo++) {
      const tFriend = this.parseFriendData(tMsg);
      tFriendList[string(tFriend[Symbol.for("id")])] = tFriend;
    }
    const tFriendRequestLimit = tConn.GetIntFrom();
    const tFriendRequestCount = tConn.GetIntFrom();
    const tComponent = this.getComponent();
    tComponent.setFriendLimits(tUserLimit, tNormalLimit, tExtendedLimit);
    tComponent.populateCategoryData(tCategories);
    tComponent.populateFriendData(tFriendList);
    tComponent.sendAskForFriendRequests();
    return tComponent.setFriendListInited();
  }

  handleFriendListUpdate(tMsg) {
    const tConn = tMsg.connection;
    if (tConn == 0) {
      return 0;
    }
    const tCategoryCount = tConn.GetIntFrom();
    if (tCategoryCount > 0) {
      const tCategoriesTemp = propList();
      const tUsedIds = list();
      for (let tCatNo = 1; tCatNo <= tCategoryCount; tCatNo++) {
        const tID = string(tConn.GetIntFrom());
        const tName = tConn.GetStrFrom();
        tCategoriesTemp[tID] = tName;
        tUsedIds.add(tID);
      }
      this.removeUnusedCategories(tUsedIds);
      const tCategories = propList();
      for (let tNo = 1; tNo <= tCategoriesTemp.count; tNo++) {
        const tUniqueId = tCategoriesTemp.getPropAt(tNo);
        const tName = tCategoriesTemp[tNo];
        const tSlotID = this.getSlotCatAlias(tUniqueId);
        if (tSlotID != 0) {
          tCategories[tSlotID] = tName;
        }
      }
      this.getComponent().populateCategoryData(tCategories);
    }
    const tFriendCount = tConn.GetIntFrom();
    for (let tNo = 1; tNo <= tFriendCount; tNo++) {
      const tUpdateType = tConn.GetIntFrom();
      switch (tUpdateType) {
        case -1:
          {
            const tFriendID = tConn.GetIntFrom();
            this.getComponent().removeFriend(tFriendID, 1);
            break;
          }
        case 0:
          {
            const tFriend = propList();
            tFriend[Symbol.for("id")] = tConn.GetIntFrom();
            tFriend[Symbol.for("name")] = tConn.GetStrFrom();
            tFriend[Symbol.for("sex")] = tConn.GetIntFrom();
            tFriend[Symbol.for("online")] = tConn.GetIntFrom();
            tFriend[Symbol.for("canfollow")] = tConn.GetIntFrom();
            tFriend[Symbol.for("figure")] = tConn.GetStrFrom();
            tFriend[Symbol.for("categoryId")] = this.getSlotCatAlias(tConn.GetIntFrom());
            if (tFriend[Symbol.for("categoryId")] < 0) {
              tFriend[Symbol.for("categoryId")] = "0";
            }
            if (tFriend[Symbol.for("online")] == 0) {
              tFriend[Symbol.for("categoryId")] = "-1";
            }
            tFriend[Symbol.for("categoryId")] = string(tFriend[Symbol.for("categoryId")]);
            tFriend[Symbol.for("mission")] = tConn.GetStrFrom();
            tFriend[Symbol.for("lastAccess")] = tConn.GetStrFrom();
            this.getComponent().updateFriend(tFriend, 1);
            break;
          }
        case 1:
          {
            const tFriend = this.parseFriendData(tMsg);
            this.getComponent().addFriend(tFriend, 1);
            break;
          }
      }
    }
    if ((tFriendCount > 0) || (tCategoryCount > 0)) {
      this.getInterface().updateCategoryCounts();
      this.getInterface().updateOpenCategoryPanel();
      callJavaScriptFunction("friendListUpdate");
    }
  }

  handleError(tMsg) {
    const tConn = tMsg.connection;
    if (tConn == 0) {
      return 0;
    }
    const tClientMessageId = tConn.GetIntFrom();
    const tErrorCode = tConn.GetIntFrom();
    switch (tErrorCode) {
      case 0:
        return error(this, "Undefined friend list error!", Symbol.for("handleError"), Symbol.for("major"));
      case 2:
        return executeMessage(Symbol.for("alert"), [Symbol.for("msg"): getText("console_target_friend_list_full")]);
      case 3:
        return executeMessage(Symbol.for("alert"), [Symbol.for("msg"): getText("console_target_does_not_accept")]);
      case 4:
        return executeMessage(Symbol.for("alert"), [Symbol.for("msg"): getText("console_friend_request_not_found")]);
      case 37:
        {
          const tReason = tConn.GetIntFrom();
          switch (tReason) {
            case 1:
            case 2:
              executeMessage(Symbol.for("alert"), [Symbol.for("msg"): "console_buddylimit_requester", Symbol.for("modal"): 1]);
              break;
            case 42:
              {
                executeMessage(Symbol.for("alert"), [Symbol.for("msg"): "console_buddylist_concurrency", Symbol.for("modal"): 1]);
                if (connectionExists(getVariable("connection.info.id"))) {
                  getConnection(getVariable("connection.info.id")).send("FRIENDLIST_UPDATE");
                }
                break;
              }
          }
          break;
        }
      case 39:
      case 42:
        return executeMessage(Symbol.for("alert"), [Symbol.for("msg"): getText("console_concurrency_error")]);
      default:
        return error(this, `Friendlist error, failed message: ${tErrorCode} Triggered by message: ${tClientMessageId}`, Symbol.for("handleError"), Symbol.for("major"));
    }
    return 1;
  }

  handleFriendRequestList(tMsg) {
    const tConn = tMsg.connection;
    const tTotalFriendRequests = tConn.GetIntFrom();
    const tFriendRequestCount = tConn.GetIntFrom();
    for (let tRequestNo = 1; tRequestNo <= tFriendRequestCount; tRequestNo++) {
      const tRequest = this.parseFriendRequest(tMsg);
      this.getComponent().addFriendRequest(tRequest);
    }
    this.getInterface().updateCategoryCounts();
    this.getComponent().notifyFriendRequests();
  }

  handleFriendRequest(tMsg) {
    const tRequest = this.parseFriendRequest(tMsg);
    this.getComponent().addFriendRequest(tRequest);
    this.getInterface().updateCategoryCounts();
    this.getComponent().notifyFriendRequests();
  }

  handleFriendRequestResult(tMsg) {
    const tConn = tMsg.connection;
    const tFailureCount = tConn.GetIntFrom();
    const tErrorList = propList();
    for (let tItemNo = 1; tItemNo <= tFailureCount; tItemNo++) {
      const tSenderName = tConn.GetStrFrom();
      const tErrorCode = tConn.GetIntFrom();
      tErrorList.setaProp(tSenderName, tErrorCode);
    }
    this.getComponent().setFriendRequestResult(tErrorList);
    if (tFailureCount < 1) {
      return 1;
    }
  }

  handleFollowFailed(tMsg) {
    const tConn = tMsg.connection;
    const tFailureType = tConn.GetIntFrom();
    let tTextKey;
    switch (tFailureType) {
      case 0:
        tTextKey = "console_follow_not_friend";
        break;
      case 1:
        tTextKey = "console_follow_offline";
        break;
      case 2:
        tTextKey = "console_follow_hotelview";
        break;
      case 3:
        tTextKey = "console_follow_prevented";
        break;
      default:
        return 0;
    }
    if (threadExists(Symbol.for("room"))) {
      const tRoomID = getThread(Symbol.for("room")).getComponent().getRoomID();
      if (tRoomID == EMPTY) {
        executeMessage(Symbol.for("show_navigator"));
      }
    }
    executeMessage(Symbol.for("alert"), [Symbol.for("msg"): tTextKey, Symbol.for("id"): Symbol.for("follow_failure_notice")]);
    return 1;
  }

  handleMailNotification(tMsg) {
    const tConn = tMsg.connection;
    const tUserID = tConn.GetStrFrom();
    this.getComponent().newMailFrom(tUserID);
  }

  handleMailCountNotification(tMsg) {
    const tConn = tMsg.connection;
    const tUnreadMailCount = tConn.GetIntFrom();
    this.getComponent().setUnreadMailCount(tUnreadMailCount);
  }

  handleHabboSearchResult(tMsg) {
    const tConn = tMsg.connection;
    const tResultFriendsCount = tConn.GetIntFrom();
    const tResultsFriends = list();
    for (let tRequestNo = 1; tRequestNo <= tResultFriendsCount; tRequestNo++) {
      tResultsFriends.append(this.parseHabboSearchResult(tMsg));
    }
    const tResultHabbosCount = tConn.GetIntFrom();
    const tResultsHabbos = list();
    for (let tRequestNo = 1; tRequestNo <= tResultHabbosCount; tRequestNo++) {
      tResultsHabbos.append(this.parseHabboSearchResult(tMsg));
    }
    this.getComponent().setHabboSearchResults(tResultsFriends, tResultsHabbos);
    this.getInterface().showHabboSearchResults();
  }

  parseFriendRequest(tMsg) {
    const tConn = tMsg.connection;
    if (tConn == 0) {
      return 0;
    }
    const tdata = propList();
    tdata[Symbol.for("id")] = string(tConn.GetIntFrom());
    tdata[Symbol.for("name")] = tConn.GetStrFrom();
    tdata[Symbol.for("userID")] = tConn.GetStrFrom();
    tdata[Symbol.for("state")] = Symbol.for("pending");
    return tdata;
  }

  parseFriendData(tMsg) {
    const tConn = tMsg.connection;
    if (tConn == 0) {
      return 0;
    }
    const tFriend = propList();
    tFriend[Symbol.for("id")] = tConn.GetIntFrom();
    tFriend[Symbol.for("name")] = tConn.GetStrFrom();
    tFriend[Symbol.for("sex")] = tConn.GetIntFrom();
    tFriend[Symbol.for("online")] = tConn.GetIntFrom();
    tFriend[Symbol.for("canfollow")] = tConn.GetIntFrom();
    tFriend[Symbol.for("figure")] = tConn.GetStrFrom();
    tFriend[Symbol.for("categoryId")] = this.getSlotCatAlias(tConn.GetIntFrom());
    if (tFriend[Symbol.for("categoryId")] < 0) {
      tFriend[Symbol.for("categoryId")] = "0";
    }
    if (tFriend[Symbol.for("online")] == 0) {
      tFriend[Symbol.for("categoryId")] = "-1";
    }
    tFriend[Symbol.for("categoryId")] = string(tFriend[Symbol.for("categoryId")]);
    tFriend[Symbol.for("mission")] = tConn.GetStrFrom();
    tFriend[Symbol.for("lastAccess")] = tConn.GetStrFrom();
    return tFriend;
  }

  parseHabboSearchResult(tMsg) {
    const tConn = tMsg.connection;
    if (tConn == 0) {
      return 0;
    }
    const tdata = propList();
    tdata[Symbol.for("id")] = tConn.GetIntFrom();
    tdata[Symbol.for("name")] = tConn.GetStrFrom();
    tdata[Symbol.for("mission")] = tConn.GetStrFrom();
    tdata[Symbol.for("online")] = tConn.GetIntFrom();
    tdata[Symbol.for("canfollow")] = tConn.GetIntFrom();
    tdata[Symbol.for("roomname")] = tConn.GetStrFrom();
    tdata[Symbol.for("sex")] = tConn.GetIntFrom();
    tdata[Symbol.for("figure")] = tConn.GetStrFrom();
    tdata[Symbol.for("lastAccess")] = tConn.GetStrFrom();
    return tdata;
  }

  regMsgList(tBool) {
    const tMsgs = propList();
    tMsgs.setaProp(3, Symbol.for("handleOk"));
    tMsgs.setaProp(12, Symbol.for("handleFriendListInit"));
    tMsgs.setaProp(13, Symbol.for("handleFriendListUpdate"));
    tMsgs.setaProp(132, Symbol.for("handleFriendRequest"));
    tMsgs.setaProp(260, Symbol.for("handleError"));
    tMsgs.setaProp(314, Symbol.for("handleFriendRequestList"));
    tMsgs.setaProp(315, Symbol.for("handleFriendRequestResult"));
    tMsgs.setaProp(349, Symbol.for("handleFollowFailed"));
    tMsgs.setaProp(363, Symbol.for("handleMailNotification"));
    tMsgs.setaProp(364, Symbol.for("handleMailCountNotification"));
    tMsgs.setaProp(435, Symbol.for("handleHabboSearchResult"));
    const tCmds = propList();
    tCmds.setaProp("FRIENDLIST_INIT", 12);
    tCmds.setaProp("FRIENDLIST_UPDATE", 15);
    tCmds.setaProp("FRIENDLIST_GETOFFLINEFRIENDS", 32);
    tCmds.setaProp("FRIENDLIST_REMOVEFRIEND", 40);
    tCmds.setaProp("MESSENGER_HABBOSEARCH", 41);
    tCmds.setaProp("FRIENDLIST_ACCEPTFRIEND", 37);
    tCmds.setaProp("FRIENDLIST_DECLINEFRIEND", 38);
    tCmds.setaProp("FRIENDLIST_FRIENDREQUEST", 39);
    tCmds.setaProp("FRIENDLIST_GETFRIENDREQUESTS", 233);
    tCmds.setaProp("FOLLOW_FRIEND", 262);
    if (tBool) {
      registerListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
