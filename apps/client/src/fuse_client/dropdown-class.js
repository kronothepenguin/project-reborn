// fuse_client/25_DropDown Class.ls → dropdown-class.js
// Drop-down menu UI component class

import {
  voidP,
  symbol,
  stringp,
  listp,
  member,
  getmemnum,
  createMember,
  point,
  rect,
  createPropList,
} from "../core/lingo-runtime.js";

export class DropDownClass {
  constructor() {
    this.pState = "close";
    this.pProp = null;
    this.pTextKeys = [];
    this.pTextlist = [];
    this.pShowOrder = [];
    this.pDropMenuImg = null;
    this.pDropActiveBtnImg = null;
    this.pDropDownImg = null;
    this.pLineHeight = 0;
    this.pMarginTop = 0;
    this.pMarginBottom = 0;
    this.pMarginLeft = 0;
    this.pAlignment = null;
    this.pOpenDir = null;
    this.pMaxWidth = 0;
    this.pDotLineImg = null;
    this.pFont = null;
    this.pFonSize = 0;
    this.pSelectedItemNum = 1;
    this.pRollOverItem = 0;
    this.pLoc = null;
    this.pFixedSize = 0;
    this.pOrigWidth = 0;
    this.pLastRollOver = 0;
    this.pTextWidth = 0;
    this.pClickPass = 0;
    this.pDelayID = null;
    this.pOnFirstChoice = 0;
    this.pDropDownType = null;
    this.pmodel = null;
    this.pOrdering = 1;

    this.pID = null;
    this.pBuffer = null;
    this.pSprite = null;
    this.pLocX = 0;
    this.pLocY = 0;
    this.pPalette = null;
    this.pimage = null;
    this.pwidth = 0;
    this.pheight = 0;
  }

