export default class {
  pChosenBadge;
  pChosenVisibility;
  pImageLibraryURL;
  pActiveDownloads;
  pUpdatedBadges;
  pBadgeListRenderer;
  pBadgeWindowID;
  pActiveBadgeID;
  pActiveSlot;
  pSelectedBadges;
  pNewBadges;

  construct() {
    this.pChosenBadge = 1;
    this.pChosenVisibility = 1;
    this.pImageLibraryURL = getVariable("image.library.url");
    this.pActiveDownloads = list();
    this.pBadgeWindowID = "badgeSelectionWindowID";
    this.pUpdatedBadges = propList();
    this.pActiveBadgeID = 0;
    this.pActiveSlot = 0;
    this.pSelectedBadges = list();
    this.pNewBadges = list();
    this.pSelectedBadges[5] = 0;
    this.pBadgeListRenderer = createObject(getUniqueID(), "Badge List Class");
    registerMessage(Symbol.for("achievementsUpdated"), this.getID(), Symbol.for("updateAchievements"));
    registerMessage(Symbol.for("badgeReceived"), this.getID(), Symbol.for("addNewBadge"));
    registerMessage(Symbol.for("badgeRemoved"), this.getID(), Symbol.for("handleBadgeRemove"));
    return 1;
  }

  deconstruct() {
    if (windowExists(this.pBadgeWindowID)) {
      removeWindow(this.pBadgeWindowID);
    }
    if (objectp(this.pBadgeListRenderer)) {
      removeObject(this.pBadgeListRenderer.getID());
    }
    for (let i = 1; i <= this.pActiveDownloads.count; i++) {
      abortDownLoad(this.pActiveDownloads[i]);
    }
    unregisterMessage(Symbol.for("achievementsUpdated"), this.getID());
    unregisterMessage(Symbol.for("badgeReceived"), this.getID());
    unregisterMessage(Symbol.for("badgeRemoved"), this.getID());
    return 1;
  }

  openBadgeWindow() {
    this.closeBadgeWindow();
    let tSelectedObjID = getThread(Symbol.for("room")).getInterface().getSelectedObject();
    if (tSelectedObjID != getObject(Symbol.for("session")).GET("user_index")) {
      return 0;
    }
    let tSelectedObj = getThread(Symbol.for("room")).getComponent().getUserObject(tSelectedObjID);
    if (!tSelectedObj) {
      return 0;
    }
    let tBadges = tSelectedObj.getProperty(Symbol.for("badges"));
    if (tBadges.ilk != Symbol.for("propList")) {
      tBadges = propList();
    }
    for (let i = 1; i <= tBadges.count; i++) {
      this.pSelectedBadges[tBadges.getPropAt(i)] = tBadges[i];
    }
    let tAllBadges = getObject("session").GET("available_badges", list());
    this.loadBadgeImages(tAllBadges);
    if (!createWindow(this.pBadgeWindowID)) {
      return error(this, "Badge choice window not created!", Symbol.for("openBadgeWindow"), Symbol.for("major"));
    }
    let tWndObj = getWindow(this.pBadgeWindowID);
    tWndObj.setProperty(Symbol.for("title"), getText("badges_window_title"));
    let tMerged = tWndObj.merge("habbo_basic.window");
    if (tMerged) {
      tMerged = tWndObj.merge("badge_select.window");
    }
    if (!tMerged) {
      removeWindow(this.pBadgeWindowID);
      return error(this, "Badge selection window not merged!", Symbol.for("openBadgeWindow"), Symbol.for("major"));
    }
    registerMessage(Symbol.for("leaveRoom"), tWndObj.getID(), Symbol.for("close"));
    registerMessage(Symbol.for("changeRoom"), tWndObj.getID(), Symbol.for("close"));
    tWndObj.registerProcedure(Symbol.for("eventProcBadgeChooser"), this.getID(), Symbol.for("mouseUp"));
    if ((this.pActiveBadgeID == 0) && (tAllBadges.count > 0)) {
      this.selectBadge(tAllBadges[1]);
    } else {
      this.selectBadge(this.pActiveBadgeID);
    }
    this.updateBadgeView();
  }

