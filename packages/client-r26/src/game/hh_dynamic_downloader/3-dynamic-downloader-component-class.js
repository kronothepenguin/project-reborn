export default class {
  pDynDownloadURL;
  pFurniCastNameTemplate;
  pSoundDownloadUrl;
  pDownloadQueue;
  pPriorityDownloadQueue;
  pCurrentDownLoads;
  pDownloadedAssets;
  pBypassList;
  pFurniRevisionList;
  pRevisionsReceived;
  pRevisionsLoading;
  pAliasList;
  pAliasListReceived;
  pAliasListLoading;
  pBinCastName;

  construct() {
    if (variableExists("dynamic.download.url")) {
      this.pDynDownloadURL = getVariable("dynamic.download.url");
    } else {
      this.pDynDownloadURL = "dynamic_content/";
    }
    if (variableExists("dynamic.download.name.template")) {
      this.pFurniCastNameTemplate = getVariable("dynamic.download.name.template");
    } else {
      this.pFurniCastNameTemplate = "hh_furni_xx_%typeid%.cct";
    }
    if (variableExists("sound.download.url")) {
      this.pSoundDownloadUrl = getVariable("sound.download.url");
    } else {
      this.pSoundDownloadUrl = "sound/%typeid%.cct";
    }
    this.pDownloadQueue = propList();
    this.pPriorityDownloadQueue = propList();
    this.pCurrentDownLoads = propList();
    this.pDownloadedAssets = propList();
    this.pFurniRevisionList = propList();
    this.pRevisionsReceived = 0;
    this.pRevisionsLoading = 0;
    this.pAliasList = propList();
    this.pAliasListReceived = 0;
    this.pAliasListLoading = 0;
    this.pBinCastName = "bin";
    this.pBypassList = value(getVariable("dyn.download.bypass.list", list()));
  }

  isAssetDownloaded(tAssetId) {
    for (let tBypassItem of this.pBypassList) {
      const tBypassWildLength = tBypassItem.length;
      tBypassItem = replaceChunks(tBypassItem, "?", EMPTY);
      if (tAssetId == tBypassItem) {
        return 1;
      }
      if ((tAssetId.startsWith(tBypassItem)) && (tAssetId.length == tBypassWildLength)) {
        return 1;
      }
    }
    const tStatus = this.checkDownloadStatus(tAssetId);
    switch (tStatus) {
      case Symbol.for("downloaded"):
      case Symbol.for("failed"):
        return 1;
      default:
        return 0;
    }
  }

  downloadCastDynamically(tAssetId, tAssetType, tCallbackObjectID, tCallBackHandler, tPriorityDownload, tCallbackParams, tParentId) {
    if ((tAssetId == EMPTY) || voidp(tAssetId)) {
      error(this, `tAssetId was empty, returning with true just to prevent download sequence!`, Symbol.for("downloadCastDynamically"), Symbol.for("minor"));
      return 1;
    }
    const tStatus = this.checkDownloadStatus(tAssetId);
    switch (tStatus) {
      case Symbol.for("nodata"):
      case Symbol.for("downloading"):
      case Symbol.for("inqueue"):
        this.addToDownloadQueue(tAssetId, tCallbackObjectID, tCallBackHandler, tPriorityDownload, 0, tCallbackParams, tAssetType, tParentId);
        this.tryNextDownload();
        return 1;
      case Symbol.for("downloaded"):
      case Symbol.for("failed"):
        return 0;
    }
    return error(this, `Invalid status type found: ${tStatus}`, Symbol.for("downloadCastDynamically"), Symbol.for("major"));
  }

  handleCompletedCastDownload(tAssetId) {
    const tDownloadObj = this.pCurrentDownLoads[tAssetId];
    const tCastName = tDownloadObj.getDownloadName();
    const tCastNum = FindCastNumber(tCastName);
    if (tCastNum == 0) {
      tDownloadObj.purgeCallbacks(0);
      this.pDownloadedAssets[tAssetId] = Symbol.for("failed");
      this.pCurrentDownLoads.deleteProp(tAssetId);
      this.tryNextDownload();
      return error(this, `Cast ${tCastName} was not available`, Symbol.for("handleCompletedCastDownload"), Symbol.for("minor"));
    }
    this.acquireAssetsFromCast(tCastNum, tAssetId);
    const tResetOk = getCastLoadManager().ResetOneDynamicCast(tCastNum);
    if (!tResetOk) {
      error(this, `Cast reset failed: ${tCastNum}`, Symbol.for("handleCompletedCastDownload"), Symbol.for("major"));
    }
    this.pCurrentDownLoads.deleteProp(tAssetId);
    this.pDownloadedAssets[tAssetId] = Symbol.for("downloaded");
    tDownloadObj.purgeCallbacks(1);
    this.tryNextDownload();
  }

  checkDownloadStatus(tAssetId) {
    const tDownloadStatus = this.pDownloadedAssets.getaProp(tAssetId);
    if (tDownloadStatus != VOID) {
      return tDownloadStatus;
    } else {
      if (this.pDownloadQueue.getaProp(tAssetId) != VOID) {
        return Symbol.for("inqueue");
      } else {
        if (this.pPriorityDownloadQueue.getaProp(tAssetId) != VOID) {
          return Symbol.for("inqueue");
        } else {
          if (this.pCurrentDownLoads.getaProp(tAssetId) != VOID) {
            return Symbol.for("downloading");
          }
        }
      }
    }
    return Symbol.for("nodata");
  }

  addToDownloadQueue(tAssetId, tCallbackObjectID, tCallBackHandler, tPriorityDownload, tAllowIndexing, tCallbackParams, tAssetType, tParentId) {
    if (voidp(tAllowIndexing)) {
      tAllowIndexing = 0;
    }
    let tDownloadObj = VOID;
    if (this.pDownloadQueue.getaProp(tAssetId) != VOID) {
      tDownloadObj = this.pDownloadQueue.getaProp(tAssetId);
    } else {
      if (this.pPriorityDownloadQueue.getaProp(tAssetId) != VOID) {
        tDownloadObj = this.pPriorityDownloadQueue.getaProp(tAssetId);
      } else {
        if (this.pCurrentDownLoads.getaProp(tAssetId) != VOID) {
          tDownloadObj = this.pCurrentDownLoads.getaProp(tAssetId);
        } else {
          tDownloadObj = createObject(`dyndownload-${tAssetId}`, getClassVariable("dyn.download.instance"));
          if (!tDownloadObj) {
            error(this, `Could not create download object. Could it be a duplicate: ${tAssetId}`, Symbol.for("addToDownloadQueue"), Symbol.for("major"));
            return 0;
          }
          tDownloadObj.setAssetId(tAssetId);
          tDownloadObj.setAssetType(tAssetType);
          tDownloadObj.setIndexing(tAllowIndexing);
          tDownloadObj.setParentId(tParentId);
          if (tPriorityDownload) {
            this.pPriorityDownloadQueue.addProp(tAssetId, tDownloadObj);
          } else {
            this.pDownloadQueue.addProp(tAssetId, tDownloadObj);
          }
        }
      }
    }
    tDownloadObj.addCallbackListener(tCallbackObjectID, tCallBackHandler, tCallbackParams);
  }

  tryNextDownload() {
    if (!this.pAliasListReceived) {
      if (!this.pAliasListLoading) {
        this.pAliasList = propList();
        this.pAliasListLoading = 1;
        const tConn = getConnection(getVariableValue("connection.info.id"));
        tConn.send("GET_ALIAS_LIST");
      }
      return 0;
    }
    if (!this.pRevisionsReceived) {
      if (!this.pRevisionsLoading) {
        this.pFurniRevisionList = propList();
        this.pRevisionsLoading = 1;
        getConnection(getVariableValue("connection.room.id")).send("GET_FURNI_REVISIONS");
      }
      return 0;
    }
    const tMaxItemsInProcess = 1;
    let tDownloadObj = VOID;
    if (this.pCurrentDownLoads.count >= tMaxItemsInProcess) {
      return 0;
    }
    let tAssetId;
    if (this.pPriorityDownloadQueue.count > 0) {
      tDownloadObj = getAt(this.pPriorityDownloadQueue, 1);
      tAssetId = tDownloadObj.getAssetId();
      this.pPriorityDownloadQueue.deleteProp(tAssetId);
    } else {
      if (this.pDownloadQueue.count > 0) {
        tDownloadObj = getAt(this.pDownloadQueue, 1);
        tAssetId = tDownloadObj.getAssetId();
        this.pDownloadQueue.deleteProp(tAssetId);
      } else {
        return 0;
      }
    }
    if (this.checkDownloadStatus(tAssetId) == Symbol.for("downloaded")) {
      tDownloadObj.purgeCallbacks(1);
      return this.tryNextDownload();
    }
    this.pCurrentDownLoads.addProp(tAssetId, tDownloadObj);
    let tAliasedAssetId = tAssetId;
    if (!voidp(this.pAliasList.getaProp(tAssetId))) {
      tAliasedAssetId = this.pAliasList[tAssetId];
    }
    let tDownloadURL = `${this.pDynDownloadURL}${this.pFurniCastNameTemplate}`;
    let tParentId;
    if (tDownloadObj.getAssetType() == Symbol.for("sound")) {
      tParentId = tDownloadObj.getParentId();
      if (!voidp(tParentId)) {
        if (variableExists("dynamic.download.samples.template")) {
          tDownloadURL = `${this.pDynDownloadURL}${getVariable("dynamic.download.samples.template")}`;
        }
      }
    }
    const tFixedAssetId = replaceChunks(tAliasedAssetId, " ", "_");
    tDownloadURL = replaceChunks(tDownloadURL, "%typeid%", tFixedAssetId);
    let tRawAssetId = tAssetId;
    if (chars(tAssetId, 1, 2) == "s_") {
      tRawAssetId = chars(tAssetId, 3, tAssetId.length);
    }
    let tRevision = EMPTY;
    if (!voidp(tParentId)) {
      tRevision = string(this.pFurniRevisionList[tParentId]);
    } else {
      if (!voidp(this.pFurniRevisionList.findPos(tRawAssetId))) {
        tRevision = string(this.pFurniRevisionList[tRawAssetId]);
      } else {
        if (tAssetId.contains("poster")) {
          tRevision = string(this.pFurniRevisionList["poster"]);
        } else {
          tRevision = EMPTY;
        }
      }
    }
    tDownloadURL = replaceChunks(tDownloadURL, "%revision%", tRevision);
    tDownloadObj.setDownloadName(tDownloadURL);
    const tAllowIndexing = tDownloadObj.getIndexing();
    if (variableExists("dynamic.download.delay")) {
      const tTimeout = getVariable("dynamic.download.delay");
      createTimeout(`dynamicdelay${the.milliSeconds}`, tTimeout, Symbol.for("executeDownloadRequest"), this.getID(), [tAssetId, tDownloadURL, tAllowIndexing], 1);
    } else {
      this.executeDownloadRequest([tAssetId, tDownloadURL, tAllowIndexing]);
    }
  }

  executeDownloadRequest(tParams) {
    const tAssetId = tParams[1];
    const tDownloadURL = tParams[2];
    const tAllowIndexing = tParams[3];
    const tDownloadRefId = startCastLoad(tDownloadURL, 1, 1, tAllowIndexing);
    registerCastloadCallback(tDownloadRefId, Symbol.for("handleCompletedCastDownload"), this.getID(), tAssetId);
  }

  acquireAssetsFromCast(tCastNum, tAssetId) {
    if (voidp(tAssetId)) {
      tAssetId = EMPTY;
    }
    const tCast = castLib(tCastNum);
    if (ilk(tCast) != Symbol.for("castLib")) {
      error(this, "Download seems invalid, item is not a cast!", Symbol.for("acquireAssetsFromCast"), Symbol.for("minor"));
      return 0;
    }
    const tSavedPaletteRefs = propList();
    let tFirst = 1;
    let tLast = the,numberOfCastMembersOfCastLib(the,numberOf(tCast));
    let tDone = 0;
    while (!tDone) {
      tDone = 1;
      const tCurrentLast = tLast;
      for (let tMemNo = tFirst; tMemNo <= tCurrentLast; tMemNo++) {
        const tmember = member(tMemNo, tCast.number);
        const tMemType = tmember.type;
        const tMemName = tmember.name;
        switch (tMemType) {
          case Symbol.for("bitmap"): {
            if (member(tMemName, this.pBinCastName).name != tMemName) {
              if (ilk(tmember.paletteRef) != Symbol.for("symbol")) {
                const tSourceMemName = tmember.name;
                const tAliasedMemName = this.doAliasReplacing(tSourceMemName, tAssetId);
                tSavedPaletteRefs[tAliasedMemName] = tmember.paletteRef.name;
                tmember.paletteRef = Symbol.for("systemMac");
              }
              this.copyMemberToBin(tmember, tAssetId);
            }
            break;
          }
          case Symbol.for("palette"): {
            if (member(tMemName, this.pBinCastName).name != tMemName) {
              this.copyMemberToBin(tmember, VOID);
            }
            break;
          }
          case Symbol.for("field"): {
            const tSourceText = tmember.text;
            const tAliasedText = this.doAliasReplacing(tSourceText, tAssetId);
            tmember.text = tAliasedText;
            if (tMemName == "asset.index") {
              const tClassesContainer = getObject(getVariable("room.classes.container"));
              for (let i = 1; i <= tmember.lineCount; i++) {
                const tLine = tmember.line[i];
                if (stringp(tLine)) {
                  if (tLine.length > 3) {
                    const tLineData = value(tLine);
                    tAssetId = tLineData[Symbol.for("id")];
                    this.pDownloadedAssets[tAssetId] = Symbol.for("downloaded");
                    if (offset("s_", tAssetId) == 1) {
                      tAssetId = tAssetId.char[`${3}..${tAssetId.length}`];
                    }
                    const tAssetClasses = tLineData[Symbol.for("classes")];
                    tClassesContainer.set(tAssetId, tAssetClasses);
                  }
                }
              }
            } else {
              if (tMemName == "memberalias.index") {
                if (tMemNo == tLast) {
                  getResourceManager().readAliasIndexesFromField(tMemName, tCastNum);
                } else {
                  tDone = 0;
                  tFirst = tMemNo;
                  tLast = tMemNo;
                }
              } else {
                if ((tMemName.contains(".props")) || (tMemName.contains(".data"))) {
                  this.copyMemberToBin(tmember, tAssetId);
                }
              }
            }
            break;
          }
          case Symbol.for("script"): {
            this.copyMemberToBin(tmember);
            break;
          }
          case Symbol.for("sound"): {
            this.copyMemberToBin(tmember);
            break;
          }
        }
      }
    }
    for (let i = 1; i <= tSavedPaletteRefs.count; i++) {
      const tMemberName = tSavedPaletteRefs.getPropAt(i);
      const tPaletteName = tSavedPaletteRefs[tMemberName];
      member(getmemnum(tMemberName)).paletteRef = member(getmemnum(tPaletteName));
    }
  }

  copyMemberToBin(tSourceMember, tTargetAssetClass) {
    if (voidp(tTargetAssetClass)) {
      tTargetAssetClass = EMPTY;
    }
    let tAllowCopy = 1;
    if (tSourceMember.type == Symbol.for("empty")) {
      tAllowCopy = 0;
    } else {
      if (tSourceMember.type == Symbol.for("script")) {
        if (tSourceMember.scriptType == Symbol.for("movie")) {
          tAllowCopy = 0;
        }
      }
    }
    if (tAllowCopy) {
      if (getmemnum(tSourceMember.name) == 0) {
        const tSourceMemName = tSourceMember.name;
        const tTargetMemName = this.doAliasReplacing(tSourceMemName, tTargetAssetClass);
        let tTargetMemberNum = getmemnum(tTargetMemName);
        if (tTargetMemberNum == 0) {
          tTargetMemberNum = createMember(tTargetMemName, tSourceMember.type, 0);
          if (tTargetMemberNum == 0) {
            return error(this, `Could not create a new member for copying: ${tTargetMemName}`, Symbol.for("copyMemberToBin"), Symbol.for("major"));
          }
        }
        const tTargetMember = member(tTargetMemberNum);
        tTargetMember.media = tSourceMember.media;
        if (tSourceMember.type == Symbol.for("bitmap")) {
          if (tSourceMember.image.width == 0) {
            tTargetMember.image = tSourceMember.image;
          }
        }
      }
    }
  }

  doAliasReplacing(tSourceString, tTargetAssetClass) {
    let tAliasedSTring = tSourceString;
    if (chars(tTargetAssetClass, 1, 2) == "s_") {
      tTargetAssetClass = chars(tTargetAssetClass, 3, tTargetAssetClass.length);
    }
    if (!voidp(this.pAliasList[tTargetAssetClass])) {
      const tSourceAssetClass = this.pAliasList.getaProp(tTargetAssetClass);
      if (!voidp(tSourceAssetClass)) {
        tAliasedSTring = replaceChunks(tAliasedSTring, tSourceAssetClass, tTargetAssetClass);
      }
    }
    return tAliasedSTring;
  }

  setAssetAlias(tOriginalClass, tAliasClass) {
    if (voidp(tOriginalClass) && voidp(tAliasClass)) {
      this.pAliasListLoading = 0;
      this.pAliasListReceived = 1;
      return 1;
    }
    this.pAliasList[tOriginalClass] = tAliasClass;
    this.pAliasList[`s_${tOriginalClass}`] = `s_${tAliasClass}`;
  }

  setFurniRevision(tClass, tRevision, tIsFurni) {
    if (voidp(tClass)) {
      this.pRevisionsReceived = 1;
      this.pRevisionsLoading = 0;
      this.tryNextDownload();
      return 1;
    }
    const tOffset = offset("*", tClass);
    if (tOffset) {
      tClass = tClass.char[`${1}..${tOffset - 1}`];
    }
    if (!voidp(this.pFurniRevisionList[tClass])) {
      this.pFurniRevisionList[tClass] = max(this.pFurniRevisionList[tClass], tRevision);
    } else {
      this.pFurniRevisionList[tClass] = tRevision;
    }
    return 1;
  }
}