  define(tProps) {
    const tField = tProps[symbol("#type")] + this.pmodel + ".element";
    this.pProp = getObject(symbol("#layout_parser")).parse(tField);
    if (this.pProp === 0) {
      return false;
    }
    this.pState = "close";
    this.pID = tProps[symbol("#id")];
    this.pBuffer = tProps[symbol("#buffer")];
    this.pSprite = tProps[symbol("#sprite")];
    this.pLocX = this.pSprite.left;
    this.pLocY = this.pSprite.top;
    this.pmodel = tProps[symbol("#model")];
    this.pAlignment = tProps[symbol("#alignment")];
    this.pTextKeys = tProps[symbol("#keylist")];
    this.pOrigWidth = tProps[symbol("#width")];
    this.pLineHeight = tProps[symbol("#fixedLineSpace")];
    this.pOpenDir = tProps[symbol("#direction")];
    this.pMaxWidth = tProps[symbol("#maxwidth")];
    this.pLineHeight = tProps[symbol("#height")];
    this.pFixedSize = tProps[symbol("#fixedsize")];
    this.pOrdering = 1;
    if (!voidP(this.pProp[symbol("#dropDownType")])) {
      this.pDropDownType = this.pProp[symbol("#dropDownType")].getProp(
        symbol("#content"),
      );
    } else {
      this.pDropDownType = symbol("#default");
    }
    this.pTextlist = [];
    if (!listp(this.pTextKeys)) {
      this.pTextKeys = [];
    }
    for (const tKey of this.pTextKeys) {
      this.pTextlist.push(getText(tKey));
    }
    if (this.pTextlist.length === 0) {
      this.pTextlist.push("...");
    }
    this.pShowOrder = [];
    for (let i = 1; i <= this.pTextlist.length; i++) {
      this.pShowOrder.push(i);
    }
    if (voidP(this.pPalette)) {
      if (variableExists("interface.palette")) {
        this.pPalette = member(getmemnum(getVariable("interface.palette")));
      } else {
        this.pPalette = symbol("#systemMac");
      }
    } else {
      if (stringp(this.pPalette)) {
        this.pPalette = member(getmemnum(this.pPalette));
      }
    }
    if (voidP(this.pFixedSize)) {
      this.pFixedSize = 0;
    }
    if (voidP(this.pMaxWidth)) {
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
    this.UpdateImageObjects(null, "up");
    this.pDropMenuImg = this.createDropImg(this.pTextlist, 1, "up");
    this.pimage = this.pDropMenuImg;
    this.pwidth = this.pimage.width;
    this.pheight = this.pimage.height;
    this.pDropActiveBtnImg = this.createDropImg([this.pTextlist[0]], 0, "up");
    this.pimage = this.pDropActiveBtnImg;
    const tTempOffset = this.pBuffer.regPoint;
    this.pBuffer.image = this.pimage;
    this.pBuffer.regPoint = tTempOffset;
    this.pSprite.blend = tProps[symbol("#blend")];
    return true;
  }

  prepare() {
    this.pLocX = this.pSprite.locH;
    this.pLocY = this.pSprite.locV;
    switch (this.pAlignment) {
      case symbol("#center"):
        this.pLocX = this.pLocX - (this.pwidth - this.pOrigWidth) / 2;
        break;
      case symbol("#right"):
        this.pLocX = this.pLocX - (this.pwidth - this.pOrigWidth);
        break;
    }
    this.pSprite.loc = point(this.pLocX, this.pLocY);
  }

  Activate() {
    this.pSprite.blend = 100;
    return true;
  }

  deactivate() {
    this.pSprite.blend = 50;
    return true;
  }

  updateData(tTextList, tTextKeys, tChosenIndex, tChosenValue) {
    this.pTextlist = tTextList;
    this.pTextKeys = tTextKeys;
    this.pShowOrder = [];
    for (let i = 1; i <= this.pTextlist.length; i++) {
      this.pShowOrder.push(i);
    }
    if (tChosenIndex > 0 && tChosenIndex <= this.pShowOrder.length) {
      this.pSelectedItemNum = tChosenIndex;
    }
    if (!voidP(tChosenValue)) {
      this.setSelection(tChosenValue);
    }
    this.pDropActiveBtnImg = this.createDropImg(
      [this.pTextlist[this.pSelectedItemNum - 1]],
      0,
      "up",
    );
    this.pimage = this.pDropActiveBtnImg;
    this.render();
    return true;
  }

  getSelection(tReturnType) {
    if (tReturnType === symbol("#text")) {
      return this.pTextlist[this.pShowOrder[this.pSelectedItemNum - 1] - 1];
    } else {
      if (tReturnType === symbol("#key")) {
        return this.pTextKeys[this.pShowOrder[this.pSelectedItemNum - 1] - 1];
      }
    }
    return this.pTextKeys[this.pShowOrder[this.pSelectedItemNum - 1] - 1];
  }

  setSelection(tSelNumOrStr, tUpdate) {
    const tEarlierSelection = this.pSelectedItemNum;
    let tSelNum;
    if (stringp(tSelNumOrStr)) {
      tSelNum = this.pTextlist.indexOf(tSelNumOrStr) + 1;
      if (tSelNum === 0) {
        tSelNum = this.pTextKeys.indexOf(tSelNumOrStr) + 1;
      }
    } else {
      tSelNum = tSelNumOrStr;
    }
    if (tSelNum <= 0) {
      return false;
    }
    this.pSelectedItemNum = this.pShowOrder.indexOf(tSelNum) + 1;
    if (!(this.pSelectedItemNum > 0)) {
      this.pSelectedItemNum = 1;
    }
    if (tEarlierSelection === this.pSelectedItemNum) {
      return true;
    }
    if (tUpdate) {
      this.arrangeTextList(symbol("#choose"));
      this.pDropActiveBtnImg = this.createDropImg(
        [this.pTextlist[this.pShowOrder[this.pSelectedItemNum - 1] - 1]],
        0,
        "up",
      );
      this.pimage = this.pDropActiveBtnImg;
      this.pSprite.loc = this.pLoc;
      this.render();
    }
    return true;
  }

  setShowOrder(tStyle, tFirstNum, tDeleteOne, tOpenDir) {
    if (!this.pOrdering) {
      return true;
    }
    const tChoice = this.pShowOrder[this.pSelectedItemNum - 1];
    switch (tStyle) {
      case symbol("#normal"):
        for (let i = 1; i <= this.pTextlist.length; i++) {
          this.pShowOrder[i - 1] = i;
        }
        break;
    }
    if (tFirstNum > 0) {
      if (tOpenDir === symbol("#down")) {
        const tTempPlace = this.pShowOrder.indexOf(tFirstNum);
        this.pShowOrder.splice(tTempPlace, 1);
        this.pShowOrder.unshift(tFirstNum);
      } else {
        const tTempPlace = this.pShowOrder.indexOf(tFirstNum);
        this.pShowOrder.splice(tTempPlace, 1);
        this.pShowOrder.push(tFirstNum);
      }
    }
    if (tDeleteOne > 0) {
      const idx = this.pShowOrder.indexOf(tDeleteOne);
      if (idx >= 0) this.pShowOrder.splice(idx, 1);
    }
    this.pSelectedItemNum = this.pShowOrder.indexOf(tChoice) + 1;
    return false;
  }

  setOrdering(tMode) {
    this.pOrdering = tMode;
    return true;
  }

  arrangeTextList(tStyle) {
    if (this.pDropDownType === symbol("#titleWithCancel")) {
      switch (tStyle) {
        case symbol("#open"):
          if (this.pShowOrder[this.pSelectedItemNum - 1] > 2) {
            this.setShowOrder(
              symbol("#normal"),
              this.pShowOrder[this.pSelectedItemNum - 1],
              1,
            );
          } else {
            this.setShowOrder(symbol("#normal"), 1, 2);
          }
          this.pDropMenuImg = this.createDropImg(this.pTextlist, 1, "up");
          break;
        case symbol("#choose"):
          if (this.pShowOrder[this.pSelectedItemNum - 1] <= 2) {
            this.setShowOrder(symbol("#normal"));
            this.pSelectedItemNum = 1;
          }
          break;
      }
    }
    if (
      this.pDropDownType === symbol("#default") &&
      this.pOpenDir === symbol("#up")
    ) {
      switch (tStyle) {
        case symbol("#open"):
          this.setShowOrder(
            symbol("#normal"),
            this.pShowOrder[this.pSelectedItemNum - 1],
          );
          this.pDropMenuImg = this.createDropImg(this.pTextlist, 1, "up");
          break;
        case symbol("#choose"):
          this.setShowOrder(
            symbol("#normal"),
            this.pShowOrder[this.pSelectedItemNum - 1],
            symbol("#down"),
          );
          break;
      }
    }
    if (
      this.pDropDownType === symbol("#default") &&
      this.pOpenDir === symbol("#down")
    ) {
      switch (tStyle) {
        case symbol("#open"):
          this.setShowOrder(
            symbol("#normal"),
            this.pShowOrder[this.pSelectedItemNum - 1],
            null,
            symbol("#down"),
          );
          this.pDropMenuImg = this.createDropImg(this.pTextlist, 1, "up");
          break;
        case symbol("#choose"):
          this.setShowOrder(
            symbol("#normal"),
            this.pShowOrder[this.pSelectedItemNum - 1],
            symbol("#down"),
          );
          break;
      }
    }
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol("#width"):
        return this.pSprite.width;
      case symbol("#height"):
        return this.pSprite.height;
      case symbol("#locX"):
        return this.pLocX;
      case symbol("#locY"):
        return this.pLocY;
      case symbol("#depth"):
        return this.pimage.depth;
      case symbol("#blend"):
        return this.pSprite.blend;
      case symbol("#selection"):
        return this.pTextKeys[this.pShowOrder[this.pSelectedItemNum - 1] - 1];
      case symbol("#sprite"):
        return this.pSprite;
      default:
        return 0;
    }
  }

