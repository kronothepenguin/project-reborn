export default class {
  pHost;
  pPort;
  pXtra;
  pMsgStruct;
  pConnectionOk;
  pConnectionSecured;
  pConnectionShouldBeKilled;
  pEncryptionOn;
  pDecoder;
  pEncoder;
  pLastContent;
  pContentChunk;
  pLogMode;
  pLogfield;
  pCommandsPntr;
  pListenersPntr;
  pDecipherOn;
  pD;
  pUnicodeDirector;
  pLastError;
  pConnectionEstablishing;
  pConnectionRetryDelay;
  pConnectionRetryCount;
  pConnectionTries;

  construct() {
    if (value(_player.productVersion) >= 11) {
      this.pUnicodeDirector = 1;
    } else {
      this.pUnicodeDirector = 0;
    }
    this.pDecipherOn = 0;
    this.pEncryptionOn = 0;
    this.pMsgStruct = getStructVariable("struct.message");
    this.pMsgStruct.setaProp(Symbol.for("connection"), this);
    this.pDecoder = 0;
    this.pEncoder = 0;
    this.pLastContent = EMPTY;
    this.pConnectionShouldBeKilled = 0;
    this.pCommandsPntr = getStructVariable("struct.pointer");
    this.pListenersPntr = getStructVariable("struct.pointer");
    this.setLogMode(getIntVariable("connection.log.level", 0));
    this.pLastError = 0;
    this.pConnectionEstablishing = 1;
    this.pConnectionRetryDelay = getIntVariable("connection.retry.delay", 2000);
    this.pConnectionRetryCount = getIntVariable("connection.retry.count", 5);
    this.pConnectionTries = 0;
    this.pHost = VOID;
    this.pPort = VOID;
    return 1;
  }

  deconstruct() {
    return this.disconnect(1);
  }

  connect(tHost, tPort) {
    if (voidp(this.pHost) && voidp(this.pPort)) {
      sendProcessTracking(30);
      this.pHost = tHost;
      this.pPort = tPort;
    }
    this.pConnectionTries = this.pConnectionTries + 1;
    if (timeoutExists("RetryConnection")) {
      removeTimeout("RetryConnection");
    }
    if (!checkForXtra("Multiusr")) {
      return fatalError(propList("error", "mus_xtra_not_found"));
    }
    this.pXtra = new(xtra("Multiuser"));
    this.pXtra.setNetBufferLimits(16 * 1024, 100 * 1024, 100);
    const tErrCode = this.pXtra.setNetMessageHandler(Symbol.for("xtraMsgHandler"), this);
    if (tErrCode == 0) {
      const tConnectErrorCode = this.pXtra.connectToNetServer("*", "*", this.pHost, this.pPort, "*", 1);
    } else {
      return error(this, `Creation of callback failed: ${tErrCode}`, Symbol.for("connect"), Symbol.for("major"));
    }
    if (tConnectErrorCode != 0) {
      return fatalError(propList("error", "connect_to_net_server"));
    }
    this.pLastContent = EMPTY;
    if (this.pLogMode > 0) {
      this.log(`Connection initialized: ${this.getID()} ${this.pHost} ${this.pPort}`);
    }
    return 1;
  }

  disconnect(tControlled) {
    if (tControlled != 1) {
      this.forwardMsg(-1);
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
    return this.pConnectionOk && this.pConnectionSecured;
  }

  setDecoder(tDecoder) {
    if (!objectp(tDecoder)) {
      return error(this, `Decoder object expected: ${tDecoder}`, Symbol.for("setDecoder"), Symbol.for("major"));
    } else {
      this.pDecoder = tDecoder;
      return 1;
    }
  }

  getDecoder() {
    return this.pDecoder;
  }

  setEncoder(tEncoder) {
    if (!objectp(tEncoder)) {
      return error(this, `Encoder object expected: ${tEncoder}`, Symbol.for("setEncoder"), Symbol.for("major"));
    } else {
      this.pEncoder = tEncoder;
      return 1;
    }
  }

  getEncoder() {
    return this.pEncoder;
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

  getLogMode() {
    return this.pLogMode;
  }

  setEncryption(tBoolean) {
    this.pEncryptionOn = tBoolean;
    this.pConnectionSecured = 1;
    return 1;
  }

  send(tCmd, tMsg) {
    if (this.pConnectionShouldBeKilled) {
      return 0;
    }
    if (tMsg.ilk == Symbol.for("propList")) {
      return this.sendNew(tCmd, tMsg);
    }
    if (!(this.pConnectionOk && objectp(this.pXtra))) {
      return error(this, `Connection not ready: ${this.getID()}`, Symbol.for("send"), Symbol.for("major"));
    }
    if (tMsg.ilk != Symbol.for("string")) {
      tMsg = string(tMsg);
    }
    if (!((this.pEncryptionOn && objectp(this.pEncoder)) && this.pUnicodeDirector)) {
      for (let i = 1; i <= tMsg.length; i++) {
        if (charToNum(tMsg.char[i]) > 127) {
          return error(this, "Encryption required for non-ascii content with SW11", Symbol.for("send"), Symbol.for("critical"));
        }
      }
    }
    tMsg = encodeUTF8(tMsg);
    let tStr;
    if (tCmd.ilk != Symbol.for("integer")) {
      tStr = tCmd;
      tCmd = this.pCommandsPntr.getaProp(Symbol.for("value")).getaProp(tStr);
    }
    if (tCmd.ilk == Symbol.for("void")) {
      return error(this, "Unrecognized command!", Symbol.for("send"), Symbol.for("major"));
    }
    if (this.pLogMode > 0) {
      this.log(`<-- ${tStr} (${tCmd}) ${tMsg}`);
    }
    tMsg = `${tCmd}${tMsg}`;
    let tLength = 0;
    for (let tChar = 1; tChar <= length(tMsg); tChar++) {
      const tCharNum = charToNum(char(tChar).of(tMsg));
      tLength = tLength + 1 + ((tCharNum > 255) && (tCharNum % 256));
    }
    const tL1 = numToChar(bitOr(bitAnd(tLength, 63), 64));
    const tL2 = numToChar(bitOr(bitAnd(tLength / 64, 63), 64));
    const tL3 = numToChar(bitOr(bitAnd(tLength / 4096, 63), 64));
    tMsg = `${tL3}${tL2}${tL1}${tMsg}`;
    if (this.pEncryptionOn && objectp(this.pEncoder)) {
      tMsg = this.pEncoder.lzNP3UFWUtBTs1stvSHGgk(tMsg);
    }
    this.pXtra.sendNetMessage(0, 0, tMsg);
    return 1;
  }

  sendNew(tCmd, tParmArr) {
    if (!(this.pConnectionOk && objectp(this.pXtra))) {
      return error(this, `Connection not ready: ${this.getID()}`, Symbol.for("send"), Symbol.for("major"));
    }
    let tMsg = EMPTY;
    let tLength = 2;
    if (listp(tParmArr)) {
      for (let i = 1; i <= tParmArr.count; i++) {
        const ttype = tParmArr.getPropAt(i);
        let tParm = tParmArr[i];
        switch (ttype) {
          case Symbol.for("string"):
            tParm = encodeUTF8(tParm);
            let tLen = 0;
            for (let tChar = 1; tChar <= length(tParm); tChar++) {
              const tNum = charToNum(char(tChar).of(tParm));
              tLen = tLen + 1 + ((tNum > 255) && (tNum % 256));
            }
            const tBy1 = numToChar(bitOr(64, tLen / 64));
            const tBy2 = numToChar(bitOr(64, bitAnd(63, tLen)));
            tMsg = `${tMsg}${tBy1}${tBy2}${tParm}`;
            tLength = tLength + tLen + 2;
            break;
          case Symbol.for("short"):
            const tBy1s = numToChar(bitOr(64, tParm / 64));
            const tBy2s = numToChar(bitOr(64, bitAnd(63, tParm)));
            tMsg = `${tMsg}${tBy1s}${tBy2s}`;
            tLength = tLength + 2;
            break;
          case Symbol.for("integer"):
            let tNegMask;
            if (tParm < 0) {
              tNegMask = 4;
              tParm = -tParm;
            } else {
              tNegMask = 0;
            }
            let tStr = numToChar(64 + bitAnd(tParm, 3));
            let tBytes = 1;
            tParm = tParm / 4;
            while (tParm != 0) {
              tBytes = tBytes + 1;
              putAfter(tStr, numToChar(64 + bitAnd(tParm, 63)));
              tParm = tParm / 64;
            }
            putAfter(tMsg, numToChar(bitOr(bitOr(charToNum(char(1).of(tStr)), tBytes * 8), tNegMask)));
            putAfter(tMsg, chars(tStr, 2, tBytes));
            tLength = tLength + tBytes;
            break;
          case Symbol.for("boolean"):
            tParm = tParm != 0;
            const tBy1b = numToChar(bitOr(64, bitAnd(63, tParm)));
            tMsg = `${tMsg}${tBy1b}`;
            tLength = tLength + 1;
            break;
          default:
            error(this, `Unsupported param type: ${ttype}`, Symbol.for("send"), Symbol.for("major"));
            break;
        }
      }
    }
    let tStr;
    if (tCmd.ilk != Symbol.for("integer")) {
      tStr = tCmd;
      tCmd = this.pCommandsPntr.getaProp(Symbol.for("value")).getaProp(tStr);
    }
    if (tCmd.ilk == Symbol.for("void")) {
      return error(this, "Unrecognized command!", Symbol.for("send"), Symbol.for("major"));
    }
    if (this.pLogMode > 0) {
      this.log(`<-- ${tStr} (${tCmd}) ${tMsg}`);
    }
    tMsg = `${tCmd}${tMsg}`;
    const tL1 = numToChar(bitOr(bitAnd(tLength, 63), 64));
    const tL2 = numToChar(bitOr(bitAnd(tLength / 64, 63), 64));
    const tL3 = numToChar(bitOr(bitAnd(tLength / 4096, 63), 64));
    tMsg = `${tL3}${tL2}${tL1}${tMsg}`;
    if (this.pEncryptionOn && objectp(this.pEncoder)) {
      tMsg = this.pEncoder.lzNP3UFWUtBTs1stvSHGgk(tMsg);
    }
    this.pXtra.sendNetMessage(0, 0, tMsg);
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
      case Symbol.for("xtra"):
        return this.pXtra;
      case Symbol.for("host"):
        return this.pHost;
      case Symbol.for("port"):
        return this.pPort;
      case Symbol.for("decoder"):
        return this.getDecoder();
      case Symbol.for("encoder"):
        return this.getEncoder();
      case Symbol.for("logmode"):
        return this.getLogMode();
      case Symbol.for("listener"):
        return this.pListenersPntr;
      case Symbol.for("commands"):
        return this.pCommandsPntr;
      case Symbol.for("message"):
        return this.pMsgStruct;
      case Symbol.for("deciphering"):
        return this.pDecipherOn;
    }
    return 0;
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case Symbol.for("decoder"):
        return this.setDecoder(tValue);
      case Symbol.for("encoder"):
        return this.setEncoder(tValue);
      case Symbol.for("logmode"):
        return this.setLogMode(tValue);
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
      case Symbol.for("deciphering"):
        this.pDecipherOn = tValue;
        break;
    }
    return 0;
  }

  GetBoolFrom() {
    const tByteStr = this.pMsgStruct.getaProp(Symbol.for("content"));
    const tByte = bitAnd(charToNum(char(1).of(tByteStr)), 63);
    this.pMsgStruct.setaProp(Symbol.for("content"), tByteStr.char[`2..${length(tByteStr)}`]);
    return tByte != 0;
  }

  GetByteFrom() {
    const tByteStr = this.pMsgStruct.getaProp(Symbol.for("content"));
    const tByte = bitAnd(charToNum(char(1).of(tByteStr)), 63);
    this.pMsgStruct.setaProp(Symbol.for("content"), tByteStr.char[`2..${length(tByteStr)}`]);
    return tByte;
  }

  GetIntFrom() {
    const tByteStr = this.pMsgStruct.getaProp(Symbol.for("content"));
    let tByte = bitAnd(charToNum(char(1).of(tByteStr)), 63);
    const tByCnt = bitOr(bitAnd(tByte, 56) / 8, 0);
    const tNeg = bitAnd(tByte, 4);
    let tInt = bitAnd(tByte, 3);
    if (tByCnt > 1) {
      const tPowTbl = list(4, 256, 16384, 1048576, 67108864);
      for (let i = 2; i <= tByCnt; i++) {
        tByte = bitAnd(charToNum(char(i).of(tByteStr)), 63);
        tInt = bitOr(tByte * tPowTbl[i - 1], tInt);
      }
    }
    if (tNeg) {
      tInt = -tInt;
    }
    this.pMsgStruct.setaProp(Symbol.for("content"), tByteStr.char[`${tByCnt + 1}..${length(tByteStr)}`]);
    return tInt;
  }

  GetStrFrom() {
    const tArr = this.pMsgStruct.getaProp(Symbol.for("content"));
    const tLen = offset(numToChar(2), tArr);
    let tStr;
    if (tLen > 1) {
      tStr = char(1).to(tLen - 1).of(tArr);
    } else {
      tStr = EMPTY;
    }
    this.pMsgStruct.setaProp(Symbol.for("content"), char(tLen + 1).to(length(tArr)).of(tArr));
    return tStr;
  }

  print() {
    let tStr = EMPTY;
    if (symbolp(this.getID())) {
      putAfter(tStr, "#");
    }
    putAfter(tStr, `${this.getID()}${RETURN}`);
    putAfter(tStr, `-- -- -- -- -- -- -- --${RETURN}`);
    const tMsgsList = this.pListenersPntr.getaProp(Symbol.for("value"));
    if (listp(tMsgsList)) {
      for (let i = 1; i <= count(tMsgsList); i++) {
        putAfter(tStr, `${TAB}${tMsgsList.getPropAt(i)}${RETURN}`);
        const tCallbackList = tMsgsList[i];
        for (const tCallback of tCallbackList) {
          putAfter(tStr, `${TAB}${TAB}${tCallback[1]} -> ${tCallback[2]}${RETURN}`);
        }
        putAfter(tStr, `${RETURN}`);
      }
    }
    put(`${tStr}${RETURN}`);
    return 1;
  }

  GetLastError() {
    return this.pLastError;
  }

  xtraMsgHandler() {
    if (this.pConnectionShouldBeKilled != 0) {
      return 0;
    }
    this.pConnectionOk = 1;
    const tNewMsg = this.pXtra.getNetMessage();
    const tErrCode = tNewMsg.getaProp(Symbol.for("errorCode"));
    let tContent = tNewMsg.getaProp(Symbol.for("content"));
    if (tErrCode != 0) {
      this.pLastError = tErrCode;
      if (ilk(tNewMsg) == Symbol.for("propList")) {
        this.pLastError = `${this.pLastError}_${tNewMsg[Symbol.for("subject")]}`;
      }
      if (!this.pConnectionEstablishing) {
        if (this.pLogMode > 0) {
          this.log(`Connection ${this.getID()} was disconnected`);
          this.log(`host = ${this.pHost}, port = ${this.pPort}`);
          this.log(tNewMsg);
        }
        this.disconnect();
        return 0;
      } else {
        if (this.pConnectionTries > this.pConnectionRetryCount) {
          if (this.pLogMode > 0) {
            this.log(`Connection ${this.getID()} was disconnected`);
            this.log(`host = ${this.pHost}, port = ${this.pPort}`);
            this.log(tNewMsg);
          }
          error(this, `Failed connection retry ${this.pConnectionTries} times.`, Symbol.for("xtraMsgHandler"), Symbol.for("critical"));
          this.disconnect();
          return 0;
        } else {
          this.pConnectionOk = 0;
          createTimeout("RetryConnection", this.pConnectionRetryDelay, Symbol.for("connect"), this.getID(), VOID, 1);
          return 1;
        }
      }
    }
    this.pConnectionEstablishing = 0;
    if (this.pEncryptionOn && this.pDecipherOn) {
      tContent = this.pDecoder.TTF97D0LvibV6X(tContent);
    }
    this.msghandler(tContent);
  }

  msghandler(tContent) {
    if (tContent.ilk != Symbol.for("string")) {
      return 0;
    }
    if (this.pLastContent.length > 0) {
      tContent = `${this.pLastContent}${tContent}`;
      this.pLastContent = EMPTY;
    }
    while (tContent.length > 0) {
      if (tContent.length < 3) {
        this.pLastContent = `${this.pLastContent}${tContent}`;
        return;
      }
      const tByte1 = bitAnd(charToNum(char(2).of(tContent)), 63);
      const tByte2 = bitAnd(charToNum(char(1).of(tContent)), 63);
      const tMsgType = bitOr(tByte2 * 64, tByte1);
      let tLength = offset(numToChar(1), tContent);
      if ((tLength == 0) && !this.pUnicodeDirector) {
        for (let i = 3; i <= tContent.length; i++) {
          const tCharVal = charToNum(tContent.char[i]);
          if ((tCharVal % 256) == 1) {
            tContent = `${tContent.char[`1..${i - 1}`]}${numToChar(tCharVal - 1)}${numToChar(1)}${tContent.char[`${i + 1}..${tContent.length}`]}`;
            tLength = i + 1;
            break;
          }
        }
      }
      if (tLength == 0) {
        this.pLastContent = tContent;
        return;
      }
      const tParams = char(3).to(tLength - 1).of(tContent);
      tContent = char(tLength + 1).to(tContent.length).of(tContent);
      const tParamsDecoded = decodeUTF8(tParams);
      this.forwardMsg(tMsgType, tParamsDecoded);
    }
  }

  forwardMsg(tSubject, tParams) {
    if (this.pLogMode > 0) {
      this.log(`--> ${tSubject}${RETURN}${tParams}`);
    }
    tParams = getStringServices().convertSpecialChars(tParams);
    const tCallbackList = this.pListenersPntr.getaProp(Symbol.for("value")).getaProp(tSubject);
    if (tCallbackList.ilk != Symbol.for("list")) {
      return error(this, `Listener not found: ${tSubject} / ${this.getID()}`, Symbol.for("forwardMsg"), Symbol.for("minor"));
    }
    const tObjMgr = getObjectManager();
    for (let i = 1; i <= count(tCallbackList); i++) {
      const tCallback = tCallbackList[i];
      const tObject = tObjMgr.GET(tCallback[1]);
      if (tObject != 0) {
        this.pMsgStruct.setaProp(Symbol.for("subject"), tSubject);
        this.pMsgStruct.setaProp(Symbol.for("content"), tParams);
        getConnectionManager().registerLastMessage(tSubject, tParams);
        call(tCallback[2], tObject, this.pMsgStruct);
        continue;
      }
      error(this, `Listening obj not found, removed: ${tCallback[1]}`, Symbol.for("forwardMsg"), Symbol.for("minor"));
      tCallbackList.deleteAt(1);
      i = i - 1;
    }
  }

  log(tMsg) {
    if (!this.pD) {
      the.debugPlaybackEnabled = 0;
      if (!(the.runMode.contains("Author"))) {
        return 1;
      }
    }
    switch (this.pLogMode) {
      case 1:
        put(`[Connection${this.getID()}] : ${tMsg}`);
        break;
      case 2:
        if (!(the.runMode.contains("Author"))) {
          return 1;
        }
        if (ilk(this.pLogfield, Symbol.for("member"))) {
          putAfter(this.pLogfield, `${RETURN}[Connection${this.getID()}] : ${tMsg}`);
        }
        break;
      case 3:
        executeMessage(Symbol.for("logdata"), tMsg);
        break;
    }
  }

  handlers() {
    return list();
  }
}
