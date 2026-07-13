export default class {
  pWaitList;
  pTaskList;
  pAvailableDynCasts;
  pPermanentLevelList;
  pLatestTaskID;
  pCurrentDownLoads;
  pLoadedCasts;
  pTempWaitList;
  pCastLibCount;
  pSysCastNum;
  pBinCastNum;
  pNullCastName;
  pFileExtension;
  pLastError;

  construct() {
    if (the.runMode == "Author") {
      this.pFileExtension = ".cst";
    } else {
      this.pFileExtension = ".cct";
    }
    this.pLoadedCasts = propList();
    this.pTempWaitList = list();
    this.pCastLibCount = 0;
    this.pNullCastName = "empty";
    this.pSysCastNum = castLib("fuse_client").number;
    this.pBinCastNum = castLib(getVariable("dynamic.bin.cast")).number;
    this.pLastError = 0;
    this.verifyReset();
    return 1;
  }

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
      let tCastsStr = `${EMPTY}${tCasts}`;
      tCastsStr = replaceChunks(tCastsStr, QUOTE, EMPTY);
      tCastsStr = replaceChunks(tCastsStr, " ", EMPTY);
      tCastsStr = replaceChunks(tCastsStr, "[", EMPTY);
      tCastsStr = replaceChunks(tCastsStr, "]", EMPTY);
      tCastsStr = replaceChunks(tCastsStr, RETURN, EMPTY);
    }
    this.pTempWaitList = list();
    const tCastList = list();
    switch (tCasts.ilk) {
      case Symbol.for("propList"):
        for (let f = 1; f <= tCasts.count; f++) {
          const tPermanentLevel = tCasts.getPropAt(f);
          const tCastName = tCasts[f];
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
    if (count(tCasts) == 0) {
      return 0;
    }
    const tID = getUniqueID();
    this.pLatestTaskID = tID;
    if (tAdd == 0) {
      this.removeTemporaryCast(tCastList);
    }
    let tStatus;
    let tPercent;
    if (this.pTempWaitList.count > 0) {
      this.pWaitList[tID] = this.pTempWaitList.duplicate();
    }
    if (this.pWaitList.count == 0) {
      tStatus = Symbol.for("ready");
      tPercent = 1.0;
    } else {
      tStatus = Symbol.for("LOADING");
      tPercent = 0;
    }
    this.pTaskList[tID] = createObject(Symbol.for("temp"), getClassVariable("castload.task.class"));
    const tProps = propList();
    tProps[Symbol.for("id")] = tID;
    tProps[Symbol.for("status")] = tStatus;
    tProps[Symbol.for("Percent")] = tPercent;
    tProps[Symbol.for("sofar")] = 0;
    tProps[Symbol.for("casts")] = this.pTempWaitList.duplicate();
    tProps[Symbol.for("callback")] = VOID;
    tProps[Symbol.for("doindexing")] = tDoIndexing;
    this.pTaskList[tID].define(tProps);
    this.pLastError = 0;
    for (let i = 1; i <= getIntVariable("net.operation.count", 2); i++) {
      this.AddNextpreloadNetThing();
    }
    return tID;
  }

  registerCallback(tID, tMethod, tClientID, tArgument) {
    if (voidp(this.pTaskList.findPos(tID))) {
      return 0;
    } else {
      return call(Symbol.for("addCallBack"), this.pTaskList[tID], tID, tMethod, tClientID, tArgument);
    }
  }

  resetCastLibs(tClean, tForced) {
    if (tClean != 1) {
      tClean = 0;
    }
    const tTempList = list();
    let f;
    if ((the.runMode == "Author") && (tForced != 1)) {
      f = 1;
      while (1) {
        if (variableExists(`cast.dev.${f}`)) {
          tTempList.add(getVariable(`cast.dev.${f}`));
        } else {
          break;
        }
        f = f + 1;
      }
    }
    this.pCastLibCount = the.numberOfCastLibs;
    let tEmptyCastNum = 1;
    for (let tCastNum = 2; tCastNum <= this.pCastLibCount; tCastNum++) {
      if ((tCastNum != this.pSysCastNum) && (tCastNum != this.pBinCastNum)) {
        const tCastName = castLib(tCastNum).name;
        if (tTempList.findPos(tCastName) == 0) {
          if (tClean) {
            getThreadManager().closeThread(tCastNum);
          }
          if (tClean) {
            getResourceManager().unregisterMembers(tCastNum);
          }
          castLib(tCastNum).name = `${this.pNullCastName} ${tEmptyCastNum}`;
          castLib(tCastNum).fileName = `${getMoviePath()}${this.pNullCastName}${this.pFileExtension}`;
          tEmptyCastNum = tEmptyCastNum + 1;
          continue;
        }
        this.pLoadedCasts[tCastName] = string(tCastNum);
      }
    }
    return this.InitPreloader();
  }

  getLoadPercent(tID) {
    if (voidp(tID)) {
      tID = this.pLatestTaskID;
    }
    if (!voidp(this.pTaskList[tID])) {
      if (this.pTaskList[tID].getTaskState() == Symbol.for("ready")) {
        return 1.0;
      } else {
        return this.pTaskList[tID].getTaskPercent();
      }
    } else {
      return 1.0;
    }
  }

  FindCastNumber(tCast) {
    for (let j = 1; j <= the.numberOfCastLibs; j++) {
      const tFileName = castLib(j).fileName;
      const tFileExtension = tFileName.char[`${length(tFileName) - 2}..${length(tFileName)}`];
      if ((castLib(j).name != "Internal") && (tFileExtension != "dcr") && (tFileExtension != "dir")) {
        if (castLib(j).name == tCast) {
          return castLib(tCast).number;
        }
        break;
      }
    }
    return 0;
  }

  exists(tCastName) {
    if (tCastName == "internal") {
      return 1;
    }
    if (voidp(this.pLoadedCasts[tCastName])) {
      return 0;
    } else {
      return 1;
    }
  }

  print() {
    for (let i = 1; i <= the.numberOfCastLibs; i++) {
      put(castLib(i).name);
    }
    for (const tObj of this.pCurrentDownLoads) {
      put(`${tObj[Symbol.for("pFile")]} ${tObj[Symbol.for("pPercent")]}`);
    }
  }

  GetLastError() {
    return this.pLastError;
  }

  prepare() {
    if (count(this.pTaskList) > 0) {
      this.AddNextpreloadNetThing();
      call(Symbol.for("resetPercentCounter"), this.pTaskList);
      call(Symbol.for("update"), this.pCurrentDownLoads);
    }
  }

  InitPreloader() {
    this.pWaitList = propList();
    this.pTaskList = propList();
    this.pAvailableDynCasts = propList();
    this.pPermanentLevelList = propList();
    this.pCurrentDownLoads = propList();
    this.pLatestTaskID = EMPTY;
    for (let f = 1; f <= the.numberOfCastLibs; f++) {
      const tCastNumber = this.FindCastNumber(`${this.pNullCastName} ${f}`);
      if (tCastNumber > 0) {
        this.pAvailableDynCasts.addProp(`${this.pNullCastName} ${f}`, tCastNumber);
      }
    }
    return 1;
  }

  AddNextpreloadNetThing() {
    if (this.pCurrentDownLoads.count < getIntVariable("net.operation.count", 2)) {
      if (this.pWaitList.count > 0) {
        if (count(this.pWaitList[1]) > 0) {
          let tFile = this.pWaitList[1][1];
          const tParsedFile = tFile;
          const tFileExtension = this.pFileExtension;
          let tURL = EMPTY;
          const tParamOffset = offset("?", tFile);
          let tParamString = EMPTY;
          if (tParamOffset > 0) {
            tParamString = tFile.char[`${tParamOffset}..${tFile.length}`];
            tFile = tFile.char[`1..${tParamOffset - 1}`];
          }
          const tPossibleExtension = chars(tFile, tFile.length - 3, tFile.length);
          if ((tPossibleExtension == ".cst") || (tPossibleExtension == ".cct")) {
            tFileExtension = tPossibleExtension;
            tParsedFile = chars(tFile, 1, tFile.length - tPossibleExtension.length);
          }
          if (!tParsedFile.contains("http://")) {
            tURL = `${getMoviePath()}${tParsedFile}${tFileExtension}${tParamString}`;
          } else {
            tURL = `${tParsedFile}${tFileExtension}${tParamString}`;
          }
          const tID = this.pWaitList.getPropAt(1);
          this.pWaitList[1].deleteAt(1);
          if (count(this.pWaitList[1]) == 0) {
            this.pWaitList.deleteProp(this.pWaitList.getPropAt(1));
          }
          this.pCurrentDownLoads[tFile] = createObject(Symbol.for("temp"), getClassVariable("castload.instance.class"));
          this.pCurrentDownLoads[tFile].define(tFile, tURL, tID);
          this.pTaskList[tID].changeLoadingCount(1);
          receivePrepare(this.getID());
          return 1;
        }
      }
    }
    return 0;
  }

  DoneCurrentDownLoad(tFile, tURL, tID, tstate) {
    if (voidp(this.pCurrentDownLoads[tFile])) {
      return error(this, `CastLoad task was lost! ${tFile} ${tID}`, Symbol.for("DoneCurrentDownLoad"), Symbol.for("major"));
    }
    const tTask = this.pTaskList[tID];
    if (tTask == VOID) {
      return error(this, `Task list item was lost! ${tFile} ${tID}`, Symbol.for("DoneCurrentDownLoad"), Symbol.for("major"));
    }
    if (tstate != Symbol.for("done")) {
      this.pLastError = netError(this.pCurrentDownLoads[tFile].pNetId);
    }
    if (tstate != Symbol.for("error")) {
      const tCastNumber = this.getAvailableEmptyCast();
      if (tCastNumber > 0) {
        const tCastName = tFile;
        const tPreIndexing = tTask.getIndexingAllowed();
        this.setImportedCast(tCastNumber, tCastName, tURL, tPreIndexing);
      }
    }
    tTask.OneCastDone(tFile);
    tTask.changeLoadingCount(-1);
    this.pCurrentDownLoads[tFile].deconstruct();
    this.delay(50, Symbol.for("removeCastLoadInstance"), tFile);
    this.removeCastLoadTask(tID, tstate);
    return 1;
  }

  removeCastLoadInstance(tFile) {
    if (tFile.ilk != Symbol.for("string")) {
      return 0;
    }
    if (voidp(this.pCurrentDownLoads[tFile])) {
      return error(this, `CastLoad instance was lost! ${tFile}`, Symbol.for("removeCastLoadInstance"), Symbol.for("minor"));
    } else {
      return this.pCurrentDownLoads.deleteProp(tFile);
    }
  }

  removeCastLoadTask(tID, tstate) {
    const tTask = this.pTaskList[tID];
    if (tstate == Symbol.for("failed")) {
      tTask.setFailed();
    }
    if (tTask.getTaskState() == Symbol.for("ready")) {
      if (tTask.getFailed()) {
        tstate = Symbol.for("failed");
      }
      tTask.DoCallBack(tstate);
      tTask.deconstruct();
      this.pTaskList.deleteProp(tID);
      if (count(this.pTaskList) == 0) {
        removePrepare(this.getID());
      }
    }
  }

  TellStreamState(tFileName, tstate, tPercent, tID) {
    const tObject = this.pTaskList[tID];
    if (tObject != VOID) {
      call(Symbol.for("UpdateTaskPercent"), tObject, tPercent, tFileName);
    } else {
      return error(this, `Task list instance was lost! ${tFileName} ${tID}`, Symbol.for("TellStreamState"), Symbol.for("major"));
    }
  }

  setImportedCast(tCastNum, tCastName, tFileName, tDoIndexing) {
    const tCastLib = castLib(tCastNum);
    if (voidp(tDoIndexing)) {
      tDoIndexing = 1;
    }
    if (tCastLib.name.contains(this.pNullCastName)) {
      tCastLib.fileName = tFileName;
      tCastLib.name = tCastName;
      this.pPermanentLevelList[tCastName][2] = tCastNum;
      if (tDoIndexing) {
        getResourceManager().preIndexMembers(tCastNum);
      }
      this.pLoadedCasts[tCastName] = string(tCastNum);
    }
    this.verifyReset();
  }

  getAvailableEmptyCast() {
    if (this.pAvailableDynCasts.count > 0) {
      const tCastNum = this.pAvailableDynCasts.getLast();
      this.pAvailableDynCasts.deleteAt(this.pAvailableDynCasts.count);
      return tCastNum;
    } else {
      SystemAlert(this, "Out of free cast entries! CastLoad failed.");
      return 0;
    }
  }

  removeTemporaryCast(tNewLoadListOfcasts) {
    const tTempList = this.pPermanentLevelList.duplicate();
    for (let f = 1; f <= tTempList.count; f++) {
      const tPermanent = tTempList[f][1];
      const tCstNumber = tTempList[f][2];
      if ((tPermanent == 0) && (tCstNumber > 0)) {
        const tCastName = tTempList.getPropAt(f);
        if (!tNewLoadListOfcasts.getOne(tCastName)) {
          this.pPermanentLevelList.deleteProp(tCastName);
          this.ResetOneDynamicCast(tCstNumber);
          if (this.pCastLibCount != the.numberOfCastLibs) {
            this.pCastLibCount = the.numberOfCastLibs;
            let tError = `CastLib count was changed!!!${RETURN}`;
            tError = `${tError}CastLib with problems: ${castLib(this.pCastLibCount).name}`;
            error(this, tError, Symbol.for("removeTemporaryCast"), Symbol.for("minor"));
          }
        }
      }
    }
  }

  addOneCastToWaitList(tCastName, tPermanentOrNot) {
    if (!this.FindCastNumber(tCastName) && !this.pWaitList.getOne(tCastName)) {
      this.pTempWaitList.add(tCastName);
      const tOffset = offset("?", tCastName);
      let tCastNameNoParams;
      if (tOffset != 0) {
        tCastNameNoParams = tCastName.char[`1..${tOffset - 1}`];
      } else {
        tCastNameNoParams = tCastName;
      }
      this.pPermanentLevelList.addProp(tCastNameNoParams, list(tPermanentOrNot, 0));
    } else {
      if (voidp(this.pLoadedCasts[tCastName])) {
        this.pLoadedCasts[tCastName] = string(this.FindCastNumber(tCastName));
      }
    }
  }

  ResetOneDynamicCast(tCastNum) {
    if (this.pLoadedCasts.getOne(string(tCastNum)) != 0) {
      this.pLoadedCasts.deleteProp(this.pLoadedCasts.getOne(string(tCastNum)));
    } else {
      error(this, `Couldn't remove cast: ${tCastNum}`, Symbol.for("ResetOneDynamicCast"), Symbol.for("minor"));
    }
    getThreadManager().closeThread(tCastNum);
    getResourceManager().unregisterMembers(tCastNum);
    castLib(tCastNum).name = `${this.pNullCastName} ${tCastNum - 2}`;
    castLib(`${this.pNullCastName} ${tCastNum - 2}`).fileName = `${getMoviePath()}${this.pNullCastName}${this.pFileExtension}`;
    this.pAvailableDynCasts.addProp(`${this.pNullCastName}${tCastNum - 2}`, tCastNum);
    return 1;
  }

  verifyReset() {
    for (let tEmptyCastNum = 1; tEmptyCastNum <= the.numberOfCastLibs; tEmptyCastNum++) {
      if (castLib(tEmptyCastNum).fileName.contains(this.pNullCastName)) {
        if (the.numberOfCastMembersOfCastLib(tEmptyCastNum) > 0) {
          fatalError(propList("error", "empty_cast_failure"));
          return 0;
        }
      }
    }
  }

  solveNetErrorMsg(tErrorCode) {
    switch (tErrorCode) {
      case EMPTY:
        return "Unknown error.";
      case "OK":
        return "OK";
      case (-128):
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
        return `Other network error: ${tErrorCode}`;
    }
  }
}