  openMenu() {
    this.arrangeTextList(symbol("#open"));
    this.pimage = this.pDropMenuImg;
    this.pLoc = this.pSprite.loc;
    switch (this.pOpenDir) {
      case symbol("#lastselected"):
        this.pSprite.loc = point(
          this.pLoc.locH,
          this.pLoc.locV - (this.pSelectedItemNum - 1) * this.pLineHeight,
        );
        break;
      case symbol("#up"):
        this.pSprite.loc = point(
          this.pLoc.locH,
          this.pLoc.locV - (this.pShowOrder.length - 1) * this.pLineHeight,
        );
        break;
    }
    this.render();
    this.pState = "open";
    this.pLastRollOver = -2;
    this.pOnFirstChoice = 1;
    return true;
  }

  chooseFromMenu() {
    this.pClickPass = 0;
    this.pState = "close";
    this.pLastRollOver = null;
    if (
      this.pRollOverItem > 0 &&
      this.pRollOverItem <= this.pShowOrder.length
    ) {
      this.pSelectedItemNum = this.pRollOverItem;
      this.arrangeTextList(symbol("#choose"));
      this.pDropActiveBtnImg = this.createDropImg(
        [this.pTextlist[this.pShowOrder[this.pSelectedItemNum - 1] - 1]],
        0,
        "up",
      );
      this.pimage = this.pDropActiveBtnImg;
      this.pSprite.loc = this.pLoc;
      this.render();
      if (this.pTextKeys.length < 1) {
        return "";
      }
      if (
        !voidP(this.pTextKeys[this.pShowOrder[this.pSelectedItemNum - 1] - 1])
      ) {
        return this.pTextKeys[this.pShowOrder[this.pSelectedItemNum - 1] - 1];
      }
    }
  }

