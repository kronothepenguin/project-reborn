export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handleInvitation(tMsg) {
    let tConn = tMsg.connection;
    if (tConn == 0) {
      return 0;
    }
    let tInvitationData = propList();
    tInvitationData.setaProp(Symbol.for("userID"), tConn.GetStrFrom());
    tInvitationData.setaProp(Symbol.for("name"), tConn.GetStrFrom());
    this.getComponent().setInvitation(tInvitationData);
    return 1;
  }

  handleInvitationFollowFailed(tMsg) {
    executeMessage(Symbol.for("alert"), "invitation_follow_failed");
  }

  handleInvitationCancelled(tMsg) {
    this.getComponent().cancelInvitation();
  }

  handleInitTutorServiceStatus(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tstate = tConn.GetIntFrom();
    switch (tstate) {
      case 1:
        this.getComponent().setState(Symbol.for("enabled"));
        break;
      case 2:
        this.getComponent().setState(Symbol.for("disabled"));
        break;
      case 3:
        this.getComponent().setState(Symbol.for("disabled"));
        break;
    }
  }

  handleEnableTutorServiceStatus(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tstate = tConn.GetIntFrom();
    switch (tstate) {
      case 2:
        executeMessage(Symbol.for("alert"), "guide_tool_friendlist_full");
        this.getComponent().setState(Symbol.for("enabled"));
        break;
      case 3:
        executeMessage(Symbol.for("alert"), "guide_tool_service_disabled");
        this.getComponent().setState(Symbol.for("disabled"));
        break;
      case 4:
        executeMessage(Symbol.for("alert"), "guide_tool_max_newbies");
        this.getComponent().setState(Symbol.for("disabled"));
        break;
    }
    let tGuidePoints = tConn.GetIntFrom();
  }

  regMsgList(tBool) {
    let tMsgs = propList();
    tMsgs.setaProp(355, Symbol.for("handleInvitation"));
    tMsgs.setaProp(359, Symbol.for("handleInvitationFollowFailed"));
    tMsgs.setaProp(360, Symbol.for("handleInvitationCancelled"));
    tMsgs.setaProp(425, Symbol.for("handleInitTutorServiceStatus"));
    tMsgs.setaProp(426, Symbol.for("handleEnableTutorServiceStatus"));
    let tCmds = propList();
    tCmds.setaProp("MSG_ACCEPT_TUTOR_INVITATION", 357);
    tCmds.setaProp("MSG_REJECT_TUTOR_INVITATION", 358);
    tCmds.setaProp("MSG_INIT_TUTORSERVICE", 360);
    tCmds.setaProp("MSG_WAIT_FOR_TUTOR_INVITATIONS", 362);
    tCmds.setaProp("MSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS", 363);
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
