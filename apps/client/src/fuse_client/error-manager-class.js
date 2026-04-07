// fuse_client/28_Error Manager Class.ls → error-manager-class.js
// Error manager - handles error reporting, caching, and fatal errors

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  listp,
  random,
  replaceChunks,
} from "../core/lingo-runtime.js";
import { getVariable, variableExists } from "./variable-api.js";
import { getConnection } from "./connection-api.js";
import {
  getMoviePath,
  getProcessTrackingList,
  getClientUpTime,
} from "./special-services-api.js";
import { getCastLoadManager } from "./castload-api.js";
import { getDownloadManager } from "./download-api.js";
import { openNetPage } from "./special-services-api.js";
import { pauseUpdate } from "./object-api.js";
import { createWindow, getWindow, removeWindow } from "./window-api.js";

export class ErrorManagerClass {
  constructor() {
    this.pDebugLevel = 1;
    this.pErrorCache = "";
    this.pCacheSize = 30;
    this.pErrorDialogLevel = null;
    this.pErrorLevelList = [
      symbol("#minor"),
      symbol("#major"),
      symbol("#critical"),
    ];
    this.pFatalReported = 0;
    this.pFatalReportParamOrder = [
      "error",
      "version",
      "build",
      "os",
      "host",
      "port",
      "client_version",
      "mus_errorcode",
      "error_id",
    ];
    this.pClientErrorList = [];
    this.pServerErrorList = [];

    this.pID = null;
  }

  construct() {
    this.pDebugLevel = 1;
    this.pErrorCache = "";
    this.pCacheSize = 30;
    this.pFatalReported = 0;
    this.pClientErrorList = [];
    this.pServerErrorList = [];
    this.pErrorLevelList = [
      symbol("#minor"),
      symbol("#major"),
      symbol("#critical"),
    ];
    if (!variableExists("client.debug.level")) {
      this.pErrorDialogLevel =
        this.pErrorLevelList[this.pErrorLevelList.length - 1];
    } else {
      this.pErrorDialogLevel = getVariable("client.debug.level");
      if (typeof this.pErrorDialogLevel !== "symbol") {
        this.pErrorDialogLevel =
          this.pErrorLevelList[this.pErrorLevelList.length - 1];
      } else {
        if (this.pErrorLevelList.indexOf(this.pErrorDialogLevel) < 0) {
          this.pErrorDialogLevel =
            this.pErrorLevelList[this.pErrorLevelList.length - 1];
        }
      }
    }
    this.pFatalReportParamOrder = [
      "error",
      "version",
      "build",
      "os",
      "host",
      "port",
      "client_version",
      "mus_errorcode",
      "error_id",
    ];
    return true;
  }

  deconstruct() {
    return true;
  }

  error(tObject, tMsg, tMethod, tErrorLevel) {
    if (objectp(tObject)) {
      tObject = String(tObject);
    } else {
      tObject = "Unknown";
    }
    if (!stringp(tMsg)) {
      tMsg = "Unknown";
    }
    if (!symbolp(tMethod)) {
      tMethod = "Unknown";
    }
    let tError = "\n";
    tError += "\tTime:   " + "the long time" + "\n";
    tError += "\tMethod: " + tMethod + "\n";
    tError += "\tObject: " + tObject + "\n";
    tError += "\tMessage:" + tMsg.split("\n")[0] + "\n";
    const tErrorStr =
      "the long time" +
      "-" +
      tMethod +
      "-" +
      tObject +
      "-" +
      tMsg.split("\n")[0];
    this.pClientErrorList.push(tErrorStr);
    const msgLines = tMsg.split("\n");
    if (msgLines.length > 1) {
      for (let i = 1; i < msgLines.length; i++) {
        tError += "\t        " + msgLines[i] + "\n";
      }
    }
    this.pErrorCache += tError;
    const cacheLines = this.pErrorCache.split("\n");
    if (cacheLines.length > this.pCacheSize) {
      this.pErrorCache = cacheLines
        .slice(cacheLines.length - this.pCacheSize)
        .join("\n");
    }
    switch (this.pDebugLevel) {
      case 1:
        console.error("Error:" + tError);
        break;
      case 2:
        console.error("Error:" + tError);
        break;
      case 3:
        // executeMessage(#debugdata, "Error: " + tError)
        break;
      default:
        console.error("Error:" + tError);
    }
    if (voidP(tErrorLevel)) {
      tErrorLevel = this.pErrorLevelList[0];
    } else {
      if (typeof tErrorLevel !== "symbol") {
        tErrorLevel = this.pErrorLevelList[0];
      }
    }
    const errLevelIdx = this.pErrorLevelList.indexOf(tErrorLevel);
    const dialogLevelIdx = this.pErrorLevelList.indexOf(this.pErrorDialogLevel);
    if (errLevelIdx >= dialogLevelIdx) {
      tError = "Method: " + tMethod + "\n";
      tError += "Object: " + tObject + "\n";
      tError += "Message:" + tMsg.split("\n")[0] + "\n";
      // executeMessage(#showErrorMessage, "client", tError)
    }
    return false;
  }

