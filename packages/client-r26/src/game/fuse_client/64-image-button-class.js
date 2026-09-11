export default class {
  pBlend;
  pButtonImg;
  pFixedSize;
  pProps;
  pSprite;
  pBuffer;
  pPalette;
  pDepth;
  pwidth;
  pheight;
  pimage;
  pParams;

  prepare() {
    this.pBlend = this.pProps[Symbol.for("blend")];
    this.pButtonImg = propList();
    if (voidp(this.pFixedSize)) {
      this.pFixedSize = 0;
    }
    const tTemp = the.itemDelimiter;
    the.itemDelimiter = ".";
    let tMemName = this.pProps[Symbol.for("member")];
    tMemName = tMemName.item[`1..${tMemName.item.count - 1}`];
    the.itemDelimiter = tTemp;
    this.UpdateImageObjects(VOID, Symbol.for("up"), tMemName);
    this.UpdateImageObjects(VOID, Symbol.for("down"), tMemName);
    this.pimage = this.createButtonImg(Symbol.for("up"));
    const tTempOffset = this.pSprite.member.regPoint;
    this.pBuffer.image = this.pimage;
    this.pBuffer.regPoint = tTempOffset;
    this.pwidth = this.pimage.width;
    this.pheight = this.pimage.height;
    this.pSprite.width = this.pwidth;
    this.pSprite.height = this.pheight;
    return 1;
  }

  changeState(tstate) {
    this.pimage = this.createButtonImg(tstate);
    this.render();
  }

  UpdateImageObjects(tPalette, tstate, tMemName) {
    if (voidp(tPalette)) {
      tPalette = this.pPalette;
    } else {
      if (stringp(tPalette)) {
        tPalette = member(getmemnum(tPalette));
      }
    }
    if (tstate == Symbol.for("up")) {
      tMemName = `${tMemName}.active`;
    } else {
      if (tstate == Symbol.for("down")) {
        tMemName = `${tMemName}.pressed`;
      }
    }
    const tMemNum = getmemnum(tMemName);
    if (tMemNum == 0) {
      return error(this, `Member not found: ${tMemName}`, Symbol.for("UpdateImageObjects"), Symbol.for("minor"));
    }
    const tmember = member(tMemNum);
    const tImage = tmember.image.duplicate();
    if (tImage.paletteRef != tPalette) {
      tImage.paletteRef = tPalette;
    }
    this.pButtonImg.addProp(symbol(tstate), tImage);
  }

  createButtonImg(tstate) {
    return this.pButtonImg.getProp(tstate);
  }
}