  mouseDown() {
    if (this.pSprite.blend < 100) {
      return false;
    }
    this.pClickPass = 1;
    if (this.pState !== "open") {
      return this.openMenu();
    }
  }

  mouseUp() {
    if (this.pOnFirstChoice) {
      this.pOnFirstChoice = 0;
      return false;
    }
    if (this.pSprite.blend < 100) {
      return false;
    }
    if (this.pClickPass === 0) {
      return false;
    }
    this.cancelDelay();
    return this.chooseFromMenu();
  }

  mouseUpOutSide() {
    if (this.pSprite.locH > 5000) {
      return false;
    }
    this.pClickPass = 0;
    this.pState = "close";
    this.pLastRollOver = null;
    this.pimage = this.pDropActiveBtnImg;
    this.render();
    this.pSprite.loc = this.pLoc;
    return false;
  }

  mouseEnter() {
    this.cancelDelay();
  }

  cancelDelay() {
    if (!voidP(this.pDelayID)) {
      // me.Cancel(pDelayID) - placeholder for timeout cancel
      this.pDelayID = null;
    }
  }

  mouseLeave() {
    if (this.pState === "open") {
      // this.pDelayID = this.delay(500, sym('#mouseUpOutSide')) - placeholder
    }
  }

  mouseWithin() {
    if (this.pState === "open") {
      if (voidP(this.pLastRollOver)) {
        this.pLastRollOver = 0;
      }
      // pRollOverItem = ((the mouseV - me.pSprite.top - 1) / pLineHeight) + 1
      // Placeholder - needs mouse position tracking
      if (this.pLastRollOver === -2) {
        this.pLastRollOver = -1;
        return true;
      }
      if (this.pOnFirstChoice && this.pLastRollOver === -1) {
        this.pLastRollOver = this.pRollOverItem;
      }
      if (this.pRollOverItem !== this.pLastRollOver) {
        this.pOnFirstChoice = 0;
        if (this.pRollOverItem > this.pShowOrder.length) {
          this.pRollOverItem = this.pShowOrder.length;
        }
        if (this.pShowOrder.length === this.pRollOverItem) {
          // tMaskFix = pMarginBottom
        } else {
          // tMaskFix = 0
        }
        // Image manipulation for hover effect - placeholder for Canvas rendering
        this.pLastRollOver = this.pRollOverItem;
      }
    }
  }