  serverError(tErrorList) {
    if (
      tErrorList &&
      typeof tErrorList === "object" &&
      tErrorList[symbol("#errorId")] !== undefined
    ) {
      const tErrorStr =
        tErrorList[symbol("#errorId")] +
        "-" +
        tErrorList[symbol("#errorMsgId")] +
        "-" +
        tErrorList[symbol("#time")];
      this.pServerErrorList.push(tErrorStr);
    }
  }

  getClientErrors() {
    let tErrorStr = "";
    for (const tError of this.pClientErrorList) {
      tErrorStr += tError + ";";
    }
    const tMaxLength = 1000;
    if (tErrorStr.length > tMaxLength) {
      tErrorStr = tErrorStr.substring(tErrorStr.length - tMaxLength);
    }
    return tErrorStr;
  }

  getServerErrors() {
    let tErrorStr = "";
    for (const tError of this.pServerErrorList) {
      tErrorStr += tError + ";";
    }
    const tMaxLength = 1000;
    if (tErrorStr.length > tMaxLength) {
      tErrorStr = tErrorStr.substring(tErrorStr.length - tMaxLength);
    }
    return tErrorStr;
  }

  SystemAlert(tObject, tMsg, tMethod) {
    return this.error(tObject, tMsg, tMethod);
  }

  setDebugLevel(tDebugLevel) {
    if (!integerp(tDebugLevel)) {
      return false;
    }
    this.pDebugLevel = tDebugLevel;
    return true;
  }

  print() {
    console.log("Errors:\n" + this.pErrorCache);
    return true;
  }

  fatalError(tErrorData) {
    if (!tErrorData || typeof tErrorData !== "object") {
      tErrorData = {};
    }
    this.handleFatalError(tErrorData);
  }

  alertHook(tErr, tMsgA, tMsgB) {
    const tErrorData = {};
    tErrorData["error"] = "script_error";
    tErrorData["hookerror"] = tErr;
    tErrorData["hookmsga"] = tMsgA;
    tErrorData["hookmsgb"] = tMsgB;
    // tErrorData['lastexecute'] = getBrokerManager().getLastExecutedMessageId()
    // tErrorData['lastclick'] = getWindowManager().getLastEvent()
    // tErrorData['lastmessage'] = getConnectionManager().getLastMessageData()
    const tSessionObj = getObject(symbol("#session"));
    if (objectp(tSessionObj)) {
      const tLastRoom = tSessionObj.GET("lastroom");
      if (stringp(tLastRoom)) {
        tErrorData["lastroom"] = tLastRoom;
      } else if (listp(tLastRoom)) {
        tErrorData["lastroom"] = String(tLastRoom[symbol("#id")]);
      }
    }
    this.handleFatalError(tErrorData);
    return true;
  }

  zeroPadToString(tNumber, tCount) {
    let tOut = "";
    if (String(tNumber).length < tCount) {
      for (let i = 0; i < tCount - String(tNumber).length; i++) {
        tOut += "0";
      }
    }
    tOut += String(tNumber);
    return tOut;
  }

