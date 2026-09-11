export default class {
  pState;
  pBlinkCounter;

  prepare(tdata) {
    this.setState(tdata[Symbol.for("stuffdata")]);
    return 1;
  }

  updateStuffdata(tValue) {
    this.setState(tValue);
  }

  setState(tValue) {
    if (this.pSprList.count < 5) {
      return 0;
    }
    this.pBlinkCounter = 0;
    this.pState = tValue;
    this.pSprList[5].visible = (this.pState == "1");
    return 1;
  }

  update() {
    if (this.pState != "1") {
      return 1;
    }
    if (this.pSprList.count < 5) {
      return 0;
    }
    if (this.pBlinkCounter == 0) {
      this.pSprList[5].visible = 1;
    }
    if (this.pBlinkCounter == 20) {
      this.pSprList[5].visible = 0;
    }
    this.pBlinkCounter = this.pBlinkCounter + 1;
    if (this.pBlinkCounter > 45) {
      this.pBlinkCounter = 0;
    }
  }

  select() {
    if (the.doubleClick) {
      switch (this.pState) {
        case "1":
          this.pState = "0";
          break;
        default:
          this.pState = "1";
          break;
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", this.pState));
    }
    return 1;
  }
}
