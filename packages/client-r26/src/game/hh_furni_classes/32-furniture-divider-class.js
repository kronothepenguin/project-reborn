export default class {
  pChanges;
  pActive;

  prepare(tdata) {
    if (tdata[Symbol.for("stuffdata")] == "O") {
      this.setOn();
      this.pChanges = 1;
    } else {
      this.setOff();
      this.pChanges = 0;
    }
    for (let tLayer = 1; tLayer <= this.pSprList.count; tLayer++) {
      const tLayerName = numToChar(charToNum("a") + tLayer - 1);
      const tSpr = this.pSprList[tLayer];
      if (this.solveTransparency(tLayerName)) {
        removeEventBroker(tSpr.spriteNum);
      }
    }
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "O") {
      this.setOn();
    } else {
      this.setOff();
    }
    this.pChanges = 1;
  }

  update() {
    if (!this.pChanges) {
      return;
    }
    if (this.pSprList.count < 2) {
      return;
    }
    let tDirection = 0;
    if (this.pDirection.count > 0) {
      tDirection = this.pDirection[1];
    }
    const tIsGateSprite = list();
    const tScreenLocs = getThread(Symbol.for("room")).getInterface().getGeometry().getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH);
    for (let i = 1; i <= this.pSprList.count; i++) {
      const tCurName = this.pSprList[i].member.name;
      const tNewName = `${tCurName.char[`1..${length(tCurName) - 1}`]}${this.pActive}`;
      const tNewNameReal = `${tNewName.char[`1..${tNewName.length - 3}`]}${tDirection}_${this.pActive}`;
      let tMemNum = getmemnum(tNewNameReal);
      let tRealMem = 1;
      if (tMemNum == 0) {
        tMemNum = getmemnum(tNewName);
        tRealMem = 0;
      }
      if (abs(tMemNum) > 0) {
        const tmember = member(abs(tMemNum));
        this.pSprList[i].castNum = abs(tMemNum);
        this.pSprList[i].width = tmember.width;
        this.pSprList[i].height = tmember.height;
        if (tRealMem) {
          this.pSprList[i].locH = tScreenLocs[1];
          this.pSprList[i].locV = tScreenLocs[2];
          if (tMemNum < 0) {
            this.pSprList[i].rotation = 180;
            this.pSprList[i].skew = 180;
            this.pSprList[i].locH = this.pSprList[i].locH + this.pXFactor;
          } else {
            this.pSprList[i].rotation = 0;
            this.pSprList[i].skew = 0;
          }
        }
        if (this.pActive) {
          tIsGateSprite.append(i);
        }
      }
    }
    const tlocz = this.pLoczList[1][tDirection + 1];
    const tSpriteLocZ = this.pSprList[1].locZ;
    for (let i = 2; i <= this.pSprList.count; i++) {
      this.pSprList[i].locZ = tSpriteLocZ + (this.pLoczList[i][tDirection + 1] - tlocz);
    }
    this.pChanges = 0;
  }

  setOn() {
    this.pActive = 1;
  }

  setOff() {
    this.pActive = 0;
  }

  select() {
    if (the.doubleClick) {
      let tStr;
      if (this.pActive) {
        tStr = "C";
      } else {
        tStr = "O";
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", tStr));
    }
    return 1;
  }

  solveTransparency(tPart) {
    let tName = this.pClass;
    if (this.pXFactor == 32) {
      tName = `s_${tName}`;
    }
    if (memberExists(`${tName}.props`)) {
      const tPropList = value(member(getmemnum(`${tName}.props`)).text);
      if (ilk(tPropList) != Symbol.for("propList")) {
        error(this, `${tName}.props is not valid!`, Symbol.for("solveInk"), Symbol.for("minor"));
      } else {
        if (tPropList[tPart] != VOID) {
          if (tPropList[tPart][Symbol.for("transparent")] != VOID) {
            return tPropList[tPart][Symbol.for("transparent")];
          }
        }
      }
    }
    return 0;
  }
}
