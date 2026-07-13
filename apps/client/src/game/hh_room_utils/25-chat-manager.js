export default class {
  pDisplayObjName;

  construct() {
    this.regMsgList(1);
    this.pDisplayObjName = "chat_display_object";
    createObject(this.pDisplayObjName, "Chat Display");
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("clearChat"));
  }

  deconstruct() {
    this.regMsgList(0);
    this.clearChat();
    if (objectExists(this.pDisplayObjName)) {
      removeObject(this.pDisplayObjName);
    }
  }

  clearChat() {
    if (objectExists(this.pDisplayObjName)) {
      let tObj = getObject(this.pDisplayObjName);
      tObj.clearAll();
    }
  }

  enterChatMessage(tChatMode, tRoomUserId, tChatMessage) {
    let tDisplayObj = getObject(this.pDisplayObjName);
    tDisplayObj.insertChatMessage(tChatMode, tRoomUserId, tChatMessage);
  }

  showBalloons() {
    let tDisplayObj = getObject(this.pDisplayObjName);
    tDisplayObj.showBalloons(1);
  }

  hideBalloons() {
    let tDisplayObj = getObject(this.pDisplayObjName);
    tDisplayObj.showBalloons(0);
  }

  removeBalloons() {
    let tDisplayObj = getObject(this.pDisplayObjName);
    tDisplayObj.clearAll();
  }

  handle_chat(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tuser = string(tConn.GetIntFrom());
    let tChat = tConn.GetStrFrom();
    let tMode = "";
    switch (tMsg.getaProp(Symbol.for("subject"))) {
      case 24:
        tMode = "CHAT";
        break;
      case 25:
        tMode = "WHISPER";
        break;
      case 26:
        tMode = "SHOUT";
        break;
    }
    if (tChat == EMPTY) {
      tMode = "UNHEARD";
    }
    this.enterChatMessage(tMode, tuser, tChat);
    getThread(Symbol.for("room")).getComponent().setUserTypingStatus(tuser, 0);
  }

  regMsgList(tBool) {
    let tMsgs = propList();
    tMsgs.setaProp(24, Symbol.for("handle_chat"));
    tMsgs.setaProp(25, Symbol.for("handle_chat"));
    tMsgs.setaProp(26, Symbol.for("handle_chat"));
    let tCmds = propList();
    tCmds.setaProp("CHAT", 52);
    tCmds.setaProp("SHOUT", 55);
    tCmds.setaProp("WHISPER", 56);
    if (tBool) {
      registerListener(getVariable("connection.room.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.room.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.room.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.room.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
