export default class {
  pListItemHeight;
  pPageVisibleSize;
  pPageMaxSize;
  pVisibleIdList;
  pBackImages;
  pTeamSizeImages;

  construct() {
    this.cacheBackImages();
    this.cacheTeamSizeImages();
    pPageVisibleSize = 11;
    pPageMaxSize = 20;
    pListItemHeight = 25;
    pVisibleIdList = list();
    return this.ancestor.construct();
  }

  deconstruct() {
    pBackImages = list();
    pTeamSizeImages = list();
    pVisibleIdList = list();
    return this.ancestor.deconstruct();
  }

  addWindows() {
    this.pWindowID = "ig_list";
    const tWrapObjRef = this.getWindowWrapper(this);
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.moveTo(90, 70);
    let tSetID = `${this.pWindowSetId}_top`;
    tWrapObjRef.initSet(tSetID, 1);
    tWrapObjRef.addOneWindow(this.getWindowId("top"), "ig_frame_join.window", tSetID, propList(Symbol.for("span_all_columns"), 1));
    tSetID = `${this.pWindowSetId}_a`;
    tWrapObjRef.initSet(tSetID, 1);
    tWrapObjRef.addOneWindow(this.getWindowId("w1"), "ig_title_starting_gms.window", tSetID);
    tWrapObjRef.addOneWindow(this.getWindowId("list"), "ig_gamelist.window", tSetID);
    tWrapObjRef.addOneWindow(this.getWindowId("btm"), VOID, tSetID);
    return 1;
  }

  render() {
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    pVisibleIdList = tService.getMainListIds(pPageMaxSize);
    const tIdCount = pVisibleIdList.count;
    const tJoinedGameId = tService.getJoinedGameId();
    const tObservedGameId = tService.getObservedGameId();
    const tScrollBars = tIdCount > pPageVisibleSize;
    let tWidth;
    let tImageSize;
    if (tScrollBars == 1) {
      tWidth = 212;
      tImageSize = tIdCount;
    } else {
      tWidth = 233;
      tImageSize = pPageVisibleSize;
    }
    this.setScrollBar(tScrollBars);
    const tImage = image(tWidth, pListItemHeight * tImageSize, 32);
    let tBackImage = 0;
    for (let i = 1; i <= tIdCount; i++) {
      const tID = pVisibleIdList[i];
      if (tID == tObservedGameId) {
        this.renderSlotBackground(tImage, pBackImages[3], i, tScrollBars);
      } else {
        this.renderSlotBackground(tImage, pBackImages[tBackImage + 1], i, tScrollBars);
      }
      const tItemRef = tService.getGameEntry(tID);
      this.renderShort(tImage, tItemRef, i, tScrollBars, tID == tJoinedGameId);
      tBackImage = !tBackImage;
    }
    for (let i = tIdCount + 1; i <= pPageVisibleSize; i++) {
      this.renderSlotBackground(tImage, pBackImages[tBackImage + 1], i, tScrollBars);
      tBackImage = !tBackImage;
    }
    const tWrapObjRef = this.getWindowWrapper(this);
    if (tWrapObjRef == 0) {
      return 0;
    }
    const tElement = tWrapObjRef.getElement("ig_gamelist", "ig_list_list");
    if (tElement == 0) {
      return 0;
    }
    tElement.feedImage(tImage);
    const tWndObj = getWindow(this.getWindowId("btm"));
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.unmerge();
    if (tService.getJoinedGameId() == -1) {
      tWndObj.merge("ig_frame_startnew_btm.window");
    } else {
      tWndObj.merge("ig_frame_blank_btm.window");
    }
    return 1;
  }

  getIdFromPoint(tpoint) {
    const tIndex = (tpoint.locV / pListItemHeight) + 1;
    if (tIndex < 1) {
      return -1;
    }
    if (tIndex > pVisibleIdList.count) {
      return -1;
    }
    return pVisibleIdList[tIndex];
  }

