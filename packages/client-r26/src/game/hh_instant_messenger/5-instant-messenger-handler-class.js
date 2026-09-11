export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handleIMMessage(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    if (tConn == 0) {
      return 0;
    }
    let tSenderId = string(tConn.GetIntFrom());
    let tText = tConn.GetStrFrom();
    this.getComponent().receiveMessage(tSenderId, tText);
    return 1;
  }

  handleIMInvitation(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    if (tConn == 0) {
      return 0;
    }
    let tSenderId = string(tConn.GetIntFrom());
    let tText = tConn.GetStrFrom();
    this.getComponent().receiveInvitation(tSenderId, tText);
    return 1;
  }

  handleIMError(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    if (tConn == 0) {
      return 0;
    }
    let tErrorCode = tConn.GetIntFrom();
    let tChatID = tConn.GetIntFrom();
    this.getComponent().receiveError(tChatID, tErrorCode);
    return 1;
  }

  handleInvitationError(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    if (tConn == 0) {
      return 0;
    }
    let tErrorCode = tConn.GetIntFrom();
    executeMessage(Symbol.for("alert"), getText("friend_invitation_error"));
  }

  regMsgList(tBool) {
    let tMsgs = propList();
    tMsgs.setaProp(134, Symbol.for("handleIMMessage"));
    tMsgs.setaProp(135, Symbol.for("handleIMInvitation"));
    tMsgs.setaProp(261, Symbol.for("handleIMError"));
    tMsgs.setaProp(262, Symbol.for("handleInvitationError"));
    let tCmds = propList();
    tCmds.setaProp("MESSENGER_SENDMSG", 33);
    tCmds.setaProp("FRIEND_INVITE", 34);
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
