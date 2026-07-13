export default class {
  pWindowTitle;
  pOpenWindow;
  pProps;
  pGoLinkTextImg;
  pFullLinkTextImg;
  pOpenLinkTextImg;
  pHideFullLinkImages;
  pResourcesReady;
  pWriterPrivPlain;
  pWriterBackTabs;
  pWriterPlainNormLeft;
  pWriterPlainBoldLeft;
  pWriterPlainBoldCent;
  pWriterUnderNormLeft;
  pWriterPlainNormWrap;
  pCatBackImages;
  pRoomBackImages;
  pListItemHeight;
  pHistoryItemHeight;
  pRoomInfoHeight;
  pListAreaWidth;
  pBufferDepth;
  pLastWindowName;
  pDefaultPrivateRoomIcon;

  construct() {
    this.pWindowTitle = getText("navigator", "Hotel Navigator");
    this.pProps = propList();
    this.pRoomInfoHeight = 96;
    this.pListAreaWidth = 311;
    this.pListItemHeight = 18;
    this.pHistoryItemHeight = 18;
    this.pBufferDepth = 32;
    this.pOpenWindow = "nav_gr0";
    if (variableExists("navigator.default.view")) {
      const tDefView = getVariable("navigator.default.view");
      switch (tDefView) {
        case "public":
          this.pOpenWindow = "nav_pr";
          break;
        case "private":
          this.pOpenWindow = "nav_gr0";
          break;
        default:
          this.pOpenWindow = "nav_gr0";
          break;
      }
    }
    this.pDefaultPrivateRoomIcon = "nav_ico_def_gr";
    if (variableExists("navigator.private.room.default.icon")) {
      if (memberExists(getVariable("navigator.private.room.default.icon"))) {
        this.pDefaultPrivateRoomIcon = getVariable("navigator.private.room.default.icon");
      }
    }
    this.pResourcesReady = 0;
    this.pLastWindowName = EMPTY;
    return this.createImgResources();
  }

  deconstruct() {
    if (windowExists(Symbol.for("login_a"))) {
      removeWindow(Symbol.for("login_a"));
    }
    if (windowExists(Symbol.for("login_b"))) {
      removeWindow(Symbol.for("login_b"));
    }
    if (windowExists(this.pWindowTitle)) {
      removeWindow(this.pWindowTitle);
    }
    return this.removeImgResources();
  }

  getNaviView() {
    switch (this.pOpenWindow) {
      case "nav_pr":
        return Symbol.for("unit");
      case "nav_gr0":
        return Symbol.for("flat");
      case "nav_gr_own":
        return Symbol.for("own");
      case "nav_gr_src":
        return Symbol.for("src");
      case "nav_gr_fav":
        return Symbol.for("fav");
      case "nav_gr_mod":
      case "nav_gr_mod_b":
      case "nav_gr_modify_delete1":
      case "nav_gr_modify_delete2":
      case "nav_gr_modify_delete3":
      case "nav_modify_removerights":
        return Symbol.for("mod");
      default:
        return Symbol.for("none");
    }
  }

  getProperty(tProp, tView) {
    if (tView == VOID) {
      tView = this.getNaviView();
    }
    if (tView == Symbol.for("mod")) {
      tView = Symbol.for("own");
    }
    if (tView == 0) {
      return VOID;
    }
    if (this.pProps[tView] == VOID) {
      return VOID;
    }
    if (!voidp(this.pProps[tView][tProp])) {
      return this.pProps[tView][tProp];
    } else {
      return VOID;
    }
  }

  setProperty(tProp, tValue, tView) {
    if (tView == VOID) {
      tView = this.getNaviView();
    }
    if (tView == 0) {
      return 0;
    }
    if (((tView == Symbol.for("src")) || (tView == Symbol.for("own")) || (tView == Symbol.for("fav"))) && (tProp == Symbol.for("categoryId"))) {
      tValue = tView;
    }
    if (this.pProps[tView] == VOID) {
      this.pProps[tView] = propList();
    }
    this.pProps[tView][tProp] = tValue;
    return 1;
  }

  showNavigator() {
    this.getInterface().setUpdates(1);
    if (windowExists(this.pWindowTitle)) {
      getWindow(this.pWindowTitle).show();
      if (this.pOpenWindow == "nav_pr") {
        this.sendTrackingCall();
      }
    } else {
      return this.ChangeWindowView(this.pOpenWindow);
    }
    return 0;
  }

  hideNavigator(tHideOrRemove) {
    this.getInterface().setUpdates(0);
    this.getInterface().setRecomUpdates(0);
    if (voidp(tHideOrRemove)) {
      tHideOrRemove = Symbol.for("Remove");
    }
    if (windowExists(this.pWindowTitle)) {
      if (tHideOrRemove == Symbol.for("Remove")) {
        removeWindow(this.pWindowTitle);
      } else {
        getWindow(this.pWindowTitle).hide();
      }
    }
    return 1;
  }

  showhidenavigator(tHideOrRemove) {
    if (voidp(tHideOrRemove)) {
      tHideOrRemove = Symbol.for("Remove");
    }
    if (windowExists(this.pWindowTitle)) {
      if (getWindow(this.pWindowTitle).getProperty(Symbol.for("visible"))) {
        this.hideNavigator(tHideOrRemove);
      } else {
        this.showNavigator();
      }
    } else {
      this.showNavigator();
    }
  }

  isOpen() {
    if (windowExists(this.pWindowTitle)) {
      return getWindow(this.pWindowTitle).getProperty(Symbol.for("visible"));
    }
    return 0;
  }

  ChangeWindowView(tWindowName) {
    if (tWindowName == "nav_pr") {
      this.sendTrackingCall();
    }
    const tWndObj = getWindow(this.pWindowTitle);
    let tScrollOffset = 0;
    if (tWndObj != 0) {
      if ((tWindowName.contains("nav_pr")) && tWndObj.elementExists("nav_scrollbar")) {
        tScrollOffset = tWndObj.getElement("nav_scrollbar").getScrollOffset();
      }
      tWndObj.unmerge();
    } else {
      const tStageWidth = the.stageRight - the.stageLeft;
      if (!createWindow(this.pWindowTitle, "habbo_basic.window", tStageWidth - 375, 20)) {
        return error(this, "Failed to create window for Navigator!", Symbol.for("ChangeWindowView"), Symbol.for("major"));
      }
      tWndObj = getWindow(this.pWindowTitle);
      tWndObj.registerClient(this.getID());
    }
    if (!tWndObj.merge(`${tWindowName}.window`)) {
      return tWndObj.close();
    }
    this.pLastWindowName = tWindowName;
    let tPassword = 0;
    switch (tWindowName) {
      case "nav_gr_password":
      case "nav_gr_trypassword":
      case "nav_gr_passwordincorrect":
        {
          let tName = this.getComponent().getNodeProperty(this.getProperty(Symbol.for("viewedNodeId")), Symbol.for("name"));
          if (!stringp(tName)) {
            tName = EMPTY;
          }
          getWindow(this.pWindowTitle).getElement("nav_roomname_text").setText(tName);
          tPassword = 1;
          break;
        }
      case "nav_remove_rights":
        break;
      default:
        this.pOpenWindow = tWindowName;
        break;
    }
    if (tWndObj.elementExists("nav_roomlist")) {
      tWndObj.getElement("nav_roomlist").clearImage();
    }
    const tCategoryId = this.getProperty(Symbol.for("categoryId"));
    const tRoomInfoState = this.getProperty(Symbol.for("roomInfoState"));
    if (tPassword) {
      tWndObj.registerProcedure(Symbol.for("eventProcNavigatorPrivate"), this.getID(), Symbol.for("mouseDown"));
      tWndObj.registerProcedure(Symbol.for("eventProcNavigatorPrivate"), this.getID(), Symbol.for("mouseUp"));
      tWndObj.registerProcedure(Symbol.for("eventProcNavigatorPrivate"), this.getID(), Symbol.for("keyDown"));
      return 1;
    }
    const tNaviView = this.getNaviView();
    switch (tNaviView) {
      case Symbol.for("unit"):
        tWndObj.registerProcedure(Symbol.for("eventProcNavigatorPublic"), this.getID(), Symbol.for("mouseDown"));
        tWndObj.registerProcedure(Symbol.for("eventProcNavigatorPublic"), this.getID(), Symbol.for("mouseUp"));
        tWndObj.registerProcedure(Symbol.for("eventProcNavigatorPublic"), this.getID(), Symbol.for("keyDown"));
        this.getComponent().createNaviHistory(tCategoryId);
        this.updateRoomList(tCategoryId, VOID);
        if (tRoomInfoState == Symbol.for("hide")) {
          this.setProperty(Symbol.for("roomInfoState"), Symbol.for("show"));
          this.setRoomInfoArea(Symbol.for("hide"));
        } else {
          this.showNodeInfo(this.getProperty(Symbol.for("viewedNodeId")), tCategoryId);
        }
        return 1;
      case Symbol.for("flat"):
      case Symbol.for("src"):
      case Symbol.for("own"):
      case Symbol.for("fav"):
        tWndObj.registerProcedure(Symbol.for("eventProcNavigatorPrivate"), this.getID(), Symbol.for("mouseDown"));
        tWndObj.registerProcedure(Symbol.for("eventProcNavigatorPrivate"), this.getID(), Symbol.for("mouseUp"));
        tWndObj.registerProcedure(Symbol.for("eventProcNavigatorPrivate"), this.getID(), Symbol.for("keyDown"));
        if (tNaviView == Symbol.for("flat")) {
          this.getComponent().createNaviHistory(tCategoryId);
          this.updateRoomList(tCategoryId, VOID);
        } else {
          this.getComponent().updateInterface(tCategoryId);
        }
        if (tRoomInfoState == Symbol.for("hide")) {
          this.setProperty(Symbol.for("roomInfoState"), Symbol.for("show"));
          this.setRoomInfoArea(Symbol.for("hide"));
        } else {
          this.showNodeInfo(this.getProperty(Symbol.for("viewedNodeId")), tCategoryId);
        }
        return 1;
      case Symbol.for("mod"):
        tWndObj.registerProcedure(Symbol.for("eventProcNavigatorModify"), this.getID(), Symbol.for("mouseDown"));
        tWndObj.registerProcedure(Symbol.for("eventProcNavigatorModify"), this.getID(), Symbol.for("mouseUp"));
        tWndObj.registerProcedure(Symbol.for("eventProcNavigatorModify"), this.getID(), Symbol.for("keyDown"));
        if (tWndObj.elementExists("nav_choosecategory")) {
          this.prepareCategoryDropMenu(this.getProperty(Symbol.for("viewedNodeId")));
        }
        if (tWndObj.elementExists("nav_room_name")) {
          const tElem = tWndObj.getElement("nav_room_name");
          let tName = this.getComponent().getNodeProperty(this.getProperty(Symbol.for("viewedNodeId")), Symbol.for("name"));
          if (!stringp(tName)) {
            tName = EMPTY;
          }
          tElem.setText(tName);
        }
        break;
    }
    return 1;
  }

  updateRecomRoomList(tRoomList) {
    let tImage;
    if (tRoomList[Symbol.for("children")].count == 0) {
      tImage = 0;
    } else {
      tImage = this.renderRoomList(tRoomList[Symbol.for("children")]);
    }
    if (windowExists(this.pWindowTitle)) {
      const tWndObj = getWindow(this.pWindowTitle);
      if (tWndObj.elementExists("nav_recom_roomlist")) {
        const tElem = tWndObj.getElement("nav_recom_roomlist");
        if (!tImage) {
          tElem.clearImage();
        } else {
          tElem.feedImage(tImage);
        }
      }
    }
    return 1;
  }

  updateRoomList(tNodeId, tRoomList) {
    this.setLoadingCursor(0);
    let tImage;
    if (listp(tRoomList)) {
      tImage = this.renderRoomList(tRoomList);
      if (tNodeId == this.getProperty(Symbol.for("categoryId"), Symbol.for("unit"))) {
        this.setProperty(Symbol.for("cacheImg"), tImage, Symbol.for("unit"));
      }
      if (tNodeId == this.getProperty(Symbol.for("categoryId"), Symbol.for("flat"))) {
        this.setProperty(Symbol.for("cacheImg"), tImage, Symbol.for("flat"));
      }
      if ((tNodeId != this.getProperty(Symbol.for("categoryId"))) && (tNodeId != this.getNaviView())) {
        return 1;
      }
    } else {
      if ((tNodeId == this.getProperty(Symbol.for("categoryId"))) && !voidp(this.getProperty(Symbol.for("cacheImg")))) {
        tImage = this.getProperty(Symbol.for("cacheImg"));
        this.getComponent().updateInterface(tNodeId);
      } else {
        return 0;
      }
    }
    const tWndObj = getWindow(this.pWindowTitle);
    if (tWndObj == 0) {
      return 0;
    }
    const tName = this.getComponent().getNodeProperty(tNodeId, Symbol.for("name"));
    if ((tName != 0) && tWndObj.elementExists("nav_roomlist_hd")) {
      const tHeaderImage = this.pWriterPlainBoldLeft.render(tName);
      tWndObj.getElement("nav_roomlist_hd").feedImage(tHeaderImage);
    }
    const tLstElement = tWndObj.getElement("nav_roomlist");
    if (tLstElement == 0) {
      return 0;
    }
    tLstElement.feedImage(tImage);
    this.setHideFullRoomsLink();
    const tBarElement = tWndObj.getElement("nav_scrollbar");
    if (tBarElement == 0) {
      return 1;
    }
    if (tBarElement.getScrollOffset() > tImage.height) {
      tBarElement.setScrollOffset(tImage.height - tLstElement.getProperty(Symbol.for("height")));
    }
    return 1;
  }

  setRecomUpdates(tBool) {
    const tTimeoutID = Symbol.for("recom_update");
    if (tBool) {
      this.getComponent().updateRecomRooms();
      if (timeoutExists(tTimeoutID)) {
        return 1;
      }
      const tInterval = this.getComponent().getRecomUpdateInterval();
      return createTimeout(tTimeoutID, tInterval, Symbol.for("setRecomUpdates"), this.getID(), 1, 0);
    } else {
      if (timeoutExists(tTimeoutID)) {
        return removeTimeout(tTimeoutID);
      }
    }
  }

  setUpdates(tBoolean) {
    if (tBoolean) {
      this.getComponent().updateInterface(this.getProperty(Symbol.for("categoryId")));
      if (timeoutExists(Symbol.for("navigator_update"))) {
        return 1;
      }
      const tUpdateInterval = this.getComponent().getUpdateInterval();
      return createTimeout(Symbol.for("navigator_update"), tUpdateInterval, Symbol.for("setUpdates"), this.getID(), 1, 0);
    } else {
      if (timeoutExists(Symbol.for("navigator_update"))) {
        removeTimeout(Symbol.for("navigator_update"));
      }
      return 1;
    }
  }

  clearRoomList() {
    const tWndObj = getWindow(this.pWindowTitle);
    if (tWndObj == 0) {
      return 0;
    }
    if (tWndObj.elementExists("nav_roomlist")) {
      tWndObj.getElement("nav_roomlist").clearImage();
    }
    if (tWndObj.elementExists("nav_roomlist_hd")) {
      tWndObj.getElement("nav_roomlist_hd").clearImage();
    }
    if (tWndObj.elementExists("nav_roomlist")) {
      tWndObj.getElement("nav_roomlist").clearBuffer();
    }
    if (tWndObj.elementExists("nav_roomlist_hd")) {
      tWndObj.getElement("nav_roomlist_hd").clearBuffer();
    }
    if (tWndObj.elementExists("nav_scrollbar")) {
      tWndObj.getElement("nav_scrollbar").setScrollOffset(0);
    }
    return 1;
  }

  renderHistory(tNodeId, tHistoryTxt, tShowRecoms) {
    if (!(tNodeId == this.getProperty(Symbol.for("categoryId")))) {
      return 0;
    }
    const tWndObj = getWindow(this.pWindowTitle);
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("nav_roomlistBackTabs");
    if (tElem == 0) {
      return 0;
    }
    if (!tWndObj.elementExists("nav_recom_roomlist")) {
      tShowRecoms = 0;
    }
    if (!variableExists("room.recommendations")) {
      tShowRecoms = 0;
    }
    if (getVariable("room.recommendations") != 1) {
      tShowRecoms = 0;
    }
    const tRecomView = tWndObj.elementExists("nav_recom_roomlist");
    let tRoomlistOrigV = this.getProperty(Symbol.for("historyOrigV"));
    if (tRoomlistOrigV == VOID) {
      tRoomlistOrigV = tWndObj.getElement("nav_roomlist").getProperty(Symbol.for("locV"));
      this.setProperty(Symbol.for("historyOrigV"), tRoomlistOrigV);
    }
    let tRoomlistAreaOrigV = this.getProperty(Symbol.for("roomlistAreaOrigV"));
    if (voidp(tRoomlistAreaOrigV)) {
      tRoomlistAreaOrigV = tWndObj.getElement("nav_roomlistArea").getProperty(Symbol.for("locV"));
      this.setProperty(Symbol.for("roomlistAreaOrigV"), tRoomlistAreaOrigV);
    }
    if (tRecomView) {
      let tRecomsOrigV = this.getProperty(Symbol.for("recomsOrigV"));
      if (voidp(tRecomsOrigV)) {
        tRecomsOrigV = tWndObj.getElement("nav_recom_roomlist_hd").getProperty(Symbol.for("locV"));
        this.setProperty(Symbol.for("recomsOrigV"), tRecomsOrigV);
      }
    }
    let tRecomHeaderElem;
    let tRecomListElem;
    if (tShowRecoms) {
      tRecomHeaderElem = tWndObj.getElement("nav_recom_roomlist_hd");
      tRecomListElem = tWndObj.getElement("nav_recom_roomlist");
      tRecomListElem.show();
    }
    let tItemCount = tHistoryTxt.line.count;
    if (tHistoryTxt == EMPTY) {
      tItemCount = 0;
    }
    const tRoomlistCurrentV = tWndObj.getElement("nav_roomlist").getProperty(Symbol.for("locV"));
    let tRoomlistOffset = tRoomlistOrigV - tRoomlistCurrentV;
    let tHistoryOffset = tItemCount * this.pHistoryItemHeight;
    if ((this.getNaviView() == Symbol.for("flat")) && (tItemCount > 0)) {
      tHistoryOffset = tHistoryOffset + 7;
    }
    tRoomlistOffset = tRoomlistOffset + tHistoryOffset;
    if (tShowRecoms) {
      tRoomlistOffset = tRoomlistOffset + 80;
      const tHeaderImage = this.pWriterPlainBoldLeft.render(getText("nav_recommended_rooms")).duplicate();
      tRecomHeaderElem.feedImage(tHeaderImage);
      this.getComponent().showHideRefreshRecoms(1, 1);
    }
    if (tShowRecoms) {
      const tRecomsCurrentV = tWndObj.getElement("nav_recom_roomlist_hd").getProperty(Symbol.for("locV"));
      let tRecomsOffset = tRecomsOrigV - tRecomsCurrentV;
      tRecomsOffset = tRecomsOffset + tHistoryOffset;
      const tElemList = [];
      tElemList.add(tWndObj.getElement("nav_recom_roomlist"));
      tElemList.add(tWndObj.getElement("nav_recom_roomlist_hd"));
      tElemList.add(tWndObj.getElement("nav_refresh_recoms"));
      call(Symbol.for("moveBy"), tElemList, 0, tRecomsOffset);
    }
    if (!tShowRecoms && tWndObj.elementExists("nav_recom_roomlist_hd")) {
      tWndObj.getElement("nav_recom_roomlist_hd").clearImage();
      tWndObj.getElement("nav_recom_roomlist").clearImage();
      tWndObj.getElement("nav_recom_roomlist").hide();
      this.getComponent().showHideRefreshRecoms(0, 1);
    }
    const tRoomlistAreaCurrentV = tWndObj.getElement("nav_roomlistArea").getProperty(Symbol.for("locV"));
    let tAreaOffset = tRoomlistAreaOrigV - tRoomlistAreaCurrentV;
    if (!tShowRecoms) {
      tAreaOffset = tAreaOffset + tHistoryOffset;
    }
    if ((tHistoryOffset > 0) && tShowRecoms) {
      tAreaOffset = tAreaOffset + tHistoryOffset;
    }
    tWndObj.getElement("nav_roomlist_hd").moveBy(0, tRoomlistOffset);
    const tScaleList = [];
    tScaleList.add(tWndObj.getElement("nav_roomlist"));
    tScaleList.add(tWndObj.getElement("nav_scrollbar"));
    tScaleList.add(tWndObj.getElement("nav_hidefull"));
    call(Symbol.for("moveBy"), tScaleList, 0, tRoomlistOffset);
    call(Symbol.for("resizeBy"), tScaleList, 0, -tRoomlistOffset);
    const tAreaElem = tWndObj.getElement("nav_roomlistArea");
    tAreaElem.moveBy(0, tAreaOffset);
    tAreaElem.resizeBy(0, -tAreaOffset);
    let tTextImg = this.pWriterBackTabs.render(tHistoryTxt);
    if (variableExists("nav_roomlist_marginv")) {
      const tMargin = getVariable("nav_roomlist_marginv");
      const tTempImg = image(tTextImg.width, tTextImg.height + tMargin, this.pBufferDepth);
      tTempImg.copyPixels(tTextImg, tTextImg.rect + rect(0, tMargin, 0, tMargin), tTextImg.rect);
      tTextImg = tTempImg;
    }
    tWndObj.getElement("nav_roomlistBackLinks").feedImage(tTextImg);
    if (tShowRecoms) {
      this.setRecomUpdates(1);
    } else {
      this.setRecomUpdates(0);
    }
  }

  showNodeInfo(tNodeId, tCategoryId) {
    this.setLoadingCursor(0);
    if (!windowExists(this.pWindowTitle)) {
      return 0;
    }
    const tWndObj = getWindow(this.pWindowTitle);
    const tElem = tWndObj.getElement("nav_roomnfo_hd");
    if (tElem == 0) {
      return 0;
    }
    let tNodeInfo;
    if (!voidp(tNodeId)) {
      tNodeInfo = this.getComponent().getNodeInfo(tNodeId, tCategoryId);
    }
    if (!listp(tNodeInfo)) {
      tNodeInfo = 0;
    } else {
      if (tNodeInfo[Symbol.for("nodeType")] == 0) {
        tNodeInfo = 0;
      }
    }
    this.setRoomInfoArea(Symbol.for("show"));
    const tView = this.getNaviView();
    let tIconName;
    let tRoomDesc;
    let tHeaderTxt;
    if (tNodeInfo == 0) {
      switch (tView) {
        case Symbol.for("unit"):
          tIconName = "nav_ico_def_pr";
          tRoomDesc = getText("nav_public_helptext");
          tHeaderTxt = getText("nav_public_helptext_hd");
          break;
        case Symbol.for("src"):
          tIconName = "nav_ico_def_src";
          tRoomDesc = getText("nav_search_helptext");
          tHeaderTxt = getText("nav_private_helptext_hd");
          break;
        case Symbol.for("fav"):
          tIconName = "nav_ico_def_fav";
          tRoomDesc = getText("nav_favourites_helptext");
          tHeaderTxt = getText("nav_private_helptext_hd");
          break;
        case Symbol.for("own"):
          tIconName = "nav_ico_def_own";
          tRoomDesc = getText("nav_ownrooms_helptext");
          tHeaderTxt = getText("nav_private_helptext_hd");
          break;
        default:
          tIconName = this.pDefaultPrivateRoomIcon;
          tRoomDesc = getText("nav_private_helptext");
          tHeaderTxt = getText("nav_private_helptext_hd");
          if (textExists("nav_private_helptext_hd_main")) {
            tHeaderTxt = getText("nav_private_helptext_hd_main");
          }
          break;
      }
      if (tWndObj.elementExists("nav_modify_button")) {
        tWndObj.getElement("nav_modify_button").hide();
      }
      if (tWndObj.elementExists("nav_addtofavourites_button")) {
        tWndObj.getElement("nav_addtofavourites_button").hide();
      }
      if (tWndObj.elementExists("nav_removefavourites_button")) {
        tWndObj.getElement("nav_removefavourites_button").hide();
      }
      tWndObj.getElement("nav_go_button").hide();
    } else {
      switch (tView) {
        case Symbol.for("unit"):
          {
            let tTextId = `nav_venue_${tNodeInfo[Symbol.for("unitStrId")]}/${tNodeInfo[Symbol.for("door")]}_desc`;
            if (!textExists(tTextId)) {
              const tDelim = the.itemDelimiter;
              the.itemDelimiter = "_";
              tTextId = `nav_venue_${tNodeInfo[Symbol.for("unitStrId")].item[`${1}..${tNodeInfo[Symbol.for("unitStrId")].item.count - 1}`]}_desc`;
              the.itemDelimiter = tDelim;
            }
            tRoomDesc = getText(tTextId);
            tIconName = `thumb.${tNodeInfo[Symbol.for("unitStrId")]}`;
            if (!memberExists(tIconName)) {
              const tDelim = the.itemDelimiter;
              the.itemDelimiter = "_";
              tIconName = tIconName.item[`${1}..${tIconName.item.count - 1}`];
              the.itemDelimiter = tDelim;
            }
            if (!memberExists(tIconName)) {
              tIconName = "nav_ico_def_pr";
            }
            if (voidp(tNodeInfo[Symbol.for("usercount")])) {
              tNodeInfo[Symbol.for("usercount")] = 0;
            }
            if (voidp(tNodeInfo[Symbol.for("maxUsers")])) {
              tNodeInfo[Symbol.for("maxUsers")] = 0;
            }
            tHeaderTxt = `${tNodeInfo[Symbol.for("name")]} (${tNodeInfo[Symbol.for("usercount")]}/${tNodeInfo[Symbol.for("maxUsers")]}) `;
            if (tWndObj.elementExists("nav_addtofavourites_button")) {
              tWndObj.getElement("nav_addtofavourites_button").show();
            }
            tWndObj.getElement("nav_go_button").show();
            break;
          }
        default:
          if (voidp(tNodeInfo[Symbol.for("name")])) {
            tNodeInfo[Symbol.for("name")] = "-";
          }
          if (voidp(tNodeInfo[Symbol.for("usercount")])) {
            tNodeInfo[Symbol.for("usercount")] = 0;
          }
          if (voidp(tNodeInfo[Symbol.for("maxUsers")])) {
            tNodeInfo[Symbol.for("maxUsers")] = 0;
          }
          if (voidp(tNodeInfo[Symbol.for("owner")])) {
            tNodeInfo[Symbol.for("owner")] = "-";
          }
          if (voidp(tNodeInfo[Symbol.for("description")])) {
            tNodeInfo[Symbol.for("description")] = "-";
          }
          {
            let tNameTxt;
            if (getObject(Symbol.for("session")).GET("user_rights").getOne(Symbol.for("fuse_see_flat_ids")) != 0) {
              tNameTxt = `${tNodeInfo[Symbol.for("name")]} (id: ${tNodeInfo[Symbol.for("flatId")]})`;
            } else {
              tNameTxt = tNodeInfo[Symbol.for("name")];
            }
            tHeaderTxt = `${tNameTxt}${RETURN}(${tNodeInfo[Symbol.for("usercount")]}/${tNodeInfo[Symbol.for("maxUsers")]}) `;
            tHeaderTxt = `${tHeaderTxt}${getText("nav_owner")}: ${tNodeInfo[Symbol.for("owner")]}`;
            tRoomDesc = tNodeInfo[Symbol.for("description")];
            switch (tNodeInfo[Symbol.for("door")]) {
              case "open":
                tIconName = "door_open";
                break;
              case "closed":
                tIconName = "door_closed";
                break;
              case "password":
                tIconName = "door_password";
                break;
              default:
                tNodeInfo[Symbol.for("door")] = "open";
                tIconName = "door_open";
                break;
            }
            if (tWndObj.elementExists("nav_modify_button")) {
              tWndObj.getElement("nav_modify_button").show();
            }
            if (tWndObj.elementExists("nav_addtofavourites_button")) {
              tWndObj.getElement("nav_addtofavourites_button").show();
            }
            if (tWndObj.elementExists("nav_removefavourites_button")) {
              tWndObj.getElement("nav_removefavourites_button").show();
            }
            if (tWndObj.elementExists("nav_go_button")) {
              tWndObj.getElement("nav_go_button").show();
            }
            break;
          }
      }
    }
    const tHeaderImage = this.pWriterPlainBoldLeft.render(tHeaderTxt);
    const tWidth = tElem.getProperty(Symbol.for("width"));
    this.pWriterPlainNormWrap.define(propList(Symbol.for("rect"), rect(0, 0, tWidth, 0)));
    const tImage = this.pWriterPlainNormWrap.render(tRoomDesc);
    const tMargin = 2;
    const tDataImage = image(tWidth, tHeaderImage.height + tMargin + tImage.height, 8);
    tDataImage.copyPixels(tHeaderImage, tHeaderImage.rect, tHeaderImage.rect);
    const tSourceRect = rect(0, 0, tImage.width, tImage.height);
    const tTargetRect = rect(0, tHeaderImage.height + tMargin, tImage.width, tImage.height + tHeaderImage.height + tMargin);
    tDataImage.copyPixels(tImage, tTargetRect, tSourceRect);
    tElem.feedImage(tDataImage);
    if (memberExists(tIconName) && tWndObj.elementExists("nav_roomnfo_icon")) {
      const tElemID = "nav_roomnfo_icon";
      let tTempImg = member(getmemnum(tIconName)).image;
      tTempImg = tTempImg.trimWhiteSpace();
      const tElement = tWndObj.getElement(tElemID);
      const tWidth2 = tElement.getProperty(Symbol.for("width"));
      const tHeight = tElement.getProperty(Symbol.for("height"));
      const tDepth = tElement.getProperty(Symbol.for("depth"));
      const tPrewImg = image(tWidth2, tHeight, tDepth);
      let tdestrect = tPrewImg.rect - tTempImg.rect;
      tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tTempImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tTempImg.height);
      tPrewImg.copyPixels(tTempImg, tdestrect, tTempImg.rect, propList(Symbol.for("ink"), 8));
      tElement.clearImage();
      tElement.feedImage(tPrewImg);
    }
    return 1;
  }

  createImgResources() {
    if (this.pResourcesReady) {
      return 0;
    }
    const tPlain = getStructVariable("struct.font.plain");
    const tBold = getStructVariable("struct.font.bold");
    const tLink = getStructVariable("struct.font.link");
    createWriter("nav_plain_norm_left", tPlain);
    this.pWriterPlainNormLeft = getWriter("nav_plain_norm_left");
    createWriter("nav_plain_bold_left", tBold);
    this.pWriterPlainBoldLeft = getWriter("nav_plain_bold_left");
    createWriter("nav_under_norm_left", tLink);
    this.pWriterUnderNormLeft = getWriter("nav_under_norm_left");
    createWriter("nav_plain_bold_cent", tBold);
    this.pWriterPlainBoldCent = getWriter("nav_plain_bold_cent");
    this.pWriterPlainBoldCent.define(propList(Symbol.for("alignment"), Symbol.for("center")));
    createWriter("nav_plain_norm_wrap", tPlain);
    this.pWriterPlainNormWrap = getWriter("nav_plain_norm_wrap");
    this.pWriterPlainNormWrap.define(propList(Symbol.for("wordWrap"), 1));
    createWriter("nav_private_plain", tPlain);
    this.pWriterPrivPlain = getWriter("nav_private_plain");
    this.pWriterPrivPlain.define(propList(Symbol.for("wordWrap"), 0, Symbol.for("fixedLineSpace"), this.pListItemHeight));
    createWriter("nav_backtabs_plain", tBold);
    this.pWriterBackTabs = getWriter("nav_backtabs_plain");
    this.pWriterBackTabs.define(propList(Symbol.for("wordWrap"), 0, Symbol.for("fixedLineSpace"), this.pHistoryItemHeight, Symbol.for("color"), rgb(51, 102, 102)));
    this.pGoLinkTextImg = this.pWriterUnderNormLeft.render(getText("nav_gobutton")).duplicate();
    this.pWriterUnderNormLeft.define(propList(Symbol.for("color"), rgb(212, 121, 121)));
    this.pFullLinkTextImg = this.pWriterUnderNormLeft.render(getText("nav_fullbutton")).duplicate();
    this.pWriterUnderNormLeft.define(propList(Symbol.for("color"), rgb(0, 0, 0)));
    this.pOpenLinkTextImg = this.pWriterUnderNormLeft.render(getText("nav_openbutton")).duplicate();
    createWriter("nav_showfull", getStructVariable("struct.font.link"));
    let tWriter = getWriter("nav_showfull");
    tWriter.define(propList(Symbol.for("wordWrap"), 0, Symbol.for("color"), rgb("#7B9498"), Symbol.for("alignment"), Symbol.for("right")));
    this.pHideFullLinkImages = propList();
    this.pHideFullLinkImages[Symbol.for("show")] = tWriter.render(getText("nav_showfull")).duplicate();
    this.pHideFullLinkImages[Symbol.for("hide")] = tWriter.render(getText("nav_hidefull")).duplicate();
    removeWriter("nav_showfull");
    tWriter = VOID;
    createWindow("naviTempWindow");
    const tTempWindowObj = getWindow("naviTempWindow");
    this.pRoomBackImages = [];
    this.pRoomBackImages.add(createRoomItemImage(1, paletteIndex(81)));
    this.pRoomBackImages.add(createRoomItemImage(2, paletteIndex(128)));
    this.pRoomBackImages.add(createRoomItemImage(3, paletteIndex(129)));
    this.pRoomBackImages.add(createRoomItemImage(4, paletteIndex(130)));
    this.pRoomBackImages.add(createRoomItemImage(5, paletteIndex(131)));
    this.pCatBackImages = [];
    this.pCatBackImages.add(createCatItemImage(1, paletteIndex(81)));
    this.pCatBackImages.add(createCatItemImage(2, paletteIndex(128)));
    this.pCatBackImages.add(createCatItemImage(3, paletteIndex(129)));
    this.pCatBackImages.add(createCatItemImage(4, paletteIndex(130)));
    removeWindow("naviTempWindow");
    this.pResourcesReady = 1;
    return 1;
  }

  removeImgResources() {
    if (!this.pResourcesReady) {
      return 0;
    }
    removeWriter(this.pWriterPlainNormLeft.getID());
    this.pWriterPlainNormLeft = VOID;
    removeWriter(this.pWriterPlainBoldLeft.getID());
    this.pWriterPlainBoldLeft = VOID;
    removeWriter(this.pWriterUnderNormLeft.getID());
    this.pWriterUnderNormLeft = VOID;
    removeWriter(this.pWriterPlainBoldCent.getID());
    this.pWriterPlainBoldCent = VOID;
    removeWriter(this.pWriterPlainNormWrap.getID());
    this.pWriterPlainNormWrap = VOID;
    removeWriter(this.pWriterPrivPlain.getID());
    this.pWriterPrivPlain = VOID;
    removeWriter(this.pWriterBackTabs.getID());
    this.pWriterBackTabs = VOID;
    this.pHideFullLinkImages = VOID;
    this.pResourcesReady = 0;
    return 1;
  }

  createCatItemImage(tNum, tColor) {
    const tImg = image(311, 16, 8, member("nav_ui_palette"));
    let tSrc = member(`nav_rw_lf${tNum}`).image;
    tImg.copyPixels(tSrc, tSrc.rect, tSrc.rect);
    tImg.fill(6, 0, 311, 16, tColor);
    tSrc = member(`nav_rw_lf${tNum}`).image;
    tImg.copyPixels(tSrc, [point(311, 0), point(305, 0), point(305, 16), point(311, 16)], tSrc.rect);
    tSrc = member("nav_rw_plus").image;
    tImg.copyPixels(tSrc, rect(6, 4, 14, 12), tSrc.rect, propList(Symbol.for("ink"), 36));
    tSrc = member("nav_rw_arr").image;
    tImg.copyPixels(tSrc, rect(286, 4, 293, 12), tSrc.rect, propList(Symbol.for("ink"), 36));
    tImg.copyPixels(tSrc, rect(293, 4, 300, 12), tSrc.rect, propList(Symbol.for("ink"), 36));
    tImg.copyPixels(tSrc, rect(300, 4, 307, 12), tSrc.rect, propList(Symbol.for("ink"), 36));
    return tImg;
  }

  createRoomItemImage(tNum, tColor) {
    const tImg = image(311, 16, 8, member("nav_ui_palette"));
    let tSrc = member("nav_rw_lf").image;
    tImg.copyPixels(tSrc, tSrc.rect, tSrc.rect);
    tImg.fill(6, 0, 246, 16, paletteIndex(82));
    tSrc = member("nav_rw_lf").image;
    tImg.copyPixels(tSrc, [point(251, 0), point(245, 0), point(245, 16), point(251, 16)], tSrc.rect);
    tSrc = member(`nav_rw_lf${tNum}`).image;
    tImg.copyPixels(tSrc, rect(253, 0, 259, 16), tSrc.rect);
    tImg.fill(259, 0, 305, 16, tColor);
    tSrc = member(`nav_rw_lf${tNum}`).image;
    tImg.copyPixels(tSrc, [point(311, 0), point(305, 0), point(305, 16), point(311, 16)], tSrc.rect);
    tSrc = member("nav_rw_arr").image;
    tImg.copyPixels(tSrc, rect(300, 4, 307, 12), tSrc.rect, propList(Symbol.for("ink"), 36));
    return tImg;
  }

  renderRoomList(tList) {
    if (!listp(tList)) {
      return 0;
    }
    const tCount = tList.count;
    const tListHeight = tCount * this.pListItemHeight;
    const tTargetImg = image(this.pListAreaWidth, tListHeight, this.pBufferDepth);
    const tLockMemImgA = member(getmemnum("lock1")).image;
    const tLockMemImgB = member(getmemnum("lock2")).image;
    let tNameTxt = EMPTY;
    for (let i = 1; i <= tCount; i++) {
      const tItem = tList[i];
      const tItemName = tItem[Symbol.for("name")];
      tNameTxt = `${tNameTxt}${tItemName}${RETURN}`;
      if (tItem[Symbol.for("maxUsers")] < 1) {
        tItem[Symbol.for("maxUsers")] = 25;
      }
      const tUserStatus = float(tItem[Symbol.for("usercount")]) / tItem[Symbol.for("maxUsers")];
      if (tItem[Symbol.for("nodeType")] == 0) {
        this.renderRoomListItem(Symbol.for("cat"), i, tTargetImg, tUserStatus);
      } else {
        this.renderRoomListItem(Symbol.for("room"), i, tTargetImg, tUserStatus, tItem[Symbol.for("nodeType")]);
      }
      let tLockImg;
      switch (tItem[Symbol.for("door")]) {
        case "closed":
          tLockImg = tLockMemImgA;
          break;
        case "password":
          tLockImg = tLockMemImgB;
          break;
        default:
          tLockImg = 0;
          break;
      }
      if (tLockImg != 0) {
        const tSrcRect = tLockImg.rect;
        const tLocV = (i - 1) * this.pListItemHeight;
        const tdestrect = tSrcRect + rect(7, tLocV + 5, 7, tLocV + 5);
        tTargetImg.copyPixels(tLockImg, tdestrect, tSrcRect, propList(Symbol.for("ink"), 36));
      }
    }
    delete char(-30003).of(tNameTxt);
    let tNameVertMargin;
    if (variableExists("nav_roomlist_marginv")) {
      tNameVertMargin = getVariable("nav_roomlist_marginv");
    } else {
      tNameVertMargin = 0;
    }
    const tNameImage = this.pWriterPrivPlain.render(tNameTxt);
    const tNameRect = tNameImage.rect.duplicate();
    if (tNameRect.width > 230) {
      tNameRect[3] = 230;
    }
    tTargetImg.copyPixels(tNameImage, tNameRect + rect(17, -5 + tNameVertMargin, 17, -5 + tNameVertMargin), tNameRect);
    return tTargetImg;
  }

  renderRoomListItem(ttype, tNum, tTargetImg, tUserStatus, tNodeType) {
    let tBackImgId;
    if (tNodeType == 1) {
      if (tUserStatus == 0) {
        tBackImgId = 1;
      } else if (tUserStatus < 0.34000000000000002) {
        tBackImgId = 2;
      } else if (tUserStatus < 0.76000000000000001) {
        tBackImgId = 3;
      } else if (tUserStatus < 0.98999999999999999) {
        tBackImgId = 4;
      } else {
        tBackImgId = 5;
      }
    } else {
      if (tUserStatus == 0) {
        tBackImgId = 1;
      } else if (tUserStatus < 0.34000000000000002) {
        tBackImgId = 2;
      } else if (tUserStatus < 0.76000000000000001) {
        tBackImgId = 3;
      } else if ((tUserStatus < 0.98999999999999999) || (ttype == Symbol.for("cat"))) {
        tBackImgId = 4;
      } else {
        tBackImgId = 5;
      }
    }
    let tBackImg;
    if (ttype == Symbol.for("room")) {
      tBackImg = this.pRoomBackImages[tBackImgId];
    } else {
      tBackImg = this.pCatBackImages[tBackImgId];
    }
    const tLocV = (tNum - 1) * this.pListItemHeight;
    const tdestrect = tBackImg.rect + rect(0, tLocV, 0, tLocV);
    tTargetImg.copyPixels(tBackImg, tdestrect, tBackImg.rect);
    if (ttype == Symbol.for("room")) {
      let tAddOffset = 0;
      let tLinkImage;
      if (tBackImgId == 5) {
        tLinkImage = this.pFullLinkTextImg;
        if (variableExists("nav_full_link_voffset")) {
          tAddOffset = getVariable("nav_full_link_voffset");
        }
      } else {
        tLinkImage = this.pGoLinkTextImg;
        if (variableExists("nav_go_link_voffset")) {
          tAddOffset = getVariable("nav_go_link_voffset");
        }
      }
      const tX1 = tBackImg.width - tLinkImage.width - 12;
      const tX2 = tX1 + tLinkImage.width;
      const tY1 = 3 + tLocV + tAddOffset;
      const tY2 = tY1 + tLinkImage.height;
      const tdestrect2 = rect(tX1, tY1, tX2, tY2);
      tTargetImg.copyPixels(tLinkImage, tdestrect2, tLinkImage.rect, propList(Symbol.for("bgColor"), rgb("#DDDDDD"), Symbol.for("ink"), 36));
    } else {
      let tAddOffset = 0;
      if (variableExists("nav_open_link_voffset")) {
        tAddOffset = getVariable("nav_open_link_voffset");
      }
      const tX1 = tBackImg.width - this.pOpenLinkTextImg.width - 27;
      const tX2 = tX1 + this.pOpenLinkTextImg.width;
      const tY1 = 3 + tLocV + tAddOffset;
      const tY2 = tY1 + this.pOpenLinkTextImg.height;
      const tdestrect = rect(tX1, tY1, tX2, tY2);
      tTargetImg.copyPixels(this.pOpenLinkTextImg, tdestrect, this.pOpenLinkTextImg.rect, propList(Symbol.for("bgColor"), rgb("#DDDDDD"), Symbol.for("ink"), 36));
    }
    return 1;
  }

  setHideFullRoomsLink() {
    if (!windowExists(this.pWindowTitle)) {
      return 0;
    }
    const tWndObj = getWindow(this.pWindowTitle);
    const tElem = tWndObj.getElement("nav_hidefull");
    if (tElem == 0) {
      return 0;
    }
    const tstate = this.getComponent().getCurrentNodeMask();
    let tImage;
    if (tstate) {
      tImage = this.pHideFullLinkImages[Symbol.for("show")];
    } else {
      tImage = this.pHideFullLinkImages[Symbol.for("hide")];
    }
    const tOffX = tImage.width - tElem.getProperty(Symbol.for("width"));
    let tOffY = 0;
    if (variableExists("nav_showhide_full_voffset")) {
      tOffY = tOffY + getVariable("nav_showhide_full_voffset");
    }
    tElem.feedImage(tImage);
    tElem.adjustOffsetTo(tOffX, tOffY);
    return 1;
  }

  setRoomInfoArea(tstate) {
    if (!windowExists(this.pWindowTitle)) {
      return 0;
    }
    if (this.getProperty(Symbol.for("roomInfoState")) == VOID) {
      this.setProperty(Symbol.for("roomInfoState"), Symbol.for("show"));
    }
    if (tstate == this.getProperty(Symbol.for("roomInfoState"))) {
      return 0;
    }
    this.setProperty(Symbol.for("roomInfoState"), tstate);
    if (tstate == Symbol.for("hide")) {
      this.setProperty(Symbol.for("viewedNodeId"), VOID);
    }
    const tWndObj = getWindow(this.pWindowTitle);
    const tScaleElemList = [tWndObj.getElement("nav_roomlist"), tWndObj.getElement("nav_scrollbar"), tWndObj.getElement("nav_roomlistArea")];
    let tOffset = this.pRoomInfoHeight;
    if (tstate == Symbol.for("show")) {
      tOffset = -tOffset;
    }
    call(Symbol.for("resizeBy"), tScaleElemList, 0, tOffset);
    return 1;
  }

  setLoadingCursor(tstate) {
    if (tstate) {
      setcursor(Symbol.for("timer"));
    } else {
      setcursor(Symbol.for("arrow"));
    }
  }

  renderLoadingText(tTempElementId) {
    if (voidp(tTempElementId)) {
      return 0;
    }
    const tElem = getWindow(this.pWindowTitle).getElement(tTempElementId);
    const tWidth = tElem.getProperty(Symbol.for("width"));
    const tHeight = tElem.getProperty(Symbol.for("height"));
    const tTempImg = image(tWidth, tHeight, this.pBufferDepth);
    const tTextImg = this.pWriterPlainBoldCent.render(getText("loading"));
    const tOffX = (tWidth - tTextImg.width) / 2;
    const tOffY = (tHeight - tTextImg.height) / 2;
    const tDstRect = tTextImg.rect + rect(tOffX, tOffY, tOffX, tOffY);
    tTempImg.copyPixels(tTextImg, tDstRect, tTextImg.rect);
    tElem.feedImage(tTempImg);
    return 1;
  }

  flipImage(tImg_a) {
    const tImg_b = image(tImg_a.width, tImg_a.height, tImg_a.depth);
    const tQuad = [point(tImg_a.width, 0), point(0, 0), point(0, tImg_a.height), point(tImg_a.width, tImg_a.height)];
    tImg_b.copyPixels(tImg_a, tQuad, tImg_a.rect);
    return tImg_b;
  }

  updatePasswordAsterisks(tParams) {
    if (!windowExists(tParams[1])) {
      return 0;
    }
    const tWndObj = getWindow(tParams[1]);
    if (!tWndObj.elementExists(tParams[2])) {
      return 0;
    }
    const tElementId = tParams[2];
    const tElement = tWndObj.getElement(tParams[2]);
    const tPwdTxt = tElement.getText();
    let tPreviousTxt = this.pFlatPasswords[tElementId];
    for (let tPos = 1; tPos <= tPwdTxt.length; tPos++) {
      const tNewChar = chars(tPwdTxt, tPos, tPos);
      if (tNewChar != "*") {
        tPreviousTxt = `${tPreviousTxt}${tNewChar}`;
      }
    }
    this.pFlatPasswords[tElementId] = tPreviousTxt;
    let tStars = EMPTY;
    for (let i = 1; i <= this.pFlatPasswords[tElementId].length; i++) {
      tStars = `${tStars}*`;
    }
    tElement.setText(tStars);
  }

  sendTrackingCall() {
    executeMessage(Symbol.for("sendTrackingPoint"), "/navigator");
  }
}
