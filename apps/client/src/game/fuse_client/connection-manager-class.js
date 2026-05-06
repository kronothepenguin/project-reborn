import {
  VOID,
  symbolp,
  stringp,
  integerp,
  ilk,
  propList,
  list,
  rect,
  RETURN,
  bitAnd,
  bitOr,
  numToChar,
} from "../../director";

export default function () {
  let tID, tHost, tPort, tLogField, tMsgPtr, tCmdPtr;
  let tObject, tPtr, tMsgList, tMsg, tMethod, i, j, tCallback;
  let tCmdList, tCmd, tNum, tOld, tBy1, tBy2, tNew;
  let tList, tmessageId, tMessage;

  return {
    pListenerList: VOID,
    pCommandsList: VOID,
    pClassString: VOID,
    pLastMessageData: VOID,
    pItemList: VOID,

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
    },

    create(tID, tHost, tPort) {
      if (!symbolp(tID) && !stringp(tID)) {
        return _director.error(this, "Symbol or string expected: " + tID, Symbol.for("create"), Symbol.for("major"));
      }
      if (!stringp(tHost)) {
        return _director.error(this, "String expected: " + tHost, Symbol.for("create"), Symbol.for("major"));
      }
      if (!integerp(tPort)) {
        return _director.error(this, "Integer expected: " + tPort, Symbol.for("create"), Symbol.for("major"));
      }
      if ((_director.getIntVariable("connection.log.level") === 2) && (the.runMode.includes("Author"))) {
        if (!_director.memberExists("connectionLog.text")) {
          tLogField = member(_director.createMember("connectionLog.text", Symbol.for("field")));
          tLogField.boxType = Symbol.for("scroll");
          tLogField.rect = rect(0, 0, 300, 250);
        } else {
          tLogField = member(_director.getmemnum("connectionLog.text"));
        }
        tLogField.text = tLogField.text + RETURN + "Connection logging " + tID + RETURN;
      }
      if (!this.exists(tID)) {
        if (!_director.createObject(tID, _director.getClassVariable(this.pClassString))) {
          return _director.error(this, "Failed to initialize connection: " + tID, Symbol.for("create"), Symbol.for("major"));
        }
        this.pItemList.add(tID);
      }
      if (voidp(this.pListenerList[tID])) {
        tMsgPtr = _director.getStructVariable("struct.pointer");
        tMsgPtr.setaProp(Symbol.for("value"), propList());
        this.pListenerList[tID] = tMsgPtr;
      } else {
        tMsgPtr = this.pListenerList[tID];
      }
      if (voidp(this.pCommandsList[tID])) {
        tCmdPtr = _director.getStructVariable("struct.pointer");
        tCmdPtr.setaProp(Symbol.for("value"), propList());
        this.pCommandsList[tID] = tCmdPtr;
      } else {
        tCmdPtr = this.pCommandsList[tID];
      }
      this.GET(tID).setProperty(Symbol.for("listener"), tMsgPtr);
      this.GET(tID).setProperty(Symbol.for("commands"), tCmdPtr);
      this.GET(tID).connect(tHost, tPort);
      return 1;
    },

    closeAll() {
      for (let i = 1; i <= this.pItemList.count; i++) {
        if (_director.objectExists(this.pItemList[i])) {
          _director.removeObject(this.pItemList[i]);
        }
      }
      this.pItemList = list();
    },

    registerListener(tID, tObjID, tMsgList) {
      if ((ilk(tID) !== Symbol.for("symbol")) && (ilk(tID) !== Symbol.for("string"))) {
        return _director.error(this, "Invalid message header ID: " + tID, Symbol.for("registerListener"), Symbol.for("major"));
      }
      tObject = _director.getObject(tObjID);
      if (tObject === 0) {
        return _director.error(this, "Object not found: " + tObjID, Symbol.for("registerListener"), Symbol.for("major"));
      }
      if (voidp(this.pListenerList[tID])) {
        tPtr = _director.getStructVariable("struct.pointer");
        tPtr.setaProp(Symbol.for("value"), propList());
        this.pListenerList[tID] = tPtr;
      } else {
        tPtr = this.pListenerList[tID];
      }
      for (let i = 1; i <= tMsgList.count; i++) {
        tMsg = tMsgList.getPropAt(i);
        tMethod = tMsgList[i];
        if (!tObject.handler(tMethod)) {
          _director.error(this, "Method not found: " + tMethod + "/" + tObjID, Symbol.for("registerListener"), Symbol.for("major"));
          continue;
        }
        if (voidp(tPtr.getaProp(Symbol.for("value")).getaProp(tMsg))) {
          tPtr.getaProp(Symbol.for("value")).setaProp(tMsg, list());
        }
        tPtr.getaProp(Symbol.for("value")).getaProp(tMsg).add([tObjID, tMethod]);
      }
      return 1;
    },

    unregisterListener(tID, tObjID, tMsgList) {
      if ((ilk(tID) !== Symbol.for("symbol")) && (ilk(tID) !== Symbol.for("string"))) {
        return _director.error(this, "Invalid message header ID: " + tID, Symbol.for("registerListener"), Symbol.for("major"));
      }
      tPtr = this.pListenerList[tID];
      if (voidp(tPtr)) {
        return 0;
      }
      tList = tPtr.getaProp(Symbol.for("value"));
      for (let i = 1; i <= tMsgList.count; i++) {
        tMsg = tMsgList.getPropAt(i);
        tMethod = tMsgList[i];
        if (voidp(tList.getaProp(tMsg))) {
          _director.error(this, "No listeners for message: " + tMsg + " / " + tID, Symbol.for("unregisterListener"), Symbol.for("minor"));
          continue;
        }
        for (let j = 1; j <= tList.getaProp(tMsg).count; j++) {
          tCallback = tList.getaProp(tMsg)[j];
          if ((tCallback[1] === tObjID) && (tCallback[2] === tMethod)) {
            tList.getaProp(tMsg).deleteAt(j);
            break;
          }
        }
      }
      return 1;
    },

    registerCommands(tID, tObjID, tCmdList) {
      if ((ilk(tID) !== Symbol.for("symbol")) && (ilk(tID) !== Symbol.for("string"))) {
        return _director.error(this, "Invalid message header ID: " + tID, Symbol.for("registerListener"), Symbol.for("major"));
      }
      if (voidp(this.pCommandsList[tID])) {
        tPtr = _director.getStructVariable("struct.pointer");
        tPtr.setaProp(Symbol.for("value"), propList());
        this.pCommandsList[tID] = tPtr;
      } else {
        tPtr = this.pCommandsList[tID];
      }
      for (let i = 1; i <= tCmdList.count; i++) {
        tCmd = tCmdList.getPropAt(i);
        tNum = tCmdList[i];
        tOld = tPtr.getaProp(Symbol.for("value")).getaProp(tCmd);
        tBy1 = numToChar(bitOr(64, tNum / 64));
        tBy2 = numToChar(bitOr(64, bitAnd(63, tNum)));
        tNew = tBy1 + tBy2;
        if (tOld !== VOID) {
          if (tOld !== tNew) {
            _director.error(this, "Registered command override: " + tCmd + " / " + tOld + "->" + tNew, Symbol.for("minor"));
          }
        }
        tPtr.getaProp(Symbol.for("value")).setaProp(tCmd, tNew);
      }
      return 1;
    },

    unregisterCommands(tID, tObjID, tCmdList) {
      if ((ilk(tID) !== Symbol.for("symbol")) && (ilk(tID) !== Symbol.for("string"))) {
        return _director.error(this, "Invalid message header ID: " + tID, Symbol.for("registerListener"), Symbol.for("major"));
      }
      tPtr = this.pCommandsList[tID];
      if (voidp(tPtr)) {
        return 0;
      }
      return 1;
    },

    registerLastMessage(tmessageId, tMessage) {
      this.pLastMessageData[Symbol.for("id")] = tmessageId;
      this.pLastMessageData[Symbol.for("message")] = tMessage;
    },

    getLastMessageData() {
      return this.pLastMessageData[Symbol.for("id")];
    },
  };
}
