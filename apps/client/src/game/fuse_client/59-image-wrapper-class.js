export default class {
  pOwnX;
  pOwnY;
  pOwnW;
  pOwnH;
  pOffX;
  pOffY;
  pScrolls;
  pUpdateLock;
  pProps;
  pBuffer;
  pSprite;
  pScaleH;
  pScaleV;
  pParams;
  pwidth;
  pheight;
  pDepth;
  pimage;
  pMotherId;
  pVisible;

  prepare() {
    this.pOffX = 0;
    this.pOffY = 0;
    this.pOwnW = this.pProps[Symbol.for("width")];
    this.pOwnH = this.pProps[Symbol.for("height")];
    this.pScrolls = list();
    this.pUpdateLock = 0;
    this.pDepth = the.colorDepth;
    this.pimage = image(this.pwidth, this.pheight, this.pDepth);
    if (this.pProps[Symbol.for("style")] == Symbol.for("unique")) {
      this.pOwnX = 0;
      this.pOwnY = 0;
    } else {
      this.pOwnX = this.pProps[Symbol.for("locH")];
      this.pOwnY = this.pProps[Symbol.for("locV")];
    }
    if (this.pProps[Symbol.for("flipH")]) {
      this.flipH();
    }
    if (this.pProps[Symbol.for("flipV")]) {
      this.flipV();
    }
    return 1;
  }

  feedImage(tImage) {
    if (!(ilk(tImage) == Symbol.for("image"))) {
      return error(this, `Image object expected!${tImage}`, Symbol.for("feedImage"), Symbol.for("minor"));
    }
    const tTargetRect = rect(this.pOwnX, this.pOwnY, this.pOwnX + this.pOwnW, this.pOwnY + this.pOwnH);
    this.pBuffer.image.fill(tTargetRect, this.pProps[Symbol.for("bgColor")]);
    this.pimage = tImage;
    this.render();
    this.pUpdateLock = 1;
    this.registerScroll();
    this.pUpdateLock = 0;
    return 1;
  }

  clearImage() {
    const tTargetRect = rect(this.pOwnX, this.pOwnY, this.pOwnX + this.pOwnW, this.pOwnY + this.pOwnH);
    return this.pBuffer.image.fill(tTargetRect, this.pProps[Symbol.for("bgColor")]);
  }

  clearBuffer() {
    return this.pimage.fill(this.pimage.rect, this.pProps[Symbol.for("bgColor")]);
  }

  registerScroll(tID) {
    if (voidp(this.pScrolls)) {
      this.prepare();
    }
    if (!voidp(tID)) {
      if (this.pScrolls.getPos(tID) == 0) {
        this.pScrolls.add(tID);
      }
    } else {
      if (this.pScrolls.count == 0) {
        return 0;
      }
    }
    const tSourceRect = rect(this.pOffX, this.pOffY, this.pOffX + this.pOwnW, this.pOffY + this.pOwnH);
    const tScrollList = list();
    const tWndObj = getWindowManager().GET(this.pMotherId);
    for (const tScrollId of this.pScrolls) {
      tScrollList.add(tWndObj.getElement(tScrollId));
    }
    call(Symbol.for("updateData"), tScrollList, tSourceRect, this.pimage.rect);
  }

  adjustOffsetTo(tX, tY) {
    this.pOffX = tX;
    this.pOffY = tY;
    if (!this.pUpdateLock) {
      this.clearImage();
      this.render();
    }
  }

  adjustOffsetBy(tOffX, tOffY) {
    this.pOffX = this.pOffX + tOffX;
    this.pOffY = this.pOffY + tOffY;
    if (!this.pUpdateLock) {
      this.clearImage();
      this.render();
    }
  }

  adjustXOffsetTo(tX) {
    this.adjustOffsetTo(tX, this.pOffY);
  }

  adjustYOffsetTo(tY) {
    this.adjustOffsetTo(this.pOffX, tY);
  }

  setOffsetX(tX) {
    this.adjustOffsetTo(tX, this.pOffY);
  }

  setOffsetY(tY) {
    this.adjustOffsetTo(this.pOffX, tY);
  }

  getOffsetX() {
    return this.pOffX;
  }

  getOffsetY() {
    return this.pOffY;
  }

  resizeBy(tOffH, tOffV, tForcedTag) {
    if ((tOffH != 0) || (tOffV != 0)) {
      if (this.pProps[Symbol.for("style")] == Symbol.for("unique")) {
        switch (this.pScaleH) {
          case Symbol.for("move"):
            this.moveBy(tOffH, 0);
            break;
          case Symbol.for("scale"):
            this.pwidth = this.pwidth + tOffH;
            break;
          case Symbol.for("center"):
            this.moveBy(tOffH / 2, 0);
            break;
          case Symbol.for("fixed"):
            if (tForcedTag) {
              this.pwidth = this.pwidth + tOffH;
            }
            break;
        }
        switch (this.pScaleV) {
          case Symbol.for("move"):
            this.moveBy(0, tOffV);
            break;
          case Symbol.for("scale"):
            this.pheight = this.pheight + tOffV;
            break;
          case Symbol.for("center"):
            this.moveBy(0, tOffV / 2);
            break;
          case Symbol.for("fixed"):
            if (tForcedTag) {
              this.pheight = this.pheight + tOffV;
            }
            break;
        }
        if (this.pwidth < 1) {
          this.pwidth = 1;
        }
        if (this.pheight < 1) {
          this.pheight = 1;
        }
        this.pOwnW = this.pwidth;
        this.pOwnH = this.pheight;
        this.pBuffer.image = image(this.pOwnW, this.pOwnH, this.pDepth);
        this.pBuffer.regPoint = point(0, 0);
        this.pSprite.width = this.pOwnW;
        this.pSprite.height = this.pOwnH;
      } else {
        switch (this.pScaleH) {
          case Symbol.for("move"):
            this.pOwnX = this.pOwnX + tOffH;
            break;
          case Symbol.for("scale"):
            this.pOwnW = this.pOwnW + tOffH;
            break;
          case Symbol.for("center"):
            this.pOwnX = this.pOwnX + (tOffH / 2);
            break;
          case Symbol.for("fixed"):
            if (tForcedTag) {
              this.pSprite.width = this.pSprite.width + tOffH;
              this.pOwnW = this.pSprite.width;
            }
            break;
        }
        switch (this.pScaleV) {
          case Symbol.for("move"):
            this.pOwnY = this.pOwnY + tOffV;
            break;
          case Symbol.for("scale"):
            this.pOwnH = this.pOwnH + tOffV;
            break;
          case Symbol.for("center"):
            this.pOwnY = this.pOwnY + (tOffV / 2);
            break;
          case Symbol.for("fixed"):
            if (tForcedTag) {
              this.pSprite.height = this.pSprite.height + tOffV;
              this.pOwnV = this.pSprite.height;
            }
            break;
        }
      }
      this.registerScroll();
      this.render();
    }
  }

  render() {
    if (!this.pVisible) {
      return;
    }
    const tTargetRect = rect(this.pOwnX, this.pOwnY, this.pOwnX + this.pOwnW, this.pOwnY + this.pOwnH);
    const tSourceRect = rect(this.pOffX, this.pOffY, this.pOffX + this.pOwnW, this.pOffY + this.pOwnH);
    this.pBuffer.image.copyPixels(this.pimage, tTargetRect, tSourceRect, this.pParams);
  }

  mouseDown() {
    return point(the.mouseH - this.pSprite.locH + this.pOwnX + this.pOffX, the.mouseV - this.pSprite.locV + this.pOwnY + this.pOffY);
  }

  mouseUp() {
    return point(the.mouseH - this.pSprite.locH + this.pOwnX + this.pOffX, the.mouseV - this.pSprite.locV + this.pOwnY + this.pOffY);
  }

  mouseWithin() {
    return point(the.mouseH - this.pSprite.locH + this.pOwnX + this.pOffX, the.mouseV - this.pSprite.locV + this.pOwnY + this.pOffY);
  }
}
