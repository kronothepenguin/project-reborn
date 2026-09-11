export default class {
  pTimer;
  pUpdateFrame;
  pActive;
  pLastFrm;

  prepare(tdata) {
    if (tdata.count == 0) {
      tdata = propList("runtimedata", "0");
    }
    this.updateRuntimeData(tdata[Symbol.for("runtimedata")]);
    return 1;
  }

  updateStuffdata(tValue) {
    return 1;
  }

  updateRuntimeData(tValue) {
    if (tValue == "1") {
      this.pUpdateFrame = 0;
      this.pActive = 1;
      this.pTimer = the.milliSeconds;
      this.pLastFrm = 0;
    } else {
      this.pUpdateFrame = 0;
      this.pActive = 0;
      this.pLastFrm = 0;
      if (this.pSprList.count > 3) {
        for (let i = 1; i <= 4; i++) {
          let tMemName = this.pSprList[i].member.name;
          tMemName = `${tMemName.char[`1..${length(tMemName) - 1}`]}${0}`;
          const tmember = member(getmemnum(tMemName));
          this.pSprList[i].castNum = tmember.number;
          this.pSprList[i].width = tmember.width;
          this.pSprList[i].height = tmember.height;
        }
      }
    }
  }

  update() {
    if (this.pActive) {
      this.pUpdateFrame = !this.pUpdateFrame;
      if (this.pUpdateFrame) {
        this.pLastFrm = (this.pLastFrm + 1) % 6;
        for (let i = 1; i <= 4; i++) {
          let tMemName = this.pSprList[i].member.name;
          tMemName = `${tMemName.char[`1..${length(tMemName) - 1}`]}${this.pLastFrm}`;
          const tmember = member(getmemnum(tMemName));
          this.pSprList[i].castNum = tmember.number;
          this.pSprList[i].width = tmember.width;
          this.pSprList[i].height = tmember.height;
        }
        if ((the.milliSeconds - this.pTimer) > 20000) {
          getConnection(Symbol.for("Info")).send("SETSTUFFDATA", propList("string", this.getID(), "string", "0"));
        }
      }
    }
  }
}
