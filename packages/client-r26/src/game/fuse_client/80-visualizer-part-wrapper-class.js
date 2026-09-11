export default class {
  pPartList;
  pImgMemberID;
  pTypeDef;
  pSprite;
  pLocZ;
  pWrapperStatus;
  pOffsets;
  pWrapID;
  pBoundingRect;
  pCapturesEvents;
  pSpriteProps;
  pOwnerID;
  pVisualizerLocZ;
  pBgColor;

  construct() {
    this.pPartList = list();
    this.pWrapperStatus = propList("rendered", 0, "rectOk", 0);
    this.pOffsets = list(0, 0);
    this.pWrapID = "NoID";
    this.pBoundingRect = rect(0, 0, 0, 0);
    this.pCapturesEvents = 0;
    this.pSpriteProps = propList("blend", 100, "ink", 41, "bgColor", rgb(255, 255, 255));
    this.pVisualizerLocZ = 0;
    this.pBgColor = rgb(254, 254, 254);
    return 1;
  }

  deconstruct() {
    this.pPartList = list();
    if (!voidp(this.pImgMemberID)) {
      if (memberExists(this.pImgMemberID)) {
        removeMember(this.pImgMemberID);
      }
    }
    return 1;
  }

  define(tProps) {
    if (ilk(tProps) != Symbol.for("propList")) {
      return error(this, `Not a proplist ${tProps}`, Symbol.for("define"), Symbol.for("major"));
    }
    if (!voidp(tProps[Symbol.for("palette")])) {
      this.pSpriteProps[Symbol.for("palette")] = tProps[Symbol.for("palette")];
    }
    if (!voidp(tProps[Symbol.for("id")])) {
      this.pWrapID = tProps[Symbol.for("id")];
    }
    this.pTypeDef = tProps[Symbol.for("typeDef")];
    this.pOffsets = list(integer(tProps[Symbol.for("offsetx")]), integer(tProps[Symbol.for("offsety")]));
    this.pVisualizerLocZ = integer(tProps[Symbol.for("locZ")]);
    this.pImgMemberID = `VizWrap_${this.pWrapID}_${this.getID()}`;
    this.pWrapperStatus = propList("rendered", 0, "rectOk", 0);
    return 1;
  }

  addPart(tProps) {
    if (ilk(tProps) != Symbol.for("propList")) {
      return error(this, `Not a proplist ${tProps}`, Symbol.for("addPart"), Symbol.for("major"));
    }
    let tPartMember;
    if (!memberExists(tProps[Symbol.for("member")])) {
      const tpartNum = member(abs(getmemnum(tProps[Symbol.for("member")])));
      if (tpartNum > 0) {
        tPartMember = member(tpartNum);
      } else {
        return error(this, `No member found: ${tProps[Symbol.for("member")]}`, Symbol.for("addPart"), Symbol.for("major"));
      }
    } else {
      tPartMember = member(abs(getmemnum(tProps[Symbol.for("member")])));
    }
    const tX1 = tProps[Symbol.for("locH")] + this.pOffsets[1] - tPartMember.regPoint[1];
    const tY1 = tProps[Symbol.for("locV")] + this.pOffsets[2] - tPartMember.regPoint[2];
    const tX2 = tX1 + tProps[Symbol.for("width")];
    const tY2 = tY1 + tProps[Symbol.for("height")];
    tProps[Symbol.for("screenrect")] = rect(tX1, tY1, tX2, tY2);
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    tProps[Symbol.for("class")] = tProps[Symbol.for("member")].item[2];
    the.itemDelimiter = tDelim;
    if (!voidp(tProps[Symbol.for("locZ")])) {
      this.pLocZ = tProps[Symbol.for("locZ")];
    }
    if (!voidp(tProps[Symbol.for("ink")])) {
      this.pSpriteProps[Symbol.for("ink")] = tProps[Symbol.for("ink")];
    }
    if (!voidp(tProps[Symbol.for("blend")])) {
      this.pSpriteProps[Symbol.for("blend")] = tProps[Symbol.for("blend")];
    }
    if (!voidp(tProps[Symbol.for("palette")])) {
      this.pSpriteProps[Symbol.for("palette")] = tProps[Symbol.for("palette")];
    }
    if (this.pCapturesEvents == 0) {
      this.pCapturesEvents = tProps[Symbol.for("catchEvents")];
    }
    this.pPartList.append(tProps);
    this.pWrapperStatus = propList("rendered", 0, "rectOk", 0);
    return 1;
  }

  removePart(tPartId) {
    for (let tPos = 1; tPos <= this.pPartList.count; tPos++) {
      if (this.pPartList[tPos][Symbol.for("id")] == tPartId) {
        this.pPartList.deleteAt(tPos);
        this.pWrapperStatus = propList("rendered", 0, "rectOk", 0);
        break;
      }
    }
    return this.updateWrap();
  }

  setProperty(tProp, tValue) {
    if (voidp(tProp) || voidp(tValue)) {
      return 0;
    }
    switch (tProp) {
      case Symbol.for("sprite"):
        this.setSprite(integer(tValue));
        break;
      case Symbol.for("owner"):
        this.pOwnerID = tValue;
        break;
      case Symbol.for("locZ"):
        this.pLocZ = integer(tValue);
        break;
      case Symbol.for("visLocZ"):
        this.pVisualizerLocZ = integer(tValue);
        break;
      case Symbol.for("blend"):
        this.pSpriteProps[Symbol.for("blend")] = integer(tValue);
        break;
      case Symbol.for("ink"):
        this.pSpriteProps[Symbol.for("ink")] = tValue;
        break;
      case Symbol.for("palette"):
        this.pSpriteProps[Symbol.for("palette")] = tValue;
        break;
    }
    return 1;
  }

  getProperty(tProp) {
    switch (tProp) {
      case Symbol.for("locZ"):
        return this.pLocZ + this.pVisualizerLocZ;
      case Symbol.for("sprite"):
        return this.pSprite;
      case Symbol.for("type"):
        return this.pTypeDef;
      case Symbol.for("id"):
        return this.getID();
      case Symbol.for("imagePntr"):
        return this.getImagePointer();
      case Symbol.for("Active"):
        return this.pCapturesEvents;
      case Symbol.for("blend"):
        return this.pSpriteProps[Symbol.for("blend")];
    }
    return 0;
  }

  fitRectToWall(tRect, tSlope) {
    if (!((this.pTypeDef == Symbol.for("wallleft")) || (this.pTypeDef == Symbol.for("wallright")))) {
      return propList("insideWall", 0);
    }
    const tB = this.getBounds();
    if ((tB[1] > tRect[1]) || (tB[2] > tRect[2]) || (tB[3] < tRect[3]) || (tB[4] < tRect[4])) {
      return propList("insideWall", 0);
    }
    let tHighestPoint;
    let tLowestPoint;
    let tdir;
    if (this.pTypeDef == Symbol.for("wallleft")) {
      tHighestPoint = point(tRect[3], tRect[2]);
      tLowestPoint = point(tRect[1], tRect[4]);
      tSlope = tSlope * -1;
      tdir = "leftwall";
    } else {
      tHighestPoint = point(tRect[1], tRect[2]);
      tLowestPoint = point(tRect[3], tRect[4]);
      tdir = "rightwall";
    }
    let tPartForHighest;
    for (const tPart of this.pPartList) {
      let tSlopeSpace;
      if (this.pTypeDef == Symbol.for("wallleft")) {
        tSlopeSpace = abs(tPart.width * tSlope);
      } else {
        tSlopeSpace = 0;
      }
      const tPartScreenrect = tPart.screenrect;
      if (tHighestPoint.inside(tPartScreenrect)) {
        const tDistX = tHighestPoint[1] - tPartScreenrect[1];
        const tDistY = tDistX * tSlope;
        const tSlopeYAtX = tPartScreenrect[2] + tSlopeSpace + tDistY;
        if (tSlopeYAtX < tHighestPoint[2]) {
          tPartForHighest = tPart;
          break;
        }
      }
    }
    if (voidp(tPartForHighest)) {
      return propList("insideWall", 0);
    }
    let tPartForLowest;
    for (const tPart of this.pPartList) {
      let tSlopeSpace;
      if (this.pTypeDef == Symbol.for("wallleft")) {
        tSlopeSpace = 0;
      } else {
        tSlopeSpace = abs(tPart.width * tSlope);
      }
      const tPartScreenrect = tPart.screenrect;
      if (tLowestPoint.inside(tPartScreenrect)) {
        const tDistX = tLowestPoint[1] - tPartScreenrect[1];
        const tDistY = tDistX * tSlope;
        const tSlopeYAtX = tPartScreenrect[2] + tPart.height - tSlopeSpace + tDistY;
        if (tSlopeYAtX > tLowestPoint[2]) {
          tPartForLowest = tPart;
          break;
        }
      }
    }
    if (voidp(tPartForLowest)) {
      return propList("insideWall", 0);
    }
    let tRePart;
    if (this.pTypeDef == Symbol.for("wallleft")) {
      tRePart = tPartForLowest;
    } else {
      tRePart = tPartForHighest;
    }
    const tPartScreenrect = tRePart.screenrect;
    const tReturnProps = propList();
    tReturnProps[Symbol.for("insideWall")] = 1;
    tReturnProps[Symbol.for("wallLocation")] = point(tRePart.locX, tRePart.locY);
    const tLocalX = tRect[1] - tPartScreenrect[1];
    const tLocalY = tRect[2] - tPartScreenrect[2];
    tReturnProps[Symbol.for("localCoordinate")] = point(tLocalX, tLocalY);
    tReturnProps[Symbol.for("direction")] = tdir;
    tReturnProps[Symbol.for("wallSprites")] = list(this.pSprite);
    return tReturnProps;
  }

  setPartPattern(tPatternType, tPalette, tColor, tWrapType) {
    if (tWrapType != this.pTypeDef) {
      return 0;
    }
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    for (const tPart of this.pPartList) {
      const tMem = tPart[Symbol.for("member")];
      const tClass = `${tMem.item[1]}_${tMem.item[2]}_`;
      const ttype = `${tPatternType}_`;
      const tLayer = `${tMem.item[4]}_`;
      const tObs1 = `${tMem.item[5]}_`;
      const tdir = `${tMem.item[6]}_`;
      const tObs2 = tMem.item[7];
      const tNewMemName = `${tClass}${ttype}${tLayer}${tObs1}${tdir}${tObs2}`;
      if (memberExists(tNewMemName)) {
        tPart[Symbol.for("member")] = tNewMemName;
      }
      this.pSpriteProps[Symbol.for("bgColor")] = tColor;
      this.pSpriteProps[Symbol.for("palette")] = tPalette;
    }
    the.itemDelimiter = tDelim;
    this.pWrapperStatus[Symbol.for("rendered")] = 0;
    return this.updateWrap();
  }

  updateWrap() {
    if (!this.pWrapperStatus[Symbol.for("rendered")]) {
      this.renderImage();
    }
    if (!this.pWrapperStatus[Symbol.for("rectOk")]) {
      this.updateBounds();
    }
    return this.updateSprite();
  }

  getPartAt(tLocX, tLocY) {
    for (const tPart of this.pPartList) {
      if ((tPart[Symbol.for("locX")] == tLocX) && (tPart[Symbol.for("locY")] == tLocY)) {
        const tPartValues = propList();
        tPartValues[Symbol.for("member")] = tPart[Symbol.for("member")];
        tPartValues[Symbol.for("locH")] = tPart[Symbol.for("locH")] + this.pOffsets[1];
        tPartValues[Symbol.for("locV")] = tPart[Symbol.for("locV")] + this.pOffsets[2];
        tPartValues[Symbol.for("locZ")] = this.pLocZ + this.pVisualizerLocZ;
        return tPartValues;
      }
    }
    return 0;
  }

  getBounds() {
    if (!this.pWrapperStatus[Symbol.for("rectOk")]) {
      this.updateBounds();
    }
    return this.pBoundingRect + rect(this.pOffsets[1], this.pOffsets[2], this.pOffsets[1], this.pOffsets[2]);
  }

  renderWithColor(tColor) {
    if (ilk(tColor) == Symbol.for("color")) {
      this.pBgColor = tColor;
      this.renderImage();
    }
  }

  getImagePointer() {
    if (!this.pWrapperStatus[Symbol.for("render")]) {
      this.renderImage();
    }
    return this.pImgMemberID;
  }

  setSprite(tSpr) {
    this.pSprite = sprite(integer(tSpr));
    return 1;
  }

  updateBounds() {
    if (this.pPartList.count == 0) {
      this.pBoundingRect = rect(0, 0, 0, 0);
      this.pWrapperStatus[Symbol.for("rectOk")] = 1;
      return 1;
    }
    const tLocs = propList("X1", list(), "X2", list(), "Y1", list(), "Y2", list());
    for (const tPart of this.pPartList) {
      const tPartMem = member(abs(getmemnum(tPart[Symbol.for("member")])));
      const tX1 = tPart.locH - tPartMem.regPoint[1];
      const tY1 = tPart.locV - tPartMem.regPoint[2];
      tLocs[Symbol.for("X1")].append(tX1);
      tLocs[Symbol.for("Y1")].append(tY1);
      tLocs[Symbol.for("X2")].append(tX1 + tPart.width);
      tLocs[Symbol.for("Y2")].append(tY1 + tPart.height);
    }
    const tMinX1 = min(tLocs[Symbol.for("X1")]);
    const tMaxX2 = max(tLocs[Symbol.for("X2")]);
    const tMinY1 = min(tLocs[Symbol.for("Y1")]);
    const tMaxY2 = max(tLocs[Symbol.for("Y2")]);
    this.pBoundingRect = rect(tMinX1, tMinY1, tMaxX2, tMaxY2);
    this.pWrapperStatus[Symbol.for("rectOk")] = 1;
    return 1;
  }

  updateSprite() {
    if (voidp(this.pSprite)) {
      return 0;
    }
    const tMemNum = getmemnum(this.pImgMemberID);
    if (tMemNum == 0) {
      return 0;
    }
    this.pSprite.member = member(tMemNum);
    this.pSprite.width = member(tMemNum).width;
    this.pSprite.height = member(tMemNum).height;
    this.pSprite.locZ = this.pLocZ + this.pVisualizerLocZ;
    this.pSprite.bgColor = this.pSpriteProps[Symbol.for("bgColor")];
    this.pSprite.ink = this.pSpriteProps[Symbol.for("ink")];
    this.pSprite.blend = this.pSpriteProps[Symbol.for("blend")];
    this.pSprite.loc = point(this.pOffsets[1], this.pOffsets[2]);
    return 1;
  }

  renderImage() {
    if (getmemnum(this.pImgMemberID) < 1) {
      createMember(this.pImgMemberID, Symbol.for("bitmap"));
    }
    const tImgMember = member(getmemnum(this.pImgMemberID));
    const tStageWidth = the.stageRight - the.stageLeft;
    const tStageHeight = the.stageBottom - the.stageTop;
    const tTargetImage = image(tStageWidth, tStageHeight, 32);
    for (const tPart of this.pPartList) {
      const tPartMem = member(getmemnum(tPart[Symbol.for("member")]));
      const tPalette = this.pSpriteProps[Symbol.for("palette")];
      if (ilk(tPalette) == Symbol.for("symbol")) {
        tPartMem.paletteRef = tPalette;
      } else {
        tPartMem.palette = member(getmemnum(tPalette));
      }
      let tPartRectX1 = tPart[Symbol.for("locH")] - tPartMem.regPoint[1];
      let tPartRectY1 = tPart[Symbol.for("locV")] - tPartMem.regPoint[2];
      let tPartRectX2 = tPartRectX1 + tPart[Symbol.for("width")];
      let tPartRectY2 = tPartRectY1 + tPart[Symbol.for("height")];
      let tSourceImage = tPartMem.image;
      if (tPart[Symbol.for("flipH")]) {
        const tImage = image(tSourceImage.width, tSourceImage.height, tSourceImage.depth, tSourceImage.paletteRef);
        const tQuad = list(point(tSourceImage.width, 0), point(0, 0), point(0, tSourceImage.height), point(tSourceImage.width, tSourceImage.height));
        tImage.copyPixels(tSourceImage, tQuad, tSourceImage.rect);
        tSourceImage = tImage;
        tPartRectX1 = tPartRectX1 - tSourceImage.width;
        tPartRectX2 = tPartRectX2 - tSourceImage.width;
      }
      if (tPart[Symbol.for("multiflip")]) {
        const tImage = image(tSourceImage.width, tSourceImage.height, tSourceImage.depth, tSourceImage.paletteRef);
        const tQuad = list(point(tSourceImage.width, 0), point(0, 0), point(0, tSourceImage.height), point(tSourceImage.width, tSourceImage.height));
        tImage.copyPixels(tSourceImage, tQuad, tSourceImage.rect);
        tSourceImage = tImage;
        tPartRectX1 = tPart[Symbol.for("locH")] + tPart[Symbol.for("offsetx")] - (tPartMem.regPoint[1] * -1) - tSourceImage.width;
        tPartRectX2 = tPartRectX1 + tSourceImage.width;
        tPartRectY1 = tPart[Symbol.for("locV")] - tPartMem.regPoint[2];
        tPartRectY2 = tPartRectY1 + tSourceImage.height;
      }
      const tPartRect = rect(tPartRectX1, tPartRectY1, tPartRectX2, tPartRectY2);
      const tMatte = tSourceImage.createMatte();
      const tBgColor = this.pBgColor;
      tTargetImage.copyPixels(tSourceImage, tPartRect, tSourceImage.rect, propList("maskImage", tMatte, "ink", 41, "bgColor", tBgColor));
    }
    tImgMember.image = tTargetImage;
    tImgMember.regPoint = point(0, 0);
    this.pWrapperStatus[Symbol.for("rendered")] = 1;
    return 1;
  }
}
