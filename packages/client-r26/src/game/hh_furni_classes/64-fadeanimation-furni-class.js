export default class {
  pActiveLayer;
  pCounter;
  pAnimLength;
  pCrossFadeLength;
  pAnimState;

  define(tProps) {
    this.pAnimState = 0;
    this.pActiveLayer = 0;
    this.pAnimLength = 20;
    this.pCrossFadeLength = this.pAnimLength / 2;
    const tRetVal = callAncestor(Symbol.for("define"), [this], tProps);
    for (let i = this.pLayerDataList.count; i >= 1; i--) {
      for (let j = 1; j <= this.pLayerDataList[i].count; j++) {
        if (this.pLayerDataList[i][j][Symbol.for("frames")].count > 1) {
          this.pAnimState = j;
        }
      }
      if (this.pAnimState > 0) {
        break;
      }
    }
    if (this.pAnimState > 0) {
      for (let i = 1; i <= this.pLayerDataList.count; i++) {
        if (this.pLayerDataList[i].count >= this.pAnimState) {
          if (this.pLayerDataList[i][this.pAnimState][Symbol.for("frames")].count > 1) {
            this.pActiveLayer = i;
          }
        }
      }
    }
    if (this.pActiveLayer > 0) {
      const tAnimData = this.pLayerDataList[this.pActiveLayer][this.pAnimState];
      if (!voidp(tAnimData[Symbol.for("delay")])) {
        this.pAnimLength = tAnimData[Symbol.for("delay")];
        this.pCrossFadeLength = this.pAnimLength / 2;
      }
    }
    this.initBlends();
    return tRetVal;
  }

  update() {
    if ((this.pActiveLayer > 0) && (this.pActiveLayer <= this.pSprList.count) && (this.pState == this.pAnimState)) {
      if ((this.pCounter > ((this.pAnimLength / 2) - this.pCrossFadeLength)) && (this.pCounter <= (this.pAnimLength / 2))) {
        const tDelta = this.pCounter - ((this.pAnimLength / 2) - this.pCrossFadeLength);
        this.pSprList[this.pActiveLayer].blend = tDelta * 100 / this.pCrossFadeLength;
      } else {
        if (this.pCounter > (this.pAnimLength - this.pCrossFadeLength)) {
          const tDelta = this.pCounter - (this.pAnimLength - this.pCrossFadeLength);
          this.pSprList[this.pActiveLayer].blend = (this.pCrossFadeLength - tDelta) * 100 / this.pCrossFadeLength;
        }
      }
      if (this.pCounter == this.pAnimLength) {
        this.pCounter = 1;
        this.initBlends();
      } else {
        this.pCounter = this.pCounter + 1;
      }
    }
    return callAncestor(Symbol.for("update"), [this]);
  }

  setState(tNewState) {
    tNewState = value(tNewState);
    if (tNewState == this.pAnimState) {
      this.pCounter = 1;
    }
    const tRetVal = callAncestor(Symbol.for("setState"), [this], tNewState);
    this.initBlends();
    return tRetVal;
  }

  initBlends() {
    if (this.pActiveLayer > 0) {
      if (this.pState == this.pAnimState) {
        this.pSprList[this.pActiveLayer].blend = 0;
      } else {
        this.pSprList[this.pActiveLayer].blend = 100;
      }
    }
    return 1;
  }
}
