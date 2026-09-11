export default class {
  pTagList;
  pWriter;
  pRectList;
  pwidth;
  pheight;
  pGapH;

  construct() {
    let tID = getUniqueID();
    let tLinkFont = getStructVariable("struct.font.plain");
    tLinkFont.setaProp(Symbol.for("lineHeight"), 15);
    tLinkFont.color = rgb(240, 240, 240);
    createWriter(tID, tLinkFont);
    this.pWriter = getWriter(tID);
    this.pTagList = list();
    this.pRectList = propList();
    this.pwidth = 1;
    this.pheight = 1;
    this.pGapH = 5;
    return 1;
  }

  deconstruct() {
    return 1;
  }

  createTagList(tTagList) {
    if (voidp(tTagList)) {
      tTagList = list();
    }
    this.pRectList = propList();
    let tImage = image(this.pwidth, this.pheight, 8);
    tImage.fill(tImage.rect, rgb("#FFFFFF"));
    let tPosX = 0;
    let tPosY = 0;
    for (const tTag of tTagList) {
      let tTagImage = this.pWriter.render(tTag).duplicate();
      if ((tPosX + tTagImage.width) > this.pwidth) {
        tPosX = 0;
        tPosY = tPosY + tTagImage.height + 1;
      }
      if ((tPosX + tTagImage.width) >= this.pwidth) {
        continue;
      }
      if ((tPosY + tTagImage.height) > this.pheight) {
        break;
      }
      let tTargetRect = rect(tPosX, tPosY, tPosX + tTagImage.width, tPosY + tTagImage.height);
      tImage.copyPixels(tTagImage, tTargetRect, tTagImage.rect);
      this.pRectList.setaProp(tTag, tTargetRect);
      tPosX = tPosX + tTagImage.width + this.pGapH;
    }
    let tHeight;
    if (this.pRectList.count == 0) {
      tHeight = 0;
    } else {
      let tLastRect = this.pRectList[this.pRectList.count];
      if (tLastRect.ilk != Symbol.for("rect")) {
        tHeight = 0;
      } else {
        tHeight = tLastRect[4];
      }
    }
    let tTrimmed = image(this.pwidth, tHeight + this.pGapH, 8);
    tTrimmed.copyPixels(tImage, tTrimmed.rect, tTrimmed.rect);
    return tTrimmed;
  }

  getTagAt(tpoint) {
    for (let tRect = 1; tRect <= this.pRectList.count; tRect++) {
      if (tpoint.inside(this.pRectList[tRect])) {
        return this.pRectList.getPropAt(tRect);
      }
    }
    return 0;
  }

  setWidth(tWidth) {
    if (!integerp(tWidth)) {
      return 0;
    }
    this.pwidth = tWidth;
  }

  setHeight(tHeight) {
    if (!integerp(tHeight)) {
      return 0;
    }
    this.pheight = tHeight;
  }
}
