export default class {
  pimage;
  pREquiresUpdate;
  pwidth;
  pheight;
  pBgID;
  pTurnPoint;
  pRoomType;
  pRoomId;
  pGradientType;
  pLandscapeType;
  pScalePrefix;
  pWallDef;
  pLandscapeDef;
  pWallHeight;
  pWideScreenOffset;
  pRandObj;
  pRenderQueue;

  construct() {
    this.pimage = image(1, 1, 32);
    this.pwidth = 720;
    this.pheight = 400;
    this.pTurnPoint = this.pwidth / 2;
    this.pREquiresUpdate = 1;
    if (threadExists(Symbol.for("room"))) {
      this.pWideScreenOffset = getThread(Symbol.for("room")).getInterface().getProperty(Symbol.for("widescreenoffset"));
    }
    this.pRandObj = this.getRandomizer();
    this.pRenderQueue = list();
    return 1;
  }

  deconstruct() {
    this.pRandObj = VOID;
    removeUpdate(this.getID());
    this.pRenderQueue = list();
    return 1;
  }

  define(tdata, tWallDef, tLandscapeDef) {
    this.pwidth = tdata[Symbol.for("width")];
    this.pheight = tdata[Symbol.for("height")];
    this.pBgID = tdata[Symbol.for("id")];
    this.pRoomTypeID = tdata[Symbol.for("roomtypeid")];
    this.pWallDef = tWallDef.getaProp(Symbol.for("struct"));
    this.pWallHeight = tWallDef.getaProp(Symbol.for("max_piece_height"));
    const tFactorX = tWallDef.getaProp(Symbol.for("factorx"));
    this.pGradientType = tdata.getaProp(Symbol.for("gradient"));
    this.pLandscapeType = tdata.getaProp(Symbol.for("type"));
    this.pLandscapeDef = tLandscapeDef;
    if (tFactorX == 64) {
      this.pScalePrefix = EMPTY;
    } else {
      this.pScalePrefix = "s_";
    }
    if (variableExists(`landscape.def.${this.pRoomTypeID}`)) {
      const tRoomDef = getVariableValue(`landscape.def.${this.pRoomTypeID}`);
      this.pTurnPoint = tRoomDef[Symbol.for("middle")];
    }
    const tRoomObj = getObject(Symbol.for("room_component"));
    if (tRoomObj == 0) {
      return 0;
    }
    const tRoomData = tRoomObj.getRoomData();
    if (tRoomData == 0) {
      return 0;
    }
    this.pRoomId = tRoomData.getaProp(Symbol.for("flatId"));
    this.pTurnPoint = this.pTurnPoint + tdata[Symbol.for("offset")];
    if (!this.renderLandscape()) {
      this.renderDefaultLandscape();
    }
  }

  requiresUpdate() {
    return this.pREquiresUpdate;
  }

  getImage() {
    if (this.requiresUpdate()) {
      if (this.pRenderQueue.count == 0) {
        this.pREquiresUpdate = 0;
      }
    }
    return this.pimage.duplicate();
  }

  update() {
    if (this.pRenderQueue.count == 0) {
      removeUpdate(this.getID());
      return 1;
    }
    const tItem = this.pRenderQueue[1];
    this.pRenderQueue.deleteAt(1);
    this.renderPiece(tItem);
  }

  renderPiece(tItem) {
    this.pimage.copyPixels(tItem[1], tItem[2], tItem[3], tItem[4]);
    this.renderWallRandomProps(tItem[5], tItem[6], tItem[7], tItem[8], tItem[9]);
    this.pREquiresUpdate = 1;
  }

