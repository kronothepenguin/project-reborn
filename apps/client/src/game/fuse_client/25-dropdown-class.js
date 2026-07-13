export default class {
  pState;
  pProp;
  pTextKeys;
  pTextlist;
  pShowOrder;
  pDropMenuImg;
  pDropActiveBtnImg;
  pDropDownImg;
  pLineHeight;
  pMarginTop;
  pMarginBottom;
  pMarginLeft;
  pAlignment;
  pOpenDir;
  pMaxWidth;
  pDotLineImg;
  pFont;
  pFonSize;
  pSelectedItemNum;
  pRollOverItem;
  pLoc;
  pFixedSize;
  pOrigWidth;
  pLastRollOver;
  pTextWidth;
  pClickPass;
  pDelayID;
  pOnFirstChoice;
  pDropDownType;
  pmodel;
  pOrdering;
  pID;
  pBuffer;
  pSprite;
  pLocX;
  pLocY;
  pimage;
  pwidth;
  pPalette;
  pheight;

  define(tProps) {
    const tField = `${tProps[Symbol.for("type")]}${tProps[Symbol.for("model")]}.element`;
    this.pProp = getObject(Symbol.for("layout_parser")).parse(tField);
    if (this.pProp == 0) {
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
    if (this.pTextKeys.ilk != Symbol.for("list")) {
      this.pTextKeys = list();
    }
    for (const tKey of this.pTextKeys) {
      this.pTextlist.add(getText(tKey));
    }
    if (this.pTextlist.count == 0) {
      this.pTextlist.add("...");
    }
    this.pShowOrder = list();
    for (let i = 1; i <= this.pTextlist.count; i++) {
      this.pShowOrder.add(i);
    }
    if (voidp(this.pPalette)) {
      if (variableExists("interface.palette")) {
        this.pPalette = member(getmemnum(getVariable("interface.palette")));
      } else {
        this.pPalette = Symbol.for("systemMac");
      }
    } else {
      if (stringp(this.pPalette)) {
        this.pPalette = member(getmemnum(this.pPalette));
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
    if (this.pmodel == 2) {
      this.pLineHeight = this.pLineHeight - 1;
    }
    this.UpdateImageObjects(VOID, Symbol.for("up"));
    this.pDropMenuImg = this.createDropImg(this.pTextlist, 1, Symbol.for("up"));
    this.pimage = this.pDropMenuImg;
    this.pwidth = this.pimage.width;
    this.pheight = this.pimage.height;
    this.pDropActiveBtnImg = this.createDropImg(list(this.pTextlist[1]), 0, Symbol.for("up"));
    this.pimage = this.pDropActiveBtnImg;
    const tTempOffset = this.pBuffer.regPoint;
    this.pBuffer.image = this.pimage;
    this.pBuffer.regPoint = tTempOffset;
    this.pSprite.blend = tProps[Symbol.for("blend")];
    return 1;
  }

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
  }

  Activate() {
    this.pSprite.blend = 100;
    return 1;
  }

  deactivate() {
    this.pSprite.blend = 50;
    return 1;
  }

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
    this.pDropActiveBtnImg = this.createDropImg(list(this.pTextlist[this.pSelectedItemNum]), 0, Symbol.for("up"));
    this.pimage = this.pDropActiveBtnImg;
    this.render();
    return 1;
  }

  getSelection(tReturnType) {
    if (tReturnType == Symbol.for("text")) {
      return this.pTextlist[this.pShowOrder[this.pSelectedItemNum]];
    } else {
      if (tReturnType == Symbol.for("key")) {
        return this.pTextKeys[this.pShowOrder[this.pSelectedItemNum]];
      }
    }
    return this.pTextKeys[this.pShowOrder[this.pSelectedItemNum]];
  }

  setSelection(tSelNumOrStr, tUpdate) {
    const tEarlierSelection = this.pSelectedItemNum;
    if (stringp(tSelNumOrStr)) {
      let tSelNum = this.pTextlist.getPos(tSelNumOrStr);
      if (tSelNum == 0) {
        tSelNum = this.pTextKeys.getPos(tSelNumOrStr);
      }
    } else {
      var tSelNum = tSelNumOrStr;
    }
    if (tSelNum <= 0) {
      return 0;
    }
    this.pSelectedItemNum = this.pShowOrder.getPos(tSelNum);
    if (!(this.pSelectedItemNum > 0)) {
      this.pSelectedItemNum = 1;
    }
    if (tEarlierSelection == this.pSelectedItemNum) {
      return 1;
    }
    if (tUpdate) {
      this.arrangeTextList(Symbol.for("choose"));
      this.pDropActiveBtnImg = this.createDropImg(list(this.pTextlist[this.pShowOrder[this.pSelectedItemNum]]), 0, Symbol.for("up"));
      this.pimage = this.pDropActiveBtnImg;
      this.pSprite.loc = this.pLoc;
      this.render();
    }
    return 1;
  }

  setShowOrder(tStyle, tFirstNum, tDeleteOne, tOpenDir) {
    if (!this.pOrdering) {
      return 1;
    }
    const tChoice = this.pShowOrder[this.pSelectedItemNum];
    switch (tStyle) {
      case Symbol.for("normal"):
        for (let i = 1; i <= this.pTextlist.count; i++) {
          this.pShowOrder[i] = i;
        }
        break;
    }
    if (tFirstNum > 0) {
      if (tOpenDir == Symbol.for("down")) {
        const tTempPlace = this.pShowOrder.getPos(tFirstNum);
        this.pShowOrder.deleteAt(tTempPlace);
        this.pShowOrder.addAt(1, tFirstNum);
      } else {
        const tTempPlace = this.pShowOrder.getPos(tFirstNum);
        this.pShowOrder.deleteAt(tTempPlace);
        this.pShowOrder.addAt(this.pShowOrder.count + 1, tFirstNum);
      }
    }
    if (tDeleteOne > 0) {
      this.pShowOrder.deleteOne(tDeleteOne);
    }
    this.pSelectedItemNum = this.pShowOrder.getPos(tChoice);
    return 0;
  }

  setOrdering(tMode) {
    this.pOrdering = tMode;
    return 1;
  }

  arrangeTextList(tStyle) {
    if (this.pDropDownType == Symbol.for("titleWithCancel")) {
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
    if ((this.pDropDownType == Symbol.for("default")) && (this.pOpenDir == Symbol.for("up"))) {
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
    if ((this.pDropDownType == Symbol.for("default")) && (this.pOpenDir == Symbol.for("down"))) {
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
  }

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
  }

  openMenu() {
    this.arrangeTextList(Symbol.for("open"));
    this.pimage = this.pDropMenuImg;
    this.pLoc = this.pSprite.loc;
    switch (this.pOpenDir) {
      case Symbol.for("lastselected"):
        this.pSprite.loc = this.pLoc - point(0, (this.pSelectedItemNum - 1) * this.pLineHeight);
        break;
      case Symbol.for("up"):
        this.pSprite.loc = this.pLoc - point(0, (this.pShowOrder.count - 1) * this.pLineHeight);
        break;
    }
    this.render();
    this.pState = Symbol.for("open");
    this.pLastRollOver = -2;
    this.pOnFirstChoice = 1;
    return 1;
  }

  chooseFromMenu() {
    this.pClickPass = 0;
    this.pState = Symbol.for("close");
    this.pLastRollOver = VOID;
    if ((this.pRollOverItem > 0) && (this.pRollOverItem <= this.pShowOrder.count)) {
      this.pSelectedItemNum = this.pRollOverItem;
      this.arrangeTextList(Symbol.for("choose"));
      this.pDropActiveBtnImg = this.createDropImg(list(this.pTextlist[this.pShowOrder[this.pSelectedItemNum]]), 0, Symbol.for("up"));
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
  }

  mouseDown() {
    if (this.pSprite.blend < 100) {
      return 0;
    }
    this.pClickPass = 1;
    if (this.pState != Symbol.for("open")) {
      return this.openMenu();
    }
  }

  mouseUp() {
    if (this.pOnFirstChoice) {
      this.pOnFirstChoice = 0;
      return 0;
    }
    if (this.pSprite.blend < 100) {
      return 0;
    }
    if (this.pClickPass == 0) {
      return 0;
    }
    this.cancelDelay();
    return this.chooseFromMenu();
  }

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
  }

  mouseEnter() {
    this.cancelDelay();
  }

  cancelDelay() {
    if (!voidp(this.pDelayID)) {
      this.Cancel(this.pDelayID);
      this.pDelayID = VOID;
    }
  }

  mouseLeave() {
    if (this.pState == Symbol.for("open")) {
      this.pDelayID = this.delay(500, Symbol.for("mouseUpOutSide"));
    }
  }

  mouseWithin() {
    if (this.pState == Symbol.for("open")) {
      if (voidp(this.pLastRollOver)) {
        this.pLastRollOver = 0;
      }
      this.pRollOverItem = ((the.mouseV - this.pSprite.top - 1) / this.pLineHeight) + 1;
      if (this.pLastRollOver == -2) {
        this.pLastRollOver = -1;
        return 1;
      }
      if (this.pOnFirstChoice && (this.pLastRollOver == -1)) {
        this.pLastRollOver = this.pRollOverItem;
      }
      if (this.pRollOverItem != this.pLastRollOver) {
        this.pOnFirstChoice = 0;
        if (this.pRollOverItem > this.pShowOrder.count) {
          this.pRollOverItem = this.pShowOrder.count;
        }
        if (this.pShowOrder.count == this.pRollOverItem) {
          var tMaskFix = this.pMarginBottom;
        } else {
          var tMaskFix = 0;
        }
        const tTempImage = this.pDropMenuImg.duplicate();
        const tTempActiveBoxImg = image(this.pwidth, this.pLineHeight + tMaskFix, 8, this.pPalette);
        const tMemberDesc = this.pProp[Symbol.for("up")][Symbol.for("members")][Symbol.for("activeline")];
        const tmember = member(getmemnum(tMemberDesc[Symbol.for("member")]));
        tTempActiveBoxImg.copyPixels(tmember.image, tTempActiveBoxImg.rect, tmember.rect);
        const tActiveTop = (this.pRollOverItem - 1) * this.pLineHeight;
        const tdestrect = rect(0, tActiveTop, this.pwidth, tActiveTop + this.pLineHeight + tMaskFix);
        tTempImage.copyPixels(tTempActiveBoxImg, tdestrect, tTempActiveBoxImg.rect, propList("maskImage", this.pDropMenuImg.createMatte(), "maskOffset", point(0, -tActiveTop), "ink", 39));
        this.pimage = tTempImage;
        this.reDraw();
        this.pLastRollOver = this.pRollOverItem;
      }
    }
  }

  reDraw() {
    this.pBuffer.image.copyPixels(this.pimage, this.pimage.rect, this.pimage.rect);
  }

  render() {
    const tTempOffset = this.pBuffer.regPoint;
    this.pSprite.width = this.pimage.width;
    this.pSprite.height = this.pimage.height;
    this.pBuffer.image = this.pimage;
    this.pBuffer.regPoint = tTempOffset;
  }

  UpdateImageObjects(tPalette, tstate) {
    this.pDropDownImg = propList();
    if (voidp(tPalette)) {
      tPalette = this.pPalette;
    } else {
      if (stringp(tPalette)) {
        tPalette = member(getmemnum(tPalette));
      }
    }
    for (const tV of list(Symbol.for("top"), Symbol.for("middle"), Symbol.for("bottom"))) {
      for (const tH of list(Symbol.for("left"), Symbol.for("middle"), Symbol.for("right"))) {
        const tSymbol = symbol(`${tV}${tH}`);
        const tDesc = this.pProp[tstate][Symbol.for("members")][tSymbol];
        const tmember = member(getmemnum(tDesc[Symbol.for("member")]));
        let tImage = tmember.image.duplicate();
        if (tImage.paletteRef != tPalette) {
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
        this.pDropDownImg.addProp(`${tV}_${tH}`, tImage);
      }
    }
    if (!voidp(this.pProp[Symbol.for("optionalimage")])) {
      const tOptionalImages = this.pProp[Symbol.for("optionalimage")][Symbol.for("members")];
      for (let i = 1; i <= tOptionalImages.count(); i++) {
        const tDesc = tOptionalImages[tOptionalImages.getPropAt(i)];
        const tMemName = tDesc[Symbol.for("member")];
        const tmember = member(getmemnum(tMemName));
        let tImage = tmember.image.duplicate();
        if (tImage.paletteRef != tPalette) {
          tImage.paletteRef = tPalette;
        }
        if (tDesc[Symbol.for("flipH")]) {
          tImage = this.flipH(tImage);
        }
        if (tDesc[Symbol.for("flipV")]) {
          tImage = this.flipV(tImage);
        }
        this.pDropDownImg.addProp(`optionalimage_${tOptionalImages.getPropAt(i)}`, tImage);
      }
    }
    this.pDotLineImg = image(this.pMaxWidth, 1, 8, tPalette);
    for (let tXPoint = 0; tXPoint <= this.pMaxWidth / 2; tXPoint++) {
      this.pDotLineImg.setPixel(tXPoint * 2, 0, rgb(0, 0, 0));
    }
    this.pPalette = tPalette;
    return tPalette;
  }

  createDropImg(tItemsList, tListOfAllItemsOrNot, tstate, tSort) {
    let tStr = EMPTY;
    if (!tListOfAllItemsOrNot) {
      tStr = `${tStr}${tItemsList[1]}${RETURN}`;
    } else {
      for (let f = 1; f <= this.pShowOrder.count; f++) {
        tStr = `${tStr}${tItemsList[this.pShowOrder[f]]}${RETURN}`;
      }
    }
    let tMemNum = getmemnum("dropdown.button.text");
    if (tMemNum == 0) {
      tMemNum = createMember("dropdown.button.text", Symbol.for("text"));
    }
    const tTextMember = member(tMemNum);
    const tFontDesc = this.pProp[tstate][Symbol.for("text")];
    this.pMarginTop = tFontDesc[Symbol.for("marginV")];
    this.pMarginLeft = tFontDesc[Symbol.for("marginH")];
    this.pMarginBottom = tFontDesc[Symbol.for("marginbottom")];
    tTextMember.wordWrap = 0;
    tTextMember.font = string(tFontDesc[Symbol.for("font")]);
    tTextMember.fontStyle = list(symbol(tFontDesc[Symbol.for("fontStyle")]));
    tTextMember.fontSize = tFontDesc[Symbol.for("fontSize")];
    tTextMember.color = rgb(tFontDesc[Symbol.for("color")]);
    tTextMember.text = tStr.line[`1..${tStr.line.count - 1}`];
    tTextMember.fixedLineSpace = this.pLineHeight;
    if ((tListOfAllItemsOrNot == 1) && !voidp(this.pProp[Symbol.for("optionalimage")])) {
      const tOptionalImages = this.pProp[Symbol.for("optionalimage")][Symbol.for("members")];
      let tOptionalImagesWidth = 0;
      for (let i = 1; i <= tOptionalImages.count(); i++) {
        tOptionalImagesWidth = tOptionalImagesWidth + this.pDropDownImg[`optionalimage_${tOptionalImages.getPropAt(i)}`].width;
      }
    } else {
      var tOptionalImagesWidth = 0;
    }
    let tTextImg;
    if (this.pFixedSize == 1) {
      tTextMember.alignment = tFontDesc[Symbol.for("alignment")];
      this.pTextWidth = this.pOrigWidth - (this.pMarginLeft * 2);
      tTextMember.rect = rect(0, 0, this.pTextWidth, tTextMember.height);
      tTextImg = tTextMember.image;
      this.pwidth = this.pOrigWidth;
    } else {
      tTextMember.alignment = Symbol.for("left");
      if (tListOfAllItemsOrNot == 1) {
        let tMaxLengt = 1;
        let tCharNum = 1;
        let tSofarChars = 0;
        for (let tLineN = 1; tLineN <= tStr.line.count; tLineN++) {
          tSofarChars = tSofarChars + tStr.line[tLineN].char.count;
          if (tStr.line[tLineN].char.count > tMaxLengt) {
            tMaxLengt = tSofarChars;
            tCharNum = tSofarChars;
            const tLineWidth = tTextMember.charPosToLoc(tCharNum).locH + (tFontDesc[Symbol.for("fontSize")] * 2);
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
    const tWidth = this.pwidth;
    let tNewImg;
    if (tItemsList.count == 1) {
      if (this.pmodel == 2) {
        tNewImg = image(tWidth, this.pLineHeight, 8, this.pPalette);
      } else {
        tNewImg = image(tWidth, this.pLineHeight + this.pMarginBottom, 8, this.pPalette);
      }
    } else {
      tNewImg = image(tWidth, (this.pShowOrder.count * this.pLineHeight) + this.pMarginBottom, 8, this.pPalette);
    }
    let tdestrect = rect(0, 0, 0, 0);
    let tEndPointX = 0;
    let tEndPointY = 0;
    let tLastX = 0;
    let tStartPoint = 0;
    let tItemCount;
    if (tItemsList.count == 1) {
      tItemCount = 1;
    } else {
      tItemCount = this.pShowOrder.count;
    }
    for (const f of list("top", "middle", "bottom")) {
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
      for (const i of list("left", "middle", "right")) {
        tLastX = tEndPointX;
        switch (i) {
          case "left":
            tEndPointX = tEndPointX + this.pDropDownImg.getProp(`${f}_${i}`).width;
            break;
          case "middle":
            tEndPointX = tEndPointX + tWidth - this.pDropDownImg.getProp(Symbol.for("top_left")).width - this.pDropDownImg.getProp(Symbol.for("top_right")).width;
            break;
          case "right":
            tEndPointX = tEndPointX + this.pDropDownImg.getProp(`${f}_${i}`).width;
            break;
        }
        tdestrect = rect(tLastX, tStartPoint, tEndPointX, tEndPointY);
        tNewImg.copyPixels(this.pDropDownImg.getProp(`${f}_${i}`), tdestrect, this.pDropDownImg.getProp(`${f}_${i}`).rect);
      }
    }
    if ((tListOfAllItemsOrNot == 0) && !voidp(this.pProp[Symbol.for("optionalimage")])) {
      const tOptionalImages = this.pProp[Symbol.for("optionalimage")][Symbol.for("members")];
      for (let i = 1; i <= tOptionalImages.count(); i++) {
        const tPosition = tOptionalImages.getPropAt(i);
        const tOptionalImg = this.pDropDownImg[`optionalimage_${tOptionalImages.getPropAt(i)}`];
        const tOptionImgRect = tOptionalImg.rect;
        const tOptionImgMargH = tOptionalImages[tOptionalImages.getPropAt(i)][Symbol.for("marginH")];
        const tOptionImgMargV = (tNewImg.height / 2) - (tOptionImgRect.height / 2);
        if (tPosition == Symbol.for("right")) {
          tdestrect = tOptionImgRect + rect(this.pwidth - tOptionImgMargH - tOptionImgRect.width, tOptionImgMargV, this.pwidth - tOptionImgMargH - tOptionImgRect.width, tOptionImgMargV);
        } else {
          if (tPosition == Symbol.for("left")) {
            tdestrect = tOptionImgRect + rect(tOptionImgMargH, tOptionImgMargV, tOptionImgMargH, tOptionImgMargV);
          }
        }
        tNewImg.copyPixels(tOptionalImg, tdestrect, tOptionImgRect, propList("ink", 36));
      }
    }
    if (tItemCount > 1) {
      for (let f = 1; f <= tItemCount - 1; f++) {
        tdestrect = rect(0, f * this.pLineHeight, tWidth - 1, (f * this.pLineHeight) + 1);
        tNewImg.copyPixels(this.pDotLineImg, tdestrect, rect(0, 0, tWidth - 1, 1), propList("ink", 36));
      }
    }
    tdestrect = tTextImg.rect + rect(0, this.pMarginTop, 0, this.pMarginTop);
    switch (tFontDesc[Symbol.for("alignment")]) {
      case Symbol.for("left"):
        tdestrect = tdestrect + rect(this.pMarginLeft, 0, this.pMarginLeft, 0);
        break;
      case Symbol.for("center"):
        tdestrect = tdestrect + rect(tNewImg.width / 2, 0, tNewImg.width / 2, 0) - rect(this.pTextWidth / 2, 0, this.pTextWidth / 2, 0);
        break;
      case Symbol.for("right"):
        tdestrect = tdestrect + rect(tNewImg.width, 0, tNewImg.width, 0) - rect(this.pTextWidth + this.pDropDownImg.getProp("top_right").width, 0, this.pTextWidth + this.pDropDownImg.getProp("top_right").width, 0);
        break;
    }
    if (variableExists("dropdown.top.offset")) {
      tdestrect = tdestrect + rect(0, getVariable("dropdown.top.offset"), 0, getVariable("dropdown.top.offset"));
    }
    tNewImg.copyPixels(tTextImg, tdestrect, tTextImg.rect);
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

  rotateImg(tImg, tDirection) {
    const tImage = image(tImg.height, tImg.width, tImg.depth, tImg.paletteRef);
    let tQuad = list(point(0, 0), point(tImg.height, 0), point(tImg.height, tImg.width), point(0, tImg.width));
    tQuad = this.RotateQuad(tQuad, tDirection);
    tImage.copyPixels(tImg, tQuad, tImg.rect);
    return tImage;
  }

  RotateQuad(tDestquad, tClockwise) {
    const tPoint1 = tDestquad[1];
    const tPoint2 = tDestquad[2];
    const tPoint3 = tDestquad[3];
    const tPoint4 = tDestquad[4];
    if (tClockwise == 1) {
      tDestquad = list(tPoint2, tPoint3, tPoint4, tPoint1);
    } else {
      tDestquad = list(tPoint4, tPoint1, tPoint2, tPoint3);
    }
    return tDestquad;
  }
}
