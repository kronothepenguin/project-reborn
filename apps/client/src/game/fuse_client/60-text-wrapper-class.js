export default class {
  pFontData;
  pTextMem;
  pNeedFill;
  pTextRenderMode;
  pUnderliningDisabled;
  pOffX;
  pOffY;
  pOwnW;
  pOwnH;
  pOwnX;
  pOwnY;
  pScrolls;
  pProps;
  pBuffer;
  pSprite;
  pScaleH;
  pScaleV;
  pParams;
  pwidth;
  pheight;
  pDepth;
  pimage;
  pMotherId;
  pVisible;
  pLocX;
  pPalette;
  pNeedFill_actual;

  prepare() {
    this.pOffX = 0;
    this.pOffY = 0;
    this.pOwnW = this.pProps[Symbol.for("width")];
    this.pOwnH = this.pProps[Symbol.for("height")];
    this.pScrolls = list();
    if (this.pProps[Symbol.for("style")] == Symbol.for("unique")) {
      this.pOwnX = 0;
      this.pOwnY = 0;
    } else {
      this.pOwnX = this.pProps[Symbol.for("locH")];
      this.pOwnY = this.pProps[Symbol.for("locV")];
    }
    this.pFontData = propList();
    this.pFontData[Symbol.for("color")] = this.pProps[Symbol.for("txtColor")];
    this.pFontData[Symbol.for("bgColor")] = this.pProps[Symbol.for("txtBgColor")];
    this.pFontData[Symbol.for("key")] = this.pProps[Symbol.for("key")];
    this.pFontData[Symbol.for("wordWrap")] = this.pProps[Symbol.for("wordWrap")];
    this.pFontData[Symbol.for("alignment")] = symbol(this.pProps[Symbol.for("alignment")]);
    this.pFontData[Symbol.for("font")] = this.pProps[Symbol.for("font")];
    this.pFontData[Symbol.for("fontSize")] = this.pProps[Symbol.for("fontSize")];
    this.pFontData[Symbol.for("fontStyle")] = this.pProps[Symbol.for("fontStyle")];
    if (integerp(this.pProps[Symbol.for("fixedLineSpace")])) {
      if (this.pProps[Symbol.for("fixedLineSpace")] == this.pProps[Symbol.for("fontSize")]) {
        this.pProps[Symbol.for("fixedLineSpace")] = this.pProps[Symbol.for("fixedLineSpace")] + 1;
      }
      this.pFontData[Symbol.for("fixedLineSpace")] = this.pProps[Symbol.for("fixedLineSpace")];
    } else {
      this.pFontData[Symbol.for("fixedLineSpace")] = this.pProps[Symbol.for("fontSize")] + 1;
    }
    if (voidp(this.pFontData[Symbol.for("key")])) {
      this.pFontData[Symbol.for("key")] = EMPTY;
    }
    if (this.pFontData[Symbol.for("bgColor")] != rgb(255, 255, 255)) {
      this.pNeedFill = 1;
    } else {
      this.pNeedFill = 0;
    }
    if (variableExists("text.render.compatibility.mode")) {
      this.pTextRenderMode = getVariable("text.render.compatibility.mode");
    } else {
      this.pTextRenderMode = 1;
    }
    if (variableExists("text.underlining.disabled")) {
      this.pUnderliningDisabled = getVariable("text.underlining.disabled");
    } else {
      this.pUnderliningDisabled = 0;
    }
    this.initResources(this.pFontData);
    return this.createImgFromTxt();
  }

  setText(tText) {
    tText = string(tText);
    this.pFontData[Symbol.for("text")] = tText;
    const tRect = rect(this.pOwnX, this.pOwnY, this.pOwnX + this.pOwnW, this.pOwnY + this.pOwnH);
    this.pBuffer.image.fill(tRect, rgb(255, 255, 255));
    this.createImgFromTxt();
    this.render();
    this.registerScroll();
    return 1;
  }

  getText() {
    return this.pFontData[Symbol.for("text")];
  }

  setFont(tStruct) {
    this.pFontData.font = tStruct.getaProp(Symbol.for("font"));
    this.pFontData.fontStyle = tStruct.getaProp(Symbol.for("fontStyle"));
    this.pFontData.fontSize = tStruct.getaProp(Symbol.for("fontSize"));
    this.pFontData.color = tStruct.getaProp(Symbol.for("color"));
    this.pFontData.fixedLineSpace = tStruct.getaProp(Symbol.for("lineHeight"));
    const tRect = rect(this.pOwnX, this.pOwnY, this.pOwnX + this.pOwnW, this.pOwnY + this.pOwnH);
    this.pBuffer.image.fill(tRect, rgb(255, 255, 255));
    this.createImgFromTxt();
    this.render();
    this.registerScroll();
    return 1;
  }

  getFont() {
    const tStruct = getStructVariable("struct.font.empty");
    tStruct.setaProp(Symbol.for("font"), this.pFontData.font);
    tStruct.setaProp(Symbol.for("fontStyle"), this.pFontData.fontStyle);
    tStruct.setaProp(Symbol.for("fontSize"), this.pFontData.fontSize);
    tStruct.setaProp(Symbol.for("color"), this.pFontData.color);
    tStruct.setaProp(Symbol.for("lineHeight"), this.pFontData.fixedLineSpace);
    return tStruct;
  }

  registerScroll(tID) {
    if (voidp(this.pScrolls)) {
      this.prepare();
    }
    if (!voidp(tID)) {
      if (this.pScrolls.getPos(tID) == 0) {
        this.pScrolls.add(tID);
      }
    } else {
      if (this.pScrolls.count == 0) {
        return 0;
      }
    }
    const tSourceRect = rect(this.pOffX, this.pOffY, this.pOffX + this.pOwnW, this.pOffY + this.pOwnH);
    const tScrollList = list();
    const tWndObj = getWindowManager().GET(this.pMotherId);
    for (const tScrollId of this.pScrolls) {
      tScrollList.add(tWndObj.getElement(tScrollId));
    }
    this.createImgFromTxt();
    call(Symbol.for("updateData"), tScrollList, tSourceRect, this.pimage.rect);
  }

  initResources(tFontProps) {
    let tMemNum = getResourceManager().getmemnum("visual window text");
    if (tMemNum == 0) {
      tMemNum = getResourceManager().createMember("visual window text", Symbol.for("text"));
      this.pTextMem = member(tMemNum);
      this.pTextMem.boxType = Symbol.for("adjust");
    } else {
      this.pTextMem = member(tMemNum);
    }
    executeMessage(Symbol.for("invalidateCrapFixRegion"));
    return 1;
  }

  createImgFromTxt() {
    this.pTextMem.rect = rect(0, 0, this.pOwnW, this.pOwnH);
    if (!listp(this.pFontData[Symbol.for("fontStyle")])) {
      const tList = list();
      const tDelim = the.itemDelimiter;
      the.itemDelimiter = ",";
      for (let i = 1; i <= this.pFontData[Symbol.for("fontStyle")].item.count; i++) {
        tList.add(symbol(this.pFontData[Symbol.for("fontStyle")].item[i]));
      }
      the.itemDelimiter = tDelim;
      this.pFontData[Symbol.for("fontStyle")] = tList;
    }
    if (this.pUnderliningDisabled) {
      if (listp(this.pFontData[Symbol.for("fontStyle")])) {
        if (this.pFontData[Symbol.for("fontStyle")].getPos(Symbol.for("underline")) != 0) {
          this.pFontData[Symbol.for("fontStyle")].deleteOne(Symbol.for("underline"));
          if (this.pFontData[Symbol.for("fontStyle")].count == 0) {
            this.pFontData[Symbol.for("fontStyle")].append(Symbol.for("plain"));
          }
        }
      }
    }
    if (!voidp(this.pFontData[Symbol.for("text")])) {
      this.pTextMem.text = this.pFontData[Symbol.for("text")];
      this.pFontData[Symbol.for("text")] = VOID;
    } else {
      if (this.pFontData[Symbol.for("key")] == EMPTY) {
        this.pTextMem.text = EMPTY;
      } else {
        if (this.pFontData[Symbol.for("key")].char[1] == "%") {
          const tKey = symbol(this.pFontData[Symbol.for("key")].char[`2..${length(this.pFontData[Symbol.for("key")])}`]);
          this.pTextMem.text = string(getObject(this.pMotherId).getProperty(tKey));
        } else {
          if (textExists(this.pFontData[Symbol.for("key")])) {
            this.pTextMem.text = getTextManager().GET(this.pFontData[Symbol.for("key")]);
          } else {
            error(this, `Text not found: ${this.pFontData[Symbol.for("key")]}`, Symbol.for("createImgFromTxt"), Symbol.for("minor"));
            this.pTextMem.text = this.pFontData[Symbol.for("key")];
          }
        }
      }
    }
    this.pFontData[Symbol.for("text")] = this.pTextMem.text;
    if (this.pTextMem.fontStyle != this.pFontData[Symbol.for("fontStyle")]) {
      this.pTextMem.fontStyle = this.pFontData[Symbol.for("fontStyle")];
    }
    if (this.pTextMem.wordWrap != this.pFontData[Symbol.for("wordWrap")]) {
      this.pTextMem.wordWrap = this.pFontData[Symbol.for("wordWrap")];
    }
    if (this.pTextMem.alignment != this.pFontData[Symbol.for("alignment")]) {
      this.pTextMem.alignment = this.pFontData[Symbol.for("alignment")];
    }
    if (this.pTextMem.font != this.pFontData[Symbol.for("font")]) {
      this.pTextMem.font = this.pFontData[Symbol.for("font")];
    }
    if (this.pTextMem.fontSize != this.pFontData[Symbol.for("fontSize")]) {
      this.pTextMem.fontSize = this.pFontData[Symbol.for("fontSize")];
    }
    if (this.pTextMem.fixedLineSpace != this.pFontData[Symbol.for("fixedLineSpace")]) {
      this.pTextMem.fixedLineSpace = this.pFontData[Symbol.for("fixedLineSpace")];
    }
    if (this.pScaleH == Symbol.for("center")) {
      const tWidth = this.pTextMem.charPosToLoc(this.pTextMem.char.count).locH + 16;
      if (this.pProps[Symbol.for("style")] == Symbol.for("unique")) {
        this.pLocX = this.pLocX + ((this.pwidth - tWidth) / 2);
        this.pwidth = tWidth;
        this.pOwnW = tWidth;
      } else {
        this.pOwnX = this.pOwnX + ((this.pOwnW - tWidth) / 2);
        this.pOwnW = tWidth;
      }
      this.pTextMem.rect = rect(0, 0, tWidth, this.pTextMem.height);
    } else {
      if (this.pProps[Symbol.for("style")] == Symbol.for("unique")) {
        this.pwidth = this.pTextMem.image.width;
        this.pOwnW = this.pwidth;
      } else {
        this.pOwnW = this.pTextMem.image.width;
      }
    }
    if (this.pTextRenderMode == 2) {
      const tFakeAlpha = image(this.pTextMem.width, this.pTextMem.height, 8);
      tFakeAlpha.copyPixels(this.pTextMem.image, this.pTextMem.rect, tFakeAlpha.rect, propList("ink", 8));
    }
    if (this.pTextRenderMode == 1) {
      if (this.pTextMem.bgColor != this.pFontData[Symbol.for("bgColor")]) {
        this.pTextMem.bgColor = this.pFontData[Symbol.for("bgColor")];
      }
      if (this.pTextMem.color != this.pFontData[Symbol.for("color")]) {
        this.pTextMem.color = this.pFontData[Symbol.for("color")];
      }
    } else {
      if (this.pTextRenderMode == 2) {
        const tFakeSrc = image(this.pTextMem.width, this.pTextMem.height, 32);
        tFakeSrc.fill(tFakeSrc.rect, propList("color", this.pFontData[Symbol.for("color")], "shape", Symbol.for("rect")));
      }
    }
    let tHeight;
    if (this.pScrolls.count > 0) {
      tHeight = this.pTextMem.rect.height;
    } else {
      tHeight = this.pOwnH;
    }
    this.pimage = image(this.pOwnW, tHeight, this.pDepth, this.pPalette);
    if (this.pimage == VOID) {
      return 0;
    }
    if (this.pTextMem == VOID) {
      return 0;
    }
    if (voidp(this.pimage)) {
      return 0;
    }
    if (voidp(this.pTextMem)) {
      return 0;
    }
    if (this.pNeedFill) {
      this.pimage.fill(this.pimage.rect, this.pFontData[Symbol.for("bgColor")]);
    }
    if (this.pTextRenderMode == 1) {
      this.pimage.copyPixels(this.pTextMem.image, this.pimage.rect, this.pimage.rect, propList("ink", 8));
    } else {
      if (this.pTextRenderMode == 2) {
        this.pimage.copyPixels(tFakeSrc, this.pimage.rect, this.pimage.rect, propList("maskImage", tFakeAlpha));
      }
    }
    executeMessage(Symbol.for("invalidateCrapFixRegion"));
    return 1;
  }
}