  renderLandscape() {
    const tMemNum = getmemnum(`${this.pScalePrefix}lsd_bg_${this.pGradientType}`);
    if (tMemNum == 0) {
      return 0;
    }
    const tImageA = member(tMemNum).image;
    const tWidthA = tImageA.width;
    const tHeightA = tImageA.height;
    const tImageList = this.getImageListForTheme();
    if (tImageList == 0) {
      return 0;
    }
    const tImageCount = tImageList.count;
    if (tImageCount == 0) {
      return 0;
    }
    const tPieceCount = (this.pwidth / tImageList[1].width) + 1;
    const tImageSpots = this.getRandomImageOffsets(tImageCount, tPieceCount);
    let tImageSpotCounter = 1;
    const tPalette = member(tMemNum).paletteRef;
    this.pimage = image(this.pwidth, this.pheight, 32);
    if (!listp(this.pWallDef)) {
      return 0;
    }
    if (this.pWallDef.count < 1) {
      return 0;
    }
    let tside = Symbol.for("left");
    let tSideLeft = VOID;
    let tSideRight = VOID;
    let tFirstBottom = VOID;
    let tFirstLeft = VOID;
    let tItem = this.pWallDef[1];
    let tWallDefIndex = 1;
    while (tItem != 0) {
      if (tWallDefIndex > this.pWallDef.count) {
        break;
      }
      tItem = this.pWallDef[tWallDefIndex];
      const tMemName = tItem.getaProp(Symbol.for("member"));
      const tmember = member(getmemnum(tMemName));
      let tPieceSide;
      if (tMemName.indexOf("right") > -1) {
        tPieceSide = Symbol.for("right");
      } else {
        tPieceSide = Symbol.for("left");
      }
      if (tPieceSide == tside) {
        const tLocH = tItem.getaProp(Symbol.for("locH")) - tmember.regPoint.locH + this.pWideScreenOffset;
        const tLocV = tItem.getaProp(Symbol.for("locV")) - tmember.regPoint.locV;
        if (voidp(tSideLeft) || (!voidp(tSideLeft) && (tLocH < tSideLeft))) {
          tSideLeft = tLocH;
          if ((tFirstLeft == VOID) || (tFirstLeft > tSideLeft)) {
            tFirstLeft = tSideLeft;
          }
          tFirstBottom = tLocV + this.pWallHeight;
          if (tside == Symbol.for("right")) {
            const tRightWallElemBottomOffset = -(tItem.getaProp(Symbol.for("width")) / 2);
          }
        }
        const tPieceRight = tLocH + tItem.getaProp(Symbol.for("width"));
        if (tSideRight < tPieceRight) {
          tSideRight = tPieceRight;
        }
        tWallDefIndex = tWallDefIndex + 1;
      }
      if ((tPieceSide != tside) || (tWallDefIndex > this.pWallDef.count)) {
        let tX = tSideLeft;
        let tBottomY = tFirstBottom;
        tSideRight = tSideRight;
        while (tX < tSideRight) {
          let tPieceWidth;
          if ((tX + tWidthA) > tSideRight) {
            tPieceWidth = tSideRight - tX;
          } else {
            tPieceWidth = tWidthA;
          }
          const tPieceHeight = tHeightA;
          let tY;
          let tQuad;
          let tSourceRect;
          if (tside == Symbol.for("right")) {
            tY = tBottomY - tHeightA + tRightWallElemBottomOffset + (tWidthA / 2);
            tQuad = [point(tX + tPieceWidth, tY), point(tX, tY), point(tX, tY + tPieceHeight), point(tX + tPieceWidth, tY + tPieceHeight)];
            tSourceRect = rect(tWidthA - tPieceWidth, 0, tWidthA, tHeightA);
            tBottomY = tBottomY + (tPieceWidth / 2);
          } else {
            tY = tBottomY - tHeightA;
            tQuad = [point(tX, tY), point(tX + tPieceWidth, tY), point(tX + tPieceWidth, tY + tPieceHeight), point(tX, tY + tPieceHeight)];
            tSourceRect = rect(0, 0, tPieceWidth, tHeightA);
            tBottomY = tBottomY - (tPieceWidth / 2);
          }
          this.pimage.copyPixels(tImageA, tQuad, tSourceRect, propList(Symbol.for("palette"), tPalette));
          tX = tX + tPieceWidth;
        }
        tX = tSideLeft;
        tBottomY = tFirstBottom;
        while (tX < tSideRight) {
          const tImage = tImageList[tImageSpots[tImageSpotCounter]];
          tImageSpotCounter = tImageSpotCounter + 1;
          if (tImageSpotCounter > tImageSpots.count) {
            tImageSpotCounter = 1;
          }
          const tImageWidth = tImage.width;
          const tImageHeight = tImage.height;
          let tPieceWidth;
          if ((tX + tImageWidth) > tSideRight) {
            tPieceWidth = tSideRight - tX;
          } else {
            tPieceWidth = tImageWidth;
          }
          const tPieceHeight = tImageHeight;
          let tY;
          let tQuad;
          let tSourceRect;
          if (tside == Symbol.for("right")) {
            tY = tBottomY - tImageHeight + tRightWallElemBottomOffset + (tImageWidth / 2);
            tQuad = [point(tX + tPieceWidth, tY), point(tX, tY), point(tX, tY + tPieceHeight), point(tX + tPieceWidth, tY + tPieceHeight)];
            tSourceRect = rect(tImageWidth - tPieceWidth, 0, tImageWidth - 0, tImageHeight);
            tBottomY = tBottomY + (tPieceWidth / 2);
          } else {
            tY = tBottomY - tImageHeight;
            tQuad = [point(tX, tY), point(tX + tPieceWidth, tY), point(tX + tPieceWidth, tY + tPieceHeight), point(tX, tY + tPieceHeight)];
            tSourceRect = rect(0, 0, tPieceWidth, tImageHeight);
            tBottomY = tBottomY - (tPieceWidth / 2);
          }
          const tWallRandomPropList = this.getRandomPropList(tImageSpots[tImageSpotCounter]);
          const tQueueItem = [tImage, tQuad, tSourceRect, propList(Symbol.for("ink"), 36), tside, tX, tY, tX + tPieceWidth, tWallRandomPropList];
          this.pRenderQueue.append(tQueueItem);
          tX = tX + tPieceWidth;
        }
        tSideLeft = VOID;
        tside = tPieceSide;
        tFirstBottom = VOID;
        tSideRight = VOID;
      }
    }
    if (this.pRenderQueue.count > 0) {
      receiveUpdate(this.getID());
    }
    return this.pimage.duplicate();
  }

