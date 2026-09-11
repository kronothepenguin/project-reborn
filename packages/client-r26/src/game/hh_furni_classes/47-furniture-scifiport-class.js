export default class {
  pChanges;
  pActive;

  prepare(tdata) {
    if (tdata[Symbol.for("stuffdata")] == "O") {
      this.setOn();
      this.pChanges = 1;
    } else {
      this.setOff();
      this.pChanges = 0;
    }
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "O") {
      this.setOn();
    } else {
      this.setOff();
    }
    this.pChanges = 1;
  }

  update() {
    if (!this.pChanges) {
      return;
    }
    if (this.pSprList.count < 4) {
      return;
    }
    return this.updateScifiPort();
  }

  updateScifiPort() {
    if (this.pSprList.count < 4) {
      return 0;
    }
    const tGateSp1 = this.pSprList[3];
    const tGateSp2 = this.pSprList[4];
    if (this.pActive) {
      tGateSp1.visible = 0;
      tGateSp2.visible = 0;
    } else {
      tGateSp1.visible = 1;
      tGateSp2.visible = 1;
    }
    this.pChanges = 0;
    return 1;
  }

  setOn() {
    this.pActive = 1;
  }

  setOff() {
    this.pActive = 0;
  }

  select() {
    if (the.doubleClick) {
      let tStr;
      if (this.pActive) {
        tStr = "C";
      } else {
        tStr = "O";
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", tStr));
    }
    return 1;
  }
}
