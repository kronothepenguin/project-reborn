export default class {
  pImageWidth;
  pImageHeight;
  pCellWidth;
  pCellHeight;
  pwidth;
  pheight;
  pMarginLeft;
  pMarginRight;
  pMarginTop;
  pMarginBottom;
  pNumberPosX;
  pNumberPosY;
  pDealList;
  pCountWriterID;
  pAlign;

  construct() {
    this.pCellWidth = getVariable("catalogue.deal.cellwidth");
    this.pCellHeight = getVariable("catalogue.deal.cellheight");
    this.pwidth = getVariable("catalogue.deal.gridwidth");
    this.pheight = getVariable("catalogue.deal.gridheight");
    this.pNumberPosX = getVariable("catalogue.deal.numberpos.x");
    this.pNumberPosY = getVariable("catalogue.deal.numberpos.y");
    this.pMarginLeft = getVariable("catalogue.deal.margin.left");
    this.pMarginRight = getVariable("catalogue.deal.margin.right");
    this.pMarginTop = getVariable("catalogue.deal.margin.top");
    this.pMarginBottom = getVariable("catalogue.deal.margin.bottom");
    this.pAlign = 1;
    let tAlign = getVariable("catalogue.deal.number.align");
    if (tAlign == "left") {
      this.pAlign = 0;
    } else if (tAlign == "right") {
      this.pAlign = 2;
    }
    this.pDealList = propList();
    this.pCountWriterID = getUniqueID();
    let tBold = getStructVariable("struct.font.bold");
    let tMetrics = propList("font", tBold.getaProp(Symbol.for("font")), "fontStyle", tBold.getaProp(Symbol.for("fontStyle")), "color", rgb("#FFFFCC"));
    createWriter(this.pCountWriterID, tMetrics);
    return 1;
  }

  deconstruct() {
    this.pDealList = propList();
    removeWriter(this.pCountWriterID);
    return 1;
  }

  define(tDealList, tCellWidth, tCellHeight, tWidth, tHeight, tNumberPosX, tNumberPosY) {
    this.pDealList = tDealList.duplicate();
    if (integerp(tCellWidth)) {
      this.pCellWidth = tCellWidth;
    }
    if (integerp(tCellHeight)) {
      this.pCellHeight = tCellHeight;
    }
    if (integerp(tWidth)) {
      this.pwidth = tWidth;
    }
    if (integerp(tHeight)) {
      this.pheight = tHeight;
    }
    if (integerp(tNumberPosX)) {
      this.pNumberPosX = tNumberPosX;
    }
    if (integerp(tNumberPosY)) {
      this.pNumberPosY = tNumberPosY;
    }
    if (this.pwidth < 1) {
      this.pwidth = 1;
    }
    if (this.pheight < 1) {
      this.pheight = 1;
    }
    this.pImageWidth = (this.pwidth * this.pCellWidth) + 1 + this.pMarginLeft + this.pMarginRight;
    this.pImageHeight = (this.pheight * this.pCellHeight) + 1 + this.pMarginTop + this.pMarginBottom;
    return 1;
  }

  getPicture(tImg) {
    let tCanvas = this.drawBackground();
    let tLimit = this.pDealList.count();
    if ((this.pheight * this.pwidth) < tLimit) {
      tLimit = this.pheight * this.pwidth;
    }
    for (let i = tLimit; i >= 1; i--) {
      if (voidp(this.pDealList[i]["class"])) {
        return error(this, "class property missing", Symbol.for("showPreviewImage"), Symbol.for("minor"));
        continue;
      }
      let tClass = this.pDealList[i]["class"];
      let tpartColors = this.pDealList[i]["partColors"];
      let tCount = this.pDealList[i]["count"];
      let tmember = this.getImage(tClass);
      let tRenderedImage;
      if (tmember != 0) {
        if (!voidp(tClass) && !voidp(tpartColors)) {
          tRenderedImage = getObject("Preview_renderer").renderPreviewImage(VOID, VOID, tpartColors, tClass);
        } else {
          tRenderedImage = member(tmember).image;
        }
        this.drawItem(tCanvas, tRenderedImage, i, tCount);
      }
    }
    if (voidp(tImg)) {
      tImg = tCanvas;
    } else {
      let tdestrect = tImg.rect - tCanvas.rect;
      tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tCanvas.width + (tdestrect.width / 2), (tdestrect.height / 2) + tCanvas.height);
      tImg.copyPixels(tCanvas, tdestrect, tCanvas.rect, propList("ink", 36));
    }
    return tImg.trimWhiteSpace();
  }

  renderDealPreviewImage(tDealNumber, tDealList, tWidth, tHeight) {
    let tRenderedImage;
    if (tDealList.count > 1) {
      let tmember = "ctlg_pic_deal_icon_narrow";
      if (memberExists(tmember)) {
        let tMem = member(getmemnum(tmember));
        tRenderedImage = image(tMem.width, tMem.height, 32);
        tRenderedImage.copyPixels(tMem.image, tMem.rect, tMem.rect);
        let tWriteObj = getWriter(this.pCountWriterID);
        let tCountImg = tWriteObj.render(string(tDealNumber));
        let tCountImgTrimmed = image(tCountImg.width, tCountImg.height, 32);
        tCountImgTrimmed.copyPixels(tCountImg, tCountImg.rect, tCountImg.rect, propList("ink", 36));
        tCountImgTrimmed = tCountImgTrimmed.trimWhiteSpace();
        let tNumberWd = tCountImgTrimmed.rect[3] - tCountImgTrimmed.rect[1];
        let tNumberHt = tCountImgTrimmed.rect[4] - tCountImgTrimmed.rect[2];
        let tOffsetRect = rect(20 - ((tNumberWd + 1) / 2), 20 - ((tNumberHt + 1) / 2), 20 - ((tNumberWd + 1) / 2), 20 - ((tNumberHt + 1) / 2));
        tRenderedImage.copyPixels(tCountImg, tCountImg.rect + tOffsetRect, tCountImg.rect, propList("ink", 36));
      } else {
        tRenderedImage = image(1, 1, 32);
      }
    } else {
      let tpartColors = tDealList[1][Symbol.for("partColors")];
      let tClass = tDealList[1][Symbol.for("class")];
      let tCount = tDealList[1][Symbol.for("count")];
      let tBackgroundImage = image(tWidth, tHeight, 32);
      tRenderedImage = getObject("Preview_renderer").renderPreviewImage(VOID, VOID, tpartColors, tClass);
      let tRenderWd = tRenderedImage.rect[3] - tRenderedImage.rect[1];
      let tRenderHt = tRenderedImage.rect[4] - tRenderedImage.rect[2];
      let tOffsetRect = rect((tWidth - tRenderWd) / 2, min(8, tHeight - tRenderHt), (tWidth - tRenderWd) / 2, min(8, tHeight - tRenderHt));
      tBackgroundImage.copyPixels(tRenderedImage, tRenderedImage.rect + tOffsetRect, tRenderedImage.rect, propList("ink", 36));
      let tCountImg = this.getNumberImage(tCount);
      tOffsetRect = rect(2, 0, 2, 0);
      tBackgroundImage.copyPixels(tCountImg, tCountImg.rect + tOffsetRect, tCountImg.rect, propList("ink", 36));
      tRenderedImage = tBackgroundImage.trimWhiteSpace();
    }
    return tRenderedImage;
  }

  drawBackground() {
    let tCanvas = image(this.pImageWidth, this.pImageHeight, 32);
    let tFlipFlag = 0;
    if (memberExists("ctlg_dyndeal_background")) {
      let tImage = member(getmemnum("ctlg_dyndeal_background")).image;
      tCanvas.copyPixels(tImage, tImage.rect, tImage.rect);
    }
    return tCanvas;
  }

  drawItem(tCanvas, tImage, tIndex, tCount) {
    let tX = (((tIndex - 1) % this.pwidth) * this.pCellWidth) + this.pMarginLeft;
    let tY = (((tIndex - 1) / this.pwidth) * this.pCellHeight) + this.pMarginTop;
    let tCenteredX = tX + ((this.pCellWidth - (tImage.rect[3] - tImage.rect[1])) / 2);
    let tCenteredY = tY + ((this.pCellHeight - (tImage.rect[4] - tImage.rect[2])) / 2);
    tCanvas.copyPixels(tImage, tImage.rect + rect(tCenteredX, tCenteredY, tCenteredX, tCenteredY), tImage.rect, propList("ink", 36));
    if (tCount > 1) {
      let tCountImg = this.getNumberImage(tCount);
      tCenteredX = tX + this.pNumberPosX - ((tCountImg.rect[3] - tCountImg.rect[1]) / 2);
      tCenteredY = tY + this.pNumberPosY - ((tCountImg.rect[4] - tCountImg.rect[2]) / 2);
      if (this.pAlign == 0) {
        tCenteredX = tX + this.pNumberPosX;
      } else if (this.pAlign == 2) {
        tCenteredX = tX + this.pNumberPosX - (tCountImg.rect[3] - tCountImg.rect[1]);
      }
      tCanvas.copyPixels(tCountImg, tCountImg.rect + rect(tCenteredX, tCenteredY, tCenteredX, tCenteredY), tCountImg.rect, propList("ink", 36));
    }
  }

  getImage(tClass) {
    if (!voidp(tClass)) {
      if (tClass.contains("*")) {
        let tSmallMem = `${tClass}_small`;
        tClass = tClass.char[`${1}..${offset("*", tClass) - 1}`];
        if (!memberExists(tSmallMem)) {
          tSmallMem = `${tClass}_small`;
        }
      } else {
        let tSmallMem = `${tClass}_small`;
      }
      if (memberExists(tSmallMem)) {
        return getmemnum(tSmallMem);
      }
    }
    return getmemnum("no_icon_small");
  }

  getNumberImage(tNumber) {
    let tCountImg = image(80, 20, 32);
    let tTemp = integer(tNumber);
    let tDigit = list();
    for (let i = 1; i <= 2; i++) {
      tDigit[i] = tTemp % 10;
      tTemp = (tTemp - tDigit[i]) / 10;
    }
    let tstart = 0;
    let tWidth = 0;
    for (let i = 2; i >= 1; i--) {
      if (tDigit[i] == 0) {
        tDigit[i] = -1;
        continue;
      }
      tWidth = tWidth + (i - 1);
      break;
    }
    let tDigitImg = list();
    for (let i = 1; i <= 2; i++) {
      if (memberExists(`${"ctlg_dyndeal_"}${string(tDigit[i])}`)) {
        tDigitImg[i] = member(getmemnum(`${"ctlg_dyndeal_"}${string(tDigit[i])}`)).image;
        tWidth = tWidth + (tDigitImg[i].rect[3] - tDigitImg[i].rect[1]);
        continue;
      }
      tDigitImg[i] = VOID;
    }
    if (memberExists("ctlg_dyndeal_button_left")) {
      let tImage = member(getmemnum("ctlg_dyndeal_button_left")).image;
      tCountImg.copyPixels(tImage, tImage.rect, tImage.rect);
      tstart = tImage.rect[3] - tImage.rect[1];
    }
    if (memberExists("ctlg_dyndeal_button_center")) {
      let tImage = member(getmemnum("ctlg_dyndeal_button_center")).image;
      for (let i = tstart; i <= tstart + tWidth; i++) {
        tCountImg.copyPixels(tImage, tImage.rect + rect(i, 0, i, 0), tImage.rect);
      }
    }
    if (memberExists("ctlg_dyndeal_button_right")) {
      let tImage = member(getmemnum("ctlg_dyndeal_button_right")).image;
      tCountImg.copyPixels(tImage, tImage.rect + rect(tstart + tWidth + 1, 0, tstart + tWidth + 1, 0), tImage.rect);
    }
    for (let i = 2; i >= 1; i--) {
      if (!voidp(tDigitImg[i])) {
        tCountImg.copyPixels(tDigitImg[i], tDigitImg[i].rect + rect(tstart + 2, 3, tstart + 2, 3), tDigitImg[i].rect, propList("ink", 36));
        tstart = tstart + (tDigitImg[i].rect[3] - tDigitImg[i].rect[1]) + 1;
      }
    }
    return tCountImg.trimWhiteSpace();
  }
}
