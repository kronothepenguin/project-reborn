export default class {
  pActiveLayer;
  pActiveLayerNew;
  pCounter;
  pAnimLength;
  pCrossFadeLength;
  pBlendSpriteList;

  define(tProps) {
    this.pAnimLength = 20;
    this.pCrossFadeLength = this.pAnimLength / 2;
    const tRetVal = callAncestor(Symbol.for("define"), [this], tProps);
    this.pBlendSpriteList = list();
    for (let i = 1; i <= this.pLayerDataList.count; i++) {
      if (this.pLayerDataList[i].count > 1) {
        this.pBlendSpriteList.add(i);
      }
    }
    return tRetVal;
  }

  update() {
    if (!voidp(this.pActiveLayer) && !voidp(this.pActiveLayerNew)) {
      if (this.pCounter > (this.pAnimLength - this.pCrossFadeLength)) {
        const tDelta = this.pCounter - (this.pAnimLength - this.pCrossFadeLength);
        if (this.pSprList.count >= this.pActiveLayer) {
          this.pSprList[this.pActiveLayer].blend = (this.pCrossFadeLength - tDelta) * 100 / this.pCrossFadeLength;
        }
        if (this.pSprList.count >= this.pActiveLayerNew) {
          this.pSprList[this.pActiveLayerNew].blend = tDelta * 100 / this.pCrossFadeLength;
        }
      }
      if (this.pCounter == this.pAnimLength) {
        this.pCounter = 1;
        const tList = this.pBlendSpriteList.duplicate();
        this.pActiveLayer = this.pActiveLayerNew;
        tList.deleteOne(this.pActiveLayer);
        const tAnimData = this.pLayerDataList[this.pActiveLayer][2];
        if (!voidp(tAnimData[Symbol.for("delay")])) {
          this.pAnimLength = tAnimData[Symbol.for("delay")];
          this.pCrossFadeLength = this.pAnimLength / 2;
        }
        this.pActiveLayerNew = tList[random(tList.count)];
        this.initBlends();
      } else {
        this.pCounter = this.pCounter + 1;
      }
    }
    return callAncestor(Symbol.for("update"), [this]);
  }

  setState(tNewState) {
    tNewState = value(tNewState);
    if (tNewState == 2) {
      this.pCounter = 1;
      if (voidp(this.pBlendSpriteList)) {
        this.pBlendSpriteList = list();
        for (let i = 1; i <= this.pLayerDataList.count; i++) {
          if (this.pLayerDataList[i].count > 1) {
            this.pBlendSpriteList.add(i);
          }
        }
      }
      const tList = this.pBlendSpriteList.duplicate();
      if (tList.count >= 2) {
        this.pActiveLayer = tList[random(tList.count)];
        tList.deleteOne(this.pActiveLayer);
        const tAnimData = this.pLayerDataList[this.pActiveLayer][2];
        if (!voidp(tAnimData[Symbol.for("delay")])) {
          this.pAnimLength = tAnimData[Symbol.for("delay")];
          this.pCrossFadeLength = this.pAnimLength / 2;
        }
        this.pActiveLayerNew = tList[random(tList.count)];
      }
    }
    const tRetVal = callAncestor(Symbol.for("setState"), [this], tNewState);
    this.initBlends();
    return tRetVal;
  }

  initBlends() {
    if (voidp(this.pBlendSpriteList)) {
      return 0;
    }
    for (const i of this.pBlendSpriteList) {
      if (this.pSprList.count >= i) {
        if (i == this.pActiveLayer) {
          this.pSprList[i].blend = 100;
          continue;
        }
        this.pSprList[i].blend = 0;
      }
    }
    return 1;
  }
}
