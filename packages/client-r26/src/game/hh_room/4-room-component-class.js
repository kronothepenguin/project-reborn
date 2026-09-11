export default class {
  pInfoConnID;
  pRoomConnID;
  pRoomId;
  pActiveFlag;
  pProcessList;
  pChatProps;
  pDefaultChatMode;
  pSaveData;
  pCacheKey;
  pCacheFlag;
  pUserObjList;
  pActiveObjList;
  pPassiveObjList;
  pItemObjList;
  pBalloonId;
  pClassContId;
  pRoomPrgID;
  pRoomPollerID;
  pTrgDoorID;
  pAdSystemID;
  pFurniChooserID;
  pInterstitialSystemID;
  pSpectatorSystemID;
  pHeightMapData;
  pCurrentSlidingObjects;
  pPickedCryName;
  pCastLoaded;
  pEnterRoomAlert;
  pShadowManagerID;
  pPrvRoomsReady;
  pGroupInfoID;
  pOneWayDoorManagerID;
  pFlatRatings;
  pEnterDoorData;
  pEnterDoorLocked;
  pRoomEventBrowserID;
  pRoomEventTypeCount;
  pRoomEventList;
  pRoomEventCurrent;
  pIconBarManagerID;

  construct() {
    this.pInfoConnID = getVariable("connection.info.id");
    this.pRoomConnID = getVariable("connection.room.id");
    this.pRoomId = EMPTY;
    this.pActiveFlag = 0;
    this.pProcessList = propList();
    this.pSaveData = VOID;
    this.pCacheKey = EMPTY;
    this.pCacheFlag = getVariableValue("room.map.cache", 0);
    this.pTrgDoorID = VOID;
    this.pPickedCryName = EMPTY;
    this.pUserObjList = propList();
    this.pActiveObjList = propList();
    this.pPassiveObjList = propList();
    this.pItemObjList = propList();
    this.pFlatRatings = propList("rate", -1, "Percent", 0);
    this.pBalloonId = "Chat Manager";
    this.pClassContId = "Room Classes";
    this.pRoomPrgID = "Room Program";
    this.pRoomPollerID = "Room Poller";
    this.pAdSystemID = "Room ad";
    this.pInterstitialSystemID = "Interstitial system";
    this.pSpectatorSystemID = "Room Mode Manager";
    this.pFurniChooserID = "Furniture Chooser";
    this.pShadowManagerID = "Room Shadow Manager";
    this.pGroupInfoID = "Group_Info";
    this.pRoomEventBrowserID = "RoomEvent Browser Window";
    this.pIconBarManagerID = "Icon Bar Manager";
    this.pRoomEventList = propList();
    this.pChatProps = propList();
    this.pChatProps["returnCount"] = 0;
    this.pChatProps["timerStart"] = 0;
    this.pChatProps["timerDelay"] = 0;
    this.pChatProps["mode"] = "CHAT";
    this.pChatProps["hobbaCmds"] = getVariableValue("moderator.cmds");
    createObject(this.pClassContId, getClassVariable("variable.manager.class"));
    getObject(this.pClassContId).dump("fuse.object.classes", RETURN);
    createObject(this.pBalloonId, "Chat Manager");
    this.pCastLoaded = 0;
    this.pPrvRoomsReady = 0;
    createObject(this.pInterstitialSystemID, "Interstitial Manager");
    createObject(this.pSpectatorSystemID, "Spectator System Class");
    this.pCurrentSlidingObjects = propList();
    createObject(this.pShadowManagerID, "Shadow Manager");
    createObject(this.pGroupInfoID, "Group Info Class");
    this.pOneWayDoorManagerID = "One Way Door Manager";
    createObject(this.pOneWayDoorManagerID, "OneWayDoor Manager Class");
    registerMessage(Symbol.for("pickAndGoCFH"), this.getID(), Symbol.for("pickAndGoCFH"));
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("enterRoom"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("leaveRoom"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("leaveRoom"));
    registerMessage(Symbol.for("enterRoomDirect"), this.getID(), Symbol.for("enterRoomDirect"));
    registerMessage(Symbol.for("setEnterRoomAlert"), this.getID(), Symbol.for("setEnterRoomAlert"));
    registerMessage(Symbol.for("removeEnterRoomAlert"), this.getID(), Symbol.for("removeEnterRoomAlert"));
    registerMessage(Symbol.for("show_hide_roomevents"), this.getID(), Symbol.for("showHideRoomevents"));
    registerMessage(Symbol.for("editRoomevent"), this.getID(), Symbol.for("editRoomevent"));
    registerMessage(Symbol.for("releaseSpritesLevel1"), this.getID(), Symbol.for("releaseShadowSpritesFromUsers"));
    registerMessage(Symbol.for("releaseSpritesLevel2"), this.getID(), Symbol.for("releaseSpritesFromActiveObjects"));
    this.pEnterDoorData = VOID;
    this.pEnterDoorLocked = 0;
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    unregisterMessage(Symbol.for("enterRoom"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    unregisterMessage(Symbol.for("enterRoomDirect"), this.getID());
    unregisterMessage(Symbol.for("show_hide_roomevents"), this.getID());
    unregisterMessage(Symbol.for("editRoomevent"), this.getID());
    removeConnection(this.pRoomConnID);
    if (listp(this.pUserObjList)) {
      call(Symbol.for("deconstruct"), this.pUserObjList);
    }
    if (listp(this.pActiveObjList)) {
      call(Symbol.for("deconstruct"), this.pActiveObjList);
    }
    if (listp(this.pPassiveObjList)) {
      call(Symbol.for("deconstruct"), this.pPassiveObjList);
    }
    if (listp(this.pItemObjList)) {
      call(Symbol.for("deconstruct"), this.pItemObjList);
    }
    if (objectExists(this.pBalloonId)) {
      removeObject(this.pBalloonId);
    }
    if (objectExists(this.pClassContId)) {
      removeObject(this.pClassContId);
    }
    if (objectExists(this.pRoomPrgID)) {
      removeObject(this.pRoomPrgID);
    }
    if (objectExists(this.pAdSystemID)) {
      removeObject(this.pAdSystemID);
    }
    if (objectExists(this.pInterstitialSystemID)) {
      removeObject(this.pInterstitialSystemID);
    }
    if (objectExists(this.pSpectatorSystemID)) {
      removeObject(this.pSpectatorSystemID);
    }
    if (objectExists(this.pShadowManagerID)) {
      removeObject(this.pShadowManagerID);
    }
    if (objectExists(this.pGroupInfoID)) {
      removeObject(this.pGroupInfoID);
    }
    if (objectExists(this.pOneWayDoorManagerID)) {
      removeObject(this.pOneWayDoorManagerID);
    }
    this.pRoomId = EMPTY;
    this.pUserObjList = propList();
    this.pActiveObjList = propList();
    this.pPassiveObjList = propList();
    this.pItemObjList = propList();
    this.pCurrentSlidingObjects = propList();
    this.pEnterRoomAlert = EMPTY;
    return 1;
  }

  prepare() {
    if (this.pActiveFlag) {
      this.pEnterDoorLocked = 1;
      call(Symbol.for("update"), this.pUserObjList);
      this.updateSlideObjects(the.milliSeconds);
      call(Symbol.for("update"), this.pActiveObjList);
      call(Symbol.for("update"), this.pItemObjList);
      this.pEnterDoorLocked = 0;
      if (!voidp(this.pEnterDoorData)) {
        this.enterDoor(this.pEnterDoorData);
        this.pEnterDoorData = VOID;
      }
    }
  }

  enterRoom(tRoomDataStruct) {
    let tStamp = EMPTY;
    for (let tNo = 1; tNo <= 100; tNo++) {
      let tChar = numToChar(random(48) + 74);
      tStamp = `${tStamp}${tChar}`;
    }
    let tFuseReceipt = getSpecialServices().getReceipt(tStamp);
    let tReceipt = list();
    for (let tCharNo = 1; tCharNo <= tStamp.length; tCharNo++) {
      let tChar = chars(tStamp, tCharNo, tCharNo);
      tChar = charToNum(tChar);
      tChar = (tChar * tCharNo) + 309203;
      tReceipt[tCharNo] = tChar;
    }
    if (tReceipt != tFuseReceipt) {
      error(this, "Invalid build structure", Symbol.for("enterRoom"), Symbol.for("critical"));
      createTimeout(Symbol.for("builddisconnect"), 3000, Symbol.for("disconnect"), getThread(Symbol.for("login")).getComponent().getID(), VOID, 1);
    }
    if (!listp(tRoomDataStruct)) {
      error(this, "Invalid room data struct!", Symbol.for("enterRoom"), Symbol.for("major"));
      return executeMessage(Symbol.for("leaveRoom"));
    }
    getInterstitial().adRequested();
    this.getRoomConnection().send("GETINTERST", "general");
    let tdata = tRoomDataStruct.duplicate();
    if (voidp(tdata[Symbol.for("id")])) {
      error(this, "Missing ID in room data struct!", Symbol.for("enterRoom"), Symbol.for("major"));
      return executeMessage(Symbol.for("leaveRoom"));
    }
    if (this.pRoomId != EMPTY) {
      executeMessage(Symbol.for("changeRoom"));
    }
    let tSession = getObject(Symbol.for("session"));
    tSession.set("room_owner", 0);
    tSession.set("room_controller", 0);
    if (tdata[Symbol.for("type")] == Symbol.for("private")) {
      this.pRoomId = "private";
    } else {
      this.pRoomId = tdata[Symbol.for("id")];
    }
    this.pTrgDoorID = VOID;
    this.pSaveData = tdata;
    this.pCastLoaded = 0;
    this.loadRoomCasts();
    return 1;
  }

  enterDoor(tdata) {
    if (!listp(tdata)) {
      return error(this, "Room data struct expected!", Symbol.for("enterDoor"), Symbol.for("major"));
    }
    if (this.pEnterDoorLocked) {
      this.pEnterDoorData = tdata;
      return 1;
    }
    if (tdata[Symbol.for("id")] != this.pSaveData[Symbol.for("id")]) {
      this.leaveRoom(1);
      let tReConnect = 1;
    } else {
      getObject(Symbol.for("session")).set("target_door_ID", 0);
      let tReConnect = 0;
    }
    let tCurrentScale = this.getRoomScale(this.pSaveData[Symbol.for("marker")]);
    let tCurrentRoomCasts = this.pSaveData[Symbol.for("casts")];
    this.pRoomId = "private";
    this.pTrgDoorID = tdata[Symbol.for("id")];
    this.pSaveData = tdata.duplicate();
    this.pSaveData[Symbol.for("type")] = Symbol.for("private");
    getObject(Symbol.for("session")).set("lastroom", this.pSaveData.duplicate());
    if ((this.getRoomScale(this.pSaveData[Symbol.for("marker")]) == Symbol.for("small")) && (tCurrentScale == Symbol.for("large")) && !this.pPrvRoomsReady) {
      this.pSaveData[Symbol.for("casts")] = tCurrentRoomCasts;
      if (voidp(tCurrentRoomCasts)) {
        this.pSaveData[Symbol.for("casts")] = ["hh_room_private"];
      }
      this.loadRoomCasts();
      this.pPrvRoomsReady = 1;
      return 0;
    }
    if (tReConnect) {
      return this.roomCastLoaded();
    } else {
      return this.getRoomConnection().send("GOVIADOOR", `${this.pTrgDoorID}/${this.pSaveData[Symbol.for("teleport")]}`);
    }
  }

  leaveRoom(tJumpingToSubUnit) {
    if (this.pRoomId == EMPTY) {
      return 0;
    }
    removePrepare(this.getID());
    if (objectExists(this.pRoomPrgID)) {
      removeObject(this.pRoomPrgID);
    }
    if (!this.pCacheFlag) {
      getObject(Symbol.for("cache")).Remove(this.pCacheKey);
    }
    if (objectExists(Symbol.for("furniChooser"))) {
      getObject(Symbol.for("furniChooser")).close();
    }
    this.pActiveFlag = 0;
    if (!tJumpingToSubUnit) {
      this.pRoomId = EMPTY;
    }
    this.getShadowManager().disableRender(1);
    if (listp(this.pUserObjList)) {
      call(Symbol.for("deconstruct"), this.pUserObjList);
    }
    if (listp(this.pActiveObjList)) {
      call(Symbol.for("deconstruct"), this.pActiveObjList);
    }
    if (listp(this.pPassiveObjList)) {
      call(Symbol.for("deconstruct"), this.pPassiveObjList);
    }
    if (listp(this.pItemObjList)) {
      call(Symbol.for("deconstruct"), this.pItemObjList);
    }
    this.getShadowManager().disableRender(0);
    this.pUserObjList = propList();
    this.pActiveObjList = propList();
    this.pPassiveObjList = propList();
    this.pItemObjList = propList();
    if (objectExists(this.pBalloonId)) {
      getObject(this.pBalloonId).removeBalloons();
    }
    this.getInterface().hideAll();
    getObject(Symbol.for("session")).Remove("user_index");
    getObject(Symbol.for("session")).set("room_owner", 0);
    getObject(Symbol.for("session")).set("room_controller", 0);
    return 1;
  }

  enterRoomDirect(tdata) {
    if (tdata[Symbol.for("type")] == Symbol.for("private")) {
      this.pRoomId = "private";
    } else {
      this.pRoomId = tdata[Symbol.for("id")];
    }
    this.pTrgDoorID = VOID;
    this.pSaveData = tdata;
    getObject(Symbol.for("session")).set("lastroom", this.pSaveData);
    if (this.pSaveData[Symbol.for("type")] == Symbol.for("private")) {
      let tRoomID = integer(this.pSaveData[Symbol.for("id")]);
      let tDoorID = 0;
      let tTypeID = 0;
    } else {
      let tRoomID = integer(this.pSaveData[Symbol.for("port")]);
      let tDoorID = integer(this.pSaveData[Symbol.for("door")]);
      let tTypeID = 1;
    }
    if (tDoorID.ilk == Symbol.for("void")) {
      tDoorID = 0;
    }
    return getConnection(this.pRoomConnID).send(Symbol.for("room_directory"), propList("boolean", tTypeID, "integer", tRoomID, "integer", tDoorID));
  }

  createUserObject(tdata) {
    if (this.userObjectExists(tdata[Symbol.for("id")])) {
      this.removeUserObject(tdata[Symbol.for("id")]);
    }
    if (this.createRoomObject(tdata, this.pUserObjList, "user")) {
      return executeMessage(Symbol.for("create_user"), tdata[Symbol.for("name")], tdata[Symbol.for("id")]);
    } else {
      return 0;
    }
  }

  removeUserObject(tID) {
    if (this.removeRoomObject(tID, this.pUserObjList)) {
      return executeMessage(Symbol.for("remove_user"), tID);
    } else {
      return 0;
    }
  }

  getUserObject(tID) {
    let tObj = this.getRoomObject(tID, this.pUserObjList);
    return tObj;
  }

  getUserObjectByWebID(tWebID) {
    for (const tuser of this.pUserObjList) {
      if (tuser.getWebID() == tWebID) {
        return tuser;
      }
    }
    return 0;
  }

  getUsersRoomId(tUserName) {
    let tIndex = -1;
    for (let tPos = 1; tPos <= this.pUserObjList.count; tPos++) {
      let tuser = this.pUserObjList[tPos];
      let tClass = tuser.getClass();
      if (tClass == "user") {
        if (tuser.getName() == tUserName) {
          tIndex = this.pUserObjList.getPropAt(tPos);
          break;
        }
      }
    }
    return tIndex;
  }

  userObjectExists(tID) {
    return this.roomObjectExists(tID, this.pUserObjList);
  }

  createActiveObject(tdata) {
    if (this.activeObjectExists(tdata[Symbol.for("id")])) {
      this.removeActiveObject(tdata[Symbol.for("id")]);
    }
    return this.createRoomObject(tdata, this.pActiveObjList, "active");
  }

  removeActiveObject(tID) {
    return this.removeRoomObject(tID, this.pActiveObjList);
  }

  getActiveObject(tID) {
    return this.getRoomObject(tID, this.pActiveObjList);
  }

  activeObjectExists(tID) {
    return this.roomObjectExists(tID, this.pActiveObjList);
  }

  releaseShadowSpritesFromUsers() {
    call(Symbol.for("releaseShadowSprite"), this.pUserObjList);
  }

  releaseSpritesFromActiveObjects() {
    let tRemoveCountMax = 10;
    let tActiveObjCount = this.pActiveObjList.count - 1;
    let tRemoveCount = min(list(tRemoveCountMax, tActiveObjCount));
    for (let tNo = 1; tNo <= tRemoveCount; tNo++) {
      let tID = this.pActiveObjList[1].getID();
      this.removeActiveObject(tID);
    }
    if (!timeoutExists(Symbol.for("releaseactivetimeout"))) {
      createTimeout(Symbol.for("releaseactivetimeout"), 3000, Symbol.for("releaseActiveTimeoutCallback"), this.getID(), VOID, 1);
    }
  }

  releaseActiveTimeoutCallback() {
    executeMessage(Symbol.for("alert"), propList("Msg", "alert_too_much_furnitures", "modal", 1));
  }

  createPassiveObject(tdata) {
    if (this.passiveObjectExists(tdata[Symbol.for("id")])) {
      this.removePassiveObject(tdata[Symbol.for("id")]);
    }
    return this.createRoomObject(tdata, this.pPassiveObjList, "passive");
  }

  removePassiveObject(tID) {
    return this.removeRoomObject(tID, this.pPassiveObjList);
  }

  getPassiveObject(tID) {
    return this.getRoomObject(tID, this.pPassiveObjList);
  }

  passiveObjectExists(tID) {
    return this.roomObjectExists(tID, this.pPassiveObjList);
  }

  createItemObject(tdata) {
    if (this.itemObjectExists(tdata[Symbol.for("id")])) {
      this.removeItemObject(tdata[Symbol.for("id")]);
    }
    return this.createRoomObject(tdata, this.pItemObjList, "item");
  }

  removeItemObject(tID) {
    return this.removeRoomObject(tID, this.pItemObjList);
  }

  getItemObject(tID) {
    return this.getRoomObject(tID, this.pItemObjList);
  }

  itemObjectExists(tID) {
    return this.roomObjectExists(tID, this.pItemObjList);
  }

  setRoomRating(tRoomRating, tRoomRatingPercent) {
    this.pFlatRatings[Symbol.for("rate")] = tRoomRating;
    this.pFlatRatings[Symbol.for("Percent")] = tRoomRatingPercent;
  }

  getRoomRating() {
    return this.pFlatRatings;
  }

  setRoomEvent(tEventData) {
    this.pRoomEventCurrent = tEventData;
    executeMessage(Symbol.for("roomEventInfoUpdated"));
  }

  getRoomEvent() {
    return this.pRoomEventCurrent;
  }

  setRoomEventList(ttype, tEvents) {
    this.pRoomEventList.setaProp(ttype, propList("data", tEvents, "time", the.milliSeconds));
    executeMessage(Symbol.for("roomEventsUpdated"));
  }

  getRoomEventList(ttype) {
    if (!integerp(ttype)) {
      return 0;
    }
    let tEventList = this.pRoomEventList.getaProp(ttype);
    if (!voidp(tEventList)) {
      let tAge = the.milliSeconds - tEventList.getaProp(Symbol.for("time"));
    }
    let tCache = getIntVariable("roomevent.cache", 10000);
    if (voidp(tEventList) || (tAge > tCache)) {
      this.getRoomConnection().send("GET_ROOMEVENTS_BY_TYPE", propList("integer", integer(ttype)));
      this.pRoomEventList.setaProp(ttype, propList("data", list(), "time", the.milliSeconds));
    }
    let tEventList = this.pRoomEventList.getaProp(ttype);
    return tEventList.getaProp(Symbol.for("data"));
  }

  setRoomEventTypeCount(tCount) {
    this.pRoomEventTypeCount = tCount;
    executeMessage(Symbol.for("roomEventTypeCountUpdated"));
  }

  getRoomEventTypeCount() {
    if (voidp(this.pRoomEventTypeCount)) {
      this.getRoomConnection().send("GET_ROOMEVENT_TYPE_COUNT");
      this.pRoomEventTypeCount = 0;
    }
    return this.pRoomEventTypeCount;
  }

  getRoomPrg() {
    return getObject(this.pRoomPrgID);
  }

  getRoomID() {
    return this.pRoomId;
  }

  getRoomData() {
    if (voidp(this.pSaveData)) {
      return 0;
    } else {
      return this.pSaveData;
    }
  }

  getRoomConnection() {
    return getConnection(this.pRoomConnID);
  }

  getBalloon() {
    return getObject(this.pBalloonId);
  }

  getAd() {
    let tObject = getObject(this.pAdSystemID);
    if (tObject != 0) {
      return tObject;
    }
    createObject(this.pAdSystemID, "Ad Manager");
    return getObject(this.pAdSystemID);
  }

  getInterstitial() {
    if (objectExists(this.pInterstitialSystemID)) {
      return getObject(this.pInterstitialSystemID);
    } else {
      return error(this, "Interstitial manager not found", Symbol.for("getInterstitial"), Symbol.for("major"));
    }
  }

  getClassContainer() {
    return getObject(this.pClassContId);
  }

  isCreditFurniClass(tClass) {
    if (getObject(this.pClassContId).exists(tClass)) {
      let tClasses = value(getObject(this.pClassContId).GET(tClass));
      if (tClasses.getOne("Credit Furni Class") > 0) {
        return 1;
      }
    }
    return 0;
  }

  getOwnUser() {
    return this.getUserObject(getObject(Symbol.for("session")).GET("user_index"));
  }

  getShadowManager() {
    if (objectExists(this.pShadowManagerID)) {
      return getObject(this.pShadowManagerID);
    } else {
      return error(this, "Shadow manager not found", Symbol.for("getShadowManager"), Symbol.for("major"));
    }
  }

  getGroupInfoObject() {
    return getObject(this.pGroupInfoID);
  }

  roomExists(tRoomID) {
    if (voidp(tRoomID)) {
      return this.pActiveFlag;
    } else {
      return this.pRoomId == tRoomID;
    }
  }

  sendChat(tChat) {
    if (voidp(tChat)) {
      return 0;
    }
    if (tChat == EMPTY) {
      return 0;
    }
    tChat = convertSpecialChars(tChat, 1);
    if (tChat.char[1] == ":") {
      switch (tChat.word[1]) {
        case ":readytest":
          if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_any_room_controller")) {
            return callJavaScriptFunction("clientReady");
          }
          break;
        case ":jstest":
          if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_any_room_controller")) {
            return callJavaScriptFunction("hello", "JS Test");
          }
          break;
        case ":crashme":
          if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_any_room_controller")) {
            let tTemp = EMPTY;
            return tTemp[Symbol.for("thisIsNotListAndWillCrash")];
          }
          break;
        case ":chooser":
          if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_habbo_chooser")) {
            return createObject(Symbol.for("chooser"), "User Chooser Class");
          }
          break;
        case ":furni":
          if (this.pSaveData[Symbol.for("type")] != Symbol.for("private")) {
            return 1;
          }
          if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_furni_chooser")) {
            if (!objectExists(this.pFurniChooserID)) {
              createObject(this.pFurniChooserID, "Furni Chooser Class");
            }
            if (getObject(this.pFurniChooserID) == 0) {
              return 0;
            }
            return getObject(this.pFurniChooserID).showList();
          }
          break;
        case ":performance":
          if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_performance_panel")) {
            return performance();
          }
          break;
        case ":editcatalogue":
          if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_catalog_editor")) {
            return executeMessage("edit_catalogue");
          }
          break;
        case ":copypaste":
          if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_debug_window")) {
            the.editShortcutsEnabled = 1;
            return 1;
          }
          break;
        case ":petcontrol":
          if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_debug_window")) {
            petcontrol();
            return 1;
          }
          break;
        case ":events":
          if (variableExists("disable.roomevents")) {
            if (getIntVariable("disable.roomevents")) {
              return 1;
            }
          }
          if (objectExists(this.pRoomEventBrowserID)) {
            removeObject(this.pRoomEventBrowserID);
          } else {
            createObject(this.pRoomEventBrowserID, "RoomEvent Browser Class");
          }
          return 1;
          break;
        case ":im":
          let tName = tChat.word[2];
          let tMsg = tChat.word[`3..${tChat.word.count}`];
          executeMessage(Symbol.for("startIMChat"), tName, tMsg);
          return 1;
          break;
        case ":ig":
          executeMessage(Symbol.for("toggle_ig"));
          return 1;
          break;
      }
    }
    if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_debug_window")) {
      let tKeywords = this.getInterface().getKeywords();
      switch (tChat.word[1]) {
        case ("!!" & tKeywords[1]):
        case ("!!" & tKeywords[2]):
          let tInfoID = getVariable("connection.info.id");
          getConnection(Symbol.for("Info")).pD = 1;
          the.debugPlaybackEnabled = 1;
          switch (tChat.word[1]) {
            case tKeywords[1]:
              if (connectionExists(tInfoID)) {
                getConnection(tInfoID).setLogMode(1);
              }
              break;
            case tKeywords[2]:
              if (connectionExists(tInfoID)) {
                getConnection(tInfoID).setLogMode(0);
              }
              break;
          }
          return 1;
          break;
      }
      tKeywords = VOID;
    }
    if (the.shiftDown) {
      let tMode = "SHOUT";
    } else {
      let tMode = this.pChatProps["mode"];
    }
    let tSelected = this.getInterface().getSelectedObject();
    if (this.userObjectExists(tSelected)) {
      tSelected = this.getUserObject(tSelected).getName();
    } else {
      tSelected = EMPTY;
    }
    if (this.pChatProps["hobbaCmds"].getOne(tChat.word[`1..2`])) {
      let tMode = "CHAT";
      if (tChat.word[2] == "x") {
        if (tSelected == EMPTY) {
          let tMode = "WHISPER";
          let tMsg = getText("chat_user_not_found", "User not found.");
          let tID = getObject(Symbol.for("session")).GET("user_index");
          this.getComponent().getBalloon().enterChatMessage(tMode, tID, tMsg);
          return 1;
        }
        let tOffsetX = offset("x", tChat);
        tChat = `${tChat.char[`1..${tOffsetX - 1}`]}${tSelected}${tChat.char[`${tOffsetX + 1}..${tChat.length}`]}`;
      }
    } else {
      if (tMode == "WHISPER") {
        tChat = `${tSelected} ${tChat}`;
      }
    }
    return this.getRoomConnection().send(tMode, propList("string", tChat));
  }

  setChatMode(tMode, tUpdate) {
    switch (tMode) {
      case "whisper":
        this.pChatProps["mode"] = "WHISPER";
        break;
      case "shout":
        this.pChatProps["mode"] = "SHOUT";
        break;
      default:
        this.pChatProps["mode"] = "CHAT";
        break;
    }
    if (tUpdate) {
      this.getInterface().setSpeechDropdown(tMode);
    }
    return 1;
  }

  setUserTypingStatus(tUserID, tStatus) {
    let tUserObject = this.getUserObject(tUserID);
    if (tUserObject != 0) {
      tUserObject.setUserTypingStatus(tStatus);
    }
  }

  print() {
    put(`${RETURN}User objects:${RETURN}`);
    for (let i = 1; i <= this.pUserObjList.count; i++) {
      put(`${this.pUserObjList.getPropAt(i)}: ${this.pUserObjList[i]}`);
    }
    put(`${RETURN}Active objects:${RETURN}`);
    for (let i = 1; i <= this.pActiveObjList.count; i++) {
      put(`${this.pActiveObjList.getPropAt(i)}: ${this.pActiveObjList[i]}`);
    }
    put(`${RETURN}Passive objects:${RETURN}`);
    for (let i = 1; i <= this.pPassiveObjList.count; i++) {
      put(`${this.pPassiveObjList.getPropAt(i)}: ${this.pPassiveObjList[i]}`);
    }
  }

  addSlideObject(tID, tFromLoc, tToLoc, tTimeNow, tHasCharacter) {
    if (the.paramCount < 4) {
      return error(this, "Wrong parameter count", Symbol.for("addSlideObject"), Symbol.for("major"));
    }
    tID = tID.string;
    if (voidp(tTimeNow)) {
      tTimeNow = the.milliSeconds;
    }
    if (voidp(tHasCharacter)) {
      tHasCharacter = 0;
    }
    if (!voidp(this.pActiveObjList[tID])) {
      let tObj = this.pActiveObjList[tID];
      tObj.setSlideTo(tFromLoc, tToLoc, tTimeNow, tHasCharacter);
      this.pCurrentSlidingObjects[tID] = tObj;
    }
  }

  removeSlideObject(tID) {
    tID = tID.string;
    if (!voidp(this.pCurrentSlidingObjects[tID])) {
      this.pCurrentSlidingObjects.deleteProp(tID);
    }
  }

  roomPrePartFinished() {
    let tInterstFinished = getInterstitial().isAdFinished();
    if ((this.pCastLoaded == 0) || (tInterstFinished == 0)) {
      return 0;
    }
    if (this.pSaveData[Symbol.for("type")] == Symbol.for("private")) {
      let tRoomID = integer(this.pSaveData[Symbol.for("id")]);
      let tDoorID = 0;
      let tTypeID = 0;
    } else {
      let tRoomID = integer(this.pSaveData[Symbol.for("port")]);
      let tDoorID = integer(this.pSaveData[Symbol.for("door")]);
      let tTypeID = 1;
    }
    if (tDoorID.ilk == Symbol.for("void")) {
      tDoorID = 0;
    }
    return getConnection(this.pRoomConnID).send(Symbol.for("room_directory"), propList("boolean", tTypeID, "integer", tRoomID, "integer", tDoorID));
    return 1;
  }

  getSpectatorMode() {
    let tModeMgrObj = getObject(this.pSpectatorSystemID);
    if (tModeMgrObj == 0) {
      return error(this, "Spectator System missing!", Symbol.for("getSpectatorMode"), Symbol.for("major"));
    }
    return tModeMgrObj.getSpectatorMode();
  }

  setSpectatorMode(tstate) {
    let tModeMgrObj = getObject(this.pSpectatorSystemID);
    if (tModeMgrObj == 0) {
      return error(this, "Spectator System missing!", Symbol.for("setSpectatorMode"), Symbol.for("major"));
    }
    if (tstate) {
      getObject(Symbol.for("session")).set("user_index", -1000);
    }
    let tRoomData = this.getRoomData();
    if (tRoomData == 0) {
      let tRoomType = Symbol.for("public");
    } else {
      let tRoomType = tRoomData[Symbol.for("type")];
    }
    return tModeMgrObj.setSpectatorMode(tstate, tRoomType);
  }

  pickAndGoCFH(tSender) {
    if (!stringp(tSender)) {
      return 0;
    }
    this.pPickedCryName = tSender;
    return 1;
  }

  getPickedCryName() {
    return this.pPickedCryName;
  }

  showCfhSenderDelayed(tID) {
    this.pPickedCryName = EMPTY;
    return this.getInterface().showCfhSenderDelayed(tID);
  }

  updateCharacterFigure(tUserID, tUserFigure, tsex, tUserCustomInfo) {
    if (voidp(tUserID) || voidp(tUserFigure) || voidp(tUserCustomInfo)) {
      return 0;
    }
    tUserID = string(tUserID);
    let tSession = getObject(Symbol.for("session"));
    let tFigureParser = getObject("Figure_System");
    let tParsedFigure = tFigureParser.parseFigure(tUserFigure, tsex, "user");
    if ((tSession.GET("user_index") == tUserID) || (tUserID == "-1")) {
      tSession.set("user_figure", tParsedFigure);
      tSession.set("user_sex", tsex);
      tSession.set("user_customData", tUserCustomInfo);
    }
    if ((tSession.GET("lastroom") == "Entry") && (tUserID == "-1")) {
      executeMessage(Symbol.for("updateFigureData"));
    } else {
      if (!(tSession.GET("lastroom") == "Entry") && (integer(tUserID) > -1)) {
        if (voidp(this.pUserObjList[tUserID])) {
          return 0;
        }
        let tUserObj = this.pUserObjList[tUserID];
        let tloc = tUserObj.getLocation();
        let tdir = tUserObj.getDirection();
        let tuser = propList();
        tuser[Symbol.for("figure")] = tParsedFigure;
        tuser[Symbol.for("custom")] = tUserCustomInfo;
        tuser[Symbol.for("sex")] = tsex;
        tUserObj.changeFigureAndData(tuser);
        let tScale = Symbol.for("large");
        if (this.getInterface().getGeometry().getTileWidth() < 64) {
          tScale = Symbol.for("small");
        }
        let tChangeEffect = createObject(Symbol.for("random"), "Change Clothes Effect Class");
        let tUserSprites = tUserObj.getSprites();
        tChangeEffect.defineWithSprite(tUserSprites[1], tScale);
        executeMessage(Symbol.for("updateInfostandAvatar"), tUserObj);
      }
    }
  }

  updateSpectatorCount(tSpectatorCount, tSpectatorMax) {
    let tModeMgrObj = getObject(this.pSpectatorSystemID);
    if (tModeMgrObj == 0) {
      return error(this, "Spectator System missing!", Symbol.for("updateSpectatorCount"), Symbol.for("major"));
    }
    tModeMgrObj.updateSpectatorCount(tSpectatorCount, tSpectatorMax);
  }

  highlightUser(tUserID) {
    for (const tuser of this.pUserObjList) {
      if (tuser.getWebID() == tUserID) {
        this.getInterface().eventProcUserObj(Symbol.for("mouseUp"), tuser.getID());
        break;
      }
    }
  }

  showHideRoomevents() {
    if (objectExists(this.pRoomEventBrowserID)) {
      removeObject(this.pRoomEventBrowserID);
    } else {
      createObject(this.pRoomEventBrowserID, "RoomEvent Browser Class");
    }
    return 1;
  }

  editRoomevent() {
    if (!objectExists(this.pRoomEventBrowserID)) {
      createObject(this.pRoomEventBrowserID, "RoomEvent Browser Class");
    }
    getObject(this.pRoomEventBrowserID).editEvent(this.pRoomEventCurrent);
  }

  getIconBarManager() {
    if (!objectExists(this.pIconBarManagerID)) {
      createObject(this.pIconBarManagerID, "Room Bar Extensions Manager");
    }
    return getObject(this.pIconBarManagerID);
  }

  removeIconBarManager() {
    if (objectExists(this.pIconBarManagerID)) {
      removeObject(this.pIconBarManagerID);
    }
  }

  setRoomProperty(tKey, tValue) {
    switch (tKey) {
      case "wallpaper":
      case "floor":
        let tRoomPrg = this.getRoomPrg();
        if (tRoomPrg != 0) {
          tRoomPrg.setProperty(tKey, tValue);
        }
        break;
      case "landscape":
        this.setLandscape(tValue);
        break;
      case "landscapeanim":
        this.setLandscapeAnimation(tValue);
        break;
    }
  }

  insertWallMaskItem(tID, tClassID, tloc, tdir, tSize) {
    if (this.getRoomID() != "private") {
      return 0;
    }
    let tObj = this.getRoomPrg();
    if (objectp(tObj)) {
      call(Symbol.for("insertWallMaskItem"), [tObj], tID, tClassID, tloc, tdir, tSize);
    }
  }

  removeWallMaskItem(tID) {
    if (this.getRoomID() != "private") {
      return 0;
    }
    let tObj = this.getRoomPrg();
    if (objectp(tObj)) {
      call(Symbol.for("removeWallMaskItem"), [tObj], tID);
    }
  }

  getRoomModel() {
    return this.pSaveData[Symbol.for("marker")];
  }

  setLandscape(ttype) {
    if (this.getRoomID() != "private") {
      return 0;
    }
    let tRoomType = this.getRoomModel();
    let tObj = this.getRoomPrg();
    if (objectp(tObj)) {
      call(Symbol.for("setLandscape"), [tObj], ttype, tRoomType);
    }
  }

  setLandscapeAnimation(tID) {
    if (this.getRoomID() != "private") {
      return 0;
    }
    let tRoomType = this.getRoomModel();
    let tObj = this.getRoomPrg();
    if (objectp(tObj)) {
      call(Symbol.for("setLandscapeAnimation"), [tObj], tID, tRoomType);
    }
  }

  loadRoomCasts() {
    if (this.pRoomId == EMPTY) {
      return 0;
    }
    let tCastVarPrefix = "room.cast.";
    let tCastList = this.addToCastDownloadList(tCastVarPrefix, tCastList);
    if (this.pSaveData[Symbol.for("type")] == Symbol.for("public")) {
      this.pPrvRoomsReady = 0;
    }
    if (this.pSaveData[Symbol.for("type")] == Symbol.for("private")) {
      if (this.getRoomScale(this.pSaveData[Symbol.for("marker")]) == Symbol.for("small")) {
        let tCastVarPrefix = "room.cast.small.";
        let tCastList = this.addToCastDownloadList(tCastVarPrefix, tCastList);
        this.pPrvRoomsReady = 1;
      }
    }
    if (tCastList.count > 0) {
      let tCastLoadId = startCastLoad(tCastList, 1);
      registerCastloadCallback(tCastLoadId, Symbol.for("loadRoomCasts"), this.getID());
      this.getInterface().showLoaderBar(tCastLoadId, getText("room_hold", getText("room_loading", "Hold on...")));
      return 1;
    }
    if (voidp(this.pSaveData[Symbol.for("casts")])) {
      this.pSaveData[Symbol.for("casts")] = list();
    }
    if (this.pSaveData[Symbol.for("casts")].count < 1) {
      error(this, `Cast for room not defined: ${this.pRoomId}`, Symbol.for("loadRoomCasts"), Symbol.for("major"));
      this.getInterface().hideLoaderBar();
      executeMessage(Symbol.for("leaveRoom"));
    }
    let tCastLoadId = startCastLoad(this.pSaveData[Symbol.for("casts")], 0);
    registerCastloadCallback(tCastLoadId, Symbol.for("roomCastLoaded"), this.getID());
    this.getInterface().showLoaderBar(tCastLoadId, `${getText("room_loading", "Loading room")}${RETURN}${QUOTE}${this.pSaveData[Symbol.for("name")]}${QUOTE}`);
    return 1;
  }

  roomCastLoaded() {
    if (this.pRoomId == EMPTY) {
      this.pRoomId = "null";
      executeMessage(Symbol.for("leaveRoom"));
      return error(this, "Room building process is aborted!", Symbol.for("roomCastLoaded"), Symbol.for("major"));
    }
    if (voidp(this.pTrgDoorID)) {
      let tTxt = getText("room_preparing", "...preparing room.");
      if (this.pSaveData[Symbol.for("type")] == Symbol.for("private")) {
        if (this.pSaveData[Symbol.for("door")] == "closed") {
          if (this.pSaveData[Symbol.for("owner")] != getObject(Symbol.for("session")).GET("user_name")) {
            tTxt = getText("room_waiting", "...waiting.");
          }
        }
      }
      this.getInterface().showLoaderBar(VOID, `${QUOTE}${this.pSaveData[Symbol.for("name")]}${QUOTE}${RETURN}${tTxt}`);
      let tRoomCasts = this.pSaveData[Symbol.for("casts")];
      for (const tCast of tRoomCasts) {
        if (!castExists(tCast)) {
          error(this, `Cast required by room not found: ${tCast}`, Symbol.for("roomCastLoaded"), Symbol.for("major"));
          return executeMessage(Symbol.for("leaveRoom"));
        }
      }
    }
    this.pCastLoaded = 1;
    this.roomPrePartFinished();
  }

  roomConnected(tMarker, tstate) {
    if (this.pRoomId == EMPTY) {
      this.pRoomId = "null";
      executeMessage(Symbol.for("leaveRoom"));
      return error(this, "Room building process is aborted!", Symbol.for("roomConnected"), Symbol.for("major"));
    }
    if (!voidp(this.pTrgDoorID)) {
      if (tstate == "OPC_OK") {
        let tValue = this.getRoomConnection().send("GOVIADOOR", `${this.pTrgDoorID}/${this.pSaveData[Symbol.for("teleport")]}`);
        this.pTrgDoorID = VOID;
        return tValue;
      }
    }
    if (this.pSaveData[Symbol.for("type")] == Symbol.for("private")) {
      if (tstate == "OPC_OK") {
        let tStr = this.pSaveData[Symbol.for("id")];
        if (threadExists(Symbol.for("navigator"))) {
          let tPassword = getThread(Symbol.for("navigator")).getComponent().getFlatPassword(this.pSaveData[Symbol.for("id")]);
          if (tPassword != 0) {
            tStr = `${tStr}/${tPassword}`;
          }
        }
        return this.getRoomConnection().send("TRYFLAT", tStr);
      } else {
        if (tstate == "FLAT_LETIN") {
          return this.getRoomConnection().send("GOTOFLAT", this.pSaveData[Symbol.for("id")]);
        }
      }
    }
    if (voidp(tMarker)) {
      error(this, "Missing room marker!!!", Symbol.for("roomConnected"), Symbol.for("major"));
    }
    this.pSaveData[Symbol.for("marker")] = tMarker;
    this.leaveRoom(1);
    if (!this.getInterface().showRoom(tMarker)) {
      return executeMessage(Symbol.for("leaveRoom"));
    }
    if (connectionExists(this.pRoomConnID)) {
      getConnection(this.pRoomConnID).send("GETROOMAD");
    }
    if (memberExists(`${this.pSaveData[Symbol.for("marker")]}Class`)) {
      createObject(this.pRoomPrgID, `${this.pSaveData[Symbol.for("marker")]}Class`);
    }
    if (this.pSaveData[Symbol.for("type")] == Symbol.for("private")) {
      this.pProcessList = propList("passive", 0, "Active", 0, "users", 0, "items", 0, "heightmap", 0);
    } else if (this.pSaveData[Symbol.for("type")] == Symbol.for("public")) {
      this.pProcessList = propList("passive", 0, "Active", 0, "users", 0, "items", 1, "heightmap", 0);
    } else if (this.pSaveData[Symbol.for("type")] == Symbol.for("game")) {
      this.pProcessList = propList("passive", 1, "Active", 1, "users", 1, "items", 1, "heightmap", 0);
    }
    this.pCacheKey = `room_data_${this.pRoomId}_${this.pSaveData[Symbol.for("marker")]}`;
    if (!getObject(Symbol.for("cache")).exists(this.pCacheKey)) {
      getObject(Symbol.for("cache")).set(this.pCacheKey, propList());
    }
    let tCache = getObject(Symbol.for("cache")).GET(this.pCacheKey);
    if (voidp(tCache[Symbol.for("heightmap")]) && !this.pProcessList[Symbol.for("heightmap")]) {
      tCache[Symbol.for("heightmap")] = EMPTY;
      this.getRoomConnection().send("G_HMAP");
    } else {
      this.validateHeightMap(tCache[Symbol.for("heightmap")]);
    }
    let tShadowManager = this.getShadowManager();
    tShadowManager.define("roomShadow");
    tCache[Symbol.for("users")] = list();
    if (!this.pProcessList[Symbol.for("users")]) {
      this.getRoomConnection().send("G_USRS");
    }
    if (voidp(tCache[Symbol.for("passive")]) && !this.pProcessList[Symbol.for("passive")]) {
      tCache[Symbol.for("passive")] = list();
      this.getRoomConnection().send("G_OBJS");
    } else {
      if (voidp(tCache[Symbol.for("passive")])) {
        tCache[Symbol.for("passive")] = list();
      }
      this.validatePassiveObjects(0);
    }
    if (voidp(tCache[Symbol.for("Active")]) && !this.pProcessList[Symbol.for("Active")]) {
      tCache[Symbol.for("Active")] = list();
    } else {
      if (voidp(tCache[Symbol.for("Active")])) {
        tCache[Symbol.for("Active")] = list();
      }
      this.validateActiveObjects(0);
    }
    if (voidp(tCache[Symbol.for("items")]) && !this.pProcessList[Symbol.for("items")]) {
      tCache[Symbol.for("items")] = list();
      this.getRoomConnection().send("G_ITEMS");
    } else {
      if (voidp(tCache[Symbol.for("items")])) {
        tCache[Symbol.for("items")] = list();
      }
      this.validateItemObjects(0);
    }
    createTimeout(this.pRoomPollerID, 1000, Symbol.for("pollRoomMessages"), this.getID(), VOID, 0);
    this.executeEnterRoomAlert();
    return 1;
  }

  roomDisconnected() {
    this.pPrvRoomsReady = 0;
    this.leaveRoom();
    return executeMessage(Symbol.for("leaveRoom"));
  }

  validateHeightMap(tdata) {
    if (!getObject(Symbol.for("cache")).exists(this.pCacheKey)) {
      return error(this, "Data not expected yet!", Symbol.for("validateHeightMap"), Symbol.for("major"));
    }
    this.getInterface().getGeometry().loadHeightMap(tdata);
    this.pHeightMapData = tdata;
    if (!this.pActiveFlag) {
      getObject(Symbol.for("cache")).GET(this.pCacheKey).setaProp(Symbol.for("heightmap"), tdata);
      this.updateProcess(Symbol.for("heightmap"), 1);
    }
    return 0;
  }

  updateHeightMap(tdata) {
    let tHeightMapData = this.pHeightMapData;
    if (voidp(tHeightMapData)) {
      return error(this, "Height map update data sent but heightmap data not cached!", Symbol.for("updateHeightMap"), Symbol.for("major"));
    } else {
      let a = 1;
      for (let i = 1; i <= tdata.length; i++) {
        if (tdata.char[i] == "!") {
          i = i + 1;
          a = a + charToNum(tdata.char[i]);
          continue;
        }
        putInto(tHeightMapData.char[a], tdata.char[i]);
        a = a + 1;
      }
      return validateHeightMap(this, tHeightMapData);
    }
  }

  validateUserObjects(tdata) {
    if (!getObject(Symbol.for("cache")).exists(this.pCacheKey)) {
      return error(this, "Data not expected yet!", Symbol.for("validateUserObjects"), Symbol.for("major"));
    }
    if (tdata != 0) {
      getObject(Symbol.for("cache")).GET(this.pCacheKey).getaProp(Symbol.for("users")).add(tdata);
    }
    if (this.pActiveFlag && (tdata != 0)) {
      this.createUserObject(tdata);
    } else {
      this.updateProcess(Symbol.for("users"), 1);
    }
    return 1;
  }

  validateActiveObjects(tdata) {
    if (!getObject(Symbol.for("cache")).exists(this.pCacheKey)) {
      return error(this, "Data not expected yet!", Symbol.for("validateActiveObjects"), Symbol.for("major"));
    }
    if (tdata != 0) {
      getObject(Symbol.for("cache")).GET(this.pCacheKey).getaProp(Symbol.for("Active")).add(tdata);
    }
    if (this.pActiveFlag && (tdata != 0)) {
      this.createActiveObject(tdata);
    } else {
      this.updateProcess(Symbol.for("Active"), 1);
    }
    return 1;
  }

  validatePassiveObjects(tdata) {
    if (!getObject(Symbol.for("cache")).exists(this.pCacheKey)) {
      return error(this, "Data not expected yet!", Symbol.for("validatePassiveObjects"), Symbol.for("major"));
    }
    if (tdata != 0) {
      getObject(Symbol.for("cache")).GET(this.pCacheKey).getaProp(Symbol.for("passive")).add(tdata);
    }
    if (this.pActiveFlag && (tdata != 0)) {
      this.createPassiveObject(tdata);
    } else {
      this.updateProcess(Symbol.for("passive"), 1);
    }
    return 1;
  }

  validateItemObjects(tdata) {
    if (!getObject(Symbol.for("cache")).exists(this.pCacheKey)) {
      return error(this, "Data not expected yet!", Symbol.for("validateItemObjects"), Symbol.for("major"));
    }
    if (tdata != 0) {
      getObject(Symbol.for("cache")).GET(this.pCacheKey).getaProp(Symbol.for("items")).add(tdata);
    }
    if (this.pActiveFlag && (tdata != 0)) {
      this.createItemObject(tdata);
    } else {
      this.updateProcess(Symbol.for("items"), 1);
    }
    return 1;
  }

  pollRoomMessages() {
    if (!this.getRoomConnection() && timeoutExists(this.pRoomPollerID)) {
      return removeTimeout(this.pRoomPollerID);
    }
    if (this.getRoomConnection().getWaitingMessagesCount() > 0) {
      this.getRoomConnection().processWaitingMessages();
    }
  }

  updateProcess(tKey, tValue) {
    if (this.pActiveFlag) {
      return error(this, "Attempted to remake room!", Symbol.for("updateProcess"), Symbol.for("major"));
    }
    if (this.pProcessList[tKey] == 0) {
      this.pProcessList[tKey] = tValue;
    }
    for (const tProcess of this.pProcessList) {
      if (!tProcess) {
        break;
      }
    }
    if (tProcess == 1) {
      if (timeoutExists(this.pRoomPollerID)) {
        removeTimeout(this.pRoomPollerID);
      }
      let tCache = getObject(Symbol.for("cache")).GET(this.pCacheKey);
      for (const tdata of tCache[Symbol.for("passive")]) {
        this.createPassiveObject(tdata);
      }
      this.getShadowManager().disableRender(1);
      for (const tdata of tCache[Symbol.for("Active")]) {
        this.createActiveObject(tdata);
      }
      this.getShadowManager().disableRender(0);
      this.getShadowManager().render();
      for (const tdata of tCache[Symbol.for("items")]) {
        this.createItemObject(tdata);
      }
      for (const tdata of tCache[Symbol.for("users")]) {
        this.createUserObject(tdata);
      }
      tCache[Symbol.for("users")] = list();
      tCache[Symbol.for("Active")] = list();
      tCache[Symbol.for("items")] = list();
      this.getInterface().showRoomBar();
      this.getInterface().hideLoaderBar();
      this.getInterface().hideTrashCover();
      this.pActiveFlag = 1;
      this.pChatProps["mode"] = "CHAT";
      setcursor(Symbol.for("arrow"));
      call(Symbol.for("prepare"), [this.getRoomPrg()]);
      executeMessage(Symbol.for("roomReady"));
      this.getRoomConnection().send("G_STAT");
      return receivePrepare(this.getID());
    }
    return 0;
  }

  createRoomObject(tdata, tList, tClass) {
    if (tdata == 0) {
      return 0;
    }
    if (voidp(tdata[Symbol.for("id")]) || !listp(tList)) {
      return error(this, "Invalid arguments in object creation!", Symbol.for("createRoomObject"), Symbol.for("major"));
    }
    if (!voidp(tList[tdata[Symbol.for("id")]])) {
      return error(this, `Object already exists: ${tdata[Symbol.for("id")]}`, Symbol.for("createRoomObject"), Symbol.for("major"));
    }
    if (voidp(tClass)) {
      tClass = "passive";
    }
    tdata = getThread(Symbol.for("buffer")).getComponent().processObject(tdata, tClass);
    let tCustomCls = tdata[Symbol.for("class")];
    if (tCustomCls.contains("*")) {
      let tDelim = the.itemDelimiter;
      the.itemDelimiter = "*";
      tCustomCls = tCustomCls.item[1];
      the.itemDelimiter = tDelim;
    }
    if (!voidp(tdata[Symbol.for("type")])) {
      if (getObject(this.pClassContId).exists(`${tCustomCls}${tdata[Symbol.for("type")]}`)) {
        tCustomCls = `${tCustomCls}${tdata[Symbol.for("type")]}`;
      }
    }
    if (getObject(this.pClassContId).exists(tCustomCls)) {
      let tClasses = value(getObject(this.pClassContId).GET(tCustomCls));
    } else {
      let tClasses = value(getObject(this.pClassContId).GET(tClass));
    }
    let tObject = createObject(Symbol.for("temp"), tClasses);
    if (!objectp(tObject)) {
      return error(this, `Failed to create room object: ${tdata}`, Symbol.for("createRoomObject"), Symbol.for("major"));
    }
    tObject.setID(tdata[Symbol.for("id")]);
    let tSuccess = tObject.define(tdata.duplicate());
    if (!tSuccess) {
      tObject.deconstruct();
      return error(this, `Failed to define room object: ${tdata}`, Symbol.for("createRoomObject"), Symbol.for("major"));
    }
    tList[tObject.getID()] = tObject;
    return 1;
  }

  removeRoomObject(tID, tList) {
    if (voidp(tList[tID])) {
      return error(this, `Object not found: ${tID}`, Symbol.for("removeRoomObject"), Symbol.for("minor"));
    }
    tList[tID].deconstruct();
    tList.deleteProp(tID);
    return 1;
  }

  getRoomObject(tID, tList) {
    if (tID == Symbol.for("list")) {
      return tList;
    }
    if (voidp(tList.getaProp(tID))) {
      return 0;
    } else {
      return tList.getaProp(tID);
    }
  }

  roomObjectExists(tID, tList) {
    if (!(listp(tList) || voidp(tID))) {
      return 0;
    }
    if (ilk(tID) == Symbol.for("string")) {
      if (tID == EMPTY) {
        return 0;
      }
    } else {
      if (tID < 1) {
        return 0;
      }
    }
    return !voidp(tList[tID]);
  }

  startTeleport(tTeleId, tFlatID) {
    getObject(Symbol.for("session")).set("target_door_ID", tTeleId);
    getObject(Symbol.for("session")).set("target_flat_ID", tFlatID);
    return executeMessage(Symbol.for("requestRoomData"), tFlatID, Symbol.for("private"), [this.getID(), Symbol.for("processTeleportStruct")]);
  }

  processTeleportStruct(tFlatStruct) {
    if (!listp(tFlatStruct)) {
      return 0;
    }
    tFlatStruct = tFlatStruct.duplicate();
    tFlatStruct[Symbol.for("id")] = tFlatStruct[Symbol.for("flatId")];
    tFlatStruct.addProp(Symbol.for("teleport"), getObject(Symbol.for("session")).GET("target_door_ID"));
    getObject(Symbol.for("session")).Remove("target_flat_id");
    if (getObject(Symbol.for("session")).exists("current_door_ID")) {
      let tDoorID = getObject(Symbol.for("session")).GET("current_door_ID");
      let tDoorObj = this.getComponent().getActiveObject(tDoorID);
      if (tDoorObj != 0) {
        tDoorObj.startTeleport(tFlatStruct);
      }
    }
  }

  updateSlideObjects(tTimeNow) {
    if (voidp(tTimeNow)) {
      tTimeNow = the.milliSeconds;
    }
    let tList = this.pCurrentSlidingObjects.duplicate();
    call(Symbol.for("animateSlide"), tList, tTimeNow);
  }

  setEnterRoomAlert(tMsg) {
    this.pEnterRoomAlert = tMsg;
  }

  executeEnterRoomAlert() {
    if (this.pEnterRoomAlert.length > 0) {
      executeMessage(Symbol.for("alert"), propList("Msg", this.pEnterRoomAlert));
      this.pEnterRoomAlert = EMPTY;
    }
  }

  removeEnterRoomAlert() {
    this.pEnterRoomAlert = EMPTY;
  }

  getRoomScale(tRoomMarker) {
    if (voidp(tRoomMarker)) {
      return 0;
    }
    let tRoomProps = getVariableValue("private.room.properties");
    if (voidp(tRoomProps)) {
      return 0;
    }
    let tRoomKey = chars(tRoomMarker, tRoomMarker.length, tRoomMarker.length);
    for (const tRoom of tRoomProps) {
      if (tRoom[Symbol.for("model")] == tRoomKey) {
        return tRoom[Symbol.for("charScale")];
      }
    }
    return 0;
  }

  addToCastDownloadList(tCastVarPrefix, tCastList) {
    if (voidp(tCastList) || !listp(tCastList)) {
      tCastList = list();
    }
    let i = 1;
    while (1) {
      if (variableExists(`${tCastVarPrefix}${i}`)) {
        let tCast = getVariable(`${tCastVarPrefix}${i}`);
        if (!castExists(tCast)) {
          tCastList.add(tCast);
        }
      } else {
        break;
      }
      i = i + 1;
    }
    return tCastList;
  }
}
