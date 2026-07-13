export default class {
  pState;

  prepare(tdata) {
    this.setState(tdata[Symbol.for("stuffdata")]);
    return 1;
  }

  updateStuffdata(tValue) {
    this.setState(tValue);
  }

  setState(tValue) {
    if (this.pSprList.count < 3) {
      return 0;
    }
    this.pState = tValue;
    switch (tValue) {
      case "1":
        this.switchMember("c", "0");
        this.pSprList[3].visible = 1;
        break;
      case "2":
        this.switchMember("c", "1");
        this.pSprList[3].visible = 1;
        break;
      default:
        this.pSprList[3].visible = 0;
        break;
    }
    return 1;
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
    return 1;
  }

  select() {
    if (the.doubleClick) {
      const tUserObj = getThread(Symbol.for("room")).getComponent().getOwnUser();
      if (!tUserObj) {
        return 1;
      }
      if ((abs(tUserObj.pLocX - this.pLocX) > 1) || (abs(tUserObj.pLocY - this.pLocY) > 1)) {
        return 1;
      }
      switch (this.pState) {
        case "0":
          this.pState = "1";
          break;
        case "1":
          this.pState = "2";
          break;
        default:
          this.pState = "0";
          break;
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", this.pState));
    }
    return 1;
  }
}
