export default class {
  pInfoConnID;
  pRoomConnID;
  pGeometryId;
  pHiliterId;
  pContainerID;
  pSafeTraderID;
  pObjMoverID;
  pArrowObjID;
  pBadgeObjID;
  pDoorBellID;
  pRoomSpaceId;
  pInterfaceId;
  pDelConfirmID;
  pPlcConfirmID;
  pLoaderBarID;
  pDeleteObjID;
  pDeleteType;
  pModBadgeList;
  pClickAction;
  pSelectedObj;
  pSelectedType;
  pCoverSpr;
  pRingingUser;
  pVisitorQueue;
  pBannerLink;
  pLoadingBarID;
  pQueueCollection;
  pSwapAnimations;
  pTradeTimeout;
  pRoomGuiID;
  pInfoStandId;
  pIgnoreListID;
  pWideScreenOffset;

  construct() {
    this.pInfoConnID = getVariable("connection.info.id");
    this.pRoomConnID = getVariable("connection.room.id");
    this.pObjMoverID = "Room_obj_mover";
    this.pHiliterId = "Room_hiliter";
    this.pGeometryId = "Room_geometry";
    this.pContainerID = "Room_container";
    this.pSafeTraderID = "Room_safe_trader";
    this.pArrowObjID = "Room_arrow_hilite";
    this.pBadgeObjID = "Room_badge";
    this.pDoorBellID = "Room_doorbell";
    this.pPreviewObjID = "Preview_renderer";
    this.pInfoStandId = "Room_info_stand";
    this.pIgnoreListID = "Room_ignore_list";
    this.pRoomGuiID = "Room_gui_program";
    this.pRoomSpaceId = "Room_visualizer";
    this.pInterfaceId = "Room_interface";
    this.pDelConfirmID = getText("win_delete_item", "Delete item?");
    this.pLoaderBarID = "Loading room";
    this.pPlcConfirmID = getText("win_place", "Place item?");
    this.pClickAction = Symbol.for("null");
    this.pSelectedObj = EMPTY;
    this.pSelectedType = EMPTY;
    this.pDeleteObjID = EMPTY;
    this.pDeleteType = EMPTY;
    this.pRingingUser = EMPTY;
    this.pVisitorQueue = list();
    this.pBannerLink = 0;
    this.pSwapAnimations = list();
    this.pTradeTimeout = 0;
    this.pLoadingBarID = 0;
    this.pQueueCollection = list();
    this.pModBadgeList = getVariableValue("moderator.badgelist");
    createObject(this.pGeometryId, "Room Geometry Class");
    createObject(this.pContainerID, "Container Hand Class");
    createObject(this.pSafeTraderID, "Safe Trader Class");
    createObject(this.pArrowObjID, "Select Arrow Class");
    createObject(this.pObjMoverID, "Object Mover Class");
    createObject(this.pBadgeObjID, "Badge Manager Class");
    createObject(this.pPreviewObjID, "Preview Renderer Class");
    createObject(this.pDoorBellID, "Doorbell Class");
    createObject(this.pRoomGuiID, "Room GUI Class");
    createObject(this.pInfoStandId, "Info Stand Class");
    createObject(this.pIgnoreListID, "Ignore List Class");
    getObject(this.pObjMoverID).setProperty(Symbol.for("geometry"), getObject(this.pGeometryId));
    registerMessage(Symbol.for("objectFinalized"), this.getID(), Symbol.for("objectFinalized"));
    this.updateScreenOffset();
    return 1;
  }

  deconstruct() {
    this.pClickAction = Symbol.for("null");
    removeObject(this.pBadgeObjID);
    removeObject(this.pDoorBellID);
    removeObject(this.pInfoStandId);
    removeObject(this.pIgnoreListID);
    removeObject(this.pRoomGuiID);
    return this.hideAll();
  }

  showRoom(tRoomID) {
    if (!memberExists(`${tRoomID}.room`)) {
      return error(this, `Room recording data member not found, check recording label name. Tried to find ${tRoomID}.room`, Symbol.for("showRoom"), Symbol.for("major"));
    }
    this.showTrashCover();
    if (windowExists(this.pLoaderBarID)) {
      activateWindowObj(this.pLoaderBarID);
    }
    let tRoomField = `${tRoomID}.room`;
    this.updateScreenOffset(tRoomID);
    createVisualizer(this.pRoomSpaceId, tRoomField, this.pWideScreenOffset);
    let tVisObj = getVisualizer(this.pRoomSpaceId);
    let tLocX = tVisObj.getProperty(Symbol.for("locX"));
    let tLocY = tVisObj.getProperty(Symbol.for("locY"));
    let tlocz = tVisObj.getProperty(Symbol.for("locZ"));
    let tdata = getObject(Symbol.for("layout_parser")).parse(tRoomField).roomdata[1];
    tdata[Symbol.for("offsetz")] = tlocz;
    tdata[Symbol.for("offsetx")] = tdata[Symbol.for("offsetx")] + this.pWideScreenOffset;
    tdata[Symbol.for("offsety")] = tdata[Symbol.for("offsety")];
    this.getGeometry().define(tdata);
    let tSprList = tVisObj.getProperty(Symbol.for("spriteList"));
    call(Symbol.for("registerProcedure"), tSprList, Symbol.for("eventProcRoom"), this.getID(), Symbol.for("mouseDown"));
    call(Symbol.for("registerProcedure"), tSprList, Symbol.for("eventProcRoom"), this.getID(), Symbol.for("mouseUp"));
    let tHiliterSpr = tVisObj.getSprById("hiliter");
    if (!tHiliterSpr) {
      if (this.getHiliter() != 0) {
        this.getHiliter().deconstruct();
      }
      error(this, "Hiliter not found in room description!!!", Symbol.for("showRoom"), Symbol.for("minor"));
    } else {
      createObject(this.pHiliterId, "Room Hiliter Class");
      this.getHiliter().define(propList("sprite", tHiliterSpr, "geometry", this.pGeometryId));
      receiveUpdate(this.pHiliterId);
    }
    let tAnimations = tVisObj.getProperty(Symbol.for("swapAnims"));
    if (tAnimations != 0) {
      for (const tAnimation of tAnimations) {
        let tObj = createObject(Symbol.for("random"), getVariableValue("swap.animation.class"));
        if (tObj == 0) {
          error(this, "Error creating swap animation", Symbol.for("showRoom"), Symbol.for("minor"));
          continue;
        }
        this.pSwapAnimations.add(tObj);
        this.pSwapAnimations[this.pSwapAnimations.count].define(tAnimation);
      }
    }
    this.getArrowHiliter().Init();
    this.pClickAction = "moveHuman";
    return 1;
  }

