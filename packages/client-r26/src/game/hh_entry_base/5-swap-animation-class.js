export default class {
  pPrefs;
  pAnimFrame;
  pInitDelayCounter;
  pAnimDelayCounter;
  pMemberClass;
  pPaletteClass;
  pCurrentFrame;
  pFrameList;
  pAnimLoopCounter;
  pAnimStopped;

  construct() {
    this.pFrameList = list();
    this.pPrefs = list();
    this.pCurrentFrame = 0;
    this.pAnimLoopCounter = 1;
    this.pAnimStopped = 1;
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    this.pAnimStopped = 1;
    return 1;
  }

  define(tPrefs) {
    this.pPrefs = tPrefs;
    let tMem;
    if (this.pPrefs[Symbol.for("animType")] == Symbol.for("memberSwap")) {
      tMem = this.pPrefs[Symbol.for("sprite")].member.name;
      this.pMemberClass = chars(tMem, 1, tMem.length - 1);
    } else {
      if (ilk(this.pPrefs[Symbol.for("sprite")].member.paletteRef) != Symbol.for("member")) {
        return error(this, "Palette must be a cast member for palette animations!", Symbol.for("define"), Symbol.for("major"));
      }
      tMem = this.pPrefs[Symbol.for("sprite")].member.paletteRef.name;
      this.pPaletteClass = chars(tMem, 1, tMem.length - 1);
    }
    this.setInitDelay();
    this.setAnimDelay();
    if (this.pPrefs[Symbol.for("frameList")] != EMPTY) {
      this.pFrameList = value(this.pPrefs[Symbol.for("frameList")]);
    } else {
      let tMemFound = 1;
      let tIndex = 1;
      while (tMemFound && (tIndex < 100)) {
        if (this.pPrefs[Symbol.for("animType")] == Symbol.for("memberSwap")) {
          tMem = `${this.pMemberClass}${tIndex}`;
        } else {
          tMem = `${this.pPaletteClass}${tIndex}`;
        }
        if (memberExists(tMem)) {
          this.pFrameList.add(tIndex);
        } else {
          tMemFound = 0;
        }
        tIndex = tIndex + 1;
      }
    }
    this.pAnimStopped = 0;
    receiveUpdate(this.getID());
    return 1;
  }

  setInitDelay() {
    if (this.pPrefs[Symbol.for("initDelayType")] == Symbol.for("random")) {
      this.pInitDelayCounter = random(this.pPrefs[Symbol.for("initDelay")]);
    } else {
      this.pInitDelayCounter = this.pPrefs[Symbol.for("initDelay")];
    }
  }

  setAnimDelay() {
    if (this.pPrefs[Symbol.for("animDelayType")] == Symbol.for("random")) {
      this.pAnimDelayCounter = random(this.pPrefs[Symbol.for("animDelay")]);
    } else {
      this.pAnimDelayCounter = this.pPrefs[Symbol.for("animDelay")];
    }
  }

  update() {
    if (this.pAnimStopped) {
      return 0;
    }
    this.pInitDelayCounter = this.pInitDelayCounter - 1;
    if (this.pInitDelayCounter < 0) {
      this.pAnimDelayCounter = this.pAnimDelayCounter - 1;
      if (this.pAnimDelayCounter < 0) {
        this.advanceAnimFrame();
        this.setAnimDelay();
      }
    }
  }

  advanceAnimFrame() {
    if (this.pAnimStopped) {
      return 0;
    }
    this.pCurrentFrame = this.pCurrentFrame + 1;
    if (this.pCurrentFrame > this.pFrameList.count) {
      if (this.pPrefs[Symbol.for("animLoopCount")] > 0) {
        this.pAnimLoopCounter = this.pAnimLoopCounter + 1;
        if (this.pAnimLoopCounter > this.pPrefs[Symbol.for("animLoopCount")]) {
          return removeUpdate(this.getID());
        }
      }
      this.setInitDelay();
      if (this.pInitDelayCounter > 0) {
        this.pCurrentFrame = 0;
        return 0;
      } else {
        this.pCurrentFrame = 1;
      }
    }
    if (ilk(this.pFrameList) == Symbol.for("list")) {
      if (this.pFrameList.count > 0) {
        let tAnimFrame = value(this.pFrameList[this.pCurrentFrame]);
        if (this.pAnimStopped) {
          nothing();
        } else {
          let tMem;
          if (!voidp(this.pMemberClass)) {
            tMem = `${this.pMemberClass}${tAnimFrame}`;
            this.pPrefs[Symbol.for("sprite")].member = tMem;
            this.pPrefs[Symbol.for("sprite")].width = member(tMem).width;
            this.pPrefs[Symbol.for("sprite")].height = member(tMem).height;
          } else {
            tMem = `${this.pPaletteClass}${tAnimFrame}`;
            this.pPrefs[Symbol.for("sprite")].member.paletteRef = member(tMem);
          }
        }
      }
    }
  }
}