  makeErrorId() {
    const tSrc =
      parseInt(getObject(symbol("#session")).GET("user_user_id")) % 10000;
    const tSrc2 = random(10000) % 10000;
    const tDst = this.zeroPadToString(tSrc, 4) + this.zeroPadToString(tSrc2, 4);
    return tDst;
  }

  handleFatalError(tErrorData) {
    let tErrorUrl = "";
    let tParams = "";
    if (!tErrorData || typeof tErrorData !== "object") {
      this.error(
        this,
        "Invalid error data",
        symbol("#handleFatalError"),
        symbol("#major"),
      );
      tErrorData = {};
    }
    const tErrorType = tErrorData["error"];
    if (variableExists("client.fatal.error.url")) {
      tErrorUrl = getVariable("client.fatal.error.url");
    }
    const tConnection = getConnection(
      getVariable("connection.info.id", symbol("#Info")),
    );
    if (tConnection !== null) {
      tErrorData["host"] = tConnection.getProperty(symbol("#host"));
      tErrorData["port"] = tConnection.getProperty(symbol("#port"));
      // tErrorData['mus_errorcode'] = tConnection.GetLastError()
    }
    tErrorData["client_version"] = getMoviePath();
    tErrorData["client_process_list"] = String(getProcessTrackingList());
    tErrorData["client_errors"] = this.getClientErrors();
    tErrorData["server_errors"] = this.getServerErrors();
    if (tErrorUrl.includes("?")) {
      tParams = "&";
    } else {
      tParams = "?";
    }
    // tEnv = the environment - placeholder
    tErrorData["version"] = "unknown";
    tErrorData["build"] = "unknown";
    tErrorData["os"] = "unknown";
    // tErrorData['neterr_cast'] = getCastLoadManager().GetLastError()
    // tErrorData['neterr_res'] = getDownloadManager().GetLastError()
    tErrorData["client_uptime"] = getClientUpTime();
    tErrorData["error_id"] = this.makeErrorId();
    let tAccountID = 0;
    if (variableExists("account_id")) {
      tAccountID = getVariable("account_id");
      tAccountID = tAccountID % 9999;
    }
    const tNuErrorData = {};
    for (let i = 0; i < this.pFatalReportParamOrder.length; i++) {
      const tKey = this.pFatalReportParamOrder[i];
      if (tErrorData[tKey] !== undefined) {
        tNuErrorData[tKey] = tErrorData[tKey];
      }
    }
    for (const tKey of Object.keys(tErrorData)) {
      if (tNuErrorData[tKey] === undefined) {
        tNuErrorData[tKey] = tErrorData[tKey];
      }
    }
    tErrorData = tNuErrorData;
    let firstItem = true;
    for (const tKey of Object.keys(tErrorData)) {
      const encodedKey = urlEncode(String(tKey));
      const encodedValue = urlEncode(String(tErrorData[tKey]));
      if (firstItem) {
        tParams += encodedKey + "=" + encodedValue;
        firstItem = false;
        continue;
      }
      tParams += "&" + encodedKey + "=" + encodedValue;
    }
    const tPrefTxt = "date() time()\n" + replaceChunks(tParams, "&", "\n");
    // setPref("ClientFatalParams", tPrefTxt)
    this.showErrorDialog();
    pauseUpdate();
    if (tErrorUrl !== "" && !this.pFatalReported) {
      openNetPage(tErrorUrl + tParams, "self");
      this.pFatalReported = 1;
    }
    return true;
  }

  showErrorDialog() {
    // if (createWindow(symbol('#error'), "error.window", 0, 0, symbol('#modal')) !== 0) {
    //   getWindow(symbol('#error')).registerClient(this.pID)
    //   getWindow(symbol('#error')).registerProcedure(symbol('#eventProcError'), this.pID, symbol('#mouseUp'))
    //   return true
    // }
    return false;
  }

  eventProcError(tEvent, tSprID, tParam) {
    if (tEvent === symbol("#mouseUp") && tSprID === "error_close") {
      // removeWindow(symbol('#error'))
    }
  }
}
