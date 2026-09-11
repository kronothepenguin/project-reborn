export default class {
  pSeed;
  pModulus;
  pMult;
  pIncrement;

  construct() {
    this.pSeed = 1;
    this.pModulus = 16777216.0;
    this.pMult = 69069.0;
    this.pIncrement = 5.0;
    return 1;
  }

  setSeed(tSeed) {
    this.pSeed = tSeed;
  }

  setModulus(tModulus) {
    this.pModulus = tModulus;
  }

  iterate() {
    let tX = abs((integer(this.pMult) * integer(this.pSeed)) + integer(this.pIncrement)) % integer(this.pModulus);
    this.pSeed = tX;
    return tX;
  }

  getScaled(tMin, tMax) {
    let tX = this.iterate();
    if (voidp(tMin) && voidp(tMax)) {
      return tX;
    }
    let tRange = float(tMax - tMin);
    if (tRange == 0) {
      return tMin;
    }
    let tScale = this.pModulus / tRange;
    return integer((tX / tScale) + tMin);
  }

  getArray(tCount, tMin, tMax) {
    let tArray = list();
    for (let i = 1; i <= tCount; i++) {
      tArray.add(this.getScaled(tMin, tMax));
    }
    return tArray;
  }

  getArrayWithCountLimits(tCount, tMin, tMax, tLimitList) {
    if (!listp(tLimitList)) {
      return getArray(tCount, tMin, tMax);
    }
    let tArray = list();
    let tOrderList = list();
    for (let i = 1; i <= tCount; i++) {
      tOrderList[i] = i;
    }
    for (let i = 1; i <= tCount; i++) {
      let tTarget = this.getScaled(1, tCount);
      while (tTarget == i) {
        tTarget = this.getScaled(1, tCount);
      }
      let tTemp = tOrderList[i];
      tOrderList[i] = tOrderList[tTarget];
      tOrderList[tTarget] = tTemp;
    }
    let tLims = tLimitList.duplicate();
    let c = 1;
    while (c < (tCount + 1)) {
      let t = this.getScaled(tMin, tMax);
      let tCountLeft = tLims.getaProp(t);
      if (tCountLeft > 0) {
        tLims.setaProp(t, tCountLeft - 1);
      } else {
        if (!voidp(tCountLeft) && (tCountLeft > -1)) {
          continue;
        }
      }
      tArray[tOrderList[c]] = t;
      c = c + 1;
    }
    return tArray;
  }
}
