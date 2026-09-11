export default class {
  construct() {
    this.registerServerMessages(1);
    return 1;
  }

  deconstruct() {
    return 1;
  }

  handleHelpItems(tMsg) {
    tConn = tMsg.getaProp(Symbol.for("connection"));
    tIdCount = tConn.GetIntFrom();
    tdata = propList();
    for (let tNo = 1; tNo <= tIdCount; tNo++) {
      tKeyId = tConn.GetIntFrom();
      tKey = this.getComponent().getHelpItemName(tKeyId);
      if (tKey != 0) {
        tdata[tKey] = 1;
      }
    }
    this.getComponent().setHelpStatusData(tdata);
  }

  handleTutorsAvailable(tMsg) {
    tConn = tMsg.getaProp(Symbol.for("connection"));
    tAreAvailable = tConn.GetIntFrom();
    if (!tAreAvailable) {
      return 0;
    }
    this.getComponent().showInviteWindow();
    return 1;
  }

  handleInvitingCompleted(tMsg) {
    tConn = tMsg.getaProp(Symbol.for("connection"));
    tAcceptCount = tConn.GetIntFrom();
    this.getComponent().invitingCompleted(tAcceptCount);
  }

  handleInvitationExists(tMsg) {
    this.getComponent().invitationExists();
  }

  handleInvitationSent() {
    this.getComponent().invitingStarted();
  }

  handleGuideFound() {
    this.getComponent().guideFound();
  }

  handleInviterLeftRoom(tMsg) {
    tConn = tMsg.getaProp(Symbol.for("connection"));
    tRoomID = tConn.GetIntFrom();
    this.getComponent().inviterLeftRoom(string(tRoomID));
  }

  registerServerMessages(tBool) {
    tMsgs = propList();
    tMsgs.setaProp(352, Symbol.for("handleHelpItems"));
    tMsgs.setaProp(356, Symbol.for("handleTutorsAvailable"));
    tMsgs.setaProp(357, Symbol.for("handleInvitingCompleted"));
    tMsgs.setaProp(358, Symbol.for("handleInvitationExists"));
    tMsgs.setaProp(421, Symbol.for("handleInvitationSent"));
    tMsgs.setaProp(423, Symbol.for("handleGuideFound"));
    tMsgs.setaProp(424, Symbol.for("handleInviterLeftRoom"));
    tCmds = propList();
    tCmds.setaProp("MSG_REMOVE_ACCOUNT_HELP_TEXT", 313);
    tCmds.setaProp("MSG_GET_TUTORS_AVAILABLE", 355);
    tCmds.setaProp("MSG_INVITE_TUTORS", 356);
    tCmds.setaProp("MSG_CANCEL_TUTOR_INVITATIONS", 359);
    if (tBool) {
      registerListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tCmds);
    }
    return 1;
  }
}
