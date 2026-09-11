export default class {
  pIconImg;
  pType;
  pProp;
  pOrigWidth;
  pMaxWidth;
  pFixedSize;
  pAlignment;
  pButtonText;
  pBlend;
  pCachedImgs;
  pProps;
  pPalette;
  pButtonImg;
  pimage;
  pSprite;
  pBuffer;
  pLocX;
  pLocY;
  pwidth;
  pheight;
  pDepth;
  pParams;

  prepare() {
    const tField = `${this.pType}${this.pProps[Symbol.for("model")]}.element`;
    this.pProp = getObject(Symbol.for("layout_parser")).parse(tField);
    if (this.pProp == 0) {
      return 0;
    }
    this.pOrigWidth = this.pProps[Symbol.for("width")];
    this.pMaxWidth = this.pProps[Symbol.for("maxwidth")];
    this.pFixedSize = this.pProps[Symbol.for("fixedsize")];
    this.pAlignment = this.pProps[Symbol.for("alignment")];
    this.pButtonText = getText(this.pProps[Symbol.for("key")]);
    this.pBlend = this.pProps[Symbol.for("blend")];
    this.pCachedImgs = propList();
    if (!voidp(this.pProps[Symbol.for("icon")])) {
      const tMemNum = getmemnum(this.pProps[Symbol.for("icon")]);
      if (tMemNum > 0) {
        this.pIconImg = member(tMemNum).image.duplicate();
      }
    }
    if (!integerp(this.pMaxWidth)) {
      this.pMaxWidth = 300;
    }
    if (voidp(this.pFixedSize)) {
      this.pFixedSize = 0;
    }
    this.UpdateImageObjects(VOID, Symbol.for("up"));
    this.pimage = this.createButtonImg(this.pButtonText, Symbol.for("up"));
    const tTempOffset = this.pSprite.member.regPoint;
    this.pBuffer.image = this.pimage;
    this.pBuffer.regPoint = tTempOffset;
    this.pwidth = this.pimage.width;
    this.pheight = this.pimage.height;
    this.pLocX = this.pSprite.locH;
    this.pLocY = this.pSprite.locV;
    this.pSprite.width = this.pwidth;
    this.pSprite.height = this.pheight;
    return 1;
  }

  createButtonImg(tText, tstate) {
    if (!voidp(this.pCachedImgs[tstate])) {
      return this.pCachedImgs[tstate];
    }
    let tMemNum = getmemnum("icon.button.text");
    if (tMemNum == 0) {
      tMemNum = createMember("icon.button.text", Symbol.for("text"));
    }
    const tTextMem = member(tMemNum);
    const tFontDesc = this.pProp[tstate][Symbol.for("text")];
    const tFont = tFontDesc[Symbol.for("font")];
    const tFontStyle = list(symbol(tFontDesc[Symbol.for("fontStyle")]));
    const tFontSize = tFontDesc[Symbol.for("fontSize")];
    const tColor = rgb(tFontDesc[Symbol.for("color")]);
    const tBgColor = rgb(tFontDesc[Symbol.for("bgColor")]);
    const tBoxType = tFontDesc[Symbol.for("boxType")];
    const tSpace = tFontDesc[Symbol.for("fontSize")] + 2;
    const tMarginH = tFontDesc[Symbol.for("marginH")];
    const tMarginV = tFontDesc[Symbol.for("marginV")];
    if (tTextMem.wordWrap == 1) {
      tTextMem.wordWrap = 0;
    }
    if (tTextMem.font != tFont) {
      tTextMem.font = tFont;
    }
    if (tTextMem.fontStyle != tFontStyle) {
      tTextMem.fontStyle = tFontStyle;
    }
    if (tTextMem.fontSize != tFontSize) {
      tTextMem.fontSize = tFontSize;
    }
    if (tTextMem.color != tColor) {
      tTextMem.color = tColor;
    }
    if (tTextMem.bgColor != tBgColor) {
      tTextMem.bgColor = tBgColor;
    }
    if (tTextMem.boxType != tBoxType) {
      tTextMem.boxType = tBoxType;
    }
    if (tTextMem.fixedLineSpace != tSpace) {
      tTextMem.fixedLineSpace = tSpace;
    }
    if (tTextMem.text != tText) {
      tTextMem.text = tText;
    }
    let tOptImgWidth = 0;
    if (!voidp(this.pProp[Symbol.for("icon")]) && !voidp(this.pIconImg)) {
      const tAlignment = this.pProp[Symbol.for("icon")][Symbol.for("props")].getPropAt(1);
      const tOptImgMargH = this.pProp[Symbol.for("icon")][Symbol.for("props")][tAlignment][Symbol.for("marginH")];
      tOptImgWidth = this.pIconImg.width + tOptImgMargH;
    }
    let tTextWidth;
    let tTextImg;
    let tWidth;
    if (this.pFixedSize == 1) {
      const tCharPosH = tTextMem.locToCharPos(point(this.pOrigWidth - (tMarginH * 2), 5));
      tTextWidth = this.getTextWidth(tTextMem);
      tTextMem.rect = rect(0, 0, tTextWidth, tTextMem.height);
      tTextImg = tTextMem.image;
      tWidth = this.pOrigWidth;
    } else {
      tTextWidth = this.getTextWidth(tTextMem);
      if ((tTextWidth + (tMarginH * 2)) > this.pMaxWidth) {
        tTextWidth = this.pMaxWidth - (tMarginH * 2) + tOptImgWidth;
      }
      tTextMem.rect = rect(0, 0, tTextWidth, tTextMem.height);
      tTextImg = tTextMem.image;
      tWidth = tTextWidth + (tMarginH * 2) + tOptImgWidth;
    }
    const tNewImg = image(tWidth, this.pButtonImg[Symbol.for("left")].height, 8, member(this.pPalette));
    const tStartPointY = 0;
    const tEndPointY = tNewImg.height;
    let tStartPointX = 0;
    let tEndPointX = 0;
    for (const i of list(Symbol.for("left"), Symbol.for("middle"), Symbol.for("right"))) {
      tStartPointX = tEndPointX;
      switch (i) {
        case Symbol.for("left"):
          tEndPointX = tEndPointX + this.pButtonImg.getProp(i).width;
          break;
        case Symbol.for("middle"):
          tEndPointX = tEndPointX + tWidth - this.pButtonImg.getProp(Symbol.for("left")).width - this.pButtonImg.getProp(Symbol.for("right")).width;
          break;
        case Symbol.for("right"):
          tEndPointX = tEndPointX + this.pButtonImg.getProp(i).width;
          break;
      }
      const tDstRect = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
      tNewImg.copyPixels(this.pButtonImg.getProp(i), tDstRect, this.pButtonImg.getProp(i).rect);
    }
    if (!voidp(this.pProp[Symbol.for("icon")]) && !voidp(this.pIconImg)) {
      const tAlignment = this.pProp[Symbol.for("icon")][Symbol.for("props")].getPropAt(1);
      const tOptImgRect = this.pIconImg.rect;
      const tOptImgMargH = this.pProp[Symbol.for("icon")][Symbol.for("props")][tAlignment][Symbol.for("marginH")];
      const tOptImgMargV = (tNewImg.height / 2) - (tOptImgRect.height / 2);
      let tDstRect;
      switch (tAlignment) {
        case Symbol.for("right"):
          tDstRect = tOptImgRect + rect(this.pwidth - tOptImgMargH - tOptImgRect.width, tOptImgMargV, this.pwidth - tOptImgMargH - tOptImgRect.width, tOptImgMargV);
          break;
        case Symbol.for("left"):
          tDstRect = tOptImgRect + rect(tOptImgMargH, tOptImgMargV, tOptImgMargH, tOptImgMargV);
          break;
        case Symbol.for("center"):
          tDstRect = tOptImgRect + rect(tNewImg.width / 2, 0, tNewImg.width / 2, 0) - rect(this.pIconImg / 2, 0, this.pIconImg / 2, 0);
          break;
      }
      let tInk = this.pProp[Symbol.for("icon")][Symbol.for("props")][tAlignment][Symbol.for("ink")];
      if (voidp(tInk)) {
        tInk = 36;
      }
      tNewImg.copyPixels(this.pIconImg, tDstRect, tOptImgRect, propList("ink", tInk));
    }
    let tDstRect = tTextImg.rect + rect(1, tMarginV, 1, tMarginV);
    switch (tFontDesc[Symbol.for("alignment")]) {
      case Symbol.for("left"):
        tDstRect = tDstRect + rect(this.pButtonImg.getProp(Symbol.for("left")).width, 0, this.pButtonImg.getProp(Symbol.for("left")).width, 0);
        break;
      case Symbol.for("center"):
        tDstRect = tDstRect + rect(tNewImg.width / 2, 0, tNewImg.width / 2, 0) - rect(tTextWidth / 2, 0, tTextWidth / 2, 0);
        break;
      case Symbol.for("right"):
        tDstRect = tDstRect + rect(tNewImg.width, 0, tNewImg.width, 0) - rect(tTextWidth + this.pButtonImg.getProp(Symbol.for("right")).width, 0, tTextWidth + this.pButtonImg.getProp(Symbol.for("right")).width, 0);
        break;
    }
    tNewImg.copyPixels(tTextImg, tDstRect, tTextImg.rect);
    this.pCachedImgs[tstate] = tNewImg;
    return tNewImg;
  }
}