  closeBadgeWindow() {
    if (windowExists(this.pBadgeWindowID)) {
      let tWndObj = getWindow(this.pBadgeWindowID);
      unregisterMessage(Symbol.for("leaveRoom"), tWndObj.getID());
      unregisterMessage(Symbol.for("changeRoom"), tWndObj.getID());
      tWndObj.close();
    }
  }

  openAchievementsWindow() {
    if (windowExists(this.pBadgeWindowID)) {
      removeWindow(this.pBadgeWindowID);
    }
    if (!createWindow(this.pBadgeWindowID)) {
      return error(this, "Achievements window not created!", Symbol.for("openBadgeWindow"), Symbol.for("major"));
    }
    let tWndObj = getWindow(this.pBadgeWindowID);
    tWndObj.setProperty(Symbol.for("title"), getText("badges_window_title"));
    let tMerged = tWndObj.merge("habbo_basic.window");
    if (tMerged) {
      tMerged = tWndObj.merge("achievements.window");
    }
    if (!tMerged) {
      removeWindow(this.pBadgeWindowID);
      return error(this, "Badge selection window not merged!", Symbol.for("openBadgeWindow"), Symbol.for("major"));
    }
    registerMessage(Symbol.for("leaveRoom"), tWndObj.getID(), Symbol.for("close"));
    registerMessage(Symbol.for("changeRoom"), tWndObj.getID(), Symbol.for("close"));
    tWndObj.registerProcedure(Symbol.for("eventProcBadgeChooser"), this.getID(), Symbol.for("mouseUp"));
    this.updateAchievements();
  }

  updateAchievements() {
    if (!windowExists(this.pBadgeWindowID)) {
      return 0;
    }
    let tWindow = getWindow(this.pBadgeWindowID);
    if (tWindow.elementExists("achievement_list") && threadExists(Symbol.for("room"))) {
      let tAchievements = getObject(Symbol.for("session")).GET("possible_achievements");
      let tBadgeIDs = list();
      for (let tPropNum = 1; tPropNum <= tAchievements.count; tPropNum++) {
        tBadgeIDs.add(tAchievements.getPropAt(tPropNum));
      }
      this.loadBadgeImages(tBadgeIDs);
      let tElem = tWindow.getElement("achievement_list");
      let tAchievementsImage = this.pBadgeListRenderer.renderAchievements(tBadgeIDs);
      tElem.feedImage(tAchievementsImage);
    }
  }