  renderWallRandomProps(tside, tOrigX, tOrigY, tSideRight, tWallRandomPropList) {
    for (let i = 1; i <= tWallRandomPropList.count; i++) {
      const tImage = tWallRandomPropList[i];
      const tpoint = tWallRandomPropList.getPropAt(i);
      const tImageWidth = tImage.width;
      const tImageHeight = tImage.height;
      let tX;
      let tY;
      if (tside == Symbol.for("right")) {
        tX = tSideRight - tpoint.locH;
        tY = tOrigY + tpoint.locV;
      } else {
        tX = tOrigX + tpoint.locH;
        tY = tOrigY + tpoint.locV;
      }
      if ((tX <= tSideRight) && (tX >= tOrigX)) {
        let tPieceWidth;
        if ((tX + tImageWidth) > tSideRight) {
          tPieceWidth = tSideRight - tX;
        } else {
          tPieceWidth = tImageWidth;
        }
        const tPieceHeight = tImageHeight;
        let tQuad;
        let tSourceRect;
        if (tside == Symbol.for("right")) {
          tQuad = [point(tX + tPieceWidth, tY), point(tX, tY), point(tX, tY + tPieceHeight), point(tX + tPieceWidth, tY + tPieceHeight)];
          tSourceRect = rect(tImageWidth - tPieceWidth, 0, tImageWidth, tImageHeight);
        } else {
          tQuad = [point(tX, tY), point(tX + tPieceWidth, tY), point(tX + tPieceWidth, tY + tPieceHeight), point(tX, tY + tPieceHeight)];
          tSourceRect = rect(0, 0, tPieceWidth, tImageHeight);
        }
        this.pimage.copyPixels(tImage, tQuad, tSourceRect, propList(Symbol.for("ink"), 36));
      }
    }
  }

