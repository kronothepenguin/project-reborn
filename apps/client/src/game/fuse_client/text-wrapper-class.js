import {
  EMPTY,
  VOID,
  call,
  image,
  integerp,
  length,
  listp,
  propList,
  rect,
  rgb,
  string,
  symbol,
  voidp,
} from "../../director";
import { charOf, itemOf } from "../../director";

export default function () {
  let tFakeSrc, tFakeAlpha, tHeight, tKey;

  return {
    pFontData: VOID,
    pTextMem: VOID,
    pNeedFill: VOID,
    pTextRenderMode: VOID,
    pUnderliningDisabled: VOID,

    prepare() {
      this.pOffX = 0;
      this.pOffY = 0;
      this.pOwnW = this.pProps[Symbol.for("width")];
      this.pOwnH = this.pProps[Symbol.for("height")];
      this.pScrolls = [];
      if (this.pProps[Symbol.for("style")] === symbol("unique")) {
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
        if (this.pProps[Symbol.for("fixedLineSpace")] === this.pProps[Symbol.for("fontSize")]) {
          this.pProps[Symbol.for("fixedLineSpace")] = this.pProps[Symbol.for("fixedLineSpace")] + 1;
        }
        this.pFontData[Symbol.for("fixedLineSpace")] = this.pProps[Symbol.for("fixedLineSpace")];
      } else {
        this.pFontData[Symbol.for("fixedLineSpace")] = this.pProps[Symbol.for("fontSize")] + 1;
      }
      if (voidp(this.pFontData[Symbol.for("key")])) {
        this.pFontData[Symbol.for("key")] = EMPTY;
      }
      if (this.pFontData[Symbol.for("bgColor")] !== rgb(255, 255, 255)) {
        this.pNeedFill = 1;
      } else {
        this.pNeedFill = 0;
      }
      if (_director.variableExists("text.render.compatibility.mode")) {
        this.pTextRenderMode = _director.getVariable("text.render.compatibility.mode");
      } else {
        this.pTextRenderMode = 1;
      }
      if (_director.variableExists("text.underlining.disabled")) {
        this.pUnderliningDisabled = _director.getVariable("text.underlining.disabled");
      } else {
        this.pUnderliningDisabled = 0;
      }
      this.initResources(this.pFontData);
      return this.createImgFromTxt();
    },

    setText(tText) {
      tText = string(tText);
      this.pFontData[Symbol.for("text")] = tText;
      let tRect = rect(this.pOwnX, this.pOwnY, this.pOwnX + this.pOwnW, this.pOwnY + this.pOwnH);
      this.pBuffer.image.fill(tRect, rgb(255, 255, 255));
      this.createImgFromTxt();
      this.render();
      this.registerScroll();
      return 1;
    },

    getText() {
      return this.pFontData[Symbol.for("text")];
    },

    setFont(tStruct) {
      this.pFontData.font = tStruct.getaProp(Symbol.for("font"));
      this.pFontData.fontStyle = tStruct.getaProp(Symbol.for("fontStyle"));
      this.pFontData.fontSize = tStruct.getaProp(Symbol.for("fontSize"));
      this.pFontData.color = tStruct.getaProp(Symbol.for("color"));
      this.pFontData.fixedLineSpace = tStruct.getaProp(Symbol.for("lineHeight"));
      let tRect = rect(this.pOwnX, this.pOwnY, this.pOwnX + this.pOwnW, this.pOwnY + this.pOwnH);
      this.pBuffer.image.fill(tRect, rgb(255, 255, 255));
      this.createImgFromTxt();
      this.render();
      this.registerScroll();
      return 1;
    },

    getFont() {
      let tStruct = _director.getStructVariable("struct.font.empty");
      tStruct.setaProp(Symbol.for("font"), this.pFontData.font);
      tStruct.setaProp(Symbol.for("fontStyle"), this.pFontData.fontStyle);
      tStruct.setaProp(Symbol.for("fontSize"), this.pFontData.fontSize);
      tStruct.setaProp(Symbol.for("color"), this.pFontData.color);
      tStruct.setaProp(Symbol.for("lineHeight"), this.pFontData.fixedLineSpace);
      return tStruct;
    },

    registerScroll(tID) {
      if (voidp(this.pScrolls)) {
        this.prepare();
      }
      if (!voidp(tID)) {
        if (this.pScrolls.getPos(tID) === 0) {
          this.pScrolls.add(tID);
        }
      } else {
        if (this.pScrolls.count === 0) {
          return 0;
        }
      }
      let tSourceRect = rect(this.pOffX, this.pOffY, this.pOffX + this.pOwnW, this.pOffY + this.pOwnH);
      let tScrollList = [];
      let tWndObj = _director.getWindowManager().GET(this.pMotherId);
      for (const tScrollId of this.pScrolls) {
        tScrollList.add(tWndObj.getElement(tScrollId));
      }
      this.createImgFromTxt();
      call(Symbol.for("updateData"), tScrollList, tSourceRect, this.pimage.rect);
    },

    initResources(tFontProps) {
      let tMemNum = _director.getResourceManager().getmemnum("visual window text");
      if (tMemNum === 0) {
        tMemNum = _director.getResourceManager().createMember("visual window text", Symbol.for("text"));
        this.pTextMem = member(tMemNum);
        this.pTextMem.boxType = Symbol.for("adjust");
      } else {
        this.pTextMem = member(tMemNum);
      }
      _director.executeMessage(Symbol.for("invalidateCrapFixRegion"));
      return 1;
    },

    createImgFromTxt() {
      this.pTextMem.rect = rect(0, 0, this.pOwnW, this.pOwnH);
      if (!listp(this.pFontData[Symbol.for("fontStyle")])) {
        let tList = [];
        let tDelim = the.itemDelimiter;
        the.itemDelimiter = ",";
        for (let i = 1; i <= itemOf(this.pFontData[Symbol.for("fontStyle")]).count; i++) {
          tList.add(symbol(itemOf(this.pFontData[Symbol.for("fontStyle")])[i]));
        }
        the.itemDelimiter = tDelim;
        this.pFontData[Symbol.for("fontStyle")] = tList;
      }
      if (this.pUnderliningDisabled) {
        if (listp(this.pFontData[Symbol.for("fontStyle")])) {
          if (this.pFontData[Symbol.for("fontStyle")].getPos(Symbol.for("underline")) !== 0) {
            this.pFontData[Symbol.for("fontStyle")].deleteOne(Symbol.for("underline"));
            if (this.pFontData[Symbol.for("fontStyle")].count === 0) {
              this.pFontData[Symbol.for("fontStyle")].append(Symbol.for("plain"));
            }
          }
        }
      }
      if (!voidp(this.pFontData[Symbol.for("text")])) {
        this.pTextMem.text = this.pFontData[Symbol.for("text")];
        this.pFontData[Symbol.for("text")] = VOID;
      } else {
        if (this.pFontData[Symbol.for("key")] === EMPTY) {
          this.pTextMem.text = EMPTY;
        } else {
          if (charOf(this.pFontData[Symbol.for("key")])[1] === "%") {
            tKey = symbol(charOf(this.pFontData[Symbol.for("key")]).slice(2, length(this.pFontData[Symbol.for("key")])));
            this.pTextMem.text = string(_director.getObject(this.pMotherId).getProperty(tKey));
          } else {
            if (_director.textExists(this.pFontData[Symbol.for("key")])) {
              this.pTextMem.text = _director.getTextManager().GET(this.pFontData[Symbol.for("key")]);
            } else {
              _director.error(this, "Text not found:" + " " + this.pFontData[Symbol.for("key")], Symbol.for("createImgFromTxt"), Symbol.for("minor"));
              this.pTextMem.text = this.pFontData[Symbol.for("key")];
            }
          }
        }
      }
      this.pFontData[Symbol.for("text")] = this.pTextMem.text;
      if (this.pTextMem.fontStyle !== this.pFontData[Symbol.for("fontStyle")]) {
        this.pTextMem.fontStyle = this.pFontData[Symbol.for("fontStyle")];
      }
      if (this.pTextMem.wordWrap !== this.pFontData[Symbol.for("wordWrap")]) {
        this.pTextMem.wordWrap = this.pFontData[Symbol.for("wordWrap")];
      }
      if (this.pTextMem.alignment !== this.pFontData[Symbol.for("alignment")]) {
        this.pTextMem.alignment = this.pFontData[Symbol.for("alignment")];
      }
      if (this.pTextMem.font !== this.pFontData[Symbol.for("font")]) {
        this.pTextMem.font = this.pFontData[Symbol.for("font")];
      }
      if (this.pTextMem.fontSize !== this.pFontData[Symbol.for("fontSize")]) {
        this.pTextMem.fontSize = this.pFontData[Symbol.for("fontSize")];
      }
      if (this.pTextMem.fixedLineSpace !== this.pFontData[Symbol.for("fixedLineSpace")]) {
        this.pTextMem.fixedLineSpace = this.pFontData[Symbol.for("fixedLineSpace")];
      }
      if (this.pScaleH === Symbol.for("center")) {
        let tWidth = this.pTextMem.charPosToLoc(this.pTextMem.char.count).locH + 16;
        if (this.pProps[Symbol.for("style")] === symbol("unique")) {
          this.pLocX = this.pLocX + ((this.pwidth - tWidth) / 2);
          this.pwidth = tWidth;
          this.pOwnW = tWidth;
        } else {
          this.pOwnX = this.pOwnX + ((this.pOwnW - tWidth) / 2);
          this.pOwnW = tWidth;
        }
        this.pTextMem.rect = rect(0, 0, tWidth, this.pTextMem.height);
      } else {
        if (this.pProps[Symbol.for("style")] === symbol("unique")) {
          this.pwidth = this.pTextMem.image.width;
          this.pOwnW = this.pwidth;
        } else {
          this.pOwnW = this.pTextMem.image.width;
        }
      }
      if (this.pTextRenderMode === 2) {
        tFakeAlpha = image(this.pTextMem.width, this.pTextMem.height, 8);
        tFakeAlpha.copyPixels(this.pTextMem.image, this.pTextMem.rect, tFakeAlpha.rect, { [Symbol.for("ink")]: 8 });
      }
      if (this.pTextRenderMode === 1) {
        if (this.pTextMem.bgColor !== this.pFontData[Symbol.for("bgColor")]) {
          this.pTextMem.bgColor = this.pFontData[Symbol.for("bgColor")];
        }
        if (this.pTextMem.color !== this.pFontData[Symbol.for("color")]) {
          this.pTextMem.color = this.pFontData[Symbol.for("color")];
        }
      } else {
        if (this.pTextRenderMode === 2) {
          tFakeSrc = image(this.pTextMem.width, this.pTextMem.height, 32);
          tFakeSrc.fill(tFakeSrc.rect, { [Symbol.for("color")]: this.pFontData[Symbol.for("color")], [Symbol.for("shape")]: Symbol.for("rect") });
        }
      }
      if (this.pScrolls.count > 0) {
        tHeight = this.pTextMem.rect.height;
      } else {
        tHeight = this.pOwnH;
      }
      this.pimage = image(this.pOwnW, tHeight, this.pDepth, this.pPalette);
      if (this.pimage === VOID) {
        return 0;
      }
      if (this.pTextMem === VOID) {
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
      if (this.pTextRenderMode === 1) {
        this.pimage.copyPixels(this.pTextMem.image, this.pimage.rect, this.pimage.rect, { [Symbol.for("ink")]: 8 });
      } else {
        if (this.pTextRenderMode === 2) {
          this.pimage.copyPixels(tFakeSrc, this.pimage.rect, this.pimage.rect, { [Symbol.for("maskImage")]: tFakeAlpha });
        }
      }
      _director.executeMessage(Symbol.for("invalidateCrapFixRegion"));
      return 1;
    },
  };
}
