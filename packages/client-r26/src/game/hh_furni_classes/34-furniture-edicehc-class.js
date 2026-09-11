export default class {
  pActive;
  pValue;
  pAnimStart;
  pChanges;

  prepare(tdata) {
    this.pChanges = 1;
    this.pAnimStart = 0;
    this.pValue = integer(tdata[Symbol.for("stuffdata")]);
    if (!integerp(this.pValue)) {
      this.pValue = 1;
    }
    if ((this.pValue > 6) || (this.pValue < 0)) {
      this.pValue = 0;
    }
    this.update();
    return 1;
  }

  select() {
    if (this.pSprList.count < 2) {
      return 0;
    }
    if (rollover(this.pSprList[2])) {
      if (the.doubleClick) {
        const tUserObj = getThread(Symbol.for("room")).getComponent().getOwnUser();
        if (!tUserObj) {
          return 1;
        }
        if ((abs(tUserObj.pLocX - this.pLocX) > 1) || (abs(tUserObj.pLocY - this.pLocY) > 1)) {
          for (let tX = this.pLocX - 1; tX <= this.pLocX + 1; tX++) {
            for (let tY = this.pLocY - 1; tY <= this.pLocY + 1; tY++) {
              if ((tY == this.pLocY) || (tX == this.pLocX)) {
                if (getThread(Symbol.for("room")).getInterface().getGeometry().emptyTile(tX, tY)) {
                  getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", tX, "short", tY));
                  return 1;
                }
              }
            }
          }
        } else {
          if (this.pActive == 0) {
            getThread(Symbol.for("room")).getComponent().getRoomConnection().send("THROW_DICE", this.getID());
          }
        }
      }
    } else {
      if (rollover(this.pSprList[1]) && the.doubleClick && (this.pActive == 0)) {
        getThread(Symbol.for("room")).getComponent().getRoomConnection().send("DICE_OFF", this.getID());
        return 1;
      }
    }
    return 1;
  }

  diceThrown(tValue) {
    this.pChanges = 1;
    this.pValue = tValue;
    if (this.pValue < 0) {
      this.pValue = 0;
      this.pActive = 1;
    }
    return 1;
  }

  update() {
    if (this.pSprList.count < 3) {
      return;
    }
    if (this.pChanges == 0) {
      return;
    }
    const tName = this.pSprList[2].member.name;
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    const tClass = tName.item[`1..${tName.item.count - 6}`];
    the.itemDelimiter = tDelim;
    let tSprite1;
    let tSprite2;
    let tMember1;
    let tMember2;
    if (this.pActive) {
      tSprite1 = this.pSprList[2];
      tSprite2 = this.pSprList[3];
      tMember2 = member(getmemnum(`${tClass}_c_0_1_1_0_1`));
      if (this.pValue <= 0) {
        if (tSprite1.castNum == getmemnum(`${tClass}_b_0_1_1_0_7`)) {
          tMember1 = member(getmemnum(`${tClass}_b_0_1_1_0_0`));
        } else {
          tMember1 = member(getmemnum(`${tClass}_b_0_1_1_0_7`));
        }
      } else {
        tMember1 = member(getmemnum(`${tClass}_b_0_1_1_0_${this.pValue}`));
        this.pActive = 0;
        this.pChanges = 1;
      }
    } else {
      tSprite1 = this.pSprList[2];
      tSprite2 = this.pSprList[3];
      tMember1 = tSprite1.member;
      if (integer(this.pValue) == 0) {
        tMember2 = member(getmemnum(`${tClass}_c_0_1_1_0_0`));
      } else {
        tMember1 = member(getmemnum(`${tClass}_b_0_1_1_0_${this.pValue}`));
        tMember2 = member(getmemnum(`${tClass}_c_0_1_1_0_1`));
      }
      this.pChanges = 0;
    }
    tSprite1.member = tMember1;
    tSprite1.width = tMember1.width;
    tSprite1.height = tMember1.height;
    tSprite2.member = tMember2;
    tSprite2.width = tMember2.width;
    tSprite2.height = tMember2.height;
    return 1;
  }
}
