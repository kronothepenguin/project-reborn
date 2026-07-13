export default class {
  pModBadgeList;
  pExtensionClosedID;
  pExtensionOpenedID;
  pWriterBold;
  pWriterPlain;
  pScroller;

  construct() {
    this.pModBadgeList = getVariableValue("moderator.badgelist");
    this.pExtensionClosedID = "roomnfo_ext_right";
    this.pExtensionOpenedID = "roomnfo_ext_close";
    let tScrollerID = Symbol.for("name_scroller");
    createObject(tScrollerID, "Infostand Text Scroller Class");
    this.pScroller = getObject(tScrollerID);
    let tWriterId = Symbol.for("infostand_name_writer");
    let tBold = getStructVariable("struct.font.bold");
    tBold.setaProp(Symbol.for("color"), rgb("#EEEEEE"));
    createWriter(tWriterId, tBold);
    this.pWriterBold = getWriter(tWriterId);
    tWriterId = Symbol.for("infostand_desc_writer");
    let tPlain = getStructVariable("struct.font.plain");
    tPlain.setaProp(Symbol.for("color"), rgb("#EEEEEE"));
    createWriter(tWriterId, tPlain);
    this.pWriterPlain = getWriter(tWriterId);
    return 1;
  }

  deconstruct() {
    removeObject(this.pScroller.getID());
    return 1;
  }

  initWindow(tID, ttype) {
    let tWndObj;
    if (!windowExists(tID)) {
      let tBaseWindowType = "obj_disp_base.window";
      createWindow(tID, tBaseWindowType, 9999, 9999);
      tWndObj = getWindow(tID);
    } else {
      tWndObj = getWindow(tID);
    }
    tWndObj.lock();
    mergeWindow(tID, ttype);
    return tWndObj;
  }

  createFurnitureWindow(tID, tProps) {
    let tWndObj = this.initWindow(tID, "obj_disp_furni.window");
    let tNameImage = this.pWriterBold.render(tProps[Symbol.for("name")]).duplicate();
    tWndObj.getElement("room_obj_disp_name").feedImage(tNameImage);
    tWndObj.getElement("room_obj_disp_desc").setText(tProps[Symbol.for("custom")]);
    this.pScroller.registerElement(tID, "room_obj_disp_name");
    this.pScroller.setScroll(1);
    let tImage = tProps.getaProp(Symbol.for("image"));
    if (voidp(tImage)) {
      tImage = member(getmemnum(tProps[Symbol.for("smallmember")])).image;
    }
    tWndObj.getElement("room_obj_disp_avatar").feedImage(tImage);
    tWndObj.lock();
    return 1;
  }

  createMottoWindow(tID, tProps, tSelectedObj, tBadgeObjID, tShowTags) {
    let tWndObj = this.initWindow(tID, "obj_disp_motto.window");
    if (tWndObj.elementExists("room_obj_disp_name")) {
      let tNameImage = this.pWriterBold.render(tProps[Symbol.for("name")]).duplicate();
      tWndObj.getElement("room_obj_disp_name").feedImage(tNameImage);
      this.pScroller.registerElement(tID, "room_obj_disp_name");
      this.pScroller.setScroll(1);
    }
    if (tWndObj.elementExists("room_obj_disp_desc")) {
      let tDescElem = tWndObj.getElement("room_obj_disp_desc");
      let tWidth = tDescElem.getProperty(Symbol.for("width"));
      let tOrigHeight = tDescElem.getProperty(Symbol.for("height"));
      this.pWriterPlain.setProperty(Symbol.for("wordWrap"), 1);
      this.pWriterPlain.setProperty(Symbol.for("rect"), rect(0, 0, tWidth, 0));
      let tDescImage = this.pWriterPlain.render(tProps[Symbol.for("custom")]).duplicate();
      tWndObj.getElement("room_obj_disp_desc").feedImage(tDescImage);
      let tDescHeight = tDescImage.height;
      if (tProps[Symbol.for("custom")] == EMPTY) {
        tDescHeight = 0;
      }
      tWndObj.resizeBy(0, tDescHeight - tOrigHeight);
    }
    tWndObj.lock();
    return 1;
  }

  createHumanWindow(tID, tProps, tSelectedObj, tBadgeObjID, tShowTags) {
    let tWndObj = this.initWindow(tID, "obj_disp_avatar.window");
    if (!tWndObj.elementExists("room_obj_disp_avatar")) {
      return error(this, "Avatar element missing.", Symbol.for("createHumanWindow"), Symbol.for("major"));
    }
    let tAvatarElem = tWndObj.getElement("room_obj_disp_avatar");
    tAvatarElem.feedImage(tProps[Symbol.for("image")]);
    if (tSelectedObj != getObject(Symbol.for("session")).GET("user_index")) {
      tAvatarElem.setProperty(Symbol.for("cursor"), Symbol.for("arrow"));
    }
    let tBadges = tProps[Symbol.for("badges")];
    if (tBadges.ilk != Symbol.for("propList")) {
      tBadges = propList();
    }
    let tMaxBadgeIndex = 0;
    for (let i = 1; i <= tBadges.count; i++) {
      let tIndex = tBadges.getPropAt(i);
      if (tIndex > tMaxBadgeIndex) {
        tMaxBadgeIndex = tIndex;
      }
    }
    if (tMaxBadgeIndex < 4) {
      let tOffsetV = tAvatarElem.getProperty(Symbol.for("height")) - tWndObj.getProperty(Symbol.for("height"));
      tWndObj.resizeBy(0, tOffsetV);
    }
    let tBadgeObj = getObject(tBadgeObjID);
    tBadgeObj.updateInfoStandBadge(tID, tSelectedObj, tBadges);
    tWndObj.lock();
    return 1;
  }

  createBotWindow(tID, tProps) {
    let tWndObj = this.initWindow(tID, "obj_disp_bot.window");
    let tNameImage = this.pWriterBold.render(tProps[Symbol.for("name")]).duplicate();
    tWndObj.getElement("room_obj_disp_name").feedImage(tNameImage);
    tWndObj.getElement("room_obj_disp_desc").setText(tProps[Symbol.for("custom")]);
    this.pScroller.registerElement(tID, "room_obj_disp_name");
    this.pScroller.setScroll(1);
    tWndObj.lock();
    return 1;
  }

  createPetWindow(tID, tProps) {
    let tWndObj = this.initWindow(tID, "obj_disp_pet.window");
    let tNameImage = this.pWriterBold.render(tProps[Symbol.for("name")]).duplicate();
    tWndObj.getElement("room_obj_disp_name").feedImage(tNameImage);
    tWndObj.getElement("room_obj_disp_desc").setText(tProps[Symbol.for("custom")]);
    this.pScroller.registerElement(tID, "room_obj_disp_name");
    this.pScroller.setScroll(1);
    tWndObj.getElement("room_obj_disp_avatar").feedImage(tProps[Symbol.for("image")]);
    tWndObj.lock();
    return 1;
  }

  createActionsHumanWindow(tID, tTargetUserName, tShowButtons) {
    let tSessionObj = getObject(Symbol.for("session"));
    let tUserRights = tSessionObj.GET("user_rights");
    let tButtonList;
    let tWindowModel;
    let tOwnUser;
    let tRoomComponent;
    let tRoomData;
    if (tTargetUserName == tSessionObj.GET("user_name")) {
      tOwnUser = getThread("room").getComponent().getOwnUser();
      tWindowModel = "obj_disp_actions_own.window";
      tButtonList = propList();
      tButtonList["wave"] = Symbol.for("visible");
      tButtonList["dance"] = Symbol.for("hidden");
      tButtonList["hcdance"] = Symbol.for("hidden");
      tButtonList["badges"] = Symbol.for("visible");
      tButtonList["outlook"] = Symbol.for("visible");
      let tMainAction = tOwnUser.getProperty(Symbol.for("mainAction"));
      let tSwimming = tOwnUser.getProperty(Symbol.for("swimming"));
      let tSitting = tMainAction == "sit";
      let tLaying = tMainAction == "lay";
      let tDanceButtonState = Symbol.for("visible");
      if (tLaying || tSwimming) {
        tDanceButtonState = Symbol.for("deactive");
        tButtonList["wave"] = Symbol.for("deactive");
      }
      if (tSitting) {
        tDanceButtonState = Symbol.for("deactive");
      }
      if (tUserRights.getOne("fuse_use_club_dance")) {
        tButtonList["hcdance"] = tDanceButtonState;
      } else {
        tButtonList["dance"] = tDanceButtonState;
      }
    } else {
      tButtonList = propList();
      tButtonList["friend"] = Symbol.for("visible");
      tButtonList["trade"] = Symbol.for("visible");
      tButtonList["ignore"] = Symbol.for("visible");
      tButtonList["unignore"] = Symbol.for("visible");
      tButtonList["kick"] = Symbol.for("visible");
      tButtonList["ban"] = Symbol.for("visible");
      tButtonList["give_rights"] = Symbol.for("visible");
      tButtonList["take_rights"] = Symbol.for("visible");
      tWindowModel = "obj_disp_actions_peer.window";
      let tRoomOwner = tSessionObj.GET("room_owner");
      let tAnyRoomController = tUserRights.getOne("fuse_any_room_controller");
      let tRoomController = tSessionObj.GET("room_controller");
      if (threadExists(Symbol.for("friend_list"))) {
        let tComponent = getThread(Symbol.for("friend_list")).getComponent();
        let tFriendData = tComponent.getFriendByName(tTargetUserName);
        if (ilk(tFriendData) == Symbol.for("propList")) {
          tButtonList["friend"] = Symbol.for("deactive");
        }
      } else {
        tButtonList["friend"] = Symbol.for("deactive");
      }
      tRoomComponent = getThread(Symbol.for("room")).getComponent();
      let tNotPrivateRoom = tRoomComponent.getRoomID() != "private";
      let tNoTrading = tRoomComponent.getRoomData()[Symbol.for("trading")] == 0;
      let tTradeTimeout = 0;
      let tTradeProhibited = !tUserRights.getOne("fuse_trade");
      if (tTradeTimeout || tNotPrivateRoom || tNoTrading || tTradeProhibited) {
        tButtonList["trade"] = Symbol.for("deactive");
      }
      let tRoomInterface = getThread(Symbol.for("room")).getInterface();
      let tSelectedObj = tRoomInterface.getSelectedObject();
      let tUserInfo = tRoomComponent.getUserObject(tSelectedObj).getInfo();
      let tBadge = tUserInfo.getaProp(Symbol.for("badge"));
      let tIgnoreListObj = getThread(Symbol.for("room")).getInterface().getIgnoreListObject();
      if (tIgnoreListObj.getIgnoreStatus(tUserInfo.name)) {
        tButtonList["ignore"] = Symbol.for("hidden");
      } else {
        tButtonList["unignore"] = Symbol.for("hidden");
      }
      if (this.pModBadgeList.getOne(tBadge) > 0) {
        tButtonList["ignore"] = Symbol.for("hidden");
        tButtonList["unignore"] = Symbol.for("hidden");
      }
      if (!tRoomOwner && !tAnyRoomController && !tRoomController) {
        tButtonList["kick"] = Symbol.for("hidden");
      }
      if (!tRoomOwner && !tAnyRoomController) {
        tButtonList["ban"] = Symbol.for("hidden");
      }
      tRoomData = tRoomComponent.getRoomData();
      if (tRoomData.getaProp(Symbol.for("type")) == Symbol.for("public")) {
        tButtonList["kick"] = Symbol.for("hidden");
        tButtonList["ban"] = Symbol.for("hidden");
      }
      if (tRoomOwner) {
        if (tUserInfo.ctrl == 0) {
          tButtonList["take_rights"] = Symbol.for("hidden");
        } else {
          if (tUserInfo.ctrl == "furniture") {
            tButtonList["give_rights"] = Symbol.for("hidden");
          } else {
            if (tUserInfo.ctrl == "useradmin") {
              tButtonList["give_rights"] = Symbol.for("hidden");
            }
          }
        }
      } else {
        tButtonList["give_rights"] = Symbol.for("hidden");
        tButtonList["take_rights"] = Symbol.for("hidden");
      }
    }
    let tWndObj = this.initWindow(tID, tWindowModel);
    this.scaleButtonWindow(tID, tButtonList, tShowButtons);
    if (tTargetUserName == tSessionObj.GET("user_name")) {
      if (tWndObj.elementExists("hcdance.button")) {
        let tElem = tWndObj.getElement("hcdance.button");
        let tDance = tOwnUser.getProperty(Symbol.for("dancing"));
        tElem.setSelection(tDance + 2, 1);
      }
    }
    tWndObj.lock();
    return tID;
  }

  createActionsFurniWindow(tID, tClass, tShowButtons) {
    let tButtonList = propList();
    tButtonList["move"] = Symbol.for("hidden");
    tButtonList["rotate"] = Symbol.for("hidden");
    tButtonList["pick"] = Symbol.for("hidden");
    tButtonList["delete"] = Symbol.for("hidden");
    let tSessionObj = getObject(Symbol.for("session"));
    let tRoomController = tSessionObj.GET("room_controller");
    if (tRoomController) {
      tButtonList["move"] = Symbol.for("visible");
      tButtonList["rotate"] = Symbol.for("visible");
    }
    let tRoomOwner = tSessionObj.GET("room_owner");
    if (tRoomOwner) {
      tButtonList["move"] = Symbol.for("visible");
      tButtonList["rotate"] = Symbol.for("visible");
      tButtonList["pick"] = Symbol.for("visible");
    }
    let tAnyRoomController = tSessionObj.GET("user_rights").getOne("fuse_any_room_controller");
    if (tAnyRoomController) {
      tButtonList["move"] = Symbol.for("visible");
      tButtonList["rotate"] = Symbol.for("visible");
      tButtonList["pick"] = Symbol.for("visible");
    }
    if (tClass == "item") {
      tButtonList["move"] = Symbol.for("hidden");
      tButtonList["rotate"] = Symbol.for("hidden");
    }
    let tRoomInterface = getThread(Symbol.for("room")).getInterface();
    let tSelectedObjID = tRoomInterface.getSelectedObject();
    let tRoomComponent = tRoomInterface.getComponent();
    if (tRoomComponent.itemObjectExists(tSelectedObjID)) {
      let tSelectedObj = tRoomComponent.getItemObject(tSelectedObjID);
      tClass = tSelectedObj.getClass();
      if (tClass contains "post.it") {
        tButtonList["pick"] = Symbol.for("hidden");
      }
    }
    let tWndObj = this.initWindow(tID, "obj_disp_actions_furni.window");
    if (!tRoomController && !tRoomOwner && !tAnyRoomController) {
      if (tWndObj.elementExists("object_displayer_toggle_actions_icon")) {
        tWndObj.getElement("object_displayer_toggle_actions_icon").hide();
      }
      if (tWndObj.elementExists("object_displayer_toggle_actions")) {
        tWndObj.getElement("object_displayer_toggle_actions").hide();
      }
    }
    this.scaleButtonWindow(tID, tButtonList, tShowButtons);
    tWndObj.lock();
    return tID;
  }

  showHideTags(tID, tShowTags) {
    let tWndObj = getWindow(tID);
    if (!tWndObj.elementExists("object_displayer_toggle_tags_icon")) {
      return 0;
    }
    if (!tWndObj.elementExists("object_displayer_toggle_tags")) {
      return 0;
    }
    let tArrowElem = tWndObj.getElement("object_displayer_toggle_tags_icon");
    let tTextElem = tWndObj.getElement("object_displayer_toggle_tags");
    if (voidp(tShowTags)) {
      tArrowElem.hide();
      tTextElem.hide();
    } else {
      if (tShowTags) {
        tArrowElem.setProperty(Symbol.for("member"), this.pExtensionOpenedID);
        tTextElem.setText(getText("object_displayer_hide_tags"));
      } else {
        tArrowElem.setProperty(Symbol.for("member"), this.pExtensionClosedID);
        tTextElem.setText(getText("object_displayer_show_tags"));
      }
    }
  }

  scaleButtonWindow(tID, tButtonList, tShowButtons) {
    let tWndObj = getWindow(tID);
    if (tShowButtons == 0) {
      for (let tIndex = 1; tIndex <= tButtonList.count; tIndex++) {
        let tButtonID = tButtonList.getPropAt(tIndex);
        tButtonList[tButtonID] = Symbol.for("hidden");
      }
      let tArrowElem = tWndObj.getElement("object_displayer_toggle_actions_icon");
      tArrowElem.setProperty(Symbol.for("member"), this.pExtensionClosedID);
      let tTextElem = tWndObj.getElement("object_displayer_toggle_actions");
      let tOpenText = getText("object_displayer_show_actions");
      tTextElem.setText(tOpenText);
    }
    let tCurrentButtonTopPos = 0;
    let tOffsetV = 0;
    let tButtonVertMargins = 3;
    let tButtonHeight = 15;
    let tLine = 1;
    let tWindowWidth = tWndObj.getProperty(Symbol.for("width"));
    let tMaxWidth = the.stage.rect.width;
    for (let tIndex = 1; tIndex <= tButtonList.count; tIndex++) {
      let tButtonID = tButtonList.getPropAt(tIndex);
      let tButtonVisibility = tButtonList[tButtonID];
      let tElement = tWndObj.getElement(`${tButtonID}.button`);
      let tLeftPos = tElement.getProperty(Symbol.for("locX"));
      if (tIndex == 1) {
        tCurrentButtonTopPos = tElement.getProperty(Symbol.for("locY"));
      }
      let tElemWidth = tElement.getProperty(Symbol.for("width"));
      if (tButtonVisibility != Symbol.for("hidden")) {
        if ((tOffsetV + tElemWidth) <= tMaxWidth) {
          tLeftPos = tLeftPos + tOffsetV;
          tOffsetV = tOffsetV + tElemWidth + tButtonVertMargins;
        } else {
          if ((tButtonVisibility != Symbol.for("hidden")) && (tIndex > 1)) {
            tCurrentButtonTopPos = tCurrentButtonTopPos + tButtonHeight + tButtonVertMargins;
            tLine = tLine + 1;
          }
          tOffsetV = tElemWidth + tButtonVertMargins;
        }
      }
      switch (tButtonVisibility) {
        case Symbol.for("visible"):
          tElement.moveTo(tLeftPos, tCurrentButtonTopPos);
          break;
        case Symbol.for("deactive"):
          tElement.moveTo(tLeftPos, tCurrentButtonTopPos);
          tElement.deactivate();
          break;
        case Symbol.for("hidden"):
          tElement.setProperty(Symbol.for("visible"), 0);
          break;
      }
    }
    let tStackHeight = (tLine * (tButtonHeight + tButtonVertMargins)) + (2 * tButtonVertMargins);
    this.resizeWindowTo(tID, tOffsetV, tStackHeight);
  }

  createLinksWindow(tID, tFormat) {
    let tWindowModel;
    switch (tFormat) {
      case Symbol.for("own"):
        tWindowModel = "obj_disp_links_own.window";
        break;
      case Symbol.for("peer"):
        tWindowModel = "obj_disp_links_peer.window";
        break;
    }
    let tWndObj = this.initWindow(tID, tWindowModel);
    if (tFormat == Symbol.for("own")) {
      let tBadgeList = getObject(Symbol.for("session")).GET("available_badges");
      if (listp(tBadgeList)) {
        if (tBadgeList.count == 0) {
          let tElem = tWndObj.getElement("room_obj_disp_badge_sel");
          tElem.setProperty(Symbol.for("blend"), 20);
          tElem.setProperty(Symbol.for("cursor"), 0);
          tElem = tWndObj.getElement("room_obj_disp_icon_badge");
          tElem.setProperty(Symbol.for("blend"), 20);
          tElem.setProperty(Symbol.for("cursor"), 0);
        }
      }
    }
    tWndObj.lock();
    return tID;
  }

  createUserTagsWindow(tID) {
    let tWindowModel = "obj_disp_user_tags.window";
    let tWndObj = this.initWindow(tID, tWindowModel);
    tWndObj.lock();
    return tID;
  }

  createUserXpWindow(tID, tXP) {
    let tWindowModel = "obj_disp_xp.window";
    let tWndObj = this.initWindow(tID, tWindowModel);
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.lock();
    let tElem = tWndObj.getElement("room_obj_disp_xp");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(replaceChunks(getText("object_displayer_xp"), "\\xp", tXP));
    return tID;
  }

  createBottomWindow(tID) {
    let tWndObj = this.initWindow(tID, "obj_disp_bottom.window");
    tWndObj.lock();
    return tID;
  }

  resizeWindowBy(tID, tX, tY) {
    let tWndObj = getWindow(tID);
    tWndObj.resizeBy(tX, tY);
  }

  resizeWindowTo(tID, tX, tY) {
    let tWndObj = getWindow(tID);
    tWndObj.resizeTo(tX, tY);
  }

  clearWindow(tWindowID) {
    if (!windowExists(tWindowID)) {
      return 0;
    }
    let tWndObj = getWindow(tWindowID);
    tWndObj.hide();
    tWndObj.unmerge();
    this.pScroller.setScroll(0);
    return 1;
  }
}
