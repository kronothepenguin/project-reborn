export default class {
  pHelpStatusData;
  pPostponedHelps;
  pOpenHelps;
  pInvitationRoomID;
  pInviting;
  pGuidesFoundCount;

  construct() {
    pHelpStatusData = propList();
    pPostponedHelps = list();
    pOpenHelps = list();
    pInvitationRoomID = 0;
    pInviting = 0;
    registerMessage(Symbol.for("roomReady"), this.getID(), Symbol.for("initHelpOnRoomEntry"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("removeHelp"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("removeHelp"));
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("removeHelp"));
    registerMessage(Symbol.for("roomInterfaceHidden"), this.getID(), Symbol.for("removeHelp"));
    registerMessage(Symbol.for("NUH_close"), this.getID(), Symbol.for("setHelpItemClosed"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("roomReady"), this.getID());
    unregisterMessage(Symbol.for("leaveReady"), this.getID());
    unregisterMessage(Symbol.for("changeReady"), this.getID());
    unregisterMessage(Symbol.for("enterReady"), this.getID());
    unregisterMessage(Symbol.for("roomInterfaceHidden"), this.getID());
    unregisterMessage(Symbol.for("NUH_close"), this.getID());
    return 1;
  }

  getHelpItemKeyId(tHelpItemName) {
    if (variableExists("NUH.ids")) {
      tKeys = getVariableValue("NUH.ids");
      if (ilk(tKeys) == Symbol.for("propList")) {
        tKey = tKeys.getaProp(tHelpItemName);
        return tKey;
      }
    }
  }

  getHelpItemName(tKeyId) {
    if (variableExists("NUH.ids")) {
      tKeys = getVariableValue("NUH.ids");
      if (ilk(tKeys) == Symbol.for("propList")) {
        tName = tKeys.getOne(tKeyId);
        return tName;
      }
    }
  }

  setHelpItemClosed(tHelpItemName) {
    if (pOpenHelps.getPos(tHelpItemName) == 0) {
      return 0;
    }
    if (pHelpStatusData.getaProp(tHelpItemName) != 1) {
      return 0;
    }
    pHelpStatusData[tHelpItemName] = 0;
    tConn = getConnection(getVariableValue("connection.info.id"));
    tKey = EMPTY;
    tKey = this.getHelpItemKeyId(tHelpItemName);
    if (tKey != 0) {
      tConn.send("MSG_REMOVE_ACCOUNT_HELP_TEXT", propList("integer", tKey));
    }
    this.removeOpenHelp(tHelpItemName);
    this.getInterface().removeHelpBubble(tHelpItemName);
    if (pPostponedHelps.count > 0) {
      tHelpId = pPostponedHelps[1];
      pPostponedHelps.deleteAt(1);
      tTimeoutID = `NUH_help_${tHelpId}_postponed`;
      createTimeout(tTimeoutID, 3000, Symbol.for("tryToShowHelp"), this.getID(), tHelpId, 1);
    }
  }

  removeOpenHelp(tHelpId) {
    tPos = pOpenHelps.findPos(tHelpId);
    if (tPos > 0) {
      pOpenHelps.deleteAt(tPos);
    }
  }

  setHelpStatusData(tdata) {
    pHelpStatusData = tdata;
  }

  closeInvitation(tResult) {
    switch (tResult) {
      case Symbol.for("yes"):
        this.sendInvitations();
        break;
      case Symbol.for("no"):
        nothing();
        break;
      case Symbol.for("never"):
        this.setHelpItemClosed("invite");
        break;
      default:
        return 0;
    }
    this.removeOpenHelp("invite");
    this.getInterface().hideInvitationWindow();
  }

  isChatHelpOn() {
    if (!voidp(pHelpStatusData["chat"])) {
      return pHelpStatusData["chat"];
    }
    return 0;
  }

  initHelpOnRoomEntry() {
    tRoomData = getThread(Symbol.for("room")).getComponent().pSaveData;
    tUserName = getObject(Symbol.for("session")).GET(Symbol.for("userName"));
    if (tRoomData[Symbol.for("owner")] == tUserName) {
      this.showNewUserHelpItems();
    }
  }

  removeHelp() {
    for (let tItemNo = 1; tItemNo <= pHelpStatusData.count; tItemNo++) {
      tItem = pHelpStatusData.getPropAt(tItemNo);
      tItemOn = pHelpStatusData[tItemNo];
      tTimeoutID = `NUH_help_${tItem}`;
      if (timeoutExists(tTimeoutID)) {
        removeTimeout(tTimeoutID);
      }
    }
    this.getInterface().removeAll();
    pPostponedHelps = list();
    pOpenHelps = list();
  }

  showNewUserHelpItems() {
    for (let tItemNo = 1; tItemNo <= pHelpStatusData.count; tItemNo++) {
      tItem = pHelpStatusData.getPropAt(tItemNo);
      tItemOn = pHelpStatusData[tItemNo];
      if (tItemOn) {
        tTimeoutVarId = `NUH.${tItem}.timeout`;
        tDefaultTimeoutVarId = `NUH.${tItem}.default.timeout`;
        if (variableExists(tTimeoutVarId)) {
          tTimeout = getVariable(tTimeoutVarId);
        } else {
          tTimeout = getVariable(tDefaultTimeoutVarId);
        }
        if (!integerp(value(tTimeout))) {
          tTimeout = 0;
        }
        if (tTimeout == 0) {
          pOpenHelps.add(tItem);
          continue;
        }
        tTimeoutID = `NUH_help_${tItem}`;
        createTimeout(tTimeoutID, tTimeout, Symbol.for("tryToShowHelp"), this.getID(), tItem, 1);
      }
    }
  }

  tryToShowHelp(tHelpId) {
    if (pOpenHelps.count > 1 || pInviting) {
      this.postponeHelp(tHelpId);
      return 1;
    }
    switch (tHelpId) {
      case "friends":
        if (!threadExists(Symbol.for("friend_list"))) {
          return 0;
        }
        tFriendListComponent = getThread(Symbol.for("friend_list")).getComponent();
        tRequests = tFriendListComponent.getPendingFriendRequests();
        if (ilk(tRequests) == Symbol.for("propList")) {
          tRequestCount = tRequests.count;
          if (tRequestCount > 0) {
            this.getInterface().showGenericHelp(tHelpId);
            pOpenHelps.add(tHelpId);
          }
        }
        break;
      case "own_user":
        this.getInterface().showOwnUserHelp(tHelpId);
        pOpenHelps.add(tHelpId);
        break;
      case "hand":
        towner = getObject(Symbol.for("session")).GET(Symbol.for("room_owner"));
        if (towner) {
          this.getInterface().showGenericHelp(tHelpId);
          pOpenHelps.add(tHelpId);
        }
        break;
      case "invite":
        towner = getObject(Symbol.for("session")).GET(Symbol.for("room_owner"));
        if (towner) {
          this.checkHelpers();
        }
        break;
      default:
        this.getInterface().showGenericHelp(tHelpId);
        pOpenHelps.add(tHelpId);
        break;
    }
  }

  postponeHelp(tHelpId) {
    tPos = pPostponedHelps.findPos(tHelpId);
    if (tPos > 0) {
      return 1;
    }
    pPostponedHelps.add(tHelpId);
    if (pOpenHelps.count == 0) {
      tTimeoutID = `NUH_help_${tHelpId}_reactivation`;
      if (!timeoutExists(tTimeoutID)) {
        createTimeout(tTimeoutID, 3000, Symbol.for("tryToShowHelp"), this.getID(), tHelpId, 1);
      }
    }
    return 1;
  }

  checkHelpers() {
    tConn = getConnection(getVariable("connection.info.id"));
    if (voidp(tConn)) {
      return error(this, "Connection not found.", Symbol.for("checkHelpers"), Symbol.for("major"));
    }
    tConn.send("MSG_GET_TUTORS_AVAILABLE");
  }

  showInviteWindow() {
    pOpenHelps.add("invite");
    this.getInterface().showInviteWindow();
  }

  inviterLeftRoom(tRoomID) {
    pInviting = 0;
    pInvitationRoomID = tRoomID;
    this.getInterface().showInvitationStatusWindow(Symbol.for("room_left"));
  }

  goToInvitationRoom() {
    if (pInvitationRoomID > 0) {
      executeMessage(Symbol.for("roomForward"), pInvitationRoomID, Symbol.for("private"));
    }
  }

  sendInvitations() {
    tConn = getConnection(getVariable("connection.info.id"));
    if (voidp(tConn)) {
      return error(this, "Connection not found.", Symbol.for("sendInvitations"), Symbol.for("major"));
    }
    towner = getObject(Symbol.for("session")).GET(Symbol.for("room_owner"));
    if (towner) {
      tConn.send("MSG_INVITE_TUTORS");
    }
  }

  cancelInvitations() {
    tConn = getConnection(getVariable("connection.info.id"));
    if (voidp(tConn)) {
      return error(this, "Connection not found.", Symbol.for("sendInvitations"), Symbol.for("major"));
    }
    tConn.send("MSG_CANCEL_TUTOR_INVITATIONS");
    pInviting = 0;
  }

  invitingStarted() {
    pInviting = 1;
    pGuidesFoundCount = 0;
    this.getInterface().showInvitationStatusWindow(Symbol.for("Search"));
  }

  invitingCompleted(tAcceptCount) {
    pInviting = 0;
    if (tAcceptCount == 0) {
      tstate = Symbol.for("failure");
    } else {
      tstate = Symbol.for("success");
    }
    this.getInterface().showInvitationStatusWindow(tstate);
  }

  invitationExists() {
    executeMessage(Symbol.for("alert"), "invitation_exists");
  }

  getGuideCount() {
    return pGuidesFoundCount;
  }

  guideFound() {
    pGuidesFoundCount = pGuidesFoundCount + 1;
  }
}