  hideRoom() {
    removeUpdate(this.pHiliterId);
    removeObject(this.pHiliterId);
    this.pClickAction = Symbol.for("null");
    this.pSelectedObj = EMPTY;
    this.hideArrowHiliter();
    this.hideTrashCover();
    for (const tAnim of this.pSwapAnimations) {
      tAnim.deconstruct();
    }
    this.pSwapAnimations = list();
    if (visualizerExists(this.pRoomSpaceId)) {
      removeVisualizer(this.pRoomSpaceId);
    }
    return 1;
  }

  showRoomBar(tLayout) {
    let tGUI = getObject(this.pRoomGuiID);
    if (!voidp(tGUI) && (tGUI != 0)) {
      tGUI.showRoomBar(tLayout);
    }
  }

  hideRoomBar() {
    let tGUI = getObject(this.pRoomGuiID);
    if (!voidp(tGUI) && (tGUI != 0)) {
      tGUI.hideRoomBar();
    }
  }

  showVote() {
    let tGUI = getObject(this.pRoomGuiID);
    if (!voidp(tGUI) && (tGUI != 0)) {
      tGUI.showVote();
    }
  }

  startTradeButtonTimeout() {
    this.pTradeTimeout = 1;
    let tWndObj = getWindow(this.pInterfaceId);
    if (tWndObj != 0) {
      if (tWndObj.elementExists("trade.button")) {
        tWndObj.getElement("trade.button").deactivate();
      }
    }
    let tTimeout = getVariable("room.request.timeout", 10000);
    createTimeout(Symbol.for("activeTradeButton"), tTimeout, Symbol.for("endTradeButtonTimeout"), this.getID(), VOID, 1);
  }

  endTradeButtonTimeout() {
    this.pTradeTimeout = 0;
    let tWndObj = getWindow(this.pInterfaceId);
    if (tWndObj != 0) {
      if (tWndObj.elementExists("trade.button")) {
        tWndObj.getElement("trade.button").Activate();
      }
    }
  }

  showArrowHiliter(tUserID) {
    if (objectExists(this.pArrowObjID)) {
      return this.getArrowHiliter().show(tUserID);
    }
  }

  hideArrowHiliter() {
    return this.getArrowHiliter().hide();
  }

  showDoorBellWaiting() {
    this.hideLoaderBar();
    createWindow(this.pLoaderBarID, "habbo_simple.window");
    let tWndObj = getWindow(this.pLoaderBarID);
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.merge("room_doorbell_waiting.window");
    tWndObj.center();
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcBanner"), this.getID(), Symbol.for("mouseUp"));
    let tRoomData = this.getComponent().getRoomData();
    if (tRoomData == 0) {
      return 1;
    }
    let tRoomName = tRoomData[Symbol.for("name")];
    let tElem = tWndObj.getElement("room_doorbell_roomname");
    if (tElem == 0) {
      return 1;
    }
    tElem.setText(tRoomName);
    return 1;
  }

  showDoorBellAccepted(tName) {
    if (tName == EMPTY) {
      nothing();
    } else {
      if (objectExists(this.pDoorBellID)) {
        getObject(this.pDoorBellID).removeFromList(tName);
      }
    }
    return 1;
  }

  showDoorBellRejected(tName) {
    if (tName == EMPTY) {
      this.hideLoaderBar();
      createWindow(this.pLoaderBarID, "habbo_simple.window");
      let tWndObj = getWindow(this.pLoaderBarID);
      if (tWndObj == 0) {
        return 0;
      }
      tWndObj.merge("room_doorbell_rejected.window");
      tWndObj.center();
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcBanner"), this.getID(), Symbol.for("mouseUp"));
    } else {
      if (objectExists(this.pDoorBellID)) {
        getObject(this.pDoorBellID).removeFromList(tName);
      }
    }
    return 1;
  }

  showDoorBellDialog(tName) {
    let tOwnUser = this.getComponent().getOwnUser();
    if (tOwnUser == 0) {
      return error(this, "Own user not found!", Symbol.for("showDoorBell"), Symbol.for("major"));
    }
    if (tOwnUser.getInfo().ctrl == 0) {
      return 1;
    }
    if (objectExists(this.pDoorBellID)) {
      return getObject(this.pDoorBellID).addDoorbellRinger(tName);
    }
  }

  hideDoorBellDialog() {
    if (objectExists(this.pDoorBellID)) {
      getObject(this.pDoorBellID).hideDoorBell();
    }
  }

  showLoaderBar(tCastLoadId, tText) {
    if (!windowExists(this.pLoaderBarID)) {
      createWindow(this.pLoaderBarID, "habbo_simple.window");
      let tWndObj = getWindow(this.pLoaderBarID);
      tWndObj.merge("room_loader.window");
      tWndObj.center();
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcBanner"), this.getID(), Symbol.for("mouseUp"));
      if (!voidp(tCastLoadId)) {
        let tBuffer = tWndObj.getElement("gen_loaderbar").getProperty(Symbol.for("buffer")).image;
        this.pLoadingBarID = showLoadingBar(tCastLoadId, propList("buffer", tBuffer, "bgColor", rgb(255, 255, 255)));
      }
      if (stringp(tText)) {
        tWndObj.getElement("general_loader_text").setText(tText);
      }
    }
    return 1;
  }

  hideLoaderBar() {
    if (windowExists(this.pLoaderBarID)) {
      removeWindow(this.pLoaderBarID);
    }
    let tInterstitialMngr = this.getComponent().getInterstitial();
    if (!voidp(tInterstitialMngr)) {
      tInterstitialMngr.adClosed();
    }
    this.pLoadingBarID = 0;
  }

