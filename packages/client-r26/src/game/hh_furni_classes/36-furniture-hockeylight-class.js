export default class {
  pActive;
  pFrame;
  pCycles;
  pDelay;

  prepare(tdata) {
    this.pActive = 0;
    this.pFrame = 0;
    this.pCycles = 0;
    this.pDelay = 0;
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "I") {
      this.setOn();
    }
    return 1;
  }

  update() {
    if (!this.pActive) {
      return;
    }
    if (this.pSprList.count < 3) {
      return;
    }
    this.pDelay = !this.pDelay;
    if (this.pDelay) {
      return;
    }
    this.pFrame = this.pFrame + 1;
    if (this.pFrame == 5) {
      this.pFrame = 1;
      this.pCycles = this.pCycles + 1;
      if (this.pCycles == 4) {
        this.pCycles = 0;
        this.setOff();
      }
    }
    the.itemDelimiter = "_";
    const tMemName = this.pSprList[3].member.name;
    const tClass = tMemName.item[`1..${tMemName.item.count - 6}`];
    let tmember;
    if (this.pActive) {
      tmember = member(getmemnum(`${tClass}_c_0_1_1_0_${this.pFrame}`));
    } else {
      tmember = member(getmemnum(`${tClass}_c_0_1_1_0_0`));
    }
    this.pSprList[3].castNum = tmember.number;
    this.pSprList[3].width = tmember.width;
    this.pSprList[3].height = tmember.height;
  }

  setOn() {
    this.pActive = 1;
  }

  setOff() {
    this.pActive = 0;
  }

  select() {
    if (the.doubleClick) {
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "I"));
    }
    return 1;
  }
}
