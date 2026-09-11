export default class {
  pActive;
  pSync;
  pAnimFrame;
  pLastDir;
  pUserClicked;

  prepare(tdata) {
    this.pUserClicked = 0;
    this.pLastDir = -1;
    this.pSync = 0;
    return 1;
  }

  updateStuffdata(tValue) {
    this.pAnimFrame = 1;
    this.pActive = 1;
  }

  update() {
    if (this.pActive) {
      this.pSync = this.pSync + 1;
      if (this.pSync < 3) {
        return 1;
      }
      this.pSync = 0;
      if (this.pSprList.count < 5) {
        return 0;
      }
      if (this.pAnimFrame > 0) {
        switch (this.pAnimFrame) {
          case 1:
            this.switchMember("a", "1");
            break;
          case 2:
            this.switchMember("d", "1");
            break;
          case 3:
            this.switchMember("d", "2");
            break;
          case 4:
            this.switchMember("d", "3");
            break;
          case 5:
            this.switchMember("d", "4");
            break;
          case 6:
            this.switchMember("d", "5");
            break;
          case 7:
            this.switchMember("a", "0");
            break;
          case 8:
            if (this.pUserClicked) {
              this.giveDrink();
            }
            this.pUserClicked = 0;
            break;
          case 9:
            this.switchMember("d", "6");
            break;
          case 15:
            this.switchMember("d", "0");
            this.pAnimFrame = 0;
            this.pActive = 0;
            return 1;
        }
        this.pAnimFrame = this.pAnimFrame + 1;
      }
    }
  }

  switchMember(tPart, tNewMem) {
    const tSprNum = ["a", "b", "c", "d", "e", "f"].getPos(tPart);
    if ((this.pSprList.count < tSprNum) || (tSprNum == 0)) {
      return 0;
    }
    let tName = this.pSprList[tSprNum].member.name;
    tName = `${tName.char[`1..${tName.length - 1}`]}${tNewMem}`;
    if (memberExists(tName)) {
      const tmember = member(getmemnum(tName));
      this.pSprList[tSprNum].castNum = tmember.number;
      this.pSprList[tSprNum].width = tmember.width;
      this.pSprList[tSprNum].height = tmember.height;
    }
  }

  select() {
    const tUserObj = getThread(Symbol.for("room")).getComponent().getOwnUser();
    if (tUserObj == 0) {
      return 1;
    }
    const tCarrying = tUserObj.getProperty(Symbol.for("carrying"));
    const tloc = tUserObj.getProperty(Symbol.for("loc"));
    const tLocX = tloc[1];
    const tLocY = tloc[2];
    switch (this.pDirection[1]) {
      case 4:
        if ((this.pLocX == tLocX) && ((this.pLocY - tLocY) == -1)) {
          if (the.doubleClick && !tCarrying) {
            this.setAnimation();
          }
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX, "short", this.pLocY + 1));
        }
        break;
      case 0:
        if ((this.pLocX == tLocX) && ((this.pLocY - tLocY) == 1)) {
          if (the.doubleClick && !tCarrying) {
            this.setAnimation();
          }
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX, "short", this.pLocY - 1));
        }
        break;
      case 2:
        if ((this.pLocY == tLocY) && ((this.pLocX - tLocX) == -1)) {
          if (the.doubleClick && !tCarrying) {
            this.setAnimation();
          }
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX + 1, "short", this.pLocY));
        }
        break;
      case 6:
        if ((this.pLocY == tLocY) && ((this.pLocX - tLocX) == 1)) {
          if (the.doubleClick && !tCarrying) {
            this.setAnimation();
          }
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX - 1, "short", this.pLocY));
        }
        break;
    }
    return 1;
  }

  setAnimation() {
    if (this.pActive == 1) {
      return 1;
    }
    this.pUserClicked = 1;
    const tConnection = getThread(Symbol.for("room")).getComponent().getRoomConnection();
    if (tConnection == 0) {
      return 0;
    }
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "TRUE"));
    tConnection.send("LOOKTO", `${this.pLocX} ${this.pLocY}`);
  }

  giveDrink() {
    const tConnection = getThread(Symbol.for("room")).getComponent().getRoomConnection();
    if (tConnection == 0) {
      return 0;
    }
    let tClass = this.pClass;
    if (tClass.contains("*")) {
      tClass = tClass.char[`1..${offset("*", tClass) - 1}`];
    }
    let tToken = value(getVariable(`obj_${tClass}`));
    if (!listp(tToken)) {
      tToken = list(4);
    }
    tToken = tToken[1];
    tConnection.send("CARRYDRINK", tToken);
  }
}
