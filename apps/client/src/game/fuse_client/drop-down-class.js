// DropDown Class
// Translated from: 25_DropDown Class.ls

import {
  charOf,
  EMPTY,
  image,
  lineOf,
  list,
  member,
  point,
  propList,
  rect,
  RETURN,
  rgb,
  string,
  stringp,
  symbol,
  the,
  VOID,
  voidp,
} from "../../director";

export default function () {
  // hoisted closure variables for implicit Lingo scoping
  let tOptionalImagesWidth;
  let pheight, tTempOffset, tMaskFix, tTempImage, tTempActiveBoxImg;
  let tMemberDesc, tmember, tActiveTop, tdestrect, tTextImg;
  let tWidth, tNewImg, tEndPointX, tEndPointY, tLastX, tStartPoint;
  let tItemCount, tOptionalImages, tPosition, tOptionalImg, tOptionImgRect;
  let tOptionImgMargH, tOptionImgMargV;
  let tSelNum, tEarlierSelection;
  let tMaxLengt, tCharNum, tSofarChars, tLineN, tLineWidth;
  let tStr, tMemNum, tTextMember, tFontDesc;

  return {
    // properties
    pState: VOID,
    pProp: VOID,
    pTextKeys: VOID,
    pTextlist: VOID,
    pShowOrder: VOID,
    pDropMenuImg: VOID,
    pDropActiveBtnImg: VOID,
    pDropDownImg: VOID,
    pLineHeight: VOID,
    pMarginTop: VOID,
    pMarginBottom: VOID,
    pMarginLeft: VOID,
    pAlignment: VOID,
    pOpenDir: VOID,
    pMaxWidth: VOID,
    pDotLineImg: VOID,
    pFont: VOID,
    pFonSize: VOID,
    pSelectedItemNum: VOID,
    pRollOverItem: VOID,
    pLoc: VOID,
    pFixedSize: VOID,
    pOrigWidth: VOID,
    pLastRollOver: VOID,
    pTextWidth: VOID,
    pClickPass: VOID,
    pDelayID: VOID,
    pOnFirstChoice: VOID,
    pDropDownType: VOID,
    pmodel: VOID,
    pOrdering: VOID,
    pID: VOID,
    pBuffer: VOID,
    pSprite: VOID,
    pLocX: VOID,
    pLocY: VOID,
    pPalette: VOID,
    pimage: VOID,
    pwidth: VOID,

    define(tProps) {
      let tField = tProps[Symbol.for("type")].description + tProps[Symbol.for("model")].description + ".element";
      this.pProp = _director.getObject(Symbol.for("layout_parser")).parse(tField);
      if (this.pProp === 0) {
        return 0;
      }
      this.pState = Symbol.for("close");
      this.pID = tProps[Symbol.for("id")];
      this.pBuffer = tProps[Symbol.for("buffer")];
      this.pSprite = tProps[Symbol.for("sprite")];
      this.pLocX = this.pSprite.left;
      this.pLocY = this.pSprite.top;
      this.pmodel = tProps[Symbol.for("model")];
      this.pAlignment = tProps[Symbol.for("alignment")];
      this.pTextKeys = tProps[Symbol.for("keylist")];
      this.pOrigWidth = tProps[Symbol.for("width")];
      this.pLineHeight = tProps[Symbol.for("fixedLineSpace")];
      this.pOpenDir = tProps[Symbol.for("direction")];
      this.pMaxWidth = tProps[Symbol.for("maxwidth")];
      this.pLineHeight = tProps[Symbol.for("height")];
      this.pFixedSize = tProps[Symbol.for("fixedsize")];
      this.pOrdering = 1;
      if (!voidp(this.pProp[Symbol.for("dropDownType")])) {
        this.pDropDownType = this.pProp[Symbol.for("dropDownType")].getProp(Symbol.for("content"));
      } else {
        this.pDropDownType = Symbol.for("default");
      }
      this.pTextlist = list();
      if (this.pTextKeys.ilk !== Symbol.for("list")) {
        this.pTextKeys = list();
      }
      for (const tKey of this.pTextKeys) {
        this.pTextlist.add(_director.getText(tKey));
      }
      if (this.pTextlist.count === 0) {
        this.pTextlist.add("...");
      }
      this.pShowOrder = list();
      for (let i = 1; i <= this.pTextlist.count; i++) {
        this.pShowOrder.add(i);
      }
      if (voidp(this.pPalette)) {
        if (_director.variableExists("interface.palette")) {
          this.pPalette = member(_director.getmemnum(_director.getVariable("interface.palette")));
        } else {
          this.pPalette = Symbol.for("systemMac");
        }
      } else {
        if (stringp(this.pPalette)) {
          this.pPalette = member(_director.getmemnum(this.pPalette));
        }
      }
      if (voidp(this.pFixedSize)) {
        this.pFixedSize = 0;
      }
      if (voidp(this.pMaxWidth)) {
        this.pMaxWidth = this.pOrigWidth;
      }
      if (this.pMaxWidth < this.pOrigWidth) {
        this.pMaxWidth = this.pOrigWidth;
      }
      if (this.pLineHeight % 2) {
        this.pLineHeight = this.pLineHeight + 1;
      }
      this.pSelectedItemNum = 1;
      if (this.pmodel === 2) {
        this.pLineHeight = this.pLineHeight - 1;
      }
      this.UpdateImageObjects(VOID, Symbol.for("up"));
      this.pDropMenuImg = this.createDropImg(this.pTextlist, 1, Symbol.for("up"));
      this.pimage = this.pDropMenuImg;
      this.pwidth = this.pimage.width;
      pheight = this.pimage.height;
      this.pDropActiveBtnImg = this.createDropImg([this.pTextlist[1]], 0, Symbol.for("up"));
      this.pimage = this.pDropActiveBtnImg;
      tTempOffset = this.pBuffer.regPoint;
      this.pBuffer.image = this.pimage;
      this.pBuffer.regPoint = tTempOffset;
      this.pSprite.blend = tProps[Symbol.for("blend")];
      return 1;
    },

    prepare() {
      this.pLocX = this.pSprite.locH;
      this.pLocY = this.pSprite.locV;
      switch (this.pAlignment) {
        case Symbol.for("center"):
          this.pLocX = this.pLocX - ((this.pwidth - this.pOrigWidth) / 2);
          break;
        case Symbol.for("right"):
          this.pLocX = this.pLocX - (this.pwidth - this.pOrigWidth);
          break;
      }
      this.pSprite.loc = point(this.pLocX, this.pLocY);
    },

    Activate() {
      this.pSprite.blend = 100;
      return 1;
    },

    deactivate() {
      this.pSprite.blend = 50;
      return 1;
    },

    updateData(tTextList, tTextKeys, tChosenIndex, tChosenValue) {
      this.pTextlist = tTextList;
      this.pTextKeys = tTextKeys;
      this.pShowOrder = list();
      for (let i = 1; i <= this.pTextlist.count; i++) {
        this.pShowOrder.add(i);
      }
      if ((tChosenIndex > 0) && (tChosenIndex <= this.pShowOrder.count)) {
        this.pSelectedItemNum = tChosenIndex;
      }
      if (!voidp(tChosenValue)) {
        this.setSelection(tChosenValue);
      }
      this.pDropActiveBtnImg = this.createDropImg([this.pTextlist[this.pSelectedItemNum]], 0, Symbol.for("up"));
      this.pimage = this.pDropActiveBtnImg;
      this.render();
      return 1;
    },

    getSelection(tReturnType) {
      if (tReturnType === Symbol.for("text")) {
        return this.pTextlist[this.pShowOrder[this.pSelectedItemNum]];
      } else {
        if (tReturnType === Symbol.for("key")) {
          return this.pTextKeys[this.pShowOrder[this.pSelectedItemNum]];
        }
      }
      return this.pTextKeys[this.pShowOrder[this.pSelectedItemNum]];
    },

    setSelection(tSelNumOrStr, tUpdate) {
      tEarlierSelection = this.pSelectedItemNum;
      if (stringp(tSelNumOrStr)) {
        tSelNum = this.pTextlist.getPos(tSelNumOrStr);
        if (tSelNum === 0) {
          tSelNum = this.pTextKeys.getPos(tSelNumOrStr);
        }
      } else {
        tSelNum = tSelNumOrStr;
      }
      if (tSelNum <= 0) {
        return 0;
      }
      this.pSelectedItemNum = this.pShowOrder.getPos(tSelNum);
      if (!(this.pSelectedItemNum > 0)) {
        this.pSelectedItemNum = 1;
      }
      if (tEarlierSelection === this.pSelectedItemNum) {
        return 1;
      }
      if (tUpdate) {
        this.arrangeTextList(Symbol.for("choose"));
        this.pDropActiveBtnImg = this.createDropImg([this.pTextlist[this.pShowOrder[this.pSelectedItemNum]]], 0, Symbol.for("up"));
        this.pimage = this.pDropActiveBtnImg;
        this.pSprite.loc = this.pLoc;
        this.render();
      }
      return 1;
    },

    setShowOrder(tStyle, tFirstNum, tDeleteOne, tOpenDir) {
      if (!this.pOrdering) {
        return 1;
      }
      let tChoice = this.pShowOrder[this.pSelectedItemNum];
      switch (tStyle) {
        case Symbol.for("normal"):
          for (let i = 1; i <= this.pTextlist.count; i++) {
            this.pShowOrder[i] = i;
          }
          break;
      }
      if (tFirstNum > 0) {
        if (tOpenDir === Symbol.for("down")) {
          let tTempPlace = this.pShowOrder.getPos(tFirstNum);
          this.pShowOrder.deleteAt(tTempPlace);
          this.pShowOrder.addAt(1, tFirstNum);
        } else {
          let tTempPlace = this.pShowOrder.getPos(tFirstNum);
          this.pShowOrder.deleteAt(tTempPlace);
          this.pShowOrder.addAt(this.pShowOrder.count + 1, tFirstNum);
        }
      }
      if (tDeleteOne > 0) {
        this.pShowOrder.deleteOne(tDeleteOne);
      }
      this.pSelectedItemNum = this.pShowOrder.getPos(tChoice);
      return 0;
    },

    setOrdering(tMode) {
      this.pOrdering = tMode;
      return 1;
    },

    arrangeTextList(tStyle) {
      if (this.pDropDownType === Symbol.for("titleWithCancel")) {
        switch (tStyle) {
          case Symbol.for("open"):
            if (this.pShowOrder[this.pSelectedItemNum] > 2) {
              this.setShowOrder(Symbol.for("normal"), this.pShowOrder[this.pSelectedItemNum], 1);
            } else {
              this.setShowOrder(Symbol.for("normal"), 1, 2);
            }
            this.pDropMenuImg = this.createDropImg(this.pTextlist, 1, Symbol.for("up"));
            break;
          case Symbol.for("choose"):
            if (this.pShowOrder[this.pSelectedItemNum] <= 2) {
              this.setShowOrder(Symbol.for("normal"));
              this.pSelectedItemNum = 1;
            }
            break;
        }
      }
      if ((this.pDropDownType === Symbol.for("default")) && (this.pOpenDir === Symbol.for("up"))) {
        switch (tStyle) {
          case Symbol.for("open"):
            this.setShowOrder(Symbol.for("normal"), this.pShowOrder[this.pSelectedItemNum]);
            this.pDropMenuImg = this.createDropImg(this.pTextlist, 1, Symbol.for("up"));
            break;
          case Symbol.for("choose"):
            this.setShowOrder(Symbol.for("normal"), this.pShowOrder[this.pSelectedItemNum], Symbol.for("down"));
            break;
        }
      }
      if ((this.pDropDownType === Symbol.for("default")) && (this.pOpenDir === Symbol.for("down"))) {
        switch (tStyle) {
          case Symbol.for("open"):
            this.setShowOrder(Symbol.for("normal"), this.pShowOrder[this.pSelectedItemNum], VOID, Symbol.for("down"));
            this.pDropMenuImg = this.createDropImg(this.pTextlist, 1, Symbol.for("up"));
            break;
          case Symbol.for("choose"):
            this.setShowOrder(Symbol.for("normal"), this.pShowOrder[this.pSelectedItemNum], Symbol.for("down"));
            break;
        }
      }
    },

    getProperty(tProp) {
      switch (tProp) {
        case Symbol.for("width"):
          return this.pSprite.width;
        case Symbol.for("height"):
          return this.pSprite.height;
        case Symbol.for("locX"):
          return this.pLocX;
        case Symbol.for("locY"):
          return this.pLocY;
        case Symbol.for("depth"):
          return this.pimage.depth;
        case Symbol.for("blend"):
          return this.pSprite.blend;
        case Symbol.for("selection"):
          return this.pTextKeys[this.pShowOrder[this.pSelectedItemNum]];
        case Symbol.for("sprite"):
          return this.pSprite;
        default:
          return 0;
      }
    },

    openMenu() {
      this.arrangeTextList(Symbol.for("open"));
      this.pimage = this.pDropMenuImg;
      this.pLoc = this.pSprite.loc;
      switch (this.pOpenDir) {
        case Symbol.for("lastselected"):
          this.pSprite.loc = this.pSprite.loc.subtract(point(0, (this.pSelectedItemNum - 1) * this.pLineHeight));
          break;
        case Symbol.for("up"):
          this.pSprite.loc = this.pSprite.loc.subtract(point(0, (this.pShowOrder.count - 1) * this.pLineHeight));
          break;
      }
      this.render();
      this.pState = Symbol.for("open");
      this.pLastRollOver = -2;
      this.pOnFirstChoice = 1;
      return 1;
    },

    chooseFromMenu() {
      this.pClickPass = 0;
      this.pState = Symbol.for("close");
      this.pLastRollOver = VOID;
      if ((this.pRollOverItem > 0) && (this.pRollOverItem <= this.pShowOrder.count)) {
        this.pSelectedItemNum = this.pRollOverItem;
        this.arrangeTextList(Symbol.for("choose"));
        this.pDropActiveBtnImg = this.createDropImg([this.pTextlist[this.pShowOrder[this.pSelectedItemNum]]], 0, Symbol.for("up"));
        this.pimage = this.pDropActiveBtnImg;
        this.pSprite.loc = this.pLoc;
        this.render();
        if (this.pTextKeys.count < 1) {
          return EMPTY;
        }
        if (!voidp(this.pTextKeys[this.pShowOrder[this.pSelectedItemNum]])) {
          return this.pTextKeys[this.pShowOrder[this.pSelectedItemNum]];
        }
      }
    },

    mouseDown() {
      if (this.pSprite.blend < 100) {
        return 0;
      }
      this.pClickPass = 1;
      if (this.pState !== Symbol.for("open")) {
        return this.openMenu();
      }
    },

    mouseUp() {
      if (this.pOnFirstChoice) {
        this.pOnFirstChoice = 0;
        return 0;
      }
      if (this.pSprite.blend < 100) {
        return 0;
      }
      if (this.pClickPass === 0) {
        return 0;
      }
      this.cancelDelay();
      return this.chooseFromMenu();
    },

    mouseUpOutSide() {
      if (this.pSprite.locH > 5000) {
        return 0;
      }
      this.pClickPass = 0;
      this.pState = Symbol.for("close");
      this.pLastRollOver = VOID;
      this.pimage = this.pDropActiveBtnImg;
      this.render();
      this.pSprite.loc = this.pLoc;
      return 0;
    },

    mouseEnter() {
      this.cancelDelay();
    },

    cancelDelay() {
      if (!voidp(this.pDelayID)) {
        _director.Cancel(this.pDelayID);
        this.pDelayID = VOID;
      }
    },

    mouseLeave() {
      if (this.pState === Symbol.for("open")) {
        this.pDelayID = this.delay(500, Symbol.for("mouseUpOutSide"));
      }
    },

    mouseWithin() {
      if (this.pState === Symbol.for("open")) {
        if (voidp(this.pLastRollOver)) {
          this.pLastRollOver = 0;
        }
        this.pRollOverItem = ((the.mouseV - this.pSprite.top - 1) / this.pLineHeight) + 1;
        if (this.pLastRollOver === -2) {
          this.pLastRollOver = -1;
          return 1;
        }
        if (this.pOnFirstChoice && (this.pLastRollOver === -1)) {
          this.pLastRollOver = this.pRollOverItem;
        }
        if (this.pRollOverItem !== this.pLastRollOver) {
          this.pOnFirstChoice = 0;
          if (this.pRollOverItem > this.pShowOrder.count) {
            this.pRollOverItem = this.pShowOrder.count;
          }
          if (this.pShowOrder.count === this.pRollOverItem) {
            tMaskFix = this.pMarginBottom;
          } else {
            tMaskFix = 0;
          }
          tTempImage = this.pDropMenuImg.duplicate();
          tTempActiveBoxImg = image(this.pwidth, this.pLineHeight + tMaskFix, 8, this.pPalette);
          tMemberDesc = this.pProp[Symbol.for("up")][Symbol.for("members")][Symbol.for("activeline")];
          tmember = member(_director.getmemnum(tMemberDesc[Symbol.for("member")]));
          tTempActiveBoxImg.copyPixels(tmember.image, tTempActiveBoxImg.rect, tmember.rect);
          tActiveTop = (this.pRollOverItem - 1) * this.pLineHeight;
          tdestrect = rect(0, tActiveTop, this.pwidth, tActiveTop + this.pLineHeight + tMaskFix);
          tTempImage.copyPixels(tTempActiveBoxImg, tdestrect, tTempActiveBoxImg.rect, { maskImage: this.pDropMenuImg.createMatte(), maskOffset: point(0, -tActiveTop), ink: 39 });
          this.pimage = tTempImage;
          this.reDraw();
          this.pLastRollOver = this.pRollOverItem;
        }
      }
    },

    reDraw() {
      this.pBuffer.image.copyPixels(this.pimage, this.pimage.rect, this.pimage.rect);
    },

    render() {
      tTempOffset = this.pBuffer.regPoint;
      this.pSprite.width = this.pimage.width;
      this.pSprite.height = this.pimage.height;
      this.pBuffer.image = this.pimage;
      this.pBuffer.regPoint = tTempOffset;
    },

    UpdateImageObjects(tPalette, tstate) {
      this.pDropDownImg = propList();
      if (voidp(tPalette)) {
        tPalette = this.pPalette;
      } else {
        if (stringp(tPalette)) {
          tPalette = member(_director.getmemnum(tPalette));
        }
      }
      for (const tV of [Symbol.for("top"), Symbol.for("middle"), Symbol.for("bottom")]) {
        for (const tH of [Symbol.for("left"), Symbol.for("middle"), Symbol.for("right")]) {
          let tSymbol = symbol(tV.description + tH.description);
          let tDesc = this.pProp[tstate][Symbol.for("members")][tSymbol];
          tmember = member(_director.getmemnum(tDesc[Symbol.for("member")]));
          let tImage = tmember.image.duplicate();
          if (tImage.paletteRef !== tPalette) {
            tImage.paletteRef = tPalette;
          }
          if (tDesc[Symbol.for("flipH")]) {
            tImage = this.flipH(tImage);
          }
          if (tDesc[Symbol.for("flipV")]) {
            tImage = this.flipV(tImage);
          }
          if (!voidp(tDesc[Symbol.for("rotate")])) {
            tImage = this.rotateImg(tImage, tDesc[Symbol.for("rotate")]);
          }
          this.pDropDownImg.setaProp(tV.description + "_" + tH.description, tImage);
        }
      }
      if (!voidp(this.pProp[Symbol.for("optionalimage")])) {
        tOptionalImages = this.pProp[Symbol.for("optionalimage")][Symbol.for("members")];
        for (let i = 1; i <= tOptionalImages.count(); i++) {
          let tDesc = tOptionalImages[tOptionalImages.getPropAt(i)];
          let tMemName = tDesc[Symbol.for("member")];
          tmember = member(_director.getmemnum(tMemName));
          let tImage = tmember.image.duplicate();
          if (tImage.paletteRef !== tPalette) {
            tImage.paletteRef = tPalette;
          }
          if (tDesc[Symbol.for("flipH")]) {
            tImage = this.flipH(tImage);
          }
          if (tDesc[Symbol.for("flipV")]) {
            tImage = this.flipV(tImage);
          }
          this.pDropDownImg.setaProp("optionalimage_" + tOptionalImages.getPropAt(i), tImage);
        }
      }
      this.pDotLineImg = image(this.pMaxWidth, 1, 8, tPalette);
      for (let tXPoint = 0; tXPoint <= this.pMaxWidth / 2; tXPoint++) {
        this.pDotLineImg.setPixel(tXPoint * 2, 0, rgb(0, 0, 0));
      }
      this.pPalette = tPalette;
      return tPalette;
    },

    createDropImg(tItemsList, tListOfAllItemsOrNot, tstate, tSort) {
      tStr = EMPTY;
      if (!tListOfAllItemsOrNot) {
        tStr = tStr + tItemsList[1] + RETURN;
      } else {
        for (let f = 1; f <= this.pShowOrder.count; f++) {
          tStr = tStr + tItemsList[this.pShowOrder[f]] + RETURN;
        }
      }
      tMemNum = _director.getmemnum("dropdown.button.text");
      if (tMemNum === 0) {
        tMemNum = _director.createMember("dropdown.button.text", Symbol.for("text"));
      }
      tTextMember = member(tMemNum);
      tFontDesc = this.pProp[tstate][Symbol.for("text")];
      this.pMarginTop = tFontDesc[Symbol.for("marginV")];
      this.pMarginLeft = tFontDesc[Symbol.for("marginH")];
      this.pMarginBottom = tFontDesc[Symbol.for("marginbottom")];
      tTextMember.wordWrap = 0;
      tTextMember.font = string(tFontDesc[Symbol.for("font")]);
      tTextMember.fontStyle = list(symbol(tFontDesc[Symbol.for("fontStyle")]));
      tTextMember.fontSize = tFontDesc[Symbol.for("fontSize")];
      tTextMember.color = rgb(tFontDesc[Symbol.for("color")]);
      tTextMember.text = lineOf(tStr).slice(1, lineOf(tStr).count - 1);
      tTextMember.fixedLineSpace = this.pLineHeight;
      if ((tListOfAllItemsOrNot === 1) && !voidp(this.pProp[Symbol.for("optionalimage")])) {
        tOptionalImages = this.pProp[Symbol.for("optionalimage")][Symbol.for("members")];
        tOptionalImagesWidth = 0;
        for (let i = 1; i <= tOptionalImages.count(); i++) {
          tOptionalImagesWidth = tOptionalImagesWidth + this.pDropDownImg["optionalimage_" + tOptionalImages.getPropAt(i)].width;
        }
      } else {
        tOptionalImagesWidth = 0;
      }
      if (this.pFixedSize === 1) {
        tTextMember.alignment = tFontDesc[Symbol.for("alignment")];
        this.pTextWidth = this.pOrigWidth - (this.pMarginLeft * 2);
        tTextMember.rect = rect(0, 0, this.pTextWidth, tTextMember.height);
        tTextImg = tTextMember.image;
        this.pwidth = this.pOrigWidth;
      } else {
        tTextMember.alignment = Symbol.for("left");
        if (tListOfAllItemsOrNot === 1) {
          tMaxLengt = 1;
          tCharNum = 1;
          tSofarChars = 0;
          for (tLineN = 1; tLineN <= lineOf(tStr).count; tLineN++) {
            tSofarChars = tSofarChars + charOf(lineOf(tStr)[tLineN]).count;
            if (charOf(lineOf(tStr)[tLineN]).count > tMaxLengt) {
              tMaxLengt = tSofarChars;
              tCharNum = tSofarChars;
              tLineWidth = tTextMember.charPosToLoc(tCharNum).locH + (tFontDesc[Symbol.for("fontSize")] * 2);
              if (tLineWidth > this.pTextWidth) {
                this.pTextWidth = tLineWidth;
              }
            }
          }
          this.pwidth = this.pTextWidth + (this.pMarginLeft * 2) + tOptionalImagesWidth;
          this.pFixedSize = 1;
          this.pOrigWidth = this.pwidth;
        }
        tTextMember.rect = rect(0, 0, this.pTextWidth, tTextMember.height);
        tTextMember.alignment = tFontDesc[Symbol.for("alignment")];
        tTextImg = tTextMember.image;
      }
      tWidth = this.pwidth;
      if (tItemsList.count === 1) {
        if (this.pmodel === 2) {
          tNewImg = image(tWidth, this.pLineHeight, 8, this.pPalette);
        } else {
          tNewImg = image(tWidth, this.pLineHeight + this.pMarginBottom, 8, this.pPalette);
        }
      } else {
        tNewImg = image(tWidth, (this.pShowOrder.count * this.pLineHeight) + this.pMarginBottom, 8, this.pPalette);
      }
      tdestrect = rect(0, 0, 0, 0);
      tEndPointX = 0;
      tEndPointY = 0;
      tLastX = 0;
      tStartPoint = 0;
      if (tItemsList.count === 1) {
        tItemCount = 1;
      } else {
        tItemCount = this.pShowOrder.count;
      }
      for (const f of ["top", "middle", "bottom"]) {
        tStartPoint = tEndPointY;
        tEndPointX = 0;
        switch (f) {
          case "top":
            tEndPointY = tEndPointY + this.pDropDownImg[1].height;
            break;
          case "middle":
            tEndPointY = tEndPointY + (tItemCount * this.pLineHeight) - (tEndPointY * 2) + this.pMarginBottom;
            break;
          case "bottom":
            tEndPointY = tEndPointY + this.pDropDownImg[1].height;
            break;
        }
        for (const i of ["left", "middle", "right"]) {
          tLastX = tEndPointX;
          switch (i) {
            case "left":
              tEndPointX = tEndPointX + this.pDropDownImg.getaProp(f + "_" + i).width;
              break;
            case "middle":
              tEndPointX = tEndPointX + tWidth - this.pDropDownImg.getaProp(Symbol.for("top_left")).width - this.pDropDownImg.getaProp(Symbol.for("top_right")).width;
              break;
            case "right":
              tEndPointX = tEndPointX + this.pDropDownImg.getaProp(f + "_" + i).width;
              break;
          }
          tdestrect = rect(tLastX, tStartPoint, tEndPointX, tEndPointY);
          tNewImg.copyPixels(this.pDropDownImg.getaProp(f + "_" + i), tdestrect, this.pDropDownImg.getaProp(f + "_" + i).rect);
        }
      }
      if ((tListOfAllItemsOrNot === 0) && !voidp(this.pProp[Symbol.for("optionalimage")])) {
        tOptionalImages = this.pProp[Symbol.for("optionalimage")][Symbol.for("members")];
        for (let i = 1; i <= tOptionalImages.count(); i++) {
          tPosition = tOptionalImages.getPropAt(i);
          tOptionalImg = this.pDropDownImg["optionalimage_" + tOptionalImages.getPropAt(i)];
          tOptionImgRect = tOptionalImg.rect;
          tOptionImgMargH = tOptionalImages[tOptionalImages.getPropAt(i)][Symbol.for("marginH")];
          tOptionImgMargV = (tNewImg.height / 2) - (tOptionImgRect.height / 2);
          if (tPosition === Symbol.for("right")) {
            tdestrect = tOptionImgRect.add(rect(this.pwidth - tOptionImgMargH - tOptionImgRect.width, tOptionImgMargV, this.pwidth - tOptionImgMargH - tOptionImgRect.width, tOptionImgMargV));
          } else {
            if (tPosition === Symbol.for("left")) {
              tdestrect = tOptionImgRect.add(rect(tOptionImgMargH, tOptionImgMargV, tOptionImgMargH, tOptionImgMargV));
            }
          }
          tNewImg.copyPixels(tOptionalImg, tdestrect, tOptionImgRect, { ink: 36 });
        }
      }
      if (tItemCount > 1) {
        for (let f = 1; f <= tItemCount - 1; f++) {
          tdestrect = rect(0, f * this.pLineHeight, tWidth - 1, (f * this.pLineHeight) + 1);
          tNewImg.copyPixels(this.pDotLineImg, tdestrect, rect(0, 0, tWidth - 1, 1), { ink: 36 });
        }
      }
      tdestrect = tTextImg.rect.add(rect(0, this.pMarginTop, 0, this.pMarginTop));
      switch (tFontDesc[Symbol.for("alignment")]) {
        case Symbol.for("left"):
          tdestrect = tdestrect.add(rect(this.pMarginLeft, 0, this.pMarginLeft, 0));
          break;
        case Symbol.for("center"):
          tdestrect = tdestrect.add(rect(tNewImg.width / 2, 0, tNewImg.width / 2, 0)).subtract(rect(this.pTextWidth / 2, 0, this.pTextWidth / 2, 0));
          break;
        case Symbol.for("right"):
          tdestrect = tdestrect.add(rect(tNewImg.width, 0, tNewImg.width, 0)).subtract(rect(this.pTextWidth + this.pDropDownImg.getaProp("top_right").width, 0, this.pTextWidth + this.pDropDownImg.getaProp("top_right").width, 0));
          break;
      }
      if (_director.variableExists("dropdown.top.offset")) {
        tdestrect = tdestrect.add(rect(0, _director.getVariable("dropdown.top.offset"), 0, _director.getVariable("dropdown.top.offset")));
      }
      tNewImg.copyPixels(tTextImg, tdestrect, tTextImg.rect);
      return tNewImg;
    },

    flipH(tImg) {
      let tImage = image(tImg.width, tImg.height, tImg.depth, tImg.paletteRef);
      let tQuad = [point(tImg.width, 0), point(0, 0), point(0, tImg.height), point(tImg.width, tImg.height)];
      tImage.copyPixels(tImg, tQuad, tImg.rect);
      return tImage;
    },

    flipV(tImg) {
      let tImage = image(tImg.width, tImg.height, tImg.depth, tImg.paletteRef);
      let tQuad = [point(0, tImg.height), point(tImg.width, tImg.height), point(tImg.width, 0), point(0, 0)];
      tImage.copyPixels(tImg, tQuad, tImg.rect);
      return tImage;
    },

    rotateImg(tImg, tDirection) {
      let tImage = image(tImg.height, tImg.width, tImg.depth, tImg.paletteRef);
      let tQuad = [point(0, 0), point(tImg.height, 0), point(tImg.height, tImg.width), point(0, tImg.width)];
      tQuad = this.RotateQuad(tQuad, tDirection);
      tImage.copyPixels(tImg, tQuad, tImg.rect);
      return tImage;
    },

    RotateQuad(tDestquad, tClockwise) {
      let tPoint1 = tDestquad[1];
      let tPoint2 = tDestquad[2];
      let tPoint3 = tDestquad[3];
      let tPoint4 = tDestquad[4];
      if (tClockwise === 1) {
        tDestquad = [tPoint2, tPoint3, tPoint4, tPoint1];
      } else {
        tDestquad = [tPoint4, tPoint1, tPoint2, tPoint3];
      }
      return tDestquad;
    },
  };
}
