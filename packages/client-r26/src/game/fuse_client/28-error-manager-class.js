export default class {
  pDebugLevel;
  pErrorCache;
  pCacheSize;
  pErrorDialogLevel;
  pErrorLevelList;
  pFatalReported;
  pFatalReportParamOrder;
  pClientErrorList;
  pServerErrorList;

  construct() {
    if (!(the.runMode.contains("Author"))) {
      the.alertHook = this;
    }
    this.pDebugLevel = 1;
    this.pErrorCache = EMPTY;
    this.pCacheSize = 30;
    this.pFatalReported = 0;
    this.pClientErrorList = list();
    this.pServerErrorList = list();
    this.pErrorLevelList = list(Symbol.for("minor"), Symbol.for("major"), Symbol.for("critical"));
    if (!variableExists("client.debug.level")) {
      this.pErrorDialogLevel = this.pErrorLevelList[this.pErrorLevelList.count];
    } else {
      this.pErrorDialogLevel = getVariable("client.debug.level");
      if (ilk(this.pErrorDialogLevel) != Symbol.for("symbol")) {
        this.pErrorDialogLevel = this.pErrorLevelList[this.pErrorLevelList.count];
      } else {
        if (this.pErrorLevelList.findPos(this.pErrorDialogLevel) == 0) {
          this.pErrorDialogLevel = this.pErrorLevelList[this.pErrorLevelList.count];
        }
      }
    }
    this.pFatalReportParamOrder = list("error", "version", "build", "os", "host", "port", "client_version", "mus_errorcode", "error_id");
    return 1;
  }

  deconstruct() {
    the.alertHook = 0;
    return 1;
  }

  error(tObject, tMsg, tMethod, tErrorLevel) {
    if (objectp(tObject)) {
      tObject = string(tObject);
      tObject = tObject.word[`2..${tObject.word.count - 2}`];
      tObject = tObject.char[`2..${length(tObject) - 1}`];
    } else {
      tObject = "Unknown";
    }
    if (!stringp(tMsg)) {
      tMsg = "Unknown";
    }
    if (!symbolp(tMethod)) {
      tMethod = "Unknown";
    }
    let tError = RETURN;
    tError = `${tError}${TAB} Time:   ${the.longTime}${RETURN}`;
    tError = `${tError}${TAB} Method: ${tMethod}${RETURN}`;
    tError = `${tError}${TAB} Object: ${tObject}${RETURN}`;
    tError = `${tError}${TAB} Message:${tMsg.line[1]}${RETURN}`;
    const tErrorStr = `${the.longTime}-${tMethod}-${tObject}-${tMsg.line[1]}`;
    this.pClientErrorList.add(tErrorStr);
    if (tMsg.line.count > 1) {
      for (let i = 2; i <= tMsg.line.count; i++) {
        tError = `${tError}${TAB}         ${tMsg.line[i]}${RETURN}`;
      }
    }
    this.pErrorCache = `${this.pErrorCache}${tError}`;
    if (this.pErrorCache.line.count > this.pCacheSize) {
      this.pErrorCache = this.pErrorCache.line[`${this.pErrorCache.line.count - this.pCacheSize}..${this.pErrorCache.line.count}`];
    }
    switch (this.pDebugLevel) {
      case 1:
        put(`Error:${tError}`);
        break;
      case 2:
        put(`Error:${tError}`);
        break;
      case 3:
        executeMessage(Symbol.for("debugdata"), `Error: ${tError}`);
        break;
      default:
        put(`Error:${tError}`);
        break;
    }
    if (voidp(tErrorLevel)) {
      tErrorLevel = this.pErrorLevelList[1];
    } else {
      if (ilk(tErrorLevel) != Symbol.for("symbol")) {
        tErrorLevel = this.pErrorLevelList[1];
      }
    }
    if (this.pErrorLevelList.findPos(tErrorLevel) >= this.pErrorLevelList.findPos(this.pErrorDialogLevel)) {
      tError = `Method: ${tMethod}${RETURN}`;
      tError = `${tError}Object: ${tObject}${RETURN}`;
      tError = `${tError}Message:${tMsg.line[1]}${RETURN}`;
      executeMessage(Symbol.for("showErrorMessage"), "client", tError);
    }
    return 0;
  }

  serverError(tErrorList) {
    if (ilk(tErrorList) == Symbol.for("propList")) {
      const tErrorStr = `${tErrorList[Symbol.for("errorId")]}-${tErrorList[Symbol.for("errorMsgId")]}-${tErrorList[Symbol.for("time")]}`;
      this.pServerErrorList.add(tErrorStr);
    }
  }

  getClientErrors() {
    let tErrorStr = EMPTY;
    for (const tError of this.pClientErrorList) {
      tErrorStr = `${tErrorStr}${tError};`;
    }
    const tMaxLength = 1000;
    tErrorStr = chars(tErrorStr, tErrorStr.length - tMaxLength, tErrorStr.length);
    return tErrorStr;
  }

  getServerErrors() {
    let tErrorStr = EMPTY;
    for (const tError of this.pServerErrorList) {
      tErrorStr = `${tErrorStr}${tError};`;
    }
    const tMaxLength = 1000;
    tErrorStr = chars(tErrorStr, tErrorStr.length - tMaxLength, tErrorStr.length);
    return tErrorStr;
  }

  SystemAlert(tObject, tMsg, tMethod) {
    return this.error(tObject, tMsg, tMethod);
  }

  setDebugLevel(tDebugLevel) {
    if (!integerp(tDebugLevel)) {
      return 0;
    }
    this.pDebugLevel = tDebugLevel;
    return 1;
  }

  print() {
    put(`Errors:${RETURN}${this.pErrorCache}`);
    return 1;
  }

  fatalError(tErrorData) {
    if (ilk(tErrorData) != Symbol.for("propList")) {
      tErrorData = propList();
    }
    this.handleFatalError(tErrorData);
  }

  alertHook(tErr, tMsgA, tMsgB) {
    const tErrorData = propList();
    tErrorData["error"] = "script_error";
    tErrorData["hookerror"] = tErr;
    tErrorData["hookmsga"] = tMsgA;
    tErrorData["hookmsgb"] = tMsgB;
    tErrorData["lastexecute"] = getBrokerManager().getLastExecutedMessageId();
    tErrorData["lastclick"] = getWindowManager().getLastEvent();
    tErrorData["lastmessage"] = getConnectionManager().getLastMessageData();
    const tSessionObj = getObject(Symbol.for("session"));
    if (objectp(tSessionObj)) {
      const tLastRoom = tSessionObj.GET("lastroom");
      if (stringp(tLastRoom)) {
        tErrorData["lastroom"] = tLastRoom;
      } else {
        if (listp(tLastRoom)) {
          tErrorData["lastroom"] = string(tLastRoom[Symbol.for("id")]);
        }
      }
      this.handleFatalError(tErrorData);
    }
    return 1;
  }

  zeroPadToString(tNumber, tCount) {
    let tOut = EMPTY;
    if (string(tNumber).length < tCount) {
      for (let i = 1; i <= tCount - string(tNumber).length; i++) {
        tOut = `${tOut}0`;
      }
    }
    tOut = `${tOut}${string(tNumber)}`;
    return tOut;
  }

  makeErrorId() {
    const tSrc = integer(getObject(Symbol.for("session")).GET("user_user_id")) % 10000;
    const tSrc2 = random(10000) % 10000;
    const tDst = `${this.zeroPadToString(tSrc, 4)}${this.zeroPadToString(tSrc2, 4)}`;
    return tDst;
  }

  handleFatalError(tErrorData) {
    let tErrorUrl = EMPTY;
    let tParams = EMPTY;
    if (ilk(tErrorData) != Symbol.for("propList")) {
      error(this, "Invalid error data", Symbol.for("handleFatalError"), Symbol.for("major"));
      tErrorData = propList();
    }
    const tErrorType = tErrorData["error"];
    if (variableExists("client.fatal.error.url")) {
      tErrorUrl = getVariable("client.fatal.error.url");
    }
    const tConnection = getConnection(getVariable("connection.info.id", Symbol.for("Info")));
    if (tConnection != VOID) {
      tErrorData["host"] = tConnection.getProperty(Symbol.for("host"));
      tErrorData["port"] = tConnection.getProperty(Symbol.for("port"));
      tErrorData["mus_errorcode"] = tConnection.GetLastError();
    }
    tErrorData["client_version"] = getMoviePath();
    tErrorData["client_process_list"] = string(getProcessTrackingList());
    tErrorData["client_errors"] = getClientErrors();
    tErrorData["server_errors"] = getServerErrors();
    if (tErrorUrl.contains("?")) {
      tParams = "&";
    } else {
      tParams = "?";
    }
    const tEnv = the.environment;
    tErrorData["version"] = tEnv[Symbol.for("productVersion")];
    tErrorData["build"] = tEnv[Symbol.for("productBuildVersion")];
    tErrorData["os"] = tEnv[Symbol.for("osVersion")];
    tErrorData["neterr_cast"] = getCastLoadManager().GetLastError();
    tErrorData["neterr_res"] = getDownloadManager().GetLastError();
    tErrorData["client_uptime"] = getClientUpTime();
    tErrorData["error_id"] = this.makeErrorId();
    let tAccountID;
    if (variableExists("account_id")) {
      tAccountID = getVariable("account_id");
      const tAccoutnID = tAccountID % 9999;
    } else {
      tAccountID = 0;
    }
    const tNuErrorData = propList();
    for (let i = 1; i <= this.pFatalReportParamOrder.count; i++) {
      const tKey = this.pFatalReportParamOrder[i];
      const tValue = tErrorData.getaProp(tKey);
      if (tErrorData.getaProp(tKey) != VOID) {
        tNuErrorData.setaProp(tKey, tValue);
      }
    }
    for (let k = 1; k <= tErrorData.count; k++) {
      const tKey = tErrorData.getPropAt(k);
      if (tNuErrorData.getaProp(tKey) == VOID) {
        tNuErrorData.setaProp(tKey, tErrorData.getaProp(tKey));
      }
    }
    tErrorData = tNuErrorData;
    for (let tItemNo = 1; tItemNo <= tErrorData.count; tItemNo++) {
      let tKey = string(tErrorData.getPropAt(tItemNo));
      tKey = urlEncode(tKey);
      const tValue = string(tErrorData[tKey]);
      tValue = urlEncode(tValue);
      if (tItemNo == 1) {
        tParams = `${tParams}${tKey}=${tValue}`;
        continue;
      }
      tParams = `${tParams}&${tKey}=${tValue}`;
    }
    const tPrefTxt = `${date()} ${time()}${RETURN}${replaceChunks(tParams, "&", RETURN)}`;
    setPref("ClientFatalParams", tPrefTxt);
    this.showErrorDialog();
    pauseUpdate();
    if ((tErrorUrl != EMPTY) && !this.pFatalReported) {
      openNetPage(`${tErrorUrl}${tParams}`, "self");
      this.pFatalReported = 1;
    }
    return 1;
  }

  showErrorDialog() {
    if (createWindow(Symbol.for("error"), "error.window", 0, 0, Symbol.for("modal")) != 0) {
      getWindow(Symbol.for("error")).registerClient(this.getID());
      getWindow(Symbol.for("error")).registerProcedure(Symbol.for("eventProcError"), this.getID(), Symbol.for("mouseUp"));
      return 1;
    } else {
      return 0;
    }
  }

  eventProcError(tEvent, tSprID, tParam) {
    if ((tEvent == Symbol.for("mouseUp")) && (tSprID == "error_close")) {
      removeWindow(Symbol.for("error"));
    }
  }
}
