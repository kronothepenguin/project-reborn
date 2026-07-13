export default class {
  pListenerList;
  pCommandsList;
  pClassString;
  pLastMessageData;
  pItemList;

  construct() {
    this.pLastMessageData = propList();
    this.pItemList = list();
    this.pItemList.sort();
    this.pListenerList = propList();
    this.pListenerList.sort();
    this.pCommandsList = propList();
    this.pCommandsList.sort();
    this.pClassString = "connection.instance.class";
    return 1;
  }

  create(tID, tHost, tPort) {
    if (!symbolp(tID) && !stringp(tID)) {
      return error(this, `Symbol or string expected: ${tID}`, Symbol.for("create"), Symbol.for("major"));
    }
    if (!stringp(tHost)) {
      return error(this, `String expected: ${tHost}`, Symbol.for("create"), Symbol.for("major"));
    }
    if (!integerp(tPort)) {
      return error(this, `Integer expected: ${tPort}`, Symbol.for("create"), Symbol.for("major"));
    }
    if ((getIntVariable("connection.log.level") == 2) && (the.runMode.contains("Author"))) {
      let tLogField;
      if (!memberExists("connectionLog.text")) {
        tLogField = member(createMember("connectionLog.text", Symbol.for("field")));
        tLogField.boxType = Symbol.for("scroll");
        tLogField.rect = rect(0, 0, 300, 250);
      } else {
        tLogField = member(getmemnum("connectionLog.text"));
      }
      tLogField.text = `${tLogField.text}${RETURN}Connection logging ${tID}${RETURN}`;
    }
    if (!this.exists(tID)) {
      if (!createObject(tID, getClassVariable(this.pClassString))) {
        return error(this, `Failed to initialize connection: ${tID}`, Symbol.for("create"), Symbol.for("major"));
      }
      this.pItemList.add(tID);
    }
    let tMsgPtr;
    if (voidp(this.pListenerList[tID])) {
      tMsgPtr = getStructVariable("struct.pointer");
      tMsgPtr.setaProp(Symbol.for("value"), propList());
      this.pListenerList[tID] = tMsgPtr;
    } else {
      tMsgPtr = this.pListenerList[tID];
    }
    let tCmdPtr;
    if (voidp(this.pCommandsList[tID])) {
      tCmdPtr = getStructVariable("struct.pointer");
      tCmdPtr.setaProp(Symbol.for("value"), propList());
      this.pCommandsList[tID] = tCmdPtr;
    } else {
      tCmdPtr = this.pCommandsList[tID];
    }
    this.GET(tID).setProperty(Symbol.for("listener"), tMsgPtr);
    this.GET(tID).setProperty(Symbol.for("commands"), tCmdPtr);
    this.GET(tID).connect(tHost, tPort);
    return 1;
  }

  closeAll() {
    for (let i = 1; i <= this.pItemList.count; i++) {
      if (objectExists(this.pItemList[i])) {
        removeObject(this.pItemList[i]);
      }
    }
    this.pItemList = list();
  }

  registerListener(tID, tObjID, tMsgList) {
    if ((tID.ilk != Symbol.for("symbol")) && (tID.ilk != Symbol.for("string"))) {
      return error(this, `Invalid message header ID: ${tID}`, Symbol.for("registerListener"), Symbol.for("major"));
    }
    const tObject = getObject(tObjID);
    if (tObject == 0) {
      return error(this, `Object not found: ${tObjID}`, Symbol.for("registerListener"), Symbol.for("major"));
    }
    let tPtr;
    if (voidp(this.pListenerList[tID])) {
      tPtr = getStructVariable("struct.pointer");
      tPtr.setaProp(Symbol.for("value"), propList());
      this.pListenerList[tID] = tPtr;
    } else {
      tPtr = this.pListenerList[tID];
    }
    for (let i = 1; i <= tMsgList.count; i++) {
      const tMsg = tMsgList.getPropAt(i);
      const tMethod = tMsgList[i];
      if (!tObject.handler(tMethod)) {
        error(this, `Method not found: ${tMethod}/${tObjID}`, Symbol.for("registerListener"), Symbol.for("major"));
        continue;
      }
      if (voidp(tPtr.getaProp(Symbol.for("value")).getaProp(tMsg))) {
        tPtr.getaProp(Symbol.for("value")).setaProp(tMsg, list());
      }
      tPtr.getaProp(Symbol.for("value")).getaProp(tMsg).add(list(tObjID, tMethod));
    }
    return 1;
  }

  unregisterListener(tID, tObjID, tMsgList) {
    if ((tID.ilk != Symbol.for("symbol")) && (tID.ilk != Symbol.for("string"))) {
      return error(this, `Invalid message header ID: ${tID}`, Symbol.for("registerListener"), Symbol.for("major"));
    }
    const tPtr = this.pListenerList[tID];
    if (voidp(tPtr)) {
      return 0;
    }
    const tList = tPtr.getaProp(Symbol.for("value"));
    for (let i = 1; i <= tMsgList.count; i++) {
      const tMsg = tMsgList.getPropAt(i);
      const tMethod = tMsgList[i];
      if (voidp(tList.getaProp(tMsg))) {
        error(this, `No listeners for message: ${tMsg} / ${tID}`, Symbol.for("unregisterListener"), Symbol.for("minor"));
        continue;
      }
      for (let j = 1; j <= tList.getaProp(tMsg).count; j++) {
        const tCallback = tList.getaProp(tMsg)[j];
        if ((tCallback[1] == tObjID) && (tCallback[2] == tMethod)) {
          tList.getaProp(tMsg).deleteAt(j);
          break;
        }
      }
    }
    return 1;
  }

  registerCommands(tID, tObjID, tCmdList) {
    if ((tID.ilk != Symbol.for("symbol")) && (tID.ilk != Symbol.for("string"))) {
      return error(this, `Invalid message header ID: ${tID}`, Symbol.for("registerListener"), Symbol.for("major"));
    }
    let tPtr;
    if (voidp(this.pCommandsList[tID])) {
      tPtr = getStructVariable("struct.pointer");
      tPtr.setaProp(Symbol.for("value"), propList());
      this.pCommandsList[tID] = tPtr;
    } else {
      tPtr = this.pCommandsList[tID];
    }
    for (let i = 1; i <= tCmdList.count; i++) {
      const tCmd = tCmdList.getPropAt(i);
      const tNum = tCmdList[i];
      const tOld = tPtr.getaProp(Symbol.for("value")).getaProp(tCmd);
      const tBy1 = numToChar(bitOr(64, tNum / 64));
      const tBy2 = numToChar(bitOr(64, bitAnd(63, tNum)));
      const tNew = `${tBy1}${tBy2}`;
      if (tOld != VOID) {
        if (tOld != tNew) {
          error(this, `Registered command override: ${tCmd} / ${tOld} -> ${tNew}`, Symbol.for("minor"));
        }
      }
      tPtr.getaProp(Symbol.for("value")).setaProp(tCmd, tNew);
    }
    return 1;
  }

  unregisterCommands(tID, tObjID, tCmdList) {
    if ((tID.ilk != Symbol.for("symbol")) && (tID.ilk != Symbol.for("string"))) {
      return error(this, `Invalid message header ID: ${tID}`, Symbol.for("registerListener"), Symbol.for("major"));
    }
    const tPtr = this.pCommandsList[tID];
    if (voidp(tPtr)) {
      return 0;
    }
    return 1;
  }

  registerLastMessage(tmessageId, tMessage) {
    this.pLastMessageData[Symbol.for("id")] = tmessageId;
    this.pLastMessageData[Symbol.for("message")] = tMessage;
  }

  getLastMessageData() {
    return this.pLastMessageData[Symbol.for("id")];
  }
}
