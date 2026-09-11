export default class {
  pState;
  pFrame;
  pLastUpdate;

  deconstruct() {
    for (const tSpr of this.pSprList) {
      releaseSprite(tSpr.spriteNum);
    }
    this.pSprList = list();
    this.pState = 3;
    return 1;
  }

  prepare(tdata) {
    if (tdata[Symbol.for("stuffdata")] == "ON") {
      this.setOn();
    }
    this.pFrame = 0;
    this.pLastUpdate = the.milliSeconds;
    return 1;
  }

  updateStuffdata(tValue) {
    this.pFrame = 0;
    this.pLastUpdate = the.milliSeconds;
    if (tValue == "ON") {
      this.setOn();
    } else {
      this.setOff();
    }
  }

  update() {
    if (the.milliSeconds < this.pLastUpdate) {
      return;
    }
    if (this.pSprList.count < 2) {
      return 0;
    }
    if (this.pState == 1) {
      const tAnim = list(0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 3, 2, 3, 3, 1, 0);
      this.pFrame = this.pFrame + 1;
      if (this.pFrame > tAnim.count) {
        this.pFrame = 1;
      }
      const tName = this.pSprList[2].member.name;
      if (tName != EMPTY) {
        const tmember = member(getmemnum(`${tName.char[`1..${length(tName) - 1}`]}${tAnim[this.pFrame]}`));
        this.pSprList[2].castNum = tmember.number;
        this.pSprList[2].width = tmember.width;
        this.pSprList[2].height = tmember.height;
        if (this.pFrame == tAnim.count) {
          this.pLastUpdate = the.milliSeconds + 4000;
        } else {
          this.pLastUpdate = the.milliSeconds + 100;
        }
      }
    } else {
      if (this.pState == 2) {
        this.pState = 3;
        this.pFrame = 0;
        const tName = this.pSprList[2].member.name;
        if (tName != EMPTY) {
          const tmember = member(getmemnum(`${tName.char[`1..${length(tName) - 1}`]}${this.pFrame}`));
          this.pSprList[2].castNum = tmember.number;
          this.pSprList[2].width = tmember.width;
          this.pSprList[2].height = tmember.height;
        }
      }
    }
  }

  setOn() {
    this.pState = 1;
  }

  setOff() {
    this.pState = 2;
  }

  select() {
    if (the.doubleClick) {
      let tOnString;
      if (this.pState == 1) {
        tOnString = "OFF";
      } else {
        tOnString = "ON";
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", tOnString));
    }
  }
}
