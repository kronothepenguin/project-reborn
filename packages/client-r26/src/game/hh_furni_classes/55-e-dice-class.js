export default class {
  pActive;
  pValue;

  prepare(tdata) {
    this.pActive = 1;
    this.pValue = integer(tdata[Symbol.for("stuffdata")]);
    if (!integerp(this.pValue)) {
      this.pValue = 1;
    }
    if (this.pValue > 6) {
      this.pValue = 6;
    }
    if (this.pValue < 0) {
      this.pValue = 0;
    }
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
    this.pActive = 1;
    if (tValue > 0) {
      this.pValue = tValue;
    } else {
      this.pValue = tValue;
    }
  }

  update() {
    if (this.pActive) {
      if (this.pSprList.count < 2) {
        return 0;
      }
      the.itemDelimiter = "_";
      const tMemName = this.pSprList[2].member.name;
      const tClass = tMemName.item[`1..${tMemName.item.count - 6}`];
      if (this.pSprList.count < 2) {
        return;
      }
      const tsprite = this.pSprList[2];
      let tmember;
      if (this.pValue < 0) {
        if (tsprite.castNum == getmemnum(`${tClass}_b_0_1_1_0_7`)) {
          tmember = member(getmemnum(`${tClass}_b_0_1_1_0_0`));
        } else {
          tmember = member(getmemnum(`${tClass}_b_0_1_1_0_7`));
        }
      } else {
        tmember = member(getmemnum(`${tClass}_b_0_1_1_0_${this.pValue}`));
        this.pActive = 0;
      }
      tsprite.castNum = tmember.number;
      tsprite.width = tmember.width;
      tsprite.height = tmember.height;
    }
  }
}
