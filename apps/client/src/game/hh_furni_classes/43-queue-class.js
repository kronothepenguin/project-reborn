export default class {
  pState;
  pAnimFrame;
  pFrameCounter;
  pAnimStartTime;
  pAnimate;
  pAnimationTime;
  pMaxSkipFrames;
  pAnimLayer;

  prepare(tdata) {
    this.pAnimationTime = 600;
    this.pMaxSkipFrames = 1;
    this.pAnimFrame = 0;
    this.pFrameCounter = 0;
    const tstate = tdata[Symbol.for("extra")];
    if (!voidp(tstate)) {
      this.pState = tstate;
    } else {
      this.pState = 2;
    }
    if (this.pState == 3) {
      this.pAnimStartTime = the.milliSeconds;
    }
    for (let tSpriteNo = 2; tSpriteNo <= count(this.pSprList); tSpriteNo++) {
      removeEventBroker(this.pSprList[tSpriteNo].spriteNum);
    }
    this.pAnimLayer = numToChar(charToNum("a") + this.pSprList.count - 1);
    return 1;
  }

  updateStuffdata(tValue) {
    this.pState = tValue;
  }

  setAnimation(tValue) {
    this.pAnimate = 1;
    this.pAnimStartTime = the.milliSeconds;
    return 1;
  }

  update() {
    if (this.pState < 2) {
      return 1;
    } else {
      if (this.pAnimate != 1) {
        return 1;
      } else {
        this.pFrameCounter = this.pFrameCounter + 1;
        if (this.pFrameCounter > this.pMaxSkipFrames) {
          this.pFrameCounter = 0;
          this.pAnimFrame = this.pAnimFrame + 1;
          if (this.pAnimFrame > 2) {
            this.pAnimFrame = 0;
          }
          the.itemDelimiter = "_";
          const tMemName = this.pSprList[this.pSprList.count].member.name;
          const tClass = tMemName.item[`1..${tMemName.item.count - 6}`];
          const tNewName = `${tClass}_${this.pAnimLayer}_0_1_1_${this.pDirection[1]}_${this.pAnimFrame}`;
          if (memberExists(tNewName)) {
            this.pSprList[this.pSprList.count].member = member(abs(getmemnum(tNewName)));
          }
          if (this.pState == 2) {
            if ((the.milliSeconds - this.pAnimStartTime) > this.pAnimationTime) {
              this.pAnimate = 0;
            }
          }
        }
      }
    }
  }
}
