export default class {
  pChanges;
  pActive;
  pTimer;
  pNextChange;

  prepare(tdata) {
    if (tdata[Symbol.for("stuffdata")] == "ON") {
      this.pActive = 1;
    } else {
      this.pActive = 0;
    }
    this.pChanges = 1;
    this.pTimer = 0;
    this.pNextChange = random(36) + 12;
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "OFF") {
      this.pActive = 0;
    } else {
      this.pActive = 1;
    }
    if (this.pSprList.count < 2) {
      return 0;
    }
    this.pSprList[2].castNum = 0;
    this.pChanges = 1;
  }

  update() {
    if (!this.pChanges) {
      return;
    }
    if (this.pSprList.count < 2) {
      return;
    }
    if (this.pActive) {
      let tClass;
      if (this.pXFactor == 32) {
        tClass = "s_red_tv";
      } else {
        tClass = "red_tv";
      }
      this.pTimer = this.pTimer + 1;
      if (this.pTimer < this.pNextChange) {
        return;
      }
      this.pTimer = 0;
      this.pNextChange = random(36) + 12;
      const tNewName = `${tClass}_b_0_1_1_2_${random(8) - 1}`;
      if (memberExists(tNewName)) {
        const tmember = member(getmemnum(tNewName));
        this.pSprList[2].castNum = tmember.number;
        this.pSprList[2].width = tmember.width;
        this.pSprList[2].height = tmember.height;
        this.pSprList[2].locZ = this.pSprList[1].locZ + 2;
      }
    } else {
      this.pSprList[2].castNum = 0;
      this.pChanges = 0;
    }
  }

  setOn() {
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "ON"));
  }

  setOff() {
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "OFF"));
  }

  select() {
    if (the.doubleClick) {
      if (this.pActive) {
        this.setOff();
      } else {
        this.setOn();
      }
    }
    return 1;
  }
}
