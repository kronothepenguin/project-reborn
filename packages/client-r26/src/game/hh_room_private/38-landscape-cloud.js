export default class {
  pLoc;
  pType;
  pTurnPointList;
  pNextTurnPointH;
  pLastTurnPoint;
  pOffsetV;
  pCurrentSide;
  pImageLeft;
  pImageRight;
  pMatteLeft;
  pMatteRight;
  pSkip;
  pNeedsAdjustV;
  pTypeAdjusts;
  pLandscapeType;
  pWallHeight;

  construct() {
    this.pSkip = 0;
    this.pTypeAdjusts = propList();
    this.pTypeAdjusts["0"] = propList();
    this.pTypeAdjusts["1"] = propList();
    this.pTypeAdjusts["2"] = propList();
    this.pTypeAdjusts["0"][Symbol.for("turnOffV")] = 10;
    this.pTypeAdjusts["1"][Symbol.for("turnOffV")] = 12;
    this.pTypeAdjusts["2"][Symbol.for("turnOffV")] = 6;
    this.pTypeAdjusts["0"][Symbol.for("adjustV")] = 18;
    this.pTypeAdjusts["1"][Symbol.for("adjustV")] = 11;
    this.pTypeAdjusts["2"][Symbol.for("adjustV")] = 7;
    return 1;
  }

  deconstruct() {
    return 1;
  }

  define(tProps) {
    this.pType = string(tProps.getaProp(Symbol.for("type")));
    this.pTurnPointList = tProps.getaProp(Symbol.for("turnPointList"));
    this.pWallHeight = tProps.getaProp(Symbol.for("wallheight"));
    this.pLandscapeType = tProps.getaProp(Symbol.for("landscape"));
    const tMemberId = tProps.getaProp(Symbol.for("memberid"));
    if (voidp(this.pLandscapeType)) {
      this.pLandscapeType = "landscape";
    }
    let tMemNum = getmemnum(`${tMemberId}${this.pType}_left`);
    if (tMemNum == 0) {
      return error(this, `${"Cloud graphic not found:"} ${tMemberId}${this.pType}_left`, Symbol.for("define"));
    }
    this.pImageLeft = member(tMemNum).image.duplicate();
    tMemNum = getmemnum(`${tMemberId}${this.pType}_right`);
    if (tMemNum == 0) {
      return error(this, `${"Cloud graphic not found:"} ${tMemberId}${this.pType}_right`, Symbol.for("define"));
    }
    this.pImageRight = member(tMemNum).image.duplicate();
    this.pMatteLeft = this.pImageLeft.createMatte();
    this.pMatteRight = this.pImageRight.createMatte();
    this.randomizeLoc(0);
    return 1;
  }

  saveNextTurnPoint() {
    if (this.pTurnPointList == VOID) {
      return 0;
    }
    const tLocH = this.pLoc[1];
    for (let i = 1; i <= this.pTurnPointList.count; i++) {
      const tpoint = this.pTurnPointList.getPropAt(i);
      const tTurnH = tpoint.locH;
      if ((tTurnH > tLocH) && (this.pCurrentSide != this.pTurnPointList[i])) {
        this.pNextTurnPointH = tTurnH;
        return tTurnH;
        continue;
      }
      this.pLastTurnPoint = tpoint;
      this.pCurrentSide = this.pTurnPointList[i];
    }
    this.pNextTurnPointH = 0;
    return 0;
  }

  getLocV(tLocH) {
    let tLocV;
    if (this.pCurrentSide == Symbol.for("left")) {
      tLocV = this.pLastTurnPoint.locV + ((this.pLastTurnPoint.locH - tLocH) / 2);
    } else {
      tLocV = this.pLastTurnPoint.locV + ((tLocH - this.pLastTurnPoint.locH) / 2);
    }
    return tLocV + this.pOffsetV;
  }

  randomizeLoc(tAlignToLeft) {
    let tLocX;
    if (tAlignToLeft) {
      tLocX = random(100) - 150;
    } else {
      tLocX = random(the.stageRight - the.stageLeft);
    }
    if ((tLocX % 2) == 1) {
      tLocX = tLocX + 1;
    }
    this.pCurrentSide = Symbol.for("left");
    this.pOffsetV = random(this.pWallHeight - (2 * this.pImageLeft.height)) + this.pImageLeft.height;
    this.pLoc = point(tLocX, 0);
    this.saveNextTurnPoint();
    const tLocY = this.getLocV(tLocX);
    this.pLoc = point(tLocX, tLocY);
  }

  updateAnim() {
    this.pLoc[1] = this.pLoc[1] + 1;
    this.pLoc[2] = this.getLocV(this.pLoc[1]);
    if (this.pLoc[1] > the.stage.rect.width) {
      this.randomizeLoc(1);
    }
  }

  render(tImage) {
    let tSourceImage;
    let tSourceRect;
    let tMatte;
    if (((this.pLoc[1] + this.pImageLeft.width) < this.pNextTurnPointH) || (this.pNextTurnPointH == 0)) {
      if (this.pCurrentSide == Symbol.for("left")) {
        tSourceImage = this.pImageLeft;
        tSourceRect = tSourceImage.rect;
        tMatte = this.pMatteLeft;
      } else {
        tSourceImage = this.pImageRight;
        tSourceRect = tSourceImage.rect + rect(0, this.pTypeAdjusts[this.pType][Symbol.for("adjustV")], 0, this.pTypeAdjusts[this.pType][Symbol.for("adjustV")]);
        tMatte = this.pMatteRight;
      }
    } else {
      if (this.pLoc[1] < this.pNextTurnPointH) {
        if (this.pCurrentSide == Symbol.for("left")) {
          tSourceImage = image(this.pImageLeft.width, this.pImageLeft.height * 2, 8);
          tSourceImage.copyPixels(this.pImageLeft, this.pImageLeft.rect, this.pImageLeft.rect);
          const tWidthLeft = this.pNextTurnPointH - this.pLoc[1];
          tSourceImage.fill(tWidthLeft, 0, tSourceImage.width, tSourceImage.height, color(255, 255, 255));
          const tWidthRight = this.pImageLeft.width - tWidthLeft;
          const tOffV = tWidthRight - this.pImageRight.height + this.pTypeAdjusts[this.pType][Symbol.for("turnOffV")];
          const tRightSourceRect = rect(tWidthLeft, 0, this.pImageRight.width, this.pImageRight.height);
          const tRightTargetRect = tRightSourceRect + rect(0, tOffV, 0, tOffV);
          tSourceImage.copyPixels(this.pImageRight, tRightTargetRect, tRightSourceRect);
        } else {
          tSourceImage = image(this.pImageRight.width, this.pImageRight.height * 2, 8);
          const tWidthRight = this.pNextTurnPointH - this.pLoc[1];
          const tWidthLeft = this.pImageLeft.width - tWidthRight;
          let tOffV = this.pImageRight.height / 2;
          let tSourceRectLocal = rect(0, 0, tWidthRight, this.pImageRight.height);
          const tTargetRect = tSourceRectLocal + rect(0, tOffV, 0, tOffV);
          tSourceImage.copyPixels(this.pImageRight, tTargetRect, tSourceRectLocal);
          tOffV = tWidthRight;
          tSourceRectLocal = rect(tWidthRight, 0, this.pImageLeft.width, this.pImageLeft.height);
          tSourceImage.copyPixels(this.pImageLeft, tTargetRect, tSourceRectLocal);
        }
        tSourceRect = tSourceImage.rect;
        tMatte = tSourceImage.createMatte();
      } else {
        this.saveNextTurnPoint();
        return this.render(tImage);
      }
    }
    const tTargetRect = tSourceRect + rect(this.pLoc[1], this.pLoc[2], this.pLoc[1], this.pLoc[2]);
    tImage.copyPixels(tSourceImage, tTargetRect, tSourceImage.rect, propList(Symbol.for("maskImage"), tMatte));
  }
}
