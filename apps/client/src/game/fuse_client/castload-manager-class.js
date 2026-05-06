import {
  EMPTY,
  RETURN,
  call,
  castLib,
  chars,
  ilk,
  length,
  list,
  offset,
  propList,
  put,
  string,
  VOID,
  voidp,
} from "../../director";

export default function () {
  let tCasts, tPermanentFlag, tAdd, tDoIndexing, tDoTracking;
  let tCastsStr, tCastList, tID, tStatus, tPercent, tProps, i;
  let tClean, tForced, tTempList, f, tCastName, tPermanentLevel;
  let j, tFileName, tFileExtension, tCastNum, tEmptyCastNum;
  let tParsedFile, tURL, tParamOffset, tParamString, tPossibleExtension;
  let tFile, tstate, tTask, tCastNumber, tPreIndexing;
  let tObject, tCastLib, tNewLoadListOfcasts, tPermanent, tCstNumber;
  let tOffset, tCastNameNoParams, tPermanentOrNot, tError;
  let tErrorCode;

  return {
    pWaitList: VOID,
    pTaskList: VOID,
    pAvailableDynCasts: VOID,
    pPermanentLevelList: VOID,
    pLatestTaskID: VOID,
    pCurrentDownLoads: VOID,
    pLoadedCasts: VOID,
    pTempWaitList: VOID,
    pCastLibCount: VOID,
    pSysCastNum: VOID,
    pBinCastNum: VOID,
    pNullCastName: VOID,
    pFileExtension: VOID,
    pLastError: VOID,

    construct() {
      if (the.runMode === "Author") {
        this.pFileExtension = ".cst";
      } else {
        this.pFileExtension = ".cct";
      }
      this.pLoadedCasts = propList();
      this.pTempWaitList = list();
      this.pCastLibCount = 0;
      this.pNullCastName = "empty";
      this.pSysCastNum = castLib("fuse_client").number;
      this.pBinCastNum = castLib(_director.getVariable("dynamic.bin.cast")).number;
      this.pLastError = 0;
      this.verifyReset();
      return 1;
    },

    startCastLoad(tCasts, tPermanentFlag, tAdd, tDoIndexing, tDoTracking) {
      if (voidp(tPermanentFlag)) {
        tPermanentFlag = 0;
      }
      if (voidp(tAdd)) {
        tAdd = 0;
      }
      if (voidp(tDoIndexing)) {
        tDoIndexing = 1;
      }
      if (voidp(tDoTracking)) {
        tDoTracking = 0;
      }
      this.pLastError = 0;
      if (tDoTracking) {
        tCastsStr = EMPTY + tCasts;
        tCastsStr = _director.replaceChunks(tCastsStr, "\"", EMPTY);
        tCastsStr = _director.replaceChunks(tCastsStr, " ", EMPTY);
        tCastsStr = _director.replaceChunks(tCastsStr, "[", EMPTY);
        tCastsStr = _director.replaceChunks(tCastsStr, "]", EMPTY);
        tCastsStr = _director.replaceChunks(tCastsStr, RETURN, EMPTY);
      }
      this.pTempWaitList = list();
      tCastList = list();
      switch (ilk(tCasts)) {
        case Symbol.for("propList"):
          for (let f = 1; f <= tCasts.count; f++) {
            tPermanentLevel = tCasts.getPropAt(f);
            tCastName = tCasts[f];
            tCastList.add(tCastName);
            this.addOneCastToWaitList(tCastName, tPermanentLevel);
          }
          break;
        case Symbol.for("list"):
          for (const tCastName of tCasts) {
            tCastList.add(tCastName);
            this.addOneCastToWaitList(tCastName, tPermanentFlag);
          }
          break;
        default:
          tCasts = list(tCasts);
          for (const tCastName of tCasts) {
            tCastList.add(tCastName);
            this.addOneCastToWaitList(tCastName, tPermanentFlag);
          }
          break;
      }
      if (tCasts.count === 0) {
        return 0;
      }
      tID = _director.getUniqueID();
      this.pLatestTaskID = tID;
      if (tAdd === 0) {
        this.removeTemporaryCast(tCastList);
      }
      if (this.pTempWaitList.count > 0) {
        this.pWaitList[tID] = this.pTempWaitList.duplicate();
      }
      if (this.pWaitList.count === 0) {
        tStatus = Symbol.for("ready");
        tPercent = 1.0;
      } else {
        tStatus = Symbol.for("LOADING");
        tPercent = 0;
      }
      this.pTaskList[tID] = _director.createObject(
        Symbol.for("temp"),
        _director.getClassVariable("castload.task.class"),
      );
      tProps = propList();
      tProps[Symbol.for("id")] = tID;
      tProps[Symbol.for("status")] = tStatus;
      tProps[Symbol.for("Percent")] = tPercent;
      tProps[Symbol.for("sofar")] = 0;
      tProps[Symbol.for("casts")] = this.pTempWaitList.duplicate();
      tProps[Symbol.for("callback")] = VOID;
      tProps[Symbol.for("doindexing")] = tDoIndexing;
      this.pTaskList[tID].define(tProps);
      this.pLastError = 0;
      for (let i = 1; i <= _director.getIntVariable("net.operation.count", 2); i++) {
        this.AddNextpreloadNetThing();
      }
      return tID;
    },

    registerCallback(tID, tMethod, tClientID, tArgument) {
      if (voidp(this.pTaskList.findPos(tID))) {
        return 0;
      } else {
        return call(Symbol.for("addCallBack"), this.pTaskList[tID], tID, tMethod, tClientID, tArgument);
      }
    },

    resetCastLibs(tClean, tForced) {
      if (tClean !== 1) {
        tClean = 0;
      }
      tTempList = list();
      if ((the.runMode === "Author") && (tForced !== 1)) {
        f = 1;
        while (true) {
          if (_director.variableExists("cast.dev." + f)) {
            tTempList.add(_director.getVariable("cast.dev." + f));
          } else {
            break;
          }
          f = f + 1;
        }
      }
      this.pCastLibCount = the.numberOfCastLibs;
      tEmptyCastNum = 1;
      for (let tCastNum = 2; tCastNum <= this.pCastLibCount; tCastNum++) {
        if ((tCastNum !== this.pSysCastNum) && (tCastNum !== this.pBinCastNum)) {
          tCastName = castLib(tCastNum).name;
          if (tTempList.getOne(tCastName) === 0) {
            if (tClean) {
              _director.getThreadManager().closeThread(tCastNum);
            }
            if (tClean) {
              _director.getResourceManager().unregisterMembers(tCastNum);
            }
            castLib(tCastNum).name = this.pNullCastName + " " + tEmptyCastNum;
            castLib(tCastNum).fileName = _director.getMoviePath() + this.pNullCastName + this.pFileExtension;
            tEmptyCastNum = tEmptyCastNum + 1;
            continue;
          }
          this.pLoadedCasts[tCastName] = string(tCastNum);
        }
      }
      return this.InitPreloader();
    },

    getLoadPercent(tID) {
      if (voidp(tID)) {
        tID = this.pLatestTaskID;
      }
      if (!voidp(this.pTaskList[tID])) {
        if (this.pTaskList[tID].getTaskState() === Symbol.for("ready")) {
          return 1.0;
        } else {
          return this.pTaskList[tID].getTaskPercent();
        }
      } else {
        return 1.0;
      }
    },

    FindCastNumber(tCast) {
      for (let j = 1; j <= the.numberOfCastLibs; j++) {
        tFileName = castLib(j).fileName;
        tFileExtension = chars(tFileName, length(tFileName) - 2, length(tFileName));
        if ((castLib(j).name !== "Internal") && (tFileExtension !== "dcr") && (tFileExtension !== "dir")) {
          if (castLib(j).name === tCast) {
            return castLib(tCast).number;
          }
        }
      }
      return 0;
    },

    exists(tCastName) {
      if (tCastName === "internal") {
        return 1;
      }
      if (voidp(this.pLoadedCasts[tCastName])) {
        return 0;
      } else {
        return 1;
      }
    },

    print() {
      for (let i = 1; i <= the.numberOfCastLibs; i++) {
        put(castLib(i).name);
      }
      for (const tObj of this.pCurrentDownLoads) {
        put(tObj[Symbol.for("pFile")] + " " + tObj[Symbol.for("pPercent")]);
      }
    },

    GetLastError() {
      return this.pLastError;
    },

    prepare() {
      if (this.pTaskList.count > 0) {
        this.AddNextpreloadNetThing();
        call(Symbol.for("resetPercentCounter"), this.pTaskList);
        call(Symbol.for("update"), this.pCurrentDownLoads);
      }
    },

    InitPreloader() {
      this.pWaitList = propList();
      this.pTaskList = propList();
      this.pAvailableDynCasts = propList();
      this.pPermanentLevelList = propList();
      this.pCurrentDownLoads = propList();
      this.pLatestTaskID = EMPTY;
      for (let f = 1; f <= the.numberOfCastLibs; f++) {
        tCastNumber = this.FindCastNumber(this.pNullCastName + " " + f);
        if (tCastNumber > 0) {
          this.pAvailableDynCasts.addProp(this.pNullCastName + " " + f, tCastNumber);
        }
      }
      return 1;
    },

    AddNextpreloadNetThing() {
      if (this.pCurrentDownLoads.count < _director.getIntVariable("net.operation.count", 2)) {
        if (this.pWaitList.count > 0) {
          if (this.pWaitList[1].count > 0) {
            tFile = this.pWaitList[1][1];
            tParsedFile = tFile;
            tFileExtension = this.pFileExtension;
            tURL = EMPTY;
            tParamOffset = offset("?", tFile);
            tParamString = EMPTY;
            if (tParamOffset > 0) {
              tParamString = chars(tFile, tParamOffset, length(tFile));
              tFile = chars(tFile, 1, tParamOffset - 1);
            }
            tPossibleExtension = chars(tFile, length(tFile) - 3, length(tFile));
            if ((tPossibleExtension === ".cst") || (tPossibleExtension === ".cct")) {
              tFileExtension = tPossibleExtension;
              tParsedFile = chars(tFile, 1, length(tFile) - length(tPossibleExtension));
            }
            if (!tParsedFile.includes("http://")) {
              tURL = _director.getMoviePath() + tParsedFile + tFileExtension + tParamString;
            } else {
              tURL = tParsedFile + tFileExtension + tParamString;
            }
            tID = this.pWaitList.getPropAt(1);
            this.pWaitList[1].deleteAt(1);
            if (this.pWaitList[1].count === 0) {
              this.pWaitList.deleteProp(this.pWaitList.getPropAt(1));
            }
            this.pCurrentDownLoads[tFile] = _director.createObject(
              Symbol.for("temp"),
              _director.getClassVariable("castload.instance.class"),
            );
            this.pCurrentDownLoads[tFile].define(tFile, tURL, tID);
            this.pTaskList[tID].changeLoadingCount(1);
            _director.receivePrepare(this.getID());
            return 1;
          }
        }
      }
      return 0;
    },

    DoneCurrentDownLoad(tFile, tURL, tID, tstate) {
      if (voidp(this.pCurrentDownLoads[tFile])) {
        return _director.error(this, "CastLoad task was lost! " + tFile + " " + tID, Symbol.for("DoneCurrentDownLoad"), Symbol.for("major"));
      }
      tTask = this.pTaskList[tID];
      if (tTask === VOID) {
        return _director.error(this, "Task list item was lost! " + tFile + " " + tID, Symbol.for("DoneCurrentDownLoad"), Symbol.for("major"));
      }
      if (tstate !== Symbol.for("done")) {
        this.pLastError = _director.netError(this.pCurrentDownLoads[tFile].pNetId);
      }
      if (tstate !== Symbol.for("error")) {
        tCastNumber = this.getAvailableEmptyCast();
        if (tCastNumber > 0) {
          tCastName = tFile;
          tPreIndexing = tTask.getIndexingAllowed();
          this.setImportedCast(tCastNumber, tCastName, tURL, tPreIndexing);
        }
      }
      tTask.OneCastDone(tFile);
      tTask.changeLoadingCount(-1);
      this.pCurrentDownLoads[tFile].deconstruct();
      this.delay(50, Symbol.for("removeCastLoadInstance"), tFile);
      this.removeCastLoadTask(tID, tstate);
      return 1;
    },

    removeCastLoadInstance(tFile) {
      if (ilk(tFile) !== Symbol.for("string")) {
        return 0;
      }
      if (voidp(this.pCurrentDownLoads[tFile])) {
        return _director.error(this, "CastLoad instance was lost! " + tFile, Symbol.for("removeCastLoadInstance"), Symbol.for("minor"));
      } else {
        return this.pCurrentDownLoads.deleteProp(tFile);
      }
    },

    removeCastLoadTask(tID, tstate) {
      tTask = this.pTaskList[tID];
      if (tstate === Symbol.for("failed")) {
        tTask.setFailed();
      }
      if (tTask.getTaskState() === Symbol.for("ready")) {
        if (tTask.getFailed()) {
          tstate = Symbol.for("failed");
        }
        tTask.DoCallBack(tstate);
        tTask.deconstruct();
        this.pTaskList.deleteProp(tID);
        if (this.pTaskList.count === 0) {
          _director.removePrepare(this.getID());
        }
      }
    },

    TellStreamState(tFileName, tstate, tPercent, tID) {
      tObject = this.pTaskList[tID];
      if (tObject !== VOID) {
        call(Symbol.for("UpdateTaskPercent"), tObject, tPercent, tFileName);
      } else {
        return _director.error(this, "Task list instance was lost! " + tFileName + " " + tID, Symbol.for("TellStreamState"), Symbol.for("major"));
      }
    },

    setImportedCast(tCastNum, tCastName, tFileName, tDoIndexing) {
      tCastLib = castLib(tCastNum);
      if (voidp(tDoIndexing)) {
        tDoIndexing = 1;
      }
      if (tCastLib.name.includes(this.pNullCastName)) {
        tCastLib.fileName = tFileName;
        tCastLib.name = tCastName;
        this.pPermanentLevelList[tCastName][2] = tCastNum;
        if (tDoIndexing) {
          _director.getResourceManager().preIndexMembers(tCastNum);
        }
        this.pLoadedCasts[tCastName] = string(tCastNum);
      }
      this.verifyReset();
    },

    getAvailableEmptyCast() {
      if (this.pAvailableDynCasts.count > 0) {
        tCastNum = this.pAvailableDynCasts.getLast();
        this.pAvailableDynCasts.deleteAt(this.pAvailableDynCasts.count);
        return tCastNum;
      } else {
        _director.SystemAlert(this, "Out of free cast entries! CastLoad failed.");
        return 0;
      }
    },

    removeTemporaryCast(tNewLoadListOfcasts) {
      tTempList = this.pPermanentLevelList.duplicate();
      for (let f = 1; f <= tTempList.count; f++) {
        tPermanent = tTempList[f][1];
        tCstNumber = tTempList[f][2];
        if ((tPermanent === 0) && (tCstNumber > 0)) {
          tCastName = tTempList.getPropAt(f);
          if (!tNewLoadListOfcasts.getOne(tCastName)) {
            this.pPermanentLevelList.deleteProp(tCastName);
            this.ResetOneDynamicCast(tCstNumber);
            if (this.pCastLibCount !== the.numberOfCastLibs) {
              this.pCastLibCount = the.numberOfCastLibs;
              tError = "CastLib count was changed!!!" + RETURN;
              tError = tError + "CastLib with problems: " + castLib(this.pCastLibCount).name;
              _director.error(this, tError, Symbol.for("removeTemporaryCast"), Symbol.for("minor"));
            }
          }
        }
      }
    },

    addOneCastToWaitList(tCastName, tPermanentOrNot) {
      if (!this.FindCastNumber(tCastName) && !this.pWaitList.getOne(tCastName)) {
        this.pTempWaitList.add(tCastName);
        tOffset = offset("?", tCastName);
        if (tOffset !== 0) {
          tCastNameNoParams = chars(tCastName, 1, tOffset - 1);
        } else {
          tCastNameNoParams = tCastName;
        }
        this.pPermanentLevelList.addProp(tCastNameNoParams, [tPermanentOrNot, 0]);
      } else {
        if (voidp(this.pLoadedCasts[tCastName])) {
          this.pLoadedCasts[tCastName] = string(this.FindCastNumber(tCastName));
        }
      }
    },

    ResetOneDynamicCast(tCastNum) {
      if (this.pLoadedCasts.getOne(string(tCastNum)) !== 0) {
        this.pLoadedCasts.deleteProp(this.pLoadedCasts.getOne(string(tCastNum)));
      } else {
        _director.error(this, "Couldn't remove cast: " + tCastNum, Symbol.for("ResetOneDynamicCast"), Symbol.for("minor"));
      }
      _director.getThreadManager().closeThread(tCastNum);
      _director.getResourceManager().unregisterMembers(tCastNum);
      castLib(tCastNum).name = this.pNullCastName + " " + (tCastNum - 2);
      castLib(this.pNullCastName + " " + (tCastNum - 2)).fileName = _director.getMoviePath() + this.pNullCastName + this.pFileExtension;
      this.pAvailableDynCasts.addProp(this.pNullCastName + (tCastNum - 2), tCastNum);
      return 1;
    },

    verifyReset() {
      for (let tEmptyCastNum = 1; tEmptyCastNum <= the.numberOfCastLibs; tEmptyCastNum++) {
        if (castLib(tEmptyCastNum).fileName.includes(this.pNullCastName)) {
          if (_director.numberOfCastMembersOfCastLib(tEmptyCastNum) > 0) {
            _director.fatalError({ [Symbol.for("error")]: "empty_cast_failure" });
            return 0;
          }
        }
      }
    },

    solveNetErrorMsg(tErrorCode) {
      switch (tErrorCode) {
        case EMPTY:
          return "Unknown error.";
        case "OK":
          return "OK";
        case -128:
          return "Operation was cancelled.";
        case 0:
          return "OK";
        case 4:
          return "Bad MOA Class. Network Xtras may be improperly installed.";
        case 5:
          return "Bad MOA Interface. Network Xtras may be improperly installed.";
        case 6:
          return "General transfer error.";
        case 20:
          return "Internal error.";
        case 900:
          return "Failed attempt to write to locked media.";
        case 903:
          return "Disk is full.";
        case 905:
          return "Bad URL.";
        case 4144:
          return "Failed network operation.";
        case 4145:
          return "Failed network operation.";
        case 4146:
          return "Connection could not be established with the remote host.";
        case 4147:
          return "Failed network operation.";
        case 4148:
          return "Failed network operation.";
        case 4149:
          return "Data supplied by the server was in an unexpected format.";
        case 4150:
          return "Unexpected early closing of connection.";
        case 4151:
          return "Failed network operation.";
        case 4152:
          return "Data returned is truncated.";
        case 4153:
          return "Failed network operation.";
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
        case 4160:
          return "Failed network operation.";
        case 4161:
          return "Failed network operation.";
        case 4162:
          return "Failed network operation.";
        case 4163:
          return "Failed network operation.";
        case 4164:
          return "Could not create a socket";
        case 4165:
          return "Requested Object could not be found (URL may be incorrect).";
        case 4166:
          return "Generic proxy failure.";
        case 4167:
          return "Transfer was intentionally interrupted by client.";
        case 4168:
          return "Failed network operation.";
        case 4242:
          return "Download stopped by netAbort(url).";
        case 4836:
          return "Cache download stopped for an unknown reason.";
        default:
          return "Other network error: " + tErrorCode;
      }
    },
  };
}
