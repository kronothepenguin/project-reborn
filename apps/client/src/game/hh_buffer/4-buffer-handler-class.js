export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  parseActiveObject(tConn) {
    if (!tConn) {
      return 0;
    }
    tObj = propList();
    tObj[Symbol.for("id")] = tConn.GetStrFrom();
    tObj[Symbol.for("class")] = tConn.GetStrFrom();
    tObj[Symbol.for("x")] = tConn.GetIntFrom();
    tObj[Symbol.for("y")] = tConn.GetIntFrom();
    tWidth = tConn.GetIntFrom();
    tHeight = tConn.GetIntFrom();
    tDirection = tConn.GetIntFrom() % 8;
    tObj[Symbol.for("direction")] = list(tDirection, tDirection, tDirection);
    tObj[Symbol.for("dimensions")] = list(tWidth, tHeight);
    tObj[Symbol.for("altitude")] = getLocalFloat(tConn.GetStrFrom());
    tObj[Symbol.for("colors")] = tConn.GetStrFrom();
    tRuntimeData = tConn.GetStrFrom();
    tExtra = tConn.GetIntFrom();
    tStuffData = tConn.GetStrFrom();
    if (tObj[Symbol.for("colors")] == EMPTY) {
      tObj[Symbol.for("colors")] = "0";
    }
    tObj[Symbol.for("props")] = propList(Symbol.for("runtimedata"), tRuntimeData, Symbol.for("extra"), tExtra, Symbol.for("stuffdata"), tStuffData);
    return tObj;
  }

  handle_stuffdataupdate(tMsg) {
    tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    tMsgTemp = propList();
    for (let tIndex = 1; tIndex <= tMsg.count; tIndex++) {
      tProp = tMsg.getPropAt(tIndex);
      tValue = tMsg[tIndex];
      tMsgTemp[tProp] = tValue;
    }
    tTargetID = tConn.GetStrFrom();
    return this.getComponent().bufferMessage(tMsgTemp, tTargetID, "active");
  }

  handle_activeobject_remove(tMsg) {
    return this.getComponent().removeObject(tMsg.content.word[1], "active");
  }

  handle_activeobject_update(tMsg) {
    if (ilk(tMsg) != Symbol.for("propList")) {
      return 0;
    }
    tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    tMsgTemp = propList();
    for (let tIndex = 1; tIndex <= tMsg.count; tIndex++) {
      tProp = tMsg.getPropAt(tIndex);
      tValue = tMsg[tIndex];
      tMsgTemp[tProp] = tValue;
    }
    tObj = this.parseActiveObject(tConn);
    if (!listp(tObj)) {
      return 0;
    }
    tID = tObj[Symbol.for("id")];
    return this.getComponent().bufferMessage(tMsgTemp, tID, "active");
  }

  handle_removeitem(tMsg) {
    return this.getComponent().removeObject(tMsg.content.word[1], "item");
  }

  handle_updateitem(tMsg) {
    tID = tMsg.content.word[1];
    return this.getComponent().bufferMessage(tMsg, tID, "item");
  }

  regMsgList(tBool) {
    tMsgs = propList();
    tMsgs.setaProp(88, Symbol.for("handle_stuffdataupdate"));
    tMsgs.setaProp(94, Symbol.for("handle_activeobject_remove"));
    tMsgs.setaProp(95, Symbol.for("handle_activeobject_update"));
    tMsgs.setaProp(84, Symbol.for("handle_removeitem"));
    tMsgs.setaProp(85, Symbol.for("handle_updateitem"));
    tCmds = propList();
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
