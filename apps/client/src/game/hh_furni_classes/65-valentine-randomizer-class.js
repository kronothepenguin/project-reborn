export default class {
  pRunning;
  pStateCount;
  pTargetState;
  pExtraStateCount;
  pRollStartMillis;
  pFlippedLayerDataList;
  pOriginalLayerDataList;

  define(tProps) {
    this.pRunning = 0;
    this.pTargetState = 0;
    this.pExtraStateCount = 3;
    this.pRollStartMillis = 0;
    const tRetVal = callAncestor(Symbol.for("define"), [this], tProps);
    this.pStateCount = (this.pStateSequenceList.count - this.pExtraStateCount) / 2;
    this.pFlippedLayerDataList = this.pLayerDataList.duplicate();
    this.pOriginalLayerDataList = this.pLayerDataList.duplicate();
    const tLayerCount = this.pFlippedLayerDataList.count;
    for (let j = 1; j <= 2; j++) {
      for (let i = 1; i <= this.pStateCount / 2; i++) {
        const tTmp = this.pFlippedLayerDataList[tLayerCount - (this.pStateCount * j) + i].duplicate();
        const tTmp2 = this.pFlippedLayerDataList[tLayerCount - (this.pStateCount * j) + this.pStateCount + 1 - i].duplicate();
        this.pFlippedLayerDataList[tLayerCount - (this.pStateCount * j) + i] = tTmp2;
        this.pFlippedLayerDataList[tLayerCount - (this.pStateCount * j) + this.pStateCount + 1 - i] = tTmp;
      }
    }
    return tRetVal;
  }

  select() {
    if (the.doubleClick) {
      if ((this.pState == 1) || ((this.pState == this.pExtraStateCount) && ((the.milliSeconds - this.pRollStartMillis) > (15 * 1000)))) {
        getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SET_RANDOM_STATE", propList("integer", value(this.getID())));
        this.pRunning = 1;
      }
    } else {
      return 0;
    }
    return 1;
  }

  update() {
    if (this.pDirection[1] == 4) {
      this.pLayerDataList = this.pOriginalLayerDataList;
    } else {
      this.pLayerDataList = this.pFlippedLayerDataList;
    }
    if (this.pIsAnimatingList.findPos(1) == 0) {
      if (this.pState == (this.pExtraStateCount - 1)) {
        this.setStateInternal(this.pExtraStateCount);
      } else {
        if (this.pState == this.pExtraStateCount) {
          if (this.pTargetState) {
            this.setStateInternal(this.pExtraStateCount + this.pTargetState);
          } else {
            this.setStateInternal(this.pExtraStateCount);
          }
        } else {
          if (this.pState == (this.pExtraStateCount + this.pTargetState)) {
            this.setStateInternal(this.pExtraStateCount + this.pStateCount + this.pTargetState);
            this.pTargetState = 0;
          } else {
            if (this.pState > (this.pExtraStateCount + this.pStateCount)) {
              this.setStateInternal(1);
            }
          }
        }
      }
    }
    return callAncestor(Symbol.for("update"), [this]);
  }

  setState(tNewState) {
    tNewState = value(tNewState);
    if (tNewState > 1000) {
      tNewState = 0;
      this.pRunning = 1;
    }
    if (this.pRunning) {
      tNewState = -tNewState;
    }
    this.setStateInternal(tNewState);
  }

  setStateInternal(tNewState) {
    tNewState = value(tNewState);
    let tRetVal;
    if (!this.pRunning) {
      if (tNewState > 0) {
        tNewState = 1;
      }
    }
    if (tNewState <= 0) {
      tNewState = -tNewState;
      if (tNewState == 0) {
        this.pRollStartMillis = the.milliSeconds;
        if (this.pRunning) {
          callAncestor(Symbol.for("setState"), [this], this.pExtraStateCount - 1);
        } else {
          callAncestor(Symbol.for("setState"), [this], this.pExtraStateCount);
        }
      } else {
        if ((tNewState >= 1) && (tNewState <= this.pStateCount)) {
          this.pTargetState = tNewState;
        }
      }
    } else {
      tRetVal = callAncestor(Symbol.for("setState"), [this], tNewState);
    }
    return tRetVal;
  }
}
