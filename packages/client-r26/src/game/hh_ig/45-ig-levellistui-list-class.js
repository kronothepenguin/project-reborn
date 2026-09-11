export default class {
  pListItemHeight;
  pPageVisibleSize;
  pPageMaxSize;
  pBackImages;

  construct() {
    this.cacheBackImages();
    pPageVisibleSize = 11;
    pPageMaxSize = 20;
    pListItemHeight = 25;
    return this.ancestor.construct();
  }

  deconstruct() {
    pBackImages = list();
    return this.ancestor.deconstruct();
  }

  addWindows() {
    this.pWindowID = "cr";
    const tWrapObjRef = this.getWindowWrapper(this);
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.moveTo(90, 70);
    let tSetID = `${this.pWindowSetId}_top`;
    tWrapObjRef.initSet(tSetID, 1);
    tWrapObjRef.addOneWindow(this.getWindowId("top"), "ig_frame_create.window", tSetID, propList(Symbol.for("span_all_columns"), 1));
    tSetID = `${this.pWindowSetId}_a`;
    tWrapObjRef.initSet(tSetID, 1);
    tWrapObjRef.addOneWindow(this.getWindowId("w1"), "ig_title_choose_lvl.window", tSetID);
    tWrapObjRef.addOneWindow(this.getWindowId("list"), "ig_gamelist.window", tSetID);
    tWrapObjRef.addOneWindow(this.getWindowId("btm"), "ig_frame_blank_btm.window", tSetID);
    return 1;
  }

  render() {
    const tWrapObjRef = this.getWindowWrapper(this);
    if (tWrapObjRef == 0) {
      return 0;
    }
    const tElement = tWrapObjRef.getElement("ig_gamelist", this.getWindowId("list"));
    if (tElement != 0) {
      const tImage = this.renderListImage();
      if (ilk(tImage, Symbol.for("image"))) {
        tElement.feedImage(tImage);
      }
    }
    return 1;
  }

  getItemIndexFromPoint(tpoint) {
    const tItemID = (tpoint.locV / pListItemHeight) + 1;
    return tItemID;
  }

  renderListImage() {
    const tService = this.getIGComponent("LevelList");
    if (tService == 0) {
      return 0;
    }
    const tIDList = tService.getMainListIds(pPageMaxSize);
    const tIdCount = tIDList.count;
    const tSelectedLevelId = tService.getSelectedLevelId();
    let tImageSize;
    if (tIdCount > pPageVisibleSize) {
      tImageSize = tIdCount;
    } else {
      tImageSize = pPageVisibleSize;
    }
    let tScrollBars;
    let tWidth;
    if (tIdCount > pPageVisibleSize) {
      tScrollBars = 1;
      tWidth = 212;
    } else {
      tWidth = 233;
    }
    this.setScrollBar(tScrollBars);
    const tImage = image(tWidth, pListItemHeight * tImageSize, 32);
    let tBackImage = 0;
    for (let i = 1; i <= tIdCount; i++) {
      const tID = tIDList[i];
      if (tID == tSelectedLevelId) {
        this.renderSlotBackground(tImage, pBackImages[3], i);
      } else {
        this.renderSlotBackground(tImage, pBackImages[tBackImage + 1], i);
      }
      const tItemRef = tService.getListEntry(tID);
      this.renderShort(tImage, tItemRef, i);
      tBackImage = !tBackImage;
    }
    for (let i = tIdCount + 1; i <= pPageVisibleSize; i++) {
      this.renderSlotBackground(tImage, pBackImages[tBackImage + 1], i);
      tBackImage = !tBackImage;
    }
    return tImage;
  }

  renderShort(tImage, tGameRef, tCount) {
    const tOffsetV = pListItemHeight * (tCount - 1);
    const tIcon = tGameRef.getProperty(Symbol.for("game_type_icon"));
    if (ilk(tIcon) == Symbol.for("image")) {
      const tPicOffsetH = ((19 - tIcon.width) / 2) + 8;
      const tPicOffsetV = ((20 - tIcon.height) / 3) + 3;
      tImage.copyPixels(tIcon, tIcon.rect + rect(tPicOffsetH, tOffsetV + tPicOffsetV, tPicOffsetH, tOffsetV + tPicOffsetV), tIcon.rect, propList(Symbol.for("ink"), 36));
    }
    const tGameNameWriter = this.getPlainWriter();
    const tTextImage = tGameNameWriter.render(tGameRef.getProperty(Symbol.for("level_name")));
    if (ilk(tTextImage) == Symbol.for("image")) {
      const tPicOffsetH = 35;
      const tPicOffsetV = 8;
      tImage.copyPixels(tTextImage, tTextImage.rect + rect(tPicOffsetH, tPicOffsetV + tOffsetV, tPicOffsetH, tPicOffsetV + tOffsetV), tTextImage.rect);
    }
    return 1;
  }

  renderSlotBackground(tImage, tBackImage, tCount) {
    const tOffsetY = (tCount - 1) * pListItemHeight;
    const tTargetRect = rect(0, tOffsetY, tImage.width, tOffsetY + pListItemHeight);
    tImage.copyPixels(tBackImage, tTargetRect, tBackImage.rect);
    return 1;
  }

  cacheBackImages() {
    pBackImages = list();
    for (const tMemName of list("ig_list_px_lblue", "ig_list_px_lite", "ig_list_px_dblue")) {
      const tmember = member(getmemnum(tMemName));
      if (ilk(tmember) != Symbol.for("member")) {
        return error(this, `Cannot find bitmap member ${tMemName}`, Symbol.for("renderList"));
      }
      pBackImages.append(tmember.image);
    }
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
    return 1;
  }
}
