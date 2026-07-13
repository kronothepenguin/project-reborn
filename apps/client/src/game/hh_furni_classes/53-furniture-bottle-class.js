export default class {
  pChanges;
  pRolling;
  pRollDir;
  pRollingDirection;
  pRollingStartTime;
  pRollAnimDir;

  prepare(tdata) {
    if (tdata.findPos(Symbol.for("stuffdata"))) {
      this.pRollDir = integer(tdata[Symbol.for("stuffdata")]);
      if ((this.pRollDir < 0) || (this.pRollDir > 7)) {
        this.pRollDir = 0;
      }
    }
    this.pChanges = 1;
    this.pRolling = 0;
    this.update();
    return 1;
  }

  diceThrown(tValue) {
    if (tValue >= 0) {
      this.pRollDir = tValue;
      this.pRolling = 1;
      this.pChanges = 1;
    } else {
      this.startRolling();
    }
    return 1;
  }

  update() {
    if (!this.pChanges) {
      return;
    }
    if (this.pSprList.count < 1) {
      return;
    }
    if (this.pRolling) {
      this.roll();
      this.solveMembers();
      this.moveBy(0, 0, 0);
      this.pChanges = 1;
    } else {
      this.pDirection[1] = this.pRollDir;
      this.pDirection[2] = this.pRollDir;
      this.solveMembers();
      this.moveBy(0, 0, 0);
      this.pChanges = 0;
    }
    return 1;
  }

  roll() {
    if ((this.pRolling && ((the.milliSeconds - this.pRollingStartTime) < 3300)) || voidp(this.pRollDir)) {
      const tTime = the.milliSeconds - this.pRollingStartTime;
      const f = tTime * 1.0 / 3200.0 * 3.14158999999999988 * 0.5;
      this.pRollAnimDir = this.pRollAnimDir + (cos(f) * float(this.pRollingDirection));
      this.pDirection[1] = abs(integer(this.pRollAnimDir) % 8);
      this.pDirection[2] = abs(integer(this.pRollAnimDir) % 8);
    } else {
      this.pRolling = 0;
      this.pChanges = 1;
    }
    return 1;
  }

  startRolling() {
    this.pRollDir = VOID;
    this.pRollingStartTime = the.milliSeconds;
    this.pRollAnimDir = this.pDirection[1];
    if (random(2) == 1) {
      this.pRollingDirection = 1;
    } else {
      this.pRollingDirection = -1;
    }
    this.pRolling = 1;
    this.pChanges = 1;
    return 1;
  }

  select() {
    if (the.doubleClick && (this.pRolling == 0)) {
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("THROW_DICE", this.getID());
    }
    return 1;
  }
}
