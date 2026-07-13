export default class {
  pTokenList;
  pDoorTimer;

  prepare() {
    let tClass = this.pClass;
    if (tClass contains "*") {
      tClass = tClass.char[`1..${offset("*", tClass) - 1}`];
    }
    if (tClass.char[`1..2`] == "s_") {
      tClass = tClass.char[`3..${tClass.length}`];
    }
    this.pTokenList = value(getVariable(`obj_${tClass}`));
    if (!listp(this.pTokenList)) {
      this.pTokenList = list(3);
    }
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "TRUE") {
      this.pDoorTimer = 43;
      this.openCloseDoor(Symbol.for("open"));
    } else {
      this.pDoorTimer = 0;
      this.openCloseDoor(Symbol.for("close"));
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
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "TRUE"));
    tConnection.send("LOOKTO", `${this.pLocX} ${this.pLocY}`);
    tConnection.send("CARRYDRINK", this.getDrinkname());
  }

  getDrinkname() {
    return this.pTokenList[random(this.pTokenList.count)];
  }

  openCloseDoor(tOpen) {
    let tFrame;
    if ((tOpen == Symbol.for("open")) || (tOpen == 1)) {
      tFrame = 1;
    } else {
      tFrame = 0;
    }
    for (const tsprite of this.pSprList) {
      const tCurName = tsprite.member.name;
      const tNewName = `${tCurName.char[`1..${length(tCurName) - 1}`]}${tFrame}`;
      if (memberExists(tNewName)) {
        const tMem = member(getmemnum(tNewName));
        tsprite.member = tMem;
        tsprite.width = tMem.width;
        tsprite.height = tMem.height;
      }
    }
  }

  update() {
    if (this.pDoorTimer != 0) {
      if (this.pSprList.count < 1) {
        return;
      }
      this.pDoorTimer = this.pDoorTimer - 1;
      if (this.pDoorTimer == 0) {
        this.openCloseDoor(Symbol.for("close"));
      }
    }
  }
}
