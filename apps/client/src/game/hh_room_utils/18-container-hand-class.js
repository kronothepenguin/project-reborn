export default class {
  pItemList;
  pTotalCount;
  pHandVisID;
  pAnimMode;
  pAnimLocs;
  pAnimFrm;
  pAppendFlag;
  pHandButtonsWnd;
  pNextActive;
  pPrevActive;
  pDragging;
  pDragPos;
  pIconPlaceholderName;

  construct() {
    this.pItemList = propList();
    this.pTotalCount = 0;
    this.pHandVisID = "Hand_visualizer";
    this.pAnimMode = Symbol.for("open");
    this.pAnimLocs = list(list(-54, 27), list(-42, 21), list(-36, 18), list(-28, 14), list(-22, 11), list(-18, 9), list(-12, 6), list(-10, 5), list(-8, 4));
    this.pAnimFrm = 1;
    this.pAppendFlag = 0;
    this.pHandButtonsWnd = "habbo_hand_buttons";
    this.pNextActive = 1;
    this.pPrevActive = 1;
    this.pIconPlaceholderName = "icon_placeholder";
    registerMessage(Symbol.for("roomReady"), this.getID(), Symbol.for("checkContainerOnRoomForward"));
    registerMessage(Symbol.for("requestContainerOpen"), this.getID(), Symbol.for("showContainerItems"));
    return 1;
  }

  deconstruct() {
    for (let i = 1; i <= 9; i++) {
      if (memberExists(`handcontainer_${i}`)) {
        removeMember(`handcontainer_${i}`);
      }
    }
    unregisterMessage(Symbol.for("roomReady"), this.getID());
    unregisterMessage(Symbol.for("requestContainerOpen"), this.getID());
    removeWindow(this.pHandButtonsWnd);
    removeUpdate(this.getID());
    if (visualizerExists(this.pHandVisID)) {
      removeVisualizer(this.pHandVisID);
    }
    this.pItemList = propList();
    this.pTotalCount = 0;
    return 1;
  }

  open(tStripInfo) {
    if (tStripInfo) {
      if (visualizerExists(this.pHandVisID)) {
        return 0;
      }
      if (!createVisualizer(this.pHandVisID, "habbo_hand.visual")) {
        return 0;
      }
      let tScreenWidth = the.stageRight - the.stageLeft;
      let tHandVisualizer = getVisualizer(this.pHandVisID);
      tHandVisualizer.moveTo(tScreenWidth - 26, -137);
      tHandVisualizer.setProperty(Symbol.for("locZ"), -1000);
      let tSprList = tHandVisualizer.getProperty(Symbol.for("spriteList"));
      call(Symbol.for("registerProcedure"), tSprList, Symbol.for("eventProcContainer"), this.getID(), Symbol.for("mouseDown"));
      call(Symbol.for("registerProcedure"), tSprList, Symbol.for("eventProcContainer"), this.getID(), Symbol.for("mouseUp"));
      call(Symbol.for("registerProcedure"), tSprList, Symbol.for("eventProcContainer"), this.getID(), Symbol.for("mouseUpOutSide"));
      this.pAnimMode = Symbol.for("open");
      this.pAnimFrm = 1;
      receiveUpdate(this.getID());
    } else {
      let tConnection = getThread(Symbol.for("room")).getComponent().getRoomConnection();
      if (tConnection != 0) {
        tConnection.send("GETSTRIP", "new");
      }
    }
    executeMessage(Symbol.for("tutorial_hand_opened"));
    return 1;
  }

  close() {
    if (!visualizerExists(this.pHandVisID)) {
      return 0;
    }
    this.pAnimMode = Symbol.for("close");
    removeWindow(this.pHandButtonsWnd);
    receiveUpdate(this.getID());
    return 1;
  }

  openClose() {
    if (visualizerExists(this.pHandVisID)) {
      return this.close();
    } else {
      return this.open();
    }
  }

  checkContainerOnRoomForward() {
    let tForwardVarId = "forward.open.hand";
    if (variableExists(tForwardVarId)) {
      if (getVariable(tForwardVarId) == 1) {
        this.open();
        setVariable(tForwardVarId, 0);
      }
    }
  }

  Refresh() {
    this.hideContainerItems();
    this.showContainerItems();
    return 1;
  }

  updateStripItems(tList) {
    if (this.pAppendFlag) {
      this.pAppendFlag = 0;
    } else {
      this.pItemList = propList();
    }
    for (const tItem of tList) {
      this.createStripItem(tItem);
    }
    return 1;
  }

  appendStripItem(tdata) {
    if (this.pItemList.count == 0) {
      this.pAppendFlag = 1;
      let tConnection = getThread(Symbol.for("room")).getComponent().getRoomConnection();
      if (tConnection != 0) {
        tConnection.send("GETSTRIP", "new");
      }
    }
    return this.createStripItem(tdata);
  }

  createStripItem(tdata) {
    let tIconClassStr = EMPTY;
    switch (tdata[Symbol.for("striptype")]) {
      case "active":
        if (offset("*", tdata[Symbol.for("class")]) > 0) {
          tIconClassStr = tdata[Symbol.for("class")].char[`1..${offset("*", tdata[Symbol.for("class")]) - 1}`];
        } else {
          tIconClassStr = tdata[Symbol.for("class")];
        }
        break;
      case "item":
        tIconClassStr = EMPTY;
        if (tdata[Symbol.for("class")] == "poster") {
          tIconClassStr = `poster ${tdata[Symbol.for("props")]}`;
        } else {
          if (tdata[Symbol.for("class")] contains "post.it") {
            let tPostnums = integer(value(tdata[Symbol.for("props")]) / (20.0 / 6.0));
            if (tPostnums > 6) {
              tPostnums = 6;
            }
            if (tPostnums < 1) {
              tPostnums = 1;
            }
            tdata[Symbol.for("member")] = `${tdata[Symbol.for("class")]}_${tPostnums}_small`;
          } else {
            if (tdata[Symbol.for("class")] == "wallpaper") {
              tdata[Symbol.for("member")] = "wallpaper_small";
            } else {
              if (tdata[Symbol.for("class")] == "floor") {
                tdata[Symbol.for("member")] = "floor_small";
              } else {
                if (tdata[Symbol.for("class")] == "landscape") {
                  tdata[Symbol.for("member")] = "landscape_small";
                } else {
                  if (memberExists(`${tdata[Symbol.for("class")]}_small`)) {
                    tIconClassStr = tdata[Symbol.for("class")];
                  } else {
                    tIconClassStr = tdata[Symbol.for("class")];
                  }
                }
              }
            }
          }
        }
        break;
      default:
        error(this, `Unknown strip item type: ${tdata[Symbol.for("striptype")]}`, Symbol.for("createStripItem"), Symbol.for("major"));
        tdata[Symbol.for("member")] = "room_object_placeholder";
    }
    if (!voidp(tdata[Symbol.for("member")])) {
      nothing();
    } else {
      if (memberExists(`${tIconClassStr}_small`)) {
        tdata[Symbol.for("member")] = `${tIconClassStr}_small`;
      } else {
        if (memberExists(`${tdata[Symbol.for("class")]}_small`)) {
          tdata[Symbol.for("member")] = `${tdata[Symbol.for("class")]}_small`;
        } else {
          tdata[Symbol.for("member")] = this.pIconPlaceholderName;
          tdata[Symbol.for("truemember")] = `${tIconClassStr}_small`;
          tdata[Symbol.for("downloadLocked")] = 1;
          let tDownloadIdName = tIconClassStr;
          let tDynThread = getThread(Symbol.for("dynamicdownloader"));
          if (tDynThread == 0) {
            error(this, `Icon member not found and no dynamic download possibility: ${tdata[Symbol.for("member")]}`, Symbol.for("createStripItem"), Symbol.for("major"));
          } else {
            let tDynComponent = tDynThread.getComponent();
            let tRoomSizePrefix = EMPTY;
            let tRoomThread = getThread(Symbol.for("room"));
            if (tRoomThread != 0) {
              let tTileSize = tRoomThread.getInterface().getGeometry().getTileWidth();
              if (tTileSize == 32) {
                tRoomSizePrefix = "s_";
              }
            }
            tDownloadIdName = tRoomSizePrefix + tDownloadIdName;
            tDynComponent.downloadCastDynamically(tDownloadIdName, tdata[Symbol.for("striptype")], this.getID(), Symbol.for("stripItemDownloadCallback"), 1);
          }
        }
      }
    }
    this.pItemList[tdata[Symbol.for("stripId")]] = tdata;
    return 1;
  }

  stripItemDownloadCallback(tDownloadedClass) {
    let tIconSuffix = "_small";
    let tSmallScalePrefix = "s_";
    if (chars(tDownloadedClass, 1, tSmallScalePrefix.length) == tSmallScalePrefix) {
      tDownloadedClass = chars(tDownloadedClass, tSmallScalePrefix.length + 1, tDownloadedClass.length);
    }
    for (const tItem of this.pItemList) {
      let tTrueMem = tItem[Symbol.for("truemember")];
      if (!voidp(tTrueMem)) {
        if (chars(tTrueMem, tTrueMem.length - tIconSuffix.length + 1, tTrueMem.length) == tIconSuffix) {
          tTrueMem = chars(tTrueMem, 1, tTrueMem.length - tIconSuffix.length);
        }
        if (tTrueMem == tDownloadedClass) {
          tItem[Symbol.for("member")] = tItem[Symbol.for("truemember")];
          tItem[Symbol.for("downloadLocked")] = 0;
        }
      }
    }
    this.showContainerItems();
  }

  removeStripItem(tID) {
    return this.pItemList.deleteProp(tID);
  }

  getStripItem(tID) {
    if (voidp(tID)) {
      tID = EMPTY;
    }
    if (tID == Symbol.for("list")) {
      return this.pItemList;
    }
    if (voidp(this.pItemList[tID])) {
      return 0;
    }
    return this.pItemList[tID];
  }

  stripItemExists(tID) {
    return !voidp(this.pItemList[tID]);
  }

  setStripItemCount(tCount) {
    if (integerp(tCount)) {
      this.pTotalCount = tCount;
    }
    if (visualizerExists(this.pHandVisID)) {
      if (this.pTotalCount > this.pItemList.count) {
        this.setHandButtonsVisible();
      }
    }
    return 1;
  }

  placeItemToRoom(tID) {
    if (getThread(Symbol.for("room")).getComponent().getRoomID() != "private") {
      return 0;
    }
    if (!this.stripItemExists(tID)) {
      return error(this, `Attempted to access unexisting stripitem: ${tID}`, Symbol.for("placeItemToRoom"), Symbol.for("major"));
    }
    let tdata = this.getStripItem(tID).duplicate();
    tdata[Symbol.for("x")] = 0;
    tdata[Symbol.for("y")] = 0;
    tdata[Symbol.for("h")] = 0.0;
    if (!voidp(tdata[Symbol.for("props")])) {
      tdata[Symbol.for("type")] = tdata[Symbol.for("props")];
    }
    if (tdata[Symbol.for("striptype")] == "active") {
      tdata[Symbol.for("props")] = propList();
      tdata[Symbol.for("direction")] = list(0, 0, 0);
      tdata[Symbol.for("altitude")] = 100.0;
      getThread(Symbol.for("room")).getComponent().createActiveObject(tdata);
      if (getThread(Symbol.for("room")).getComponent().getActiveObject(tdata[Symbol.for("id")]) == 0) {
        return 0;
      }
      getThread(Symbol.for("room")).getComponent().getActiveObject(tdata[Symbol.for("id")]).setaProp(Symbol.for("stripId"), tdata[Symbol.for("stripId")]);
      removeStripItem(this, tID);
      return 1;
    } else {
      if (tdata[Symbol.for("striptype")] == "item") {
        switch (tdata[Symbol.for("class")]) {
          case "poster":
          case "post.it":
          case "post.it.vd":
          case "photo":
            if (tdata[Symbol.for("class")] == "post.it") {
              tdata[Symbol.for("type")] = "#ffff33";
            }
            tdata[Symbol.for("direction")] = "leftwall";
            if (!getThread(Symbol.for("room")).getComponent().createItemObject(tdata)) {
              return 0;
            }
            getThread(Symbol.for("room")).getComponent().getItemObject(tdata[Symbol.for("id")]).setaProp(Symbol.for("stripId"), tdata[Symbol.for("stripId")]);
            if (!(tdata[Symbol.for("class")] contains "post.it")) {
              this.removeStripItem(tID);
            }
            return 1;
          case "floor":
          case "wallpaper":
          case "landscape":
            if (!threadExists(Symbol.for("room"))) {
              return error(this, "Room thread not found", Symbol.for("placeItemToRoom"), Symbol.for("major"));
            }
            let tRoomComp = getThread(Symbol.for("room")).getComponent();
            if (tdata[Symbol.for("class")] == "landscape") {
              let tPrivRoomEngine = tRoomComp.getRoomPrg();
              if (tPrivRoomEngine.getWallMaskCount() == 0) {
                executeMessage(Symbol.for("alert"), propList("Msg", getText("landscape_no_windows")));
              }
            }
            tRoomComp.getRoomConnection().send("FLATPROPBYITEM", `${tdata[Symbol.for("class")]}/${tdata[Symbol.for("stripId")]}`);
            this.removeStripItem(tID);
            return 0;
          case "Chess":
            tdata[Symbol.for("direction")] = list(0, 0, 0);
            getThread(Symbol.for("room")).getComponent().createItemObject(tdata);
            getThread(Symbol.for("room")).getComponent().getItemObject(tdata[Symbol.for("id")]).setaProp(Symbol.for("stripId"), tdata[Symbol.for("stripId")]);
            this.removeStripItem(tID);
            return 1;
          default:
            tdata[Symbol.for("direction")] = "leftwall";
            if (!getThread(Symbol.for("room")).getComponent().createItemObject(tdata)) {
              return 0;
            }
            getThread(Symbol.for("room")).getComponent().getItemObject(tdata[Symbol.for("id")]).setaProp(Symbol.for("stripId"), tdata[Symbol.for("stripId")]);
            this.removeStripItem(tID);
            return 1;
        }
      }
    }
  }

  getVisual() {
    return getVisualizer(this.pHandVisID);
  }

  print() {
    for (const tItem of this.pItemList) {
      put tItem;
    }
  }

  setHandButton(tButtonID, tActive) {
    if (voidp(tButtonID)) {
      return 0;
    }
    switch (tButtonID) {
      case "next":
        this.pNextActive = tActive;
        break;
      case "prev":
        this.pPrevActive = tActive;
        break;
      default:
        return 0;
    }
  }

  update() {
    if (!visualizerExists(this.pHandVisID)) {
      return removeUpdate(this.getID());
    }
    let tHand = getVisualizer(this.pHandVisID);
    let tLocModX = this.pAnimLocs[this.pAnimFrm][1];
    let tLocModY = this.pAnimLocs[this.pAnimFrm][2];
    if (this.pAnimMode == Symbol.for("open")) {
      this.pAnimFrm = this.pAnimFrm + 1;
      tHand.moveBy(tLocModX, tLocModY);
      if (this.pAnimFrm > this.pAnimLocs.count) {
        this.pAnimFrm = this.pAnimLocs.count;
      }
      if (this.pAnimFrm == 4) {
        tHand.getSprById("room_hand").setMember(member(getmemnum("room_hand_2")));
        tHand.getSprById("room_hand_mask").blend = 100;
      } else {
        if (this.pAnimFrm == 6) {
          this.showContainerItems();
          tHand.getSprById("room_hand").setMember(member(getmemnum("room_hand_3")));
          tHand.getSprById("room_hand_mask").visible = 0;
        }
      }
      if (this.pAnimFrm == this.pAnimLocs.count) {
        if (this.pTotalCount > this.pItemList.count) {
          this.setHandButtonsVisible();
        }
        removeUpdate(this.getID());
      }
    } else {
      this.pAnimFrm = this.pAnimFrm - 1;
      if (this.pAnimFrm < 1) {
        this.pAnimFrm = 1;
      }
      tHand.moveBy(-tLocModX, -tLocModY);
      if (this.pAnimFrm == 4) {
        tHand.getSprById("room_hand").setMember(member(getmemnum("room_hand_1")));
        tHand.getSprById("room_hand_mask").visible = 0;
        this.hideContainerItems();
      } else {
        if (this.pAnimFrm == 6) {
          tHand.getSprById("room_hand").setMember(member(getmemnum("room_hand_2")));
          tHand.getSprById("room_hand_mask").visible = 1;
        }
      }
      if (this.pAnimFrm == 1) {
        removeVisualizer(this.pHandVisID);
        removeUpdate(this.getID());
      }
    }
  }

  showContainerItems() {
    if (this.pAnimMode == Symbol.for("close")) {
      return 0;
    }
    if (!visualizerExists(this.pHandVisID)) {
      return 0;
    }
    let tHand = getVisualizer(this.pHandVisID);
    let tList = this.getStripItem(Symbol.for("list"));
    let tCount = tList.count;
    let tAddRecyclerTags = 0;
    let tRecyclerThread = getThread(Symbol.for("recycler"));
    if (!(tRecyclerThread == 0) && memberExists("recycler_icon_tag")) {
      if (tRecyclerThread.getComponent().isRecyclerOpenAndVisible()) {
        tAddRecyclerTags = 1;
      }
    }
    for (let i = 1; i <= 9; i++) {
      if (getmemnum(`handcontainer_${i}`) < 1) {
        createMember(`handcontainer_${i}`, Symbol.for("bitmap"));
      }
      let tMem = getmemnum(`handcontainer_${i}`);
      let tVisible = 1;
      if (i <= tCount) {
        let tItem = tList[i];
        let tPreviewImage = getObject("Preview_renderer").renderPreviewImage(tItem[Symbol.for("member")], VOID, tItem[Symbol.for("colors")], tItem[Symbol.for("class")]);
        let tTempImage = image(tPreviewImage.width, tPreviewImage.height, 32);
        tTempImage.copyPixels(tPreviewImage, tPreviewImage.rect, tPreviewImage.rect);
        if (voidp(tPreviewImage)) {
          error(this, "Preview image was void!", Symbol.for("showContainerItems"), Symbol.for("major"));
          return 0;
        }
        if (tAddRecyclerTags && (integer(tItem[Symbol.for("isRecyclable")]) == 1)) {
          let tRecyclableTagImg = getMember("recycler_icon_tag").image;
          let tRect = tRecyclableTagImg.rect;
          tTempImage.copyPixels(tRecyclableTagImg, tRect, tRect, propList("ink", 36));
        }
        member(tMem).image = tTempImage;
        let tInTrade = getThread(Symbol.for("room")).getInterface().getSafeTrader().isUnderTrade(this.pItemList.getPropAt(i));
        let tInRecycler = getThread(Symbol.for("recycler")).getComponent().isFurniInRecycler(this.pItemList.getPropAt(i));
        tVisible = !(tInTrade || tInRecycler);
        if (tVisible) {
          if (!(tItem[Symbol.for("class")] contains "post.it")) {
            tVisible = !(getThread(Symbol.for("room")).getInterface().getObjectMover().pClientID == this.pItemList.getPropAt(i));
          }
        }
      } else {
        tMem = member(getmemnum("room_object_placeholder_sd"));
        tVisible = 0;
      }
      let tSpr = tHand.getSprById(`room_hand_item_${i}`);
      if (!voidp(tSpr)) {
        tSpr.setMember(tMem);
        tSpr.blend = 100;
        tSpr.visible = tVisible;
        tSpr.ink = 8;
      }
    }
    this.setHandButtonsVisible();
    return 1;
  }

  hideContainerItems() {
    if (!visualizerExists(this.pHandVisID)) {
      return 0;
    }
    let tHand = getVisualizer(this.pHandVisID);
    for (let i = 1; i <= 9; i++) {
      let tSpr = tHand.getSprById(`room_hand_item_${i}`);
      if (!voidp(tSpr)) {
        tSpr.setMember(member(getmemnum("room_object_placeholder_sd")));
        tSpr.visible = 0;
      }
    }
    return 1;
  }

  eventProcContainer(tEvent, tSprID, tParam) {
    if (tEvent != Symbol.for("mouseUp")) {
      return 0;
    }
    switch (getThread(Symbol.for("room")).getInterface().getProperty(Symbol.for("clickAction"))) {
      case "placeActive":
      case "placeItem":
        getThread(Symbol.for("room")).getInterface().stopObjectMover();
        return getThread(Symbol.for("room")).getComponent().getRoomConnection().send("GETSTRIP", "update");
      case "moveActive":
      case "moveItem":
        if (!getObject(Symbol.for("session")).GET("room_owner")) {
          return 0;
        }
        let ttype = propList("active", "stuff", "item", "item")[getThread(Symbol.for("room")).getInterface().pSelectedType];
        let tObj = getThread(Symbol.for("room")).getInterface().pSelectedObj;
        getThread(Symbol.for("room")).getInterface().stopObjectMover();
        return getThread(Symbol.for("room")).getComponent().getRoomConnection().send("ADDSTRIPITEM", `new ${ttype} ${tObj}`);
    }
    if (tSprID contains "room_hand_item") {
      let tItemNum = integer(tSprID.char[16]);
      let tStripList = this.getStripItem(Symbol.for("list"));
      if (tItemNum > tStripList.count) {
        return error(this, "Attempted to place unexisting strip item!", Symbol.for("eventProcContainer"), Symbol.for("major"));
      }
      let tdata = tStripList[tItemNum];
      let tItemID = tdata[Symbol.for("stripId")];
      if (tdata[Symbol.for("downloadLocked")]) {
        return 0;
      }
      if (getThread(Symbol.for("room")).getInterface().getSafeTrader().isUnderTrade(tItemID)) {
        return 0;
      }
      if (variableExists(`handitem.${tdata[Symbol.for("class")]}.select_handler`)) {
        let tSpecialHandler = symbol(getVariable(`handitem.${tdata[Symbol.for("class")]}.select_handler`));
        if (objectExists(tSpecialHandler)) {
          call(Symbol.for("handItemSelect"), getObject(tSpecialHandler), tdata);
          return;
        }
      }
      if (this.placeItemToRoom(tItemID)) {
        this.setItemPlacingMode(tdata);
      } else {
        getThread(Symbol.for("room")).getInterface().pSelectedObj = EMPTY;
        getThread(Symbol.for("room")).getInterface().pSelectedType = EMPTY;
        getThread(Symbol.for("room")).getInterface().setProperty(Symbol.for("clickAction"), "moveHuman");
      }
      this.Refresh();
    }
  }

  startItemPlacing(tdata) {
    if (this.placeItemToRoom(tdata[Symbol.for("stripId")])) {
      this.setItemPlacingMode(tdata);
      this.Refresh();
    }
  }

  setItemPlacingMode(tdata) {
    let tRoomInterface = getThread(Symbol.for("room")).getInterface();
    tRoomInterface.pSelectedObj = tdata[Symbol.for("id")];
    tRoomInterface.pSelectedType = tdata[Symbol.for("striptype")];
    if (tdata[Symbol.for("striptype")] == "active") {
      tRoomInterface.startObjectMover(tdata[Symbol.for("id")], tdata[Symbol.for("stripId")], tdata);
      tRoomInterface.setProperty(Symbol.for("clickAction"), "placeActive");
    } else {
      if (tdata[Symbol.for("striptype")] == "item") {
        tRoomInterface.startObjectMover(tdata[Symbol.for("id")], tdata[Symbol.for("stripId")], tdata);
        tRoomInterface.setProperty(Symbol.for("clickAction"), "placeItem");
      }
    }
  }

  setHandButtonsVisible(tVisible) {
    if (voidp(tVisible)) {
      tVisible = 1;
    }
    if (!windowExists(this.pHandButtonsWnd)) {
      if (!createWindow(this.pHandButtonsWnd, "habbo_hand_buttons.window")) {
        return 0;
      }
    }
    let tWndObj = getWindow(this.pHandButtonsWnd);
    if (!tWndObj.elementExists("habbo_hand_next") || !tWndObj.elementExists("habbo_hand_next")) {
      return 0;
    }
    if (tVisible) {
      tWndObj.setProperty(Symbol.for("visible"), 1);
      let tStageRight = the.stageRight - the.stageLeft;
      let tTopOffset = 5;
      tWndObj.moveTo(tStageRight - tWndObj.getProperty(Symbol.for("width")) - 5, tTopOffset);
      if (this.pNextActive) {
        tWndObj.getElement("habbo_hand_next").Activate();
      } else {
        tWndObj.getElement("habbo_hand_next").deactivate();
      }
      if (this.pPrevActive) {
        tWndObj.getElement("habbo_hand_prev").Activate();
      } else {
        tWndObj.getElement("habbo_hand_prev").deactivate();
      }
      tWndObj.registerProcedure(Symbol.for("eventProcHandButtons"), this.getID());
    } else {
      tWndObj.setProperty(Symbol.for("visible"), 0);
    }
  }

  eventProcHandButtons(tEvent, tSprID, tParam) {
    if (tEvent != Symbol.for("mouseUp")) {
      return 0;
    }
    switch (tSprID) {
      case "habbo_hand_next":
        getThread(Symbol.for("room")).getComponent().getRoomConnection().send("GETSTRIP", "next");
        break;
      case "habbo_hand_prev":
        getThread(Symbol.for("room")).getComponent().getRoomConnection().send("GETSTRIP", "prev");
        break;
      case "habbo_hand_close":
        this.close();
        break;
      default:
        return 0;
    }
  }
}
