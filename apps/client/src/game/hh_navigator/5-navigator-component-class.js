export default class {
  pState;
  pCategoryIndex;
  pNodeCache;
  pNodeCacheExpList;
  pNaviHistory;
  pHideFullRoomsFlag;
  pRootUnitCatId;
  pRootFlatCatId;
  pDefaultUnitCatId;
  pDefaultFlatCatId;
  pUpdateInterval;
  pConnectionId;
  pInfoBroker;
  pRoomCatagoriesReady;
  pRecomUpdateInterval;
  pRecomRefreshBlockInterval;
  pRecomNodeInfo;
  pRecomNodeSaveTime;

  construct() {
    this.pRootUnitCatId = string(getIntVariable("navigator.visible.public.root"));
    this.pRootFlatCatId = string(getIntVariable("navigator.visible.private.root"));
    if (variableExists("navigator.public.default")) {
      this.pDefaultUnitCatId = string(getIntVariable("navigator.public.default"));
    } else {
      this.pDefaultUnitCatId = this.pRootUnitCatId;
    }
    if (variableExists("navigator.private.default")) {
      this.pDefaultFlatCatId = string(getIntVariable("navigator.private.default"));
    } else {
      this.pDefaultFlatCatId = this.pRootFlatCatId;
    }
    this.pCategoryIndex = propList();
    this.pNodeCache = propList();
    this.pNodeCacheExpList = propList();
    this.pNaviHistory = [];
    this.pHideFullRoomsFlag = 0;
    if (variableExists("navigator.cache.duration")) {
      this.pUpdateInterval = getIntVariable("navigator.cache.duration") * 1000;
    } else {
      this.pUpdateInterval = getIntVariable("navigator.updatetime");
    }
    if (variableExists("navigator.recom.updatetime")) {
      this.pRecomUpdateInterval = getIntVariable("navigator.recom.updatetime");
    } else {
      this.pRecomUpdateInterval = 30000;
    }
    if (variableExists("navigator.recom.refresh.blocktime")) {
      this.pRecomRefreshBlockInterval = getIntVariable("navigator.recom.refresh.blocktime");
    } else {
      this.pRecomRefreshBlockInterval = 5000;
    }
    this.pConnectionId = getVariableValue("connection.info.id", Symbol.for("Info"));
    this.pInfoBroker = createObject(Symbol.for("navigator_infobroker"), "Navigator Info Broker Class");
    getObject(Symbol.for("session")).set("lastroom", "Entry");
    registerMessage(Symbol.for("userlogin"), this.getID(), Symbol.for("updateState"));
    registerMessage(Symbol.for("show_navigator"), this.getID(), Symbol.for("showNavigator"));
    registerMessage(Symbol.for("hide_navigator"), this.getID(), Symbol.for("hideNavigator"));
    registerMessage(Symbol.for("show_hide_navigator"), this.getID(), Symbol.for("showhidenavigator"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("leaveRoom"));
    registerMessage(Symbol.for("roomForward"), this.getID(), Symbol.for("prepareRoomEntry"));
    registerMessage(Symbol.for("executeRoomEntry"), this.getID(), Symbol.for("executeRoomEntry"));
    registerMessage(Symbol.for("updateAvailableFlatCategories"), this.getID(), Symbol.for("sendGetUserFlatCats"));
    this.pRoomCatagoriesReady = 0;
    return 1;
  }

  deconstruct() {
    this.pNodeCache = VOID;
    this.pCategoryIndex = VOID;
    unregisterMessage(Symbol.for("userlogin"), this.getID());
    unregisterMessage(Symbol.for("show_navigator"), this.getID());
    unregisterMessage(Symbol.for("hide_navigator"), this.getID());
    unregisterMessage(Symbol.for("show_hide_navigator"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("roomForward"), this.getID());
    unregisterMessage(Symbol.for("executeRoomEntry"), this.getID());
    unregisterMessage(Symbol.for("updateAvailableFlatCategories"), this.getID());
    return this.updateState("reset");
  }

  showNavigator() {
    if (!this.pRoomCatagoriesReady) {
      executeMessage(Symbol.for("updateAvailableFlatCategories"));
    }
    return this.getInterface().showNavigator();
  }

  hideNavigator(tHideOrRemove) {
    if (voidp(tHideOrRemove)) {
      tHideOrRemove = Symbol.for("hide");
    }
    return this.getInterface().hideNavigator(tHideOrRemove);
  }

  showhidenavigator() {
    if (!this.pRoomCatagoriesReady) {
      executeMessage(Symbol.for("updateAvailableFlatCategories"));
    }
    return this.getInterface().showhidenavigator(Symbol.for("hide"));
  }

  getState() {
    return this.pState;
  }

  getInfoBroker() {
    return this.pInfoBroker;
  }

  leaveRoom() {
    getObject(Symbol.for("session")).set("lastroom", "Entry");
    return this.showNavigator();
  }

  getNodeInfo(tNodeId, tCategoryId) {
    if (tNodeId == VOID) {
      return 0;
    }
    if ((tCategoryId == Symbol.for("recom")) || (voidp(tCategoryId) && !voidp(this.pRecomNodeInfo))) {
      if (voidp(this.pRecomNodeInfo[Symbol.for("children")])) {
        return 0;
      }
      const tNodeInfo = this.pRecomNodeInfo[Symbol.for("children")][tNodeId];
      if (!voidp(tNodeInfo)) {
        return tNodeInfo;
      } else {
        if (tCategoryId == Symbol.for("recom")) {
          return 0;
        }
      }
    }
    tNodeId = string(tNodeId);
    if (!tNodeId.contains("/")) {
      let tTestInfo = this.getNodeInfo(`${tNodeId}/${this.getCurrentNodeMask()}`, tCategoryId);
      if (tTestInfo != 0) {
        return tTestInfo;
      }
      tTestInfo = this.getNodeInfo(`${tNodeId}/0`, tCategoryId);
      if (tTestInfo != 0) {
        return tTestInfo;
      }
      tTestInfo = this.getNodeInfo(`${tNodeId}/1`, tCategoryId);
      if (tTestInfo != 0) {
        return tTestInfo;
      }
    }
    if (tCategoryId != VOID) {
      if (this.pNodeCache[tCategoryId] != VOID) {
        if (!voidp(this.pNodeCache[tCategoryId][Symbol.for("children")][tNodeId])) {
          return this.pNodeCache[tCategoryId][Symbol.for("children")][tNodeId];
        }
      }
    }
    if (this.pNodeCache[tNodeId] != VOID) {
      return this.pNodeCache[tNodeId];
    }
    for (const tList of this.pNodeCache) {
      if (tList[Symbol.for("children")] != VOID) {
        if (tList[Symbol.for("children")][tNodeId] != VOID) {
          return tList[Symbol.for("children")][tNodeId];
        }
      }
    }
    return 0;
  }

  getRecomNodeInfo() {
    return this.pRecomNodeInfo;
  }

  getTreeInfoFor(tID) {
    if (tID == VOID) {
      return 0;
    }
    if (this.pCategoryIndex[tID] == VOID) {
      return 0;
    }
    return this.pCategoryIndex[tID];
  }

  setNodeProperty(tNodeId, tProp, tValue) {
    for (const myList of this.pNodeCache) {
      if (myList[Symbol.for("children")][tNodeId] != VOID) {
        myList[Symbol.for("children")][tNodeId].setaProp(tProp, tValue);
      }
    }
    return 1;
  }

  getNodeProperty(tNodeId, tProp) {
    if (tNodeId == VOID) {
      return 0;
    }
    const tNodeInfo = this.getNodeInfo(tNodeId);
    if (tNodeInfo == 0) {
      return 0;
    }
    return tNodeInfo.getaProp(tProp);
  }

  getUpdateInterval() {
    return this.pUpdateInterval;
  }

  getRecomUpdateInterval() {
    return this.pRecomUpdateInterval;
  }

  updateInterface(tID) {
    if ((tID == Symbol.for("own")) || (tID == Symbol.for("src")) || (tID == Symbol.for("fav"))) {
      return this.feedNewRoomList(tID);
    } else {
      return this.feedNewRoomList(`${tID}/${this.getCurrentNodeMask()}`);
    }
  }

  showHideRefreshRecoms(tShow, tForced) {
    if (tShow && (!this.checkRecomCache() || tForced)) {
      this.getInterface().showHideRefreshRecomLink(1);
    } else {
      this.getInterface().showHideRefreshRecomLink(0);
      if (timeoutExists(Symbol.for("recom_refresh_timeout"))) {
        removeTimeout(Symbol.for("recom_refresh_timeout"));
      }
      if (tForced) {
        return 0;
      }
      createTimeout(Symbol.for("recom_refresh_timeout"), this.pRecomRefreshBlockInterval, Symbol.for("showHideRefreshRecoms"), this.getID(), 1, 1);
    }
    return 1;
  }

  checkRecomCache() {
    const tElapsedTime = the.milliSeconds - this.pRecomNodeSaveTime;
    if ((tElapsedTime > this.pRecomRefreshBlockInterval) || voidp(this.pRecomNodeInfo)) {
      return 0;
    }
    return 1;
  }

  updateRecomRooms() {
    if (!this.checkRecomCache()) {
      return this.sendGetRecommendedRooms();
    }
    return this.getInterface().updateRecomRoomList(this.pRecomNodeInfo);
  }

  prepareRoomEntry(tRoomInfoOrId, tRoomType) {
    let tRoomInfo;
    let tRoomID;
    if (stringp(tRoomInfoOrId)) {
      tRoomID = tRoomInfoOrId;
      if ((tRoomType == Symbol.for("private")) && (tRoomID.char[`${1}..${2}`] != "f_")) {
        tRoomID = `f_${tRoomID}`;
      }
      tRoomInfo = this.getComponent().getNodeInfo(tRoomID);
      if (tRoomInfo == 0) {
        if (tRoomType == VOID) {
          return error(this, "No roomdata found and no roomType specified!", Symbol.for("prepareRoomEntry"), Symbol.for("major"));
        }
        return this.getInfoBroker().requestRoomData(tRoomID, tRoomType, [this.getID(), Symbol.for("prepareRoomEntry")]);
      } else {
        if (tRoomInfo[Symbol.for("nodeType")] == 2) {
          return this.getInfoBroker().requestRoomData(tRoomID, Symbol.for("private"), [this.getID(), Symbol.for("prepareRoomEntry")]);
        }
      }
    } else if (listp(tRoomInfoOrId)) {
      tRoomInfo = tRoomInfoOrId;
      this.getComponent().updateSingleSubNodeInfo(tRoomInfo);
    } else {
      return error(this, `No room info or id given as parameter: ${tRoomInfoOrId}`, Symbol.for("prepareRoomEntry"), Symbol.for("major"));
    }
    if (tRoomInfo[Symbol.for("nodeType")] == 1) {
      if (tRoomInfo.findPos(Symbol.for("parentid")) > 0) {
        this.getInterface().setProperty(Symbol.for("categoryId"), tRoomInfo[Symbol.for("parentid")], Symbol.for("unit"));
      }
      return this.executeRoomEntry(tRoomInfo[Symbol.for("id")]);
    } else {
      this.getInterface().hideNavigator();
      return this.getInterface().checkFlatAccess(tRoomInfo);
    }
  }

  executeRoomEntry(tNodeId) {
    this.getInterface().hideNavigator();
    if (getObject(Symbol.for("session")).GET("lastroom") == "Entry") {
      if (threadExists(Symbol.for("entry"))) {
        getThread(Symbol.for("entry")).getComponent().leaveEntry();
      }
      getObject(Symbol.for("session")).set("lastroom", EMPTY);
      this.delay(500, Symbol.for("executeRoomEntry"), tNodeId);
      return 1;
    } else {
      const tRoomInfo = this.getNodeInfo(tNodeId);
      const tRoomDataStruct = this.convertNodeInfoToEntryStruct(tRoomInfo);
      getObject(Symbol.for("session")).set("lastroom", tRoomDataStruct);
      if (!(getObject(Symbol.for("session")).GET("lastroom").ilk == Symbol.for("propList"))) {
        error(this, "Target room data unavailable!", Symbol.for("executeRoomEntry"), Symbol.for("major"));
        return this.updateState("enterEntry");
      }
      return executeMessage(Symbol.for("enterRoom"), tRoomDataStruct);
    }
  }

  expandNode(tNodeId) {
    this.getInterface().clearRoomList();
    this.getInterface().setProperty(Symbol.for("categoryId"), tNodeId);
    this.createNaviHistory(tNodeId);
    return this.updateInterface(tNodeId);
  }

  expandHistoryItem(tClickedItem) {
    if (!listp(this.pNaviHistory)) {
      return 0;
    }
    if (tClickedItem > this.pNaviHistory.count) {
      tClickedItem = this.pNaviHistory.count;
    }
    if (tClickedItem <= 0) {
      return 0;
    }
    if (this.pNaviHistory[tClickedItem] == Symbol.for("entry")) {
      getConnection(getVariable("connection.info.id")).send("QUIT");
      return this.updateState("enterEntry");
    } else {
      return this.expandNode(this.pNaviHistory[tClickedItem]);
    }
  }

  createNaviHistory(tCategoryId) {
    this.pNaviHistory = [];
    let tText = EMPTY;
    if (tCategoryId == VOID) {
      return 0;
    }
    let tParentInfo = this.getTreeInfoFor(tCategoryId);
    if ((tCategoryId == this.pRootUnitCatId) || (tCategoryId == this.pRootFlatCatId)) {
      tParentInfo = 0;
    }
    let tParentId;
    if (listp(tParentInfo)) {
      tParentId = tParentInfo[Symbol.for("parentid")];
      tParentInfo = this.getTreeInfoFor(tParentId);
    }
    while (tParentInfo != 0) {
      if (this.pNaviHistory.getPos(tParentInfo[Symbol.for("parentid")]) > 0) {
        tParentInfo = 0;
        error(this, "Category loop detected in navigation data!", Symbol.for("createNaviHistory"), Symbol.for("minor"));
        continue;
      }
      this.pNaviHistory.addAt(1, tParentId);
      tText = `${tParentInfo[Symbol.for("name")]}${RETURN}${tText}`;
      if ((tParentId == this.pRootUnitCatId) || (tParentId == this.pRootFlatCatId)) {
        tParentInfo = 0;
        continue;
      }
      tParentId = tParentInfo[Symbol.for("parentid")];
      tParentInfo = this.getTreeInfoFor(tParentId);
    }
    if (getObject(Symbol.for("session")).GET("lastroom") != "Entry") {
      this.pNaviHistory.addAt(1, Symbol.for("entry"));
      tText = `${getText("nav_hotelview")}${RETURN}${tText}`;
    }
    delete char(-30003).of(tText);
    let tShowRecoms = 0;
    if (this.pNaviHistory.count == 0) {
      tShowRecoms = 1;
    } else if (this.pNaviHistory.count == 1) {
      if (this.pNaviHistory[1] == Symbol.for("entry")) {
        tShowRecoms = 1;
      }
    }
    this.getInterface().renderHistory(tCategoryId, tText, tShowRecoms);
    return 1;
  }

  callNodeUpdate() {
    switch (this.getInterface().getNaviView()) {
      case Symbol.for("unit"):
      case Symbol.for("flat"):
        return this.sendNavigate(this.getInterface().getProperty(Symbol.for("categoryId")));
      case Symbol.for("own"):
        return this.getComponent().sendGetOwnFlats();
      case Symbol.for("fav"):
        return this.getComponent().sendGetFavoriteFlats();
      default:
        return 0;
    }
  }

  showHideFullRooms(tNodeId) {
    this.pHideFullRoomsFlag = !this.pHideFullRoomsFlag;
    return this.updateInterface(tNodeId);
  }

  roomkioskGoingFlat(tRoomProps) {
    tRoomProps[Symbol.for("flatId")] = tRoomProps[Symbol.for("id")];
    tRoomProps[Symbol.for("id")] = `f_${tRoomProps[Symbol.for("id")]}`;
    tRoomProps[Symbol.for("nodeType")] = 2;
    if (this.pNodeCache[Symbol.for("own")] == VOID) {
      this.pNodeCache[Symbol.for("own")] = propList(Symbol.for("children"), propList());
    }
    this.pNodeCache[Symbol.for("own")][Symbol.for("children")].setaProp(tRoomProps[Symbol.for("id")], tRoomProps);
    this.getComponent().executeRoomEntry(tRoomProps[Symbol.for("id")]);
    return 1;
  }

  getFlatPassword(tFlatID) {
    const tFlatInfo = this.getNodeInfo(`f_${tFlatID}`);
    if (tFlatInfo == 0) {
      return error(this, "Flat info is VOID", Symbol.for("getFlatPassword"), Symbol.for("minor"));
    }
    if (tFlatInfo[Symbol.for("door")] != "password") {
      return 0;
    }
    if (voidp(tFlatInfo[Symbol.for("Password")])) {
      return 0;
    } else {
      return tFlatInfo[Symbol.for("Password")];
    }
  }

  flatAccessResult(tMsg) {
    switch (tMsg) {
      case "flat_letin":
      case "flatpassword_ok":
      case "incorrect flat password":
      case "Password required!":
        this.getInterface().flatPasswordIncorrect();
        this.updateState("enterEntry");
        break;
    }
  }

  delayedAlert(tAlert, tDelay) {
    if (tDelay > 0) {
      createTimeout(Symbol.for("temp"), tDelay, Symbol.for("delayedAlert"), this.getID(), tAlert, 1);
    } else {
      executeMessage(Symbol.for("alert"), propList(Symbol.for("Msg"), tAlert));
    }
  }

  checkCacheForNode(tNodeId) {
    if (tNodeId == VOID) {
      return 0;
    }
    if (this.pNodeCacheExpList[tNodeId] == VOID) {
      return 0;
    }
    if (tNodeId == Symbol.for("src")) {
      return 1;
    }
    if ((the.milliSeconds - this.pNodeCacheExpList[tNodeId]) < this.pUpdateInterval) {
      return 1;
    }
    return 0;
  }

  feedNewRoomList(tID) {
    if (tID == VOID) {
      return 0;
    }
    const tNodeInfo = this.getNodeInfo(tID);
    if (!listp(tNodeInfo) || !this.checkCacheForNode(tID)) {
      return this.callNodeUpdate();
    }
    this.getInterface().updateRoomList(tNodeInfo[Symbol.for("id")], tNodeInfo[Symbol.for("children")]);
    return 1;
  }

  purgeNodeCacheExpList() {
    for (let i = 1; i <= this.pNodeCacheExpList.count; i++) {
      if ((the.milliSeconds - this.pNodeCacheExpList[i]) > this.pUpdateInterval) {
        const tID = this.pNodeCacheExpList.getPropAt(i);
        this.pNodeCacheExpList.deleteAt(i);
        this.pNodeCache.deleteProp(tID);
      }
    }
  }

  sendNavigate(tNodeId, tDepth, tNodeMask) {
    if (!connectionExists(this.pConnectionId)) {
      return error(this, `Connection not found: ${this.pConnectionId}`, Symbol.for("sendNavigate"), Symbol.for("major"));
    }
    if (tNodeId == VOID) {
      return error(this, "Node id is VOID", Symbol.for("sendNavigate"), Symbol.for("major"));
    }
    if (tDepth == VOID) {
      tDepth = 1;
    }
    if (tNodeMask == VOID) {
      tNodeMask = this.getCurrentNodeMask();
    }
    getConnection(this.pConnectionId).send("NAVIGATE", propList(Symbol.for("integer"), tNodeMask, Symbol.for("integer"), integer(tNodeId), Symbol.for("integer"), tDepth));
    this.purgeNodeCacheExpList();
    return 1;
  }

  sendGetRecommendedRooms() {
    const tConn = getConnection(this.pConnectionId);
    tConn.send("GET_RECOMMENDED_ROOMS");
  }

  updateCategoryIndex(tCategoryIndex) {
    for (let i = 1; i <= tCategoryIndex.count; i++) {
      this.pCategoryIndex.setaProp(tCategoryIndex.getPropAt(i), tCategoryIndex[i]);
    }
    return 1;
  }

  saveNodeInfo(tNodeInfo) {
    let tNodeId = tNodeInfo[Symbol.for("id")];
    if ((tNodeId != Symbol.for("own")) && (tNodeId != Symbol.for("src")) && (tNodeId != Symbol.for("fav")) && !tNodeId.contains("tmp")) {
      tNodeId = `${tNodeId}/${tNodeInfo[Symbol.for("nodeMask")]}`;
    }
    if (listp(tNodeInfo)) {
      this.pNodeCache[tNodeId] = tNodeInfo;
      this.pNodeCacheExpList[tNodeId] = the.milliSeconds;
    }
    return this.feedNewRoomList(tNodeId);
  }

  saveRecomNodeInfo(tNodeInfo) {
    this.pRecomNodeInfo = tNodeInfo;
    this.pRecomNodeSaveTime = the.milliSeconds;
    this.showHideRefreshRecoms(0);
    this.getInterface().setRecomUpdates(0);
    this.getInterface().setRecomUpdates(1);
    this.updateRecomRooms();
  }

  updateSingleSubNodeInfo(tdata) {
    if (listp(tdata)) {
      let tStored = 0;
      const tNodeId = tdata[Symbol.for("id")];
      for (const myList of this.pNodeCache) {
        if (listp(myList[Symbol.for("children")])) {
          if (myList[Symbol.for("children")][tNodeId] != VOID) {
            for (let f = 1; f <= tdata.count(); f++) {
              myList[Symbol.for("children")][tNodeId].setaProp(tdata.getPropAt(f), tdata[f]);
            }
            tStored = 1;
          }
        }
      }
      if (!tStored) {
        const tNewNode = propList(Symbol.for("id"), `tmp_${tNodeId}`, Symbol.for("children"), propList());
        tNewNode[Symbol.for("children")].setaProp(tNodeId, tdata);
        return this.saveNodeInfo(tNewNode);
      }
    } else {
      return error(this, "Flat info parsing failed!", Symbol.for("updateSingleSubNodeInfo"), Symbol.for("major"));
    }
  }

  sendGetUserFlatCats() {
    if (connectionExists(this.pConnectionId)) {
      this.pRoomCatagoriesReady = 1;
      return getConnection(this.pConnectionId).send("GETUSERFLATCATS");
    } else {
      return error(this, `Connection not found: ${this.pConnectionId}`, Symbol.for("sendGetUserFlatCats"), Symbol.for("major"));
    }
  }

  noflatsforuser() {
    return this.getInterface().showRoomlistError(getText("nav_private_norooms"));
  }

  noflats() {
    return this.getInterface().showRoomlistError(getText("nav_prvrooms_notfound"));
  }

  sendGetOwnFlats() {
    if (connectionExists(this.pConnectionId)) {
      return getConnection(this.pConnectionId).send("SUSERF", getObject(Symbol.for("session")).GET("user_name"));
    } else {
      return 0;
    }
  }

  sendGetFavoriteFlats() {
    if (connectionExists(this.pConnectionId)) {
      return getConnection(this.pConnectionId).send("GETFVRF", propList(Symbol.for("boolean"), 0));
    } else {
      return 0;
    }
  }

  sendAddFavoriteFlat(tNodeId) {
    const tRoomType = this.getNodeProperty(tNodeId, Symbol.for("nodeType")) == 1;
    let tRoomID;
    if (tRoomType == 0) {
      tRoomID = this.getNodeProperty(tNodeId, Symbol.for("flatId"));
    } else {
      tRoomID = tNodeId;
    }
    tRoomID = integer(tRoomID);
    if (connectionExists(this.pConnectionId)) {
      if (voidp(tRoomID)) {
        return error(this, "Room ID expected!", Symbol.for("sendAddFavoriteFlat"), Symbol.for("major"));
      }
      return getConnection(this.pConnectionId).send("ADD_FAVORITE_ROOM", propList(Symbol.for("integer"), tRoomType, Symbol.for("integer"), tRoomID));
    } else {
      return 0;
    }
  }

  sendRemoveFavoriteFlat(tNodeId) {
    const tRoomType = this.getNodeProperty(tNodeId, Symbol.for("nodeType")) == 1;
    let tRoomID;
    if (tRoomType == 0) {
      tRoomID = this.getNodeProperty(tNodeId, Symbol.for("flatId"));
    } else {
      tRoomID = tNodeId;
    }
    tRoomID = integer(tRoomID);
    if (connectionExists(this.pConnectionId)) {
      if (voidp(tRoomID)) {
        return error(this, "Flat ID expected!", Symbol.for("sendRemoveFavoriteFlat"), Symbol.for("major"));
      }
      return getConnection(this.pConnectionId).send("DEL_FAVORITE_ROOM", propList(Symbol.for("integer"), tRoomType, Symbol.for("integer"), tRoomID));
    } else {
      return 0;
    }
  }

  sendGetFlatInfo(tFlatID) {
    if (tFlatID.contains("f_")) {
      tFlatID = tFlatID.char[`${3}..${tFlatID.length}`];
    }
    if (connectionExists(this.pConnectionId)) {
      if (voidp(tFlatID)) {
        return error(this, "Flat ID expected!", Symbol.for("sendGetFlatInfo"), Symbol.for("major"));
      } else {
        return getConnection(this.pConnectionId).send("GETFLATINFO", tFlatID);
      }
    } else {
      return 0;
    }
  }

  sendSearchFlats(tQuery) {
    if (connectionExists(this.pConnectionId)) {
      if (voidp(tQuery)) {
        return error(this, "Search query is void!", Symbol.for("sendSearchFlats"), Symbol.for("minor"));
      }
      tQuery = convertSpecialChars(tQuery, 1);
      return getConnection(this.pConnectionId).send("SRCHF", tQuery);
    } else {
      return 0;
    }
  }

  sendGetSpaceNodeUsers(tNodeId) {
    if (connectionExists(this.pConnectionId)) {
      return getConnection(this.pConnectionId).send("GETSPACENODEUSERS", propList(Symbol.for("integer"), integer(tNodeId)));
    }
    return 0;
  }

  sendDeleteFlat(tNodeId) {
    const tFlatID = this.getNodeProperty(tNodeId, Symbol.for("flatId"));
    if (connectionExists(this.pConnectionId)) {
      if (listp(this.pNodeCache[Symbol.for("own")])) {
        if (listp(this.pNodeCache[Symbol.for("own")][Symbol.for("children")])) {
          this.pNodeCache[Symbol.for("own")][Symbol.for("children")].deleteProp(tNodeId);
        }
      }
      if (tFlatID == VOID) {
        return 0;
      }
      return getConnection(this.pConnectionId).send("DELETEFLAT", tFlatID);
    } else {
      return 0;
    }
  }

  sendGetFlatCategory(tNodeId) {
    const tFlatID = this.getNodeProperty(tNodeId, Symbol.for("flatId"));
    if (connectionExists(this.pConnectionId)) {
      if (voidp(tFlatID)) {
        return error(this, "Flat ID expected!", Symbol.for("sendGetFlatCategory"), Symbol.for("major"));
      }
      getConnection(this.pConnectionId).send("GETFLATCAT", propList(Symbol.for("integer"), integer(tFlatID)));
    } else {
      return 0;
    }
  }

  sendSetFlatCategory(tNodeId, tCategoryId) {
    const tFlatID = this.getNodeProperty(tNodeId, Symbol.for("flatId"));
    if (connectionExists(this.pConnectionId)) {
      if (voidp(tFlatID)) {
        return error(this, "Flat ID expected!", Symbol.for("sendSetFlatCategory"), Symbol.for("major"));
      }
      getConnection(this.pConnectionId).send("SETFLATCAT", propList(Symbol.for("integer"), integer(tFlatID), Symbol.for("integer"), integer(tCategoryId)));
    } else {
      return 0;
    }
  }

  sendupdateFlatInfo(tPropList) {
    if ((tPropList.ilk != Symbol.for("propList")) || voidp(tPropList[Symbol.for("flatId")])) {
      return error(this, "Cant send updateFlatInfo", Symbol.for("sendupdateFlatInfo"), Symbol.for("major"));
    }
    let tFlatMsg = EMPTY;
    for (const tProp of [Symbol.for("flatId"), Symbol.for("name"), Symbol.for("door"), Symbol.for("showownername")]) {
      tFlatMsg = `${tFlatMsg}${tPropList[tProp]}/`;
    }
    tFlatMsg = tFlatMsg.char[`${1}..${tFlatMsg.length - 1}`];
    getConnection(this.pConnectionId).send("UPDATEFLAT", tFlatMsg);
    tFlatMsg = `${string(tPropList[Symbol.for("flatId")])}/${RETURN}`;
    tFlatMsg = `${tFlatMsg}description=${tPropList[Symbol.for("description")]}${RETURN}`;
    if ((tPropList[Symbol.for("Password")] != EMPTY) && (tPropList[Symbol.for("Password")] != VOID)) {
      tFlatMsg = `${tFlatMsg}password=${tPropList[Symbol.for("Password")]}${RETURN}`;
    }
    tFlatMsg = `${tFlatMsg}allsuperuser=${tPropList[Symbol.for("ableothersmovefurniture")]}${RETURN}`;
    tFlatMsg = `${tFlatMsg}maxvisitors=${tPropList[Symbol.for("maxVisitors")]}`;
    getConnection(this.pConnectionId).send("SETFLATINFO", tFlatMsg);
    return 1;
  }

  sendRemoveAllRights(tRoomID) {
    const tFlatID = integer(this.getNodeProperty(tRoomID, Symbol.for("flatId")));
    if (voidp(tFlatID)) {
      return 0;
    }
    getConnection(this.pConnectionId).send("REMOVEALLRIGHTS", propList(Symbol.for("integer"), tFlatID));
    return 1;
  }

  sendGetParentChain(tRoomID) {
    if (voidp(tRoomID)) {
      return 0;
    }
    getConnection(this.pConnectionId).send("GETPARENTCHAIN", propList(Symbol.for("integer"), integer(tRoomID)));
    return 1;
  }

  convertNodeInfoToEntryStruct(tProps) {
    if (ilk(tProps) != Symbol.for("propList")) {
      return error(this, "Invalid property list as parameter!", Symbol.for("convertNodeInfoToEntryStruct"), Symbol.for("major"));
    }
    if (tProps[Symbol.for("nodeType")] != 1) {
      const tStruct = tProps.duplicate();
      tStruct[Symbol.for("id")] = string(tProps[Symbol.for("flatId")]);
      tStruct[Symbol.for("type")] = Symbol.for("private");
      tStruct[Symbol.for("teleport")] = 0;
      tStruct[Symbol.for("casts")] = getVariableValue("room.cast.private");
      return tStruct;
    } else {
      const tStruct = tProps.duplicate();
      tStruct[Symbol.for("id")] = tProps[Symbol.for("unitStrId")];
      tStruct[Symbol.for("type")] = Symbol.for("public");
      tStruct[Symbol.for("owner")] = 0;
      tStruct[Symbol.for("teleport")] = 0;
      return tStruct;
    }
  }

  getCurrentNodeMask() {
    return this.pHideFullRoomsFlag;
  }

  updateState(tstate, tProps) {
    switch (tstate) {
      case "reset":
        this.pState = tstate;
        this.getInterface().setUpdates(0);
        this.getInterface().setRecomUpdates(0);
        return 0;
      case "userLogin":
        this.pState = tstate;
        this.getInterface().setProperty(Symbol.for("categoryId"), this.pDefaultUnitCatId, Symbol.for("unit"));
        this.getInterface().setProperty(Symbol.for("categoryId"), this.pDefaultFlatCatId, Symbol.for("flat"));
        this.getInterface().setProperty(Symbol.for("categoryId"), Symbol.for("src"), Symbol.for("src"));
        this.getInterface().setProperty(Symbol.for("categoryId"), Symbol.for("own"), Symbol.for("own"));
        this.getInterface().setProperty(Symbol.for("categoryId"), Symbol.for("fav"), Symbol.for("fav"));
        if (this.pDefaultUnitCatId != this.pRootUnitCatId) {
          this.sendGetParentChain(this.pDefaultUnitCatId);
        }
        this.sendNavigate(this.pDefaultUnitCatId);
        if (this.pDefaultFlatCatId != this.pRootFlatCatId) {
          this.sendGetParentChain(this.pDefaultFlatCatId);
        }
        this.sendNavigate(this.pDefaultFlatCatId);
        this.updateRecomRooms();
        {
          const tForwardingHappening = variableExists("forward.id") && variableExists("forward.type");
          if (tForwardingHappening) {
            this.delay(1000, Symbol.for("goStraightToRoom"));
          } else if (variableExists("friend.id")) {
            this.delay(1000, Symbol.for("followFriend"));
          } else {
            this.delay(1000, Symbol.for("updateState"), "openNavigator");
          }
        }
        return 1;
      case "openNavigator":
        this.pState = tstate;
        this.showNavigator();
        return 1;
      case "enterEntry":
        this.pState = tstate;
        executeMessage(Symbol.for("changeRoom"));
        executeMessage(Symbol.for("leaveRoom"));
        this.createNaviHistory(this.getInterface().getProperty(Symbol.for("categoryId")));
        return 1;
      default:
        return error(this, `Unknown state: ${tstate}`, Symbol.for("updateState"), Symbol.for("minor"));
    }
  }

  goStraightToRoom() {
    const tForwardId = getVariable("forward.id");
    const tForwardTypeNum = getVariable("forward.type");
    let tForwardType;
    if (tForwardTypeNum == "1") {
      tForwardType = Symbol.for("public");
    } else {
      tForwardType = Symbol.for("private");
    }
    executeMessage(Symbol.for("roomForward"), tForwardId, tForwardType);
    return 1;
  }

  followFriend() {
    if (!variableExists("friend.id")) {
      return 0;
    }
    const tID = value(getVariable("friend.id"));
    if (tID.ilk != Symbol.for("integer")) {
      return 0;
    }
    const tConn = getConnection(getVariable("connection.info.id"));
    tConn.send("FOLLOW_FRIEND", propList(Symbol.for("integer"), tID));
    return 1;
  }
}
