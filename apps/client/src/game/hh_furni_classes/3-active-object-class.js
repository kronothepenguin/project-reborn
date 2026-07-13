export default class {
  pClass;
  pName;
  pCustom;
  pSprList;
  pDirection;
  pDimensions;
  pLoczList;
  pLocShiftList;
  pPartColors;
  pAnimFrame;
  pLocX;
  pLocY;
  pLocH;
  pAltitude;
  pXFactor;
  pCorrectLocZ;
  pSmallMember;
  pGeometry;
  pStartloc;
  pDestLoc;
  pSlideStartTime;
  pSlideEndTime;
  pSlideTimePerTile;
  pLastSlideUpdateTime;

  construct() {
    this.pClass = EMPTY;
    this.pName = EMPTY;
    this.pCustom = EMPTY;
    this.pSprList = list();
    this.pDirection = list();
    this.pDimensions = list();
    this.pLoczList = list();
    this.pLocShiftList = list();
    this.pPartColors = list();
    this.pAnimFrame = 0;
    this.pLocX = 0;
    this.pLocY = 0;
    this.pLocH = 0;
    this.pAltitude = 0.0;
    this.pXFactor = getThread(Symbol.for("room")).getInterface().getGeometry().pXFactor;
    if (this.pXFactor == 32) {
      this.pCorrectLocZ = 0;
    } else {
      this.pCorrectLocZ = 1;
    }
    this.pSlideTimePerTile = 500;
    return 1;
  }

  deconstruct() {
    for (const tSpr of this.pSprList) {
      releaseSprite(tSpr.spriteNum);
    }
    if (threadExists(Symbol.for("room"))) {
      const tRoomThread = getThread(Symbol.for("room"));
      const tComponent = tRoomThread.getComponent();
      const tShadowManager = tComponent.getShadowManager();
      tShadowManager.removeShadow(this.getID());
      tComponent.removeSlideObject(this.getID());
    }
    this.pSprList = list();
    return 1;
  }

  define(tdata) {
    this.pClass = tdata[Symbol.for("class")];
    this.pDirection = tdata[Symbol.for("direction")];
    this.pDimensions = tdata[Symbol.for("dimensions")];
    this.pAltitude = tdata[Symbol.for("altitude")];
    this.pLocX = tdata[Symbol.for("x")];
    this.pLocY = tdata[Symbol.for("y")];
    this.pLocH = this.pAltitude;
    this.solveColors(tdata[Symbol.for("colors")]);
    if (this.solveMembers() == 0) {
      return 0;
    }
    if (this.prepare(tdata[Symbol.for("props")]) == 0) {
      return 0;
    }
    this.updateLocation();
    return 1;
  }

  getInfo() {
    const tInfo = propList();
    tInfo[Symbol.for("class")] = this.pClass;
    tInfo[Symbol.for("name")] = getText(`furni_${this.pClass}_name`, `furni_${this.pClass}_name`);
    tInfo[Symbol.for("custom")] = getText(`furni_${this.pClass}_desc`, `furni_${this.pClass}_desc`);
    tInfo[Symbol.for("smallmember")] = this.pSmallMember;
    tInfo[Symbol.for("image")] = getObject("Preview_renderer").renderPreviewImage(VOID, this.pPartColors, VOID, this.pClass);
    return tInfo;
  }

  getLocation() {
    return list(this.pLocX, this.pLocY, this.pLocH);
  }

  getCustom() {
    const tCustom = getText(`furni_${this.pClass}_desc`, `furni_${this.pClass}_desc`);
    return tCustom;
  }

  getSprites() {
    return this.pSprList;
  }

  select() {
    return 0;
  }

  moveTo(tX, tY, tH) {
    this.pLocX = tX;
    this.pLocY = tY;
    this.pLocH = tH + this.pAltitude;
    this.updateLocation();
  }

  moveBy(tX, tY, tH) {
    this.pLocX = this.pLocX + tX;
    this.pLocY = this.pLocY + tY;
    this.pLocH = this.pLocH + tH;
    this.updateLocation();
  }

  rotate(tChange) {
    const tName = sprite(this.pSprList[1]).member.name;
    let tDirection = this.pDirection;
    if (voidp(tChange)) {
      tChange = 2;
    }
    let tTryName = EMPTY;
    for (let j = 0; j <= 3; j++) {
      tDirection = (tDirection + tChange + j) % 8;
      if (tDirection[1] < 0) {
        tDirection = 8 + tDirection;
      }
      const tNameExploded = explode(tName, "_");
      if (tNameExploded.count < 2) {
        tTryName = EMPTY;
        break;
      }
      tNameExploded[tNameExploded.count - 1] = string(tDirection[1]);
      tTryName = implode(tNameExploded, "_");
      if (memberExists(tTryName)) {
        break;
      }
      if (!(tTryName contains this.pClass)) {
        const tDelim = the.itemDelimiter;
        the.itemDelimiter = "_";
        let tTryName2 = this.pClass;
        if (this.pXFactor == 32) {
          tTryName2 = `s_${tTryName2}`;
        }
        for (let i = tTryName.item.count - 5; i <= tTryName.item.count; i++) {
          tTryName2 = `${tTryName2}_${tTryName.item[i]}`;
        }
        the.itemDelimiter = tDelim;
        if (memberExists(tTryName2)) {
          tTryName = tTryName2;
          break;
        }
      }
    }
    if (!memberExists(tTryName)) {
      return error(this, `Direction for object not found: ${this.pClass} ${tDirection[1]}`, Symbol.for("rotate"), Symbol.for("minor"));
    }
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVESTUFF", `${this.getID()} ${this.pLocX} ${this.pLocY} ${tDirection[1]}`);
  }

  setSlideTo(tFromLoc, tToLoc, tTimeNow, tHasCharacter) {
    if (voidp(tTimeNow)) {
      tTimeNow = the.milliSeconds;
    }
    this.pSlideStartTime = tTimeNow;
    this.pLastSlideUpdateTime = this.pSlideStartTime;
    this.pLocX = getLocalFloat(tFromLoc[1]);
    this.pLocY = getLocalFloat(tFromLoc[2]);
    this.pLocH = getLocalFloat(tFromLoc[3]);
    const tDistances = list();
    tDistances[1] = abs(tFromLoc[1] - tToLoc[1]);
    tDistances[2] = abs(tFromLoc[2] - tToLoc[2]);
    tDistances[3] = abs(tFromLoc[3] - tToLoc[3]);
    const tMoveTime = max(tDistances) * this.pSlideTimePerTile;
    this.pSlideEndTime = this.pSlideStartTime + tMoveTime;
    this.pStartloc = list(this.pLocX, this.pLocY, this.pLocH);
    this.pDestLoc = tToLoc;
    this.updateLocation();
  }

  animateSlide(tTimeNow) {
    if (voidp(tTimeNow)) {
      tTimeNow = the.milliSeconds;
    }
    if (this.pSlideEndTime < tTimeNow) {
      this.pLocX = this.pDestLoc[1].integer;
      this.pLocY = this.pDestLoc[2].integer;
      this.pLocH = this.pDestLoc[3];
      getThread("room").getComponent().removeSlideObject(this.ancestor.id);
      this.updateLocation();
      return 1;
    }
    const tTimeUsed = float(tTimeNow - this.pSlideStartTime);
    const tPercentSlided = tTimeUsed / float(this.pSlideEndTime - this.pSlideStartTime);
    this.pLocX = (float(this.pDestLoc[1] - this.pStartloc[1]) * tPercentSlided) + this.pStartloc[1];
    this.pLocY = (float(this.pDestLoc[2] - this.pStartloc[2]) * tPercentSlided) + this.pStartloc[2];
    this.pLocH = (float(this.pDestLoc[3] - this.pStartloc[3]) * tPercentSlided) + this.pStartloc[3];
    this.updateLocation();
    return 1;
  }

  ghostObject() {
    for (const tSpr of this.pSprList) {
      if (tSpr.ink == 33) {
        tSpr.visible = 0;
        continue;
      }
      tSpr.blend = 35;
    }
  }

  removeGhostEffect() {
    for (const tSpr of this.pSprList) {
      tSpr.visible = 1;
      tSpr.blend = 100;
    }
  }

  getScreenLocation() {
    if (this.pSprList.count < 1) {
      return point(0, 0);
    }
    const tSpr = this.pSprList[1];
    const tloc = point(tSpr.rect[1] + (tSpr.width / 2), tSpr.rect[2] + (tSpr.height / 2));
    return tloc;
  }

  prepare(tdata) {
    return 1;
  }

  relocate(tSpriteList) {
    return 1;
  }

  solveColors(tpartColors) {
    if (voidp(tpartColors)) {
      tpartColors = "0,0,0";
    }
    this.pPartColors = list();
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    for (let i = 1; i <= tpartColors.item.count; i++) {
      this.pPartColors.add(string(tpartColors.item[i]));
    }
    for (let j = this.pPartColors.count; j <= 4; j++) {
      this.pPartColors.add("*ffffff");
    }
    the.itemDelimiter = tDelim;
  }

  solveInk(tPart, tClass) {
    if (voidp(tClass)) {
      tClass = this.pClass;
    }
    if (!memberExists(`${tClass}.props`)) {
      return 8;
    }
    const tPropList = value(field(getmemnum(`${tClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${tClass}.props is not valid!`, Symbol.for("solveInk"), Symbol.for("minor"));
      return 8;
    } else {
      if (voidp(tPropList[tPart])) {
        return 8;
      }
      if (!voidp(tPropList[tPart][Symbol.for("ink")])) {
        return tPropList[tPart][Symbol.for("ink")];
      }
    }
    return 8;
  }

  solveBlend(tPart, tClass) {
    if (voidp(tClass)) {
      tClass = this.pClass;
    }
    if (!memberExists(`${tClass}.props`)) {
      return 100;
    }
    const tPropList = value(field(getmemnum(`${tClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${tClass}.props is not valid!`, Symbol.for("solveBlend"), Symbol.for("minor"));
      return 100;
    } else {
      if (voidp(tPropList[tPart])) {
        return 100;
      }
      if (!voidp(tPropList[tPart][Symbol.for("blend")])) {
        return tPropList[tPart][Symbol.for("blend")];
      }
    }
    return 100;
  }

  solveLocZ(tPart, tdir, tClass) {
    if (voidp(tClass)) {
      tClass = this.pClass;
    }
    if (!memberExists(`${tClass}.props`)) {
      return 0;
    }
    const tPropList = value(field(getmemnum(`${tClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${tClass}.props is not valid!`, Symbol.for("solveLocZ"), Symbol.for("minor"));
      return 0;
    } else {
      if (voidp(tPropList[tPart])) {
        return 0;
      }
      if (voidp(tPropList[tPart][Symbol.for("zshift")])) {
        return 0;
      }
      if (tPropList[tPart][Symbol.for("zshift")].count <= tdir) {
        tdir = 0;
      }
    }
    return tPropList[tPart][Symbol.for("zshift")][tdir + 1];
  }

  solveLocShift(tPart, tdir, tClass) {
    if (voidp(tClass)) {
      tClass = this.pClass;
    }
    if (!memberExists(`${tClass}.props`)) {
      return 0;
    }
    const tPropList = value(field(getmemnum(`${tClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${tClass}.props is not valid!`, Symbol.for("solveLocShift"), Symbol.for("minor"));
      return 0;
    } else {
      if (voidp(tPropList[tPart])) {
        return 0;
      }
      if (voidp(tPropList[tPart][Symbol.for("locshift")])) {
        return 0;
      }
      if (tPropList[tPart][Symbol.for("locshift")].count <= tdir) {
        return 0;
      }
      const tShift = value(tPropList[tPart][Symbol.for("locshift")][tdir + 1]);
      if (ilk(tShift) == Symbol.for("point")) {
        return tShift;
      }
    }
    return 0;
  }

  solveMembers() {
    let tClass = this.pClass;
    let tSmallMem;
    if (tClass contains "*") {
      tSmallMem = `${tClass}_small`;
      tClass = tClass.char[`1..${offset("*", tClass) - 1}`];
      if (!memberExists(tSmallMem)) {
        tSmallMem = `${tClass}_small`;
      }
    } else {
      tSmallMem = `${tClass}_small`;
    }
    this.pSmallMember = tSmallMem;
    if (this.pXFactor == 32) {
      tClass = `s_${tClass}`;
    }
    if (this.pSprList.count > 0) {
      for (const tSpr of this.pSprList) {
        releaseSprite(tSpr.spriteNum);
      }
      this.pSprList = list();
    }
    let tMemNum = 1;
    let i = charToNum("a");
    let j = 1;
    let tLoczAdjust = -5;
    while (tMemNum > 0) {
      let tFound = 0;
      while (tFound == 0) {
        let tMemNameA = `${tClass}_${numToChar(i)}_0`;
        if (listp(this.pDimensions)) {
          tMemNameA = `${tMemNameA}_${this.pDimensions[1]}_${this.pDimensions[2]}`;
        }
        let tMemName;
        if (!voidp(this.pDirection)) {
          if (count(this.pDirection) >= j) {
            tMemName = `${tMemNameA}_${this.pDirection[j]}_${this.pAnimFrame}`;
          } else {
            tMemName = `${tMemNameA}_${this.pDirection[1]}_${this.pAnimFrame}`;
          }
        } else {
          tMemName = `${tMemNameA}_${this.pAnimFrame}`;
        }
        tMemNum = getmemnum(tMemName);
        const tOldMemName = tMemName;
        if (!tMemNum) {
          tMemName = `${tMemNameA}_0_${this.pAnimFrame}`;
          tMemNum = getmemnum(tMemName);
        }
        if (!tMemNum && (j == 1)) {
          tFound = 0;
          if (listp(this.pDirection)) {
            for (let tdir = 1; tdir <= this.pDirection.count; tdir++) {
              this.pDirection[tdir] = integer(this.pDirection[tdir] + 1);
            }
            if (this.pDirection[1] == 8) {
              error(this, `Couldn't define members: ${tClass}`, Symbol.for("solveMembers"), Symbol.for("minor"));
              if (this.pXFactor == 32) {
                tMemNum = getmemnum("s_room_object_placeholder");
              } else {
                tMemNum = getmemnum("room_object_placeholder");
              }
              this.pDirection = list(0, 0, 0);
              tFound = 1;
            }
          }
          continue;
        }
        tFound = 1;
      }
      if (tMemNum != 0) {
        let tSpr;
        if (count(this.pSprList) >= j) {
          tSpr = this.pSprList[j];
        } else {
          const tTargetID = getThread(Symbol.for("room")).getInterface().getID();
          tSpr = sprite(reserveSprite(this.getID()));
          if (tSpr == sprite(0)) {
            const tRoomThread = getThread(Symbol.for("room"));
            if (!voidp(tRoomThread)) {
              tRoomThread.getComponent().releaseSpritesFromActiveObjects();
            }
            return error(this, `Could not reserve sprite for: ${tClass}`, Symbol.for("solveMembers"), Symbol.for("major"));
          }
          this.pSprList.add(tSpr);
          setEventBroker(tSpr.spriteNum, this.getID());
          tSpr.registerProcedure(Symbol.for("eventProcActiveObj"), tTargetID, Symbol.for("mouseDown"));
          tSpr.registerProcedure(Symbol.for("eventProcActiveRollOver"), tTargetID, Symbol.for("mouseEnter"));
          tSpr.registerProcedure(Symbol.for("eventProcActiveRollOver"), tTargetID, Symbol.for("mouseLeave"));
        }
        if (this.pLoczList.count < this.pSprList.count) {
          this.pLoczList.add(list());
        }
        if (this.pLocShiftList.count < this.pSprList.count) {
          this.pLocShiftList.add(list());
        }
        for (let tdir = 0; tdir <= 7; tdir++) {
          this.pLoczList.getLast().add(integer(this.solveLocZ(numToChar(i), tdir, tClass)) + tLoczAdjust);
          this.pLocShiftList.getLast().add(this.solveLocShift(numToChar(i), tdir, tClass));
        }
        tLoczAdjust = tLoczAdjust + 1;
        if (!voidp(tSpr) && (tSpr != sprite(0))) {
          if (tMemNum < 1) {
            tMemNum = abs(tMemNum);
            tSpr.rotation = 180;
            tSpr.skew = 180;
          }
          tSpr.castNum = tMemNum;
          tSpr.width = member(tMemNum).width;
          tSpr.height = member(tMemNum).height;
          tSpr.ink = this.solveInk(numToChar(i), tClass);
          tSpr.blend = this.solveBlend(numToChar(i), tClass);
          if (j <= this.pPartColors.count) {
            if (string(this.pPartColors[j]).char[1] == "#") {
              tSpr.bgColor = rgb(this.pPartColors[j]);
            } else {
              tSpr.bgColor = paletteIndex(integer(this.pPartColors[j]));
            }
          }
        } else {
          return error(this, "Out of sprites!!!", Symbol.for("solveMembers"), Symbol.for("major"));
        }
      }
      i = i + 1;
      j = j + 1;
    }
    let tShadowName = `${tClass}_sd`;
    if (listp(this.pDirection)) {
      tShadowName = `${tShadowName}_${this.pDirection[1]}`;
    }
    const tShadowNum = getmemnum(tShadowName);
    if (!tShadowNum && listp(this.pDirection)) {
      tShadowNum = getmemnum(`${tClass}_sd`);
    }
    let tShadowManager;
    if (threadExists(Symbol.for("room"))) {
      const tRoomThread = getThread(Symbol.for("room"));
      const tComponent = tRoomThread.getComponent();
      tShadowManager = tComponent.getShadowManager();
    } else {
      return 0;
    }
    const tID = this.getID();
    const tRoomType = getObject(Symbol.for("session")).GET("lastroom")[Symbol.for("type")];
    if (tRoomType != Symbol.for("private")) {
      if (tShadowNum != 0) {
        const tSpr = sprite(reserveSprite(tID));
        this.pSprList.add(tSpr);
        this.pLoczList.add(list(-4000, -4000, -4000, -4000, -4000, -4000, -4000));
        this.pLocShiftList.add(list(0, 0, 0, 0, 0, 0, 0, 0));
        if (tShadowNum < 0) {
          tShadowNum = abs(tShadowNum);
          tSpr.rotation = 180;
          tSpr.skew = 180;
          tSpr.locH = tSpr.locH + this.pXFactor;
        }
        tSpr.castNum = tShadowNum;
        tSpr.width = member(tShadowNum).width;
        tSpr.height = member(tShadowNum).height;
        tSpr.ink = this.solveInk("sd");
        tSpr.blend = this.solveBlend("sd");
        if (tSpr.blend == 100) {
          tSpr.blend = 20;
        }
      }
    } else {
      if (voidp(tShadowManager)) {
        return 0;
      }
      tShadowManager.removeShadow(tID);
      if ((tShadowNum != 0) && (this.pLocH == integer(this.pLocH))) {
        const tProps = propList();
        const tScreenLocs = tRoomThread.getInterface().getGeometry().getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH);
        let tmember = member(tShadowNum);
        if (tShadowNum < 0) {
          tShadowNum = abs(tShadowNum);
          tmember = member(tShadowNum);
          tProps[Symbol.for("multiflip")] = 1;
          tProps[Symbol.for("offsetx")] = this.pXFactor;
        }
        tProps[Symbol.for("member")] = member(tShadowNum).name;
        tProps[Symbol.for("locH")] = tScreenLocs[1];
        tProps[Symbol.for("locV")] = tScreenLocs[2];
        tProps[Symbol.for("width")] = tmember.width;
        tProps[Symbol.for("height")] = tmember.height;
        tProps[Symbol.for("id")] = tID;
        tShadowManager.addShadow(tProps);
        tShadowManager.render();
      }
    }
    if (this.pSprList.count > 0) {
      return 1;
    } else {
      return error(this, `Couldn't define members: ${tClass}`, Symbol.for("solveMembers"), Symbol.for("major"));
    }
  }

  updateLocation() {
    const tScreenLocs = getThread(Symbol.for("room")).getInterface().getGeometry().getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH);
    let i = 0;
    for (const tSpr of this.pSprList) {
      i = i + 1;
      tSpr.locH = tScreenLocs[1];
      tSpr.locV = tScreenLocs[2];
      if (tSpr.rotation == 180) {
        tSpr.locH = tSpr.locH + this.pXFactor;
      }
      if (this.pDirection[1] < 0) {
        this.pDirection[1] = 0;
      }
      if ((this.pDirection[1] + 1) > this.pLocShiftList[i].count) {
        this.pDirection[1] = 0;
      }
      const tLocShift = this.pLocShiftList[i][this.pDirection[1] + 1];
      tSpr.loc = tSpr.loc + tLocShift;
      const tZ = this.pLoczList[i][this.pDirection[1] + 1];
      if (this.pCorrectLocZ) {
        tSpr.locZ = tScreenLocs[3] + (this.pLocH * 1000) + tZ - 1;
        continue;
      }
      tSpr.locZ = tScreenLocs[3] + tZ - 1;
    }
    this.relocate(this.pSprList);
  }
}
