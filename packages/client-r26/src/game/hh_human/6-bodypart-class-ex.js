export default class {
  constructor() {
    this.pBody = undefined;
    this.pPart = undefined;
    this.pDirection = undefined;
    this.pAction = undefined;
    this.pXFix = undefined;
    this.pYFix = undefined;
    this.pLastLocFix = undefined;
    this.pLayerPropList = undefined;
    this.pAnimation = undefined;
    this.pAnimFrame = undefined;
    this.pTotalFrame = undefined;
    this.pAnimList = undefined;
    this.pFlipPart = undefined;
    this.pMemNumCache = undefined;
  }

  construct() {
    this.pMemNumCache = propList();
    this.pLayerPropList = list();
  }

  clearGraphics() {
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      const tdata = this.pLayerPropList[i];
      this.pBody.pUpdateRect = union(this.pBody.pUpdateRect, tdata["cacheRect"]);
    }
  }

  resetMemberCache() {
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      const tdata = this.pLayerPropList[i];
      tdata["memString"] = EMPTY;
    }
  }

  define(tPart, tmodel, tColor, tDirection, tAction, tBody, tFlipPart) {
    this.pBody = tBody;
    this.pPart = tPart;
    this.setModel(tmodel);
    this.defineInk();
    this.setColor(tColor);
    this.pDirection = tDirection;
    this.pAction = tAction;
    this.pXFix = 0;
    this.pYFix = 0;
    this.pLastLocFix = point(1000, 1000);
    this.pAnimation = 0;
    this.pAnimFrame = 1;
    this.pTotalFrame = 1;
    this.pAnimList = propList();
    this.pFlipPart = EMPTY;
    if (!voidp(tFlipPart)) {
      this.pFlipPart = tFlipPart;
    }
    return 1;
  }

  setAnimations(tAnimData) {
    if (ilk(tAnimData) == Symbol.for("propList")) {
      this.pAnimList = tAnimData;
    }
  }

  update(tForcedUpdate, tRectMod) {
    const tAction = this.pAction;
    let tPart = this.pPart;
    let tdir = this.pBody.pFlipList[this.pDirection + 1];
    this.pXFix = 0;
    this.pYFix = 0;
    if (voidp(tRectMod)) {
      tRectMod = rect(0, 0, 0, 0);
    } else {
      tRectMod = tRectMod.duplicate();
    }
    const tRectModOrig = tRectMod.duplicate();
    if (this.pBody.pAnimating) {
      this.animateUpdate();
    }
    const tLocFixChanged = this.pLastLocFix != point(this.pXFix + tRectMod[1], this.pYFix + tRectMod[2]);
    this.pLastLocFix = point(this.pXFix + tRectMod[1], this.pYFix + tRectMod[2]);
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      tRectMod = tRectModOrig.duplicate();
      const tdata = this.pLayerPropList[i];
      const tmodel = tdata["model"];
      const tDrawProps = tdata["drawProps"];
      const tFlipHOld = tdata["flipH"];
      let tMemString;
      if (this.pBody.pAnimating) {
        tMemString = this.animate(i);
      } else {
        if (this.pDirection == tdir) {
          tdata["flipH"] = 0;
        } else {
          tdata["flipH"] = 1;
        }
        let tAnimCntr = 0;
        if (!voidp(this.pAnimList[this.pAction])) {
          if (this.pAnimList[this.pAction].count > 0) {
            const tIndex = this.pBody.pAnimCounter % this.pAnimList[this.pAction].count;
            tAnimCntr = this.pAnimList[this.pAction][tIndex + 1];
          }
        }
        if (this.pFlipPart != EMPTY) {
          tMemString = `${this.pBody.pPeopleSize}_${tAction}_${tPart}_${tmodel}_${this.pDirection}_${tAnimCntr}`;
          const tMemNum = this.getMemNumFast(tMemString);
          if (tMemNum > 0) {
            tdir = this.pDirection;
            tdata["flipH"] = 0;
          } else {
            if (this.pDirection != tdir) {
              tPart = this.pFlipPart;
            }
          }
        }
        tMemString = `${this.pBody.pPeopleSize}_${tAction}_${tPart}_${tmodel}_${tdir}_${tAnimCntr}`;
      }
      if (tFlipHOld != tdata["flipH"]) {
        tForcedUpdate = 1;
      }
      if ((tdata["memString"] != tMemString) || tLocFixChanged || tForcedUpdate) {
        tdata["memString"] = tMemString;
        const tMemNum = this.getMemNumFast(tMemString);
        if (tMemNum > 0) {
          const tmember = member(tMemNum);
          const tRegPnt = tmember.regPoint;
          let tX = -tRegPnt[1];
          const tY = this.pBody.pBuffer.rect.height - tRegPnt[2] - 20;
          this.pBody.pUpdateRect = union(this.pBody.pUpdateRect, tdata["cacheRect"]);
          tdata["cacheImage"] = tmember.image;
          const tLocFix = this.pBody.pLocFix.duplicate();
          if (tdata["flipH"]) {
            tX = this.pBody.pBuffer.width - (tX + tmember.width);
            tLocFix[1] = -tLocFix[1];
            if (this.pBody.pPeopleSize == "sh") {
              tX = tX - 2;
            }
            tRectMod[1] = -tRectMod[1];
            tRectMod[3] = -tRectMod[3];
          }
          tdata["cacheRect"] = rect(tX, tY, tX + tdata["cacheImage"].width, tY + tdata["cacheImage"].height);
          tdata["cacheRect"] = tdata["cacheRect"] + [this.pXFix, this.pYFix, this.pXFix, this.pYFix] + rect(tLocFix, tLocFix) + tRectMod;
          tDrawProps[Symbol.for("maskImage")] = tdata["cacheImage"].createMatte();
          this.pBody.pUpdateRect = union(this.pBody.pUpdateRect, tdata["cacheRect"]);
        } else {
          this.pBody.pUpdateRect = union(this.pBody.pUpdateRect, tdata["cacheRect"]);
          tdata["cacheRect"] = rect(0, 0, 0, 0);
          tdata["cacheImage"] = 0;
        }
      }
      const tDrawArea = this.getDrawArea(i);
      if (tdata["cacheImage"] != 0) {
        this.pBody.pBuffer.copyPixels(tdata["cacheImage"], tDrawArea, tdata["cacheImage"].rect, tDrawProps);
      }
    }
    if (this.pBody.pAnimating) {
      this.pAnimFrame = this.pAnimFrame + 1;
      if (this.pAnimFrame > this.pTotalFrame) {
        this.pAnimFrame = 1;
      }
    }
  }

  render() {
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      const tdata = this.pLayerPropList[i];
      if (memberExists(tdata["memString"])) {
        const tDrawArea = this.getDrawArea(i);
        if (tdata["cacheImage"] != 0) {
          this.pBody.pBuffer.copyPixels(tdata["cacheImage"], tDrawArea, tdata["cacheImage"].rect, tdata["drawProps"]);
        }
      }
    }
  }

  defineDir(tdir, tPart) {
    if (voidp(tPart) || (tPart == this.pPart)) {
      this.pDirection = tdir;
    }
  }

  defineDirMultiple(tdir, tTargetPartList) {
    if (tTargetPartList.getOne(this.pPart)) {
      this.pDirection = tdir;
    }
  }

  defineAct(tAct, tTargetPartList) {
    this.pAction = tAct;
  }

  defineInk(tInk) {
    if (voidp(tInk)) {
      switch (this.pPart) {
        case "ey":
          tInk = 36;
          break;
        case "ri":
          tInk = 8;
          break;
        case "li":
          tInk = 8;
          break;
        default:
          tInk = 41;
          break;
      }
    }
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      const tDrawProps = this.pLayerPropList[i]["drawProps"];
      tDrawProps[Symbol.for("ink")] = tInk;
    }
    return 1;
  }

  setModel(tmodel) {
    if (ilk(tmodel) != Symbol.for("list")) {
      tmodel = list(tmodel);
    }
    this.clearGraphics();
    this.pLayerPropList = list();
    for (let i = 1; i <= tmodel.count; i++) {
      const tdata = propList();
      tdata["model"] = tmodel[i];
      tdata["flipH"] = 0;
      tdata["cacheImage"] = 0;
      tdata["cacheRect"] = rect(0, 0, 0, 0);
      tdata["drawProps"] = propList(Symbol.for("maskImage"), 0, Symbol.for("ink"), 0, Symbol.for("bgColor"), 0);
      tdata["memString"] = EMPTY;
      this.pLayerPropList.add(tdata);
    }
    this.defineInk();
  }

  setColor(tColorList) {
    if (voidp(tColorList)) {
      return 0;
    }
    if (tColorList == EMPTY) {
      return 0;
    }
    if (ilk(tColorList) != Symbol.for("list")) {
      tColorList = list(tColorList);
    }
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      let tColor;
      if (tColorList.count < i) {
        tColor = tColorList[1];
      } else {
        tColor = tColorList[i];
      }
      const tDrawProps = this.pLayerPropList[i]["drawProps"];
      if ((tColor.ilk == Symbol.for("color")) && (tDrawProps[Symbol.for("ink")] != 36)) {
        tDrawProps[Symbol.for("bgColor")] = tColor;
        continue;
      }
      tDrawProps[Symbol.for("bgColor")] = rgb(255, 255, 255);
    }
    return 1;
  }

  checkPartNotCarrying() {
    return !this.pBody.getPartCarrying(this.pPart);
  }

  doHandWorkLeft(tAct) {
    this.pAction = tAct;
  }

  doHandWorkRight(tAct) {
    this.pAction = tAct;
  }

  layDown() {
    this.pAction = "lay";
  }

  getColor() {
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      const tDrawProps = this.pLayerPropList[1]["drawProps"];
      if (tDrawProps[Symbol.for("bgColor")] != rgb(255, 255, 255)) {
        return tDrawProps[Symbol.for("bgColor")];
      }
    }
    return rgb(255, 255, 255);
  }

  getDirection() {
    return this.pDirection;
  }

  getModel() {
    const tmodel = list();
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      tmodel.add(this.pLayerPropList[i]["model"]);
    }
    return tmodel;
  }

  getLocation() {
    if (this.pLayerPropList.count < 1) {
      return 0;
    }
    const tMemString = this.pLayerPropList[1]["memString"];
    if (voidp(tMemString)) {
      return 0;
    }
    if (!memberExists(tMemString)) {
      return 0;
    }
    const tmember = member(getmemnum(tMemString));
    const tImgRect = tmember.rect;
    const tCntrPoint = point(tImgRect.width / 2, tImgRect.height / 2);
    const tRegPoint = tmember.regPoint;
    return -tRegPoint + tCntrPoint;
  }

  getPartID() {
    return this.pPart;
  }

  copyPicture(tImg, tdir, tHumanSize, tAction, tAnimFrame) {
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      const tArray = this.getMemberNumber(tdir, tHumanSize, tAction, tAnimFrame, i);
      const tMemNum = tArray[Symbol.for("memberNumber")];
      const tFlip = tArray[Symbol.for("flip")];
      const tInk = this.pLayerPropList[i]["drawProps"][Symbol.for("ink")];
      const tColor = this.pLayerPropList[i]["drawProps"][Symbol.for("bgColor")];
      if (tMemNum != 0) {
        const tmember = member(tMemNum);
        const tImage = tmember.image;
        const tRegPnt = tmember.regPoint;
        const tY = tImg.rect.height - tRegPnt[2] - 10;
        const tX = -tRegPnt[1];
        let tRect = rect(tX, tY, tX + tImage.width, tY + tImage.height);
        if (tFlip) {
          tRect = rect(tImg.width - (tX + tImage.width), tY, tImg.width - tX, tY + tImage.height);
          const tQuad = list(point(tRect[3], tRect[2]), point(tRect[1], tRect[2]), point(tRect[1], tRect[4]), point(tRect[3], tRect[4]));
          tRect = tQuad;
        }
        const tMatte = tImage.createMatte();
        tImg.copyPixels(tImage, tRect, tImage.rect, propList(Symbol.for("maskImage"), tMatte, Symbol.for("ink"), tInk, Symbol.for("bgColor"), tColor));
      }
    }
    return 1;
  }

  reset() {
    this.pAction = "std";
  }

  skipAnimationFrame() {
    this.pAnimFrame = this.pAnimFrame + 1;
    if (this.pAnimFrame > this.pTotalFrame) {
      this.pAnimFrame = 1;
    }
    return 1;
  }

  changePartData(tmodel, tColor) {
    if (voidp(tmodel) || voidp(tColor)) {
      return 0;
    }
    this.setModel(tmodel);
    this.setColor(tColor);
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      const tMemString = this.pLayerPropList[i]["memString"];
      const tMemNameList = explode(tMemString, "_");
      tMemNameList[4] = tmodel;
      this.pLayerPropList[i]["memString"] = implode(tMemNameList, "_");
    }
    const tForced = 1;
    this.update(tForced);
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

  animateUpdate() {
    if (ilk(this.pAnimation) != Symbol.for("propList")) {
      return;
    }
    this.pXFix = this.pAnimation[Symbol.for("OffX")][this.pAnimFrame];
    this.pYFix = this.pAnimation[Symbol.for("OffY")][this.pAnimFrame];
    switch (this.pBody.pDirection) {
      case 0:
        this.pYFix = this.pYFix + (this.pXFix / 2);
        this.pXFix = this.pXFix / 2;
        break;
      case 1:
        this.pYFix = this.pYFix + this.pXFix;
        this.pXFix = 0;
        break;
      case 2:
        this.pYFix = this.pYFix - (this.pXFix / 2);
        this.pXFix = this.pXFix / 2;
        break;
      case 4:
        this.pYFix = this.pYFix + (this.pXFix / 2);
        this.pXFix = -this.pXFix / 2;
        break;
      case 5:
        this.pYFix = this.pYFix - this.pXFix;
        this.pXFix = 0;
        break;
      case 6:
        this.pYFix = this.pYFix - (this.pXFix / 2);
        this.pXFix = -this.pXFix / 2;
        break;
      case 7:
        this.pXFix = -this.pXFix;
        break;
    }
    let tSizeMultiplier;
    if (this.pBody.pPeopleSize == "sh") {
      tSizeMultiplier = 0.69999999999999996;
    } else {
      tSizeMultiplier = 1;
    }
    this.pXFix = this.pXFix * tSizeMultiplier;
    this.pYFix = this.pYFix * tSizeMultiplier;
  }

  animate(tLayerIndex) {
    if (!this.pAnimation) {
      return EMPTY;
    }
    if (voidp(tLayerIndex)) {
      tLayerIndex = 1;
    }
    if ((tLayerIndex < 1) || (tLayerIndex > this.pLayerPropList.count)) {
      return EMPTY;
    }
    const tdata = this.pLayerPropList[tLayerIndex];
    const tmodel = tdata["model"];
    let tdir = this.pDirection + this.pAnimation[Symbol.for("OffD")][this.pAnimFrame];
    if (tdir > 7) {
      tdir = min(tdir - 8, 7);
    } else {
      if (tdir < 0) {
        tdir = max(7 + tdir + 1, 0);
      }
    }
    let tPart = this.pPart;
    if (tdir != this.pBody.pFlipList[tdir + 1]) {
      const tDirOrig = tdir;
      tdir = this.pBody.pFlipList[tdir + 1];
      tdata["flipH"] = 1;
      if (this.pFlipPart != EMPTY) {
        const tMemString = `${this.pBody.pPeopleSize}_${this.pAnimation[Symbol.for("act")][this.pAnimFrame]}_${tPart}_${tmodel}_${tDirOrig}_${this.pAnimation[Symbol.for("frm")][this.pAnimFrame]}`;
        const tMemNum = this.getMemNumFast(tMemString);
        if (tMemNum > 0) {
          tdir = tDirOrig;
          tdata["flipH"] = 0;
        } else {
          tPart = this.pFlipPart;
        }
      }
    } else {
      tdata["flipH"] = 0;
    }
    const tMemName = `${this.pBody.pPeopleSize}_${this.pAnimation[Symbol.for("act")][this.pAnimFrame]}_${tPart}_${tmodel}_${tdir}_${this.pAnimation[Symbol.for("frm")][this.pAnimFrame]}`;
    return tMemName;
  }

  flipHorizontal(tImg) {
    const tImage = image(tImg.width, tImg.height, tImg.depth);
    const tQuad = list(point(tImg.width, 0), point(0, 0), point(0, tImg.height), point(tImg.width, tImg.height));
    tImage.copyPixels(tImg, tQuad, tImg.rect);
    return tImage;
  }

  getMemberNumber(tdir, tHumanSize, tAction, tAnimFrame, tLayerIndex, tmodel) {
    let tFlip = 0;
    if (!voidp(tdir)) {
      if ((tdir > 0) && (tdir < this.pBody.pFlipList.count)) {
        if (tdir != this.pBody.pFlipList[tdir + 1]) {
          tdir = this.pBody.pFlipList[tdir + 1];
          tFlip = 1;
        }
      }
    }
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
    if (voidp(tLayerIndex)) {
      tLayerIndex = 1;
    }
    if ((tLayerIndex < 1) || (tLayerIndex > this.pLayerPropList.count)) {
      tLayerIndex = 1;
    }
    if (voidp(tmodel)) {
      if (this.pLayerPropList.count >= tLayerIndex) {
        tmodel = this.pLayerPropList[tLayerIndex]["model"];
      } else {
        tmodel = EMPTY;
      }
    }
    let tPart = this.pPart;
    if ((this.pFlipPart != EMPTY) && (tFlip == 1)) {
      tPart = this.pFlipPart;
    }
    const tMemName = `${tHumanSize}_${tAction}_${tPart}_${tmodel}_${tdir}_${tAnimFrame}`;
    const tNum = this.getMemNumFast(tMemName);
    return propList(Symbol.for("memberNumber"), tNum, Symbol.for("flip"), tFlip);
  }

  getDrawArea(tLayerIndex) {
    if ((tLayerIndex < 1) || (tLayerIndex > this.pLayerPropList.count)) {
      return rect(0, 0, 0, 0);
    }
    const tdata = this.pLayerPropList[tLayerIndex];
    const tRect = tdata["cacheRect"];
    let tDrawArea;
    if (tdata["flipH"]) {
      tDrawArea = list(point(tRect[3], tRect[2]), point(tRect[1], tRect[2]), point(tRect[1], tRect[4]), point(tRect[3], tRect[4]));
    } else {
      tDrawArea = tRect;
    }
    return tDrawArea.duplicate();
  }

  getMemNumFast(tName) {
    const tNum = this.pMemNumCache[tName];
    if (voidp(tNum)) {
      const tNewNum = getmemnum(tName);
      this.pMemNumCache.addProp(tName, tNewNum);
      if (this.pMemNumCache.count > 20) {
        this.pMemNumCache.deleteAt(1);
      }
      return tNewNum;
    }
    return tNum;
  }
}
