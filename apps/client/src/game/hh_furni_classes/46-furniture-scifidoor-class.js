export default class {
  pChanges;
  pActive;
  pLastActive;
  pScifiDoorSpeed;
  pScifiDoorLocs;
  pScifiDoorTimer;
  pScifiDoorTimeOut;
  pDoubleClick;
  pSizeMultiplier;
  pStopped;

  construct() {
    this.pLastActive = -1;
    this.pScifiDoorSpeed = 7;
    this.pScifiDoorTimeOut = 0.40000000000000002 * 60;
    this.pScifiDoorLocs = list(0, 0, 0);
    this.pScifiDoorTimer = 0;
    this.pDoubleClick = 0;
    this.pStopped = 1;
    if (this.pXFactor == 32) {
      this.pSizeMultiplier = 0.5;
    } else {
      this.pSizeMultiplier = 1.0;
    }
  }

  prepareForMove() {
    this.pChanges = 1;
    this.update();
  }

  prepare(tdata) {
    if (tdata[Symbol.for("stuffdata")] == "O") {
      this.setOn();
    } else {
      this.setOff();
    }
    this.pScifiDoorTimer = the.timer;
    this.pChanges = 1;
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "O") {
      this.setOn();
    } else {
      this.setOff();
    }
    this.pScifiDoorTimer = the.timer;
    this.pStopped = 0;
    this.pChanges = 1;
    this.pDoubleClick = 0;
  }

  update() {
    if (!this.pChanges) {
      return 0;
    }
    if (this.pSprList.count < 4) {
      return 0;
    }
    return this.updateScifiDoor();
  }

  updateScifiDoor() {
    if (this.pSprList.count < 4) {
      return 0;
    }
    const tTopSp = this.pSprList[4];
    const tMidSp1 = this.pSprList[2];
    const tMidSp2 = this.pSprList[3];
    if ((this.pLastActive == 0) && (this.pActive == 0)) {
      this.pScifiDoorLocs = list(tTopSp.locV, tMidSp1.locV, tMidSp2.locV);
    }
    if (this.pStopped && (this.pActive == 0) && (this.pLastActive == -1)) {
      this.pScifiDoorLocs = list(tTopSp.locV, tMidSp1.locV, tMidSp2.locV);
      this.pLastActive = 0;
      this.pChanges = 0;
      return 1;
    }
    if (this.pStopped && (((this.pLastActive == 1) && (this.pActive == 1)) || (this.pLastActive == -1))) {
      this.pScifiDoorLocs = list(tTopSp.locV, tMidSp1.locV, tMidSp2.locV);
      return this.SetScifiDoor("down");
    }
    const tDoorTimer = the.timer - this.pScifiDoorTimer;
    if (this.pActive) {
      tTopSp.locV = tTopSp.locV + this.pScifiDoorSpeed;
      this.moveTopLine(tMidSp1, -this.pScifiDoorSpeed);
      this.moveTopLine(tMidSp2, -this.pScifiDoorSpeed);
      if ((tMidSp1.height <= (11 * this.pSizeMultiplier)) || (tDoorTimer > this.pScifiDoorTimeOut)) {
        this.SetScifiDoor("down");
      }
    } else {
      if (tDoorTimer > this.pScifiDoorTimeOut) {
        return this.SetScifiDoor("up");
      }
      if (this.pSizeMultiplier == 1.0) {
        tTopSp.locV = tTopSp.locV - this.pScifiDoorSpeed;
      } else {
        tTopSp.locV = tTopSp.locV - this.pScifiDoorSpeed;
      }
      this.moveTopLine(tMidSp1, this.pScifiDoorSpeed);
      this.moveTopLine(tMidSp2, this.pScifiDoorSpeed);
      if (tMidSp1.height > (65 * this.pSizeMultiplier)) {
        this.SetScifiDoor("up");
      }
    }
    return 1;
  }

  SetScifiDoor(tdir) {
    if (this.pSprList.count < 4) {
      return 0;
    }
    const tTopSp = this.pSprList[4];
    const tMidSp1 = this.pSprList[2];
    const tMidSp2 = this.pSprList[3];
    if (tdir == "up") {
      tTopSp.locV = this.pScifiDoorLocs[1];
      tMidSp1.height = 65 * this.pSizeMultiplier;
      tMidSp2.height = 64 * this.pSizeMultiplier;
      tMidSp1.locV = this.pScifiDoorLocs[2];
      tMidSp2.locV = this.pScifiDoorLocs[3];
    } else {
      if (this.pSizeMultiplier == 1.0) {
        tTopSp.locV = this.pScifiDoorLocs[1] + 57;
        tMidSp1.height = 8;
        tMidSp2.height = 7;
      } else {
        tTopSp.locV = this.pScifiDoorLocs[1] + 27;
        tMidSp1.height = 2;
        tMidSp2.height = 2;
      }
      tMidSp1.height = 8 * this.pSizeMultiplier;
      tMidSp2.height = 7 * this.pSizeMultiplier;
      tMidSp1.locV = this.pScifiDoorLocs[2] - (2 * this.pSizeMultiplier);
      tMidSp2.locV = this.pScifiDoorLocs[3] + (5 * this.pSizeMultiplier);
    }
    this.pChanges = 0;
    this.pLastActive = this.pActive;
    this.pStopped = 1;
    return 1;
  }

  moveTopLine(tSpr, tAmount) {
    const tBot = tSpr.bottom;
    tSpr.height = tSpr.height + tAmount;
    if (tBot > tSpr.bottom) {
      tSpr.locV = tSpr.locV + 1;
    }
    if (tBot < tSpr.bottom) {
      tSpr.locV = tSpr.locV - 1;
    }
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
      if (this.pChanges) {
        return 0;
      }
      this.pDoubleClick = 1;
      let tStr;
      if (this.pActive) {
        tStr = "C";
      } else {
        tStr = "O";
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", tStr));
    } else {
      if (!this.pDoubleClick && !this.pChanges) {
        getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX, "short", this.pLocY));
      }
    }
    return 1;
  }
}
