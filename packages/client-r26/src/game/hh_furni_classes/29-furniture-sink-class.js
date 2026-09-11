export default class {
  pDoorTimer;
  pTokenList;

  prepare() {
    this.pTokenList = value(getVariable(`obj_${this.pClass}`));
    if (!listp(this.pTokenList)) {
      this.pTokenList = list(18);
    }
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "TRUE") {
      this.pDoorTimer = 80;
    } else {
      this.pDoorTimer = 0;
    }
  }

  select() {
    const tUserObj = getThread(Symbol.for("room")).getComponent().getOwnUser();
    if (tUserObj == 0) {
      return 1;
    }
    switch (this.pDirection[1]) {
      case 4:
        if ((this.pLocX == tUserObj.pLocX) && ((this.pLocY - tUserObj.pLocY) == -1)) {
          if (the.doubleClick) {
            this.giveDrink();
          }
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX, "short", this.pLocY + 1));
        }
        break;
      case 0:
        if ((this.pLocX == tUserObj.pLocX) && ((this.pLocY - tUserObj.pLocY) == 1)) {
          if (the.doubleClick) {
            this.giveDrink();
          }
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.locX, "short", this.pLocY - 1));
        }
        break;
      case 2:
        if ((this.pLocY == tUserObj.pLocY) && ((this.pLocX - tUserObj.pLocX) == -1)) {
          if (the.doubleClick) {
            this.giveDrink();
          }
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX + 1, "short", this.pLocY));
        }
        break;
      case 6:
        if ((this.pLocY == tUserObj.pLocY) && ((this.pLocX - tUserObj.pLocX) == 1)) {
          if (the.doubleClick) {
            this.giveDrink();
          }
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX - 1, "short", this.pLocY));
        }
        break;
    }
    return 1;
  }

  giveDrink() {
    const tConnection = getThread(Symbol.for("room")).getComponent().getRoomConnection();
    if (tConnection == 0) {
      return 0;
    }
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "TRUE"));
    tConnection.send("LOOKTO", `${this.pLocX} ${this.pLocY}`);
    tConnection.send("CARRYDRINK", this.getDrinkname());
  }

  getDrinkname() {
    return this.pTokenList[random(this.pTokenList.count)];
  }

  update() {
    if (this.pDoorTimer != 0) {
      if (this.pSprList.count < 2) {
        return;
      }
      let tName = this.pSprList[2].member.name;
      tName = `${tName.char[`1..${length(tName) - 1}`]}${1}`;
      let tmember = member(abs(getmemnum(tName)));
      this.pDoorTimer = this.pDoorTimer - 1;
      if (this.pDoorTimer == 0) {
        tName = `${tName.char[`1..${length(tName) - 1}`]}${0}`;
        tmember = member(getmemnum(tName));
      }
      this.pSprList[2].castNum = tmember.number;
      this.pSprList[2].width = tmember.width;
      this.pSprList[2].height = tmember.height;
    }
  }
}
