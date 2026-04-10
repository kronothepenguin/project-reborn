import {
  EMPTY,
  RETURN,
  call,
  charOf,
  getPref,
  ilk,
  integerp,
  length,
  list,
  member,
  offset,
  propList,
  setPref,
  stringp,
  symbolp,
  value,
  VOID,
  voidp,
} from "../../director";

export default function () {
  let tURL, tMemName, ttype, tForceFlag, tDownloadMethod, tRedirectType, tTarget;
  let tMemNameOrNum, tTaskData, tMethod, tClientID, tArgument;
  let tPropID, tValue, tErrorCode, tListList, tListMode, i, tID, tCallback, tSuccess;
  let tOwnDomain, tDownloadDomain, tAllowCrossDomain, tNotifyCrossDomain, tPref;
  let tMemNum, tTempTask, tTaskName, tResource, tFileType;
  let tCookiePrefLoc, tTaskQueue, tActiveTasks, tReceivedTasks, tCompleteTasks;
  let tTypeDefList;

  return {
    pTaskQueue: VOID,
    pActiveTasks: VOID,
    pReceivedTasks: VOID,
    pCompleteTasks: VOID,
    pTypeDefList: VOID,
    pOwnDomain: VOID,
    pLastError: VOID,

    construct() {
      this.pTaskQueue = propList();
      this.pActiveTasks = propList();
      this.pReceivedTasks = list();
      this.pCompleteTasks = list();
      this.pTypeDefList = propList();
      this.emptyCookies();
      this.pOwnDomain = _director.getDomainPart(_director.getMoviePath());
      this.pLastError = 0;
      return 1;
    },

    deconstruct() {
      this.pTaskQueue = propList();
      this.pActiveTasks = propList();
      this.pReceivedTasks = list();
      this.pCompleteTasks = list();
      return 1;
    },

    create(tURL, tMemName, ttype, tForceFlag) {
      return this.queue(tURL, tMemName, ttype, tForceFlag);
    },

    Remove(tMemNameOrNum) {
      return this.abort(tMemNameOrNum);
    },

    exists(tMemName) {
      return !voidp(this.pTaskQueue[tMemName]) || !voidp(this.pActiveTasks[tMemName]);
    },

    queue(tURL, tMemName, ttype, tForceFlag, tDownloadMethod, tRedirectType, tTarget) {
      if (!ilk(tURL, Symbol.for("string"))) {
        return _director.error(this, "Missing or invalid URL: " + tURL, Symbol.for("queue"), Symbol.for("major"));
      }
      if (!ilk(tMemName, Symbol.for("string"))) {
        tMemName = tURL;
      }
      if (!ilk(ttype, Symbol.for("symbol"))) {
        ttype = this.recognizeMemberType(tURL);
      }
      tURL = _director.getPredefinedURL(tURL);
      tOwnDomain = _director.getDomainPart(_director.getMoviePath());
      tDownloadDomain = _director.getDomainPart(tURL);
      if ((tOwnDomain !== tDownloadDomain) && ((tURL.includes("http://")) || (tURL.includes("https://"))) && !(tURL.includes("://localhost"))) {
        tAllowCrossDomain = 0;
        if (_director.variableExists("client.allow.cross.domain")) {
          tAllowCrossDomain = value(_director.getVariable("client.allow.cross.domain"));
        }
        tNotifyCrossDomain = 1;
        if (_director.variableExists("client.notify.cross.domain")) {
          tNotifyCrossDomain = value(_director.getVariable("client.notify.cross.domain"));
        }
        if (tNotifyCrossDomain) {
          _director.executeMessage("crossDomainDownload", tURL);
        }
        if (!tAllowCrossDomain) {
          tPref = getPref("CrossDomainAlert.txt");
          setPref("CrossDomainAlert.txt", tURL + " " + _director.date() + " " + _director.time() + RETURN + tPref);
          return _director.error(this, "Cross domain download not allowed: " + tURL, Symbol.for("queue"), Symbol.for("minor"));
        }
      }
      if (!voidp(this.pTaskQueue[tMemName]) || !voidp(this.pActiveTasks[tMemName])) {
        return _director.error(this, "File already downloading: " + tMemName, Symbol.for("queue"), Symbol.for("minor"));
      }
      if (_director.memberExists(tMemName)) {
        if (tForceFlag) {
          tMemNum = _director.getmemnum(tMemName);
        } else {
          return _director.getmemnum(tMemName);
        }
      } else {
        tMemNum = _director.createMember(tMemName, ttype);
      }
      if (tMemNum < 1) {
        return _director.error(this, "Failed to create member!", Symbol.for("queue"), Symbol.for("major"));
      } else {
        if (member(tMemNum).type === Symbol.for("bitmap")) {
          member(tMemNum).image = image(1, 1, 8);
        }
      }
      this.pReceivedTasks.push(tMemName);
      tTempTask = { [Symbol.for("url")]: tURL, [Symbol.for("memNum")]: tMemNum, [Symbol.for("type")]: ttype, [Symbol.for("callback")]: VOID };
      tTempTask[Symbol.for("downloadMethod")] = tDownloadMethod;
      tTempTask[Symbol.for("redirectType")] = tRedirectType;
      tTempTask[Symbol.for("target")] = tTarget;
      this.pTaskQueue[tMemName] = tTempTask;
      this.updateQueue();
      return tMemNum;
    },

    registerCallback(tMemNameOrNum, tMethod, tClientID, tArgument) {
      tTaskData = this.searchTask(tMemNameOrNum);
      if (!tTaskData) {
        if (stringp(tMemNameOrNum)) {
          if (_director.getmemnum(tMemNameOrNum) === 0) {
            return _director.error(this, "Task doesn't exist: " + tMemNameOrNum, Symbol.for("registerCallback"), Symbol.for("major"));
          }
        } else {
          if (integerp(tMemNameOrNum)) {
            if (member(tMemNameOrNum).type === Symbol.for("empty")) {
              return _director.error(this, "Task doesn't exist: " + tMemNameOrNum, Symbol.for("registerCallback"), Symbol.for("major"));
            }
          } else {
            return _director.error(this, "Member's name or number expected: " + tMemNameOrNum, Symbol.for("registerCallback"), Symbol.for("major"));
          }
        }
        tTaskData = { [Symbol.for("status")]: Symbol.for("complete") };
      }
      if (!symbolp(tMethod)) {
        return _director.error(this, "Symbol referring to a handler expected: " + tMethod, Symbol.for("registerCallback"), Symbol.for("major"));
      }
      if (!_director.objectExists(tClientID)) {
        return _director.error(this, "Object not found: " + tClientID, Symbol.for("registerCallback"), Symbol.for("major"));
      }
      if (!_director.getObject(tClientID).handler(tMethod)) {
        return _director.error(this, "Handler not found in object: " + tMethod.description, tClientID, Symbol.for("registerCallback"), Symbol.for("major"));
      }
      switch (tTaskData[Symbol.for("status")]) {
        case Symbol.for("complete"):
          call(tMethod, _director.getObject(tClientID), tArgument);
          break;
        case Symbol.for("queue"):
          this.pTaskQueue[tTaskData[Symbol.for("name")]][Symbol.for("callback")] = { [Symbol.for("method")]: tMethod, [Symbol.for("client")]: tClientID, [Symbol.for("argument")]: tArgument };
          break;
        case Symbol.for("Active"):
          call(Symbol.for("addCallBack"), this.pActiveTasks, tTaskData[Symbol.for("name")], { [Symbol.for("method")]: tMethod, [Symbol.for("client")]: tClientID, [Symbol.for("argument")]: tArgument });
          break;
      }
      return 1;
    },

    getLoadPercent(tMemNameOrNum) {
      if (integerp(tMemNameOrNum)) {
        tMemName = member(tMemNameOrNum).name;
      } else {
        if (stringp(tMemNameOrNum)) {
          tMemName = tMemNameOrNum;
        } else {
          return _director.error(this, "Member's name or number expected: " + tMemNameOrNum, Symbol.for("getLoadPercent"), Symbol.for("minor"));
        }
      }
      if (this.pReceivedTasks.getOne(tMemName) === 0) {
        return _director.error(this, "Downloaded file not found: " + tMemName, Symbol.for("getLoadPercent"), Symbol.for("minor"));
      }
      if (!voidp(this.pActiveTasks[tMemName])) {
        return this.pActiveTasks[tMemName][Symbol.for("Percent")];
      } else {
        if (!voidp(this.pTaskQueue[tMemName])) {
          return 0.0;
        } else {
          if (this.pCompleteTasks.getOne(tMemName)) {
            return 1.0;
          }
        }
      }
      return 1.0;
    },

    getProperty(tPropID) {
      switch (tPropID) {
        case Symbol.for("curTaskCount"):
          return this.pTaskQueue.count + this.pActiveTasks.count;
        case Symbol.for("actTaskCount"):
          return this.pActiveTasks.count;
        case Symbol.for("maxTaskCount"):
          return _director.getIntVariable("net.operation.count");
        case Symbol.for("defaultURL"):
          return _director.getMoviePath();
        default:
          return 0;
      }
    },

    setProperty(tPropID, tValue) {
      switch (tPropID) {
        default:
          return 0;
      }
    },

    solveNetErrorMsg(tErrorCode) {
      switch (tErrorCode) {
        case 4:
          return "Bad MOA class. The required network or nonnetwork Xtras are improperly installed or not installed at all.";
        case 5:
          return "Bad MOA Interface. The required network or nonnetwork Xtras are improperly installed or not installed at all.";
        case 6:
          return "Bad URL or Bad MOA class. The required network or nonnetwork Xtras are improperly installed or not installed at all.";
        case 20:
          return "Internal error. Returned by netError() in the Netscape browser if the browser detected a network or internal error.";
        case 4146:
          return "Connection could not be established with the remote host.";
        case 4149:
          return "Data supplied by the server was in an unexpected format.";
        case 4150:
          return "Unexpected early closing of connection.";
        case 4154:
          return "Operation could not be completed due to timeout.";
        case 4155:
          return "Not enough memory available to complete the transaction.";
        case 4156:
          return "Protocol reply to request indicates an error in the reply.";
        case 4157:
          return "Transaction failed to be authenticated.";
        case 4159:
          return "Invalid URL.";
        case 4164:
          return "Could not create a socket.";
        case 4165:
          return "Requested object could not be found (URL may be incorrect).";
        case 4166:
          return "Generic proxy failure.";
        case 4167:
          return "Transfer was intentionally interrupted by client.";
        case 4242:
          return "Download stopped by netAbort(url).";
        case 4836:
          return "Download stopped for an unknown reason, possibly a network error, or the download was abandoned.";
        default:
          return "Unknown error!";
      }
    },

    print() {
      tListList = [this.pActiveTasks, this.pTaskQueue, this.pReceivedTasks];
      for (const tList of tListList) {
        tListMode = ilk(tList);
        for (let i = 1; i <= tList.count; i++) {
          if (tListMode === Symbol.for("list")) {
            tID = i;
          } else {
            tID = tList.getPropAt(i);
          }
          if (symbolp(tID)) {
            tID = "#" + tID;
          }
          put(tID + " : " + tList[i]);
        }
      }
      return 1;
    },

    GetLastError() {
      return this.pLastError;
    },

    update() {
      call(Symbol.for("update"), this.pActiveTasks);
    },

    searchTask(tMemNameOrNum) {
      if (stringp(tMemNameOrNum)) {
        if (this.pReceivedTasks.getPos(tMemNameOrNum) < 1) {
          return 0;
        }
        tTaskData = { [Symbol.for("name")]: tMemNameOrNum, [Symbol.for("number")]: _director.getmemnum(tMemNameOrNum), [Symbol.for("status")]: VOID };
        tResource = this.pTaskQueue[tMemNameOrNum];
        if (!voidp(tResource)) {
          tTaskData[Symbol.for("status")] = Symbol.for("queue");
        }
        tResource = this.pActiveTasks[tMemNameOrNum];
        if (!voidp(tResource)) {
          tTaskData[Symbol.for("status")] = Symbol.for("Active");
        }
        tResource = this.pCompleteTasks.getPos(tMemNameOrNum);
        if (tResource > 0) {
          tTaskData[Symbol.for("status")] = Symbol.for("complete");
        }
        if (tTaskData[Symbol.for("status")] !== VOID) {
          return tTaskData;
        }
        return _director.error(this, "Referred task not found: " + tMemNameOrNum, Symbol.for("searchTask"), Symbol.for("minor"));
      } else {
        if (integerp(tMemNameOrNum)) {
          return this.searchTask(member(tMemNameOrNum).name);
        }
      }
      return _director.error(this, "Member's name or number expected: " + tMemNameOrNum, Symbol.for("searchTask"), Symbol.for("minor"));
    },

    updateQueue() {
      if (this.pActiveTasks.count < _director.getIntVariable("net.operation.count")) {
        if (this.pTaskQueue.count > 0) {
          this.pLastError = 0;
          tTaskName = this.pTaskQueue.getPropAt(1);
          tTaskData = this.pTaskQueue[tTaskName];
          this.pTaskQueue.deleteProp(tTaskName);
          if (tTaskData[Symbol.for("downloadMethod")] === Symbol.for("httpcookie")) {
            this.pActiveTasks[tTaskName] = _director.createObject(
              _director.getUniqueID(),
              _director.getClassVariable("httpcookie.instance.class"),
            );
          } else {
            this.pActiveTasks[tTaskName] = _director.createObject(
              _director.getUniqueID(),
              _director.getClassVariable("download.instance.class"),
            );
          }
          this.pActiveTasks[tTaskName].define(tTaskName, tTaskData);
          _director.receiveUpdate(this.getID());
        }
      }
      if (this.pActiveTasks.count === 0) {
        _director.removeUpdate(this.getID());
      }
      return 1;
    },

    removeActiveTask(tMemName, tCallback, tSuccess) {
      if (voidp(tSuccess)) {
        tSuccess = 1;
      }
      for (let i = 1; i <= this.pActiveTasks.count; i++) {
        if (this.pActiveTasks[i].pMemName === tMemName) {
          if (!tSuccess) {
            this.pLastError = _director.netError(this.pActiveTasks[i].pNetId);
          }
          this.pActiveTasks[i].deconstruct();
          this.pActiveTasks.deleteAt(i);
          this.pCompleteTasks.push(tMemName);
          this.updateQueue();
          break;
        }
      }
      if (!voidp(tCallback)) {
        if (_director.objectExists(tCallback[Symbol.for("client")])) {
          call(
            tCallback[Symbol.for("method")],
            _director.getObject(tCallback[Symbol.for("client")]),
            tCallback[Symbol.for("argument")],
            tSuccess,
          );
        }
      }
      return 0;
    },

    eraseDownloadedItems() {
      for (let i = 1; i <= this.pReceivedTasks.count; i++) {
        _director.removeMember(this.pReceivedTasks[i]);
      }
      return 1;
    },

    recognizeMemberType(tURL) {
      if (this.pTypeDefList.count === 0) {
        this.fillTypeDefinitions();
      }
      tFileType = charOf(tURL).slice(length(tURL) - 5, length(tURL));
      tFileType = charOf(tFileType).slice(offset(".", tFileType) + 1, length(tFileType));
      tFileType = this.pTypeDefList[tFileType];
      if (!symbolp(tFileType)) {
        _director.error(this, "Couldn't recognize member's type: " + tURL, Symbol.for("recognizeMemberType"), Symbol.for("minor"));
        return Symbol.for("field");
      } else {
        return tFileType;
      }
    },

    emptyCookies() {
      tCookiePrefLoc = _director.getVariable("httpcookie.pref.name");
      setPref(tCookiePrefLoc, EMPTY);
    },

    fillTypeDefinitions() {
      this.pTypeDefList = propList();
      this.pTypeDefList["gif"] = Symbol.for("bitmap");
      this.pTypeDefList["jpg"] = Symbol.for("bitmap");
      this.pTypeDefList["bmp"] = Symbol.for("bitmap");
      this.pTypeDefList["png"] = Symbol.for("bitmap");
      this.pTypeDefList["tif"] = Symbol.for("bitmap");
      this.pTypeDefList["tiff"] = Symbol.for("bitmap");
      this.pTypeDefList["psd"] = Symbol.for("bitmap");
      this.pTypeDefList["txt"] = Symbol.for("field");
      this.pTypeDefList["html"] = Symbol.for("field");
      this.pTypeDefList["htm"] = Symbol.for("field");
      this.pTypeDefList["jsp"] = Symbol.for("field");
      this.pTypeDefList["xml"] = Symbol.for("field");
      this.pTypeDefList["nfo"] = Symbol.for("field");
      this.pTypeDefList["js"] = Symbol.for("field");
      this.pTypeDefList["css"] = Symbol.for("field");
      this.pTypeDefList["avi"] = Symbol.for("digitalVideo");
      this.pTypeDefList["mpg"] = Symbol.for("digitalVideo");
      this.pTypeDefList["mpeg"] = Symbol.for("digitalVideo");
      this.pTypeDefList["mp3"] = Symbol.for("sound");
      this.pTypeDefList["wav"] = Symbol.for("sound");
      this.pTypeDefList["snd"] = Symbol.for("sound");
      this.pTypeDefList["swa"] = Symbol.for("swa");
      this.pTypeDefList["fla"] = Symbol.for("flash");
      this.pTypeDefList["fnt"] = Symbol.for("font");
      this.pTypeDefList["ttf"] = Symbol.for("font");
      this.pTypeDefList["cur"] = Symbol.for("cursor");
      return 1;
    },
  };
}
