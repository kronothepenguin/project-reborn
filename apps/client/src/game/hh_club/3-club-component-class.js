export default class {
  pClubStatus;
  pGiftCount;
  pGiftTimeOut;
  pAcceptedGifts;

  construct() {
    this.pClubStatus = propList();
    this.pGiftCount = 0;
    this.pAcceptedGifts = 0;
    this.pGiftTimeOut = "timeout_clubgift";
    return 1;
  }

  deconstruct() {
    this.pClubStatus = propList();
    if (timeoutExists(this.pGiftTimeOut)) {
      removeTimeout(this.pGiftTimeOut);
    }
    return 1;
  }

  showGifts(tCount) {
    this.pGiftCount = tCount;
    this.pAcceptedGifts = 0;
    if (this.pGiftCount > 0) {
      this.getInterface().show_giftinfo();
    }
    return 1;
  }

  acceptGift() {
    if (this.pGiftCount > this.pAcceptedGifts) {
      this.pAcceptedGifts = this.pAcceptedGifts + 1;
      if (this.pGiftCount > this.pAcceptedGifts) {
        if (timeoutExists(this.pGiftTimeOut)) {
          removeTimeout(this.pGiftTimeOut);
        }
        createTimeout(this.pGiftTimeOut, 1000, Symbol.for("showNextGift"), this.getID(), VOID, 1);
      } else {
        return this.sendAcceptGift();
      }
    } else {
      return 0;
    }
  }

  rejectGift() {
    if (this.pGiftCount > 0) {
      this.pGiftCount = 0;
      if (this.pAcceptedGifts > 0) {
        return this.sendAcceptGift();
      } else {
        return 1;
      }
    } else {
      return 0;
    }
  }

  sendAcceptGift() {
    tAcceptedGifts = this.pAcceptedGifts;
    this.resetGiftList();
    tConnection = getConnection(getVariable("connection.info.id"));
    if (tConnection == 0) {
      return error(this, `Couldn't find connection: ${getVariable("connection.info.id")}`, Symbol.for("sendAcceptGift"), Symbol.for("major"));
    }
    return tConnection.send("SCR_GIFT_APPROVAL", propList("integer", tAcceptedGifts));
  }

  resetGiftList() {
    this.pGiftCount = 0;
    this.pAcceptedGifts = 0;
  }

  setStatus(tStatus, tResponseFlag) {
    tOldClubStatus = this.pClubStatus;
    this.pClubStatus = tStatus;
    getObject(Symbol.for("session")).set("club_status", tStatus);
    this.getInterface().updateClubStatus(tStatus, tResponseFlag, tOldClubStatus);
    executeMessage(Symbol.for("updateClubStatus"), tStatus);
    return 1;
  }

  getStatus() {
    if (voidp(this.pClubStatus)) {
      return 0;
    } else {
      return this.pClubStatus;
    }
  }

  subscribe(tChosenLength) {
    if (connectionExists(getVariable("connection.info.id"))) {
      tList = propList("string", "club_habbo", "integer", tChosenLength);
      return getConnection(getVariable("connection.info.id")).send("SCR_BUY", tList);
    } else {
      return error(this, `Couldn't find connection: ${getVariable("connection.info.id")}`, Symbol.for("subscribe"), Symbol.for("major"));
    }
  }

  askforBadgeUpdate() {
    if (connectionExists(getVariable("connection.info.id"))) {
      return getConnection(getVariable("connection.info.id")).send("GETAVAILABLEBADGES");
    } else {
      return error(this, `Couldn't find connection: ${getVariable("connection.info.id")}`, Symbol.for("askforBadgeUpdate"), Symbol.for("major"));
    }
  }

  showNextGift() {
    this.getInterface().show_giftinfo();
  }
}
