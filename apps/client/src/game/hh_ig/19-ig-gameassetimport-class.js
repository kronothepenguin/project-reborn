export default class {
  pState;
  pAssetsLoaded;
  pAssetData;
  pCurrentLoadedCasts;
  pUpdateCounter;
  pCastLoadIdList;

  construct() {
    pCurrentLoadedCasts = list();
    pCastLoadIdList = list();
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("leaveRoom"));
    pAssetsLoaded = 0;
    pState = 0;
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    if (pAssetsLoaded) {
      this.unloadAssets();
    }
    pState = 0;
    return this.ancestor.deconstruct();
  }

  leaveRoom() {
    if (pAssetsLoaded) {
      this.unloadAssets();
    }
    return 1;
  }

  update() {
    if (pState == 0) {
      return removeUpdate(this.getID());
    }
    pUpdateCounter = pUpdateCounter + 1;
    if (pUpdateCounter < 5) {
      return 1;
    }
    pUpdateCounter = 0;
    this.roomCastsProgress();
    return 1;
  }

  startCastDownload(tdata) {
    put(`${this.getID()} startCastDownload`);
    if (!listp(tdata)) {
      return 0;
    }
    const tGameType = tdata.getaProp(Symbol.for("game_type"));
    const tGameTypeService = this.getIGComponent("GameTypes");
    if (tGameTypeService == 0) {
      return 0;
    }
    const tCastList = tGameTypeService.getAction(tGameType, Symbol.for("get_casts"));
    if (tCastList == 0) {
      return 0;
    }
    const tRoomCastVarPrefix = "room.cast.";
    const tRoomCastList = getObject(Symbol.for("room_component")).addToCastDownloadList(tRoomCastVarPrefix);
    if (tRoomCastList.count > 0) {
      pAssetsLoaded = 1;
      const tCastLoadId = startCastLoad(tRoomCastList, 1);
      pCastLoadIdList.append(tCastLoadId);
      pState = Symbol.for("LOADING");
      receiveUpdate(this.getID());
    }
    if (!listp(tCastList)) {
      tCastList = list(tCastList);
    }
    if (tCastList.count > 0) {
      pAssetsLoaded = 1;
      const tCastLoadId = startCastLoad(tCastList, 0);
      pCastLoadIdList.append(tCastLoadId);
      registerCastloadCallback(tCastLoadId, Symbol.for("roomCastsLoaded"), this.getID());
      pState = Symbol.for("LOADING");
      receiveUpdate(this.getID());
    }
    return 1;
  }

  roomCastsProgress(tParam1, tParam2) {
    const tLoadingStatus = this.getLoadingStatus();
    if (tLoadingStatus == 1.0) {
      return this.roomCastsLoaded();
    }
    const tHandler = this.getHandler();
    if (tHandler == 0) {
      return 0;
    }
    return tHandler.send_LOAD_STAGE_READY(tLoadingStatus);
  }

  roomCastsLoaded(tParam1, tParam2) {
    if (this.getLoadingStatus() < 1) {
      return 1;
    }
    pState = 0;
    removeUpdate(this.getID());
    const tHandler = this.getHandler();
    if (tHandler == 0) {
      return 0;
    }
    return tHandler.send_LOAD_STAGE_READY(1);
  }

  queueAssetList(tAssetData) {
    return 1;
  }

  cancelLoading() {
    if (!pAssetsLoaded) {
      return 1;
    }
    put("* TODO: IG GameAssetImport Class.cancelLoading");
    return 1;
  }

  getLoadingStatus() {
    if (!pAssetsLoaded) {
      return 0;
    }
    if (pCastLoadIdList.count == 0) {
      return 1;
    }
    let tAverage = 0;
    for (const tCastLoadId of pCastLoadIdList) {
      tAverage = getCastLoadPercent(tCastLoadId) + tAverage;
    }
    tAverage = tAverage / pCastLoadIdList.count;
    return tAverage;
  }

  unloadAssets() {
    return 1;
    if (!pAssetsLoaded) {
      return 1;
    }
    pAssetsLoaded = 0;
    const tFinishedList = list();
    while (pCurrentLoadedCasts.count > 0) {
      const tCastName = pCurrentLoadedCasts[1];
      if (tFinishedList.getPos(tCastName) > 0) {
        return error(this, `Unable to unload castlib ${tCastName}`, Symbol.for("unloadAssets"));
      }
      this.unloadOneCast(tCastName);
      tFinishedList.append(tCastName);
    }
    return 1;
  }

  unloadOneCast(tCastName) {
    put(`* unloadOneCast ${tCastName}`);
    const tManager = getCastLoadManager();
    if (tManager == 0) {
      return 0;
    }
    if (!castExists(tCastName)) {
      return error(this, `Cast does not exist: ${tCastName}`, Symbol.for("unloadOneCast"));
    }
    const tCastLib = castLib(tCastName);
    const tCastNum = tCastLib.number;
    if (tCastLib.number == 0) {
      return 1;
    }
    const tResetOk = tManager.ResetOneDynamicCast(tCastNum);
    if (!tResetOk) {
      error(this, `Cast reset failed: ${tCastNum}`, Symbol.for("unloadOneCast"), Symbol.for("major"));
    }
    pCurrentLoadedCasts.deleteOne(tCastName);
    if (pCurrentLoadedCasts.count == 0) {
      pAssetsLoaded = 0;
    }
    return 1;
  }

  createLoadingBar() {
    return 1;
  }

  updateLoadingBarOwnDownload() {
    const tStatus = this.getLoadingStatus();
    put(`* updateLoadingBarOwnLownload status: ${tStatus}`);
    return 1;
  }

  updateLoadingBarOtherItems() {
    return 1;
  }

  removeLoadingBar() {
    return 1;
  }

  sendLoadingStatus() {
    return 1;
  }
}
