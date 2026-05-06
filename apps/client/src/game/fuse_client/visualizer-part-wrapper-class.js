import {
  getmemnum,
  image,
  ilk,
  integer,
  list,
  member,
  point,
  rect,
  rgb,
  sprite,
  the,
  VOID,
  voidp,
} from "../../director";

export default function () {
  return {
    pPartList: VOID,
    pImgMemberID: VOID,
    pTypeDef: VOID,
    pSprite: VOID,
    pLocZ: VOID,
    pWrapperStatus: VOID,
    pOffsets: VOID,
    pWrapID: VOID,
    pBoundingRect: VOID,
    pCapturesEvents: VOID,
    pSpriteProps: VOID,
    pOwnerID: VOID,
    pVisualizerLocZ: VOID,
    pBgColor: VOID,

    construct() {
      this.pPartList = list();
      this.pWrapperStatus = { [Symbol.for("rendered")]: 0, [Symbol.for("rectOk")]: 0 };
      this.pOffsets = [0, 0];
      this.pWrapID = "NoID";
      this.pBoundingRect = rect(0, 0, 0, 0);
      this.pCapturesEvents = 0;
      this.pSpriteProps = { [Symbol.for("blend")]: 100, [Symbol.for("ink")]: 41, [Symbol.for("bgColor")]: rgb(255, 255, 255) };
      this.pVisualizerLocZ = 0;
      this.pBgColor = rgb(254, 254, 254);
      return 1;
    },

    deconstruct() {
      this.pPartList = list();
      if (!voidp(this.pImgMemberID)) {
        if (_director.memberExists(this.pImgMemberID)) {
          _director.removeMember(this.pImgMemberID);
        }
      }
      return 1;
    },

    define(tProps) {
      if (ilk(tProps) !== Symbol.for("propList")) {
        return _director.error(this, "Not a proplist" + " " + tProps, Symbol.for("define"), Symbol.for("major"));
      }
      if (!voidp(tProps[Symbol.for("palette")])) {
        this.pSpriteProps[Symbol.for("palette")] = tProps[Symbol.for("palette")];
      }
      if (!voidp(tProps[Symbol.for("id")])) {
        this.pWrapID = tProps[Symbol.for("id")];
      }
      this.pTypeDef = tProps[Symbol.for("typeDef")];
      this.pOffsets = [integer(tProps[Symbol.for("offsetx")]), integer(tProps[Symbol.for("offsety")])];
      this.pVisualizerLocZ = integer(tProps[Symbol.for("locZ")]);
      this.pImgMemberID = "VizWrap_" + this.pWrapID + "_" + this.getID();
      this.pWrapperStatus = { [Symbol.for("rendered")]: 0, [Symbol.for("rectOk")]: 0 };
      return 1;
    },

    addPart(tProps) {
      let tpartNum, tPartMember, tX1, tY1, tX2, tY2, tDelim;

      if (ilk(tProps) !== Symbol.for("propList")) {
        return _director.error(this, "Not a proplist" + " " + tProps, Symbol.for("addPart"), Symbol.for("major"));
      }
      if (!_director.memberExists(tProps[Symbol.for("member")])) {
        tpartNum = member(Math.abs(getmemnum(tProps[Symbol.for("member")])));
        if (tpartNum > 0) {
          tPartMember = member(tpartNum);
        } else {
          return _director.error(this, "No member found: " + tProps[Symbol.for("member")], Symbol.for("addPart"), Symbol.for("major"));
        }
      } else {
        tPartMember = member(Math.abs(getmemnum(tProps[Symbol.for("member")])));
      }
      tX1 = tProps[Symbol.for("locH")] + this.pOffsets[0] - tPartMember.regPoint[0];
      tY1 = tProps[Symbol.for("locV")] + this.pOffsets[1] - tPartMember.regPoint[1];
      tX2 = tX1 + tProps[Symbol.for("width")];
      tY2 = tY1 + tProps[Symbol.for("height")];
      tProps[Symbol.for("screenrect")] = rect(tX1, tY1, tX2, tY2);
      tDelim = the.itemDelimiter;
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
      if (this.pCapturesEvents === 0) {
        this.pCapturesEvents = tProps[Symbol.for("catchEvents")];
      }
      this.pPartList.append(tProps);
      this.pWrapperStatus = { [Symbol.for("rendered")]: 0, [Symbol.for("rectOk")]: 0 };
      return 1;
    },

    removePart(tPartId) {
      for (let tPos = 1; tPos <= this.pPartList.count; tPos++) {
        if (this.pPartList[tPos][Symbol.for("id")] === tPartId) {
          this.pPartList.deleteAt(tPos);
          this.pWrapperStatus = { [Symbol.for("rendered")]: 0, [Symbol.for("rectOk")]: 0 };
          break;
        }
      }
      return this.updateWrap();
    },

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
    },

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
    },

    fitRectToWall(tRect, tSlope) {
      let tB, tHighestPoint, tLowestPoint, tdir, tSlopeSpace, tPartScreenrect, tDistX, tDistY, tSlopeYAtX, tPartForHighest, tPartForLowest, tRePart, tLocalX, tLocalY, tReturnProps;

      if (!((this.pTypeDef === Symbol.for("wallleft")) || (this.pTypeDef === Symbol.for("wallright")))) {
        return { [Symbol.for("insideWall")]: 0 };
      }
      tB = this.getBounds();
      if ((tB[0] > tRect[0]) || (tB[1] > tRect[1]) || (tB[2] < tRect[2]) || (tB[3] < tRect[3])) {
        return { [Symbol.for("insideWall")]: 0 };
      }
      if (this.pTypeDef === Symbol.for("wallleft")) {
        tHighestPoint = point(tRect[2], tRect[1]);
        tLowestPoint = point(tRect[0], tRect[3]);
        tSlope = tSlope * -1;
        tdir = "leftwall";
      } else {
        tHighestPoint = point(tRect[0], tRect[1]);
        tLowestPoint = point(tRect[2], tRect[3]);
        tdir = "rightwall";
      }
      for (const tPart of this.pPartList) {
        if (this.pTypeDef === Symbol.for("wallleft")) {
          tSlopeSpace = Math.abs(tPart.width * tSlope);
        } else {
          tSlopeSpace = 0;
        }
        tPartScreenrect = tPart.screenrect;
        if (tHighestPoint.inside(tPartScreenrect)) {
          tDistX = tHighestPoint[0] - tPartScreenrect[0];
          tDistY = tDistX * tSlope;
          tSlopeYAtX = tPartScreenrect[1] + tSlopeSpace + tDistY;
          if (tSlopeYAtX < tHighestPoint[1]) {
            tPartForHighest = tPart;
            break;
          }
        }
      }
      if (voidp(tPartForHighest)) {
        return { [Symbol.for("insideWall")]: 0 };
      }
      for (const tPart of this.pPartList) {
        if (this.pTypeDef === Symbol.for("wallleft")) {
          tSlopeSpace = 0;
        } else {
          tSlopeSpace = Math.abs(tPart.width * tSlope);
        }
        tPartScreenrect = tPart.screenrect;
        if (tLowestPoint.inside(tPartScreenrect)) {
          tDistX = tLowestPoint[0] - tPartScreenrect[0];
          tDistY = tDistX * tSlope;
          tSlopeYAtX = tPartScreenrect[1] + tPart.height - tSlopeSpace + tDistY;
          if (tSlopeYAtX > tLowestPoint[1]) {
            tPartForLowest = tPart;
            break;
          }
        }
      }
      if (voidp(tPartForLowest)) {
        return { [Symbol.for("insideWall")]: 0 };
      }
      if (this.pTypeDef === Symbol.for("wallleft")) {
        tRePart = tPartForLowest;
      } else {
        tRePart = tPartForHighest;
      }
      tPartScreenrect = tRePart.screenrect;
      tReturnProps = {};
      tReturnProps[Symbol.for("insideWall")] = 1;
      tReturnProps[Symbol.for("wallLocation")] = point(tRePart.locX, tRePart.locY);
      tLocalX = tRect[0] - tPartScreenrect[0];
      tLocalY = tRect[1] - tPartScreenrect[1];
      tReturnProps[Symbol.for("localCoordinate")] = point(tLocalX, tLocalY);
      tReturnProps[Symbol.for("direction")] = tdir;
      tReturnProps[Symbol.for("wallSprites")] = [this.pSprite];
      return tReturnProps;
    },

    setPartPattern(tPatternType, tPalette, tColor, tWrapType) {
      let tDelim, tMem, tClass, ttype, tLayer, tObs1, tdir, tObs2, tNewMemName;

      if (tWrapType !== this.pTypeDef) {
        return 0;
      }
      tDelim = the.itemDelimiter;
      the.itemDelimiter = "_";
      for (const tPart of this.pPartList) {
        tMem = tPart[Symbol.for("member")];
        tClass = tMem.item[0] + "_" + tMem.item[1] + "_";
        ttype = tPatternType + "_";
        tLayer = tMem.item[3] + "_";
        tObs1 = tMem.item[4] + "_";
        tdir = tMem.item[5] + "_";
        tObs2 = tMem.item[6];
        tNewMemName = tClass + ttype + tLayer + tObs1 + tdir + tObs2;
        if (_director.memberExists(tNewMemName)) {
          tPart[Symbol.for("member")] = tNewMemName;
        }
        this.pSpriteProps[Symbol.for("bgColor")] = tColor;
        this.pSpriteProps[Symbol.for("palette")] = tPalette;
      }
      the.itemDelimiter = tDelim;
      this.pWrapperStatus[Symbol.for("rendered")] = 0;
      return this.updateWrap();
    },

    updateWrap() {
      if (!this.pWrapperStatus[Symbol.for("rendered")]) {
        this.renderImage();
      }
      if (!this.pWrapperStatus[Symbol.for("rectOk")]) {
        this.updateBounds();
      }
      return this.updateSprite();
    },

    getPartAt(tLocX, tLocY) {
      let tPartValues;

      for (const tPart of this.pPartList) {
        if ((tPart[Symbol.for("locX")] === tLocX) && (tPart[Symbol.for("locY")] === tLocY)) {
          tPartValues = {};
          tPartValues[Symbol.for("member")] = tPart[Symbol.for("member")];
          tPartValues[Symbol.for("locH")] = tPart[Symbol.for("locH")] + this.pOffsets[0];
          tPartValues[Symbol.for("locV")] = tPart[Symbol.for("locV")] + this.pOffsets[1];
          tPartValues[Symbol.for("locZ")] = this.pLocZ + this.pVisualizerLocZ;
          return tPartValues;
        }
      }
      return 0;
    },

    getBounds() {
      if (!this.pWrapperStatus[Symbol.for("rectOk")]) {
        this.updateBounds();
      }
      return this.pBoundingRect.add(rect(this.pOffsets[0], this.pOffsets[1], this.pOffsets[0], this.pOffsets[1]));
    },

    renderWithColor(tColor) {
      if (ilk(tColor) === Symbol.for("color")) {
        this.pBgColor = tColor;
        this.renderImage();
      }
    },

    getImagePointer() {
      if (!this.pWrapperStatus[Symbol.for("render")]) {
        this.renderImage();
      }
      return this.pImgMemberID;
    },

    setSprite(tSpr) {
      this.pSprite = sprite(integer(tSpr));
      return 1;
    },

    updateBounds() {
      let tLocs, tPartMem, tX1, tY1, tMinX1, tMaxX2, tMinY1, tMaxY2;

      if (this.pPartList.count === 0) {
        this.pBoundingRect = rect(0, 0, 0, 0);
        this.pWrapperStatus[Symbol.for("rectOk")] = 1;
        return 1;
      }
      tLocs = { [Symbol.for("X1")]: list(), [Symbol.for("X2")]: list(), [Symbol.for("Y1")]: list(), [Symbol.for("Y2")]: list() };
      for (const tPart of this.pPartList) {
        tPartMem = member(Math.abs(getmemnum(tPart[Symbol.for("member")])));
        tX1 = tPart.locH - tPartMem.regPoint[0];
        tY1 = tPart.locV - tPartMem.regPoint[1];
        tLocs[Symbol.for("X1")].append(tX1);
        tLocs[Symbol.for("Y1")].append(tY1);
        tLocs[Symbol.for("X2")].append(tX1 + tPart.width);
        tLocs[Symbol.for("Y2")].append(tY1 + tPart.height);
      }
      tMinX1 = Math.min(...tLocs[Symbol.for("X1")]);
      tMaxX2 = Math.max(...tLocs[Symbol.for("X2")]);
      tMinY1 = Math.min(...tLocs[Symbol.for("Y1")]);
      tMaxY2 = Math.max(...tLocs[Symbol.for("Y2")]);
      this.pBoundingRect = rect(tMinX1, tMinY1, tMaxX2, tMaxY2);
      this.pWrapperStatus[Symbol.for("rectOk")] = 1;
      return 1;
    },

    updateSprite() {
      let tMemNum;

      if (voidp(this.pSprite)) {
        return 0;
      }
      tMemNum = getmemnum(this.pImgMemberID);
      if (tMemNum === 0) {
        return 0;
      }
      this.pSprite.member = member(tMemNum);
      this.pSprite.width = member(tMemNum).width;
      this.pSprite.height = member(tMemNum).height;
      this.pSprite.locZ = this.pLocZ + this.pVisualizerLocZ;
      this.pSprite.bgColor = this.pSpriteProps[Symbol.for("bgColor")];
      this.pSprite.ink = this.pSpriteProps[Symbol.for("ink")];
      this.pSprite.blend = this.pSpriteProps[Symbol.for("blend")];
      this.pSprite.loc = point(this.pOffsets[0], this.pOffsets[1]);
      return 1;
    },

    renderImage() {
      let tImgMember, tStageWidth, tStageHeight, tTargetImage, tPartMem, tPalette, tPartRectX1, tPartRectY1, tPartRectX2, tPartRectY2, tSourceImage, tImage, tQuad, tPartRect, tMatte, tBgColor;

      if (getmemnum(this.pImgMemberID) < 1) {
        _director.createMember(this.pImgMemberID, Symbol.for("bitmap"));
      }
      tImgMember = member(getmemnum(this.pImgMemberID));
      tStageWidth = the.stageRight - the.stageLeft;
      tStageHeight = the.stageBottom - the.stageTop;
      tTargetImage = image(tStageWidth, tStageHeight, 32);
      for (const tPart of this.pPartList) {
        tPartMem = member(getmemnum(tPart[Symbol.for("member")]));
        tPalette = this.pSpriteProps[Symbol.for("palette")];
        if (ilk(tPalette) === Symbol.for("symbol")) {
          tPartMem.paletteRef = tPalette;
        } else {
          tPartMem.palette = member(getmemnum(tPalette));
        }
        tPartRectX1 = tPart[Symbol.for("locH")] - tPartMem.regPoint[0];
        tPartRectY1 = tPart[Symbol.for("locV")] - tPartMem.regPoint[1];
        tPartRectX2 = tPartRectX1 + tPart[Symbol.for("width")];
        tPartRectY2 = tPartRectY1 + tPart[Symbol.for("height")];
        tSourceImage = tPartMem.image;
        if (tPart[Symbol.for("flipH")]) {
          tImage = image(tSourceImage.width, tSourceImage.height, tSourceImage.depth, tSourceImage.paletteRef);
          tQuad = [point(tSourceImage.width, 0), point(0, 0), point(0, tSourceImage.height), point(tSourceImage.width, tSourceImage.height)];
          tImage.copyPixels(tSourceImage, tQuad, tSourceImage.rect);
          tSourceImage = tImage;
          tPartRectX1 = tPartRectX1 - tSourceImage.width;
          tPartRectX2 = tPartRectX2 - tSourceImage.width;
        }
        if (tPart[Symbol.for("multiflip")]) {
          tImage = image(tSourceImage.width, tSourceImage.height, tSourceImage.depth, tSourceImage.paletteRef);
          tQuad = [point(tSourceImage.width, 0), point(0, 0), point(0, tSourceImage.height), point(tSourceImage.width, tSourceImage.height)];
          tImage.copyPixels(tSourceImage, tQuad, tSourceImage.rect);
          tSourceImage = tImage;
          tPartRectX1 = tPart[Symbol.for("locH")] + tPart[Symbol.for("offsetx")] - (tPartMem.regPoint[0] * -1) - tSourceImage.width;
          tPartRectX2 = tPartRectX1 + tSourceImage.width;
          tPartRectY1 = tPart[Symbol.for("locV")] - tPartMem.regPoint[1];
          tPartRectY2 = tPartRectY1 + tSourceImage.height;
        }
        tPartRect = rect(tPartRectX1, tPartRectY1, tPartRectX2, tPartRectY2);
        tMatte = tSourceImage.createMatte();
        tBgColor = this.pBgColor;
        tTargetImage.copyPixels(tSourceImage, tPartRect, tSourceImage.rect, { [Symbol.for("maskImage")]: tMatte, [Symbol.for("ink")]: 41, [Symbol.for("bgColor")]: tBgColor });
      }
      tImgMember.image = tTargetImage;
      tImgMember.regPoint = point(0, 0);
      this.pWrapperStatus[Symbol.for("rendered")] = 1;
      return 1;
    },
  };
}
