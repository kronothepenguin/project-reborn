export default class {
  ancestor;
  pPart;
  pmodel;
  pDirection;
  pDrawProps;
  pSwimProps;
  pAction;
  pActionLh;
  pActionRh;
  pMemString;
  pXFix;
  pYFix;
  pCacheImage;
  pCacheRectA;
  pCacheRectB;
  pAnimation;
  pAnimFrame;
  pTotalFrame;

  deconsturct() {
    this.ancestor = VOID;
    return 1;
  }

  define(tPart, tmodel, tColor, tDirection, tAction, tAncestor) {
    this.ancestor = tAncestor;
    this.pPart = tPart;
    this.pmodel = tmodel;
    this.pDrawProps = propList("maskImage", 0, "ink", 0, "bgColor", 0);
    this.pSwimProps = propList("maskImage", 0, "ink", 0, "bgColor", rgb(0, 156, 156), "color", rgb(0, 156, 156), "blend", 60);
    this.pCacheImage = 0;
    this.pCacheRectA = rect(0, 0, 0, 0);
    this.pCacheRectB = rect(0, 0, 0, 0);
    this.defineInk();
    this.setColor(tColor);
    this.pDirection = tDirection;
    this.pAction = tAction;
    this.pActionLh = tAction;
    this.pActionRh = tAction;
    this.pMemString = EMPTY;
    this.pXFix = 0;
    this.pYFix = 0;
    this.pAnimation = 0;
    this.pAnimFrame = 1;
    this.pTotalFrame = 1;
    return 1;
  }

  update() {
    let tAnimCounter = 0;
    let tAction = this.pAction;
    let tPart = this.pPart;
    let tdir = this.pFlipList[this.pDirection + 1];
    this.pXFix = 0;
    this.pYFix = 0;
    let tUnderWater;
    let tMemString;
    if (this.pAnimating) {
      tMemString = this.animate();
    } else {
      switch (this.pPart) {
        case "bd":
        case "lg":
        case "sh":
          tUnderWater = 1;
          if ((this.pAction == "wlk") || (this.pAction == "swm") || (this.pAction == "sws")) {
            tAnimCounter = this.pAnimCounter;
          }
          break;
        case "lh":
        case "ls":
          tUnderWater = 1;
          if (this.pDirection == tdir) {
            if (!voidp(this.pActionLh)) {
              tAction = this.pActionLh;
            }
          } else {
            if (!voidp(this.pActionRh)) {
              tAction = this.pActionRh;
            }
          }
          if ((tAction == "wlk") || (this.pAction == "swm") || (this.pAction == "sws")) {
            tAnimCounter = this.pAnimCounter;
          } else {
            if (tAction == "wav") {
              tAnimCounter = this.pAnimCounter % 2;
            } else {
              if (list("crr", "drk", "ohd").getPos(tAction) != 0) {
                this.pXFix = -40;
                tPart = `r${tPart.char[2]}`;
                tdir = this.pDirection;
              }
            }
          }
          break;
        case "rh":
        case "rs":
          tUnderWater = 1;
          if (this.pDirection == tdir) {
            if (!voidp(this.pActionRh)) {
              tAction = this.pActionRh;
            }
          } else {
            if (!voidp(this.pActionLh)) {
              tAction = this.pActionLh;
            }
          }
          if ((tAction == "wlk") || (this.pAction == "swm") || (this.pAction == "sws")) {
            tAnimCounter = this.pAnimCounter;
          } else {
            if (tAction == "wav") {
              tAnimCounter = this.pAnimCounter % 2;
              tPart = `l${tPart.char[2]}`;
              tdir = this.pDirection;
            }
          }
          break;
        case "hd":
        case "fc":
          tUnderWater = 0;
          if (this.pTalking) {
            if (this.pAction == "lay") {
              tAction = "lsp";
            } else {
              tAction = "spk";
            }
            tAnimCounter = this.pAnimCounter % 2;
          }
          break;
        case "ey":
          tUnderWater = 0;
          if (this.pTalking && (this.pAction != "lay") && ((this.pAnimCounter % 2) == 0)) {
            this.pYFix = -1;
          }
          break;
        case "hr":
          tUnderWater = 0;
          if (this.pTalking && ((this.pAnimCounter % 2) == 0)) {
            if (this.pAction != "lay") {
              tAction = "spk";
            }
          }
          break;
        case "ri":
          if (!this.pCarrying) {
            return;
          }
          tAction = this.pActionRh;
          tdir = this.pDirection;
          break;
        case "li":
          tAction = this.pActionLh;
          tdir = this.pDirection;
          break;
        default:
          tUnderWater = 1;
      }
      tMemString = `${this.pPeopleSize}_${tAction}_${tPart}_${this.pmodel}_${tdir}_${tAnimCounter}`;
    }
    if (this.pMemString != tMemString) {
      const tMemNum = getmemnum(tMemString);
      if (tMemNum > 0) {
        this.pMemString = tMemString;
        const tmember = member(tMemNum);
        const tRegPnt = tmember.regPoint;
        const tX = -tRegPnt[1];
        const tY = this.pBuffer.rect.height - tRegPnt[2] - 10;
        this.pCacheImage = tmember.image;
        this.pCacheRectA = rect(tX, tY, tX + this.pCacheImage.width, tY + this.pCacheImage.height);
        this.pCacheRectB = this.pCacheImage.rect;
        this.pDrawProps[Symbol.for("maskImage")] = this.pCacheImage.createMatte();
      } else {
        return;
      }
    }
    let tRectMod;
    if (this.pMainAction == "swm") {
      tRectMod = rect(14, 0, 14, 0) + rect(this.pLocFix, this.pLocFix) + list(this.pXFix, this.pYFix, this.pXFix, this.pYFix);
    } else {
      tRectMod = rect(this.pLocFix, this.pLocFix) + list(this.pXFix, this.pYFix, this.pXFix, this.pYFix);
    }
    this.pBuffer.copyPixels(this.pCacheImage, this.pCacheRectA + tRectMod, this.pCacheRectB, this.pDrawProps);
    if (tUnderWater && this.pSwim) {
      this.pSwimProps[Symbol.for("maskImage")] = this.pDrawProps[Symbol.for("maskImage")];
      this.pBuffer.copyPixels(this.pCacheImage, this.pCacheRectA + tRectMod, this.pCacheRectB, this.pSwimProps);
    }
  }

  render() {
    if (memberExists(this.pMemString)) {
      this.pBuffer.copyPixels(this.pCacheRectB, this.pCacheRectA, this.pCacheRectB, this.pDrawProps);
      if (this.pSwim) {
        this.pSwimProps[Symbol.for("maskImage")] = this.pDrawProps[Symbol.for("maskImage")];
        this.pBuffer.copyPixels(this.pCacheImage, this.pCacheRectA + list(this.pXFix, this.pYFix, this.pXFix, this.pYFix) + rect(this.pLocFix, this.pLocFix), this.pCacheRectB, this.pSwimProps);
      }
    }
  }

  setItemObj(tmodel) {
    if ((this.pPart != "ri") && (this.pPart != "li")) {
      return;
    }
    this.pmodel = tmodel;
  }

  defineDir(tdir, tPart) {
    if (voidp(tPart) || (tPart == this.pPart)) {
      this.pDirection = tdir;
    }
  }

  defineDirMultiple(tdir, tTargetPartList) {
    if (tTargetPartList.getPos(this.pPart) == 0) {
      return;
    }
    this.pDirection = tdir;
  }

  defineAct(tAct, tTargetPartList) {
    if (this.pAction == "std") {
      this.pAction = tAct;
    }
  }

  defineActMultiple(tAct, tTargetPartList) {
    if (tTargetPartList.getPos(this.pPart) == 0) {
      return;
    }
    if (this.pAction == "std") {
      this.pAction = tAct;
    }
    if ((this.pPart == "ey") && (tAct == "std")) {
      this.pAction = "std";
    }
  }

  defineInk(tInk) {
    if (voidp(tInk)) {
      switch (this.pPart) {
        case "ey":
          tInk = 36;
          break;
        case "sd":
          tInk = 32;
          break;
        case "ri":
          tInk = 8;
          break;
        case "li":
          tInk = 8;
          break;
        default:
          tInk = 41;
      }
    }
    this.pDrawProps[Symbol.for("ink")] = tInk;
    this.pSwimProps[Symbol.for("ink")] = tInk;
    return 1;
  }

  setModel(tmodel) {
    this.pmodel = tmodel;
  }

  setColor(tColor) {
    if (voidp(tColor)) {
      return 0;
    }
    if (tColor == EMPTY) {
      return 0;
    }
    if ((tColor.ilk == Symbol.for("color")) && (this.pDrawProps[Symbol.for("ink")] != 36)) {
      this.pDrawProps[Symbol.for("bgColor")] = tColor;
    } else {
      this.pDrawProps[Symbol.for("bgColor")] = rgb(255, 255, 255);
    }
    return 1;
  }

  doHandWork(tAct) {
    if (list("lh", "ls", "li", "rh", "rs", "ri").getOne(this.pPart) != 0) {
      this.pAction = tAct;
    }
  }

  doHandWorkLeft(tAct) {
    this.pActionLh = tAct;
  }

  doHandWorkRight(tAct) {
    this.pActionRh = tAct;
  }

  layDown() {
    this.pAction = "lay";
  }

  getCurrentMember() {
    return this.pMemString;
  }

  getColor() {
    return this.pDrawProps[Symbol.for("bgColor")];
  }

  getDirection() {
    return this.pDirection;
  }

  getLocation() {
    if (voidp(this.pMemString)) {
      return 0;
    }
    const tMemNum = getmemnum(this.pMemString);
    if (tMemNum == 0) {
      return 0;
    }
    const tImgRect = member(tMemNum).rect;
    const tCenterPoint = point(tImgRect.width / 2, tImgRect.height / 2);
    const tRegPoint = member(tMemNum).regPoint;
    return (tRegPoint * -1) + tCenterPoint;
  }

  copyPicture(tImg, tdir, tHumanSize, tAction, tAnimFrame) {
    if (voidp(tdir)) {
      tdir = "2";
    }
    if (voidp(tHumanSize)) {
      tHumanSize = "h";
    }
    if (voidp(tAction)) {
      tAction = "std";
    }
    if (voidp(tAnimFrame)) {
      tAnimFrame = "0";
    }
    let tMemName = `${tHumanSize}_${tAction}_${this.pPart}_${this.pmodel}_${tdir}_${tAnimFrame}`;
    let tMemNum = getmemnum(tMemName);
    if (tMemNum == 0) {
      const tmodel = `0${this.pmodel.char[`2..3`]}`;
      tMemName = `${tHumanSize}_${tAction}_${this.pPart}_${tmodel}_${tdir}_${tAnimFrame}`;
      tMemNum = getmemnum(tMemName);
      if (tMemNum == 0) {
        return 0;
      }
    }
    const tmember = member(tMemNum);
    const tImage = tmember.image;
    const tRegPnt = tmember.regPoint;
    const tX = -tRegPnt[1];
    const tY = tImg.rect.height - tRegPnt[2] - 10;
    const tRect = rect(tX, tY, tX + tImage.width, tY + tImage.height);
    const tMatte = tImage.createMatte();
    tImg.copyPixels(tImage, tRect, tImage.rect, propList("maskImage", tMatte, "ink", this.pDrawProps[Symbol.for("ink")], "bgColor", this.pDrawProps[Symbol.for("bgColor")]));
    return 1;
  }

  reset(tSwimFlag) {
    this.pAction = "std";
    this.pActionLh = VOID;
    this.pActionRh = VOID;
  }

  setAnimation(tPart, tAnim) {
    if (tPart != this.pPart) {
      return;
    }
    this.pAnimation = value(tAnim);
    this.pTotalFrame = this.pAnimation[1].count;
    this.pAnimFrame = 1;
  }

  remAnimation() {
    this.pAnimation = 0;
    this.pAnimFrame = 1;
    this.pTotalFrame = 1;
  }

  animate() {
    if (!this.pAnimation) {
      return EMPTY;
    }
    const tdir = this.pFlipList[this.pDirection + 1] + this.pAnimation[Symbol.for("OffD")][this.pAnimFrame];
    this.pXFix = this.pAnimation[Symbol.for("OffX")][this.pAnimFrame];
    this.pYFix = this.pAnimation[Symbol.for("OffY")][this.pAnimFrame];
    const tMemName = `${this.pPeopleSize}_${this.pAnimation[Symbol.for("act")][this.pAnimFrame]}_${this.pPart}_${this.pmodel}_${tdir}_${this.pAnimation[Symbol.for("frm")][this.pAnimFrame]}`;
    this.pAnimFrame = this.pAnimFrame + 1;
    if (this.pAnimFrame > this.pTotalFrame) {
      this.pAnimFrame = 1;
    }
    return tMemName;
  }
}
