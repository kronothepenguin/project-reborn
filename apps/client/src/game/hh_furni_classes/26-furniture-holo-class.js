export default class {
  pActive;
  pAnimFrm;
  pDelay;

  prepare(tdata) {
    this.pActive = 0;
    this.pAnimFrm = 0;
    this.pDelay = 1;
    if (tdata[Symbol.for("stuffdata")] == "ON") {
      this.setOn();
    } else {
      this.setOff();
    }
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "ON") {
      this.setOn();
    } else {
      this.setOff();
    }
  }

  update() {
    if (!this.pActive) {
      return;
    }
    if (this.pSprList.count < 3) {
      return;
    }
    if (this.pDelay == 0) {
      this.pAnimFrm = (this.pAnimFrm + 1) % 8;
      const tNameB = this.pSprList[2].member.name;
      const tNameC = this.pSprList[3].member.name;
      const tNewNameB = `${tNameB.char[`1..${length(tNameB) - 3}`]}${this.pAnimFrm}_1`;
      const tNewNameC = `${tNameC.char[`1..${length(tNameC) - 3}`]}${this.pAnimFrm}_1`;
      let tmember = member(getmemnum(tNewNameB));
      this.pSprList[2].castNum = tmember.number;
      this.pSprList[2].width = tmember.width;
      this.pSprList[2].height = tmember.height;
      this.pSprList[2].blend = 36;
      tmember = member(getmemnum(tNewNameC));
      this.pSprList[3].castNum = tmember.number;
      this.pSprList[3].width = tmember.width;
      this.pSprList[3].height = tmember.height;
      this.pSprList[3].blend = 70;
    } else {
      if (this.pDelay == 3) {
        this.pSprList[2].blend = 66;
        this.pSprList[3].blend = 100;
      }
    }
    this.pDelay = (this.pDelay + 1) % 4;
  }

  setHoloLight() {
    if (this.pSprList.count < 4) {
      return 0;
    }
    const tNameA = this.pSprList[1].member.name;
    const tNameB = this.pSprList[2].member.name;
    const tNameC = this.pSprList[3].member.name;
    const tNameD = this.pSprList[4].member.name;
    const tNewNameA = `${tNameA.char[`1..${length(tNameA) - 1}`]}${this.pActive}`;
    const tNewNameB = `${tNameB.char[`1..${length(tNameB) - 3}`]}${0}_0`;
    const tNewNameC = `${tNameC.char[`1..${length(tNameC) - 3}`]}${0}_0`;
    const tNewNameD = `${tNameD.char[`1..${length(tNameD) - 1}`]}${this.pActive}`;
    let tmember = member(getmemnum(tNewNameA));
    this.pSprList[1].castNum = tmember.number;
    this.pSprList[1].width = tmember.width;
    this.pSprList[1].height = tmember.height;
    tmember = member(getmemnum(tNewNameB));
    this.pSprList[2].castNum = tmember.number;
    this.pSprList[2].width = tmember.width;
    this.pSprList[2].height = tmember.height;
    this.pSprList[2].ink = 36;
    tmember = member(getmemnum(tNewNameC));
    this.pSprList[3].castNum = tmember.number;
    this.pSprList[3].width = tmember.width;
    this.pSprList[3].height = tmember.height;
    this.pSprList[3].ink = 36;
    tmember = member(getmemnum(tNewNameD));
    this.pSprList[4].castNum = tmember.number;
    this.pSprList[4].width = tmember.width;
    this.pSprList[4].height = tmember.height;
    this.pSprList[4].ink = 33;
  }

  setOn() {
    this.pActive = 1;
    this.setHoloLight();
  }

  setOff() {
    this.pActive = 0;
    this.setHoloLight();
  }

  select() {
    if (the.doubleClick) {
      let tOnString;
      if (this.pActive == 1) {
        tOnString = "OFF";
      } else {
        tOnString = "ON";
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", tOnString));
    }
  }
}
