export default class {
  pChats;
  pFriends;
  pUserId;
  pShowModNotification;
  pInvitees;

  construct() {
    let tStamp = EMPTY;
    for (let tNo = 1; tNo <= 100; tNo++) {
      let tChar = numToChar(random(48) + 74);
      tStamp = `${tStamp}${tChar}`;
    }
    let tFuseReceipt = getSpecialServices().getReceipt(tStamp);
    let tReceipt = list();
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
    this.pChats = propList();
    this.pFriends = propList();
    this.pInvitees = list();
    registerMessage(Symbol.for("userlogin"), this.getID(), Symbol.for("setUserID"));
    registerMessage(Symbol.for("startIMChat"), this.getID(), Symbol.for("startIMChat"));
    registerMessage(Symbol.for("friendDataUpdated"), this.getID(), Symbol.for("updateChat"));
    this.pShowModNotification = 1;
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("startIMChat"), this.getID());
    return 1;
  }

  setUserID() {
    this.pUserId = getObject(Symbol.for("session")).GET("user_user_id");
  }

  startIMChat(tReceiverName, tText) {
    if (!threadExists(Symbol.for("friend_list"))) {
      return 0;
    }
    let tFriend = getThread(Symbol.for("friend_list")).getComponent().getFriendByName(tReceiverName);
    if (!tFriend) {
      return 0;
    }
    let tReceiverID = tFriend.getaProp(Symbol.for("id"));
    if (tReceiverID == 0) {
      return 0;
    }
    this.addChat(tReceiverID, 1);
    if (tText != EMPTY) {
      this.sendMessage(tReceiverID, tText);
    }
    this.getInterface().activateChat(tReceiverID);
    this.getInterface().openIMWindow();
    this.updateChat(tReceiverID);
  }

  inviteFriends(tIDList) {
    if (!listp(tIDList)) {
      return 0;
    }
    this.pInvitees = tIDList;
    this.getInterface().showInvitationWindow(this.pInvitees.count);
  }

  sendInvitation(tInvitationText) {
    if (this.pInvitees.count == 0) {
      return 0;
    }
    let tMsg = propList();
    tMsg.addProp(Symbol.for("integer"), this.pInvitees.count);
    for (const tID of this.pInvitees) {
      tMsg.addProp(Symbol.for("integer"), integer(tID));
    }
    tMsg.addProp(Symbol.for("string"), tInvitationText);
    return getConnection(getVariable("connection.info.id")).send("FRIEND_INVITE", tMsg);
  }

  addChat(tChatID, tDontPlaySound) {
    if (!voidp(this.pChats.getaProp(tChatID))) {
      return 0;
    }
    let tFriend = this.updateFriend(tChatID);
    if (!tFriend) {
      return 0;
    }
    let tFriendID = tFriend.getaProp(Symbol.for("id"));
    this.pFriends.setaProp(tFriendID, tFriend);
    let tChat = list();
    this.pChats.setaProp(tChatID, tChat);
    this.getInterface().addChat(tChatID, tFriend, tDontPlaySound);
    if (this.pShowModNotification) {
      this.receiveNotification(tChatID, Symbol.for("moderation"));
      this.pShowModNotification = 0;
    }
    return 1;
  }

  updateChat(tChatID) {
    if (voidp(this.pChats.findPos(tChatID))) {
      return 1;
    }
    let tFriend = this.pFriends.getaProp(tChatID);
    let tOnline = tFriend.getaProp(Symbol.for("online"));
    let tFriendUpdated = this.updateFriend(tChatID);
    let tOnlineUpdated = tFriendUpdated.getaProp(Symbol.for("online"));
    if (tOnlineUpdated != tOnline) {
      if (tOnlineUpdated) {
        this.receiveNotification(tChatID, Symbol.for("online"));
      } else {
        this.receiveNotification(tChatID, Symbol.for("offline"));
      }
    }
    this.pFriends.setaProp(tChatID, tFriendUpdated);
    this.getInterface().updateInterface();
  }

  removeChat(tChatID) {
    if (this.pChats.findPos(tChatID) == 0) {
      return 0;
    }
    this.getInterface().removeChat(tChatID);
    return 1;
  }

  removeAllChats() {
    this.pChats = propList();
    this.getInterface().removeAllChats();
  }

  getChat(tChatID) {
    let tChat = this.pChats.getaProp(tChatID);
    if (voidp(tChat)) {
      if (!this.addChat(tChatID)) {
        return 0;
      }
      tChat = this.pChats.getaProp(tChatID);
    }
    return tChat;
  }

  receiveMessage(tSenderId, tText) {
    let tEntry = propList();
    tEntry.setaProp(Symbol.for("type"), Symbol.for("message"));
    tEntry.setaProp(Symbol.for("userID"), tSenderId);
    tEntry.setaProp(Symbol.for("Msg"), tText);
    tEntry.setaProp(Symbol.for("time"), the.time);
    this.addMessage(tSenderId, tEntry);
  }

  receiveError(tChatID, ttype) {
    let tTextKey;
    switch (ttype) {
      case 3:
        tTextKey = "im_error_receiver_muted";
        break;
      case 4:
        tTextKey = "im_error_sender_muted";
        break;
      case 5:
        tTextKey = "im_error_offline";
        break;
      case 6:
        tTextKey = "im_error_not_friend";
        break;
      case 7:
        tTextKey = "im_error_busy";
        break;
      default:
        tTextKey = "im_error_undefined";
        break;
    }
    let tEntry = propList();
    tEntry.setaProp(Symbol.for("type"), Symbol.for("error"));
    tEntry.setaProp(Symbol.for("Msg"), getText(tTextKey));
    tEntry.setaProp(Symbol.for("time"), the.time);
    this.addMessage(tChatID, tEntry);
  }

  receiveNotification(tChatID, ttype) {
    let tTextKey = `${"im_notification_"}${string(ttype)}`;
    let tEntry = propList();
    tEntry.setaProp(Symbol.for("type"), Symbol.for("notification"));
    tEntry.setaProp(Symbol.for("Msg"), getText(tTextKey));
    tEntry.setaProp(Symbol.for("time"), the.time);
    this.addMessage(tChatID, tEntry);
  }

  receiveInvitation(tChatID, tText) {
    tText = `${getText("im_invitation")}${RETURN}${RETURN}${tText}`;
    let tEntry = propList();
    tEntry.setaProp(Symbol.for("type"), Symbol.for("invitation"));
    tEntry.setaProp(Symbol.for("userID"), tChatID);
    tEntry.setaProp(Symbol.for("Msg"), tText);
    tEntry.setaProp(Symbol.for("time"), the.time);
    this.addMessage(tChatID, tEntry);
  }

  sendMessage(tReceiverID, tText) {
    if (voidp(tReceiverID)) {
      return 0;
    }
    let tEntry = propList();
    tEntry.setaProp(Symbol.for("type"), Symbol.for("message"));
    tEntry.setaProp(Symbol.for("userID"), this.pUserId);
    tEntry.setaProp(Symbol.for("Msg"), tText);
    tEntry.setaProp(Symbol.for("time"), the.time);
    this.addMessage(tReceiverID, tEntry);
    tText = getStringServices().convertSpecialChars(tText, 1);
    let tdata = propList();
    tdata.addProp(Symbol.for("integer"), integer(tReceiverID));
    tdata.addProp(Symbol.for("string"), tText);
    return getConnection(getVariable("connection.info.id")).send("MESSENGER_SENDMSG", tdata);
  }

  addMessage(tChatID, tEntry) {
    let tChat = this.getChat(tChatID);
    if (!tChat) {
      return 0;
    }
    tChat.add(tEntry);
    this.getInterface().addMessage(tChatID, tEntry);
  }

  updateFriend(tUserID) {
    if (!objectExists(Symbol.for("friend_list_component"))) {
      return error(this, "Can't find friend list component", Symbol.for("getFriend"), Symbol.for("major"));
    }
    let tFriend = getObject(Symbol.for("friend_list_component")).getFriendByID(tUserID);
    return tFriend;
  }

  getFriend(tUserID) {
    return this.pFriends.getaProp(tUserID);
  }
}
