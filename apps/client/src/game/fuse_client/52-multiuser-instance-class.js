export default class {
  pHost;
  pPort;
  pXtra;
  pMsgStruct;
  pConnectionOk;
  pConnectionSecured;
  pConnectionShouldBeKilled;
  pLastContent;
  pContentChunk;
  pCommandsPntr;
  pListenersPntr;
  pBinDataCallback;
  pLogMode;
  pLogfield;
  pUnicodeDirector;

  construct() {
    if (value(_player.productVersion) >= 11) {
      this.pUnicodeDirector = 1;
    } else {
      this.pUnicodeDirector = 0;
    }
    this.pDecoder = 0;
    this.pBinDataCallback = propList("client", EMPTY, "method", VOID);
    this.pConnectionShouldBeKilled = 0;
    this.pCommandsPntr = getStructVariable("struct.pointer");
    this.pListenersPntr = getStructVariable("struct.pointer");
    this.setLogMode(getIntVariable("connection.log.level", 0));
    this.pMsgStruct = getStructVariable("struct.message");
    return 1;
  }

  deconstruct() {
    return this.disconnect(1);
  }

  connect(tHost, tPort) {
    this.pHost = tHost;
    this.pPort = tPort;
    this.pXtra = new(xtra("Multiuser"));
    this.pXtra.setNetBufferLimits(16 * 1024, 100 * 1024, 100);
    const tErrCode = this.pXtra.setNetMessageHandler(Symbol.for("xtraMsgHandler"), this);
    if (tErrCode == 0) {
      this.pXtra.connectToNetServer("*", "*", this.pHost, this.pPort, "*", 0);
    } else {
      return error(this, `Creation of callback failed: ${tErrCode}`, Symbol.for("connect"), Symbol.for("major"));
    }
    return 1;
  }

  disconnect(tControlled) {
    if (tControlled != 1) {
      this.forwardMsg("DISCONNECT");
    } else {
    }
    this.pConnectionShouldBeKilled = 1;
    if (objectp(this.pXtra)) {
      this.pXtra.sendNetMessage(0, 0, numToChar(0));
      this.pXtra.setNetMessageHandler(VOID, VOID);
    }
    this.pXtra = VOID;
    if (!tControlled) {
      error(this, `Connection disconnected: ${this.getID()}`, Symbol.for("disconnect"), Symbol.for("minor"));
    }
    return 1;
  }

  connectionReady() {
    return this.pConnectionOk;
  }

  send(tMsg) {
    if (this.pConnectionOk && objectp(this.pXtra)) {
      if (this.pLogMode > 0) {
        this.log(`<-- ${tMsg}`);
      }
      let tLength = string(tMsg.length);
      while (tLength.length < 4) {
        tLength = `${tLength}${SPACE}`;
      }
      let tPartOne = tMsg.word[1];
      let tPartTwo = tMsg.word[`2..${tMsg.word.count}`];
      if (!this.pUnicodeDirector) {
        tPartOne = encodeUTF8(tPartOne);
        tPartTwo = encodeUTF8(tPartTwo);
      }
      this.pXtra.sendNetMessage("*", tPartOne, tPartTwo);
    } else {
      return error(this, `Connection not ready: ${this.getID()}`, Symbol.for("send"), Symbol.for("major"));
    }
    return 1;
  }

  sendBinary(tObject) {
    if (this.pConnectionOk && objectp(this.pXtra)) {
      return this.pXtra.sendNetMessage("*", "BINDATA", tObject);
    }
  }

  registerBinaryDataHandler(tObjID, tMethod) {
    this.pBinDataCallback.client = tObjID;
    this.pBinDataCallback.method = tMethod;
    return 1;
  }

  getWaitingMessagesCount() {
    return this.pXtra.getNumberWaitingNetMessages();
  }

  processWaitingMessages(tCount) {
    if (voidp(tCount)) {
      tCount = 1;
    }
    return this.pXtra.checkNetMessages(tCount);
  }

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
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case Symbol.for("listener"):
        if (tValue.ilk == Symbol.for("struct")) {
          this.pListenersPntr = tValue;
          return 1;
        } else {
          return 0;
        }
      case Symbol.for("commands"):
        if (tValue.ilk == Symbol.for("struct")) {
          this.pCommandsPntr = tValue;
          return 1;
        } else {
          return 0;
        }
      default:
        return 0;
    }
    return 0;
  }

  setLogMode(tMode) {
    if (tMode.ilk != Symbol.for("integer")) {
      return error(this, `Invalid argument: ${tMode}`, Symbol.for("setLogMode"), Symbol.for("minor"));
    }
    this.pLogMode = tMode;
    if (this.pLogMode == 2) {
      if (memberExists("connectionLog.text")) {
        this.pLogfield = member(getmemnum("connectionLog.text"));
      } else {
        this.pLogfield = VOID;
        this.pLogMode = 1;
      }
    }
    return 1;
  }

  xtraMsgHandler() {
    if (this.pConnectionShouldBeKilled != 0) {
      return 0;
    }
    this.pConnectionOk = 1;
    const tNewMsg = this.pXtra.getNetMessage();
    if (tNewMsg == VOID) {
      this.disconnect();
      return error(this, "getNetMessage() returned VOID.", Symbol.for("xtraMsgHandler"), Symbol.for("major"));
    }
    const tErrCode = tNewMsg.getaProp(Symbol.for("errorCode"));
    const tContent = tNewMsg.getaProp(Symbol.for("content"));
    const tSubject = tNewMsg.getaProp(Symbol.for("subject"));
    if (tErrCode != 0) {
      this.disconnect();
      return 0;
    }
    if (this.pLogMode > 0) {
      this.log(`--> ${tNewMsg.subject}${RETURN} ${tContent}`);
    }
    switch (tContent.ilk) {
      case Symbol.for("string"):
        this.forwardMsg(`${tNewMsg.subject}${RETURN}${tContent}`);
        break;
      case Symbol.for("void"):
        if (tSubject != "ConnectToNetServer") {
          error(this, "Message content is VOID!!!", Symbol.for("xtraMsgHandler"), Symbol.for("major"));
        }
        break;
      default:
        if (voidp(this.pBinDataCallback.method)) {
          return error(this, "No callback registered!", Symbol.for("xtraMsgHandler"), Symbol.for("major"));
        }
        if (!objectExists(this.pBinDataCallback.client)) {
          return error(this, "Callback client not found!", Symbol.for("xtraMsgHandler"), Symbol.for("major"));
        }
        call(this.pBinDataCallback.method, getObject(this.pBinDataCallback.client), tContent);
        break;
    }
  }

  forwardMsg(tMessage) {
    if (this.pConnectionShouldBeKilled == 1) {
      return 0;
    }
    tMessage = getStringServices().convertSpecialChars(tMessage);
    const tSubject = tMessage.word[1];
    const tCallbackList = this.pListenersPntr.getaProp(Symbol.for("value")).getaProp(tSubject);
    if (this.pMsgStruct.ilk != Symbol.for("struct")) {
      this.pMsgStruct = getStructVariable("struct.message");
      this.pMsgStruct.setaProp(Symbol.for("connection"), this);
      error(this, "Multiuser instance had problems...", Symbol.for("forwardMsg"), Symbol.for("major"));
    }
    if (listp(tCallbackList)) {
      const tObjMngr = getObjectManager();
      for (let i = 1; i <= count(tCallbackList); i++) {
        const tCallback = tCallbackList[i];
        const tObject = tObjMngr.GET(tCallback[1]);
        if (tObject != 0) {
          this.pMsgStruct.setaProp(Symbol.for("message"), tMessage);
          this.pMsgStruct.setaProp(Symbol.for("subject"), tSubject);
          this.pMsgStruct.setaProp(Symbol.for("content"), tMessage.word[`2..${tMessage.word.count}`]);
          call(tCallback[2], tObject, this.pMsgStruct);
          continue;
        }
        error(this, `Listening obj not found, removed: ${tCallback[1]}`, Symbol.for("forwardMsg"), Symbol.for("minor"));
        tCallbackList.deleteAt(1);
        i = i - 1;
      }
    } else {
      error(this, `Listener not found: ${tSubject} / ${this.getID()}`, Symbol.for("forwardMsg"), Symbol.for("minor"));
    }
  }

  log(tMsg) {
    if (!(the.runMode.contains("Author"))) {
      return 1;
    }
    switch (this.pLogMode) {
      case 1:
        put(`[Connection${this.getID()}] : ${tMsg}`);
        break;
      case 2:
        if (ilk(this.pLogfield, Symbol.for("member"))) {
          putAfter(this.pLogfield, `${RETURN}[Connection${this.getID()}] : ${tMsg}`);
        }
        break;
    }
  }
}