  resizeInterstitialWindow() {
    if (!windowExists(this.pLoaderBarID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pLoaderBarID);
    let tInterstitialMngr = this.getComponent().getInterstitial();
    if (voidp(tInterstitialMngr)) {
      return 0;
    }
    let tMemNum = tInterstitialMngr.getInterstitialMemNum();
    if (tMemNum < 1) {
      return 0;
    }
    let tAdMember = member(tMemNum);
    if (tAdMember.type == Symbol.for("bitmap")) {
      let tAdImage = tAdMember.image;
    } else {
      let tAdImage = image(1, 1, 8);
    }
    let tAdWidth = tAdImage.rect[3];
    let tAdHeight = tAdImage.rect[4];
    let tAdMaxW = 620;
    if (tAdWidth > tAdMaxW) {
      tAdWidth = tAdMaxW;
    }
    let tAdMaxH = 360;
    if (tAdHeight > tAdMaxH) {
      tAdHeight = tAdMaxH;
    }
    if (tAdMember.type == Symbol.for("bitmap")) {
      tAdImage = image(tAdWidth, tAdHeight, 32);
      tAdImage.copyPixels(tAdMember.image, rect(0, 0, tAdWidth, tAdHeight), rect(0, 0, tAdWidth, tAdHeight));
    }
    let tWndWidth = 240;
    let tBorderWidth = 25;
    let tAdLocX = 0;
    let tAdLocY = tBorderWidth;
    let tOffX = 0;
    let tOffY = tAdHeight + 10 + tBorderWidth;
    if (tAdWidth > (tWndWidth - (tBorderWidth * 2))) {
      tOffX = tAdWidth - tWndWidth + (tBorderWidth * 2);
      tAdLocX = tBorderWidth;
    } else {
      tAdLocX = (tWndWidth - tAdWidth) / 2;
    }
    tWndObj.resizeBy(tOffX, tOffY);
    tWndObj.center();
    let tElementList = ["general_loader_text", "queue_text", "second_queue_title", "queue_text_2"];
    for (const tElemID of tElementList) {
      let tElem = tWndObj.getElement(tElemID);
      if (tElem != 0) {
        tElem.setText(tElem.getText());
      }
    }
    if (!tWndObj.elementExists("room_banner_pic")) {
      return 0;
    }
    let tPic = tWndObj.getElement("room_banner_pic");
    tPic.moveTo(tAdLocX, tAdLocY);
    tPic.setProperty(Symbol.for("width"), tAdWidth);
    tPic.feedImage(tAdImage);
    tPic.setProperty(Symbol.for("cursor"), "cursor.finger");
    let tAdSprite = tPic.pSprite;
    tAdSprite.registerProcedure(Symbol.for("eventProc"), tInterstitialMngr.getID(), Symbol.for("mouseUp"));
    tAdSprite.registerProcedure(Symbol.for("eventProc"), tInterstitialMngr.getID(), Symbol.for("mouseEnter"));
    tAdSprite.registerProcedure(Symbol.for("eventProc"), tInterstitialMngr.getID(), Symbol.for("mouseLeave"));
    tAdSprite.registerProcedure(Symbol.for("eventProc"), tInterstitialMngr.getID(), Symbol.for("mouseWithin"));
  }

  updateQueueWindow(tQueueCollection) {
    if (!windowExists(this.pLoaderBarID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pLoaderBarID);
    if (this.pLoadingBarID != 0) {
      if (objectExists(this.pLoadingBarID)) {
        removeObject(this.pLoadingBarID);
      }
      this.pLoadingBarID = 0;
    }
    tWndObj.unmerge();
    if (tQueueCollection.count() == 1) {
      tWndObj.merge("room_loader.window");
      let tSetCount = 1;
    } else {
      tWndObj.merge("room_loader_2.window");
      let tSetCount = 2;
    }
    tWndObj.center();
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcBanner"), this.getID(), Symbol.for("mouseUp"));
    if (tWndObj.elementExists("gen_loaderbar")) {
      tWndObj.getElement("gen_loaderbar").setProperty(Symbol.for("visible"), 0);
    }
    if (!tWndObj.elementExists("general_loader_text")) {
      return 0;
    }
    let tTitleElementList = ["general_loader_text", "second_queue_title"];
    let tTextElementList = ["queue_text", "queue_text_2"];
    let tTitleTextList = ["queue_current_", "queue_other_"];
    this.pQueueCollection = tQueueCollection.duplicate();
    for (let i = 1; i <= tSetCount; i++) {
      let tQueueSet = this.pQueueCollection[i];
      let tQueueTarget = tQueueSet["target"];
      let tQueueData = tQueueSet["data"];
      let tQueueSetName = tQueueSet["name"];
      if (tWndObj.elementExists(tTitleElementList[i])) {
        let tTitleElem = tWndObj.getElement(tTitleElementList[i]);
        tTitleElem.setText(getText(`${tTitleTextList[i]}${string(tQueueTarget)}`));
      }
      if (tWndObj.elementExists(tTextElementList[i])) {
        let tQueueTxtElem = tWndObj.getElement(tTextElementList[i]);
        let tQueueTxt = getText(`queue_set.${tQueueSetName}.info`);
        for (let tCount = 1; tCount <= tQueueData.count; tCount++) {
          let tQueueProp = getPropAt(tQueueData, tCount);
          let tQueueValue = tQueueData[tQueueProp];
          tQueueTxt = replaceChunks(tQueueTxt, `%${tQueueProp}%`, tQueueValue);
        }
        tQueueTxtElem.setText(tQueueTxt);
      }
    }
    this.resizeInterstitialWindow();
    return 1;
  }

  showTrashCover(tlocz, tColor) {
    if (voidp(this.pCoverSpr)) {
      if (!integerp(tlocz)) {
        tlocz = 0;
      }
      if (!ilk(tColor, Symbol.for("color"))) {
        tColor = rgb(0, 0, 0);
      }
      this.pCoverSpr = sprite(reserveSprite(this.getID()));
      if (!memberExists("Room Trash Cover")) {
        createMember("Room Trash Cover", Symbol.for("bitmap"));
      }
      let tmember = member(getmemnum("Room Trash Cover"));
      tmember.image = image(1, 1, 8);
      tmember.image.setPixel(0, 0, tColor);
      this.pCoverSpr.member = tmember;
      this.pCoverSpr.loc = point(0, 0);
      this.pCoverSpr.width = (the.stage).rect.width;
      this.pCoverSpr.height = (the.stage).rect.height;
      this.pCoverSpr.locZ = tlocz;
      this.pCoverSpr.blend = 100;
      setEventBroker(this.pCoverSpr.spriteNum, "Trash Cover");
      updateStage();
    }
  }

  hideTrashCover() {
    if (!voidp(this.pCoverSpr)) {
      releaseSprite(this.pCoverSpr.spriteNum);
      this.pCoverSpr = VOID;
    }
  }

  hideAll() {
    if (objectExists(this.pObjMoverID)) {
      getObject(this.pObjMoverID).close();
    }
    if (objectExists(this.pSafeTraderID)) {
      getObject(this.pSafeTraderID).close();
    }
    if (objectExists(this.pContainerID)) {
      getObject(this.pContainerID).close();
    }
    if (objectExists(this.pArrowObjID)) {
      getObject(this.pArrowObjID).hide();
    }
    if (objectExists("BadgeEffect")) {
      removeObject("BadgeEffect");
    }
    if (objectExists(Symbol.for("photo_interface"))) {
      getObject(Symbol.for("photo_interface")).close();
    }
    if (objectExists(this.pInfoStandId)) {
      getObject(this.pInfoStandId).hideInfoStand();
    }
    if (objectExists(this.pRoomGuiID)) {
      getObject(this.pRoomGuiID).hideInfoStand();
    }
    this.hideRoom();
    this.hideRoomBar();
    this.hideConfirmDelete();
    this.hideConfirmPlace();
    this.hideDoorBellDialog();
    this.hideLoaderBar();
    this.hideTrashCover();
    this.hideLoaderBar();
    executeMessage(Symbol.for("roomInterfaceHidden"));
    return 1;
  }

  getRoomVisualizer() {
    return getVisualizer(this.pRoomSpaceId);
  }

  getGeometry() {
    return getObject(this.pGeometryId);
  }

  getHiliter() {
    return getObject(this.pHiliterId);
  }

  getContainer() {
    return getObject(this.pContainerID);
  }

  getSafeTrader() {
    return getObject(this.pSafeTraderID);
  }

  getArrowHiliter() {
    return getObject(this.pArrowObjID);
  }

  getBadgeObject() {
    return getObject(this.pBadgeObjID);
  }

  getIgnoreListObject() {
    return getObject(this.pIgnoreListID);
  }

  getObjectMover() {
    return getObject(this.pObjMoverID);
  }

  setSelectedObject(tSelectedObj) {
    this.pSelectedObj = tSelectedObj;
  }

  getSelectedObject() {
    return this.pSelectedObj;
  }

  getProperty(tPropID) {
    switch (tPropID) {
      case Symbol.for("clickAction"):
        return this.pClickAction;
      case Symbol.for("widescreenoffset"):
        return this.pWideScreenOffset;
      default:
        return 0;
    }
  }

  setProperty(tPropID, tValue) {
    switch (tPropID) {
      case Symbol.for("clickAction"):
        this.pClickAction = tValue;
        break;
      default:
        return 0;
    }
  }

  cancelObjectMover() {
    let tMoverObj = this.getObjectMover();
    if (!(tMoverObj == 0)) {
      tMoverObj.cancelMove();
    }
    return this.stopObjectMover();
  }

  dancingStoppedExternally() {
    let tWndObj = getWindow(this.pInterfaceId);
    if (tWndObj == 0) {
      return 1;
    }
    let tElem = tWndObj.getElement("hcdance.button");
    if (tElem == 0) {
      return 1;
    }
    tElem.setSelection("dance_choose", 1);
    return 1;
  }

  getKeywords() {
    return list(deobfuscate("$cMgMXLrlJM|OI-9"), deobfuscate("%bl&-ym3Lj-|.I-)"), deobfuscate("EBLFM9M2,KM|oH/h"));
  }

  notify(ttype) {
    switch (ttype) {
      case 400:
        executeMessage(Symbol.for("alert"), propList("Msg", "room_cant_trade"));
        break;
      case 401:
        executeMessage(Symbol.for("alert"), propList("Msg", "room_max_pet_limit"));
        break;
      case 402:
        executeMessage(Symbol.for("alert"), propList("Msg", "room_cant_set_item"));
        break;
      case 403:
        executeMessage(Symbol.for("alert"), propList("Msg", "wallitem_post.it.limit"));
        break;
      case 404:
        executeMessage(Symbol.for("alert"), propList("Msg", "queue_tile_limit"));
        break;
      case 405:
        executeMessage(Symbol.for("alert"), propList("Msg", "room_alert_furni_limit", "id", "roomfullfurni", "modal", 1));
        break;
      case 406:
        executeMessage(Symbol.for("alert"), propList("Msg", "room_sound_furni_limit"));
        break;
    }
  }

  getIgnoreStatus(tUserID, tName) {
    let tIgnoreListObj = this.getIgnoreListObject();
    if (!objectp(tIgnoreListObj)) {
      return 0;
    }
    if (!voidp(tName)) {
      return tIgnoreListObj.getIgnoreStatus(tName);
    }
    if (this.getComponent().userObjectExists(tUserID)) {
      tName = this.getComponent().getUserObject(tUserID).getName();
      return tIgnoreListObj.getIgnoreStatus(tName);
    } else {
      return 0;
    }
  }

  unignoreAdmin(tUserID, tBadges) {
    let tIgnoreListObj = this.getIgnoreListObject();
    let tModBadgeFound = 0;
    for (const tBadge of tBadges) {
      if (this.pModBadgeList.getOne(tBadge) > 0) {
        tModBadgeFound = 1;
        break;
      }
    }
    if (this.getComponent().userObjectExists(tUserID) && tModBadgeFound) {
      let tName = this.getComponent().getUserObject(tUserID).getName();
      if (objectp(tIgnoreListObj)) {
        return tIgnoreListObj.setIgnoreStatus(tName, 0);
      }
    } else {
      return 0;
    }
  }

  startObjectMover(tObjID, tStripID, tProps) {
    if (!objectExists(this.pObjMoverID)) {
      createObject(this.pObjMoverID, "Object Mover Class");
    }
    switch (this.pSelectedType) {
      case "active":
        this.pClickAction = "moveActive";
        break;
      case "item":
        this.pClickAction = "moveItem";
        break;
      default:
        return error(this, `Object type ${this.pSelectedType} can't be moved.`, Symbol.for("startObjectMover"), Symbol.for("minor"));
    }
    return getObject(this.pObjMoverID).define(tObjID, tStripID, this.pSelectedType, tProps);
  }

  stopObjectMover() {
    if (!objectExists(this.pObjMoverID)) {
      return error(this, "Object mover not found!", Symbol.for("stopObjectMover"), Symbol.for("minor"));
    }
    getObject(this.pObjMoverID).clear();
    this.pClickAction = "moveHuman";
    this.pSelectedObj = EMPTY;
    this.pSelectedType = EMPTY;
    executeMessage(Symbol.for("hideObjectInfo"));
    return 1;
  }

  startTrading(tTargetUser) {
    if (this.pSelectedType != "user") {
      return 0;
    }
    if (tTargetUser == getObject(Symbol.for("session")).GET("user_name")) {
      return 0;
    }
    this.getComponent().getRoomConnection().send("TRADE_OPEN", tTargetUser);
    if (objectExists(this.pObjMoverID)) {
      getObject(this.pObjMoverID).moveTrade();
    }
    return 1;
  }

  stopTrading() {
    return error(this, "TODO: stopTrading...!", Symbol.for("stopTrading"), Symbol.for("minor"));
    this.pClickAction = "moveHuman";
    if (objectExists(this.pObjMoverID)) {
      this.stopObjectMover();
    }
    return 1;
  }

  showConfirmDelete() {
    if (windowExists(this.pDelConfirmID)) {
      return 0;
    }
    if (!createWindow(this.pDelConfirmID, "habbo_basic.window", 200, 120)) {
      return error(this, "Couldn't create confirmation window!", Symbol.for("showConfirmDelete"), Symbol.for("major"));
    }
    let tMsgA = getText("room_confirmDelete", "Confirm delete");
    let tMsgB = getText("room_areYouSure", "Are you absolutely sure you want to delete this item?");
    let tWndObj = getWindow(this.pDelConfirmID);
    if (!tWndObj.merge("habbo_decision_dialog.window")) {
      return tWndObj.close();
    }
    tWndObj.lock();
    tWndObj.getElement("habbo_decision_text_a").setText(tMsgA);
    tWndObj.getElement("habbo_decision_text_b").setText(tMsgB);
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcDelConfirm"), this.getID(), Symbol.for("mouseUp"));
    return 1;
  }

  hideConfirmDelete() {
    if (windowExists(this.pDelConfirmID)) {
      removeWindow(this.pDelConfirmID);
    }
  }

  showConfirmPlace() {
    if (windowExists(this.pPlcConfirmID)) {
      return 0;
    }
    if (!createWindow(this.pPlcConfirmID, "habbo_basic.window", 200, 120)) {
      return error(this, "Couldn't create confirmation window!", Symbol.for("showConfirmPlace"), Symbol.for("major"));
    }
    let tMsgA = getText("room_confirmPlace", "Confirm placement");
    let tMsgB = getText("room_areYouSurePlace", "Are you absolutely sure you want to place this item?");
    let tWndObj = getWindow(this.pPlcConfirmID);
    if (!tWndObj.merge("habbo_decision_dialog.window")) {
      return tWndObj.close();
    }
    tWndObj.lock();
    tWndObj.getElement("habbo_decision_text_a").setText(tMsgA);
    tWndObj.getElement("habbo_decision_text_b").setText(tMsgB);
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcPlcConfirm"), this.getID(), Symbol.for("mouseUp"));
    return 1;
  }

  hideConfirmPlace() {
    if (windowExists(this.pPlcConfirmID)) {
      removeWindow(this.pPlcConfirmID);
    }
  }

  placeFurniture(tObjID, tObjType) {
    switch (tObjType) {
      case "active":
        let tloc = getObject(this.pObjMoverID).getProperty(Symbol.for("loc"));
        if (!tloc) {
          this.getComponent().getRoomConnection().send("GETSTRIP", "update");
          return 0;
        }
        let tObj = this.getComponent().getActiveObject(tObjID);
        if (tObj == 0) {
          return error(this, `Invalid active object: ${tObjID}`, Symbol.for("placeFurniture"), Symbol.for("major"));
        }
        let tStripID = tObj.getaProp(Symbol.for("stripId"));
        let tStr = `${tStripID} ${tloc[1]} ${tloc[2]} ${tObj.pDirection[1]}`;
        this.getComponent().removeActiveObject(tObj[Symbol.for("id")]);
        this.getComponent().getRoomConnection().send("PLACESTUFF", tStr);
        return 1;
        break;
      case "item":
        let tloc = getObject(this.pObjMoverID).getProperty(Symbol.for("itemLocStr"));
        if (!tloc) {
          return 0;
        }
        let tObj = this.getComponent().getItemObject(tObjID);
        if (tObj == 0) {
          return error(this, `Invalid item object: ${tObjID}`, Symbol.for("placeFurniture"), Symbol.for("major"));
        }
        let tStripID = tObj.getaProp(Symbol.for("stripId"));
        let tStr = `${tStripID} ${tloc}`;
        this.getComponent().removeItemObject(tObj[Symbol.for("id")]);
        this.getComponent().getRoomConnection().send("PLACESTUFF", tStr);
        return 1;
        break;
      default:
        return 0;
    }
  }

  setSpeechDropdown(tMode) {
    let tGUI = getObject(this.pRoomGuiID);
    if (!voidp(tGUI) && (tGUI != 0)) {
      tGUI.setSpeechDropdown(tMode);
    }
  }

  showCfhSenderDelayed(tID) {
    return createTimeout(Symbol.for("highLightCfhSender"), 3000, Symbol.for("highLightCfhSender"), this.getID(), tID, 1);
  }

  highLightCfhSender(tID) {
    if (!voidp(tID)) {
      this.showArrowHiliter(tID);
    }
    return 1;
  }

  validateEvent(tEvent, tSprID, tloc) {
    if (call(Symbol.for("getID"), sprite(the.rollover).scriptInstanceList) == tSprID) {
      let tSpr = sprite(the.rollover);
      if ((tSpr.member.type == Symbol.for("bitmap")) && (tSpr.ink == 36)) {
        let tPixel = tSpr.member.image.getPixel(tloc[1] - tSpr.left, tloc[2] - tSpr.top);
        if (!tPixel) {
          return 0;
        }
        if (tPixel.hexString() == "#FFFFFF") {
          tSpr.visible = 0;
          call(tEvent, sprite(the.rollover).scriptInstanceList);
          tSpr.visible = 1;
          return 0;
        } else {
          return 1;
        }
      } else {
        return 1;
      }
    } else {
      return 1;
    }
    return 1;
  }

  objectFinalized(tID) {
    if (this.pSelectedObj == tID) {
      executeMessage(Symbol.for("hideObjectInfo"));
    }
  }

  showRemoveSpecsNotice() {
    executeMessage(Symbol.for("alert"), propList("Msg", "room_remove_specs", "modal", 1));
  }

  updateScreenOffset(tRoomID) {
    if ((the.stage).rect.width > 800) {
      this.pWideScreenOffset = getVariable("widescreen.offset.x");
    } else {
      this.pWideScreenOffset = 0;
    }
    if ((this.pWideScreenOffset != 0) && !voidp(tRoomID)) {
      if (variableExists(`${tRoomID}.wide.offset.x`)) {
        this.pWideScreenOffset = value(getVariable(`${tRoomID}.wide.offset.x`));
      }
    }
    if (variableExists(`${tRoomID}.wide.align.right`)) {
      if (value(getVariable(`${tRoomID}.wide.align.right`))) {
        this.pWideScreenOffset = (the.stage).rect.width - 720 - this.pWideScreenOffset;
      }
    }
  }

  eventProcActiveRollOver(tEvent, tSprID, tProp) {
    let tGUI = getObject(this.pRoomGuiID);
    if (voidp(tGUI) || (tGUI == 0)) {
      return 0;
    }
    if (this.getComponent().getRoomData().type == Symbol.for("private")) {
      if (tEvent == Symbol.for("mouseEnter")) {
        tGUI.setRollOverInfo(this.getComponent().getActiveObject(tSprID).getCustom());
      } else {
        if (tEvent == Symbol.for("mouseLeave")) {
          tGUI.setRollOverInfo(EMPTY);
        }
      }
    }
  }

  eventProcUserRollOver(tEvent, tSprID, tProp) {
    if (this.pClickAction == "placeActive") {
      if (tEvent == Symbol.for("mouseEnter")) {
        this.showArrowHiliter(tSprID);
      } else {
        this.showArrowHiliter(VOID);
      }
    }
    let tGUI = getObject(this.pRoomGuiID);
    if (voidp(tGUI) || (tGUI == 0)) {
      return 0;
    }
    if (tEvent == Symbol.for("mouseEnter")) {
      let tObject = this.getComponent().getUserObject(tSprID);
      if (tObject == 0) {
        return;
      }
      tGUI.setRollOverInfo(tObject.getInfo().getaProp(Symbol.for("name")));
    } else {
      if (tEvent == Symbol.for("mouseLeave")) {
        tGUI.setRollOverInfo(EMPTY);
      }
    }
  }

  eventProcItemRollOver(tEvent, tSprID, tProp) {
    let tGUI = getObject(this.pRoomGuiID);
    if (voidp(tGUI) || (tGUI == 0)) {
      return 0;
    }
    let tObject = this.getComponent().getItemObject(tSprID);
    if (tObject == 0) {
      return tGUI.setRollOverInfo(EMPTY);
    }
    if (tEvent == Symbol.for("mouseEnter")) {
      tGUI.setRollOverInfo(tObject.getCustom());
    } else {
      if (tEvent == Symbol.for("mouseLeave")) {
        tGUI.setRollOverInfo(EMPTY);
      }
    }
    if (!(getObject(Symbol.for("session")).GET("room_controller") || getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_any_room_controller")) || (the.shiftDown && the.optionDown)) {
      if (tObject.hasURL()) {
        let tAdSystem = this.getComponent().getAd();
        if (tAdSystem != 0) {
          tAdSystem.eventProc(tEvent, tSprID, tObject.GetUrl());
        }
      }
    }
  }

  eventProcRoom(tEvent, tSprID, tParam) {
    if (this.getComponent().getSpectatorMode()) {
      return 1;
    }
    if (this.getComponent().getOwnUser() == 0) {
      return 1;
    }
    if ((tEvent == Symbol.for("mouseUp")) && (tSprID.contains("command:"))) {
      let tCmd = convertToHigherCase(tSprID.word[2]);
      let tPrm = propList();
      switch (tCmd) {
        case "MOVE":
          tPrm = propList("short", integer(tSprID.word[3]), "short", integer(tSprID.word[4]));
          break;
        case "GOAWAY":
          tPrm = propList();
          break;
        default:
          error(this, `Is this command valid: ${tCmd}?`, Symbol.for("eventProcRoom"), Symbol.for("minor"));
          break;
      }
      return this.getComponent().getRoomConnection().send(tCmd, tPrm);
    }
    let tDragging = 0;
    if ((tEvent == Symbol.for("mouseDown")) || tDragging) {
      switch (this.pClickAction) {
        case "moveHuman":
          if (tParam != "object_selection") {
            this.pSelectedObj = EMPTY;
            executeMessage(Symbol.for("hideObjectInfo"));
            this.hideArrowHiliter();
          }
          let tloc = this.getGeometry().getWorldCoordinate(the.mouseH, the.mouseV);
          if (listp(tloc)) {
            return this.getComponent().getRoomConnection().send("MOVE", propList("short", tloc[1], "short", tloc[2]));
          }
          break;
        case "moveActive":
          let tloc = getObject(this.pObjMoverID).getProperty(Symbol.for("loc"));
          if (!tloc) {
            return 0;
          }
          let tObj = this.getComponent().getActiveObject(this.pSelectedObj);
          if (tObj == 0) {
            return error(this, `Invalid active object: ${this.pSelectedObj}`, Symbol.for("eventProcRoom"), Symbol.for("major"));
          }
          this.getComponent().getRoomConnection().send("MOVESTUFF", `${this.pSelectedObj} ${tloc[1]} ${tloc[2]} ${tObj.pDirection[1]}`);
          this.stopObjectMover();
          break;
        case "placeActive":
          if (getObject(Symbol.for("session")).GET("room_controller") || getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_any_room_controller")) {
            let tCanPlace = 1;
          }
          if (!tCanPlace) {
            return 0;
          }
          if (getObject(Symbol.for("session")).GET("room_owner")) {
            this.placeFurniture(this.pSelectedObj, this.pSelectedType);
            executeMessage(Symbol.for("hideObjectInfo"));
            this.stopObjectMover();
          } else {
            if (!getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_trade")) {
              return 0;
            }
            let tloc = getObject(this.pObjMoverID).getProperty(Symbol.for("loc"));
            if (!tloc) {
              return 0;
            }
            if (this.showConfirmPlace()) {
              this.getObjectMover().pause();
            }
          }
          break;
        case "placeItem":
          if (getObject(Symbol.for("session")).GET("room_controller") || getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_any_room_controller")) {
            let tCanPlace = 1;
          }
          if (!tCanPlace) {
            return 0;
          }
          if (getObject(Symbol.for("session")).GET("room_owner")) {
            if (this.placeFurniture(this.pSelectedObj, this.pSelectedType)) {
              executeMessage(Symbol.for("hideObjectInfo"));
              this.stopObjectMover();
            }
          } else {
            if (!getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_trade")) {
              return 0;
            }
            let tloc = getObject(this.pObjMoverID).getProperty(Symbol.for("itemLocStr"));
            if (!tloc) {
              return 0;
            }
            if (this.showConfirmPlace()) {
              this.getObjectMover().pause();
            }
          }
          break;
        case "tradeItem":
          break;
        default:
          return error(this, `Unsupported click action: ${this.pClickAction}`, Symbol.for("eventProcRoom"), Symbol.for("minor"));
      }
    }
  }

  eventProcUserObj(tEvent, tSprID, tParam) {
    let tObject = this.getComponent().getUserObject(tSprID);
    if (tObject == 0) {
      error(this, `User object not found: ${tSprID}`, Symbol.for("eventProcUserObj"), Symbol.for("major"));
      return this.eventProcRoom(tEvent, "floor");
    }
    if (the.shiftDown && the.optionDown) {
      return this.outputObjectInfo(tSprID, "user", the.rollover);
    }
    if ((this.pClickAction == "moveActive") || (this.pClickAction == "placeActive")) {
      return this.eventProcRoom(tEvent, tSprID, tParam);
    }
    if ((this.pClickAction == "moveItem") || (this.pClickAction == "placeItem")) {
      return this.eventProcRoom(tEvent, tSprID, tParam);
    }
    if (tObject.select()) {
      if (tObject.getClass() == "user") {
        executeMessage(Symbol.for("userClicked"), tObject.getName());
      }
      if ((tObject.getClass() == "user") && (tEvent == Symbol.for("mouseDown"))) {
        executeMessage(Symbol.for("tutorial_userClicked"));
      }
      this.pSelectedObj = tSprID;
      this.pSelectedType = tObject.getClass();
      if (tParam != Symbol.for("userEnters")) {
        executeMessage(Symbol.for("showObjectInfo"), this.pSelectedType);
      }
      this.showArrowHiliter(tSprID);
      let tloc = tObject.getLocation();
      if (tParam == Symbol.for("userEnters")) {
        tloc[1] = tloc[1] + 4;
      }
      if ((tObject != this.getComponent().getOwnUser()) || (tObject.getProperty(Symbol.for("moving")) || (tParam == Symbol.for("userEnters")))) {
        this.getComponent().getRoomConnection().send("LOOKTO", `${tloc[1]} ${tloc[2]}`);
      }
    } else {
      this.pSelectedObj = EMPTY;
      this.pSelectedType = EMPTY;
      executeMessage(Symbol.for("hideObjectInfo"));
      this.hideArrowHiliter();
    }
    return 1;
  }

  eventProcActiveObj(tEvent, tSprID, tParam) {
    if (!this.validateEvent(tEvent, tSprID, the.mouseLoc)) {
      return 0;
    }
    if (this.getComponent().getOwnUser() == 0) {
      return 1;
    }
    let tObject = this.getComponent().getActiveObject(tSprID);
    if (the.shiftDown) {
      return this.outputObjectInfo(tSprID, "active", the.rollover);
    }
    if ((this.pClickAction == "moveActive") || (this.pClickAction == "placeActive")) {
      return this.eventProcRoom(tEvent, tSprID, tParam);
    }
    if ((this.pClickAction == "moveItem") || (this.pClickAction == "placeItem")) {
      return this.eventProcRoom(tEvent, tSprID, tParam);
    }
    if (tObject == 0) {
      this.pSelectedObj = EMPTY;
      this.pSelectedType = EMPTY;
      executeMessage(Symbol.for("hideObjectInfo"));
      this.hideArrowHiliter();
      return error(this, `Active object not found: ${tSprID}`, Symbol.for("eventProcActiveObj"), Symbol.for("major"));
    }
    if (this.getComponent().getRoomData().type == Symbol.for("private")) {
      this.pSelectedObj = tSprID;
      this.pSelectedType = "active";
      executeMessage(Symbol.for("showObjectInfo"), this.pSelectedType);
      this.hideArrowHiliter();
    }
    let tIsController = getObject(Symbol.for("session")).GET("room_controller");
    if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_any_room_controller")) {
      tIsController = 1;
    }
    if (the.optionDown && tIsController) {
      return this.startObjectMover(this.pSelectedObj);
    }
    let tTemp = call(Symbol.for("select"), tObject);
    if (tTemp) {
      return 1;
    } else {
      return this.eventProcRoom(tEvent, "floor", "object_selection");
    }
  }

  eventProcPassiveObj(tEvent, tSprID, tParam) {
    if (!this.validateEvent(tEvent, tSprID, the.mouseLoc)) {
      return 0;
    }
    let tObject = this.getComponent().getPassiveObject(tSprID);
    if (the.shiftDown) {
      return this.outputObjectInfo(tSprID, "passive", the.rollover);
    }
    if ((this.pClickAction == "moveActive") || (this.pClickAction == "placeActive")) {
      return this.eventProcRoom(tEvent, tSprID, tParam);
    }
    if ((this.pClickAction == "moveItem") || (this.pClickAction == "placeItem")) {
      return this.eventProcRoom(tEvent, tSprID, tParam);
    }
    if (tObject == 0) {
      return this.eventProcRoom(tEvent, tSprID, tParam);
    }
    if (!tObject.select()) {
      return this.eventProcRoom(tEvent, tSprID, tParam);
    }
  }

  eventProcItemObj(tEvent, tSprID, tParam) {
    if (!this.validateEvent(tEvent, tSprID, the.mouseLoc)) {
      return 0;
    }
    if (the.shiftDown) {
      if (this.getComponent().itemObjectExists(tSprID)) {
        this.outputObjectInfo(tSprID, "item", the.rollover);
      }
    }
    if ((this.pClickAction == "moveActive") || (this.pClickAction == "placeActive")) {
      return this.eventProcRoom(tEvent, tSprID, tParam);
    }
    if ((this.pClickAction == "moveItem") || (this.pClickAction == "placeItem")) {
      return this.eventProcRoom(tEvent, tSprID, tParam);
    }
    if (!this.getComponent().itemObjectExists(tSprID)) {
      this.pSelectedObj = EMPTY;
      this.pSelectedType = EMPTY;
      executeMessage(Symbol.for("hideObjectInfo"));
      this.hideArrowHiliter();
      return error(this, `Item object not found: ${tSprID}`, Symbol.for("eventProcItemObj"), Symbol.for("major"));
    }
    let tObject = this.getComponent().getItemObject(tSprID);
    if (tObject.select()) {
      this.pSelectedObj = tSprID;
      this.pSelectedType = "item";
      executeMessage(Symbol.for("showObjectInfo"), this.pSelectedType);
      this.hideArrowHiliter();
    } else {
      this.pSelectedObj = tSprID;
      this.pSelectedType = "item";
      executeMessage(Symbol.for("showObjectInfo"), this.pSelectedType);
      this.hideArrowHiliter();
    }
    if (!(getObject(Symbol.for("session")).GET("room_controller") || getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_any_room_controller")) || (the.shiftDown && the.optionDown)) {
      if (tObject.hasURL()) {
        executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
        openNetPage(tObject.GetUrl());
        let tAdSystem = this.getComponent().getAd();
        if (tAdSystem != 0) {
          tAdSystem.eventProc(Symbol.for("mouseLeave"), tSprID, tObject.GetUrl());
        }
      }
    }
  }

  eventProcDelConfirm(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "habbo_decision_ok":
        this.hideConfirmDelete();
        switch (this.pDeleteType) {
          case "active":
            this.getComponent().getRoomConnection().send("REMOVESTUFF", this.pDeleteObjID);
            break;
          case "item":
            this.getComponent().getRoomConnection().send("REMOVEITEM", this.pDeleteObjID);
            break;
        }
        executeMessage(Symbol.for("hideObjectInfo"));
        this.pDeleteObjID = EMPTY;
        this.pDeleteType = EMPTY;
        break;
      case "habbo_decision_cancel":
      case "close":
        this.hideConfirmDelete();
        this.pDeleteObjID = EMPTY;
        break;
    }
  }

  eventProcPlcConfirm(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "habbo_decision_ok":
        this.placeFurniture(this.pSelectedObj, this.pSelectedType);
        this.hideConfirmPlace();
        executeMessage(Symbol.for("hideObjectInfo"));
        this.stopObjectMover();
        break;
      case "habbo_decision_cancel":
      case "close":
        this.getObjectMover().resume();
        this.hideConfirmPlace();
        break;
    }
  }

  eventProcBanner(tEvent, tSprID, tParam) {
    if (tEvent != Symbol.for("mouseUp")) {
      return 0;
    }
    switch (tSprID) {
      case "room_banner_link":
        if (this.pBannerLink != 0) {
          if (connectionExists(this.pInfoConnID) && getObject(Symbol.for("session")).exists("ad_id")) {
            getConnection(this.pInfoConnID).send("ADCLICK", getObject(Symbol.for("session")).GET("ad_id"));
          }
          executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          openNetPage(this.pBannerLink);
        }
        break;
      case "room_cancel":
        this.getComponent().getRoomConnection().send("QUIT");
        this.getComponent().removeEnterRoomAlert();
        executeMessage(Symbol.for("leaveRoom"));
        break;
      case "queue_change":
        if (connectionExists(this.pInfoConnID)) {
          let tSelected = 2;
          if (this.pQueueCollection.count() >= tSelected) {
            let tTarget = this.pQueueCollection[tSelected][Symbol.for("target")];
            getConnection(this.pInfoConnID).send("ROOM_QUEUE_CHANGE", propList("integer", tTarget));
          }
        }
        break;
    }
    return 1;
  }

  outputObjectInfo(tSprID, tObjType, tSprNum) {
    if (sprite(tSprNum).spriteNum == 0) {
      return 0;
    }
    let tObj = 0;
    switch (tObjType) {
      case "user":
        tObj = this.getComponent().getUserObject(tSprID);
        break;
      case "active":
        tObj = this.getComponent().getActiveObject(tSprID);
        break;
      case "passive":
        tObj = this.getComponent().getPassiveObject(tSprID);
        break;
      case "item":
        tObj = this.getComponent().getItemObject(tSprID);
        break;
    }
    if (tObj == 0) {
      return 0;
    }
    let tInfo = tObj.getInfo();
    let tdata = propList();
    tdata[Symbol.for("id")] = tObj.getID();
    tdata[Symbol.for("class")] = tInfo[Symbol.for("class")];
    tdata[Symbol.for("x")] = tObj.pLocX;
    tdata[Symbol.for("y")] = tObj.pLocY;
    tdata[Symbol.for("h")] = tObj.pLocH;
    tdata[Symbol.for("Dir")] = tObj.pDirection;
    tdata[Symbol.for("locH")] = sprite(tSprNum).locH;
    tdata[Symbol.for("locV")] = sprite(tSprNum).locV;
    tdata[Symbol.for("locZ")] = EMPTY;
    let tSprList = tObj.getSprites();
    for (const tSpr of tSprList) {
      tdata[Symbol.for("locZ")] = `${tdata[Symbol.for("locZ")]}${tSpr.locZ} ${EMPTY}`;
    }
    tdata[Symbol.for("sprNumList")] = EMPTY;
    for (const tSpr of tSprList) {
      tdata[Symbol.for("sprNumList")] = `${tdata[Symbol.for("sprNumList")]}${tSpr.spriteNum} ${EMPTY}`;
    }
    put("- - - - - - - - - - - - - - - - - - - - - -");
    put(`ID            ${tdata[Symbol.for("id")]}`);
    put(`Class         ${tdata[Symbol.for("class")]}`);
    put(`Member        ${sprite(tSprNum).member.name}`);
    put(`Cast          ${castLib(sprite(tSprNum).castLibNum).name}`);
    put(`World X       ${tdata[Symbol.for("x")]}`);
    put(`World Y       ${tdata[Symbol.for("y")]}`);
    put(`World H       ${tdata[Symbol.for("h")]}`);
    put(`Dir           ${tdata[Symbol.for("Dir")]}`);
    put(`Scr X         ${tdata[Symbol.for("locH")]}`);
    put(`Scr Y         ${tdata[Symbol.for("locV")]}`);
    put(`Scr Z         ${tdata[Symbol.for("locZ")]}`);
    put(`This sprite   ${tSprNum}`);
    put(`All sprites   ${tdata[Symbol.for("sprNumList")]}`);
    put(`Object info   ${tObj}`);
    put("- - - - - - - - - - - - - - - - - - - - - -");
  }

  null() {
  }
}
