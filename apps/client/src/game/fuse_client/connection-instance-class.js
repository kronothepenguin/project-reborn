import {
  EMPTY,
  RETURN,
  TAB,
  VOID,
  bitAnd,
  bitOr,
  call,
  charToNum,
  chars,
  encodeUTF8,
  decodeUTF8,
  ilk,
  length,
  listp,
  numToChar,
  objectp,
  offset,
  put,
  string,
  stringp,
  symbolp,
  value,
  voidp,
} from "../../director";

export default function () {
  let i, tErrCode, tConnectErrorCode, tMsg, tLength, tChar, tCharNum, tL1, tL2, tL3;
  let tStr, tByte1, tByte2, tMsgType, tParams, tCallback, tObject, tObjMgr;
  let tByte, tByCnt, tNeg, tInt, tPowTbl, tArr, tLen, tNegMask, tBytes;
  let tCallbackList, tNewMsg, tContent, tType, tParm, tParmArr, tNum;
  let tBy1, tBy2;

  return {
    pHost: VOID,
    pPort: VOID,
    pXtra: VOID,
    pMsgStruct: VOID,
    pConnectionOk: VOID,
    pConnectionSecured: VOID,
    pConnectionShouldBeKilled: VOID,
    pEncryptionOn: VOID,
    pDecoder: VOID,
    pEncoder: VOID,
    pLastContent: VOID,
    pContentChunk: VOID,
    pLogMode: VOID,
    pLogfield: VOID,
    pCommandsPntr: VOID,
    pListenersPntr: VOID,
    pDecipherOn: VOID,
    pD: VOID,
    pUnicodeDirector: VOID,
    pLastError: VOID,
    pConnectionEstablishing: VOID,
    pConnectionRetryDelay: VOID,
    pConnectionRetryCount: VOID,
    pConnectionTries: VOID,

    construct() {
      if (value(_player.productVersion) >= 11) {
        this.pUnicodeDirector = 1;
      } else {
        this.pUnicodeDirector = 0;
      }
      this.pDecipherOn = 0;
      this.pEncryptionOn = 0;
      this.pMsgStruct = _director.getStructVariable("struct.message");
      this.pMsgStruct.setaProp(Symbol.for("connection"), this);
      this.pDecoder = 0;
      this.pEncoder = 0;
      this.pLastContent = EMPTY;
      this.pConnectionShouldBeKilled = 0;
      this.pCommandsPntr = _director.getStructVariable("struct.pointer");
      this.pListenersPntr = _director.getStructVariable("struct.pointer");
      this.setLogMode(_director.getIntVariable("connection.log.level", 0));
      this.pLastError = 0;
      this.pConnectionEstablishing = 1;
      this.pConnectionRetryDelay = _director.getIntVariable("connection.retry.delay", 2000);
      this.pConnectionRetryCount = _director.getIntVariable("connection.retry.count", 5);
      this.pConnectionTries = 0;
      this.pHost = VOID;
      this.pPort = VOID;
      return 1;
    },

    deconstruct() {
      return this.disconnect(1);
    },

    connect(tHost, tPort) {
      if (voidp(this.pHost) && voidp(this.pPort)) {
        _director.sendProcessTracking(30);
        this.pHost = tHost;
        this.pPort = tPort;
      }
      this.pConnectionTries = this.pConnectionTries + 1;
      if (_director.timeoutExists("RetryConnection")) {
        _director.removeTimeout("RetryConnection");
      }
      if (!_director.checkForXtra("Multiusr")) {
        return _director.fatalError({ error: "mus_xtra_not_found" });
      }
      this.pXtra = new(_director.xtra("Multiuser"));
      this.pXtra.setNetBufferLimits(16 * 1024, 100 * 1024, 100);
      tErrCode = this.pXtra.setNetMessageHandler(Symbol.for("xtraMsgHandler"), this);
      if (tErrCode === 0) {
        tConnectErrorCode = this.pXtra.connectToNetServer("*", "*", this.pHost, this.pPort, "*", 1);
      } else {
        return _director.error(this, "Creation of callback failed:" + " " + tErrCode, Symbol.for("connect"), Symbol.for("major"));
      }
      if (tConnectErrorCode !== 0) {
        return _director.fatalError({ error: "connect_to_net_server" });
      }
      this.pLastContent = EMPTY;
      if (this.pLogMode > 0) {
        this.log("Connection initialized:" + " " + this.getID() + " " + this.pHost + " " + this.pPort);
      }
      return 1;
    },

    disconnect(tControlled) {
      if (tControlled !== 1) {
        this.forwardMsg(-1);
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
      return this.pConnectionOk && this.pConnectionSecured;
    },

    setDecoder(tDecoder) {
      if (!objectp(tDecoder)) {
        return _director.error(this, "Decoder object expected:" + " " + tDecoder, Symbol.for("setDecoder"), Symbol.for("major"));
      } else {
        this.pDecoder = tDecoder;
        return 1;
      }
    },

    getDecoder() {
      return this.pDecoder;
    },

    setEncoder(tEncoder) {
      if (!objectp(tEncoder)) {
        return _director.error(this, "Encoder object expected:" + " " + tEncoder, Symbol.for("setEncoder"), Symbol.for("major"));
      } else {
        this.pEncoder = tEncoder;
        return 1;
      }
    },

    getEncoder() {
      return this.pEncoder;
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

    getLogMode() {
      return this.pLogMode;
    },

    setEncryption(tBoolean) {
      this.pEncryptionOn = tBoolean;
      this.pConnectionSecured = 1;
      return 1;
    },

    send(tCmd, tMsg) {
      if (this.pConnectionShouldBeKilled) {
        return 0;
      }
      if (ilk(tMsg) === Symbol.for("propList")) {
        return this.sendNew(tCmd, tMsg);
      }
      if (!(this.pConnectionOk && objectp(this.pXtra))) {
        return _director.error(this, "Connection not ready:" + " " + this.getID(), Symbol.for("send"), Symbol.for("major"));
      }
      if (ilk(tMsg) !== Symbol.for("string")) {
        tMsg = string(tMsg);
      }
      if (!(this.pEncryptionOn && objectp(this.pEncoder)) && this.pUnicodeDirector) {
        for (let i = 1; i <= length(tMsg); i++) {
          if (charToNum(chars(tMsg, i, i)) > 127) {
            return _director.error(this, "Encryption required for non-ascii content with SW11", Symbol.for("send"), Symbol.for("critical"));
          }
        }
      }
      tMsg = encodeUTF8(tMsg);
      if (ilk(tCmd) !== Symbol.for("integer")) {
        tStr = tCmd;
        tCmd = this.pCommandsPntr.getaProp(Symbol.for("value")).getaProp(tStr);
      }
      if (ilk(tCmd) === Symbol.for("void")) {
        return _director.error(this, "Unrecognized command!", Symbol.for("send"), Symbol.for("major"));
      }
      if (this.pLogMode > 0) {
        this.log("<--" + " " + tStr + " " + "(" + tCmd + ")" + " " + tMsg);
      }
      tMsg = tCmd + tMsg;
      tLength = 0;
      for (let tChar = 1; tChar <= length(tMsg); tChar++) {
        tCharNum = charToNum(chars(tMsg, tChar, tChar));
        tLength = tLength + 1 + ((tCharNum > 255) && (tCharNum % 256));
      }
      tL1 = numToChar(bitOr(bitAnd(tLength, 63), 64));
      tL2 = numToChar(bitOr(bitAnd(Math.floor(tLength / 64), 63), 64));
      tL3 = numToChar(bitOr(bitAnd(Math.floor(tLength / 4096), 63), 64));
      tMsg = tL3 + tL2 + tL1 + tMsg;
      if (this.pEncryptionOn && objectp(this.pEncoder)) {
        tMsg = this.pEncoder.lzNP3UFWUtBTs1stvSHGgk(tMsg);
      }
      this.pXtra.sendNetMessage(0, 0, tMsg);
      return 1;
    },

    sendNew(tCmd, tParmArr) {
      if (!(this.pConnectionOk && objectp(this.pXtra))) {
        return _director.error(this, "Connection not ready:" + " " + this.getID(), Symbol.for("send"), Symbol.for("major"));
      }
      tMsg = EMPTY;
      tLength = 2;
      if (listp(tParmArr)) {
        for (let i = 1; i <= tParmArr.count; i++) {
          tType = tParmArr.getPropAt(i);
          tParm = tParmArr[i];
          switch (tType) {
            case Symbol.for("string"):
              tParm = encodeUTF8(tParm);
              tLen = 0;
              for (let tChar = 1; tChar <= length(tParm); tChar++) {
                tNum = charToNum(chars(tParm, tChar, tChar));
                tLen = tLen + 1 + ((tNum > 255) && (tNum % 256));
              }
              tBy1 = numToChar(bitOr(64, Math.floor(tLen / 64)));
              tBy2 = numToChar(bitOr(64, bitAnd(63, tLen)));
              tMsg = tMsg + tBy1 + tBy2 + tParm;
              tLength = tLength + tLen + 2;
              break;
            case Symbol.for("short"):
              tBy1 = numToChar(bitOr(64, Math.floor(tParm / 64)));
              tBy2 = numToChar(bitOr(64, bitAnd(63, tParm)));
              tMsg = tMsg + tBy1 + tBy2;
              tLength = tLength + 2;
              break;
            case Symbol.for("integer"):
              if (tParm < 0) {
                tNegMask = 4;
                tParm = -tParm;
              } else {
                tNegMask = 0;
              }
              tStr = numToChar(64 + bitAnd(tParm, 3));
              tBytes = 1;
              tParm = Math.floor(tParm / 4);
              while (tParm !== 0) {
                tBytes = tBytes + 1;
                tStr = tStr + numToChar(64 + bitAnd(tParm, 63));
                tParm = Math.floor(tParm / 64);
              }
              tMsg = tMsg + numToChar(bitOr(bitOr(charToNum(chars(tStr, 1, 1)), tBytes * 8), tNegMask));
              tMsg = tMsg + chars(tStr, 2, tBytes);
              tLength = tLength + tBytes;
              break;
            case Symbol.for("boolean"):
              tParm = tParm !== 0;
              tBy1 = numToChar(bitOr(64, bitAnd(63, tParm)));
              tMsg = tMsg + tBy1;
              tLength = tLength + 1;
              break;
            default:
              _director.error(this, "Unsupported param type:" + " " + tType, Symbol.for("send"), Symbol.for("major"));
          }
        }
      }
      if (ilk(tCmd) !== Symbol.for("integer")) {
        tStr = tCmd;
        tCmd = this.pCommandsPntr.getaProp(Symbol.for("value")).getaProp(tStr);
      }
      if (ilk(tCmd) === Symbol.for("void")) {
        return _director.error(this, "Unrecognized command!", Symbol.for("send"), Symbol.for("major"));
      }
      if (this.pLogMode > 0) {
        this.log("<--" + " " + tStr + " " + "(" + tCmd + ")" + " " + tMsg);
      }
      tMsg = tCmd + tMsg;
      tL1 = numToChar(bitOr(bitAnd(tLength, 63), 64));
      tL2 = numToChar(bitOr(bitAnd(Math.floor(tLength / 64), 63), 64));
      tL3 = numToChar(bitOr(bitAnd(Math.floor(tLength / 4096), 63), 64));
      tMsg = tL3 + tL2 + tL1 + tMsg;
      if (this.pEncryptionOn && objectp(this.pEncoder)) {
        tMsg = this.pEncoder.lzNP3UFWUtBTs1stvSHGgk(tMsg);
      }
      this.pXtra.sendNetMessage(0, 0, tMsg);
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
    },

    setProperty(tProp, tValue) {
      switch (tProp) {
        case Symbol.for("decoder"):
          return this.setDecoder(tValue);
        case Symbol.for("encoder"):
          return this.setEncoder(tValue);
        case Symbol.for("logmode"):
          return this.setLogMode(tValue);
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
        case Symbol.for("deciphering"):
          this.pDecipherOn = tValue;
      }
      return 0;
    },

    GetBoolFrom() {
      let tByteStr = this.pMsgStruct.getaProp(Symbol.for("content"));
      let tByte = bitAnd(charToNum(chars(tByteStr, 1, 1)), 63);
      this.pMsgStruct.setaProp(Symbol.for("content"), chars(tByteStr, 2, length(tByteStr)));
      return tByte !== 0;
    },

    GetByteFrom() {
      let tByteStr = this.pMsgStruct.getaProp(Symbol.for("content"));
      let tByte = bitAnd(charToNum(chars(tByteStr, 1, 1)), 63);
      this.pMsgStruct.setaProp(Symbol.for("content"), chars(tByteStr, 2, length(tByteStr)));
      return tByte;
    },

    GetIntFrom() {
      let tByteStr = this.pMsgStruct.getaProp(Symbol.for("content"));
      let tByte = bitAnd(charToNum(chars(tByteStr, 1, 1)), 63);
      let tByCnt = bitOr(bitAnd(tByte, 56) / 8, 0);
      let tNeg = bitAnd(tByte, 4);
      let tInt = bitAnd(tByte, 3);
      if (tByCnt > 1) {
        tPowTbl = [4, 256, 16384, 1048576, 67108864];
        for (let i = 2; i <= tByCnt; i++) {
          tByte = bitAnd(charToNum(chars(tByteStr, i, i)), 63);
          tInt = bitOr(tByte * tPowTbl[i - 1], tInt);
        }
      }
      if (tNeg) {
        tInt = -tInt;
      }
      this.pMsgStruct.setaProp(Symbol.for("content"), chars(tByteStr, tByCnt + 1, length(tByteStr)));
      return tInt;
    },

    GetStrFrom() {
      let tArr = this.pMsgStruct.getaProp(Symbol.for("content"));
      let tLen = offset(numToChar(2), tArr);
      if (tLen > 1) {
        tStr = chars(tArr, 1, tLen - 1);
      } else {
        tStr = EMPTY;
      }
      this.pMsgStruct.setaProp(Symbol.for("content"), chars(tArr, tLen + 1, length(tArr)));
      return tStr;
    },

    print() {
      let tStr = EMPTY;
      if (symbolp(this.getID())) {
        tStr = tStr + "#";
      }
      tStr = tStr + this.getID() + RETURN;
      tStr = tStr + "-- -- -- -- -- -- -- --" + RETURN;
      let tMsgsList = this.pListenersPntr.getaProp(Symbol.for("value"));
      if (listp(tMsgsList)) {
        for (let i = 1; i <= tMsgsList.count; i++) {
          tStr = tStr + TAB + tMsgsList.getPropAt(i) + RETURN;
          let tCallbackList = tMsgsList[i];
          for (const tCallback of tCallbackList) {
            tStr = tStr + TAB + TAB + tCallback[1] + " " + "->" + " " + tCallback[2] + RETURN;
          }
          tStr = tStr + RETURN;
        }
      }
      put(tStr + RETURN);
      return 1;
    },

    GetLastError() {
      return this.pLastError;
    },

    xtraMsgHandler() {
      if (this.pConnectionShouldBeKilled !== 0) {
        return 0;
      }
      this.pConnectionOk = 1;
      tNewMsg = this.pXtra.getNetMessage();
      tErrCode = tNewMsg.getaProp(Symbol.for("errorCode"));
      tContent = tNewMsg.getaProp(Symbol.for("content"));
      if (tErrCode !== 0) {
        this.pLastError = tErrCode;
        if (ilk(tNewMsg) === Symbol.for("propList")) {
          this.pLastError = this.pLastError + "_" + tNewMsg[Symbol.for("subject")];
        }
        if (!this.pConnectionEstablishing) {
          if (this.pLogMode > 0) {
            this.log("Connection" + " " + this.getID() + " " + "was disconnected");
            this.log("host = " + this.pHost + ", " + "port = " + this.pPort);
            this.log(tNewMsg);
          }
          this.disconnect();
          return 0;
        } else {
          if (this.pConnectionTries > this.pConnectionRetryCount) {
            if (this.pLogMode > 0) {
              this.log("Connection" + " " + this.getID() + " " + "was disconnected");
              this.log("host = " + this.pHost + ", " + "port = " + this.pPort);
              this.log(tNewMsg);
            }
            _director.error(this, "Failed connection retry" + " " + this.pConnectionTries + " " + "times.", Symbol.for("xtraMsgHandler"), Symbol.for("critical"));
            this.disconnect();
            return 0;
          } else {
            this.pConnectionOk = 0;
            _director.createTimeout("RetryConnection", this.pConnectionRetryDelay, Symbol.for("connect"), this.getID(), VOID, 1);
            return 1;
          }
        }
      }
      this.pConnectionEstablishing = 0;
      if (this.pEncryptionOn && this.pDecipherOn) {
        tContent = this.pDecoder.TTF97D0LvibV6X(tContent);
      }
      this.msghandler(tContent);
    },

    msghandler(tContent) {
      if (ilk(tContent) !== Symbol.for("string")) {
        return 0;
      }
      if (length(this.pLastContent) > 0) {
        tContent = this.pLastContent + tContent;
        this.pLastContent = EMPTY;
      }
      while (length(tContent) > 0) {
        if (length(tContent) < 3) {
          this.pLastContent = this.pLastContent + tContent;
          return;
        }
        tByte1 = bitAnd(charToNum(chars(tContent, 2, 2)), 63);
        tByte2 = bitAnd(charToNum(chars(tContent, 1, 1)), 63);
        tMsgType = bitOr(tByte2 * 64, tByte1);
        tLength = offset(numToChar(1), tContent);
        if ((tLength === 0) && !this.pUnicodeDirector) {
          for (let i = 3; i <= length(tContent); i++) {
            let tCharVal = charToNum(chars(tContent, i, i));
            if ((tCharVal % 256) === 1) {
              tContent = chars(tContent, 1, i - 1) + numToChar(tCharVal - 1) + numToChar(1) + chars(tContent, i + 1, length(tContent));
              tLength = i + 1;
              break;
            }
          }
        }
        if (tLength === 0) {
          this.pLastContent = tContent;
          return;
        }
        tParams = chars(tContent, 3, tLength - 1);
        tContent = chars(tContent, tLength + 1, length(tContent));
        tParams = decodeUTF8(tParams);
        this.forwardMsg(tMsgType, tParams);
      }
    },

    forwardMsg(tSubject, tParams) {
      if (this.pLogMode > 0) {
        this.log("-->" + " " + tSubject + RETURN + tParams);
      }
      tParams = _director.getStringServices().convertSpecialChars(tParams);
      tCallbackList = this.pListenersPntr.getaProp(Symbol.for("value")).getaProp(tSubject);
      if (ilk(tCallbackList) !== Symbol.for("list")) {
        return _director.error(this, "Listener not found:" + " " + tSubject + "/" + this.getID(), Symbol.for("forwardMsg"), Symbol.for("minor"));
      }
      tObjMgr = _director.getObjectManager();
      for (let i = 1; i <= tCallbackList.count; i++) {
        tCallback = tCallbackList[i];
        tObject = tObjMgr.GET(tCallback[1]);
        if (tObject !== 0) {
          this.pMsgStruct.setaProp(Symbol.for("subject"), tSubject);
          this.pMsgStruct.setaProp(Symbol.for("content"), tParams);
          _director.getConnectionManager().registerLastMessage(tSubject, tParams);
          call(tCallback[2], tObject, this.pMsgStruct);
          continue;
        }
        _director.error(this, "Listening obj not found, removed:" + " " + tCallback[1], Symbol.for("forwardMsg"), Symbol.for("minor"));
        tCallbackList.deleteAt(1);
        i = i - 1;
      }
    },

    log(tMsg) {
      if (!this.pD) {
        the.debugPlaybackEnabled = 0;
        if (!the.runMode.includes("Author")) {
          return 1;
        }
      }
      switch (this.pLogMode) {
        case 1:
          put("[Connection" + " " + this.getID() + "] :" + " " + tMsg);
          break;
        case 2:
          if (!the.runMode.includes("Author")) {
            return 1;
          }
          if (ilk(this.pLogfield, Symbol.for("member"))) {
            this.pLogfield.text = this.pLogfield.text + RETURN + "[Connection" + " " + this.getID() + "] :" + " " + tMsg;
          }
          break;
        case 3:
          _director.executeMessage(Symbol.for("logdata"), tMsg);
          break;
      }
    },

    handlers() {
      return [];
    },
  };
}
