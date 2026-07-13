export default class {
  pBadges;
  pRects;
  pColumns;
  pMinRows;
  pGridSize;
  pWriterIdPlain;
  pWriterIdBold;
  pBg;
  pBgNew;
  pBgHilite;

  construct() {
    this.pBadges = list();
    this.pRects = propList();
    this.pColumns = 3;
    this.pMinRows = 4;
    this.pGridSize = 47;
    this.pWriterIdPlain = getUniqueID();
    this.pWriterIdBold = getUniqueID();
    if (memberExists("badge_grid_bg")) {
      this.pBg = member(getmemnum("badge_grid_bg")).image;
    } else {
      this.pBg = image(1, 1, 8);
    }
    if (memberExists("badge_grid_bg_new")) {
      this.pBgNew = member(getmemnum("badge_grid_bg_new")).image;
    } else {
      this.pBgNew = image(1, 1, 8);
    }
    if (memberExists("badge_grid_bg_hilite")) {
      this.pBgHilite = member(getmemnum("badge_grid_bg_hilite")).image;
    } else {
      this.pBgHilite = image(1, 1, 8);
    }
    return 1;
  }

  deconstruct() {
    this.removeWriters();
    return 1;
  }

  render(tBadges, tSelectedBadges, tNewBadges, tActiveBadge) {
    if (voidp(tSelectedBadges)) {
      tSelectedBadges = list();
    }
    this.pBadges = tBadges;
    let tRows = tBadges.count / this.pColumns;
    if ((tBadges.count % this.pColumns) > 0) {
      tRows = tRows + 1;
    }
    tRows = max(tRows, this.pMinRows);
    let tListImage = image(this.pColumns * this.pGridSize, tRows * this.pGridSize, 32);
    let tRow = 0;
    let tCol = 0;
    let tLastIndex = tRows * this.pColumns;
    for (let tIndex = 1; tIndex <= tLastIndex; tIndex++) {
      let tTargetRect = rect(tCol * this.pGridSize, tRow * this.pGridSize, (tCol + 1) * this.pGridSize, (tRow + 1) * this.pGridSize);
      tListImage.copyPixels(this.pBg, tTargetRect, this.pBg.rect);
      if (tIndex <= tBadges.count) {
        let tBadgeID = tBadges[tIndex];
        if (tNewBadges.getPos(tBadgeID) > 0) {
          tListImage.copyPixels(this.pBgNew, tTargetRect, this.pBgNew.rect);
        }
        if (tBadgeID == tActiveBadge) {
          tListImage.copyPixels(this.pBgHilite, tTargetRect, this.pBgHilite.rect);
        }
        let tBadgeImage = member(getmemnum(`badge ${tBadgeID}`)).image;
        if (tBadgeImage.ilk == Symbol.for("image")) {
          if (tBadgeImage.rect == rect(0, 0, 1, 1)) {
            tBadgeImage = member(getmemnum("loading_icon")).image;
          }
          let tCenteredImage = this.centerImage(tBadgeImage, tTargetRect);
          if (tSelectedBadges.getPos(tBadgeID) == 0) {
            tListImage.copyPixels(tCenteredImage, tTargetRect, tCenteredImage.rect, propList("ink", 36));
          } else {
            tListImage.copyPixels(tCenteredImage, tTargetRect, tCenteredImage.rect, propList("ink", 36, "blend", 15));
          }
        }
      }
      tCol = tCol + 1;
      if (tCol >= this.pColumns) {
        tCol = 0;
        tRow = tRow + 1;
      }
    }
    return tListImage;
  }

  getBadgeAt(tpoint) {
    if (tpoint.ilk != Symbol.for("point")) {
      return error(this, "Point expected.", Symbol.for("getBadgeAt"), Symbol.for("major"));
    }
    let tCol = (tpoint[1] / this.pGridSize) + 1;
    if (tCol > this.pColumns) {
      return 0;
    }
    let tRow = (tpoint[2] / this.pGridSize) + 1;
    let tIndex = ((tRow - 1) * this.pColumns) + tCol;
    if ((tIndex > 0) && (tIndex <= this.pBadges.count)) {
      return this.pBadges[tIndex];
    }
    return 0;
  }

  renderAchievements(tAchievements) {
    if (tAchievements.ilk != Symbol.for("list")) {
      return error(this, "Linear list expected.", Symbol.for("renderAchievements"), Symbol.for("major"));
    }
    let tListImage = image(300, tAchievements.count * this.pGridSize, 32);
    let tBgImage = member(getmemnum("badge_grid_bg")).image;
    for (let tIndex = 1; tIndex <= tAchievements.count; tIndex++) {
      let tBadgeID = tAchievements[tIndex];
      let tbadgerect = rect(0, (tIndex - 1) * this.pGridSize, this.pGridSize, tIndex * this.pGridSize);
      tListImage.copyPixels(tBgImage, tbadgerect, tBgImage.rect);
      let tBadgeImage = member(getmemnum(`badge ${tBadgeID}`)).image;
      let tCenteredImage = this.centerImage(tBadgeImage, tbadgerect);
      tListImage.copyPixels(tCenteredImage, tbadgerect, tCenteredImage.rect, propList("ink", 36));
      let tWriter = this.getBoldWriter();
      let tNameImage = tWriter.render(getText(`badge_name_${tBadgeID}`)).duplicate();
      let tLeft = tbadgerect[3] + 7;
      let tRight = tLeft + tNameImage.width;
      let tTop = tbadgerect[2];
      let tBottom = tTop + tNameImage.height;
      let tNameRect = rect(tLeft, tTop, tRight, tBottom);
      tListImage.copyPixels(tNameImage, tNameRect, tNameImage.rect, propList("ink", 36));
      tLeft = tNameRect[1];
      tTop = tNameRect[4];
      tWriter = this.getPlainWriter();
      tWriter.setProperty(Symbol.for("rect"), rect(0, 0, 240, 0));
      let tDesc = getText(`badge_desc_${tBadgeID}`);
      let tDescImage = tWriter.render(tDesc).duplicate();
      tRight = tLeft + tDescImage.width;
      tBottom = tTop + tDescImage.height;
      let tDescRect = rect(tLeft, tTop, tRight, tBottom);
      if (tDescRect[4] > tbadgerect[4]) {
        tDescRect[4] = tbadgerect[4];
      }
      let tSourceRect = rect(0, 0, tDescRect.width, tDescRect.height);
      tListImage.copyPixels(tDescImage, tDescRect, tSourceRect, propList("ink", 36));
    }
    return tListImage;
  }

  centerImage(tImage, tRect) {
    let tCentered = image(tRect.width, tRect.height, tImage.depth);
    let tOffH = (tRect.width - tImage.width) / 2;
    let tOffV = (tRect.height - tImage.height) / 2;
    let tTargetRect = tImage.rect + rect(tOffH, tOffV, tOffH, tOffV);
    tCentered.copyPixels(tImage, tTargetRect, tImage.rect);
    return tCentered;
  }

  getPlainWriter() {
    if (writerExists(this.pWriterIdPlain)) {
      return getWriter(this.pWriterIdPlain);
    }
    let tPlainStruct = getStructVariable("struct.font.plain");
    createWriter(this.pWriterIdPlain, tPlainStruct);
    let tWriter = getWriter(this.pWriterIdPlain);
    tWriter.setProperty(Symbol.for("wordWrap"), 1);
    return getWriter(this.pWriterIdPlain);
  }

  getBoldWriter() {
    if (writerExists(this.pWriterIdBold)) {
      return getWriter(this.pWriterIdBold);
    }
    let tBoldStruct = getStructVariable("struct.font.bold");
    createWriter(this.pWriterIdBold, tBoldStruct);
    return getWriter(this.pWriterIdBold);
  }

  removeWriters() {
    if (writerExists(this.pWriterIdPlain)) {
      removeWriter(this.pWriterIdPlain);
    }
    if (writerExists(this.pWriterIdBold)) {
      removeWriter(this.pWriterIdBold);
    }
  }
}
