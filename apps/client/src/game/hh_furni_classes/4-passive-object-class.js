export default class {
  pClass;
  pSprList;
  pDirection;
  pDimensions;
  pLoczList;
  pPartColors;
  pAnimFrame;
  pLocX;
  pLocY;
  pLocH;
  pAltitude;
  pXFactor;
  pCustom;
  pCorrectLocZ;

  construct() {
    this.pClass = EMPTY;
    this.pCustom = EMPTY;
    this.pSprList = list();
    this.pDirection = list();
    this.pDimensions = list();
    this.pLoczList = list();
    this.pPartColors = list();
    this.pAnimFrame = 0;
    this.pLocX = 0;
    this.pLocY = 0;
    this.pLocH = 0;
    this.pAltitude = 0;
    this.pXFactor = getThread(Symbol.for("room")).getInterface().getGeometry().pXFactor;
    if (this.pXFactor == 32) {
      this.pCorrectLocZ = 0;
    } else {
      this.pCorrectLocZ = 1;
    }
    return 1;
  }

  deconstruct() {
    for (const tSpr of this.pSprList) {
      releaseSprite(tSpr.spriteNum);
    }
    this.pSprList = list();
    return 1;
  }

  define(tdata) {
    this.pClass = tdata[Symbol.for("class")];
    this.pDirection = tdata[Symbol.for("direction")];
    this.pDimensions = tdata[Symbol.for("dimensions")];
    this.pLocX = tdata[Symbol.for("x")];
    this.pLocY = tdata[Symbol.for("y")];
    this.pLocH = tdata[Symbol.for("h")];
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

  prepare(tdata) {
    return 1;
  }

  getInfo() {
    const tInfo = propList();
    tInfo[Symbol.for("name")] = this.pClass;
    tInfo[Symbol.for("class")] = this.pClass;
    tInfo[Symbol.for("custom")] = this.pCustom;
    return tInfo;
  }

  getLocation() {
    return list(this.pLocX, this.pLocY, this.pLocH);
  }

  getDirection() {
    return this.pDirection;
  }

  getSprites() {
    return this.pSprList;
  }

  select() {
    return 0;
  }

  solveColors(tpartColors) {
    if (voidp(tpartColors)) {
      tpartColors = "0,0,0";
    }
    this.pPartColors = list();
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    for (let t = 1; t <= tpartColors.item.count; t++) {
      this.pPartColors.add(string(tpartColors.item[t]));
    }
    for (let j = this.pPartColors.count; j <= 4; j++) {
      this.pPartColors.add("*ffffff");
    }
    the.itemDelimiter = tDelim;
  }

  solveInk(tPart) {
    if (!memberExists(`${this.pClass}.props`)) {
      return 8;
    }
    const tPropList = value(field(getmemnum(`${this.pClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${this.pClass}.props is not valid!`, Symbol.for("solveInk"), Symbol.for("minor"));
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

  solveBlend(tPart) {
    if (!memberExists(`${this.pClass}.props`)) {
      return 100;
    }
    const tPropList = value(field(getmemnum(`${this.pClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${this.pClass}.props is not valid!`, Symbol.for("solveBlend"), Symbol.for("minor"));
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

  solveLocZ(tPart, tdir) {
    if (!memberExists(`${this.pClass}.props`)) {
      return 0;
    }
    const tPropList = value(field(getmemnum(`${this.pClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${this.pClass}.props is not valid!`, Symbol.for("solveLocZ"), Symbol.for("minor"));
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

  solveMembers() {
    let tTmpDirection;
    if (listp(this.pDirection)) {
      tTmpDirection = this.pDirection.duplicate();
    } else {
      tTmpDirection = this.pDirection;
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
    while (tMemNum > 0) {
      if (this.pClass == "null") {
        opopop = 0;
      }
      let tFound = 0;
      while (tFound == 0) {
        let tMemNameA = `${this.pClass}_${numToChar(i)}_0`;
        if (listp(this.pDimensions)) {
          tMemNameA = `${tMemNameA}_${this.pDimensions[1]}_${this.pDimensions[2]}`;
        }
        let tMemName;
        if (!voidp(tTmpDirection)) {
          if (count(tTmpDirection) >= j) {
            tMemName = `${tMemNameA}_${tTmpDirection[j]}_${this.pAnimFrame}`;
          } else {
            tMemName = `${tMemNameA}_${tTmpDirection[1]}_${this.pAnimFrame}`;
          }
        } else {
          tMemName = `${tMemNameA}_${this.pAnimFrame}`;
        }
        tMemNum = getmemnum(tMemName);
        const tOldMemName = tMemName;
        if (tMemNum == 0) {
          tMemName = `${tMemNameA}_0_${this.pAnimFrame}`;
          tMemNum = getmemnum(tMemName);
        }
        if ((tMemNum == 0) && (j == 1)) {
          tFound = 0;
          if (listp(this.pDirection)) {
            for (let tdir = 1; tdir <= tTmpDirection.count; tdir++) {
              tTmpDirection[tdir] = integer(tTmpDirection[tdir] + 1);
            }
            if (tTmpDirection[1] == 8) {
              return 0;
            }
          } else {
            return error(this, `No good object: ${this.pClass}`, Symbol.for("solveMembers"), Symbol.for("major"));
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
          tSpr = sprite(reserveSprite(this.getID()));
          this.pSprList.add(tSpr);
          setEventBroker(tSpr.spriteNum, this.getID());
          const tTargetID = getThread(Symbol.for("room")).getInterface().getID();
          tSpr.registerProcedure(Symbol.for("eventProcPassiveObj"), tTargetID, Symbol.for("mouseDown"));
        }
        if (!voidp(this.pDirection)) {
          if (count(this.pDirection) >= j) {
            this.pLoczList.add(this.solveLocZ(numToChar(i), this.pDirection[j]));
          } else {
            this.pLoczList.add(this.solveLocZ(numToChar(i), VOID));
          }
        } else {
          this.pLoczList.add(this.solveLocZ(numToChar(i), VOID));
        }
        if (!voidp(tSpr) && (tSpr != sprite(0))) {
          if (tMemNum < 1) {
            tMemNum = abs(tMemNum);
            tSpr.rotation = 180;
            tSpr.skew = 180;
          }
          tSpr.castNum = tMemNum;
          tSpr.width = member(tMemNum).width;
          tSpr.height = member(tMemNum).height;
          tSpr.ink = this.solveInk(numToChar(i));
          tSpr.blend = this.solveBlend(numToChar(i));
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
    let tShadowName = `${this.pClass}_sd`;
    if (listp(this.pDirection)) {
      tShadowName = `${tShadowName}_${this.pDirection[1]}`;
    }
    let tShadowNum = getmemnum(tShadowName);
    if (!tShadowNum && listp(tTmpDirection)) {
      tShadowNum = getmemnum(`${this.pClass}_sd`);
    }
    if (tShadowNum != 0) {
      const tSpr = sprite(reserveSprite(this.getID()));
      this.pSprList.add(tSpr);
      this.pLoczList.add(-4000);
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
    if (this.pSprList.count > 0) {
      return 1;
    } else {
      return error(this, `Couldn't define members: ${this.pClass}`, Symbol.for("solveMembers"), Symbol.for("major"));
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
      let tZ;
      if (i <= this.pLoczList.count) {
        tZ = this.pLoczList[i];
      } else {
        tZ = 0;
      }
      if (this.pCorrectLocZ) {
        tSpr.locZ = tScreenLocs[3] + (this.pLocH * 1000) + tZ;
        continue;
      }
      tSpr.locZ = tScreenLocs[3] + tZ;
    }
  }

  show() {
    for (const tSpr of this.pSprList) {
      tSpr.visible = 1;
    }
  }

  hide() {
    for (const tSpr of this.pSprList) {
      tSpr.visible = 0;
    }
  }
}