  updateBadgeImage() {
    if (!windowExists(this.pBadgeWindowID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pBadgeWindowID);
    let tBadgeList = getObject("session").GET("available_badges", list());
    if ((this.pChosenBadge > tBadgeList.count) || (this.pChosenBadge < 1)) {
      return 0;
    }
    let tBadgeName = tBadgeList[this.pChosenBadge];
    let tMemNum = getmemnum(`badge ${tBadgeName}`);
    if ((tMemNum < 1) || (this.pUpdatedBadges[tBadgeName] == 0)) {
      tWndObj.getElement("badge_preview").clearImage();
      this.startBadgeDownload(tBadgeName);
      return 0;
    }
    let tWidth = tWndObj.getElement("badge_preview").getProperty(Symbol.for("width"));
    let tHeight = tWndObj.getElement("badge_preview").getProperty(Symbol.for("height"));
    let tBadgeImage = member(tMemNum).image;
    let tCenteredImage = image(tWidth, tHeight, 32);
    let tXchange = (tCenteredImage.width - tBadgeImage.width) / 2;
    let tYchange = (tCenteredImage.height - tBadgeImage.height) / 2;
    let tRect1 = tBadgeImage.rect + rect(tXchange, tYchange, tXchange, tYchange);
    tCenteredImage.copyPixels(tBadgeImage, tRect1, tBadgeImage.rect);
    tWndObj.getElement("badge_preview").feedImage(tCenteredImage);
    return 1;
  }

  sendSetBadges() {
    let tMsg = propList();
    for (let i = 1; i <= 5; i++) {
      tMsg.addProp(Symbol.for("integer"), i);
      if (this.pSelectedBadges[i].ilk == Symbol.for("string")) {
        tMsg.addProp(Symbol.for("string"), this.pSelectedBadges[i]);
        continue;
      }
      tMsg.addProp(Symbol.for("string"), EMPTY);
    }
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETBADGE", tMsg);
  }

  eventProcBadgeChooser(tEvent, tSprID, tParam) {
    if (tSprID contains "badge_slot") {
      let tSlotNum = tSprID.char[tSprID.length];
      this.selectSlot(tSlotNum);
      return 1;
    }
    switch (tSprID) {
      case "badge_list":
        if (tParam.ilk != Symbol.for("point")) {
          return 0;
        }
        let tBadgeID = this.pBadgeListRenderer.getBadgeAt(tParam);
        if (!tBadgeID) {
          return 0;
        }
        this.selectBadge(tBadgeID);
        break;
      case "selected_badge_button":
        if (this.pSelectedBadges.findPos(this.pActiveBadgeID) > 0) {
          this.clearActiveSlot();
        } else {
          let tFreeSlot = this.pSelectedBadges.getPos(0);
          if (tFreeSlot > 0) {
            this.selectSlot(tFreeSlot);
          }
        }
        break;
      case "badges_tab":
        this.openBadgeWindow();
        break;
      case "achievements_tab":
        this.openAchievementsWindow();
        break;
      case "button_ok":
        this.sendSetBadges();
        this.closeBadgeWindow();
        break;
      case "button_cancel":
        this.closeBadgeWindow();
        break;
    }
  }

  startBadgeDownload(tBadgeName) {
    if ((tBadgeName == EMPTY) || (tBadgeName == " ") || voidp(tBadgeName)) {
      return 0;
    }
    if (downloadExists(`badge ${tBadgeName}`)) {
      return 0;
    }
    if (downloadExists(`badge localized ${tBadgeName}`)) {
      return 0;
    }
    let tSourceURL = `${this.pImageLibraryURL}Badges/${tBadgeName}.gif`;
    let tBadgeMemNum = 0;
    if (getmemnum(`badge ${tBadgeName}`) != 0) {
      tBadgeMemNum = queueDownload(tSourceURL, `badge localized ${tBadgeName}`, Symbol.for("bitmap"), 1);
    } else {
      tBadgeMemNum = queueDownload(tSourceURL, `badge ${tBadgeName}`, Symbol.for("bitmap"), 1);
    }
    if (tBadgeMemNum == 0) {
      return 0;
    }
    member(tBadgeMemNum).image = image(1, 1, 32);
    member(tBadgeMemNum).trimWhiteSpace = 0;
    registerDownloadCallback(tBadgeMemNum, Symbol.for("badgeLoaded"), this.getID(), tBadgeName);
    this.pActiveDownloads.add(`badge ${tBadgeName}`);
    return 1;
  }

  badgeLoaded(tBadgeName) {
    this.pUpdatedBadges[tBadgeName] = 1;
    let tLoadedBadgeNum = getmemnum(`badge localized ${tBadgeName}`);
    if (tLoadedBadgeNum != 0) {
      if (member(tLoadedBadgeNum).image.rect != rect(0, 0, 1, 1)) {
        let tBadgeNum = getmemnum(`badge ${tBadgeName}`);
        if (tBadgeNum != 0) {
          member(tBadgeNum).image = member(tLoadedBadgeNum).image;
        }
      }
    }
    executeMessage(Symbol.for("updateInfoStandBadge"), tBadgeName);
    this.pActiveDownloads.deleteOne(`badge ${tBadgeName}`);
    if (this.pActiveBadgeID == tBadgeName) {
      this.selectBadge(tBadgeName);
    }
    this.updateBadgeView();
    this.updateAchievements();
  }

  addNewBadge(tBadgeID) {
    if (this.pNewBadges.getPos(tBadgeID) > 0) {
      return 0;
    }
    this.pNewBadges.add(tBadgeID);
    this.updateBadgeView();
  }

  handleBadgeRemove(tBadgeID) {
    let tPos = this.pSelectedBadges.getPos(tBadgeID);
    if (tPos > 0) {
      this.pSelectedBadges[tPos] = 0;
    }
    if (this.pActiveBadgeID == tBadgeID) {
      this.pActiveBadgeID = 0;
    }
    this.updateBadgeView();
  }

  updateBadgeView() {
    this.updateBadgeListImage();
    this.updatePreview();
    this.updateSlots();
  }

  updateBadgeListImage() {
    if (!windowExists(this.pBadgeWindowID)) {
      return 0;
    }
    let tWindow = getWindow(this.pBadgeWindowID);
    if (!tWindow.elementExists("badge_list")) {
      return 0;
    }
    let tBadges = getObject(Symbol.for("session")).GET("available_badges", list());
    let tListElem = tWindow.getElement("badge_list");
    tListElem.feedImage(this.pBadgeListRenderer.render(tBadges, this.pSelectedBadges, this.pNewBadges, this.pActiveBadgeID));
  }

  updateInfoStandBadge(tInfoStandID, tSelectedObjID, tBadges) {
    let tWndObj = getWindow(tInfoStandID);
    if (!tWndObj) {
      return 0;
    }
    let tUserObj = getThread(Symbol.for("room")).getComponent().getUserObject(tSelectedObjID);
    if (!objectp(tUserObj)) {
      return 0;
    }
    if (tBadges.ilk != Symbol.for("propList")) {
      return 0;
    }
    let tOwnCharacter = tSelectedObjID == getObject("session").GET("user_index");
    if (tUserObj.pBadges != tBadges) {
      return 0;
    }
    for (let tBadgeIndex = 1; tBadgeIndex <= 5; tBadgeIndex++) {
      if (!tWndObj.elementExists(`info_badge_${tBadgeIndex}`)) {
        continue;
      }
      let tElem = tWndObj.getElement(`info_badge_${tBadgeIndex}`);
      tElem.clearImage();
      let tBadgeID = tBadges.getaProp(tBadgeIndex);
      if (voidp(tBadgeID)) {
        continue;
      }
      if (tOwnCharacter) {
        tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
      }
      if (memberExists(`badge ${tBadgeID} localized`)) {
        let tBadgeMember = member(getmemnum(`badge ${tBadgeID} localized`));
        if (tBadgeMember.type == Symbol.for("bitmap")) {
          tElem.feedImage(tBadgeMember.image);
        }
        continue;
      }
      if (memberExists(`badge ${tBadgeID}`)) {
        tBadgeMember = member(getmemnum(`badge ${tBadgeID}`));
        if (tBadgeMember.type == Symbol.for("bitmap")) {
          tElem.feedImage(tBadgeMember.image);
        }
        continue;
      }
      this.startBadgeDownload(tBadgeID);
      return 0;
    }
  }

  createBadgeEffect(tElem) {
    if (objectExists("BadgeEffect")) {
      return 0;
    }
    if (createObject("BadgeEffect", "Badge Effect Class") != 0) {
      return getObject("BadgeEffect").Init(tElem);
    }
  }

  removeBadgeEffect() {
    if (objectExists("BadgeEffect")) {
      return removeObject("BadgeEffect");
    }
  }

  selectBadge(tBadgeID) {
    let tPos = this.pNewBadges.getPos(tBadgeID);
    if (tPos > 0) {
      this.pNewBadges.deleteAt(tPos);
    }
    this.pActiveBadgeID = tBadgeID;
    this.updateBadgeView();
  }

  updatePreview() {
    if (!windowExists(this.pBadgeWindowID)) {
      return 0;
    }
    let tWindow = getWindow(this.pBadgeWindowID);
    if (tWindow.elementExists("selected_badge")) {
      let tBadgeElem = tWindow.getElement("selected_badge");
      let tBadgeImage;
      if ((this.pActiveBadgeID != 0) && memberExists(`badge ${this.pActiveBadgeID}`)) {
        tBadgeImage = member(getmemnum(`badge ${this.pActiveBadgeID}`)).image;
      } else {
        tBadgeImage = image(1, 1, 8);
      }
      let tDouble = image(tBadgeImage.width * 2, tBadgeImage.height * 2, tBadgeImage.depth);
      tDouble.copyPixels(tBadgeImage, tBadgeImage.rect * 2, tBadgeImage.rect);
      tDouble = this.pBadgeListRenderer.centerImage(tDouble, rect(0, 0, 94, 94));
      tBadgeElem.feedImage(tDouble);
    }
    if (tWindow.elementExists("selected_badge_name")) {
      let tNameElem = tWindow.getElement("selected_badge_name");
      if (this.pActiveBadgeID != 0) {
        tNameElem.setText(getText(`badge_name_${this.pActiveBadgeID}`));
      } else {
        tNameElem.hide();
      }
    }
    if (tWindow.elementExists("selected_badge_name")) {
      let tDescElem = tWindow.getElement("selected_badge_desc");
      if (this.pActiveBadgeID != 0) {
        tDescElem.setText(getText(`badge_desc_${this.pActiveBadgeID}`));
      } else {
        tDescElem.hide();
      }
    }
    if (tWindow.elementExists("selected_badge_button") && tWindow.elementExists("slots_full_text")) {
      let tButton = tWindow.getElement("selected_badge_button");
      let tTextElem = tWindow.getElement("slots_full_text");
      let tButtonText = "";
      if (this.pSelectedBadges.getPos(this.pActiveBadgeID) == 0) {
        tButtonText = getText("badge_wear");
        this.pActiveSlot = 0;
        if (this.pSelectedBadges.getPos(0) == 0) {
          tButton.hide();
          tTextElem.show();
        } else {
          tButton.show();
          tTextElem.hide();
        }
      } else {
        tButtonText = getText("badge_remove");
        this.pActiveSlot = this.pSelectedBadges.getPos(this.pActiveBadgeID);
        tButton.show();
        tTextElem.hide();
      }
      tButton.setText(tButtonText);
    }
  }

  selectSlot(tSlotIndex) {
    tSlotIndex = integer(tSlotIndex);
    if ((tSlotIndex < 1) || (tSlotIndex > this.pSelectedBadges.count)) {
      return error(this, "Slot index out of range", Symbol.for("selectSlot"), Symbol.for("major"));
    }
    let tBadgeID = this.pSelectedBadges[tSlotIndex];
    if (tBadgeID != 0) {
      this.selectBadge(tBadgeID);
    } else {
      if ((this.pActiveBadgeID != 0) && (this.pSelectedBadges.getPos(this.pActiveBadgeID) == 0)) {
        this.pSelectedBadges[tSlotIndex] = this.pActiveBadgeID;
        this.updateBadgeView();
      }
    }
  }

  clearActiveSlot() {
    if (this.pActiveSlot == 0) {
      return 0;
    }
    this.pSelectedBadges[this.pActiveSlot] = 0;
    this.updateBadgeView();
  }

  updateSlots() {
    if (!windowExists(this.pBadgeWindowID)) {
      return 0;
    }
    let tWindow = getWindow(this.pBadgeWindowID);
    for (let tSlot = 1; tSlot <= 5; tSlot++) {
      if (!tWindow.elementExists(`badge_slot_${tSlot}`)) {
        continue;
      }
      let tBadgeID = this.pSelectedBadges[tSlot];
      let tElem = tWindow.getElement(`badge_slot_${tSlot}`);
      let tMemNum = getmemnum(`badge ${tBadgeID}`);
      let tBadgeImage;
      if ((tBadgeID == 0) || (tMemNum == 0)) {
        tBadgeImage = image(1, 1, 8);
      } else {
        tBadgeImage = member(tMemNum).image;
      }
      let tWidth = tElem.getProperty(Symbol.for("width"));
      let tHeight = tElem.getProperty(Symbol.for("height"));
      let tCenteredImage = this.pBadgeListRenderer.centerImage(tBadgeImage, rect(0, 0, tWidth, tHeight));
      if ((this.pActiveBadgeID != 0) && (tBadgeID == this.pActiveBadgeID) && memberExists("slot_hilite")) {
        let tHiliteImage = member(getmemnum("slot_hilite")).image;
        tCenteredImage.copyPixels(tHiliteImage, tCenteredImage.rect, tHiliteImage.rect, propList("ink", 36));
      }
      tElem.feedImage(tCenteredImage);
    }
  }

  loadBadgeImages(tBadgeList) {
    for (const tBadgeID of tBadgeList) {
      if (!memberExists(`badge ${tBadgeID}`)) {
        this.startBadgeDownload(tBadgeID);
      }
    }
  }
}
