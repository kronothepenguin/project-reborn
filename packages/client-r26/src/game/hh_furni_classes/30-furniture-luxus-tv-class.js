export default class {
  pProgramOn;
  pAnimFrame;
  pAnimFrameDuration;
  pAnimFrameCounter;
  pUpdateCount;
  pAnimLoop;
  pTotalLoopCount;
  pUpdatesToWaitOnLastFrame;
  pTotalFrameCount;

  prepare(tdata) {
    this.pUpdateCount = 0;
    this.pAnimFrame = 0;
    this.pAnimLoop = 1;
    this.pUpdatesToWaitOnLastFrame = 1;
    if (this.pXFactor == 32) {
      this.pAnimFrameDuration = 1;
      this.pTotalLoopCount = 0;
    } else {
      this.pAnimFrameDuration = 15;
      this.pTotalLoopCount = 1;
    }
    this.pAnimFrameCounter = this.pAnimFrameDuration;
    this.pTotalFrameCount = 1;
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
    if (this.pSprList.count < 4) {
      return 0;
    }
    this.pUpdateCount = this.pUpdateCount + 1;
    if (this.pUpdateCount < 3) {
      return 1;
    }
    this.pUpdateCount = 0;
    let tName = this.pSprList[4].member.name;
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    tName = `${tName.item[`1..${tName.item.count - 1}`]}_`;
    the.itemDelimiter = tDelim;
    let tNewName;
    if (this.pProgramOn) {
      if (this.pAnimLoop >= 1) {
        this.pAnimFrameCounter = this.pAnimFrameCounter + 1;
        if (this.pAnimFrameCounter < this.pAnimFrameDuration) {
          return 1;
        }
        this.pAnimFrameCounter = 0;
        tNewName = `${tName}${this.pAnimFrame}`;
        this.pAnimFrame = this.pAnimFrame + 1;
        if ((this.pTotalFrameCount <= this.pAnimFrame) && memberExists(`${tName}${this.pAnimFrame + 1}`)) {
          this.pTotalFrameCount = this.pAnimFrame + 1;
        }
        if (this.pAnimFrame == this.pTotalFrameCount) {
          if (this.pAnimLoop < this.pTotalLoopCount) {
            this.pAnimFrame = 1;
            this.pAnimLoop = this.pAnimLoop + 1;
          } else {
            this.pAnimLoop = 0;
            tNewName = `${tName}${this.pAnimFrame}`;
            this.pUpdatesToWaitOnLastFrame = 30 + random(40);
          }
        }
      } else {
        if (this.pAnimLoop == 0) {
          if (this.pAnimFrame <= this.pUpdatesToWaitOnLastFrame) {
            this.pAnimFrame = this.pAnimFrame + 1;
            return 1;
          } else {
            this.pAnimFrame = 1;
            this.pAnimLoop = 1;
            return 1;
          }
        }
      }
    } else {
      tNewName = `${tName}0`;
    }
    if (memberExists(tNewName)) {
      const tmember = member(getmemnum(tNewName));
      this.pSprList[4].castNum = tmember.number;
      this.pSprList[4].width = tmember.width;
      this.pSprList[4].height = tmember.height;
    }
    this.pSprList[4].locZ = this.pSprList[1].locZ + 2;
  }

  setOn() {
    this.pFramesToWaitOnLastFrame = 0;
    this.pAnimFrameCounter = this.pAnimFrameDuration;
    if (this.pXFactor == 32) {
      this.pTotalLoopCount = 4 + random(6);
    } else {
      this.pTotalLoopCount = 1;
    }
    this.pAnimLoop = 1;
    this.pAnimFrame = 1;
    this.pProgramOn = 1;
  }

  setOff() {
    this.pProgramOn = 0;
  }

  select() {
    if (the.doubleClick) {
      let tOnString;
      if (this.pProgramOn) {
        tOnString = "OFF";
      } else {
        tOnString = "ON";
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", tOnString));
    }
  }
}