  renderDefaultLandscape() {
    this.pimage = image(this.pwidth, this.pheight, 32);
    this.pimage.fill(0, 0, this.pTurnPoint, this.pheight, color(110, 173, 200));
    this.pimage.fill(this.pTurnPoint, 0, this.pwidth, this.pheight, color(132, 206, 239));
    return this.pimage.duplicate();
  }

  getImageListForTheme() {
    const tImageList = list();
    let tMemNum = getmemnum(`${this.pScalePrefix}lsd_${this.pLandscapeType}_1`);
    if (tMemNum == 0) {
      return 0;
    }
    let tNum = 1;
    while (tMemNum > 0) {
      tImageList.append(member(tMemNum).image);
      tNum = tNum + 1;
      tMemNum = getmemnum(`${this.pScalePrefix}lsd_${this.pLandscapeType}_${tNum}`);
    }
    return tImageList;
  }

  getRandomImageOffsets(tImageCount, tResultCount) {
    const tMaxList = propList();
    for (let i = 1; i <= tImageCount; i++) {
      const tDef = this.pLandscapeDef.getaProp(string(i));
      if (tDef != 0) {
        tMaxList.setaProp(string(i), tDef.getaProp(Symbol.for("maximum")));
        continue;
      }
      tMaxList.setaProp(string(i), -1);
    }
    this.pRandObj = this.getRandomizer();
    if (this.pRandObj == 0) {
      return 0;
    }
    let tImageSpots;
    if (tImageCount > 1) {
      tImageSpots = this.pRandObj.getArrayWithCountLimits(tResultCount, 1, tImageCount, tMaxList);
    } else {
      tImageSpots = this.pRandObj.getArray(tResultCount, 1, 1);
    }
    return tImageSpots;
  }

  getPropListForTheme() {
    const tImageList = list();
    let tMemNum = getmemnum(`${this.pScalePrefix}lsd_${this.pLandscapeType}_item_1`);
    let tNum = 1;
    while (tMemNum > 0) {
      tImageList.append(member(tMemNum).image);
      tNum = tNum + 1;
      tMemNum = getmemnum(`${this.pScalePrefix}lsd_${this.pLandscapeType}_item_${tNum}`);
    }
    return tImageList;
  }

  getRandomPropList(tMemberId) {
    const tPropList = this.pLandscapeDef.getaProp(tMemberId);
    if (tPropList == 0) {
      return propList();
    }
    const tImageList = this.getPropListForTheme();
    let tMaxCount = tPropList.getaProp(Symbol.for("max_props"));
    const tOffsetList = tPropList.getaProp(Symbol.for("offsets"));
    if (tMaxCount > tOffsetList.count) {
      tMaxCount = tOffsetList.count;
    }
    if (this.pRandObj == 0) {
      return 0;
    }
    const tImageTypes = this.pRandObj.getArray(tMaxCount, 0, tImageList.count);
    const tImageSpots = this.pRandObj.getArray(tMaxCount, 1, tOffsetList.count);
    const tResult = propList();
    for (let i = 1; i <= tImageTypes.count; i++) {
      if (tImageTypes[i] > 0) {
        tResult.setaProp(tOffsetList[tImageSpots[i]], tImageList[tImageTypes[i]]);
      }
    }
    return tResult;
  }

  getRandomizer() {
    const tRandObj = createObject(Symbol.for("temp"), "Pseudorandom Number Generator Class");
    if (tRandObj == 0) {
      return 0;
    }
    tRandObj.setSeed(integer(this.pRoomId));
    return tRandObj;
  }
}
