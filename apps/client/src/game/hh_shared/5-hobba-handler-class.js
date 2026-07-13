export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handle_cryforhelp(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tProps = propList("picker", EMPTY);
    tProps[Symbol.for("cry_id")] = tConn.GetStrFrom();
    tProps[Symbol.for("category")] = tConn.GetIntFrom();
    tProps[Symbol.for("time")] = tConn.GetStrFrom();
    tProps[Symbol.for("sender")] = tConn.GetStrFrom();
    tProps[Symbol.for("Msg")] = replaceChunks(tConn.GetStrFrom(), "<br>", RETURN);
    tProps[Symbol.for("url_id")] = tConn.GetStrFrom();
    tProps[Symbol.for("roomname")] = tConn.GetStrFrom();
    const ttype = tConn.GetIntFrom();
    if (ttype == -1) {
      tProps[Symbol.for("type")] = Symbol.for("instantMessage");
    } else {
      if (ttype == 0) {
        tProps[Symbol.for("type")] = Symbol.for("public");
        tProps[Symbol.for("casts")] = tConn.GetStrFrom();
        tProps[Symbol.for("port")] = tConn.GetIntFrom();
        tProps[Symbol.for("door")] = tConn.GetIntFrom();
        tProps[Symbol.for("room_id")] = tProps[Symbol.for("door")];
      } else {
        if (ttype == 1) {
          tProps[Symbol.for("type")] = Symbol.for("private");
          tProps[Symbol.for("marker")] = tConn.GetStrFrom();
          tProps[Symbol.for("room_id")] = string(tConn.GetIntFrom());
          tProps[Symbol.for("owner")] = string(tConn.GetStrFrom());
        } else {
          if (ttype == 2) {
            tProps[Symbol.for("type")] = Symbol.for("game");
            tProps[Symbol.for("casts")] = tConn.GetStrFrom();
            tProps[Symbol.for("port")] = tConn.GetIntFrom();
            tProps[Symbol.for("door")] = tConn.GetIntFrom();
            tProps[Symbol.for("room_id")] = tProps[Symbol.for("door")];
          }
        }
      }
    }
    if (tProps[Symbol.for("sender")] != "[AUTOMATIC]") {
      this.getComponent().receive_cryforhelp(tProps);
    }
  }

  handle_delete_cry(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tID = tConn.GetStrFrom();
    this.getComponent().deleteCry(tID);
  }

  handle_picked_cry(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tID = tConn.GetStrFrom();
    const tPicker = tConn.GetStrFrom();
    const tProps = propList("picker", tPicker, "cry_id", tID);
    this.getComponent().receive_pickedCry(tProps);
  }

  handle_cry_reply(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    let tText = convertSpecialChars(tConn.GetStrFrom(), 0);
    tText = replaceChunks(tText, "<br>", RETURN);
    executeMessage(Symbol.for("alert"), propList("title", "hobba_message_from", "Msg", tText));
    return 1;
  }

  regMsgList(tBool) {
    const tMsgs = propList();
    tMsgs.setaProp(148, Symbol.for("handle_cryforhelp"));
    tMsgs.setaProp(149, Symbol.for("handle_picked_cry"));
    tMsgs.setaProp(273, Symbol.for("handle_delete_cry"));
    tMsgs.setaProp(274, Symbol.for("handle_cry_reply"));
    const tCmds = propList();
    tCmds.setaProp("PICK_CRYFORHELP", 48);
    tCmds.setaProp("CALL_FOR_HELP", 86);
    tCmds.setaProp("CHANGECALLCATEGORY", 198);
    tCmds.setaProp("MESSAGETOCALLER", 199);
    tCmds.setaProp("MODERATIONACTION", 200);
    tCmds.setaProp("FOLLOW_CRYFORHELP", 323);
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
