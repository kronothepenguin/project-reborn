import { VOID, getmemnum, image, integerp, list, member, point, propList, rect, rgb, symbol, voidp } from "../../director";

export default function () {
  let tField, tMemNum, tTempOffset, tTextMem, tFontDesc, tFont, tFontStyle, tFontSize, tColor, tBgColor, tBoxType, tSpace, tMarginH, tMarginV, tOptImgWidth, tAlignment, tOptImgMargH, tCharPosH, tTextWidth, tTextImg, tWidth, tNewImg, tStartPointY, tEndPointY, tStartPointX, tEndPointX, i, tDstRect, tOptImgRect, tOptImgMargV, tInk;

  return {
    pIconImg: VOID,
    pProp: VOID,
    pOrigWidth: VOID,
    pMaxWidth: VOID,
    pFixedSize: VOID,
    pAlignment: VOID,
    pButtonText: VOID,
    pBlend: VOID,
    pCachedImgs: VOID,
    pimage: VOID,
    pBuffer: VOID,
    pwidth: VOID,
    pheight: VOID,
    pSprite: VOID,
    pProps: VOID,
    pPalette: VOID,
    pLocX: VOID,
    pLocY: VOID,
    pButtonImg: VOID,

    prepare() {
      tField = this.pType + this.pProps[Symbol.for("model")] + ".element";
      this.pProp = _director.getObject(Symbol.for("layout_parser")).parse(tField);
      if (this.pProp === 0) {
        return 0;
      }
      this.pOrigWidth = this.pProps[Symbol.for("width")];
      this.pMaxWidth = this.pProps[Symbol.for("maxwidth")];
      this.pFixedSize = this.pProps[Symbol.for("fixedsize")];
      this.pAlignment = this.pProps[Symbol.for("alignment")];
      this.pButtonText = _director.getText(this.pProps[Symbol.for("key")]);
      this.pBlend = this.pProps[Symbol.for("blend")];
      this.pCachedImgs = propList();
      if (!voidp(this.pProps[Symbol.for("icon")])) {
        tMemNum = getmemnum(this.pProps[Symbol.for("icon")]);
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
      tTempOffset = this.pSprite.member.regPoint;
      this.pBuffer.image = this.pimage;
      this.pBuffer.regPoint = tTempOffset;
      this.pwidth = this.pimage.width;
      this.pheight = this.pimage.height;
      this.pLocX = this.pSprite.locH;
      this.pLocY = this.pSprite.locV;
      this.pSprite.width = this.pwidth;
      this.pSprite.height = this.pheight;
      return 1;
    },

    createButtonImg(tText, tstate) {
      if (!voidp(this.pCachedImgs[tstate])) {
        return this.pCachedImgs[tstate];
      }
      tMemNum = getmemnum("icon.button.text");
      if (tMemNum === 0) {
        tMemNum = _director.createMember("icon.button.text", Symbol.for("text"));
      }
      tTextMem = member(tMemNum);
      tFontDesc = this.pProp[tstate][Symbol.for("text")];
      tFont = tFontDesc[Symbol.for("font")];
      tFontStyle = list(symbol(tFontDesc[Symbol.for("fontStyle")]));
      tFontSize = tFontDesc[Symbol.for("fontSize")];
      tColor = rgb(tFontDesc[Symbol.for("color")]);
      tBgColor = rgb(tFontDesc[Symbol.for("bgColor")]);
      tBoxType = tFontDesc[Symbol.for("boxType")];
      tSpace = tFontDesc[Symbol.for("fontSize")] + 2;
      tMarginH = tFontDesc[Symbol.for("marginH")];
      tMarginV = tFontDesc[Symbol.for("marginV")];
      if (tTextMem.wordWrap === 1) {
        tTextMem.wordWrap = 0;
      }
      if (tTextMem.font !== tFont) {
        tTextMem.font = tFont;
      }
      if (tTextMem.fontStyle !== tFontStyle) {
        tTextMem.fontStyle = tFontStyle;
      }
      if (tTextMem.fontSize !== tFontSize) {
        tTextMem.fontSize = tFontSize;
      }
      if (tTextMem.color !== tColor) {
        tTextMem.color = tColor;
      }
      if (tTextMem.bgColor !== tBgColor) {
        tTextMem.bgColor = tBgColor;
      }
      if (tTextMem.boxType !== tBoxType) {
        tTextMem.boxType = tBoxType;
      }
      if (tTextMem.fixedLineSpace !== tSpace) {
        tTextMem.fixedLineSpace = tSpace;
      }
      if (tTextMem.text !== tText) {
        tTextMem.text = tText;
      }
      tOptImgWidth = 0;
      if (!voidp(this.pProp[Symbol.for("icon")]) && !voidp(this.pIconImg)) {
        tAlignment = this.pProp[Symbol.for("icon")][Symbol.for("props")].getPropAt(1);
        tOptImgMargH = this.pProp[Symbol.for("icon")][Symbol.for("props")][tAlignment][Symbol.for("marginH")];
        tOptImgWidth = this.pIconImg.width + tOptImgMargH;
      }
      if (this.pFixedSize === 1) {
        tCharPosH = tTextMem.locToCharPos(point(this.pOrigWidth - (tMarginH * 2), 5));
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
      tNewImg = image(tWidth, this.pButtonImg[Symbol.for("left")].height, 8, member(this.pPalette));
      tStartPointY = 0;
      tEndPointY = tNewImg.height;
      tStartPointX = 0;
      tEndPointX = 0;
      for (const i of [Symbol.for("left"), Symbol.for("middle"), Symbol.for("right")]) {
        tStartPointX = tEndPointX;
        switch (i) {
          case Symbol.for("left"):
            tEndPointX = tEndPointX + this.pButtonImg.getProp(Symbol.for("left")).width;
            break;
          case Symbol.for("middle"):
            tEndPointX = tEndPointX + tWidth - this.pButtonImg.getProp(Symbol.for("left")).width - this.pButtonImg.getProp(Symbol.for("right")).width;
            break;
          case Symbol.for("right"):
            tEndPointX = tEndPointX + this.pButtonImg.getProp(Symbol.for("right")).width;
            break;
        }
        tDstRect = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
        tNewImg.copyPixels(this.pButtonImg.getProp(i), tDstRect, this.pButtonImg.getProp(i).rect);
      }
      if (!voidp(this.pProp[Symbol.for("icon")]) && !voidp(this.pIconImg)) {
        tAlignment = this.pProp[Symbol.for("icon")][Symbol.for("props")].getPropAt(1);
        tOptImgRect = this.pIconImg.rect;
        tOptImgMargH = this.pProp[Symbol.for("icon")][Symbol.for("props")][tAlignment][Symbol.for("marginH")];
        tOptImgMargV = (tNewImg.height / 2) - (tOptImgRect.height / 2);
        switch (tAlignment) {
          case Symbol.for("right"):
            tDstRect = tOptImgRect.add(rect(this.pwidth - tOptImgMargH - tOptImgRect.width, tOptImgMargV, this.pwidth - tOptImgMargH - tOptImgRect.width, tOptImgMargV));
            break;
          case Symbol.for("left"):
            tDstRect = tOptImgRect.add(rect(tOptImgMargH, tOptImgMargV, tOptImgMargH, tOptImgMargV));
            break;
          case Symbol.for("center"):
            tDstRect = tOptImgRect.add(rect(tNewImg.width / 2, 0, tNewImg.width / 2, 0)).subtract(rect(this.pIconImg / 2, 0, this.pIconImg / 2, 0));
            break;
        }
        tInk = this.pProp[Symbol.for("icon")][Symbol.for("props")][tAlignment][Symbol.for("ink")];
        if (voidp(tInk)) {
          tInk = 36;
        }
        const tInkParams = propList();
        tInkParams.setaProp(Symbol.for("ink"), tInk);
        tNewImg.copyPixels(this.pIconImg, tDstRect, tOptImgRect, tInkParams);
      }
      tDstRect = tTextImg.rect.add(rect(1, tMarginV, 1, tMarginV));
      switch (tFontDesc[Symbol.for("alignment")]) {
        case Symbol.for("left"):
          tDstRect = tDstRect.add(rect(this.pButtonImg.getProp(Symbol.for("left")).width, 0, this.pButtonImg.getProp(Symbol.for("left")).width, 0));
          break;
        case Symbol.for("center"):
          tDstRect = tDstRect.add(rect(tNewImg.width / 2, 0, tNewImg.width / 2, 0)).subtract(rect(tTextWidth / 2, 0, tTextWidth / 2, 0));
          break;
        case Symbol.for("right"):
          tDstRect = tDstRect.add(rect(tNewImg.width, 0, tNewImg.width, 0)).subtract(rect(tTextWidth + this.pButtonImg.getProp(Symbol.for("right")).width, 0, tTextWidth + this.pButtonImg.getProp(Symbol.for("right")).width, 0));
          break;
      }
      tNewImg.copyPixels(tTextImg, tDstRect, tTextImg.rect);
      this.pCachedImgs[tstate] = tNewImg;
      return tNewImg;
    },
  };
}
