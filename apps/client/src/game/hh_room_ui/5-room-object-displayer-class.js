export default class {
  pCreatorID;
  pWindowCreator;
  pWindowList;
  pBadgeObjID;
  pShowActions;
  pShowUserTags;
  pLastSelectedObjType;
  pBaseWindowIds;
  pBaseLocZ;
  pTagListObjID;
  pTagListObj;
  pTagLists;
  pClosed;
  pTagRequestTimeout;
  pBadgeDetailsWindowID;

  construct() {
    this.pWindowList = list();
    this.pTagRequestTimeout = 60000;
    this.pCreatorID = "room.object.displayer.window.creator";
    createObject(this.pCreatorID, "Room Object Window Creator Class");
    this.pBadgeObjID = "room.obj.disp.badge.mngr";
    createObject(this.pBadgeObjID, "Badge Manager Class");
    this.pShowActions = 1;
    this.pShowUserTags = 1;
    this.pLastSelectedObjType = VOID;
    this.pTagListObjID = "room.obj.disp.tags";
    createObject(this.pTagListObjID, "Tag List Class");
    this.pBadgeDetailsWindowID = Symbol.for("badgeDetailsWindowID");
    this.pBaseLocZ = 0;
    this.pBaseWindowIds = getVariableValue("object.displayer.window.ids");
    this.createBaseWindows();
    registerMessage(Symbol.for("groupLogoDownloaded"), this.getID(), Symbol.for("groupLogoDownloaded"));
    registerMessage(Symbol.for("hideInfoStand"), this.getID(), Symbol.for("clearWindowDisplayList"));
    registerMessage(Symbol.for("updateInfostandAvatar"), this.getID(), Symbol.for("refreshView"));
    registerMessage(Symbol.for("showObjectInfo"), this.getID(), Symbol.for("showObjectInfo"));
    registerMessage(Symbol.for("hideObjectInfo"), this.getID(), Symbol.for("clearWindowDisplayList"));
    registerMessage(Symbol.for("removeObjectInfo"), this.getID(), Symbol.for("clearWindowDisplayList"));
    registerMessage(Symbol.for("updateInfoStandBadge"), this.getID(), Symbol.for("updateBadge"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("clearWindowDisplayList"));
    registerMessage(Symbol.for("updateUserTags"), this.getID(), Symbol.for("updateTagList"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("clearWindowDisplayList"));
    registerMessage(Symbol.for("itemObjectsUpdated"), this.getID(), Symbol.for("refreshView"));
    registerMessage(Symbol.for("activeObjectsUpdated"), this.getID(), Symbol.for("refreshView"));
    registerMessage(Symbol.for("updateClubStatus"), this.getID(), Symbol.for("refreshView"));
    registerMessage(Symbol.for("remove_user"), this.getID(), Symbol.for("refreshView"));
    registerMessage(Symbol.for("activeObjectRemoved"), this.getID(), Symbol.for("refreshView"));
    registerMessage(Symbol.for("itemObjectRemoved"), this.getID(), Symbol.for("refreshView"));
    this.pWindowCreator = getObject(this.pCreatorID);
    this.pTagListObj = getObject(this.pTagListObjID);
    this.pTagLists = propList();
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("hideInfoStand"), this.getID());
    unregisterMessage(Symbol.for("groupLogoDownloaded"), this.getID());
    removeObject(this.pBadgeObjID);
    removeObject(this.pCreatorID);
    return 1;
  }

  updateBadge(tBadgeName) {
    this.refreshView();
  }

  createBaseWindows() {
    for (let tIndex = 1; tIndex <= this.pBaseWindowIds.count; tIndex++) {
      let tID = this.pBaseWindowIds[tIndex];
      if (!windowExists(tID)) {
        createWindow(tID, "obj_disp_base.window", 999, 999);
        let tWndObj = getWindow(tID);
        if (tIndex == 1) {
          this.pBaseLocZ = tWndObj.getProperty(Symbol.for("locZ")) - 1000;
        }
      }
      tWndObj.hide();
    }
  }

  showObjectInfo(tObjType, tRefresh) {
    if (this.pClosed && tRefresh) {
      return 1;
    }
    if (voidp(tObjType)) {
      return 0;
    }
    if (this.pWindowCreator == 0) {
      return 0;
    }
    this.clearWindowDisplayList();
    this.pLastSelectedObjType = tObjType;
    let tRoomComponent = getThread(Symbol.for("room")).getComponent();
    let tRoomInterface = getThread(Symbol.for("room")).getInterface();
    let tSelectedObj = tRoomInterface.getSelectedObject();
    let tWindowTypes = list();
    let tObj;
    let tID;
    switch (tObjType) {
      case "user":
        tObj = tRoomComponent.getUserObject(tSelectedObj);
        tWindowTypes = getVariableValue("object.display.windows.human");
        if ((tObj != 0) && this.pShowUserTags) {
          let tUserID = integer(tObj.getWebID());
          this.updateUserTags(tUserID);
        }
        break;
      case "bot":
        tObj = tRoomComponent.getUserObject(tSelectedObj);
        tWindowTypes = getVariableValue("object.display.windows.bot");
        break;
      case "active":
        tObj = tRoomComponent.getActiveObject(tSelectedObj);
        tWindowTypes = getVariableValue("object.display.windows.furni");
        break;
      case "item":
        tObj = tRoomComponent.getItemObject(tSelectedObj);
        tWindowTypes = getVariableValue("object.display.windows.furni");
        break;
      case "pet":
        tObj = tRoomComponent.getUserObject(tSelectedObj);
        tWindowTypes = getVariableValue("object.display.windows.pet");
        break;
      default:
        error(this, `${"Unsupported object type:"} ${tObjType}`, Symbol.for("showObjectInfo"), Symbol.for("minor"));
        tObj = 0;
    }
    if (tObj == 0) {
      return 0;
    } else {
      let tProps = tObj.getInfo();
    }
    for (let tPos = 1; tPos <= tWindowTypes.count; tPos++) {
      let tWindowType = tWindowTypes[tPos];
      switch (tWindowType) {
        case "motto":
          tID = this.pBaseWindowIds[Symbol.for("motto")];
          this.pWindowCreator.createMottoWindow(tID, tProps, tSelectedObj, this.pBadgeObjID, this.pShowUserTags);
          this.pushWindowToDisplayList(tID);
          break;
        case "avatar":
          tID = this.pBaseWindowIds[Symbol.for("avatar")];
          this.pWindowCreator.createHumanWindow(tID, tProps, tSelectedObj, this.pBadgeObjID, this.pShowUserTags);
          this.updateInfoStandGroup(tProps[Symbol.for("groupID")]);
          this.pushWindowToDisplayList(tID);
          break;
        case "bot":
          tID = this.pBaseWindowIds[Symbol.for("avatar")];
          this.pWindowCreator.createBotWindow(tID, tProps);
          this.pushWindowToDisplayList(tID);
          break;
        case "furni":
          tID = this.pBaseWindowIds[Symbol.for("avatar")];
          this.pWindowCreator.createFurnitureWindow(tID, tProps);
          this.pushWindowToDisplayList(tID);
          break;
        case "pet":
          tID = this.pBaseWindowIds[Symbol.for("avatar")];
          this.pWindowCreator.createPetWindow(tID, tProps);
          this.pushWindowToDisplayList(tID);
          break;
        case "tags_user":
          if (this.pShowUserTags) {
            let tUserTagData = this.pTagLists.getaProp(tObj.getWebID());
            let tTagList;
            if (!listp(tUserTagData)) {
              tTagList = list();
            } else {
              tTagList = tUserTagData[Symbol.for("tags")];
            }
            if (tTagList.count > 0) {
              tID = this.pBaseWindowIds[Symbol.for("tags")];
              this.pWindowCreator.createUserTagsWindow(tID);
              this.pushWindowToDisplayList(tID);
              let tTagsWindow = getWindow(tID);
              let tTagsElem = tTagsWindow.getElement("room_obj_disp_tags");
              this.pTagListObj.setWidth(tTagsElem.getProperty(Symbol.for("width")));
              this.pTagListObj.setHeight(tTagsElem.getProperty(Symbol.for("height")));
              let tTagListImage = this.pTagListObj.createTagList(tTagList);
              tTagsElem.feedImage(tTagListImage);
              let tOffset = tTagListImage.height - tTagsWindow.getProperty(Symbol.for("height"));
              tTagsWindow.resizeBy(0, tOffset);
            }
          }
          break;
        case "xp_user":
          let tXP = tProps.getaProp(Symbol.for("xp"));
          if (!(voidp(tXP) || (tXP == 0))) {
            tID = this.pBaseWindowIds[Symbol.for("xp")];
            this.pWindowCreator.createUserXpWindow(tID, tXP);
            this.pushWindowToDisplayList(tID);
          }
          break;
        case "links_human":
          tID = this.pBaseWindowIds[Symbol.for("links")];
          if (tProps[Symbol.for("name")] == getObject(Symbol.for("session")).GET("user_name")) {
            this.pWindowCreator.createLinksWindow(tID, Symbol.for("own"));
          } else {
            this.pWindowCreator.createLinksWindow(tID, Symbol.for("peer"));
          }
          this.pushWindowToDisplayList(tID);
          break;
        case "actions_human":
          tID = this.pBaseWindowIds[Symbol.for("actions")];
          this.pWindowCreator.createActionsHumanWindow(tID, tProps[Symbol.for("name")], this.pShowActions);
          this.pushWindowToDisplayList(tID);
          break;
        case "actions_furni":
          if (tRoomComponent.itemObjectExists(tSelectedObj)) {
            let tselectedobject = tRoomComponent.getItemObject(tSelectedObj);
            let tClass = tselectedobject.getClass();
            if (tClass contains "post.it") {
              continue;
            }
          }
          tID = this.pBaseWindowIds[Symbol.for("actions")];
          this.pWindowCreator.createActionsFurniWindow(tID, tObjType, this.pShowActions);
          this.pushWindowToDisplayList(tID);
          break;
        case "bottom":
          tID = this.pBaseWindowIds[Symbol.for("bottom")];
          this.pWindowCreator.createBottomWindow(tID);
          this.pushWindowToDisplayList(tID);
          break;
      }
      if (windowExists(tID)) {
        let tWndObj = getWindow(tID);
        tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
        tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseEnter"));
        tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseWithin"));
        tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseLeave"));
      }
    }
    this.alignWindows();
    this.pClosed = 0;
  }

  clearWindowDisplayList() {
    if (this.pWindowCreator == 0) {
      return 0;
    }
    for (const tWindowID of this.pWindowList) {
      this.pWindowCreator.clearWindow(tWindowID);
    }
    this.pWindowList = list();
    if (objectExists(this.pBadgeObjID)) {
      getObject(this.pBadgeObjID).removeBadgeEffect();
    }
  }

  pushWindowToDisplayList(tWindowID) {
    this.pWindowList.add(tWindowID);
  }

  refreshView() {
    this.clearWindowDisplayList();
    this.showObjectInfo(this.pLastSelectedObjType, 1);
  }

  showHideActions() {
    this.pShowActions = !this.pShowActions;
    this.refreshView();
  }

  showHideTags() {
    this.pShowUserTags = !this.pShowUserTags;
    this.refreshView();
  }

  updateUserTags(tUserID) {
    let tLastUpdateTime = 0;
    let tTimeNow = the.milliSeconds;
    let tUserData = this.pTagLists.getaProp(tUserID);
    if (listp(tUserData)) {
      tLastUpdateTime = tUserData[Symbol.for("lastUpdate")];
    } else {
      this.pTagLists[string(tUserID)] = propList("tags", list(), "lastUpdate", 0);
    }
    if ((tTimeNow - tLastUpdateTime) > this.pTagRequestTimeout) {
      this.pTagLists[string(tUserID)][Symbol.for("lastUpdate")] = tTimeNow;
      getConnection(Symbol.for("Info")).send("GET_USER_TAGS", propList("integer", tUserID));
    }
  }

  alignWindows() {
    if (this.pWindowList.count == 0) {
      return 0;
    }
    let tDefLeftPos = getVariable("object.display.pos.left");
    let tDefBottomPos = getVariable("object.display.pos.bottom");
    let tAlignments = getVariableValue("object.displayer.window.align", propList());
    let tStageWidth = the.stageRight - the.stageLeft;
    tDefLeftPos = tDefLeftPos + (tStageWidth - 720);
    for (let tIndex = this.pWindowList.count; tIndex >= 1; tIndex--) {
      let tWindowID = this.pWindowList[tIndex];
      let tWindowObj = getWindow(tWindowID);
      tWindowObj.moveZ(this.pBaseLocZ + ((tIndex - 1) * 100));
      let tWindowType = this.pBaseWindowIds.getOne(tWindowID);
      let tAlignment = tAlignments.getaProp(tWindowType);
      if (voidp(tAlignment)) {
        tAlignment = Symbol.for("left");
      }
      let tLeft = tDefLeftPos;
      let tTop;
      if (tIndex == this.pWindowList.count) {
        let tNextWindowID = this.pWindowList[tIndex - 1];
        let tNextWindow = getWindow(tNextWindowID);
        if (tAlignment == Symbol.for("right")) {
          tLeft = tDefLeftPos + tNextWindow.getProperty(Symbol.for("width")) - tWindowObj.getProperty(Symbol.for("width"));
        }
        tTop = tDefBottomPos - tWindowObj.getProperty(Symbol.for("height"));
      } else {
        let tPrevWindowID = this.pWindowList[tIndex + 1];
        let tPrevWindow = getWindow(tPrevWindowID);
        if (tAlignment == Symbol.for("right")) {
          tLeft = tDefLeftPos + tPrevWindow.getProperty(Symbol.for("width")) - tWindowObj.getProperty(Symbol.for("width"));
        }
        tTop = tPrevWindow.getProperty(Symbol.for("locY")) - tWindowObj.getProperty(Symbol.for("height"));
      }
      tWindowObj.moveTo(tLeft, tTop);
    }
  }

  updateInfoStandGroup(tGroupId) {
    let tHumanWindowID = this.pBaseWindowIds[Symbol.for("avatar")];
    let tElem;
    if (windowExists(tHumanWindowID)) {
      let tWindowObj = getWindow(tHumanWindowID);
      if (tWindowObj.elementExists("info_group_badge")) {
        tElem = tWindowObj.getElement("info_group_badge");
      } else {
        return 0;
      }
    } else {
      return 0;
    }
    if (voidp(tGroupId) || (tGroupId < 0)) {
      tElem.clearImage();
      tElem.setProperty(Symbol.for("cursor"), "cursor.arrow");
      return 0;
    }
    let tRoomComponent = getThread(Symbol.for("room")).getComponent();
    let tGroupInfoObject = tRoomComponent.getGroupInfoObject();
    let tLogoMemNum = tGroupInfoObject.getGroupLogoMemberNum(tGroupId);
    if (!voidp(tGroupId)) {
      tElem.clearImage();
      tElem.setProperty(Symbol.for("image"), member(tLogoMemNum).image);
      tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
    } else {
      tElem.clearImage();
      tElem.setProperty(Symbol.for("cursor"), "cursor.arrow");
    }
  }

  groupLogoDownloaded(tGroupId) {
    let tRoomInterface = getThread(Symbol.for("room")).getInterface();
    let tRoomComponent = getThread(Symbol.for("room")).getComponent();
    let tSelectedObj = tRoomInterface.getSelectedObject();
    let tObj = tRoomComponent.getUserObject(tSelectedObj);
    if (tObj == 0) {
      return 0;
    }
    let tUsersGroup = tObj.getProperty(Symbol.for("groupID"));
    if (tUsersGroup == tGroupId) {
      this.updateInfoStandGroup(tGroupId);
    }
  }

  updateTagList(tUserID, tTagList) {
    let tUserTagData = this.pTagLists.getaProp(tUserID);
    if (voidp(tUserTagData)) {
      tUserTagData = propList("tags", list(), "lastUpdate", 0);
    }
    let tOldList = tUserTagData[Symbol.for("tags")];
    if (tOldList != tTagList) {
      this.pTagLists.setaProp(tUserID, propList("tags", tTagList, "lastUpdate", the.milliSeconds));
      this.refreshView();
    }
  }

  updateBadgeDetailsBubble(tElemID) {
    if (!objectExists(Symbol.for("session"))) {
      return 0;
    }
    let tRoomThread = getThread(Symbol.for("room"));
    let tSelectedObjID = tRoomThread.getInterface().getSelectedObject();
    let tSelectedObj = tRoomThread.getComponent().getUserObject(tSelectedObjID);
    if (!tSelectedObj) {
      return 0;
    }
    let tBadges = tSelectedObj.getProperty(Symbol.for("badges"));
    if (tBadges.ilk != Symbol.for("propList")) {
      tBadges = propList();
    }
    let tBadgeIndex = value(tElemID.char[tElemID.length]);
    if (!integerp(tBadgeIndex)) {
      return 0;
    }
    let tBadgeID = tBadges.getaProp(tBadgeIndex);
    if (voidp(tBadgeID)) {
      return 0;
    }
    let tWindowID = this.pBaseWindowIds.getaProp(Symbol.for("avatar"));
    if (!windowExists(tWindowID)) {
      return 0;
    }
    let tWindow = getWindow(tWindowID);
    if (!tWindow.elementExists(tElemID)) {
      return 0;
    }
    if (objectExists(this.pBadgeDetailsWindowID)) {
      removeObject(this.pBadgeDetailsWindowID);
    }
    let tElem = tWindow.getElement(tElemID);
    let tTargetRect = tElem.getProperty(Symbol.for("rect"));
    let tBubble = createObject(this.pBadgeDetailsWindowID, "Details Bubble Class");
    tBubble.createWithContent("badge_info.window", tTargetRect, Symbol.for("left"));
    let tBubbleWindow = tBubble.getWindowObj();
    tBubbleWindow.getElement("badge.info.name").setText(getText(`badge_name_${tBadgeID}`));
    tBubbleWindow.getElement("badge.info.desc").setText(getText(`badge_desc_${tBadgeID}`));
    return 1;
  }

  removeBadgeDetailsBubble() {
    if (objectExists(this.pBadgeDetailsWindowID)) {
      removeObject(this.pBadgeDetailsWindowID);
    }
  }

  eventProc(tEvent, tSprID, tParam) {
    let tComponent = getThread(Symbol.for("room")).getComponent();
    let tOwnUser = tComponent.getOwnUser();
    let tInterface = getThread(Symbol.for("room")).getInterface();
    let tSelectedObj = tInterface.pSelectedObj;
    let tSelectedType = tInterface.pSelectedType;
    let tSession = getObject(Symbol.for("session"));
    if (tSprID contains "info_badge") {
      switch (tEvent) {
        case Symbol.for("mouseEnter"):
          if (!this.updateBadgeDetailsBubble(tSprID)) {
            this.removeBadgeDetailsBubble();
          }
          break;
        case Symbol.for("mouseLeave"):
          this.removeBadgeDetailsBubble();
          break;
        case Symbol.for("mouseUp"):
          tSelectedObj = tInterface.getSelectedObject();
          if (tSelectedObj == tSession.GET("user_index")) {
            if (objectExists(this.pBadgeObjID)) {
              getObject(this.pBadgeObjID).openBadgeWindow();
            }
          }
          break;
      }
    }
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "badges.button":
          if (objectExists(this.pBadgeObjID)) {
            getObject(this.pBadgeObjID).openBadgeWindow();
          }
          break;
        case "dance.button":
          let tCurrentDance = tOwnUser.getProperty(Symbol.for("dancing"));
          if (tCurrentDance > 0) {
            tComponent.getRoomConnection().send("STOP", "Dance");
          } else {
            tComponent.getRoomConnection().send("DANCE");
          }
          return 1;
        case "hcdance.button":
          tCurrentDance = tOwnUser.getProperty(Symbol.for("dancing"));
          if (tParam.char.count == 6) {
            let tInteger = integer(tParam.char[6]);
            tComponent.getRoomConnection().send("DANCE", propList("integer", tInteger));
          } else {
            if (tCurrentDance > 0) {
              tComponent.getRoomConnection().send("STOP", "Dance");
            }
          }
          return 1;
        case "wave.button":
          if (tOwnUser.getProperty(Symbol.for("dancing"))) {
            tComponent.getRoomConnection().send("STOP", "Dance");
            tInterface.dancingStoppedExternally();
          }
          return tComponent.getRoomConnection().send("WAVE");
        case "move.button":
          return tInterface.startObjectMover(tSelectedObj);
        case "rotate.button":
          return tComponent.getActiveObject(tSelectedObj).rotate();
        case "pick.button":
          let ttype;
          switch (tSelectedType) {
            case "active":
              ttype = "stuff";
              break;
            case "item":
              ttype = "item";
              break;
            default:
              return this.clearWindowDisplayList();
          }
          this.clearWindowDisplayList();
          return tComponent.getRoomConnection().send("ADDSTRIPITEM", `${"new"} ${ttype} ${tSelectedObj}`);
        case "delete.button":
          this.pDeleteObjID = tSelectedObj;
          this.pDeleteType = tSelectedType;
          return tInterface.showConfirmDelete();
        case "kick.button":
          let tUserName;
          if (tComponent.userObjectExists(tSelectedObj)) {
            tUserName = tComponent.getUserObject(tSelectedObj).getName();
          } else {
            tUserName = EMPTY;
          }
          tComponent.getRoomConnection().send("KICKUSER", tUserName);
          return this.clearWindowDisplayList();
        case "ban.button":
          if (tComponent.userObjectExists(tSelectedObj)) {
            tUserName = tComponent.getUserObject(tSelectedObj).getName();
          } else {
            tUserName = EMPTY;
          }
          tComponent.getRoomConnection().send("BANUSER", tUserName);
          return this.clearWindowDisplayList();
        case "give_rights.button":
          if (tComponent.userObjectExists(tSelectedObj)) {
            tUserName = tComponent.getUserObject(tSelectedObj).getName();
          } else {
            tUserName = EMPTY;
          }
          tComponent.getRoomConnection().send("ASSIGNRIGHTS", tUserName);
          tSelectedObj = EMPTY;
          this.clearWindowDisplayList();
          tInterface.hideArrowHiliter();
          return 1;
        case "take_rights.button":
          if (tComponent.userObjectExists(tSelectedObj)) {
            tUserName = tComponent.getUserObject(tSelectedObj).getName();
          } else {
            tUserName = EMPTY;
          }
          tComponent.getRoomConnection().send("REMOVERIGHTS", tUserName);
          tSelectedObj = EMPTY;
          this.clearWindowDisplayList();
          tInterface.hideArrowHiliter();
          return 1;
        case "friend.button":
          if (tComponent.userObjectExists(tSelectedObj)) {
            tUserName = tComponent.getUserObject(tSelectedObj).getName();
            executeMessage(Symbol.for("externalFriendRequest"), tUserName);
          }
          return 1;
        case "trade.button":
          let tList = propList();
          tList["showDialog"] = 1;
          executeMessage(Symbol.for("getHotelClosingStatus"), tList);
          if (tList["retval"] == 1) {
            return 1;
          }
          if (tComponent.userObjectExists(tSelectedObj)) {
            tUserName = tComponent.getUserObject(tSelectedObj).getName();
          } else {
            tUserName = EMPTY;
          }
          tInterface.startTrading(tSelectedObj);
          tInterface.getContainer().open();
          return 1;
        case "ignore.button":
          let tIgnoreListObj = tInterface.getIgnoreListObject();
          if (tComponent.userObjectExists(tSelectedObj)) {
            tUserName = tComponent.getUserObject(tSelectedObj).getName();
            tIgnoreListObj.setIgnoreStatus(tUserName, 1);
          } else {
            tUserName = EMPTY;
          }
          this.clearWindowDisplayList();
          tSelectedObj = EMPTY;
          break;
        case "unignore.button":
          tIgnoreListObj = tInterface.getIgnoreListObject();
          if (tComponent.userObjectExists(tSelectedObj)) {
            tUserName = tComponent.getUserObject(tSelectedObj).getName();
            tIgnoreListObj.setIgnoreStatus(tUserName, 0);
          }
          this.clearWindowDisplayList();
          tSelectedObj = EMPTY;
          break;
        case "room_obj_disp_badge_sel":
        case "room_obj_disp_icon_badge":
          if (objectExists(this.pBadgeObjID)) {
            getObject(this.pBadgeObjID).openBadgeWindow();
          }
          break;
        case "room_obj_disp_home":
        case "room_obj_disp_icon_home":
        case "room_obj_disp_name":
          if (variableExists("link.format.userpage")) {
            let tWebID = tComponent.getUserObject(tSelectedObj).getWebID();
            if (!voidp(tWebID)) {
              let tDestURL = replaceChunks(getVariable("link.format.userpage"), "%ID%", string(tWebID));
              executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
              openNetPage(tDestURL);
            }
          }
          break;
        case "info_group_badge":
          tSelectedObj = tInterface.getSelectedObject();
          if (!voidp(tSelectedObj) && (tSelectedObj != EMPTY)) {
            let tUserObj = tComponent.getUserObject(tSelectedObj);
            let tInfoObj = tComponent.getGroupInfoObject();
            if ((tUserObj != 0) && (tUserObj != VOID)) {
              let tUserInfo = tUserObj.getInfo();
              tInfoObj.showUsersInfoByName(tUserInfo[Symbol.for("name")]);
            }
          }
          break;
        case "object_displayer_toggle_actions":
          this.showHideActions();
          break;
        case "object_displayer_toggle_actions_icon":
          this.showHideActions();
          break;
        case "object_displayer_toggle_tags":
          this.showHideTags();
          break;
        case "object_displayer_toggle_tags_icon":
          this.showHideTags();
          break;
        case "room_obj_disp_close":
          this.pClosed = 1;
          this.clearWindowDisplayList();
          break;
        case "room_obj_disp_looks":
        case "room_obj_disp_icon_avatar":
        case "room_obj_disp_avatar":
        case "outlook.button":
          if (tSelectedObj == tSession.GET("user_index")) {
            let tAllowModify = 1;
            if (getObject(Symbol.for("session")).exists("allow_profile_editing")) {
              tAllowModify = getObject(Symbol.for("session")).GET("allow_profile_editing");
            }
            if (tAllowModify) {
              if (threadExists(Symbol.for("registration"))) {
                getThread(Symbol.for("registration")).getComponent().openFigureUpdate();
              }
            } else {
              executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
              openNetPage(getText("url_figure_editor"));
            }
          }
          break;
        case "room_obj_disp_tags":
          let tTag = this.pTagListObj.getTagAt(tParam);
          if (stringp(tTag)) {
            let tDestURL = replaceChunks(getVariable("link.format.tag.search"), "%tag%", tTag);
            executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
            openNetPage(tDestURL);
          }
          break;
        case "room_obj_disp_bg":
          return 0;
      }
    } else {
      if (tEvent == Symbol.for("mouseWithin")) {
        switch (tSprID) {
          case "room_obj_disp_tags":
            let tTagsWindow = getWindow(this.pBaseWindowIds[Symbol.for("tags")]);
            let tElem = tTagsWindow.getElement(tSprID);
            if (stringp(this.pTagListObj.getTagAt(tParam))) {
              tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
            } else {
              tElem.setProperty(Symbol.for("cursor"), 0);
            }
            break;
          default:
            break;
        }
      } else {
        if (tEvent == Symbol.for("mouseLeave")) {
          switch (tSprID) {
            case "room_obj_disp_tags":
              let tTagsWindow = getWindow(this.pBaseWindowIds[Symbol.for("tags")]);
              let tElem = tTagsWindow.getElement(tSprID);
              tElem.setProperty(Symbol.for("cursor"), 0);
              break;
            default:
              break;
          }
        }
      }
    }
  }
}
