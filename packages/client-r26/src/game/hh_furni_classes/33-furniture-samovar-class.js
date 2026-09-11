export default class {
  pTokenList;

  prepare() {
    this.pTokenList = value(getVariable(`obj_${this.pClass}`));
    if (!listp(this.pTokenList)) {
      this.pTokenList = list(1);
    }
    return 1;
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
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX, "short", this.pLocY - 1));
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
    tConnection.send("LOOKTO", `${this.pLocX} ${this.pLocY}`);
    tConnection.send("CARRYDRINK", this.getDrinkname());
  }

  getDrinkname() {
    return this.pTokenList[random(this.pTokenList.count)];
  }
}
