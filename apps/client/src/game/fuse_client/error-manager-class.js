import {
  chars,
  date,
  EMPTY,
  integer,
  integerp,
  ilk,
  length,
  lineOf,
  list,
  listp,
  objectp,
  openNetPage,
  propList,
  put,
  random,
  RETURN,
  setPref,
  string,
  stringp,
  symbolp,
  TAB,
  the,
  time,
  VOID,
  voidp,
  wordOf,
  charOf,
} from "../../director";

function zeroPadToString(tNumber, tCount) {
  let tOut = EMPTY;
  if (string(tNumber).length < tCount) {
    for (let i = 1; i <= tCount - string(tNumber).length; i++) {
      tOut = tOut + "0";
    }
  }
  tOut = tOut + string(tNumber);
  return tOut;
}

export default function () {
  let tError;
  let tSessionObj;
  let tSrc, tSrc2, tDst;
  let tErrorUrl,
    tParams,
    tErrorType,
    tConnection,
    tEnv,
    tAccountID,
    tNuErrorData,
    tItemNo,
    tKey,
    tValue,
    tPrefTxt;

  return {
    pDebugLevel: VOID,
    pErrorCache: VOID,
    pCacheSize: VOID,
    pErrorDialogLevel: VOID,
    pErrorLevelList: VOID,
    pFatalReported: VOID,
    pFatalReportParamOrder: VOID,
    pClientErrorList: VOID,
    pServerErrorList: VOID,

    construct() {
      if (!the.runMode.includes("Author")) {
        the.alertHook = this;
      }
      this.pDebugLevel = 1;
      this.pErrorCache = EMPTY;
      this.pCacheSize = 30;
      this.pFatalReported = 0;
      this.pClientErrorList = list();
      this.pServerErrorList = list();
      this.pErrorLevelList = list(
        Symbol.for("minor"),
        Symbol.for("major"),
        Symbol.for("critical"),
      );
      if (!_director.variableExists("client.debug.level")) {
        this.pErrorDialogLevel =
          this.pErrorLevelList[this.pErrorLevelList.count];
      } else {
        this.pErrorDialogLevel = _director.getVariable("client.debug.level");
        if (ilk(this.pErrorDialogLevel) !== Symbol.for("symbol")) {
          this.pErrorDialogLevel =
            this.pErrorLevelList[this.pErrorLevelList.count];
        } else {
          if (this.pErrorLevelList.findPos(this.pErrorDialogLevel) === 0) {
            this.pErrorDialogLevel =
              this.pErrorLevelList[this.pErrorLevelList.count];
          }
        }
      }
      this.pFatalReportParamOrder = list(
        "error",
        "version",
        "build",
        "os",
        "host",
        "port",
        "client_version",
        "mus_errorcode",
        "error_id",
      );
      return 1;
    },

    deconstruct() {
      the.alertHook = 0;
      return 1;
    },

    error(tObject, tMsg, tMethod, tErrorLevel) {
      if (objectp(tObject)) {
        tObject = string(tObject);
        tObject = wordOf(tObject).slice(2, wordOf(tObject).count - 2);
        tObject = charOf(tObject).slice(2, length(tObject) - 1);
      } else {
        tObject = "Unknown";
      }
      if (!stringp(tMsg)) {
        tMsg = "Unknown";
      }
      if (!symbolp(tMethod)) {
        tMethod = "Unknown";
      }
      tError = RETURN;
      tError = tError + TAB + "Time:   " + the.longTime + RETURN;
      tError = tError + TAB + "Method: " + tMethod + RETURN;
      tError = tError + TAB + "Object: " + tObject + RETURN;
      tError = tError + TAB + "Message:" + lineOf(tMsg)[1] + RETURN;
      const tErrorStr =
        the.longTime + "-" + tMethod + "-" + tObject + "-" + lineOf(tMsg)[1];
      this.pClientErrorList.add(tErrorStr);
      if (lineOf(tMsg).count > 1) {
        for (let i = 2; i <= lineOf(tMsg).count; i++) {
          tError = tError + TAB + "        " + lineOf(tMsg)[i] + RETURN;
        }
      }
      this.pErrorCache = this.pErrorCache + tError;
      if (lineOf(this.pErrorCache).count > this.pCacheSize) {
        this.pErrorCache = lineOf(this.pErrorCache).slice(
          lineOf(this.pErrorCache).count - this.pCacheSize,
          lineOf(this.pErrorCache).count,
        );
      }
      switch (this.pDebugLevel) {
        case 1:
          put("Error:" + tError);
          break;
        case 2:
          put("Error:" + tError);
          break;
        case 3:
          _director.executeMessage(Symbol.for("debugdata"), "Error: " + tError);
          break;
        default:
          put("Error:" + tError);
      }
      if (voidp(tErrorLevel)) {
        tErrorLevel = this.pErrorLevelList[1];
      } else {
        if (ilk(tErrorLevel) !== Symbol.for("symbol")) {
          tErrorLevel = this.pErrorLevelList[1];
        }
      }
      if (
        this.pErrorLevelList.findPos(tErrorLevel) >=
        this.pErrorLevelList.findPos(this.pErrorDialogLevel)
      ) {
        tError = "Method: " + tMethod + RETURN;
        tError = tError + "Object: " + tObject + RETURN;
        tError = tError + "Message:" + lineOf(tMsg)[1] + RETURN;
        _director.executeMessage(
          Symbol.for("showErrorMessage"),
          "client",
          tError,
        );
      }
      return 0;
    },

    serverError(tErrorList) {
      if (ilk(tErrorList) === Symbol.for("propList")) {
        const tErrorStr =
          tErrorList[Symbol.for("errorId")] +
          "-" +
          tErrorList[Symbol.for("errorMsgId")] +
          "-" +
          tErrorList[Symbol.for("time")];
        this.pServerErrorList.add(tErrorStr);
      }
    },

    getClientErrors() {
      let tErrorStr = EMPTY;
      for (const tError of this.pClientErrorList) {
        tErrorStr = tErrorStr + tError + ";";
      }
      const tMaxLength = 1000;
      tErrorStr = chars(
        tErrorStr,
        tErrorStr.length - tMaxLength,
        tErrorStr.length,
      );
      return tErrorStr;
    },

    getServerErrors() {
      let tErrorStr = EMPTY;
      for (const tError of this.pServerErrorList) {
        tErrorStr = tErrorStr + tError + ";";
      }
      const tMaxLength = 1000;
      tErrorStr = chars(
        tErrorStr,
        tErrorStr.length - tMaxLength,
        tErrorStr.length,
      );
      return tErrorStr;
    },

    SystemAlert(tObject, tMsg, tMethod) {
      return this.error(tObject, tMsg, tMethod);
    },

    setDebugLevel(tDebugLevel) {
      if (!integerp(tDebugLevel)) {
        return 0;
      }
      this.pDebugLevel = tDebugLevel;
      return 1;
    },

    print() {
      put("Errors:" + RETURN + this.pErrorCache);
      return 1;
    },

    fatalError(tErrorData) {
      if (ilk(tErrorData) !== Symbol.for("propList")) {
        tErrorData = propList();
      }
      this.handleFatalError(tErrorData);
    },

    alertHook(tErr, tMsgA, tMsgB) {
      const tErrorData = propList();
      tErrorData["error"] = "script_error";
      tErrorData["hookerror"] = tErr;
      tErrorData["hookmsga"] = tMsgA;
      tErrorData["hookmsgb"] = tMsgB;
      tErrorData["lastexecute"] = _director
        .getBrokerManager()
        .getLastExecutedMessageId();
      tErrorData["lastclick"] = _director.getWindowManager().getLastEvent();
      tErrorData["lastmessage"] = _director
        .getConnectionManager()
        .getLastMessageData();
      tSessionObj = _director.getObject(Symbol.for("session"));
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
    },

    makeErrorId() {
      tSrc =
        integer(
          _director.getObject(Symbol.for("session")).GET("user_user_id"),
        ) % 10000;
      tSrc2 = random(10000) % 10000;
      tDst = zeroPadToString(tSrc, 4) + zeroPadToString(tSrc2, 4);
      return tDst;
    },

    handleFatalError(tErrorData) {
      tErrorUrl = EMPTY;
      tParams = EMPTY;
      if (ilk(tErrorData) !== Symbol.for("propList")) {
        _director.error(
          this,
          "Invalid error data",
          Symbol.for("handleFatalError"),
          Symbol.for("major"),
        );
        tErrorData = propList();
      }
      tErrorType = tErrorData.getaProp("error");
      if (_director.variableExists("client.fatal.error.url")) {
        tErrorUrl = _director.getVariable("client.fatal.error.url");
      }
      tConnection = _director.getConnection(
        _director.getVariable("connection.info.id", Symbol.for("Info")),
      );
      if (tConnection !== VOID) {
        tErrorData["host"] = tConnection.getProperty(Symbol.for("host"));
        tErrorData["port"] = tConnection.getProperty(Symbol.for("port"));
        tErrorData["mus_errorcode"] = tConnection.GetLastError();
      }
      tErrorData["client_version"] = _director.getMoviePath();
      tErrorData["client_process_list"] = string(
        _director.getProcessTrackingList(),
      );
      tErrorData["client_errors"] = this.getClientErrors();
      tErrorData["server_errors"] = this.getServerErrors();
      if (tErrorUrl.includes("?")) {
        tParams = "&";
      } else {
        tParams = "?";
      }
      tEnv = the.environment;
      tErrorData["version"] = tEnv[Symbol.for("productVersion")];
      tErrorData["build"] = tEnv[Symbol.for("productBuildVersion")];
      tErrorData["os"] = tEnv[Symbol.for("osVersion")];
      tErrorData["neterr_cast"] = _director.getCastLoadManager().GetLastError();
      tErrorData["neterr_res"] = _director.getDownloadManager().GetLastError();
      tErrorData["client_uptime"] = _director.getClientUpTime();
      tErrorData["error_id"] = this.makeErrorId();
      if (_director.variableExists("account_id")) {
        tAccountID = _director.getVariable("account_id");
        tAccountID = tAccountID % 9999;
      } else {
        tAccountID = 0;
      }
      tNuErrorData = propList();
      for (let i = 1; i <= this.pFatalReportParamOrder.count; i++) {
        const tKey = this.pFatalReportParamOrder[i];
        const tValue = tErrorData.getaProp(tKey);
        if (tErrorData.getaProp(tKey) !== VOID) {
          tNuErrorData.setaProp(tKey, tValue);
        }
      }
      for (let k = 1; k <= tErrorData.count; k++) {
        const tKey = tErrorData.getPropAt(k);
        if (tNuErrorData.getaProp(tKey) === VOID) {
          tNuErrorData.setaProp(tKey, tErrorData.getaProp(tKey));
        }
      }
      tErrorData = tNuErrorData;
      for (tItemNo = 1; tItemNo <= tErrorData.count; tItemNo++) {
        tKey = string(tErrorData.getPropAt(tItemNo));
        tKey = _director.urlEncode(tKey);
        tValue = string(tErrorData[tKey]);
        tValue = _director.urlEncode(tValue);
        if (tItemNo === 1) {
          tParams = tParams + tKey + "=" + tValue;
          continue;
        }
        tParams = tParams + "&" + tKey + "=" + tValue;
      }
      tPrefTxt =
        date() +
        " " +
        time() +
        RETURN +
        _director.replaceChunks(tParams, "&", RETURN);
      setPref("ClientFatalParams", tPrefTxt);
      this.showErrorDialog();
      _director.pauseUpdate();
      if (tErrorUrl !== EMPTY && !this.pFatalReported) {
        openNetPage(tErrorUrl + tParams, "self");
        this.pFatalReported = true;
      }
      return 1;
    },

    showErrorDialog() {
      if (
        _director.createWindow(
          Symbol.for("error"),
          "error.window",
          0,
          0,
          Symbol.for("modal"),
        ) !== 0
      ) {
        _director.getWindow(Symbol.for("error")).registerClient(this.getID());
        _director
          .getWindow(Symbol.for("error"))
          .registerProcedure(
            Symbol.for("eventProcError"),
            this.getID(),
            Symbol.for("mouseUp"),
          );
        return 1;
      } else {
        return 0;
      }
    },

    eventProcError(tEvent, tSprID, tParam) {
      if (tEvent === Symbol.for("mouseUp") && tSprID === "error_close") {
        _director.removeWindow(Symbol.for("error"));
      }
    },
  };
}
