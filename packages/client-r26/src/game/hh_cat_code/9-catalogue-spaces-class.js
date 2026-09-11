export default class {
  pWallPatterns;
  pWallPattern;
  pWallModel;
  pWallThumbSpr;
  pWallPreviewIdList;
  pFloorPatterns;
  pFloorPattern;
  pFloorModel;
  pFloorThumbSpr;
  pFloorPreviewIdList;
  pLandscapePatterns;
  pLandscapeGradients;
  pLandscapeProducts;
  pLandscapePattern;
  pLandscapeGradient;
  pLandscapePreviewIdList;
  pLandscapeElement;
  pLandscapeBlockedCombos;
  pWallProps;
  pFloorProps;
  pLandscapeProps;

  construct() {
    this.pWallPatterns = propList();
    this.pWallPattern = 0;
    this.pWallModel = 0;
    this.pFloorPatterns = field("catalog_floorpattern_patterns");
    this.pFloorPattern = 0;
    this.pFloorModel = 0;
    this.pLandscapePattern = 1;
    this.pLandscapeGradient = 1;
    this.pWallProps = propList();
    this.pFloorProps = propList();
    this.pLandscapeProps = propList();
    this.pLandscapeProducts = propList();
    this.pFloorPreviewIdList = list();
    this.pFloorPreviewIdList.add("catalog_floor_preview_example");
    this.pWallPreviewIdList = list();
    this.pWallPreviewIdList.add("catalog_wall_preview_a_left");
    this.pWallPreviewIdList.add("catalog_wall_preview_b_right");
    this.pLandscapeElement = "catalog_space_preview_window";
    this.pLandscapePreviewIdList = list();
    this.pLandscapePreviewIdList.add("catalog_spaces_window");
    this.pLandscapePreviewIdList.add("catalog_spaces_window_mask");
    this.pLandscapePreviewIdList.add("catalog_landscape_preview_window_alpha");
    let tLandscapePatterns = field("catalog_landscape_patterns");
    let tLandscapeGradients = field("catalog_landscape_gradients");
    this.pLandscapePatterns = list();
    this.pLandscapeGradients = list();
    for (let i = 1; i <= tLandscapePatterns.line.count; i++) {
      this.pLandscapePatterns.add(tLandscapePatterns.line[i]);
    }
    for (let i = 1; i <= tLandscapeGradients.line.count; i++) {
      this.pLandscapeGradients.add(tLandscapeGradients.line[i]);
    }
    this.pLandscapeBlockedCombos = list();
    if (memberExists("catalog_landscape_blocked_combinations")) {
      let tDelim = the.itemDelimiter;
      the.itemDelimiter = ",";
      let tBlockList = field("catalog_landscape_blocked_combinations");
      for (let i = 1; i <= tBlockList.line.count; i++) {
        this.pLandscapeBlockedCombos.add(list(tBlockList.line[i].item[1], tBlockList.line[i].item[2]));
      }
      the.itemDelimiter = tDelim;
    }
    return 1;
  }

  define(tPageProps) {
    if (tPageProps.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect Catalogue page data", Symbol.for("define"), Symbol.for("major"));
    }
    let tWallPatterns = field("catalog_wallpattern_patterns");
    let tWndObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tWndObj) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("define"), Symbol.for("major"));
    }
    let tProdList = tPageProps["productList"];
    if (!voidp(tProdList)) {
      if (tProdList.count < 2) {
        if (tWndObj.elementExists("ctlg_buy_wall")) {
          tWndObj.getElement("ctlg_buy_wall").setProperty(Symbol.for("visible"), 0);
        }
        if (tWndObj.elementExists("ctlg_buy_floor")) {
          tWndObj.getElement("ctlg_buy_floor").setProperty(Symbol.for("visible"), 0);
        }
        if (tWndObj.elementExists("ctlg_buy_landscape")) {
          tWndObj.getElement("ctlg_buy_landscape").setProperty(Symbol.for("visible"), 0);
        }
        return 0;
      }
      for (let tItemNo = 1; tItemNo <= tProdList.count; tItemNo++) {
        let tProp = tProdList[tItemNo];
        let tClass = tProp["class"];
        let tClassPrefix = tClass.word[1];
        let tClassPostfix = tClass.word[2];
        if ((tClassPrefix == "wallpaper") && (tClassPostfix != EMPTY)) {
          let tPatternNo = tClassPostfix;
          let tPatternMemName = tWallPatterns.line[integer(tPatternNo)];
          let tModelsRawData = member(tPatternMemName).text;
          if (ilk(this.pWallPatterns[tPatternNo]) != Symbol.for("propList")) {
            this.pWallPatterns[tPatternNo] = propList();
          }
          let tmodellist = this.pWallPatterns[tPatternNo].duplicate();
          let tDelim = the.itemDelimiter;
          the.itemDelimiter = ",";
          for (let tModelNo = 1; tModelNo <= tModelsRawData.line.count; tModelNo++) {
            let tModelDataLn = tModelsRawData.line[tModelNo];
            if (tModelDataLn.item.count < 5) {
              break;
            }
            let tPatternID = tModelDataLn.item[1];
            let tPalette = tModelDataLn.item[2];
            let tRed = integer(tModelDataLn.item[3]);
            let tGreen = integer(tModelDataLn.item[4]);
            let tBlue = integer(tModelDataLn.item[5]);
            let tRGB = rgb(tRed, tGreen, tBlue);
            let tTempModelNo = tModelNo;
            if (tModelNo < 10) {
              tTempModelNo = `${"0"}${tModelNo}`;
            }
            let tPaperID = `${tPatternNo}${EMPTY}${tTempModelNo}`;
            let tModelProps = tProp.duplicate();
            tModelProps["extra_parm"] = tPaperID;
            tModelProps[Symbol.for("patternID")] = tPatternID;
            tModelProps[Symbol.for("rgb")] = tRGB;
            tModelProps[Symbol.for("palette")] = tPalette;
            tmodellist[string(tModelNo)] = tModelProps;
          }
          this.pWallPatterns[tPatternNo] = tmodellist;
          the.itemDelimiter = tDelim;
          continue;
        }
        if (tClass == "floor") {
          this.pFloorProps = tProp;
          continue;
        }
        if (tClassPrefix == "landscape") {
          let tPatternNo = tClassPostfix;
          if (tPatternNo <= this.pLandscapePatterns.count) {
            let tPatternMemName;
            if (tPatternNo == 0) {
              tPatternMemName = EMPTY;
            } else {
              tPatternMemName = this.pLandscapePatterns[integer(tPatternNo)];
            }
            let tLandscapeProps = tProp.duplicate();
            tLandscapeProps["extra_parm"] = `${"1."}${tPatternNo}`;
            tLandscapeProps[Symbol.for("patternID")] = tPatternNo;
            this.pLandscapeProducts[string(tPatternNo)] = tLandscapeProps;
          }
        }
      }
    }
    this.setWallPaper("pattern", 6);
    this.setFloorPattern("pattern", 3);
    this.setLandscapePreview("pattern", 0);
  }

  setWallPaper(ttype, tChange) {
    let tWndObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tWndObj) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("setWallPaper"), Symbol.for("major"));
    }
    if (ttype == "pattern") {
      this.pWallPattern = this.pWallPattern + tChange;
      if (this.pWallPattern > this.pWallPatterns.count) {
        this.pWallPattern = 1;
      } else if (this.pWallPattern < 1) {
        this.pWallPattern = this.pWallPatterns.count;
      }
      this.pWallModel = 1;
      let tElemPrev = tWndObj.getElement("ctlg_wall_color_prev");
      let tElemNext = tWndObj.getElement("ctlg_wall_color_next");
      if (this.pWallPatterns[this.pWallPattern].count < 2) {
        tElemPrev.deactivate();
        tElemNext.deactivate();
      } else {
        tElemPrev.Activate();
        tElemNext.Activate();
      }
    } else if (ttype == "model") {
      this.pWallModel = this.pWallModel + tChange;
      if (this.pWallModel > this.pWallPatterns[this.pWallPattern].count) {
        this.pWallModel = 1;
      } else if (this.pWallModel < 1) {
        this.pWallModel = this.pWallPatterns[this.pWallPattern].count;
      }
    }
    let tWallData = this.pWallPatterns[this.pWallPattern][string(this.pWallModel)];
    ttype = tWallData[Symbol.for("patternID")];
    let tPalette = tWallData[Symbol.for("palette")];
    let tColor = tWallData[Symbol.for("rgb")];
    let tColors = propList("left", tColor - rgb(16, 16, 16), "right", tColor, "a", tColor - rgb(16, 16, 16), "b", tColor, "pattern", tColor);
    this.pWallProps = tWallData;
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    for (const tID of this.pWallPreviewIdList) {
      let tPiece = tID.item[tID.item.count];
      let tMem = `${"catalog_spaces_wall"}${ttype}${`_`}${tPiece}`;
      if (memberExists(tMem)) {
        if (tWndObj.elementExists(tID)) {
          let tmember = member(getmemnum(tMem));
          tmember.paletteRef = member(getmemnum(tPalette));
          let tImg = tmember.image;
          let tElem = tWndObj.getElement(tID);
          let tDestImg = tElem.getProperty(Symbol.for("image"));
          let tRect = tDestImg.rect;
          let tMatte = tImg.createMatte();
          tDestImg.copyPixels(tImg, tRect, tImg.rect, propList("maskImage", tMatte, "ink", 41, "bgColor", tColors[tPiece]));
          tElem.feedImage(tDestImg);
        }
        continue;
      }
      error(this, "Wall member not found:" && `${"catalog_spaces_wall"}${ttype}${`_`}${tPiece}`, Symbol.for("setWallPaper"), Symbol.for("minor"));
    }
    the.itemDelimiter = tDelim;
    let tPrice = tWallData["price"];
    let tElemName = "ctlg_wall_price";
    if (!voidp(tPrice)) {
      if (tWndObj.elementExists(tElemName)) {
        if (value(tPrice) > 0) {
          let tText = `${tPrice} ${getText("credits", "credits")}`;
          tWndObj.getElement(tElemName).setText(tText);
        }
      }
    }
    return 1;
  }

  setFloorPattern(ttype, tChange) {
    if (ttype == "pattern") {
      this.pFloorPattern = this.pFloorPattern + tChange;
      if (this.pFloorPattern > this.pFloorPatterns.line.count) {
        this.pFloorPattern = 1;
      } else if (this.pFloorPattern < 1) {
        this.pFloorPattern = this.pFloorPatterns.line.count;
      }
      this.pFloorModel = 1;
    } else if (ttype == "model") {
      this.pFloorModel = this.pFloorModel + tChange;
      if (this.pFloorModel > field(this.pFloorPatterns.line[this.pFloorPattern]).line.count) {
        this.pFloorModel = 1;
      } else if (this.pFloorModel < 1) {
        this.pFloorModel = field(this.pFloorPatterns.line[this.pFloorPattern]).line.count;
      }
    }
    let tmodel = field(this.pFloorPatterns.line[this.pFloorPattern]);
    let tPattern = tmodel.line[this.pFloorModel];
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    ttype = tPattern.item[1].char[1];
    let tPalette = tPattern.item[2];
    let tR = integer(tPattern.item[3]);
    let tG = integer(tPattern.item[4]);
    let tB = integer(tPattern.item[5]);
    let tColor = rgb(tR, tG, tB);
    this.pFloorProps["extra_parm"] = tPattern.item[6];
    the.itemDelimiter = "_";
    let tWndObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tWndObj) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("setFloorPattern"), Symbol.for("major"));
    }
    for (const tID of this.pFloorPreviewIdList) {
      let tPiece = tID.item[tID.item.count];
      let tMem = `${"catalog_spaces_floor"}${ttype}${`_`}${tPiece}`;
      if (memberExists(tMem)) {
        if (tWndObj.elementExists(tID)) {
          let tmember = member(getmemnum(tMem));
          tmember.paletteRef = member(getmemnum(tPalette));
          let tImg = tmember.image;
          let tElem = tWndObj.getElement(tID);
          let tDestImg = tElem.getProperty(Symbol.for("image"));
          let tRect = tDestImg.rect;
          let tMatte = tImg.createMatte();
          tDestImg.copyPixels(tImg, tRect, tImg.rect, propList("maskImage", tMatte, "ink", 41, "bgColor", tColor));
          tElem.feedImage(tDestImg);
        }
        continue;
      }
      error(this, "Wall member not found:" && `${"catalog_spaces_floor"}${ttype}${`_`}${tPiece}`, Symbol.for("setFloorPattern"), Symbol.for("minor"));
    }
    the.itemDelimiter = tDelim;
    let tPrice = this.pFloorProps["price"];
    let tElemName = "ctlg_floor_price";
    if (!voidp(tPrice)) {
      if (tWndObj.elementExists(tElemName)) {
        if (value(tPrice) > 0) {
          let tText = `${tPrice} ${getText("credits", "credits")}`;
          tWndObj.getElement(tElemName).setText(tText);
        }
      }
    }
    return 1;
  }

  GetLsProductOffset(tNumber) {
    for (let i = 1; i <= this.pLandscapeProducts.count; i++) {
      if (string(tNumber) == this.pLandscapeProducts.getPropAt(i)) {
        return i;
      }
    }
    return VOID;
  }

  ComboIsBlocked(tLandscape, tGradient) {
    for (const tCombo of this.pLandscapeBlockedCombos) {
      if ((tLandscape == tCombo[1]) && (tGradient == tCombo[2])) {
        return 1;
      }
    }
    return 0;
  }

  availableGradientsCount(tLandscape) {
    let tGradientsCount = this.pLandscapeGradients.count;
    for (const tCombo of this.pLandscapeBlockedCombos) {
      if (tLandscape == tCombo[1]) {
        tGradientsCount = tGradientsCount - 1;
      }
    }
    return tGradientsCount;
  }

  setLandscapePreview(ttype, tChange) {
    let tCurrent = this.GetLsProductOffset(this.pLandscapePattern);
    if (voidp(tCurrent)) {
      tCurrent = 1 - tChange;
    }
    if (ttype == "pattern") {
      let tNext = tCurrent + tChange;
      if (tNext > this.pLandscapeProducts.count) {
        tNext = 1;
      } else if (tNext < 1) {
        tNext = this.pLandscapeProducts.count;
      }
      this.pLandscapePattern = integer(this.pLandscapeProducts.getPropAt(tNext));
      if (this.ComboIsBlocked(this.pLandscapePattern, this.pLandscapeGradient)) {
        let tGradient = 1;
        while (this.ComboIsBlocked(this.pLandscapePattern, tGradient)) {
          tGradient = tGradient + 1;
        }
        this.pLandscapeGradient = tGradient;
      }
    } else if (ttype == "gradient") {
      this.pLandscapeGradient = this.pLandscapeGradient + tChange;
      while (this.ComboIsBlocked(this.pLandscapePattern, this.pLandscapeGradient)) {
        this.pLandscapeGradient = this.pLandscapeGradient + tChange;
        if (this.pLandscapeGradient > this.pLandscapeGradients.count) {
          this.pLandscapeGradient = 1;
          continue;
        }
        if (this.pLandscapeGradient < 1) {
          this.pLandscapeGradient = this.pLandscapeGradients.count;
        }
      }
      if (this.pLandscapeGradient > this.pLandscapeGradients.count) {
        this.pLandscapeGradient = 1;
      } else if (this.pLandscapeGradient < 1) {
        this.pLandscapeGradient = this.pLandscapeGradients.count;
      }
    }
    let tWndObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tWndObj) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("setLandscapePreview"), Symbol.for("major"));
    }
    let tElemPrev = tWndObj.getElement("ctlg_landscape_color_prev");
    let tElemNext = tWndObj.getElement("ctlg_landscape_color_next");
    if (this.availableGradientsCount(this.pLandscapePattern) < 2) {
      tElemPrev.deactivate();
      tElemNext.deactivate();
    } else {
      tElemPrev.Activate();
      tElemNext.Activate();
    }
    this.pLandscapeProps = this.pLandscapeProducts.getaProp(string(this.pLandscapePattern));
    let tPrice;
    if (!voidp(this.pLandscapeProps)) {
      this.pLandscapeProps = this.pLandscapeProps.duplicate();
      this.pLandscapeProps["extra_parm"] = `${string(this.pLandscapeGradient)}.${string(this.pLandscapePattern)}`;
      tPrice = this.pLandscapeProps["price"];
    } else {
      tPrice = 0;
    }
    let tElemName = "ctlg_landscape_price";
    if (!voidp(tPrice)) {
      if (tWndObj.elementExists(tElemName)) {
        if (value(tPrice) > 0) {
          let tText = `${tPrice} ${getText("credits", "credits")}`;
          tWndObj.getElement(tElemName).setText(tText);
        } else {
          let tText = "N/A";
          tWndObj.getElement(tElemName).setText(tText);
        }
      }
    }
    let tElement = tWndObj.getElement(this.pLandscapeElement);
    let tBuffer = image(tElement.getProperty(Symbol.for("width")), tElement.getProperty(Symbol.for("height")), 32);
    tBuffer.fill(tBuffer.rect, propList("shapeType", Symbol.for("rect"), "color", rgb("#FFFFFF")));
    let tRenderCount = 8;
    let tRenderOffsetRect = rect(16, 4, 16, 4);
    let tSrc = getMember(this.pLandscapeGradients[this.pLandscapeGradient]).image;
    let tClipAmount = 88;
    let tdestrect = rect(0, 0, tSrc.width, tSrc.height);
    for (let i = 1; i <= tRenderCount; i++) {
      let tSrcRect = rect(0, 0, tSrc.width, tSrc.height);
      let tOldDest = tdestrect.duplicate();
      tdestrect.bottom = tdestrect.bottom - tClipAmount;
      tdestrect.top = tdestrect.top - tClipAmount;
      if (tdestrect.top < 0) {
        tdestrect.top = 0;
      }
      tSrcRect.top = tSrcRect.height - tdestrect.height;
      tBuffer.copyPixels(tSrc, tdestrect, tSrcRect, propList("useFastQuads", 1, "ink", Symbol.for("copy")));
      tdestrect = tOldDest;
      tdestrect = tdestrect + tRenderOffsetRect;
      tClipAmount = tClipAmount - tRenderOffsetRect.top;
      if (tClipAmount < 0) {
        tClipAmount = 0;
      }
    }
    if ((this.pLandscapePattern <= this.pLandscapePatterns.count) && (this.pLandscapePattern > 0)) {
      let tSrc = getMember(this.pLandscapePatterns[this.pLandscapePattern]).image;
      let tdestrect = rect(0, 0, tBuffer.width, tBuffer.height);
      tBuffer.copyPixels(tSrc, tdestrect, tdestrect, propList("useFastQuads", 1, "ink", 36));
    }
    let tMask = createMask(getMember(this.pLandscapePreviewIdList[2]).image);
    tBuffer.copyPixels(getMember(this.pLandscapePreviewIdList[1]).image, tdestrect, tdestrect, propList("useFastQuads", 1, "ink", Symbol.for("copy"), "maskImage", tMask));
    tBuffer.setAlpha(getMember(this.pLandscapePreviewIdList[3]).image);
    tBuffer.useAlpha = 1;
    tElement.pSprite.member.image = tBuffer;
    tElement.pSprite.member.useAlpha = 1;
    tElement.pSprite.member.regPoint = point(0, 0);
  }

  eventProc(tEvent, tSprID, tProp) {
    if (tEvent == Symbol.for("mouseUp")) {
      if (tSprID == "close") {
        return 0;
      }
    }
    if (tEvent == Symbol.for("mouseDown")) {
      switch (tSprID) {
        case "ctlg_wall_pattern_prev":
          this.setWallPaper("pattern", -1);
          break;
        case "ctlg_wall_pattern_next":
          this.setWallPaper("pattern", 1);
          break;
        case "ctlg_wall_color_prev":
          this.setWallPaper("model", -1);
          break;
        case "ctlg_wall_color_next":
          this.setWallPaper("model", 1);
          break;
        case "ctlg_floor_pattern_prev":
          this.setFloorPattern("pattern", -1);
          break;
        case "ctlg_floor_pattern_next":
          this.setFloorPattern("pattern", 1);
          break;
        case "ctlg_floor_color_prev":
          this.setFloorPattern("model", -1);
          break;
        case "ctlg_floor_color_next":
          this.setFloorPattern("model", 1);
          break;
        case "ctlg_landscape_pattern_prev":
          this.setLandscapePreview("pattern", -1);
          break;
        case "ctlg_landscape_pattern_next":
          this.setLandscapePreview("pattern", 1);
          break;
        case "ctlg_landscape_color_prev":
          this.setLandscapePreview("gradient", -1);
          break;
        case "ctlg_landscape_color_next":
          this.setLandscapePreview("gradient", 1);
          break;
        case "ctlg_buy_wall":
          getThread(Symbol.for("catalogue")).getComponent().checkProductOrder(this.pWallProps);
          break;
        case "ctlg_buy_floor":
          getThread(Symbol.for("catalogue")).getComponent().checkProductOrder(this.pFloorProps);
          break;
        case "ctlg_buy_landscape":
          getThread(Symbol.for("catalogue")).getComponent().checkProductOrder(this.pLandscapeProps);
          break;
        default:
          return 0;
      }
    }
    return 1;
  }
}
