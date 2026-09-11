export default class {
  pStrLastFlatSearch;
  pFlatPasswords;
  pFlatInfoAction;
  pModifyFlatInfo;
  pDoorStatusModified;

  construct() {
    this.pStrLastFlatSearch = EMPTY;
    this.pFlatInfoAction = 0;
    this.pDoorStatusModified = 0;
    return 1;
  }

  deconstruct() {
    return 1;
  }

  showSpaceNodeUsers(tNodeId, tUserList) {
    let tUsersStr = EMPTY;
    for (let i = 1; i <= tUserList.count; i++) {
      tUsersStr = `${tUsersStr}${tUserList[i]}`;
      if (i < tUserList.count) {
        tUsersStr = `${tUsersStr}, `;
      }
    }
    const pWinId = getText("nav_people");
    if (!createWindow(pWinId, "habbo_basic.window")) {
      return 0;
    }
    const tWndObj = getWindow(pWinId);
    if (!tWndObj.merge("habbo_alert_b.window")) {
      return tWndObj.close();
    }
    const tTextImg = this.pWriterPlainNormWrap.render(tUsersStr);
    tWndObj.getElement("alert_text").feedImage(tTextImg);
    tWndObj.resizeTo(tTextImg.width + 50, tTextImg.height + 100);
    tWndObj.registerProcedure(Symbol.for("hideSpaceNodeUsers"), this.getID(), Symbol.for("mouseUp"));
    return 1;
  }

  hideSpaceNodeUsers() {
    return removeWindow(getText("nav_people"));
  }

  getPasswordFromField(tElementId) {
    const tPwd = this.pFlatPasswords[tElementId];
    return tPwd;
  }

  flatPasswordIncorrect() {
    this.ChangeWindowView("nav_gr_passwordincorrect");
  }

  checkFlatAccess(tFlatData) {
    let tDoor;
    if (tFlatData[Symbol.for("owner")] == getObject(Symbol.for("session")).GET("user_name")) {
      tDoor = "open";
    } else {
      tDoor = tFlatData[Symbol.for("door")];
      this.pFlatPasswords = propList();
    }
    switch (tDoor) {
      case "password":
        this.ChangeWindowView("nav_gr_password");
        getWindow(this.pWindowTitle).getElement("nav_roomname_text").setText(tFlatData[Symbol.for("name")]);
        this.setProperty(Symbol.for("passwordNodeId"), tFlatData[Symbol.for("id")]);
        return 1;
      default:
        if (voidp(tFlatData)) {
          return error(this, "Can't enter flat, no room is selected!!!", Symbol.for("processFlatInfo"), Symbol.for("major"));
        }
        return this.getComponent().executeRoomEntry(tFlatData[Symbol.for("id")]);
    }
  }

  handleRecommendedRoomListClicked(tParm) {
    const tNodeInfo = this.getComponent().getRecomNodeInfo();
    const tRoomList = tNodeInfo.getaProp(Symbol.for("children"));
    if (voidp(tRoomList)) {
      return 0;
    }
    const tClickedLine = integer(tParm.locV / this.pListItemHeight) + 1;
    if (tClickedLine > tRoomList.count) {
      return 0;
    }
    const tRoomNode = tRoomList[tClickedLine];
    this.setProperty(Symbol.for("viewedNodeId"), tRoomNode[Symbol.for("id")]);
    const tGoLinkH = 255;
    this.setLoadingCursor(1);
    if (tParm.locH > tGoLinkH) {
      this.getComponent().prepareRoomEntry(string(tRoomNode[Symbol.for("id")]), Symbol.for("private"));
    } else {
      this.showNodeInfo(tRoomNode[Symbol.for("id")], Symbol.for("recom"));
    }
    return 1;
  }

  handleRoomListClicked(tParm) {
    const tCategoryId = this.getProperty(Symbol.for("categoryId"));
    let tNodeInfo = this.getComponent().getNodeInfo(tCategoryId);
    if (!listp(tNodeInfo)) {
      return error(this, `Nodeinfo not found, id: ${tCategoryId}`, Symbol.for("handleRoomListClicked"), Symbol.for("major"));
    }
    const tNodeList = tNodeInfo[Symbol.for("children")];
    if (!listp(tNodeList)) {
      return error(this, `Node content not found, id:${tCategoryId}`, Symbol.for("handleRoomListClicked"), Symbol.for("major"));
    }
    const tNodeCount = tNodeList.count;
    if (!ilk(tParm, Symbol.for("point")) || (tNodeCount == 0)) {
      return 0;
    }
    let tClickedLine = integer(tParm.locV / this.pListItemHeight) + 1;
    if (tClickedLine > tNodeCount) {
      tClickedLine = tNodeCount;
    } else if (tClickedLine < 1) {
      tClickedLine = 1;
    }
    tNodeInfo = tNodeList[tClickedLine];
    if (!listp(tNodeInfo)) {
      return 0;
    }
    this.setProperty(Symbol.for("viewedNodeId"), tNodeInfo[Symbol.for("id")]);
    const tGoLinkH = 255;
    if (tNodeInfo[Symbol.for("nodeType")] == 0) {
      this.setLoadingCursor(1);
      this.getComponent().expandNode(tNodeInfo[Symbol.for("id")]);
      executeMessage(Symbol.for("tutorial_roomcategory_expanded"));
    } else {
      if (the.shiftDown) {
        if (tNodeInfo[Symbol.for("nodeType")] == 1) {
          return this.getComponent().sendGetSpaceNodeUsers(tNodeInfo[Symbol.for("id")]);
        }
      }
      this.setLoadingCursor(1);
      if (tParm.locH > tGoLinkH) {
        this.getComponent().prepareRoomEntry(tNodeInfo[Symbol.for("id")]);
      } else {
        this.showNodeInfo(tNodeInfo[Symbol.for("id")], tCategoryId);
      }
    }
    return 1;
  }

  startFlatSearch() {
    const tWndObj = getWindow(this.pWindowTitle);
    if (tWndObj.elementExists("nav_private_search_field")) {
      const tSearchQuery = tWndObj.getElement("nav_private_search_field").getText();
      this.pStrLastFlatSearch = tSearchQuery;
      this.clearRoomList();
      if (tSearchQuery == EMPTY) {
        return this.showRoomlistError(getText("nav_prvrooms_notfound"));
      }
      this.setLoadingCursor(1);
      this.renderLoadingText();
      return this.getComponent().sendSearchFlats(tSearchQuery);
    }
  }

  showRoomlistError(tText) {
    this.setLoadingCursor(0);
    const tElem = getWindow(this.pWindowTitle).getElement("nav_roomlist");
    if (tElem != 0) {
      const tWidth = tElem.getProperty(Symbol.for("width"));
      const tHeight = tElem.getProperty(Symbol.for("height"));
      const tTempImg = image(tWidth, tHeight, 8);
      const tTextImg = this.pWriterPlainNormLeft.render(tText);
      tTempImg.copyPixels(tTextImg, tTextImg.rect + rect(8, 5, 8, 5), tTextImg.rect);
      tElem.feedImage(tTempImg);
    }
  }

  modifyPrivateRoom(tFlatInfo) {
    if (!(tFlatInfo.ilk == Symbol.for("propList"))) {
      return this.getComponent().getInfoBroker().requestRoomData(tFlatInfo, Symbol.for("private"), [this.getID(), Symbol.for("modifyPrivateRoom")]);
    }
    tFlatInfo = this.getComponent().getNodeInfo(tFlatInfo[Symbol.for("id")], Symbol.for("own"));
    if (tFlatInfo == 0) {
      return error(this, "Flat info is VOID", Symbol.for("modifyPrivateRoom"), Symbol.for("major"));
    } else {
      this.pModifyFlatInfo = tFlatInfo;
    }
    if (tFlatInfo.findPos(Symbol.for("parentid")) == VOID) {
      registerMessage(Symbol.for("flatcat_received"), this.getID(), Symbol.for("modifyPrivateRoom"));
      return this.getComponent().sendGetFlatCategory(tFlatInfo[Symbol.for("id")]);
    }
    unregisterMessage(Symbol.for("flatcat_received"), this.getID());
    this.pFlatPasswords = propList();
    this.pDoorStatusModified = 0;
    if (tFlatInfo[Symbol.for("owner")] != getObject(Symbol.for("session")).GET("user_name")) {
      return 0;
    }
    this.setModifyFirstPage();
  }

  setModifyFirstPage() {
    const tFlatInfo = this.pModifyFlatInfo;
    this.ChangeWindowView("nav_gr_mod");
    const tWndObj = getWindow(this.pWindowTitle);
    const tTempProps = propList(Symbol.for("name"), "nav_modify_roomnamefield", Symbol.for("description"), "nav_modify_roomdescription_field");
    for (let f = 1; f <= tTempProps.count; f++) {
      const tProp = tTempProps.getPropAt(f);
      const tField = tTempProps[tProp];
      if (tWndObj.elementExists(tField)) {
        if (!voidp(tFlatInfo[tProp])) {
          tWndObj.getElement(tField).setText(tFlatInfo[tProp]);
        }
      }
    }
    const tCheckOnImg = member(getmemnum("button.checkbox.on")).image;
    const tCheckOffImg = member(getmemnum("button.checkbox.off")).image;
    if (tFlatInfo[Symbol.for("showownername")] == 1) {
      this.updateRadioButton("nav_modify_nameshow_yes_radio", ["nav_modify_nameshow_no_radio"]);
    } else {
      this.updateRadioButton("nav_modify_nameshow_no_radio", ["nav_modify_nameshow_yes_radio"]);
    }
    const tMaxVisitorsElm = tWndObj.getElement("nav_maxusers_amount");
    let tMaxVisitors = this.pModifyFlatInfo[Symbol.for("maxVisitors")];
    const tAbsoluteMaxVisitors = this.pModifyFlatInfo[Symbol.for("absoluteMaxVisitors")];
    if (tMaxVisitors > tAbsoluteMaxVisitors) {
      tMaxVisitors = tAbsoluteMaxVisitors;
    }
    tMaxVisitorsElm.setText(this.pModifyFlatInfo[Symbol.for("maxVisitors")]);
  }

  setModifySecondPage() {
    const tFlatInfo = this.pModifyFlatInfo;
    this.ChangeWindowView("nav_gr_mod_b");
    const tWndObj = getWindow(this.pWindowTitle);
    switch (tFlatInfo[Symbol.for("door")]) {
      case "open":
        this.updateRadioButton("nav_modify_door_open_radio", ["nav_modify_door_locked_radio", "nav_modify_door_pw_radio"]);
        this.hidePasswordFields(1);
        break;
      case "closed":
        this.updateRadioButton("nav_modify_door_locked_radio", ["nav_modify_door_open_radio", "nav_modify_door_pw_radio"]);
        this.hidePasswordFields(1);
        break;
      case "password":
        this.updateRadioButton("nav_modify_door_pw_radio", ["nav_modify_door_open_radio", "nav_modify_door_locked_radio"]);
        this.hidePasswordFields(0);
        break;
    }
    this.updateCheckButton("nav_modify_furnituremove_check", tFlatInfo[Symbol.for("ableothersmovefurniture")]);
  }

  leaveModifyPage() {
    const tPage = this.pLastWindowName;
    switch (tPage) {
      case "nav_gr_mod":
        this.pModifyFlatInfo[Symbol.for("name")] = getWindow(this.pWindowTitle).getElement("nav_modify_roomnamefield").getText();
        this.pModifyFlatInfo[Symbol.for("description")] = getWindow(this.pWindowTitle).getElement("nav_modify_roomdescription_field").getText();
        this.pModifyFlatInfo[Symbol.for("maxVisitors")] = getWindow(this.pWindowTitle).getElement("nav_maxusers_amount").getText();
        break;
      case "nav_gr_mod_b":
        this.pModifyFlatInfo[Symbol.for("Password")] = this.getPasswordFromField("nav_modify_door_pw");
        break;
    }
  }

  showHideRefreshRecomLink(tShow) {
    const tWndObj = getWindow(this.pWindowTitle);
    if (!tWndObj) {
      return 0;
    }
    if (!tWndObj.elementExists("nav_refresh_recoms")) {
      return 0;
    }
    const tElem = tWndObj.getElement("nav_refresh_recoms");
    if (tShow) {
      tElem.show();
    } else {
      tElem.hide();
    }
    return 1;
  }

  hidePasswordFields(tHidden) {
    const tPassWordElements = ["nav_modify_door_pw", "nav_modify_door_pw2", "nav_pwfields", "nav_pwdescr"];
    const tWndObj = getWindow(this.pWindowTitle);
    for (const tElemID of tPassWordElements) {
      const tElem = tWndObj.getElement(tElemID);
      tElem.setProperty(Symbol.for("visible"), !tHidden);
    }
  }

  checkModifiedFlatPasswords() {
    const tElementId1 = "nav_modify_door_pw";
    const tElementId2 = "nav_modify_door_pw2";
    const tPw1 = this.pFlatPasswords[tElementId1];
    const tPw2 = this.pFlatPasswords[tElementId2];
    if (tPw1.length == 0) {
      executeMessage(Symbol.for("alert"), propList(Symbol.for("Msg"), "Alert_ForgotSetPassword", Symbol.for("modal"), 1));
      return 0;
    }
    if (tPw1.length < 3) {
      executeMessage(Symbol.for("alert"), propList(Symbol.for("Msg"), "nav_error_passwordtooshort", Symbol.for("modal"), 1));
      return 0;
    }
    if (tPw1 != tPw2) {
      executeMessage(Symbol.for("alert"), propList(Symbol.for("Msg"), "Alert_WrongPassword", Symbol.for("modal"), 1));
      return 0;
    }
    return 1;
  }

  updateRadioButton(tElement, tListOfOthersElements) {
    const tOnImg = member(getmemnum("button.radio.on")).image;
    const tOffImg = member(getmemnum("button.radio.off")).image;
    const tWndObj = getWindow(this.pWindowTitle);
    if (tWndObj.elementExists(tElement)) {
      tWndObj.getElement(tElement).feedImage(tOnImg);
    }
    for (const tRadioElement of tListOfOthersElements) {
      if (tWndObj.elementExists(tRadioElement)) {
        tWndObj.getElement(tRadioElement).feedImage(tOffImg);
      }
    }
  }

  updateCheckButton(tElement, tstate) {
    const tOnImg = member(getmemnum("button.checkbox.on")).image;
    const tOffImg = member(getmemnum("button.checkbox.off")).image;
    const tWndObj = getWindow(this.pWindowTitle);
    if (tstate) {
      if (tWndObj.elementExists(tElement)) {
        tWndObj.getElement(tElement).feedImage(tOnImg);
      }
    } else {
      if (tWndObj.elementExists(tElement)) {
        tWndObj.getElement(tElement).feedImage(tOffImg);
      }
    }
  }

  prepareCategoryDropMenu(tNodeId) {
    const tWndObj = getWindow(this.pWindowTitle);
    if (tWndObj == 0) {
      return 0;
    }
    const tDefaultCatId = this.getComponent().getNodeProperty(tNodeId, Symbol.for("parentid"));
    const tDropDown = tWndObj.getElement("nav_choosecategory");
    if (!ilk(tDropDown, Symbol.for("instance"))) {
      return error(this, `Unable to retrieve dropdown: ${tDropDown}`, Symbol.for("prepareCategoryDropMenu"), Symbol.for("major"));
    }
    const tCatProps = getObject(Symbol.for("session")).GET("user_flat_cats");
    if (!ilk(tCatProps, Symbol.for("propList"))) {
      return error(this, `Category list was not a property list: ${tCatProps}`, Symbol.for("prepareCategoryDropMenu"), Symbol.for("major"));
    }
    const tCatTxtItems = [];
    const tCatKeyItems = [];
    for (let i = 1; i <= tCatProps.count; i++) {
      tCatTxtItems[i] = getAt(tCatProps, i);
      tCatKeyItems[i] = getPropAt(tCatProps, i);
    }
    let tDefaultCatItem = tCatKeyItems.getPos(tDefaultCatId);
    if (tDefaultCatItem == 0) {
      tDefaultCatItem = 1;
    }
    tDropDown.updateData(tCatTxtItems, tCatKeyItems, tDefaultCatItem);
    return 1;
  }

  eventProcNavigatorPublic(tEvent, tSprID, tParm) {
    if (tEvent == Symbol.for("mouseDown")) {
      switch (tSprID) {
        case "nav_closeInfo":
          this.setRoomInfoArea(Symbol.for("hide"));
          break;
        case "nav_tb_guestRooms":
          this.setLoadingCursor(1);
          this.setRoomInfoArea(Symbol.for("show"));
          this.ChangeWindowView("nav_gr0");
          break;
        case "nav_roomlistBackLinks":
          return this.getComponent().expandHistoryItem(integer(tParm.locV / this.pHistoryItemHeight) + 1);
        case "nav_roomlist":
          this.handleRoomListClicked(tParm);
          break;
        case "create_room":
        case "nav_public_helptext":
          return executeMessage(Symbol.for("open_roomkiosk"));
      }
    } else if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
          return this.hideNavigator(Symbol.for("hide"));
        case "nav_go_button":
          return this.getComponent().prepareRoomEntry(this.getProperty(Symbol.for("viewedNodeId")));
        case "nav_addtofavourites_button":
          this.getComponent().sendAddFavoriteFlat(this.getProperty(Symbol.for("viewedNodeId")));
          return this.getComponent().sendGetFavoriteFlats();
        case "nav_hidefull":
          return this.getComponent().showHideFullRooms(this.getProperty(Symbol.for("categoryId")));
      }
    }
  }

  eventProcNavigatorPrivate(tEvent, tSprID, tParm) {
    if (tEvent == Symbol.for("mouseDown")) {
      switch (tSprID) {
        case "nav_closeInfo":
          this.setRoomInfoArea(Symbol.for("hide"));
          break;
        case "nav_tb_publicRooms":
          this.setLoadingCursor(1);
          this.setRoomInfoArea(Symbol.for("show"));
          this.ChangeWindowView("nav_pr");
          break;
        case "nav_tb_guestRooms":
          this.setLoadingCursor(1);
          this.ChangeWindowView("nav_gr0");
          break;
        case "nav_tab_srch":
          this.ChangeWindowView("nav_gr_src");
          break;
        case "nav_tab_own":
          this.setLoadingCursor(1);
          this.ChangeWindowView("nav_gr_own");
          executeMessage(Symbol.for("tutorial_ownrooms_tab_clicked"));
          break;
        case "nav_tab_fav":
          this.setLoadingCursor(1);
          this.ChangeWindowView("nav_gr_fav");
          break;
        case "nav_roomlistBackLinks":
          this.setLoadingCursor(1);
          return this.getComponent().expandHistoryItem(integer(tParm.locV / this.pHistoryItemHeight) + 1);
      }
    } else if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "nav_recom_roomlist":
          this.setLoadingCursor(1);
          return this.handleRecommendedRoomListClicked(tParm);
        case "nav_roomlist":
          this.setLoadingCursor(1);
          return this.handleRoomListClicked(tParm);
        case "close":
          this.hideNavigator(Symbol.for("hide"));
          break;
        case "nav_go_button":
          return this.getComponent().prepareRoomEntry(this.getProperty(Symbol.for("viewedNodeId")));
        case "nav_private_button_search":
          return this.startFlatSearch();
        case "nav_modify_button":
          this.modifyPrivateRoom(this.getProperty(Symbol.for("viewedNodeId")));
          break;
        case "nav_addtofavourites_button":
          this.getComponent().sendAddFavoriteFlat(this.getProperty(Symbol.for("viewedNodeId")));
          this.getComponent().sendGetFavoriteFlats();
          break;
        case "nav_removefavourites_button":
          this.getComponent().sendRemoveFavoriteFlat(this.getProperty(Symbol.for("viewedNodeId")));
          this.setProperty(Symbol.for("viewedNodeId"), VOID);
          this.setRoomInfoArea(Symbol.for("hide"));
          this.getComponent().sendGetFavoriteFlats();
          break;
        case "nav_ringbell_cancel_button":
        case "nav_flatpassword_cancel_button":
        case "nav_trypw_cancel_button":
        case "nav_noanswer_ok_button":
          this.ChangeWindowView("nav_gr0");
          this.getComponent().updateState("enterEntry");
          break;
        case "nav_flatpassword_ok_button":
          {
            const tLastClickedId = this.getProperty(Symbol.for("passwordNodeId"));
            const tCategory = this.getProperty(Symbol.for("categoryId"));
            const tTemp = this.getPasswordFromField("nav_flatpassword_field");
            if (voidp(tTemp) || (tTemp == EMPTY)) {
              return;
            }
            const tFlatData = this.getComponent().getNodeInfo(tLastClickedId, tCategory);
            if (tFlatData == 0) {
              return 0;
            }
            tFlatData[Symbol.for("Password")] = tTemp;
            this.getComponent().updateSingleSubNodeInfo(tFlatData);
            this.ChangeWindowView("nav_gr_trypassword");
            this.getComponent().executeRoomEntry(tLastClickedId);
            break;
          }
        case "nav_tryagain_ok_button":
          this.pFlatPasswords["nav_flatpassword_field"] = EMPTY;
          this.ChangeWindowView("nav_gr_password");
          break;
        case "nav_createroom_button":
        case "nav_createroom_icon":
          return executeMessage(Symbol.for("open_roomkiosk"));
        case "nav_hidefull":
          return this.getComponent().showHideFullRooms(this.getProperty(Symbol.for("categoryId")));
        case "nav_refresh_recoms":
          return this.getComponent().updateRecomRooms();
      }
    } else if (tEvent == Symbol.for("keyDown")) {
      switch (tSprID) {
        case "nav_private_search_field":
          if (the.key == RETURN) {
            return this.startFlatSearch();
          }
          break;
        case "OLD":
        case "nav_flatpassword_field":
          {
            const tKeyCatched = this.passwordFieldTypeEvent(tSprID, 0);
            if (tKeyCatched) {
              let pPasswordChecked = 0;
              const tTimeoutHideName = `asteriskUpdate${the.milliSeconds}`;
              createTimeout(tTimeoutHideName, 1, Symbol.for("updatePasswordAsterisks"), this.getID(), [this.pWindowTitle, tSprID], 1);
            }
            return 0;
          }
      }
    }
  }

  eventProcNavigatorModify(tEvent, tSprID, tParm) {
    let tNodeId = this.getProperty(Symbol.for("viewedNodeId"));
    if (tEvent == Symbol.for("mouseDown")) {
      switch (tSprID) {
        case "nav_modify_removerights":
          this.ChangeWindowView("nav_remove_rights");
          break;
        case "nav_remove_rights_cancel_2":
          this.setModifySecondPage();
          break;
        case "nav_remove_rights_ok_2":
          tNodeId = this.getProperty(Symbol.for("viewedNodeId"), Symbol.for("mod"));
          this.getComponent().sendRemoveAllRights(tNodeId);
          this.setModifySecondPage();
          break;
        case "nav_maxusers_minus":
          {
            let tMaxVisitors = integer(this.getComponent().getNodeProperty(tNodeId, Symbol.for("maxVisitors")) - 5);
            if (tMaxVisitors < 10) {
              tMaxVisitors = 10;
            }
            getWindow(this.pWindowTitle).getElement("nav_maxusers_amount").setText(tMaxVisitors);
            this.getComponent().setNodeProperty(tNodeId, Symbol.for("maxVisitors"), tMaxVisitors);
            break;
          }
        case "nav_maxusers_plus":
          {
            const tAbsoluteMax = this.getComponent().getNodeProperty(tNodeId, Symbol.for("absoluteMaxVisitors"));
            let tMaxVisitors = integer(this.getComponent().getNodeProperty(tNodeId, Symbol.for("maxVisitors")) + 5);
            if (tMaxVisitors > tAbsoluteMax) {
              tMaxVisitors = tAbsoluteMax;
            }
            getWindow(this.pWindowTitle).getElement("nav_maxusers_amount").setText(tMaxVisitors);
            this.getComponent().setNodeProperty(tNodeId, Symbol.for("maxVisitors"), tMaxVisitors);
            break;
          }
        case "nav_modify_nameshow_yes_radio":
          this.getComponent().setNodeProperty(tNodeId, Symbol.for("showownername"), "1");
          this.updateRadioButton("nav_modify_nameshow_yes_radio", ["nav_modify_nameshow_no_radio"]);
          break;
        case "nav_modify_nameshow_no_radio":
          this.getComponent().setNodeProperty(tNodeId, Symbol.for("showownername"), "0");
          this.updateRadioButton("nav_modify_nameshow_no_radio", ["nav_modify_nameshow_yes_radio"]);
          break;
        case "nav_modify_door_open_radio":
          this.getComponent().setNodeProperty(tNodeId, Symbol.for("door"), "open");
          this.updateRadioButton("nav_modify_door_open_radio", ["nav_modify_door_locked_radio", "nav_modify_door_pw_radio"]);
          this.pDoorStatusModified = 1;
          this.hidePasswordFields(1);
          break;
        case "nav_modify_door_locked_radio":
          this.getComponent().setNodeProperty(tNodeId, Symbol.for("door"), "closed");
          this.updateRadioButton("nav_modify_door_locked_radio", ["nav_modify_door_open_radio", "nav_modify_door_pw_radio"]);
          this.pDoorStatusModified = 1;
          this.hidePasswordFields(1);
          break;
        case "nav_modify_door_pw_radio":
          this.getComponent().setNodeProperty(tNodeId, Symbol.for("door"), "password");
          this.updateRadioButton("nav_modify_door_pw_radio", ["nav_modify_door_open_radio", "nav_modify_door_locked_radio"]);
          this.pDoorStatusModified = 1;
          this.hidePasswordFields(0);
          break;
        case "nav_modify_furnituremove_check":
          {
            const tValue = integer(!this.getComponent().getNodeProperty(tNodeId, Symbol.for("ableothersmovefurniture")));
            this.getComponent().setNodeProperty(tNodeId, Symbol.for("ableothersmovefurniture"), tValue);
            this.updateCheckButton("nav_modify_furnituremove_check", tValue);
            break;
          }
      }
    } else if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
          executeMessage(Symbol.for("removeEnterRoomAlert"));
          this.hideNavigator(Symbol.for("hide"));
          break;
        case "nav_go_button":
          this.getComponent().prepareRoomEntry(tNodeId);
          break;
        case "nav_choosecategory":
          return this.getComponent().setNodeProperty(tNodeId, Symbol.for("parentid"), tParm);
        case "nav_modify_next":
          this.leaveModifyPage();
          this.setModifySecondPage();
          break;
        case "nav_modify_prev":
          this.leaveModifyPage();
          this.setModifyFirstPage();
          break;
        case "nav_modify_ready":
          {
            if (voidp(tNodeId)) {
              return 0;
            }
            this.leaveModifyPage();
            const tWndObj = getWindow(this.pWindowTitle);
            const tFlatData = this.getComponent().getNodeInfo(tNodeId, Symbol.for("own"));
            if ((tFlatData[Symbol.for("door")] == "password") && this.pDoorStatusModified) {
              if (!this.checkModifiedFlatPasswords()) {
                return 0;
              }
            }
            tFlatData[Symbol.for("name")] = replaceChars(this.pModifyFlatInfo[Symbol.for("name")].line[1], "/", EMPTY);
            if (tFlatData[Symbol.for("name")] == EMPTY) {
              return 0;
            }
            tFlatData[Symbol.for("description")] = this.pModifyFlatInfo[Symbol.for("description")];
            tFlatData[Symbol.for("Password")] = this.pModifyFlatInfo[Symbol.for("Password")];
            tFlatData[Symbol.for("name")] = convertSpecialChars(tFlatData[Symbol.for("name")], 1);
            tFlatData[Symbol.for("description")] = convertSpecialChars(tFlatData[Symbol.for("description")], 1);
            this.getComponent().sendupdateFlatInfo(tFlatData);
            if (tFlatData.findPos(Symbol.for("parentid")) != VOID) {
              this.getComponent().sendSetFlatCategory(tNodeId, tFlatData[Symbol.for("parentid")]);
            }
            this.getComponent().callNodeUpdate();
            this.ChangeWindowView("nav_gr_mod2");
            break;
          }
        case "nav_modify_ok":
          executeMessage(Symbol.for("removeEnterRoomAlert"));
          this.ChangeWindowView("nav_gr_own");
          break;
        case "nav_modify_cancel":
          executeMessage(Symbol.for("removeEnterRoomAlert"));
          this.ChangeWindowView("nav_gr_own");
          break;
        case "nav_modify_deleteroom":
          executeMessage(Symbol.for("removeEnterRoomAlert"));
          this.ChangeWindowView("nav_gr_modify_delete1");
          break;
        case "nav_modifyBackTab":
          this.ChangeWindowView("nav_gr_own");
          break;
        default:
          if (voidp(tNodeId)) {
            return 0;
          }
          if (tSprID.contains("nav_delete_room_ok_")) {
            switch (tSprID.char[tSprID.length]) {
              case 1:
                this.ChangeWindowView("nav_gr_modify_delete2");
                break;
              case 2:
                this.ChangeWindowView("nav_gr_modify_delete3");
                break;
              case 3:
                this.setProperty(Symbol.for("viewedNodeId"), VOID, Symbol.for("own"));
                this.getComponent().sendDeleteFlat(tNodeId);
                this.getComponent().sendGetOwnFlats();
                this.ChangeWindowView("nav_gr_own");
                break;
            }
          } else if (tSprID.contains("nav_delete_room_cancel_")) {
            this.modifyPrivateRoom(tNodeId);
          }
          break;
      }
    } else if (tEvent == Symbol.for("keyDown")) {
      switch (tSprID) {
        case "nav_modify_door_pw":
        case "nav_modify_door_pw2":
          {
            const tKeyCatched = this.passwordFieldTypeEvent(tSprID, 1);
            if (tKeyCatched) {
              let pPasswordChecked = 0;
              const tTimeoutHideName = `asteriskUpdate${the.milliSeconds}`;
              createTimeout(tTimeoutHideName, 1, Symbol.for("updatePasswordAsterisks"), this.getID(), [this.pWindowTitle, tSprID], 1);
            }
            return 0;
          }
        case "nav_modify_roomdescription_field":
        case "nav_modify_roomnamefield":
          {
            const tKeyCode = the.keyCode;
            switch (tKeyCode) {
              case 36:
              case 76:
                return 1;
            }
            break;
          }
      }
    }
  }

  passwordFieldTypeEvent(tSprID, tCheckLength) {
    if (voidp(tSprID)) {
      return error(this, "No password field defined!", Symbol.for("passwordFieldTypeEvent"), Symbol.for("minor"));
    }
    if (voidp(tCheckLength)) {
      tCheckLength = 1;
    }
    let tValidKeys = getVariable("permitted.name.chars", "1234567890qwertyuiopasdfghjklzxcvbnm_-=+?!@<>:.,");
    if (voidp(this.pFlatPasswords[tSprID])) {
      this.pFlatPasswords[tSprID] = EMPTY;
    }
    switch (the.keyCode) {
      case 36:
      case 76:
        return 1;
      case 48:
        return 0;
      case 123:
      case 124:
      case 125:
      case 126:
        return 1;
      case 51:
        if (this.pFlatPasswords[tSprID].length > 0) {
          const tTempPass = this.pFlatPasswords[tSprID];
          this.pFlatPasswords[tSprID] = chars(tTempPass, 1, tTempPass.length - 1);
        }
        break;
      case 117:
        getWindow(this.pWindowTitle).getElement(tSprID).setText(EMPTY);
        this.pFlatPasswords[tSprID] = EMPTY;
        break;
      default:
        tValidKeys = getVariable("permitted.name.chars");
        const tTheKey = the.key;
        if (!(tValidKeys == "void")) {
          if (!tValidKeys.contains(tTheKey)) {
            const tMessageTxt = `${getText("reg_use_allowed_chars")}${RETURN}${tValidKeys}`;
            executeMessage(Symbol.for("alert"), propList(Symbol.for("Msg"), tMessageTxt, Symbol.for("modal"), 1));
            return 1;
          }
          if (tCheckLength) {
            if (this.pFlatPasswords[tSprID].length > getIntVariable("pass.length.max", 16)) {
              executeMessage(Symbol.for("alert"), propList(Symbol.for("Msg"), "alert_shortenPW", Symbol.for("modal"), 1));
              return 1;
            }
          }
        }
        break;
    }
    return 1;
  }
}
