export default class {
  pRunning;
  pStateCount;
  pTargetState;

  define(tProps) {
    this.pRunning = 0;
    this.pTargetState = 0;
    const tRetVal = callAncestor(Symbol.for("define"), [this], tProps);
    this.pStateCount = (this.pStateSequenceList.count - 2) / 3;
    this.pRunning = 1;
    return tRetVal;
  }

  select() {
    if (the.doubleClick) {
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SPIN_WHEEL_OF_FORTUNE", propList("integer", value(this.getID())));
    }
    return 1;
  }

  update() {
    if (this.pIsAnimatingList.findPos(1) == 0) {
      if (this.pState == ((this.pStateCount * 3) + 1)) {
        this.setState((this.pStateCount * 3) + 2);
      } else {
        if (this.pState == ((this.pStateCount * 3) + 2)) {
          if (this.pTargetState) {
            this.setState(this.pStateCount + this.pTargetState);
          } else {
            this.setState((this.pStateCount * 3) + 2);
          }
        } else {
          if ((this.pState == (this.pStateCount + this.pTargetState)) && (this.pTargetState != 0)) {
            this.setState((this.pStateCount * 2) + this.pTargetState);
            this.pTargetState = 0;
          }
        }
      }
    }
    return callAncestor(Symbol.for("update"), [this]);
  }

  setState(tNewState) {
    tNewState = value(tNewState);
    if (tNewState == -1) {
      if (this.pRunning) {
        tNewState = (this.pStateCount * 3) + 1;
      } else {
        tNewState = (this.pStateCount * 3) + 2;
      }
    }
    let tRetVal;
    if ((tNewState >= 1) && (tNewState <= this.pStateCount)) {
      if (this.pRunning) {
        if ((this.pTargetState == 0) && ((this.pState == ((this.pStateCount * 3) + 1)) || (this.pState == ((this.pStateCount * 3) + 2)))) {
          this.pTargetState = tNewState;
        }
      } else {
        tRetVal = callAncestor(Symbol.for("setState"), [this], tNewState);
      }
    } else {
      tRetVal = callAncestor(Symbol.for("setState"), [this], tNewState);
    }
    return tRetVal;
  }
}
