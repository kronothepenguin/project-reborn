export default class {
  pFriendListWindowID;
  pMaxCategories;
  pMaxFreeCategories;
  pWindowDefaultHeight;
  pViewsList;
  pCurrentCategoryID;
  pRemoveConfirmID;
  pConfirmDeleteFriend;
  pMinimized;
  pCategoryHighlBaseID;
  pHighlightedCategories;
  pInboxBlinkStep;
  pInfoPopupId;

  construct() {
    this.pFriendListWindowID = getUniqueID();
    this.pRemoveConfirmID = getText("friend_list_confirm_remove");
    this.pConfirmDeleteFriend = VOID;
    this.pCurrentCategoryID = getVariable("fr.window.default.category.id");
    this.pMaxFreeCategories = getVariable("fr.window.max.free.categories");
    this.pMaxCategories = this.pMaxFreeCategories + 4;
    this.pMinimized = 0;
    this.pViewsList = propList();
    this.pCategoryHighlBaseID = "fr_category_highlighter_";
    this.pHighlightedCategories = list();
    this.pInboxBlinkStep = 0;
    this.pInfoPopupId = "friend_infobox_handler";
    registerMessage(Symbol.for("toggle_friend_list"), this.getID(), Symbol.for("toggleFriendList"));
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("updateActionIconsState"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("updateActionIconsState"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("updateActionIconsState"));
    registerMessage(Symbol.for("enterRoomDirect"), this.getID(), Symbol.for("updateActionIconsState"));
    registerMessage(Symbol.for("gamesystem_constructed"), this.getID(), Symbol.for("closeFriendList"));
    return 1;
  }

  deconstruct() {
    this.endInboxBlink();
    if (windowExists(this.pRemoveConfirmID)) {
      removeWindow(this.pRemoveConfirmID);
    }
    if (windowExists(this.pFriendListWindowID)) {
      removeWindow(this.pFriendListWindowID);
    }
    if (objectExists(this.pInfoPopupId)) {
      removeObject(this.pInfoPopupId);
    }
    unregisterMessage(Symbol.for("toggle_friend_list"), this.getID());
    unregisterMessage(Symbol.for("enterRoom"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    unregisterMessage(Symbol.for("enterRoomDirect"), this.getID());
    unregisterMessage(Symbol.for("gamesystem_constructed"), this.getID());
    return 1;
  }

  createFriendList() {
    if (!this.getComponent().isFriendListInited()) {
      return 0;
    }
    if (windowExists(this.pFriendListWindowID)) {
      return 0;
    }
    createWindow(this.pFriendListWindowID, "friends_list_base.window");
    let tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tWndContentID = `${getVariable(`fr.category.content.id.${this.pCurrentCategoryID}`)}.window`;
    tWndObj.merge(tWndContentID);
    tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseWithin"));
    tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseLeave"));
    tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("keyDown"));
    this.pWindowDefaultHeight = tWndObj.getProperty(Symbol.for("height"));
    this.changeCategory(this.pCurrentCategoryID);
    return 1;
  }

  openFriendList() {
    let tWndObj;
    if (!windowExists(this.pFriendListWindowID)) {
      if (this.createFriendList()) {
        tWndObj = getWindow(this.pFriendListWindowID);
        tWndObj.moveTo(15, 65);
      } else {
        return 0;
      }
    } else {
      tWndObj = getWindow(this.pFriendListWindowID);
      tWndObj.show();
      activateWindowObj(this.pFriendListWindowID);
    }
  }

  closeFriendList() {
    this.removeInputFieldFocus();
    if (objectExists(this.pInfoPopupId)) {
      removeObject(this.pInfoPopupId);
    }
    if (windowExists(this.pFriendListWindowID)) {
      const tWndObj = getWindow(this.pFriendListWindowID);
      tWndObj.hide();
    }
  }

  toggleFriendList() {
    if (!windowExists(this.pFriendListWindowID)) {
      return this.openFriendList();
    }
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj.getProperty(Symbol.for("visible"))) {
      this.closeFriendList();
    } else {
      this.openFriendList();
    }
  }

  minimizedView(tMinimized) {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (voidp(tMinimized)) {
      if (this.pMinimized == 0) {
        tMinimized = 1;
      } else {
        tMinimized = 0;
      }
    }
    if (tMinimized) {
      this.pMinimized = 1;
      this.changeCategory(this.pCurrentCategoryID);
    } else {
      this.pMinimized = 0;
      this.changeCategory(this.pCurrentCategoryID);
    }
  }

  isFriendRequestViewOpen() {
    return this.pCurrentCategoryID == -2;
  }

  addFriend(tFriendData, tHoldRender) {
    if (tFriendData == 0) {
      return 0;
    }
    const tCategoryId = tFriendData[Symbol.for("categoryId")];
    const tViewObj = this.getViewListObject(tCategoryId);
    if (tViewObj == 0) {
      return 0;
    }
    tViewObj.addFriend(tFriendData);
    this.setCategoryHighlight(tCategoryId);
    if (!tHoldRender && (this.pCurrentCategoryID == tCategoryId)) {
      this.updateOpenCategoryPanel();
    }
    this.updateCategoryCounts();
  }

  addFriendRequest(tRequest) {
    const tCategoryId = -2;
    const tViewObj = this.getViewListObject(tCategoryId);
    if (tViewObj == 0) {
      return 0;
    }
    tViewObj.addRequest(tRequest);
    this.setCategoryHighlight(tCategoryId);
    if (this.pCurrentCategoryID == tCategoryId) {
      this.updateOpenCategoryPanel();
    }
  }

  setCategoryHighlight(tCategoryId) {
    const tAllowedCategories = getVariableValue("fr.category.highlights.allowed", list());
    if (tAllowedCategories.getOne(tCategoryId) && ((this.pCurrentCategoryID != tCategoryId) || this.pMinimized)) {
      if (!this.pHighlightedCategories.getOne(tCategoryId)) {
        this.pHighlightedCategories.add(tCategoryId);
      }
      this.showCategoryTitle(tCategoryId, VOID, VOID, VOID);
      const tTimeoutID = `${this.pCategoryHighlBaseID}${tCategoryId}`;
      if (timeoutExists(tTimeoutID)) {
        removeTimeout(tTimeoutID);
      }
      const tTimeoutTime = integer(getVariable("fr.category.highlight.duration"));
      createTimeout(tTimeoutID, tTimeoutTime, Symbol.for("removeCategoryHighlight"), this.getID(), tCategoryId, 1);
    }
  }

  removeCategoryHighlight(tCategoryId) {
    if (this.pHighlightedCategories.deleteOne(tCategoryId)) {
      this.showCategoryTitle(tCategoryId, VOID, VOID, VOID);
    }
    const tTimeoutID = `${this.pCategoryHighlBaseID}${tCategoryId}`;
    if (timeoutExists(tTimeoutID)) {
      removeTimeout(tTimeoutID);
    }
  }

  updateFriend(tFriendData, tHoldRender) {
    if (tFriendData == 0) {
      return 0;
    }
    const tViewObj = this.getViewListObject(tFriendData[Symbol.for("categoryId")]);
    if (!(tViewObj == 0)) {
      tViewObj.updateFriend(tFriendData);
    }
    if (tHoldRender) {
      return 1;
    }
    if (this.pCurrentCategoryID == tFriendData[Symbol.for("categoryId")]) {
      this.updateOpenCategoryPanel();
    }
  }

  removeFriend(tFriendID, tCategory, tHoldRender) {
    const tViewObj = this.getViewListObject(tCategory);
    if (!(tViewObj == 0)) {
      tViewObj.removeFriend(tFriendID);
    }
    if (tHoldRender) {
      return 1;
    }
    if (this.pCurrentCategoryID == tCategory) {
      this.updateOpenCategoryPanel();
    }
  }

  updateCategoryCounts() {
    const tCategoryList = this.getComponent().getCategoryList();
    for (const tCategory of tCategoryList) {
      const tCount = this.getComponent().getItemCountForcategory(tCategory[Symbol.for("id")]);
      this.showCategoryTitle(tCategory[Symbol.for("id")], VOID, VOID, tCount);
    }
  }

  removeInputFieldFocus() {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (tWndObj.elementExists("search_input")) {
      tWndObj.getElement("search_input").setFocus(0);
    }
  }

  changeCategory(tCategoryId) {
    if (objectExists(this.pInfoPopupId)) {
      removeObject(this.pInfoPopupId);
    }
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (voidp(tCategoryId)) {
      tCategoryId = this.pCurrentCategoryID;
    }
    this.removeCategoryHighlight(tCategoryId);
    if (tCategoryId != this.pCurrentCategoryID) {
      if (this.pCurrentCategoryID == -3) {
        this.removeInputFieldFocus();
      }
      tWndObj.unmerge();
      const tContentID = getVariable(`fr.category.content.id.${tCategoryId}`);
      if (!tWndObj.merge(`${tContentID}.window`)) {
        return error(this, `Unable to merge content for category ${tCategoryId}`, Symbol.for("changeCategory"), Symbol.for("major"));
      }
    }
    for (let tNo = 1; tNo <= this.pMaxFreeCategories; tNo++) {
      const tBgElemID = `category_element_${tNo}`;
      if (tWndObj.elementExists(tBgElemID)) {
        const tElem = tWndObj.getElement(tBgElemID);
        tElem.hide();
      }
      const tTitleElemID = `category_title_${tNo}`;
      if (tWndObj.elementExists(tTitleElemID)) {
        const tElem = tWndObj.getElement(tTitleElemID);
        tElem.hide();
      }
    }
    const tCategoryList = this.getComponent().getCategoryList();
    const tCategoryTitleHeight = getVariable("fr.category.height");
    const tCategoryContentHeight = tWndObj.getElement("list_panel").getProperty(Symbol.for("height"));
    const tActionsPanelHeight = tWndObj.getElement("actions_panel").getProperty(Symbol.for("height"));
    let tCurrentOffsetV = getVariable("fr.category.offset.top");
    for (const tCategory of tCategoryList) {
      const tCount = this.getComponent().getItemCountForcategory(tCategory[Symbol.for("id")]);
      this.showCategoryTitle(tCategory[Symbol.for("id")], tCurrentOffsetV, tCategory[Symbol.for("name")], tCount);
      tCurrentOffsetV = tCurrentOffsetV + tCategoryTitleHeight;
      if (tCategory[Symbol.for("id")] == tCategoryId) {
        this.moveCategoryContent(tCurrentOffsetV);
        if (!this.pMinimized) {
          tCurrentOffsetV = tCurrentOffsetV + tCategoryContentHeight + tActionsPanelHeight + 1;
        }
      }
    }
    let tHiddenAmountPx;
    if (this.pMinimized) {
      tHiddenAmountPx = ((this.pMaxCategories - tCategoryList.count) * tCategoryTitleHeight) + tCategoryContentHeight + tActionsPanelHeight + 1;
    } else {
      tHiddenAmountPx = (this.pMaxCategories - tCategoryList.count) * tCategoryTitleHeight;
      if (tCategoryId == -2) {
        executeMessage(Symbol.for("FriendRequestListOpened"));
      }
    }
    tWndObj.resizeTo(tWndObj.getProperty(Symbol.for("width")), this.pWindowDefaultHeight - tHiddenAmountPx);
    this.pCurrentCategoryID = tCategoryId;
    this.updateOpenCategoryPanel();
    this.updateActionIconsState();
  }

  updateOpenCategoryPanel() {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
    if (this.pCurrentCategoryID == -2) {
      tViewObj.cleanUp();
    }
    const tContentElem = tWndObj.getElement("list_panel");
    if ((this.pCurrentCategoryID == -3) && (this.getComponent().getHabboSearchLastString() == EMPTY)) {
      tViewObj.pListImg = image(1, 1, 32);
      tViewObj.pNeedsRender = 0;
    }
    if (tViewObj.needsRender()) {
      tViewObj.resetRenderFlag();
      tViewObj.renderListImage();
      if (tViewObj.hasQueue()) {
        receiveUpdate(this.getID());
      } else {
        const tListImage = tViewObj.getViewImage();
        tContentElem.feedImage(tListImage);
      }
    } else {
      const tListImage = tViewObj.getViewImage();
      tContentElem.feedImage(tListImage);
    }
    this.updateActionIconsState();
  }

  update() {
    const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
    if (!tViewObj.hasQueue()) {
      removeUpdate(this.getID());
      return 1;
    }
    const tElem = this.getContentElement();
    if (tElem != 0) {
      tViewObj.update(tElem);
    }
  }

  getContentElement() {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    return tWndObj.getElement("list_panel");
  }

  showCategoryTitle(tID, tLocV, tName, tItemCount) {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    let tHighLighted = 0;
    if (this.pHighlightedCategories.getOne(tID)) {
      tHighLighted = 1;
    }
    const tElemBaseName = `category_element_${tID}`;
    if (!tWndObj.elementExists(tElemBaseName)) {
      return 0;
    }
    const tElemBase = tWndObj.getElement(tElemBaseName);
    tElemBase.show();
    if (voidp(tName)) {
      tName = this.getComponent().getCategoryName(tID);
    }
    if (voidp(tItemCount)) {
      tItemCount = this.getComponent().getItemCountForcategory(tID);
    }
    let tText = getVariable("fr.category.title.template");
    tText = replaceChunks(tText, "%name%", tName);
    tText = replaceChunks(tText, "%count%", tItemCount);
    const tElemText = tWndObj.getElement(`category_title_${tID}`);
    tElemText.show();
    tElemText.setText(tText);
    if (tHighLighted) {
      const tmember = getMember(getVariable("fr.category.background.highlighted"));
      const tTextColor = rgb(string(getVariable("fr.category.text.color.highlighted")));
      tElemBase.setProperty(Symbol.for("member"), tmember);
      tElemBase.setProperty(Symbol.for("width"), getVariable("fr.category.width"));
      const tFont = tElemText.getFont();
      tFont[Symbol.for("color")] = tTextColor;
      tElemText.setFont(tFont);
    } else {
      if (tID >= 0) {
        let tmember;
        let tTextColor;
        if (tItemCount > 0) {
          tmember = getMember(getVariable("fr.category.background.active"));
          tTextColor = rgb(string(getVariable("fr.category.text.color.active")));
        } else {
          tmember = getMember(getVariable("fr.category.background.inactive"));
          tTextColor = rgb(string(getVariable("fr.category.text.color.inactive")));
        }
        tElemBase.setProperty(Symbol.for("member"), tmember);
        tElemBase.setProperty(Symbol.for("width"), getVariable("fr.category.width"));
        const tFont = tElemText.getFont();
        tFont[Symbol.for("color")] = tTextColor;
        tElemText.setFont(tFont);
      } else {
        if (tID == -2) {
          const tmember = getMember(getVariable("fr.category.background.requests"));
          tElemBase.setProperty(Symbol.for("member"), tmember);
          tElemBase.setProperty(Symbol.for("width"), getVariable("fr.category.width"));
          const tTextColor = rgb(string(getVariable("fr.category.text.color.requests")));
          const tFont = tElemText.getFont();
          tFont[Symbol.for("color")] = tTextColor;
          tElemText.setFont(tFont);
        }
      }
    }
    if (!voidp(tLocV)) {
      tElemText.moveTo(tElemText.getProperty(Symbol.for("locH")), tLocV + 3);
      tElemBase.moveTo(tElemBase.getProperty(Symbol.for("locH")), tLocV);
    }
  }

  activateMailIcon(tIconIsActive) {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (!tWndObj.elementExists("mail_inbox_icon")) {
      return 0;
    }
    const tElem = tWndObj.getElement("mail_inbox_icon");
    if (tIconIsActive) {
      tElem.setProperty(Symbol.for("member"), "friends_mini_mail_button_active");
    } else {
      tElem.setProperty(Symbol.for("member"), "friends_mini_mail_button_inactive");
    }
  }

  moveCategoryContent(tLocV) {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    let tLocalOffsetV = 0;
    tLocalOffsetV = tLocalOffsetV + getVariable("fr.category.offset.top");
    tLocalOffsetV = tLocalOffsetV + getVariable("fr.category.height");
    tLocV = tLocV - tLocalOffsetV;
    const tElemPanel = tWndObj.getElement("list_panel");
    const tElemScroll = tWndObj.getElement("list_scroll");
    const tElemBG = tWndObj.getElement("actions_panel");
    const tElemPanelBg = tWndObj.getElement("list_panel_bg");
    const tElemPanelHeight = tElemPanel.getProperty(Symbol.for("height"));
    const tElemBgHeight = tElemBG.getProperty(Symbol.for("height"));
    let tContentBottom;
    if (this.pMinimized) {
      tElemPanel.setProperty(Symbol.for("visible"), 0);
      tElemScroll.setProperty(Symbol.for("visible"), 0);
      tElemBG.setProperty(Symbol.for("visible"), 0);
      tElemPanelBg.setProperty(Symbol.for("visible"), 0);
      tContentBottom = tElemPanel.getProperty(Symbol.for("locV")) + tElemPanelHeight;
    } else {
      tElemPanel.setProperty(Symbol.for("visible"), 1);
      tElemScroll.setProperty(Symbol.for("visible"), 1);
      tElemBG.setProperty(Symbol.for("visible"), 1);
      tElemPanelBg.setProperty(Symbol.for("visible"), 1);
      tElemPanel.moveTo(tElemPanel.getProperty(Symbol.for("locH")), tLocV);
      tElemScroll.moveTo(tElemScroll.getProperty(Symbol.for("locH")), tLocV);
      tElemPanelBg.moveTo(tElemScroll.getProperty(Symbol.for("locH")), tLocV);
      tContentBottom = tElemPanel.getProperty(Symbol.for("locV")) + tElemPanelHeight;
      tElemBG.moveTo(tElemBG.getProperty(Symbol.for("locH")), tContentBottom);
    }
    const tActions = list();
    tActions.add("mail_compose_icon");
    tActions.add("home_icon");
    tActions.add("invite_icon");
    tActions.add("remove_icon");
    tActions.add("requests_accept_all_text");
    tActions.add("requests_dismiss_all_text");
    tActions.add("requests_accept_all");
    tActions.add("requests_dismiss_all");
    tActions.add("search_button");
    tActions.add("search_button_text");
    tActions.add("search_input");
    for (const tElemID of tActions) {
      if (tWndObj.elementExists(tElemID)) {
        const tElem = tWndObj.getElement(tElemID);
        const tRect = tElem.getProperty(Symbol.for("rect"));
        const tOffV = (tElemBgHeight - tElem.getProperty(Symbol.for("height"))) / 2;
        tElem.moveTo(tElem.getProperty(Symbol.for("locH")), tContentBottom + tOffV);
        if (this.pMinimized) {
          tElem.setProperty(Symbol.for("visible"), 0);
          continue;
        }
        tElem.setProperty(Symbol.for("visible"), 1);
      }
    }
  }

  updateActionIconsState() {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
    if (value(this.pCurrentCategoryID) >= -1) {
      const tSelectedFriends = tViewObj.getSelectedFriends();
      let tInvitesInUse = 0;
      if (variableExists("client.use.invites")) {
        if (getVariable("client.use.invites") == 1) {
          tInvitesInUse = 1;
        }
      }
      const tActions = list();
      tActions.add([Symbol.for("icon"): "mail_compose_icon", Symbol.for("multiselection"): 1, Symbol.for("allowedroom"): Symbol.for("all"), Symbol.for("used"): 1]);
      tActions.add([Symbol.for("icon"): "invite_icon", Symbol.for("multiselection"): 1, Symbol.for("allowedroom"): Symbol.for("room"), Symbol.for("used"): tInvitesInUse]);
      tActions.add([Symbol.for("icon"): "home_icon", Symbol.for("multiselection"): 0, Symbol.for("allowedroom"): Symbol.for("all"), Symbol.for("used"): 1]);
      tActions.add([Symbol.for("icon"): "remove_icon", Symbol.for("multiselection"): 0, Symbol.for("allowedroom"): Symbol.for("all"), Symbol.for("used"): 1]);
      for (const tElemData of tActions) {
        const tElemName = tElemData[Symbol.for("icon")];
        const tMulti = tElemData[Symbol.for("multiselection")];
        if (tWndObj.elementExists(tElemName)) {
          const tElement = tWndObj.getElement(tElemName);
          if ((tSelectedFriends.count > 1) && (tMulti == 0)) {
            tElement.setProperty(Symbol.for("blend"), getVariable("fr.actions.inactive.blend"));
          } else {
            if ((tSelectedFriends.count > 1) && (tMulti == 1)) {
              tElement.setProperty(Symbol.for("blend"), 100);
            } else {
              if (tSelectedFriends.count == 1) {
                tElement.setProperty(Symbol.for("blend"), 100);
              } else {
                tElement.setProperty(Symbol.for("blend"), getVariable("fr.actions.inactive.blend"));
              }
            }
          }
          const tSession = getObject(Symbol.for("session"));
          if (tSession.GET("lastroom") == "Entry") {
            if (tElemData[Symbol.for("allowedroom")] != Symbol.for("all")) {
              tElement.setProperty(Symbol.for("blend"), getVariable("fr.actions.inactive.blend"));
            }
          }
          if (!tElemData[Symbol.for("used")]) {
            tElement.setProperty(Symbol.for("visible"), 0);
          }
        }
      }
    } else {
      if (value(this.pCurrentCategoryID) == -2) {
        const tElems = list();
        tElems.add("requests_dismiss_all");
        tElems.add("requests_dismiss_all_text");
        tElems.add("requests_accept_all");
        tElems.add("requests_accept_all_text");
        const tRequests = this.getComponent().getPendingFriendRequests();
        let tCount = 0;
        if (ilk(tRequests) == Symbol.for("propList")) {
          tCount = tRequests.count;
        }
        for (const tElemID of tElems) {
          if (tWndObj.elementExists(tElemID)) {
            const tElem = tWndObj.getElement(tElemID);
            if (tCount > 0) {
              tElem.setProperty(Symbol.for("blend"), 100);
              continue;
            }
            tElem.setProperty(Symbol.for("blend"), 30);
          }
        }
      }
    }
  }

  getViewListObject(tCategoryId) {
    tCategoryId = string(tCategoryId);
    if (this.pViewsList.getaProp(tCategoryId) == VOID) {
      const tViewObj = this.createListViewObject(tCategoryId);
      if (tCategoryId > -2) {
        const tCategoryContent = this.getComponent().getFriendsInCategory(tCategoryId);
        tViewObj.setListData(tCategoryContent);
      }
      this.pViewsList[tCategoryId] = tViewObj;
    } else {
      const tViewObj = this.pViewsList[tCategoryId];
      return tViewObj;
    }
    return this.pViewsList[tCategoryId];
  }

  createListViewObject(tCategoryId) {
    const tObjID = `list_view_object_${tCategoryId}`;
    if (tCategoryId >= 0) {
      createObject(tObjID, ["Friend List View Base", "Friend List Actions Base", "Friend Online List View"]);
    } else {
      if (tCategoryId == "-1") {
        createObject(tObjID, ["Friend List View Base", "Friend List Actions Base", "Friend Offline List View"]);
      } else {
        if (tCategoryId == "-2") {
          createObject(tObjID, ["Friend List View Base", "Friend Request List View"]);
        } else {
          if (tCategoryId == "-3") {
            createObject(tObjID, ["Friend List View Base", "Friend Search Results View"]);
          }
        }
      }
    }
    const tObj = getObject(tObjID);
    return tObj;
  }

  showInfoPopup(tFriend, tWndX, tWndY, tContentElem) {
    const tObject = this.getInfoPopupObject();
    if (tObject == 0) {
      return 0;
    }
    return tObject.showInfoPopup(tFriend, tWndX, tWndY, tContentElem);
  }

  removeInfoPopup() {
    const tObject = this.getInfoPopupObject();
    if (tObject == 0) {
      return 0;
    }
    return tObject.removeInfoPopup();
  }

  getInfoPopupObject() {
    if (!objectExists(this.pInfoPopupId)) {
      createObject(this.pInfoPopupId, "Friend Infobox Class");
    }
    return getObject(this.pInfoPopupId);
  }

  startInboxBlink() {
    const tTimeoutID = "minimail_blink";
    const tBlinkTime = 1000;
    if (!timeoutExists(tTimeoutID)) {
      createTimeout(tTimeoutID, tBlinkTime, Symbol.for("stepInboxBlink"), this.getID(), VOID, 0);
    }
  }

  endInboxBlink() {
    const tTimeoutID = "minimail_blink";
    if (timeoutExists(tTimeoutID)) {
      removeTimeout(tTimeoutID);
    }
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (tWndObj.elementExists("mail_inbox_icon")) {
      const tElem = tWndObj.getElement("mail_inbox_icon");
      tElem.setProperty(Symbol.for("member"), "friends_mini_mail_button_inactive");
    }
  }

  stepInboxBlink() {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (tWndObj.elementExists("mail_inbox_icon")) {
      const tElem = tWndObj.getElement("mail_inbox_icon");
      if (this.pInboxBlinkStep > 0) {
        tElem.setProperty(Symbol.for("member"), "friends_mini_mail_button_active");
        this.pInboxBlinkStep = 0;
      } else {
        tElem.setProperty(Symbol.for("member"), "friends_mini_mail_button_inactive");
        this.pInboxBlinkStep = this.pInboxBlinkStep + 1;
      }
    }
  }

  setTipText(tText) {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tElemID = "friends_tooltip";
    if (!tWndObj.elementExists(tElemID)) {
      return 0;
    }
    const tElem = tWndObj.getElement(tElemID);
    tElem.setText(tText);
  }

  showConfirmRemoveUser() {
    if (windowExists(this.pRemoveConfirmID)) {
      return 0;
    }
    if (!createWindow(this.pRemoveConfirmID, "habbo_basic.window", 200, 120)) {
      return error(this, "Couldn't create confirmation window!", Symbol.for("showConfirmRemoveUser"), Symbol.for("major"));
    }
    const tWndObj = getWindow(this.pRemoveConfirmID);
    let tMsgA = getText("friend_list_confirm_remove_1");
    let tMsgB = getText("friend_list_confirm_remove_2");
    if (ilk(this.pConfirmDeleteFriend) == Symbol.for("propList")) {
      tMsgB = replaceChunks(tMsgB, "%username%", this.pConfirmDeleteFriend[Symbol.for("name")]);
    }
    if (!tWndObj.merge("habbo_decision_dialog.window")) {
      return tWndObj.close();
    }
    tWndObj.getElement("habbo_decision_text_a").setText(tMsgA);
    tWndObj.getElement("habbo_decision_text_b").setText(tMsgB);
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcConfirm"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.center();
    return 1;
  }

  hideConfirmRemoveUser() {
    if (windowExists(this.pRemoveConfirmID)) {
      removeWindow(this.pRemoveConfirmID);
    }
  }

  showHabboSearchResults() {
    const tViewObj = this.getViewListObject(-3);
    tViewObj.setListData(this.getComponent().getHabboSearchResults());
    this.updateOpenCategoryPanel();
    this.updateActionIconsState();
  }

  handleListPanelEvent(tEvent, tLocX, tLocY) {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (tEvent == Symbol.for("mouseLeave")) {
      return this.removeInfoPopup();
    }
    const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
    const tEventData = tViewObj.relayEvent(tEvent, tLocX, tLocY);
    if (ilk(tEventData) != Symbol.for("propList")) {
      return 0;
    }
    const tContentElem = tWndObj.getElement("list_panel");
    if (tContentElem == 0) {
      return 0;
    }
    const tFriend = tEventData[Symbol.for("friend")];
    const tListElement = tEventData[Symbol.for("element")];
    if (tEventData[Symbol.for("event")] == Symbol.for("mouseWithin")) {
      let tCursor = "cursor.arrow";
      if (ilk(tEventData.getaProp(Symbol.for("cursor"))) == Symbol.for("string")) {
        tCursor = tEventData.getaProp(Symbol.for("cursor"));
      }
      tContentElem.setProperty(Symbol.for("cursor"), tCursor);
      let tWndX = tWndObj.getProperty(Symbol.for("locX"));
      let tWndY = tWndObj.getProperty(Symbol.for("locY"));
      const tScrollElem = tWndObj.getElement("list_scroll");
      if (tScrollElem != 0) {
        tWndY = tWndY - tScrollElem.getScrollOffset();
        tEventData[Symbol.for("item_y")] = tEventData[Symbol.for("item_y")] - tScrollElem.getScrollOffset();
      }
      this.showInfoPopup(tEventData, tWndX, tWndY, tContentElem);
      switch (tListElement) {
        case Symbol.for("mail"):
          this.setTipText(getText("friend_tip_mail"));
          break;
        case Symbol.for("im"):
          this.setTipText(getText("friend_tip_im"));
          break;
        case Symbol.for("follow"):
          this.setTipText(getText("friend_tip_follow"));
          break;
        case Symbol.for("addFriend"):
          this.setTipText(getText("friend_tip_addfriend"));
          break;
        default:
          this.setTipText(EMPTY);
          break;
      }
      return 1;
    }
    if (voidp(tEventData.getaProp(Symbol.for("element")))) {
      return 0;
    }
    switch (tListElement) {
      case Symbol.for("im"):
        executeMessage(Symbol.for("startIMChat"), tFriend[Symbol.for("name")], EMPTY);
        break;
      case Symbol.for("follow"):
        {
          const tConn = getConnection(getVariable("connection.info.id"));
          tConn.send("FOLLOW_FRIEND", [Symbol.for("integer"): integer(tFriend[Symbol.for("id")])]);
          break;
        }
      case Symbol.for("request_accept"):
        {
          const tRequest = tEventData[Symbol.for("request")];
          this.getComponent().updateFriendRequest(tRequest, Symbol.for("accepted"));
          break;
        }
      case Symbol.for("request_reject"):
        {
          const tRequest = tEventData[Symbol.for("request")];
          this.getComponent().updateFriendRequest(tRequest, Symbol.for("rejected"));
          break;
        }
      case Symbol.for("mail"):
        {
          if (variableExists("link.format.mail.compose")) {
            const tDestURL = replaceChunks(getVariable("link.format.mail.compose"), "%recipientid%", tFriend[Symbol.for("id")]);
            openNetPage(tDestURL);
            executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          }
          break;
        }
      case Symbol.for("addFriend"):
        this.getComponent().externalFriendRequest(tFriend[Symbol.for("name")]);
        break;
    }
    if (tEventData.getaProp(Symbol.for("update"))) {
      const tListImage = tViewObj.getViewImage();
      tContentElem.clearImage();
      tContentElem.feedImage(tListImage);
    }
    this.updateActionIconsState();
  }

  eventProcConfirm(tEvent, tElemID, tParam) {
    switch (tElemID) {
      case "habbo_decision_ok":
        if (ilk(this.pConfirmDeleteFriend) == Symbol.for("propList")) {
          this.getComponent().sendRemoveFriend(this.pConfirmDeleteFriend[Symbol.for("id")]);
          this.hideConfirmRemoveUser();
          this.pConfirmDeleteFriend = VOID;
        }
        break;
      case "habbo_decision_cancel":
      case "close":
        this.hideConfirmRemoveUser();
        this.pConfirmDeleteFriend = VOID;
        break;
    }
  }

  eventProc(tEvent, tElemID, tParam) {
    const tWndObj = getWindow(this.pFriendListWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (tEvent == Symbol.for("mouseUp")) {
      this.removeInfoPopup();
      const tloc = the.mouseLoc;
      switch (tElemID) {
        case "friends_btn_close":
          this.closeFriendList();
          break;
        case "friends_btn_minimize":
          this.minimizedView();
          break;
        case "list_panel":
          {
            if (ilk(tParam) != Symbol.for("point")) {
              return 0;
            }
            this.handleListPanelEvent(tEvent, tParam[1], tParam[2]);
            break;
          }
        case "preferences_icon":
          {
            openNetPage(getVariable("link.format.friendlist.pref"));
            executeMessage(Symbol.for("externalLinkClick"), tloc);
            break;
          }
        case "home_icon":
          {
            const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
            const tSelectedFriends = tViewObj.getSelectedFriends();
            if ((tSelectedFriends.count == 0) || (tSelectedFriends.count > 1)) {
              return 0;
            }
            const tSelectedFriendData = tSelectedFriends[1];
            if (variableExists("link.format.userpage")) {
              const tWebID = tSelectedFriendData.getaProp(Symbol.for("id"));
              const tDestURL = replaceChunks(getVariable("link.format.userpage"), "%ID%", string(tWebID));
              openNetPage(tDestURL);
              executeMessage(Symbol.for("externalLinkClick"), tloc);
            }
            break;
          }
        case "mail_compose_icon":
          {
            const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
            const tSelectedFriends = tViewObj.getSelectedFriends();
            if (tSelectedFriends.count == 0) {
              return 0;
            }
            let tRecipients = EMPTY;
            for (const tFriend of tSelectedFriends) {
              tRecipients = `${tRecipients}${tFriend[Symbol.for("id")]},`;
            }
            tRecipients = chars(tRecipients, 1, tRecipients.length - 1);
            if (variableExists("link.format.mail.compose")) {
              const tDestURL = replaceChunks(getVariable("link.format.mail.compose"), "%recipientid%", tRecipients);
              openNetPage(tDestURL);
              executeMessage(Symbol.for("externalLinkClick"), tloc);
            }
            break;
          }
        case "invite_icon":
          {
            const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
            const tSelectedFriends = tViewObj.getSelectedFriends();
            if (tSelectedFriends.count == 0) {
              return 0;
            }
            const tFriendIds = list();
            for (const tFriend of tSelectedFriends) {
              const tID = tFriend[Symbol.for("id")];
              tFriendIds.add(tID);
            }
            if (threadExists(Symbol.for("instant_messenger"))) {
              const tIMComponent = getThread(Symbol.for("instant_messenger")).getComponent();
              tIMComponent.inviteFriends(tFriendIds);
            }
            break;
          }
        case "mail_inbox_icon":
          {
            if (variableExists("link.format.mail.inbox")) {
              const tDestURL = getVariable("link.format.mail.inbox");
              openNetPage(tDestURL);
              executeMessage(Symbol.for("externalLinkClick"), tloc);
            }
            break;
          }
        case "search_icon":
          {
            if (variableExists("link.format.user.search")) {
              const tDestURL = getVariable("link.format.user.search");
              openNetPage(tDestURL);
              executeMessage(Symbol.for("externalLinkClick"), tloc);
            }
            break;
          }
        case "remove_icon":
          {
            const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
            const tSelectedFriends = tViewObj.getSelectedFriends();
            if ((tSelectedFriends.count == 0) || (tSelectedFriends.count > 1)) {
              return 0;
            }
            const tSelectedFriendData = tSelectedFriends[1];
            this.pConfirmDeleteFriend = tSelectedFriendData.duplicate();
            this.showConfirmRemoveUser();
            break;
          }
        case "requests_accept_all":
          {
            const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
            tViewObj.handleAll(Symbol.for("accepted"));
            this.getComponent().handleAllRequests(Symbol.for("accepted"));
            const tListImage = tViewObj.getViewImage();
            const tContentElem = tWndObj.getElement("list_panel");
            tContentElem.clearImage();
            tContentElem.feedImage(tListImage);
            break;
          }
        case "requests_dismiss_all":
          {
            const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
            tViewObj.handleAll(Symbol.for("rejected"));
            this.getComponent().handleAllRequests(Symbol.for("rejected"));
            const tListImage = tViewObj.getViewImage();
            const tContentElem = tWndObj.getElement("list_panel");
            tContentElem.clearImage();
            tContentElem.feedImage(tListImage);
            break;
          }
        case "search_button":
        case "search_button_text":
          {
            const tViewObj = this.getViewListObject(this.pCurrentCategoryID);
            const tSearchString = tWndObj.getElement("search_input").getText();
            this.getComponent().sendHabboSearch(tSearchString);
            break;
          }
      }
      if ((tElemID.contains("category_element_")) || (tElemID.contains("category_title_"))) {
        const tDelim = the.itemDelimiter;
        the.itemDelimiter = "_";
        const tCategoryId = tElemID.item[3];
        the.itemDelimiter = tDelim;
        if (this.pMinimized) {
          this.minimizedView(0);
          this.changeCategory(tCategoryId);
        } else {
          if (tCategoryId == this.pCurrentCategoryID) {
            this.minimizedView(1);
          } else {
            this.changeCategory(tCategoryId);
          }
        }
      }
    } else {
      if (tEvent == Symbol.for("mouseWithin")) {
        if (tWndObj.elementExists("friends_tooltip")) {
          const tElemTooltip = tWndObj.getElement("friends_tooltip");
          switch (tElemID) {
            case "home_icon":
              this.setTipText(getText("friend_tip_home"));
              break;
            case "mail_compose_icon":
              this.setTipText(getText("friend_tip_compose"));
              break;
            case "invite_icon":
              this.setTipText(getText("friend_tip_invite"));
              break;
            case "remove_icon":
              this.setTipText(getText("friend_tip_remove"));
              break;
            case "preferences_icon":
              this.setTipText(getText("friend_tip_preferences"));
              break;
            case "search_icon":
              this.setTipText(getText("friend_tip_search"));
              break;
            case "mail_inbox_icon":
              this.setTipText(getText("friend_tip_inbox"));
              break;
            case "search_button":
            case "search_button_text":
              this.setTipText(getText("friend_tip_search_button"));
              break;
            case "search_input":
              this.setTipText(getText("friend_tip_search_input"));
              break;
            case "list_panel":
              {
                if (ilk(tParam) != Symbol.for("point")) {
                  return 0;
                }
                this.handleListPanelEvent(tEvent, tParam[1], tParam[2]);
                break;
              }
            default:
              this.setTipText(EMPTY);
              break;
          }
        }
      } else {
        if (tEvent == Symbol.for("mouseLeave")) {
          this.setTipText(EMPTY);
          switch (tElemID) {
            case "list_panel":
              this.handleListPanelEvent(tEvent);
              break;
          }
        } else {
          if (tEvent == Symbol.for("keyDown")) {
            switch (tElemID) {
              case "search_input":
                switch (the.keyCode) {
                  case 36:
                  case 76:
                    this.eventProc(Symbol.for("mouseUp"), "search_button");
                    return 1;
                  default:
                    return 0;
                }
                break;
            }
          }
        }
      }
    }
  }
}