  reDraw() {
    // this.pBuffer.image.copyPixels(me.pimage, me.pimage.rect, me.pimage.rect)
    // Placeholder - Canvas copyPixels
  }

  render() {
    const tTempOffset = this.pBuffer.regPoint;
    this.pSprite.width = this.pimage.width;
    this.pSprite.height = this.pimage.height;
    this.pBuffer.image = this.pimage;
    this.pBuffer.regPoint = tTempOffset;
  }

  UpdateImageObjects(tPalette, tstate) {
    this.pDropDownImg = createPropList();
    if (voidP(tPalette)) {
      tPalette = this.pPalette;
    } else {
      if (stringp(tPalette)) {
        tPalette = member(getmemnum(tPalette));
      }
    }
    for (const tV of ["top", "middle", "bottom"]) {
      for (const tH of ["left", "middle", "right"]) {
        const tSymbol = symbol("#" + tV + tH);
        const tDesc = this.pProp[tstate][symbol("#members")][tSymbol];
        const tmember = member(getmemnum(tDesc[symbol("#member")]));
        const tImage = tmember.image.duplicate();
        if (tImage.paletteRef !== tPalette) {
          tImage.paletteRef = tPalette;
        }
        if (tDesc[symbol("#flipH")]) {
          this.flipH(tImage);
        }
        if (tDesc[symbol("#flipV")]) {
          this.flipV(tImage);
        }
        if (!voidP(tDesc[symbol("#rotate")])) {
          this.rotateImg(tImage, tDesc[symbol("#rotate")]);
        }
        this.pDropDownImg.setaProp(tV + "_" + tH, tImage);
      }
    }
    if (!voidP(this.pProp[symbol("#optionalimage")])) {
      const tOptionalImages =
        this.pProp[symbol("#optionalimage")][symbol("#members")];
      for (let i = 1; i <= tOptionalImages.count; i++) {
        const tDesc = tOptionalImages[tOptionalImages.getPropAt(i)];
        const tMemName = tDesc[symbol("#member")];
        const tmember = member(getmemnum(tMemName));
        const tImage = tmember.image.duplicate();
        if (tImage.paletteRef !== tPalette) {
          tImage.paletteRef = tPalette;
        }
        if (tDesc[symbol("#flipH")]) {
          this.flipH(tImage);
        }
        if (tDesc[symbol("#flipV")]) {
          this.flipV(tImage);
        }
        this.pDropDownImg.setaProp(
          "optionalimage_" + tOptionalImages.getPropAt(i),
          tImage,
        );
      }
    }
    // pDotLineImg creation - placeholder for Canvas image
    this.pPalette = tPalette;
    return tPalette;
  }

  createDropImg(tItemsList, tListOfAllItemsOrNot, tstate, tSort) {
    // Complex image generation for dropdown - placeholder for Canvas rendering
    // This creates the visual dropdown menu image with text and decorations
    return null;
  }

  flipH(tImg) {
    // Horizontal flip - placeholder for Canvas
    return tImg;
  }

  flipV(tImg) {
    // Vertical flip - placeholder for Canvas
    return tImg;
  }

  rotateImg(tImg, tDirection) {
    // Rotate image - placeholder for Canvas
    return tImg;
  }

  RotateQuad(tDestquad, tClockwise) {
    const tPoint1 = tDestquad[0];
    const tPoint2 = tDestquad[1];
    const tPoint3 = tDestquad[2];
    const tPoint4 = tDestquad[3];
    if (tClockwise === 1) {
      return [tPoint2, tPoint3, tPoint4, tPoint1];
    } else {
      return [tPoint4, tPoint1, tPoint2, tPoint3];
    }
  }
}
