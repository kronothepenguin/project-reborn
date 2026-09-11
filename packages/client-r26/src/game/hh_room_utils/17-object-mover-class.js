export default class {
  pActive;
  pPause;
  pClientID;
  pStripID;
  pMoveProc;
  pSprList;
  pLoczList;
  pLocShiftList;
  pGeometry;
  pLastLoc;
  pSmallSpr;
  pSavedDim;
  pSavedDir;
  pClientObj;
  pItemLocStr;
  pOrigCoord;
  pObjType;
  pObjProps;

  construct() {
    this.pActive = 0;
    this.pPause = 0;
    this.pClientID = EMPTY;
    this.pStripID = EMPTY;
    this.pMoveProc = Symbol.for("moveActive");
    this.pSprList = list();
    this.pLoczList = list();
    this.pLocShiftList = list();
    this.pGeometry = VOID;
    this.pLastLoc = point(0, 0);
    this.pSavedDim = 1;
    this.pSavedDir = 2;
    this.pItemLocStr = 0;
    this.pOrigCoord = list(0, 0, 0);
    this.pObjType = 0;
    return 1;
  }

  deconstruct() {
    if (this.pClientID != EMPTY) {
      this.clear();
    }
    removeUpdate(this.getID());
    this.pActive = 0;
    this.pPause = 0;
    this.pMoveProc = Symbol.for("moveActive");
    this.pClientID = EMPTY;
    this.pSprList = list();
    this.pLoczList = list();
    this.pLocShiftList = list();
    this.pGeometry = VOID;
    this.pSavedDim = 1;
    this.pSavedDir = 2;
    this.pOrigCoord = list(0, 0, 0);
    return 1;
  }

  define(tClientID, tStripID, tObjType, tProps) {
    if (this.pClientID != EMPTY) {
      return error(this, `Already moving active object: ${this.pClientID}`, Symbol.for("define"), Symbol.for("minor"));
    }
    this.pClientID = tClientID;
    if (stringp(tStripID)) {
      this.pStripID = tStripID;
    }
    this.pObjType = tObjType;
    this.pObjProps = tProps;
    if (this.pSprList.count > 0) {
      error(this, "Sprites hanging in object mover! Clearing them out...", Symbol.for("define"), Symbol.for("minor"));
      for (let i = 1; i <= this.pSprList.count; i++) {
        if (ilk(this.pSprList[i], Symbol.for("sprite"))) {
          releaseSprite(this.pSprList[i].spriteNum);
        }
      }
      this.pSprList = list();
    }
    if (ilk(this.pSmallSpr, Symbol.for("sprite"))) {
      releaseSprite(this.pSmallSpr.spriteNum);
    }
    this.pSmallSpr = VOID;
    let tClientObj = 0;
    switch (tObjType) {
      case "active":
        this.pMoveProc = Symbol.for("moveActive");
        tClientObj = getThread(Symbol.for("room")).getComponent().getActiveObject(tClientID);
        this.pLoczList = tClientObj.pLoczList;
        this.pLocShiftList = tClientObj.pLocShiftList;
        if (objectp(tClientObj)) {
          call(Symbol.for("prepareForMove"), list(tClientObj));
        }
        break;
      case "item":
        this.pMoveProc = Symbol.for("moveItem");
        tClientObj = getThread(Symbol.for("room")).getComponent().getItemObject(tClientID);
        this.pLoczList = list();
        break;
      default:
        error(this, `Invalid object type: ${tObjType}`, Symbol.for("define"), Symbol.for("major"));
        tClientObj = 0;
    }
    this.pClientObj = tClientObj;
    if (!tClientObj) {
      this.pClientID = EMPTY;
      return error(this, `Couldn't find object to move: ${tClientID}`, Symbol.for("define"), Symbol.for("major"));
    }
    let tOrigSprList = tClientObj.getSprites();
    if (!listp(tOrigSprList)) {
      error(this, `List with sprites expected: ${tOrigSprList}`, Symbol.for("define"), Symbol.for("major"));
      tOrigSprList = list();
    }
    this.pOrigCoord = list(tClientObj.pLocX, tClientObj.pLocY, tClientObj.pLocH);
    if (tOrigSprList.count < 1) {
      this.pClientID = EMPTY;
      this.pClientObj = EMPTY;
      let tConnection = getThread(Symbol.for("room")).getComponent().getRoomConnection();
      if (tConnection != 0) {
        tConnection.send("GETSTRIP", "new");
      }
      return error(this, "No sprites found for drawing object for moving.", Symbol.for("define"), Symbol.for("major"));
    }
    if (getSpriteManager().getProperty(Symbol.for("freeSprCount")) < (tOrigSprList.count + 1)) {
      return 0;
    }
    for (let i = 1; i <= tOrigSprList.count; i++) {
      let tSpr = sprite(reserveSprite(this.getID()));
      setEventBroker(tSpr.spriteNum, `ObjMoverSpr${i}`);
      tSpr.setMember(tOrigSprList[i].member);
      tSpr.ink = tOrigSprList[i].ink;
      tSpr.rotation = tOrigSprList[i].rotation;
      tSpr.skew = tOrigSprList[i].skew;
      tSpr.flipH = tOrigSprList[i].flipH;
      tSpr.flipV = tOrigSprList[i].flipV;
      tSpr.blend = tOrigSprList[i].blend;
      tSpr.bgColor = tOrigSprList[i].bgColor;
      let tTargetID = getThread(Symbol.for("room")).getInterface().getID();
      tSpr.registerProcedure(Symbol.for("eventProcRoom"), tTargetID, Symbol.for("mouseDown"));
      tOrigSprList[i].loc = point(-4000, -4000);
      this.pSprList.add(tSpr);
    }
    let tInfo = tClientObj.getInfo();
    let tMemNum = getObject("Preview_renderer").getPreviewMember(tInfo[Symbol.for("image")]);
    if (tMemNum == 0) {
      this.close();
      return error(this, "Preview member missing.", Symbol.for("define"), Symbol.for("major"));
    }
    let tSmallMem = member(tMemNum);
    this.pSmallSpr = sprite(reserveSprite(this.getID()));
    this.pSmallSpr.member = tSmallMem;
    this.pSmallSpr.width = tSmallMem.width;
    this.pSmallSpr.height = tSmallMem.height;
    this.pSmallSpr.ink = 36;
    this.pSmallSpr.blend = 60;
    this.pSmallSpr.loc = point(-1000, -1000);
    this.pSmallSpr.locZ = 20000000;
    if (tObjType == "active") {
      this.pSavedDim = tClientObj.pDimensions;
      this.pSavedDir = tClientObj.pDirection[1];
      let tOrigLocX = tClientObj.pLocX;
      let tOrigLocY = tClientObj.pLocY;
      let tOrigLocH = tClientObj.pLocH;
      let dy = 0;
      if (listp(this.pSavedDim[2])) {
        dy = this.pSavedDim[2];
      } else {
        dy = 1;
      }
      let dx = 0;
      if (listp(this.pSavedDim[1])) {
        dx = this.pSavedDim[1];
      } else {
        dx = 1;
      }
      for (let yy = tClientObj.pLocY; yy <= tClientObj.pLocY + dy; yy++) {
        for (let xx = tClientObj.pLocX; xx <= tClientObj.pLocX + dx; xx++) {
          if (((yy + 1) > 0) && ((yy + 1) <= this.pGeometry.getObjectPlaceMap().count)) {
            if (((xx + 1) > 0) && ((xx + 1) <= this.pGeometry.getObjectPlaceMap()[yy + 1].count)) {
              this.pGeometry.getObjectPlaceMap()[yy + 1][xx + 1] = 0;
            }
          }
        }
      }
    }
    this.pActive = 1;
    this.pPause = 0;
    registerMessage(Symbol.for("activeObjectRemoved"), this.getID(), Symbol.for("checkObjectExists"));
    registerMessage(Symbol.for("objectFinalized"), this.getID(), Symbol.for("objectFinalized"));
    receiveUpdate(this.getID());
    return 1;
  }

  close() {
    return this.clear();
  }

  clear(tRestart) {
    removeUpdate(this.getID());
    unregisterMessage(Symbol.for("activeObjectRemoved"), this.getID());
    unregisterMessage(Symbol.for("objectFinalized"), this.getID());
    if (!tRestart) {
      this.cancelMove();
    }
    this.pActive = 0;
    this.pPause = 0;
    this.pClientID = EMPTY;
    this.pStripID = EMPTY;
    this.pClientObj = VOID;
    this.pSavedDim = 1;
    this.pSavedDir = 2;
    this.pOrigCoord = list(0, 0, 0);
    for (let i = 1; i <= this.pSprList.count; i++) {
      releaseSprite(this.pSprList[i].spriteNum);
    }
    this.pSprList = list();
    if (ilk(this.pSmallSpr, Symbol.for("sprite"))) {
      releaseSprite(this.pSmallSpr.spriteNum);
    }
    this.pSmallSpr = VOID;
  }

  pause() {
    this.pPause = 1;
    return 1;
  }

  resume() {
    this.pPause = 0;
    return 1;
  }

  getProperty(tProp) {
    switch (tProp) {
      case Symbol.for("Active"):
        return this.pActive;
      case Symbol.for("pause"):
        return this.pPause;
      case Symbol.for("clientID"):
        return this.pClientID;
      case Symbol.for("stripId"):
        return this.pStripID;
      case Symbol.for("clientObj"):
        return this.pClientObj;
      case Symbol.for("clientProps"):
        return this.pObjProps;
      case Symbol.for("itemLocStr"):
        if (this.pItemLocStr == 0) {
          return 0;
        }
        return deobfuscate(this.pItemLocStr);
      case Symbol.for("loc"):
        if (this.pPause) {
          return this.pGeometry.getWorldCoordinate(this.pLastLoc[1], this.pLastLoc[2]);
        } else {
          return this.pGeometry.getWorldCoordinate(the.mouseH, the.mouseV);
        }
      default:
        return 0;
    }
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case Symbol.for("geometry"):
        this.pGeometry = tValue;
        break;
      default:
        return 0;
    }
  }

  update() {
    if (!this.pPause) {
      call(this.pMoveProc, this);
    }
  }

  moveActive() {
    let tOccupied = 0;
    if ((the.mouseLoc == this.pLastLoc) || !this.pActive) {
      return;
    }
    this.pLastLoc = the.mouseLoc;
    this.pClientObj.ghostObject();
    this.pClientObj.updateLocation();
    call(Symbol.for("prepareForMove"), list(this.pClientObj));
    let tloc = this.pGeometry.getWorldCoordinate(the.mouseH, the.mouseV);
    if (listp(tloc)) {
      let tDX = 0;
      if (listp(this.pSavedDim[1])) {
        tDX = this.pSavedDim[1];
      } else {
        tDX = 1;
      }
      let tDY = 0;
      if (listp(this.pSavedDim[2])) {
        tDY = this.pSavedDim[2];
      } else {
        tDY = 1;
      }
      let tPlaceMap = this.pGeometry.getObjectPlaceMap();
      for (let tY = tloc[2]; tY <= tloc[2] + tDY - 1; tY++) {
        for (let tX = tloc[1]; tX <= tloc[1] + tDX - 1; tX++) {
          if (((tY + 1) > 0) && ((tY + 1) <= tPlaceMap.count())) {
            if (((tX + 1) > 0) && ((tX + 1) <= tPlaceMap[tY + 1].count())) {
              if (tPlaceMap[tY + 1][tX + 1] > 1000) {
                tOccupied = 1;
                return;
              }
            }
          }
        }
      }
    }
    if (!tloc || tOccupied) {
      this.showSmallPic();
    } else {
      this.showActualPic(tloc);
    }
  }

  moveItem() {
    if ((the.mouseLoc == this.pLastLoc) || !this.pActive) {
      return;
    }
    this.pLastLoc = the.mouseLoc;
    this.pItemLocStr = 0;
    if (this.pSprList.count < 1) {
      return 0;
    }
    for (let i = 1; i <= this.pSprList.count; i++) {
      this.pSprList[i].locH = (the.mouseLoc)[1];
      this.pSprList[i].locV = (the.mouseLoc)[2];
    }
    let tClass = this.pClientObj.getClass();
    if ((tClass != "floor") && (tClass != "wallpaper") && (tClass != "chess") && (tClass != "landscape")) {
      let tProps = propList("insideWall", 0);
      let tRoomInterface = getThread(Symbol.for("room")).getInterface();
      if (!voidp(tRoomInterface)) {
        let tVisual = tRoomInterface.getRoomVisualizer();
        if (!voidp(tVisual)) {
          let tSp = this.pSprList[1];
          let tRp = sprite(tSp).member.regPoint;
          let tRect = rect(sprite(tSp).locH, sprite(tSp).locV, sprite(tSp).locH, sprite(tSp).locV) + rect(-tRp[1], -tRp[2], sprite(tSp).member.width - tRp[1], sprite(tSp).member.height - tRp[2]);
          tProps = tVisual.getWallPartUnderRect(tRect, 0.5);
          if (tProps[Symbol.for("insideWall")]) {
            let tRealPos = 0;
            if ((tClass != "poster") && !(tClass contains "post.it") && (tClass != "photo")) {
              tRealPos = 1;
              tRect[1] = sprite(tSp).locH;
              tRect[2] = sprite(tSp).locV;
              tRect[3] = sprite(tSp).locH;
              tRect[4] = sprite(tSp).locV;
              let tPropsReal = tVisual.getWallPartUnderRect(tRect, 0.5);
              tProps = tPropsReal;
            }
            if (tRealPos == 0) {
              tProps[Symbol.for("localCoordinate")][1] = tProps[Symbol.for("localCoordinate")][1] + this.pSprList[1].member.regPoint[1];
              tProps[Symbol.for("localCoordinate")][2] = tProps[Symbol.for("localCoordinate")][2] + this.pSprList[1].member.regPoint[2];
            }
          }
        }
      }
      if (tProps[Symbol.for("insideWall")] == 0) {
        tProps = this.getWallSpriteItemWithin(this.pSprList[1]);
      }
      if (tProps[Symbol.for("insideWall")] == 0) {
        for (let i = 1; i <= this.pSprList.count; i++) {
          if (this.pSprList[i].ink != 33) {
            this.pSprList[i].blend = 30;
            continue;
          }
          this.pSprList[i].blend = 0;
        }
        this.pItemLocStr = 0;
      } else {
        for (let i = 1; i <= this.pSprList.count; i++) {
          this.pSprList[i].blend = 100;
        }
        let tWallObjLoc;
        if (voidp(tProps[Symbol.for("wallObject")])) {
          tWallObjLoc = tProps[Symbol.for("wallLocation")];
        } else {
          tWallObjLoc = tProps[Symbol.for("wallObject")].getLocation();
        }
        this.pItemLocStr = obfuscate(`:w=${tWallObjLoc[1]},${tWallObjLoc[2]} l=${tProps[Symbol.for("localCoordinate")][1]},${tProps[Symbol.for("localCoordinate")][2]} ${tProps.direction.char[1]}`);
      }
      for (let i = 1; i <= this.pSprList.count; i++) {
        let tName = this.pSprList[i].member.name;
        let tMemNum = 0;
        if (this.pGeometry.pXFactor == 32) {
          tMemNum = getmemnum(`s_${tProps[Symbol.for("direction")]} ${tName.word[`2..${tName.word.count}`]}`);
        } else {
          tMemNum = getmemnum(`${tProps[Symbol.for("direction")]} ${tName.word[`2..${tName.word.count}`]}`);
        }
        if (tMemNum == 0) {
          return 0;
        }
        if (tMemNum < 1) {
          tMemNum = abs(tMemNum);
          this.pSprList[i].flipH = 1;
        } else {
          this.pSprList[i].flipH = 0;
        }
        this.pSprList[i].castNum = tMemNum;
        if (tProps[Symbol.for("wallSprites")] != 0) {
          let tSprites = tProps[Symbol.for("wallSprites")];
          let tlocz = tSprites[1].locZ;
          if (tlocz < -1000000) {
            tlocz = tlocz + 20100;
          }
          if (tSprites.count > 1) {
            if (tSprites[2].locZ > tlocz) {
              tlocz = tSprites[2].locZ;
            }
          }
          this.pSprList[i].locZ = tlocz + 2 + i;
        }
      }
    }
  }

  moveTrade() {
    if ((the.mouseLoc == this.pLastLoc) || !this.pActive) {
      return;
    }
    this.pLastLoc = the.mouseLoc;
    this.pMoveProc = Symbol.for("moveTrade");
    this.pSmallSpr.blend = 100;
    this.showSmallPic();
  }

  cancelMove() {
    let tClickAction = getThread(Symbol.for("room")).getInterface().getProperty(Symbol.for("clickAction"));
    switch (tClickAction) {
      case "moveActive":
      case "moveItem":
        let tLocX = this.pOrigCoord[1];
        let tLocY = this.pOrigCoord[2];
        let tLocH = this.pOrigCoord[3];
        let tObj = getThread(Symbol.for("room")).getComponent().getActiveObject(this.pClientID);
        if (tObj == 0) {
          return 0;
        }
        tObj.moveTo(tLocX, tLocY, tLocH);
        tObj.removeGhostEffect();
        break;
      case "placeActive":
      case "placeItem":
        if (tClickAction == "placeActive") {
          getThread(Symbol.for("room")).getComponent().getComponent().removeActiveObject(this.pClientID);
        } else {
          if (tClickAction == "placeItem") {
            getThread(Symbol.for("room")).getComponent().getComponent().removeItemObject(this.pClientID);
          }
        }
        getThread(Symbol.for("room")).getComponent().getRoomConnection().send("GETSTRIP", "update");
        break;
    }
  }

  showSmallPic() {
    if (!voidp(this.pSmallSpr)) {
      this.pSmallSpr.loc = the.mouseLoc;
    }
    for (let i = 1; i <= this.pSprList.count; i++) {
      this.pSprList[i].loc = point(-1000, -1000);
    }
  }

  showActualPic(tloc) {
    if (!voidp(this.pSmallSpr)) {
      this.pSmallSpr.loc = point(-1000, -1000);
    }
    if (voidp(tloc)) {
      tloc = this.pGeometry.getWorldCoordinate(the.mouseH, the.mouseV);
    }
    if (!tloc) {
      return this.showSmallPic();
    }
    let tScreenCoord = this.pGeometry.getScreenCoordinate(tloc[1], tloc[2], tloc[3]);
    for (let i = 1; i <= this.pSprList.count; i++) {
      this.pSprList[i].loc = point(tScreenCoord[1], tScreenCoord[2]);
      if (this.pSprList[i].rotation == 180) {
        this.pSprList[i].locH = tScreenCoord[1] + this.pGeometry.pXFactor;
      }
      this.pSprList[i].loc = this.pSprList[i].loc + this.pLocShiftList[i][this.pSavedDir + 1];
      let tZ = this.pLoczList[i][this.pSavedDir + 1];
      this.pSprList[i].locZ = tScreenCoord[3] + (this.pClientObj.pLocH * 1000) + tZ - 1;
    }
    this.pClientObj.relocate(this.pSprList);
  }

  getWallSpriteItemWithin(tSpr) {
    let tRoomInterface = getThread(Symbol.for("room")).getInterface();
    let tRoomComponent = getThread(Symbol.for("room")).getComponent();
    let tItemRp = tSpr.member.regPoint;
    let tItemR = rect(tSpr.locH, tSpr.locV, tSpr.locH, tSpr.locV) + rect(-tItemRp[1], -tItemRp[2], tSpr.member.width - tItemRp[1], tSpr.member.height - tItemRp[2]);
    let tWallObjectUnder = this.getPassiveObjectIntersectingRect(tItemR)[1];
    if (tWallObjectUnder == 0) {
      return propList("direction", "rightwall", "wallSprite", 0, "insideWall", 0);
    }
    let tDirection = tWallObjectUnder.getDirection();
    let tCorner = 0;
    let tWallCheckSprList = tWallObjectUnder.getSprites();
    let tWallCheckSpr = tWallCheckSprList[1];
    if (tWallCheckSprList.count > 1) {
      if (tWallCheckSprList[1].rect == tWallCheckSprList[2].rect) {
        tWallCheckSprList.deleteAt(2);
      }
    }
    let tWallDir = 0;
    if ((tDirection[1] == 3) || (tWallCheckSprList.count > 1)) {
      if (tWallCheckSprList.count == 1) {
        if (tSpr.locH < tWallCheckSpr.locH) {
          tWallDir = 0;
        } else {
          tWallDir = 2;
        }
      } else {
        if (tWallObjectUnder.getSprites()[1].right < tWallObjectUnder.getSprites()[2].right) {
          if (tSpr.locH < tWallObjectUnder.getSprites()[1].right) {
            tWallDir = 2;
            tWallCheckSpr = tWallObjectUnder.getSprites()[1];
          } else {
            tWallDir = 0;
            tWallCheckSpr = tWallObjectUnder.getSprites()[2];
          }
        } else {
          if (tSpr.locH < tWallObjectUnder.getSprites()[2].right) {
            tWallDir = 2;
            tWallCheckSpr = tWallObjectUnder.getSprites()[2];
          } else {
            tWallDir = 0;
            tWallCheckSpr = tWallObjectUnder.getSprites()[1];
          }
        }
      }
      tCorner = 1;
    } else {
      if (tDirection[1] == 1) {
        if (tSpr.locH < tWallObjectUnder.getSprites()[1].locH) {
          tWallDir = 2;
        } else {
          tWallDir = 0;
        }
        tCorner = 1;
      } else {
        tWallDir = tDirection[1];
      }
    }
    let tCornerA;
    let tCornerB;
    let tDirName = "";
    switch (tWallDir) {
      case 0:
        tCornerA = point(tSpr.loc[1] - tSpr.member.regPoint[1] + tSpr.member.width, tSpr.loc[2] - tSpr.member.regPoint[2]);
        tCornerB = point(tSpr.loc[1] - tSpr.member.regPoint[1], tSpr.loc[2] - tSpr.member.regPoint[2] + tSpr.member.height);
        tDirName = "leftwall";
        break;
      case 2:
        tCornerA = point(tSpr.loc[1] - tSpr.member.regPoint[1], tSpr.loc[2] - tSpr.member.regPoint[2]);
        tCornerB = point(tSpr.loc[1] - tSpr.member.regPoint[1] + tSpr.member.width, tSpr.loc[2] - tSpr.member.regPoint[2] + tSpr.member.height);
        tDirName = "rightwall";
        break;
    }
    let tRects = list(rect(tCornerA[1], tCornerA[2], tCornerA[1] + 1, tCornerA[2] + 1), rect(tCornerB[1], tCornerB[2], tCornerB[1] + 1, tCornerB[2] + 1));
    let tWallInfo = list(this.getPassiveObjectIntersectingRect(tRects[1]), this.getPassiveObjectIntersectingRect(tRects[2]));
    let tWallObjs = list(tWallInfo[1][1], tWallInfo[2][1]);
    if (tCorner == 1) {
      if ((tWallObjs[1] == tWallObjs[2]) && (tWallInfo[1][2] != tWallInfo[2][2])) {
        return propList("direction", tDirName, "wallSprites", tWallObjectUnder.getSprites(), "insideWall", 0);
      }
    }
    for (let i = 1; i <= 2; i++) {
      let tWallObj = tWallObjs[i];
      let tRect = tRects[i];
      if (voidp(tWallObj)) {
        return propList("direction", tDirName, "wallSprites", tWallObjectUnder.getSprites(), "insideWall", 0);
        continue;
      }
      let tWallSpr = tWallObj.getSprites()[1];
      if (tWallObj == tWallObjectUnder) {
        tWallSpr = tWallCheckSpr;
      }
      let tLocalCoordinate = point(tRect[1] - tWallSpr.left, tRect[2] - tWallSpr.top);
      if ((tLocalCoordinate[1] < 0) || (tLocalCoordinate[2] < 0)) {
        return propList("direction", tDirName, "wallSprites", tWallObjectUnder.getSprites(), "insideWall", 0);
      }
      let tLocalPixel = tWallSpr.member.image.getPixel(tLocalCoordinate[1], tLocalCoordinate[2]);
      if (tLocalPixel == paletteIndex(0)) {
        return propList("direction", tDirName, "wallSprites", tWallObjectUnder.getSprites(), "insideWall", 0);
      }
    }
    if ((tWallObjs[1].getDirection() != tWallObjs[2].getDirection()) && ((tWallObjs[1].getDirection()[1] != 3) && (tWallObjs[2].getDirection()[1] != 3))) {
      return propList("direction", tDirName, "wallSprites", tWallObjectUnder.getSprites(), "insideWall", 0);
    }
    let tWallSpr = tWallObjs[1].getSprites()[1];
    let tLocalCoordinate = point(tSpr.loc[1] - tWallSpr.left, tSpr.loc[2] - tWallSpr.top);
    return propList("direction", tDirName, "wallSprites", tWallObjectUnder.getSprites(), "insideWall", 1, "wallObject", tWallObjs[1], "localCoordinate", tLocalCoordinate);
  }

  getPassiveObjectIntersectingRect(tItemR) {
    let tPieceList = getThread(Symbol.for("room")).getComponent().getPassiveObject(Symbol.for("list"));
    let tPieceObjUnder = VOID;
    let tPieceSprUnder = 0;
    let tPieceUnderLocZ = -1000000000;
    for (const tPiece of tPieceList) {
      let tSprites = tPiece.getSprites();
      for (const tPieceSpr of tSprites) {
        let tRp = sprite(tPieceSpr).member.regPoint;
        let tR = rect(sprite(tPieceSpr).locH, sprite(tPieceSpr).locV, sprite(tPieceSpr).locH, sprite(tPieceSpr).locV) + rect(-tRp[1], -tRp[2], sprite(tPieceSpr).member.width - tRp[1], sprite(tPieceSpr).member.height - tRp[2]);
        if ((intersect(tItemR, tR) != rect(0, 0, 0, 0)) && (tPieceUnderLocZ < tPieceSpr.locZ)) {
          tPieceObjUnder = tPiece;
          tPieceSprUnder = tPieceSpr;
          tPieceUnderLocZ = tPieceSpr.locZ;
        }
      }
    }
    return list(tPieceObjUnder, tPieceSprUnder);
  }

  checkObjectExists() {
    let tObj = getThread(Symbol.for("room")).getComponent().getActiveObject(this.pClientID);
    if (tObj == 0) {
      getThread(Symbol.for("room")).getInterface().stopObjectMover();
    }
  }

  objectFinalized(tID) {
    if (this.pActive && (this.pClientID == tID)) {
      let tClientID = this.pClientID;
      let tStripID = this.pStripID;
      let tObjType = this.pObjType;
      this.clear(1);
      this.define(tClientID, tStripID, tObjType, this.pObjProps);
      this.pLastLoc = the.mouseLoc - point(1, 1);
      this.update();
    }
  }
}
