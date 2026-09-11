export default class {
  pTokenList;

  prepare() {
    this.pTokenList = value(getVariable(`obj_${this.pClass}`, "water"));
    if (!listp(this.pTokenList)) {
      this.pTokenList = list(7);
    }
    return 1;
  }

  select() {
    if (!threadExists(Symbol.for("room"))) {
      return error(this, "Room thread not found!!!", Symbol.for("select"), Symbol.for("major"));
    }
    const tUserObj = getThread(Symbol.for("room")).getComponent().getOwnUser();
    if (!tUserObj) {
      return error(this, `User object not found: ${getObject(Symbol.for("session")).GET("user_name")}`, Symbol.for("select"), Symbol.for("major"));
    }
    switch (this.pDirection[1]) {
      case 4:
        if ((this.pLocX == tUserObj.pLocX) && ((this.pLocY - tUserObj.pLocY) == -1)) {
          this.giveDrink();
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX, "short", this.pLocY + 1));
        }
        break;
      case 0:
        if ((this.pLocX == tUserObj.pLocX) && ((this.pLocY - tUserObj.pLocY) == 1)) {
          this.giveDrink();
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.locX, "short", this.pLocY - 1));
        }
        break;
      case 2:
        if ((this.pLocY == tUserObj.pLocY) && ((this.pLocX - tUserObj.pLocX) == -1)) {
          this.giveDrink();
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX + 1, "short", this.pLocY));
        }
        break;
      case 6:
        if ((this.pLocY == tUserObj.pLocY) && ((this.pLocX - tUserObj.pLocX) == 1)) {
          this.giveDrink();
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX - 1, "short", this.pLocY));
        }
        break;
    }
    return 1;
  }

  giveDrink() {
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("LOOKTO", `${this.pLocX} ${this.pLocY}`);
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("CARRYDRINK", this.pTokenList[random(this.pTokenList.count)]);
  }
}
