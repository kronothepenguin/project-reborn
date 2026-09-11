export default class {
  ancestor;
  pPart;
  pmodel;
  pDirection;
  pDrawProps;
  pAction;
  pMemString;
  pCacheImage;
  pCacheRectA;
  pCacheRectB;
  pCacheDir;

  deconstruct() {
    this.ancestor = undefined;
    return 1;
  }

  define(tPart, tmodel, tPalette, tColor, tDirection, tAction, tAncestor) {
    this.ancestor = tAncestor;
    this.pPart = tPart;
    this.pmodel = tmodel;
    this.pDrawProps = propList("maskImage", 0, "ink", 0, "bgColor", 0, "palette", tPalette);
    this.pCacheImage = 0;
    this.pCacheRectA = rect(0, 0, 0, 0);
    this.pCacheRectB = rect(0, 0, 0, 0);
    this.defineInk();
    this.setColor(tColor);
    this.pDirection = tDirection;
    this.pAction = tAction;
    this.pMemString = "";
    this.pCacheDir = -1;
    return 1;
  }

  update() {
    let tAnimCntr = 0;
    let tAction = this.pAction;
    let tPart = this.pPart;
    let tdir = this.pFlipList[this.pDirection + 1];
    let tUpdate = 0;
    let tBodyDir = this.pFlipList[this.ancestor.pDirection + 1] + 1;
    if (tBodyDir > 4) {
      tBodyDir = 5;
    }
    if (parseInt(this.pXFactor) > 33) {
      let tOffsetList = this.pOffsetList;
    } else {
      let tOffsetList = this.pOffsetListSmall;
    }
    switch (this.pPart) {
      case "bd":
        switch (this.pAction) {
          case "wlk":
          case "jmp":
          case "bnd":
            tAnimCntr = this.pAnimCounter;
            break;
          case "pla":
          case "scr":
            tAnimCntr = 1 % this.pAnimCounter;
            break;
        }
        if (this.pDirection != this.pCacheDir) {
          tUpdate = 1;
        }
        let tXFix = 0;
        let tYFix = 0;
        break;
      case "hd":
        if ((this.pMainAction == "jmp") || (this.pMainAction == "scr") || (this.pMainAction == "bnd")) {
          tXFix = tOffsetList[`hd_${this.pMainAction}_${this.pAnimCounter}`][tBodyDir][1];
          tYFix = tOffsetList[`hd_${this.pMainAction}_${this.pAnimCounter}`][tBodyDir][2];
        } else {
          tXFix = tOffsetList[`hd_${this.pMainAction}`][tBodyDir][1];
          tYFix = tOffsetList[`hd_${this.pMainAction}`][tBodyDir][2];
        }
        if ((tAction == "snf") || (tAction == "eat") || (tAction == "spk")) {
          tAnimCntr = this.pAnimCounter % 2;
        }
        tUpdate = 1;
        break;
      case "tl":
        if ((this.pMainAction == "jmp") || (this.pMainAction == "scr") || (this.pMainAction == "bnd")) {
          tXFix = tOffsetList[`tl_${this.pMainAction}_${this.pAnimCounter}`][tBodyDir][1];
          tYFix = tOffsetList[`tl_${this.pMainAction}_${this.pAnimCounter}`][tBodyDir][2];
        } else {
          tXFix = tOffsetList[`tl_${this.pMainAction}`][tBodyDir][1];
          tYFix = tOffsetList[`tl_${this.pMainAction}`][tBodyDir][2];
        }
        if (tAction == "wav") {
          tAnimCntr = this.pAnimCounter % 2;
        }
        tUpdate = 1;
        break;
    }
    let tPartSize = getVariable(`human.size.${parseInt(this.ancestor.pXFactor)}`);
    let tAnDir = this.ancestor.pDirection;
    if ((tAnDir > 3) && (tAnDir < 7) && (tPartSize == "sh")) {
      tXFix = tXFix + parseInt(this.ancestor.pXFactor) - 7;
    }
    this.pMemString = `${this.pMemberNamePrefix}${tAction}_${tPart}_${this.pmodel}_${tdir}_${tAnimCntr}`;
    let tMemNum = getmemnum(this.pMemString);
    if ((this.pMemString != tMemString) || tUpdate) {
      if (tMemNum > 0) {
        this.pMemString = tMemString;
        let tmember = member(tMemNum);
        let tRegPnt = tmember.regPoint;
        let tX = -tRegPnt[1] + tXFix;
        let tY = this.pBuffer.rect.height - tRegPnt[2] - 10 + tYFix;
        this.pUpdateRect = union(this.pUpdateRect, this.pCacheRectA);
        this.pCacheImage = tmember.image;
        this.pCacheRectA = rect(tX, tY, tX + this.pCacheImage.width, tY + this.pCacheImage.height) + rect(this.pLocFix, this.pLocFix);
        this.pCacheRectB = this.pCacheImage.rect;
        this.pDrawProps[Symbol.for("maskImage")] = this.pCacheImage.createMatte();
        this.pUpdateRect = union(this.pUpdateRect, this.pCacheRectA);
        this.pCacheDir = this.pDirection;
      } else {
        if (this.pCacheRectA.width > 0) {
          this.pUpdateRect = union(this.pUpdateRect, this.pCacheRectA);
          this.pCacheRectA = rect(0, 0, 0, 0);
        }
        return;
      }
    }
    member(tMemNum).paletteRef = member(getmemnum(this.pDrawProps[Symbol.for("palette")]));
    this.pBuffer.copyPixels(this.pCacheImage, this.pCacheRectA, this.pCacheRectB, this.pDrawProps);
  }

  render() {
    if (memberExists(this.pMemString)) {
      this.pBuffer.copyPixels(this.pCacheRectB, this.pCacheRectA, this.pCacheRectB, this.pDrawProps);
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
    if (this.pAction == "std") {
      this.pAction = tAct;
    }
  }

  defineActMultiple(tAct, tTargetPartList) {
    if (tTargetPartList.getOne(this.pPart)) {
      if (this.pAction == "std") {
        this.pAction = tAct;
      }
      if (tAct == "std") {
        this.pAction = "std";
      }
    }
  }

  defineInk(tInk) {
    if (voidp(tInk)) {
      switch (this.pPart) {
        case "sd":
          tInk = 32;
          break;
        default:
          tInk = 41;
      }
    }
    this.pDrawProps[Symbol.for("ink")] = tInk;
    return 1;
  }

  setModel(tmodel) {
    this.pmodel = tmodel;
  }

  setColor(tColor) {
    if (voidp(tColor)) {
      return 0;
    }
    if (tColor == "") {
      return 0;
    }
    if ((tColor.ilk == Symbol.for("color")) && (this.pDrawProps[Symbol.for("ink")] != 36)) {
      this.pDrawProps[Symbol.for("bgColor")] = tColor;
    } else {
      this.pDrawProps[Symbol.for("bgColor")] = rgb(255, 255, 255);
    }
    return 1;
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

  copyPicture(tImg, tdir, tHumanSize, tAction, tAnimFrame) {
    if (voidp(tdir)) {
      tdir = "2";
    }
    if (voidp(tHumanSize)) {
      tHumanSize = "p";
    }
    if (voidp(tAction)) {
      tAction = "std";
    }
    if (voidp(tAnimFrame)) {
      tAnimFrame = "0";
    }
    if (tHumanSize == "p") {
      let tOffsetList = this.pOffsetList;
    } else {
      tHumanSize = "s_p";
      let tOffsetList = this.pOffsetListSmall;
    }
    if (this.pPart == "bd") {
      let tOffX = 0;
      let tOffY = 0;
    } else {
      tOffX = tOffsetList[`${this.pPart}_${tAction}`][parseInt(tdir) + 1][1];
      tOffY = tOffsetList[`${this.pPart}_${tAction}`][parseInt(tdir) + 1][2];
    }
    let tMemName = `${tHumanSize}_${tAction}_${this.pPart}_${this.pmodel}_${tdir}_${tAnimFrame}`;
    if (memberExists(tMemName)) {
      let tmember = member(getmemnum(tMemName));
      let tImage = tmember.image;
      let tRegPnt = tmember.regPoint;
      let tX = -tRegPnt[1] + tOffX;
      let tY = tImg.rect.height - tRegPnt[2] - 10 + tOffY;
      let tRect = rect(tX, tY, tX + tImage.width, tY + tImage.height);
      let tMatte = tImage.createMatte();
      tmember.paletteRef = member(getmemnum(this.pDrawProps[Symbol.for("palette")]));
      tImg.copyPixels(tImage, tRect, tImage.rect, propList("maskImage", tMatte, "ink", this.pDrawProps[Symbol.for("ink")], "bgColor", this.pDrawProps[Symbol.for("bgColor")]));
      return 1;
    }
    return 0;
  }

  reset() {
    this.pAction = "std";
  }
}