  renderShort(tImage, tGameRef, tCount, tScrollBars, tJoinedGame) {
    if (tGameRef == VOID) {
      return 0;
    }
    const tOffsetV = pListItemHeight * (tCount - 1);
    const tWriterPlain = this.getPlainWriter();
    const tWriterBold = this.getBoldWriter();
    let tIcon;
    let tTextImage;
    if (!tJoinedGame) {
      tIcon = tGameRef.getProperty(Symbol.for("game_type_icon"));
      tTextImage = tWriterPlain.render(tGameRef.getProperty(Symbol.for("level_name")));
    } else {
      tIcon = pBackImages[4].duplicate();
      const tFigure = getObject(Symbol.for("session")).GET("user_figure");
      const tsex = getObject(Symbol.for("session")).GET("user_sex");
      const tHeadImage = this.getHeadImage(tFigure, tsex, 18, 18);
      if (tHeadImage.ilk == Symbol.for("image")) {
        tIcon.copyPixels(tHeadImage, tHeadImage.rect, tHeadImage.rect, propList(Symbol.for("ink"), 36));
      }
      tTextImage = tWriterBold.render(tGameRef.getProperty(Symbol.for("level_name")));
    }
    if (ilk(tTextImage) == Symbol.for("image")) {
      const tPicOffsetH = 36;
      tImage.copyPixels(tTextImage, tTextImage.rect + rect(tPicOffsetH, 8 + tOffsetV, tPicOffsetH, 8 + tOffsetV), tTextImage.rect);
    }
    if (ilk(tIcon) == Symbol.for("image")) {
      const tPicOffsetH = ((19 - tIcon.width) / 2) + 8;
      const tPicOffsetV = ((20 - tIcon.height) / 3) + 3;
      tImage.copyPixels(tIcon, tIcon.rect + rect(tPicOffsetH, tOffsetV + tPicOffsetV, tPicOffsetH, tOffsetV + tPicOffsetV), tIcon.rect, propList(Symbol.for("ink"), 36));
    }
    let tOffsetH;
    if (tScrollBars == 1) {
      tOffsetH = 6;
    } else {
      tOffsetH = 25;
    }
    const tTempImage = pTeamSizeImages[tGameRef.getProperty(Symbol.for("number_of_teams"))];
    if (ilk(tTempImage) == Symbol.for("image")) {
      const tPicOffsetH = 158 - (tTempImage.width / 3);
      tImage.copyPixels(tTempImage, tTempImage.rect + rect(tOffsetH + tPicOffsetH, 3 + tOffsetV, tOffsetH + tPicOffsetH, 3 + tOffsetV), tTempImage.rect, propList(Symbol.for("ink"), 36));
    }
    const tTempImage2 = tWriterPlain.render(`${tGameRef.getPlayerCount()}/${tGameRef.getMaxPlayerCount()}`);
    if (ilk(tTempImage2) == Symbol.for("image")) {
      const tPicOffsetH = 178;
      tImage.copyPixels(tTempImage2, tTempImage2.rect + rect(tPicOffsetH + tOffsetH, 8 + tOffsetV, tPicOffsetH + tOffsetH, 8 + tOffsetV), tTempImage2.rect);
    }
    return 1;
  }

  renderSlotBackground(tImage, tBackImage, tCount, tScrollBarSize) {
    const tOffsetY = (tCount - 1) * pListItemHeight;
    const tTargetRect = rect(0, tOffsetY, tImage.width, tOffsetY + pListItemHeight);
    tImage.copyPixels(tBackImage, tTargetRect, tBackImage.rect);
    return 1;
  }

  cacheBackImages() {
    pBackImages = list();
    for (const tMemName of list("ig_list_px_lblue", "ig_list_px_lite", "ig_list_px_dblue", "ig_icon_face_bg2")) {
      const tmember = member(getmemnum(tMemName));
      if (ilk(tmember) != Symbol.for("member")) {
        return error(this, `Cannot find bitmap member ${tMemName}`, Symbol.for("renderList"));
      }
      pBackImages.append(tmember.image);
    }
    return 1;
  }

  cacheTeamSizeImages() {
    pTeamSizeImages = list();
    for (const tMemName of list("ig_icon_teams_1", "ig_icon_teams_2", "ig_icon_teams_3", "ig_icon_teams_4")) {
      const tmember = member(getmemnum(tMemName));
      if (ilk(tmember) != Symbol.for("member")) {
        return error(this, `Cannot find bitmap member ${tMemName}`, Symbol.for("renderList"));
      }
      pTeamSizeImages.append(tmember.image);
    }
    return 1;
  }

  setScrollBar(tstate) {
    const tWndObj = getWindow(this.getWindowId("list"));
    if (tWndObj == 0) {
      return 0;
    }
    let tElement = tWndObj.getElement("ig_scrollbar");
    if (tElement != 0) {
      tElement.setProperty(Symbol.for("visible"), tstate);
    }
    tElement = tWndObj.getElement("ig_scrollbar_bg");
    if (tElement != 0) {
      tElement.setProperty(Symbol.for("visible"), tstate);
    }
    if (tstate == 0) {
      tElement = tWndObj.getElement("ig_gamelist");
      if (tElement != 0) {
        tElement.setOffsetY(0);
      }
    }
    return 1;
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    switch (tSprID) {
      case "ig_gamelist":
        if (ilk(tParam) != Symbol.for("point")) {
          return 0;
        }
        const tID = this.getIdFromPoint(tParam);
        if (tID == -1) {
          return 0;
        }
        if (!integerp(tID)) {
          return 0;
        }
        if (tID == tService.getJoinedGameId()) {
          return tService.ChangeWindowView("JoinedGame");
        }
        return tService.setObservedGameId(tID);
    }
    return 0;
  }
}
