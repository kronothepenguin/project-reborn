export default class {
  pmodel;
  pOrigWidth;
  pMaxWidth;
  pFixedSize;
  pAlignment;
  pButtonImg;
  pButtonText;
  pCachedImgs;
  pClickPass;
  pBlend;
  pProp;
  pProps;
  pSprite;
  pBuffer;
  pPalette;
  pDepth;
  pwidth;
  pheight;
  pLocX;
  pLocY;
  pimage;
  pParams;

  prepare() {
    const tField = `${this.pProps[Symbol.for("type")]}${this.pProps[Symbol.for("model")]}.element`;
    this.pProp = getObject(Symbol.for("layout_parser")).parse(tField);
    if (this.pProp == 0) {
      return 0;
    }
    this.pmodel = this.pProps[Symbol.for("model")];
    this.pOrigWidth = this.pProps[Symbol.for("width")];
    this.pMaxWidth = this.pProps[Symbol.for("maxwidth")];
    this.pFixedSize = this.pProps[Symbol.for("fixedsize")];
    this.pAlignment = this.pProps[Symbol.for("alignment")];
    this.pButtonText = getText(this.pProps[Symbol.for("key")]);
    this.pBlend = this.pProps[Symbol.for("blend")];
    this.pCachedImgs = propList();
    if (!integerp(this.pMaxWidth)) {
      this.pMaxWidth = 300;
    }
    if (voidp(this.pFixedSize)) {
      this.pFixedSize = 0;
    }
    this.UpdateImageObjects(VOID, Symbol.for("up"));
    return this.setButtonImage();
  }

  setButtonImage() {
    const tOrigWidth = this.pwidth;
    this.pimage = this.createButtonImg(this.pButtonText, Symbol.for("up"));
    const tTempOffset = this.pSprite.member.regPoint;
    this.pBuffer.image = this.pimage;
    this.pBuffer.regPoint = tTempOffset;
    this.pwidth = this.pimage.width;
    this.pheight = this.pimage.height;
    this.pLocX = this.pSprite.locH;
    this.pLocY = this.pSprite.locV;
    switch (this.pAlignment) {
      case Symbol.for("center"):
        this.pLocX = this.pLocX - ((this.pwidth - tOrigWidth) / 2);
        break;
      case Symbol.for("right"):
        this.pLocX = this.pLocX - (this.pwidth - tOrigWidth);
        break;
    }
    this.pSprite.loc = point(this.pLocX, this.pLocY);
    this.pSprite.width = this.pwidth;
    this.pSprite.height = this.pheight;
    return 1;
  }

  Activate() {
    this.pSprite.blend = 100;
    this.pBlend = 100;
    return 1;
  }

  deactivate() {
    this.changeState(Symbol.for("up"));
    this.pSprite.blend = 50;
    this.pBlend = 50;
    return 1;
  }

  setText(tText) {
    this.pButtonText = tText;
    this.pCachedImgs = propList();
    return this.setButtonImage();
  }

  mouseDown() {
    if ((this.pBlend < 100) || (this.pSprite.blend < 100)) {
      return 0;
    }
    this.pClickPass = 1;
    this.changeState(Symbol.for("down"));
    return 1;
  }

  mouseUp() {
    if ((this.pBlend < 100) || (this.pSprite.blend < 100)) {
      return 0;
    }
    if (this.pClickPass == 0) {
      return 0;
    }
    this.pClickPass = 0;
    this.changeState(Symbol.for("up"));
    return 1;
  }

  mouseUpOutSide() {
    if ((this.pBlend < 100) || (this.pSprite.blend < 100)) {
      return 0;
    }
    this.pClickPass = 0;
    this.changeState(Symbol.for("up"));
    return 0;
  }

  render() {
    this.pBuffer.image.fill(this.pBuffer.image.rect, rgb(255, 255, 255));
    this.pBuffer.image.copyPixels(this.pimage, this.pBuffer.image.rect, this.pimage.rect, this.pParams);
  }

  changeState(tstate) {
    this.UpdateImageObjects(VOID, tstate);
    this.pimage = this.createButtonImg(this.pButtonText, tstate);
    this.render();
  }

  UpdateImageObjects(tPalette, tstate) {
    this.pButtonImg = propList();
    if (voidp(tPalette)) {
      tPalette = this.pPalette;
    } else {
      if (stringp(tPalette)) {
        tPalette = member(getmemnum(tPalette));
      }
    }
    for (const f of list(Symbol.for("left"), Symbol.for("middle"), Symbol.for("right"))) {
      const tDesc = this.pProp[tstate][Symbol.for("members")][f];
      const tmember = member(getmemnum(tDesc[Symbol.for("member")]));
      if (!voidp(tDesc[Symbol.for("palette")])) {
        this.pPalette = member(getmemnum(tDesc[Symbol.for("palette")]));
      } else {
        this.pPalette = tPalette;
      }
      let tImage = tmember.image.duplicate();
      if (tDesc[Symbol.for("flipH")]) {
        tImage = this.flipH(tImage);
      }
      if (tDesc[Symbol.for("flipV")]) {
        tImage = this.flipV(tImage);
      }
      this.pButtonImg.addProp(symbol(f), tImage);
    }
  }

  createButtonImg(tText, tstate) {
    if (!voidp(this.pCachedImgs[tstate])) {
      return this.pCachedImgs[tstate];
    }
    let tMemNum = getmemnum("common.button.text");
    if (tMemNum == 0) {
      tMemNum = createMember("common.button.text", Symbol.for("text"));
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
    let tTextWidth;
    let tTextImg;
    let tWidth;
    if (this.pFixedSize == 1) {
      tTextWidth = this.getTextWidth(tTextMem);
      if ((tTextWidth + (tMarginH * 2)) > this.pOrigWidth) {
        tTextWidth = this.pOrigWidth - (tMarginH * 2);
      }
      tTextMem.rect = rect(0, 0, tTextWidth, tTextMem.height);
      tTextImg = tTextMem.image;
      tWidth = this.pOrigWidth;
    } else {
      tTextWidth = this.getTextWidth(tTextMem);
      if ((tTextWidth + (tMarginH * 2)) > this.pMaxWidth) {
        tTextWidth = this.pMaxWidth - (tMarginH * 2);
      }
      tTextMem.rect = rect(0, 0, tTextWidth, tTextMem.height);
      tTextImg = tTextMem.image;
      tWidth = tTextWidth + (tMarginH * 2);
    }
    const tNewImg = image(tWidth, this.pButtonImg[Symbol.for("left")].height, this.pDepth, this.pPalette);
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
      const tdestrect = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
      tNewImg.copyPixels(this.pButtonImg.getProp(i), tdestrect, this.pButtonImg.getProp(i).rect);
    }
    let tDstRect = tTextImg.rect + rect(0, tMarginV, 0, tMarginV);
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
    tNewImg.copyPixels(tTextImg, tDstRect, tTextImg.rect, propList("ink", 36));
    this.pCachedImgs[tstate] = tNewImg;
    return tNewImg;
  }

  flipH(tImg) {
    const tImage = image(tImg.width, tImg.height, tImg.depth, tImg.paletteRef);
    const tQuad = list(point(tImg.width, 0), point(0, 0), point(0, tImg.height), point(tImg.width, tImg.height));
    tImage.copyPixels(tImg, tQuad, tImg.rect);
    return tImage;
  }

  flipV(tImg) {
    const tImage = image(tImg.width, tImg.height, tImg.depth, tImg.paletteRef);
    const tQuad = list(point(0, tImg.height), point(tImg.width, tImg.height), point(tImg.width, 0), point(0, 0));
    tImage.copyPixels(tImg, tQuad, tImg.rect);
    return tImage;
  }

  getTextWidth(tTextMem) {
    const tOrigWidth = this.pMaxWidth;
    const tOrigHeight = 30;
    const tStoreRect = tTextMem.rect;
    tTextMem.rect = rect(0, 0, tOrigWidth, tOrigHeight);
    const tImage = image(tOrigWidth, tOrigHeight, 32);
    tImage.copyPixels(tTextMem.image, rect(0, 0, tOrigWidth, tOrigHeight), rect(0, 0, tOrigWidth, tOrigHeight));
    const tTextWidth = tImage.trimWhiteSpace().width;
    tTextMem.rect = tStoreRect;
    return tTextWidth;
  }
}
