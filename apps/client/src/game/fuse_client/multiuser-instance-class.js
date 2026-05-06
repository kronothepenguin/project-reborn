import {
  EMPTY,
  RETURN,
  SPACE,
  VOID,
  _player,
  call,
  encodeUTF8,
  ilk,
  listp,
  member,
  numToChar,
  objectp,
  put,
  string,
  value,
  voidp,
  wordOf,
} from "../../director";

export default function () {
  let tErrCode, tMsg, tLength, tPartOne, tPartTwo, tNewMsg, tContent, tSubject;
  let tCallbackList, tObjMngr, tCallback, tObject, i;

  return {
    pHost: VOID,
    pPort: VOID,
    pXtra: VOID,
    pMsgStruct: VOID,
    pConnectionOk: VOID,
    pConnectionSecured: VOID,
    pConnectionShouldBeKilled: VOID,
    pLastContent: VOID,
    pContentChunk: VOID,
    pCommandsPntr: VOID,
    pListenersPntr: VOID,
    pBinDataCallback: VOID,
    pLogMode: VOID,
    pLogfield: VOID,
    pUnicodeDirector: VOID,
    pDecoder: VOID,

    construct() {
      if (value(_player.productVersion) >= 11) {
        this.pUnicodeDirector = 1;
      } else {
        this.pUnicodeDirector = 0;
      }
      this.pDecoder = 0;
      this.pBinDataCallback = { client: EMPTY, method: VOID };
      this.pConnectionShouldBeKilled = 0;
      this.pCommandsPntr = _director.getStructVariable("struct.pointer");
      this.pListenersPntr = _director.getStructVariable("struct.pointer");
      this.setLogMode(_director.getIntVariable("connection.log.level", 0));
      this.pMsgStruct = _director.getStructVariable("struct.message");
      return 1;
    },

    deconstruct() {
      return this.disconnect(1);
    },

    connect(tHost, tPort) {
      this.pHost = tHost;
      this.pPort = tPort;
      this.pXtra = new(_director.xtra("Multiuser"));
      this.pXtra.setNetBufferLimits(16 * 1024, 100 * 1024, 100);
      tErrCode = this.pXtra.setNetMessageHandler(Symbol.for("xtraMsgHandler"), this);
      if (tErrCode === 0) {
        this.pXtra.connectToNetServer("*", "*", this.pHost, this.pPort, "*", 0);
      } else {
        return _director.error(this, "Creation of callback failed:" + " " + tErrCode, Symbol.for("connect"), Symbol.for("major"));
      }
      return 1;
    },

    disconnect(tControlled) {
      if (tControlled !== 1) {
        this.forwardMsg("DISCONNECT");
      }
      this.pConnectionShouldBeKilled = 1;
      if (objectp(this.pXtra)) {
        this.pXtra.sendNetMessage(0, 0, numToChar(0));
        this.pXtra.setNetMessageHandler(VOID, VOID);
      }
      this.pXtra = VOID;
      if (!tControlled) {
        _director.error(this, "Connection disconnected:" + " " + this.getID(), Symbol.for("disconnect"), Symbol.for("minor"));
      }
      return 1;
    },

    connectionReady() {
      return this.pConnectionOk;
    },

    send(tMsg) {
      if (this.pConnectionOk && objectp(this.pXtra)) {
        if (this.pLogMode > 0) {
          this.log("<--" + " " + tMsg);
        }
        tLength = string(tMsg.length);
        while (tLength.length < 4) {
          tLength = tLength + SPACE;
        }
        tPartOne = wordOf(tMsg)[1];
        tPartTwo = wordOf(tMsg).slice(2, wordOf(tMsg).count);
        if (!this.pUnicodeDirector) {
          tPartOne = encodeUTF8(tPartOne);
          tPartTwo = encodeUTF8(tPartTwo);
        }
        this.pXtra.sendNetMessage("*", tPartOne, tPartTwo);
      } else {
        return _director.error(this, "Connection not ready:" + " " + this.getID(), Symbol.for("send"), Symbol.for("major"));
      }
      return 1;
    },

    sendBinary(tObject) {
      if (this.pConnectionOk && objectp(this.pXtra)) {
        return this.pXtra.sendNetMessage("*", "BINDATA", tObject);
      }
    },

    registerBinaryDataHandler(tObjID, tMethod) {
      this.pBinDataCallback.client = tObjID;
      this.pBinDataCallback.method = tMethod;
      return 1;
    },

    getWaitingMessagesCount() {
      return this.pXtra.getNumberWaitingNetMessages();
    },

    processWaitingMessages(tCount) {
      if (voidp(tCount)) {
        tCount = 1;
      }
      return this.pXtra.checkNetMessages(tCount);
    },

    getProperty(tProp) {
      switch (tProp) {
        case Symbol.for("host"):
          return this.pHost;
        case Symbol.for("port"):
          return this.pPort;
        case Symbol.for("listener"):
          return this.pListenersPntr;
        case Symbol.for("commands"):
          return this.pCommandsPntr;
        case Symbol.for("message"):
          return this.pMsgStruct;
      }
      return 0;
    },

    setProperty(tProp, tValue) {
      switch (tProp) {
        case Symbol.for("listener"):
          if (ilk(tValue) === Symbol.for("struct")) {
            this.pListenersPntr = tValue;
            return 1;
          } else {
            return 0;
          }
        case Symbol.for("commands"):
          if (ilk(tValue) === Symbol.for("struct")) {
            this.pCommandsPntr = tValue;
            return 1;
          } else {
            return 0;
          }
        default:
          return 0;
      }
      return 0;
    },

    setLogMode(tMode) {
      if (ilk(tMode) !== Symbol.for("integer")) {
        return _director.error(this, "Invalid argument:" + " " + tMode, Symbol.for("setLogMode"), Symbol.for("minor"));
      }
      this.pLogMode = tMode;
      if (this.pLogMode === 2) {
        if (_director.memberExists("connectionLog.text")) {
          this.pLogfield = member(_director.getmemnum("connectionLog.text"));
        } else {
          this.pLogfield = VOID;
          this.pLogMode = 1;
        }
      }
      return 1;
    },

    xtraMsgHandler() {
      if (this.pConnectionShouldBeKilled !== 0) {
        return 0;
      }
      this.pConnectionOk = 1;
      tNewMsg = this.pXtra.getNetMessage();
      if (tNewMsg === VOID) {
        this.disconnect();
        return _director.error(this, "getNetMessage() returned VOID.", Symbol.for("xtraMsgHandler"), Symbol.for("major"));
      }
      tErrCode = tNewMsg.getaProp(Symbol.for("errorCode"));
      tContent = tNewMsg.getaProp(Symbol.for("content"));
      tSubject = tNewMsg.getaProp(Symbol.for("subject"));
      if (tErrCode !== 0) {
        this.disconnect();
        return 0;
      }
      if (this.pLogMode > 0) {
        this.log("-->" + " " + tNewMsg.subject + RETURN + tContent);
      }
      switch (ilk(tContent)) {
        case Symbol.for("string"):
          this.forwardMsg(tNewMsg.subject + RETURN + tContent);
          break;
        case Symbol.for("void"):
          if (tSubject !== "ConnectToNetServer") {
            _director.error(this, "Message content is VOID!!!", Symbol.for("xtraMsgHandler"), Symbol.for("major"));
          }
          break;
        default:
          if (voidp(this.pBinDataCallback.method)) {
            return _director.error(this, "No callback registered!", Symbol.for("xtraMsgHandler"), Symbol.for("major"));
          }
          if (!_director.objectExists(this.pBinDataCallback.client)) {
            return _director.error(this, "Callback client not found!", Symbol.for("xtraMsgHandler"), Symbol.for("major"));
          }
          call(this.pBinDataCallback.method, _director.getObject(this.pBinDataCallback.client), tContent);
      }
    },

    forwardMsg(tMessage) {
      if (this.pConnectionShouldBeKilled === 1) {
        return 0;
      }
      tMessage = _director.getStringServices().convertSpecialChars(tMessage);
      tSubject = wordOf(tMessage)[1];
      tCallbackList = this.pListenersPntr.getaProp(Symbol.for("value")).getaProp(tSubject);
      if (ilk(this.pMsgStruct) !== Symbol.for("struct")) {
        this.pMsgStruct = _director.getStructVariable("struct.message");
        this.pMsgStruct.setaProp(Symbol.for("connection"), this);
        _director.error(this, "Multiuser instance had problems...", Symbol.for("forwardMsg"), Symbol.for("major"));
      }
      if (listp(tCallbackList)) {
        tObjMngr = _director.getObjectManager();
        for (let i = 1; i <= tCallbackList.count; i++) {
          tCallback = tCallbackList[i];
          tObject = tObjMngr.GET(tCallback[1]);
          if (tObject !== 0) {
            this.pMsgStruct.setaProp(Symbol.for("message"), tMessage);
            this.pMsgStruct.setaProp(Symbol.for("subject"), tSubject);
            this.pMsgStruct.setaProp(Symbol.for("content"), wordOf(tMessage).slice(2, wordOf(tMessage).count));
            call(tCallback[2], tObject, this.pMsgStruct);
            continue;
          }
          _director.error(this, "Listening obj not found, removed:" + " " + tCallback[1], Symbol.for("forwardMsg"), Symbol.for("minor"));
          tCallbackList.deleteAt(1);
          i = i - 1;
        }
      } else {
        _director.error(this, "Listener not found:" + " " + tSubject + " " + "/" + " " + this.getID(), Symbol.for("forwardMsg"), Symbol.for("minor"));
      }
    },

    log(tMsg) {
      if (!(the.runMode.includes("Author"))) {
        return 1;
      }
      switch (this.pLogMode) {
        case 1:
          put("[Connection" + " " + this.getID() + "] :" + " " + tMsg);
          break;
        case 2:
          if (ilk(this.pLogfield, Symbol.for("member"))) {
            this.pLogfield.text = this.pLogfield.text + RETURN + "[Connection" + " " + this.getID() + "] :" + " " + tMsg;
          }
          break;
      }
    },
  };
}
