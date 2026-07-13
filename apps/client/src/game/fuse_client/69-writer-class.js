export default class {
  pMember;
  pDefRect;
  pTxtRect;
  pFntStru;
  pTextRenderMode;
  pUnderliningDisabled;

  construct() {
    this.pDefRect = rect(0, 0, 480, 480);
    this.pTxtRect = VOID;
    this.pFntStru = VOID;
    this.pMember = member(getResourceManager().createMember(`writer_${getUniqueID()}`, Symbol.for("text")));
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
    if (this.pMember.number == 0) {
      return 0;
    } else {
      this.pMember.alignment = Symbol.for("left");
      this.pMember.wordWrap = 0;
      return 1;
    }
  }

  deconstruct() {
    if (ilk(this.pMember, Symbol.for("member"))) {
      getResourceManager().removeMember(this.pMember.name);
      this.pMember = VOID;
    }
    return 1;
  }

  define(tMetrics) {
    if (!ilk(tMetrics, Symbol.for("propList"))) {
      return 0;
    }
    if (stringp(tMetrics[Symbol.for("font")])) {
      if (this.pMember.font != tMetrics.font) {
        this.pMember.font = tMetrics.font;
      }
    }
    if (listp(tMetrics[Symbol.for("fontStyle")])) {
      if (this.pMember.fontStyle != tMetrics.fontStyle) {
        this.pMember.fontStyle = tMetrics.fontStyle;
      }
    }
    if (symbolp(tMetrics[Symbol.for("alignment")])) {
      if (this.pMember.alignment != tMetrics.alignment) {
        this.pMember.alignment = tMetrics.alignment;
      }
    }
    if (ilk(tMetrics[Symbol.for("color")], Symbol.for("color"))) {
      if (this.pMember.color != tMetrics.color) {
        this.pMember.color = tMetrics.color;
      }
    }
    if (ilk(tMetrics[Symbol.for("bgColor")], Symbol.for("color"))) {
      if (this.pMember.bgColor != tMetrics.bgColor) {
        this.pMember.bgColor = tMetrics.bgColor;
      }
    }
    if (integerp(tMetrics[Symbol.for("wordWrap")])) {
      if (this.pMember.wordWrap != tMetrics.wordWrap) {
        this.pMember.wordWrap = tMetrics.wordWrap;
      }
    }
    if (integerp(tMetrics[Symbol.for("antialias")])) {
      if (this.pMember.antialias != tMetrics.antialias) {
        this.pMember.antialias = tMetrics.antialias;
      }
    }
    if (integerp(tMetrics[Symbol.for("fontSize")])) {
      if (this.pMember.fontSize != tMetrics.fontSize) {
        this.pMember.fontSize = tMetrics.fontSize;
      }
    }
    if (integerp(tMetrics[Symbol.for("boxType")])) {
      if (this.pMember.boxType != tMetrics.boxType) {
        this.pMember.boxType = tMetrics.boxType;
      }
    }
    if (ilk(tMetrics[Symbol.for("rect")], Symbol.for("rect"))) {
      if (this.pMember.width != tMetrics.rect.width) {
        this.pMember.rect = tMetrics.rect;
      }
    }
    if (this.pMember.fixedLineSpace != this.pMember.fontSize) {
      this.pMember.fixedLineSpace = this.pMember.fontSize;
    }
    if (integerp(tMetrics[Symbol.for("fixedLineSpace")])) {
      const tTopSpacing = tMetrics.fixedLineSpace - this.pMember.fontSize;
      if (this.pMember.topSpacing != tTopSpacing) {
        this.pMember.topSpacing = tTopSpacing;
      }
    }
    executeMessage(Symbol.for("invalidateCrapFixRegion"));
    this.pTxtRect = tMetrics[Symbol.for("rect")];
    return 1;
  }

  render(tText, tRect) {
    this.pMember.text = tText;
    if (tRect.ilk == Symbol.for("rect")) {
      if (this.pMember.width != tRect.width) {
        this.pMember.rect = tRect;
      }
    } else {
      if (voidp(this.pTxtRect)) {
        const tAlignment = this.pMember.alignment;
        this.pMember.alignment = Symbol.for("left");
        this.pMember.rect = this.pDefRect;
        let tTotal = length(tText.line[1]);
        let tWidth = this.pMember.charPosToLoc(tTotal).locH;
        if (tText.line.count > 1) {
          for (let i = 2; i <= tText.line.count; i++) {
            tTotal = tTotal + length(tText.line[i]) + 1;
            const tNext = this.pMember.charPosToLoc(tTotal).locH;
            if (tNext > tWidth) {
              tWidth = tNext;
            }
          }
        }
        tWidth = tWidth + this.pMember.fontSize;
        this.pMember.rect = rect(0, 0, tWidth, this.pMember.height);
        this.pMember.alignment = tAlignment;
      } else {
        if (this.pMember.width != this.pTxtRect.width) {
          this.pMember.rect = this.pTxtRect;
        }
      }
    }
    executeMessage(Symbol.for("invalidateCrapFixRegion"));
    if (this.pTextRenderMode == 1) {
      return this.pMember.image;
    } else {
      if (this.pTextRenderMode == 2) {
        return this.fakeAlphaRender();
      }
    }
  }

  renderHTML(tHtml, tRect) {
    const tFont = this.getFont();
    this.pMember.html = tHtml;
    if (tRect.ilk == Symbol.for("rect")) {
      if (this.pMember.width != tRect.width) {
        this.pMember.rect = tRect;
      }
    } else {
      if (voidp(this.pTxtRect)) {
        const tAlignment = this.pMember.alignment;
        this.pMember.alignment = Symbol.for("left");
        this.pMember.rect = this.pDefRect;
        let tTotal = length(this.pMember.text.line[1]);
        let tWidth = this.pMember.charPosToLoc(tTotal).locH;
        if (this.pMember.text.line.count > 1) {
          for (let i = 2; i <= this.pMember.text.line.count; i++) {
            tTotal = tTotal + length(this.pMember.text.line[i]) + 1;
            const tNext = this.pMember.charPosToLoc(tTotal).locH;
            if (tNext > tWidth) {
              tWidth = tNext;
            }
          }
        }
        tWidth = tWidth + this.pMember.fontSize;
        this.pMember.rect = rect(0, 0, tWidth, this.pMember.height);
        this.pMember.alignment = tAlignment;
      } else {
        if (this.pMember.width != this.pTxtRect.width) {
          this.pMember.rect = this.pTxtRect;
        }
      }
    }
    this.setFont(tFont);
    if (this.pTextRenderMode == 1) {
      return this.pMember.image;
    } else {
      if (this.pTextRenderMode == 2) {
        return this.fakeAlphaRender();
      }
    }
  }

  setFont(tStruct) {
    if (tStruct.ilk != Symbol.for("struct")) {
      return error(this, "Font struct expected!", Symbol.for("setFont"), Symbol.for("major"));
    }
    if (this.pMember.font != tStruct.getaProp(Symbol.for("font"))) {
      this.pMember.font = tStruct.getaProp(Symbol.for("font"));
    }
    if (this.pMember.fontSize != tStruct.getaProp(Symbol.for("fontSize"))) {
      this.pMember.fontSize = tStruct.getaProp(Symbol.for("fontSize"));
    }
    if (this.pMember.fontStyle != tStruct.getaProp(Symbol.for("fontStyle"))) {
      this.pMember.fontStyle = tStruct.getaProp(Symbol.for("fontStyle"));
    }
    if (this.pMember.color != tStruct.getaProp(Symbol.for("color"))) {
      this.pMember.color = tStruct.getaProp(Symbol.for("color"));
    }
    if (this.pMember.fixedLineSpace != this.pMember.fontSize) {
      this.pMember.fixedLineSpace = this.pMember.fontSize;
    }
    const tLineHeight = this.pMember.fontSize + this.pMember.topSpacing;
    if (tLineHeight != tStruct.getaProp(Symbol.for("lineHeight"))) {
      this.pMember.topSpacing = tStruct.getaProp(Symbol.for("lineHeight")) - this.pMember.fontSize;
    }
    executeMessage(Symbol.for("invalidateCrapFixRegion"));
    return 1;
  }

  getFont() {
    if (voidp(this.pFntStru)) {
      this.pFntStru = getStructVariable("struct.font.empty");
    }
    this.pFntStru.setaProp(Symbol.for("font"), this.pMember.font);
    this.pFntStru.setaProp(Symbol.for("fontStyle"), this.pMember.fontStyle);
    this.pFntStru.setaProp(Symbol.for("fontSize"), this.pMember.fontSize);
    this.pFntStru.setaProp(Symbol.for("color"), this.pMember.color);
    const tLineHeight = this.pMember.fontSize + this.pMember.topSpacing;
    this.pFntStru.setaProp(Symbol.for("lineHeight"), tLineHeight);
    return this.pFntStru;
  }

  setProperty(tKey, tValue) {
    const tProps = propList();
    tProps.setaProp(tKey, tValue);
    return this.define(tProps);
  }

  fakeAlphaRender() {
    const tColorWas = this.pMember.color;
    const tBgColorWas = this.pMember.bgColor;
    if (this.pUnderliningDisabled) {
      if (listp(this.pMember.fontStyle)) {
        if (this.pMember.fontStyle.getPos(Symbol.for("underline")) != 0) {
          this.pMember.fontStyle = list(Symbol.for("plain"));
        }
      }
    }
    this.pMember.color = rgb(0, 0, 0);
    this.pMember.bgColor = rgb(255, 255, 255);
    const tFakeAlpha = image(this.pMember.width, this.pMember.height, 8);
    tFakeAlpha.copyPixels(this.pMember.image, this.pMember.rect, tFakeAlpha.rect, propList("ink", 8));
    const tFakeSrc = image(this.pMember.width, this.pMember.height, 32);
    tFakeSrc.fill(tFakeSrc.rect, propList("color", tColorWas, "shape", Symbol.for("rect")));
    const tOut = image(this.pMember.width, this.pMember.height, 32);
    tOut.copyPixels(tFakeSrc, tOut.rect, tOut.rect, propList("maskImage", tFakeAlpha));
    tOut.useAlpha = 1;
    tOut.setAlpha(tFakeAlpha);
    this.pMember.color = tColorWas;
    this.pMember.bgColor = tBgColorWas;
    return tOut;
  }
}
