export default class {
  pWindowType;
  pLinkList;
  pLinkWriter;
  pResizeOffset;
  pLinkPosOrigX;
  pLinkPosOrigY;
  pWidthOrig;
  pHeightOrig;
  pLinkLineHeight;
  pLinksOffset;

  construct() {
    this.pWindowType = "bubble_links.window";
    this.pTextWidth = 160;
    this.Init();
    this.pLinksOffset = 0;
    this.pWindow.registerProcedure(Symbol.for("blendHandler"), this.getID(), Symbol.for("mouseEnter"));
    this.pWindow.registerProcedure(Symbol.for("blendHandler"), this.getID(), Symbol.for("mouseLeave"));
    this.pWindow.registerProcedure(Symbol.for("eventHandler"), this.getID(), Symbol.for("mouseUp"));
    tLinkFont = getStructVariable("struct.font.link");
    this.pLinkLineHeight = 16;
    tLinkFont.setaProp(Symbol.for("lineHeight"), this.pLinkLineHeight);
    tWriterId = getUniqueID();
    createWriter(tWriterId, tLinkFont);
    this.pLinkWriter = getWriter(tWriterId);
    this.pLinkWriter.define(propList("bgColor", rgb("#F0F0F0")));
    this.pResizeOffset = 0;
    this.pLinkPosOrigX = this.pWindow.getElement("bubble_links").getProperty(Symbol.for("locH"));
    this.pLinkPosOrigY = this.pWindow.getElement("bubble_links").getProperty(Symbol.for("locV"));
    this.pWidthOrig = this.pWindow.getProperty(Symbol.for("width"));
    this.pHeightOrig = this.pWindow.getProperty(Symbol.for("height"));
    this.hideLinks();
    return 1;
  }

  deconstruct() {
    removeWindow(this.pWindow.getProperty(Symbol.for("id")));
  }

  setText(tText) {
    callAncestor(Symbol.for("setText"), list(this), tText);
    this.setLinks(this.pLinkList);
  }

  setLinks(tLinkList, tStatusList) {
    this.pLinkList = tLinkList;
    tElem = this.pWindow.getElement("bubble_links");
    if (voidp(this.pLinkList)) {
      this.hideLinks();
      return 1;
    }
    if (this.pLinkList.count == 0) {
      this.hideLinks();
      return 1;
    }
    tListString = EMPTY;
    for (const tLink of tLinkList) {
      tListString = `${tListString}${getText(tLink)}${RETURN}`;
    }
    tListString = tListString.line[`${1}..${tListString.line.count - 1}`];
    tLinkImage = this.pLinkWriter.render(tListString).duplicate();
    if (!voidp(tStatusList)) {
      tColorOrig = pLinkWriter.pMember.color;
      for (let i = 1; i <= tLinkList.count; i++) {
        tID = tLinkList.getPropAt(i);
        if (tStatusList.getaProp(tID)) {
          this.pLinkWriter.pMember.line[i].color = rgb(150, 150, 150);
        }
      }
      tLinkImage = this.pLinkWriter.pMember.image.duplicate();
      this.pLinkWriter.pMember.color = tColorOrig;
    }
    tElem.show();
    tElem.feedImage(tLinkImage);
    tElem.resizeTo(tLinkImage.width, tLinkImage.height, 1);
    tTextH = this.pWindow.getElement("bubble_text").getProperty(Symbol.for("height"));
    tElem.moveTo(0, tTextH + this.pLinksOffset);
    tSizeY = this.pEmptySizeY + tTextH + this.pLinksOffset + tElem.getProperty(Symbol.for("height"));
    this.pWindow.resizeTo(this.pEmptySizeX, tSizeY);
    this.updatePointer();
    if (!voidp(tStatusList)) {
      this.setCheckmarks(tStatusList, 1);
    }
  }

  hideLinks() {
    tElem = this.pWindow.getElement("bubble_links");
    tElem.hide();
    tTextH = this.pWindow.getElement("bubble_text").getProperty(Symbol.for("height"));
    this.pWindow.resizeTo(this.pEmptySizeX, this.pEmptySizeY + tTextH);
    this.updatePointer();
  }

  setCheckmarks(tStatusList, tBlockTextReset) {
    tMarkImage = member("checkmark").image;
    tLinkElem = this.pWindow.getElement("bubble_links");
    tLinkImage = tLinkElem.getProperty(Symbol.for("image"));
    tMarkOffset = 4;
    tVerticalOffset = 8;
    tImage = image(tLinkImage.width + tMarkImage.width + tMarkOffset, tLinkImage.height, 8);
    tTargetRect = rect(tImage.width - tLinkImage.width + 1, 0, tImage.width, tImage.height);
    tImage.copyPixels(tLinkImage, tTargetRect, tLinkImage.rect);
    for (let tLinkNum = 1; tLinkNum <= this.pLinkList.count; tLinkNum++) {
      tID = this.pLinkList.getPropAt(tLinkNum);
      if (tStatusList.getaProp(tID)) {
        continue;
      }
      tY1 = (this.pLinkLineHeight * (tLinkNum - 1)) + tVerticalOffset;
      tY2 = tY1 + tMarkImage.height;
      tImage.copyPixels(tMarkImage, rect(0, tY1, tMarkImage.width, tY2), tMarkImage.rect);
    }
    tLinkElem.feedImage(tImage);
    tLinkElem.resizeTo(tImage.width, tImage.height, 1);
    if (!tBlockTextReset) {
      this.setLinks(this.pLinkList, tStatusList);
    }
  }

  blendHandler(tEvent, tSpriteID, tParam) {
    if (voidp(this.pLinkList)) {
      callAncestor(Symbol.for("blendHandler"), list(this), tEvent, tSpriteID, tParam);
    }
  }

  eventHandler(tEvent, tSpriteID, tParam) {
    if (this.pLinkList.ilk != Symbol.for("propList")) {
      return 0;
    }
    if (tSpriteID == "bubble_links") {
      if (tParam.ilk != Symbol.for("point")) {
        return 0;
      }
      tLineNum = (tParam[2] / 16) + 1;
      tTopicID = this.pLinkList.getPropAt(tLineNum);
      getThread(Symbol.for("tutorial")).getComponent().selectTopic(tTopicID);
    }
  }
}
