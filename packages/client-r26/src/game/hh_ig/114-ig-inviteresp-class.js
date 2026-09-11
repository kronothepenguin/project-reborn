export default class {
  pInviteIndex;
  pInviteList;
  pUpdateCounter;

  construct() {
    this.pInviteIndex = list();
    this.pInviteList = propList();
    return 1;
  }

  deconstruct() {
    this.pInviteIndex = list();
    this.pInviteList = propList();
    return this.ancestor.deconstruct();
  }

  update() {
    if ((the.milliSeconds - this.pUpdateCounter) < 1000) {
      return 1;
    }
    this.pUpdateCounter = the.milliSeconds;
    this.updateExpirationTimers();
    return 1;
  }

  updateExpirationTimers() {
    if (this.pInviteList.count == 0) {
      return 1;
    }
    const tPurgeList = list();
    for (let i = 1; i <= this.pInviteList.count; i++) {
      const tItem = this.pInviteList[i];
      const tExpires = tItem.getaProp(Symbol.for("expires_msec"));
      const tSeconds = (tExpires - the.milliSeconds) / 1000;
      tItem.setaProp(Symbol.for("seconds_valid"), tSeconds);
      if (tSeconds < 1) {
        tPurgeList.append(tItem.getaProp(Symbol.for("id")));
      }
    }
    for (const tID of tPurgeList) {
      this.removeInvitation(tID, 0);
    }
    if ((tPurgeList.count == 0) && (this.pInviteList.count == 0)) {
      return 1;
    }
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    if (tPurgeList.count == 0) {
      tRenderObj.refreshFirstTimer(this.pInviteList[1].getaProp(Symbol.for("seconds_valid")));
    } else {
      tRenderObj.renderSubComponents();
    }
    return 1;
  }

  setAsFirstEntry(tGameId) {
    if (tGameId == VOID) {
      return 0;
    }
    if (this.pInviteIndex.findPos(tGameId) == 0) {
      return 0;
    }
    this.pInviteIndex.deleteOne(tGameId);
    this.pInviteIndex.addAt(1, tGameId);
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    tRenderObj.renderSubComponents();
    return 1;
  }

  storeGameInvitation(tdata) {
    return 1;
  }

  removeInvitation(tGameId, tRenderFlag) {
    put("* removeInvitation", `${tGameId} ${tRenderFlag}`);
    return 1;
  }

  declineAllInvitations() {
    put("* declineAllInvitations");
    const tMainThread = this.getMainThread();
    if (tMainThread == 0) {
      return 0;
    }
    const tHandler = tMainThread.getHandler();
    for (const tGameId of this.pInviteIndex) {
      tHandler.send_DECLINE_INVITE_REQUEST(tGameId);
    }
    this.pInviteList = propList();
    this.pInviteIndex = list();
    return 1;
  }

  invitationDeclined(tGameId) {
    this.removeInvitation(tGameId, 1);
    const tMainThread = this.getMainThread();
    if (tMainThread == 0) {
      return 0;
    }
    return tMainThread.getHandler().send_DECLINE_INVITE_REQUEST(tGameId);
  }

  invitationAccepted(tGameId, tTeamIndex) {
    put("* invitationAccepted, join team", `${tTeamIndex}`);
    this.removeInvitation(tGameId, 0);
    this.ChangeWindowView("GameList");
    const tListService = this.getIGComponent("GameList");
    tListService.setJoinedGameId(tGameId, tTeamIndex);
    return this.declineAllInvitations();
  }

  getInvitationCount() {
    return this.pInviteIndex.count;
  }

  getEntry(tGameId) {
    if (voidp(tGameId)) {
      return 0;
    }
    return this.pInviteList.getaProp(tGameId);
  }

  getEntryByIndex(tIndex) {
    if (tIndex == VOID) {
      return 0;
    }
    if (tIndex > this.pInviteIndex.count) {
      return 0;
    }
    return this.pInviteList.getaProp(this.pInviteIndex[tIndex]);
  }

  getGameByIndex(tIndex) {
    const tInfo = this.getEntryByIndex(tIndex);
    if (tInfo == 0) {
      return 0;
    }
    return tInfo.getaProp(Symbol.for("game_object"));
  }
}
