export default class {
  pID;
  pMotherId;
  pType;
  pBuffer;
  pSprite;
  pPalette;
  pScaleH;
  pScaleV;
  pLocX;
  pLocY;
  pwidth;
  pheight;
  pDepth;
  pimage;
  pParams;
  pProps;
  pVisible;

  define(tProps) {
    this.pID = tProps[Symbol.for("id")];
    this.pMotherId = tProps[Symbol.for("mother")];
    this.pType = tProps[Symbol.for("type")];
    this.pBuffer = tProps[Symbol.for("buffer")];
    this.pSprite = tProps[Symbol.for("sprite")];
    this.pPalette = tProps[Symbol.for("palette")];
    this.pScaleH = tProps[Symbol.for("scaleH")];
    this.pScaleV = tProps[Symbol.for("scaleV")];
    this.pLocX = tProps[Symbol.for("locH")];
    this.pLocY = tProps[Symbol.for("locV")];
    this.pwidth = tProps[Symbol.for("width")];
    this.pheight = tProps[Symbol.for("height")];
    this.pProps = tProps;
    this.pVisible = 1;
    if (voidp(this.pPalette)) {
      this.pPalette = Symbol.for("systemMac");
    } else {
      if (stringp(this.pPalette)) {
        this.pPalette = member(getResourceManager().getmemnum(this.pPalette));
      }
    }
    let tMemNum;
    if (voidp(this.pProps[Symbol.for("member")])) {
      tMemNum = 0;
    } else {
      tMemNum = getResourceManager().getmemnum(this.pProps[Symbol.for("member")]);
    }
    if ((tMemNum > 0) && (this.pType != "image")) {
      const tmember = member(tMemNum);
      this.pDepth = tmember.image.depth;
      this.pimage = tmember.image.duplicate();
      if (this.pimage.paletteRef != this.pPalette) {
        this.pimage.paletteRef = this.pPalette;
      }
    } else {
      this.pDepth = the.colorDepth;
      this.pimage = image(1, 1, this.pDepth, this.pPalette);
    }
    if (this.pProps[Symbol.for("flipH")]) {
      this.flipH();
    }
    if (this.pProps[Symbol.for("flipV")]) {
      this.flipV();
    }
    this.pParams = propList();
    if (tProps[Symbol.for("blend")] < 100) {
      this.pParams[Symbol.for("blend")] = tProps[Symbol.for("blend")];
    }
    if (tProps[Symbol.for("color")] != rgb(0, 0, 0)) {
      this.pParams[Symbol.for("color")] = tProps[Symbol.for("color")];
    }
    if (tProps[Symbol.for("bgColor")] != rgb(255, 255, 255)) {
      this.pParams[Symbol.for("bgColor")] = tProps[Symbol.for("bgColor")];
    }
    if (tProps[Symbol.for("ink")] != 0) {
      this.pParams[Symbol.for("ink")] = tProps[Symbol.for("ink")];
    }
    if (this.pParams.count == 0) {
      this.pParams = VOID;
    }
    return 1;
  }

  prepare() {
  }

  moveTo(tLocX, tLocY) {
    this.pLocX = tLocX;
    this.pLocY = tLocY;
    this.render();
  }

  moveBy(tOffX, tOffY) {
    this.pLocX = this.pLocX + tOffX;
    this.pLocY = this.pLocY + tOffY;
    this.render();
  }

  resizeTo(tX, tY) {
    const tOffX = tX - this.pwidth;
    const tOffY = tY - this.pheight;
    return this.resizeBy(tOffX, tOffY);
  }

  resizeBy(tOffH, tOffV) {
    switch (this.pScaleH) {
      case Symbol.for("move"):
        this.pLocX = this.pLocX + tOffH;
        break;
      case Symbol.for("center"):
        this.pLocX = this.pLocX + (tOffH / 2);
        break;
      case Symbol.for("scale"):
        this.pwidth = this.pwidth + tOffH;
        break;
    }
    switch (this.pScaleV) {
      case Symbol.for("move"):
        this.pLocY = this.pLocY + tOffV;
        break;
      case Symbol.for("center"):
        this.pLocY = this.pLocY + (tOffV / 2);
        break;
      case Symbol.for("scale"):
        this.pheight = this.pheight + tOffV;
        break;
    }
    this.render();
  }

  flipH() {
    const tImage = image(this.pimage.width, this.pimage.height, this.pimage.depth, this.pimage.paletteRef);
    const tQuad = list(point(this.pimage.width, 0), point(0, 0), point(0, this.pimage.height), point(this.pimage.width, this.pimage.height));
    tImage.copyPixels(this.pimage, tQuad, this.pimage.rect);
    this.pimage = tImage;
  }

  flipV() {
    const tImage = image(this.pimage.width, this.pimage.height, this.pimage.depth, this.pimage.paletteRef);
    const tQuad = list(point(0, this.pimage.height), point(this.pimage.width, this.pimage.height), point(this.pimage.width, 0), point(0, 0));
    tImage.copyPixels(this.pimage, tQuad, this.pimage.rect);
    this.pimage = tImage;
  }

  getProperty(tProp) {
    switch (tProp) {
      case Symbol.for("buffer"):
        return this.pBuffer;
      case Symbol.for("sprite"):
        return this.pSprite;
      case Symbol.for("width"):
        return this.pwidth;
      case Symbol.for("height"):
        return this.pheight;
      case Symbol.for("locX"):
        return this.pLocX;
      case Symbol.for("locY"):
        return this.pLocY;
      case Symbol.for("scaleH"):
        return this.pScaleH;
      case Symbol.for("scaleV"):
        return this.pScaleV;
      case Symbol.for("depth"):
        return this.pDepth;
      case Symbol.for("palette"):
        return this.pPalette;
      default:
        return 0;
    }
  }

  render() {
    const tTargetRect = rect(this.pLocX, this.pLocY, this.pLocX + this.pwidth, this.pLocY + this.pheight);
    const tSourceRect = this.pimage.rect;
    this.pBuffer.image.copyPixels(this.pimage, tTargetRect, tSourceRect, this.pParams);
  }

  draw(tRGB) {
    if (!ilk(tRGB, Symbol.for("color"))) {
      tRGB = rgb(0, 0, 255);
    }
    const tTargetRect = rect(this.pLocX, this.pLocY, this.pLocX + this.pwidth, this.pLocY + this.pheight);
    this.pBuffer.image.draw(tTargetRect, propList("shapeType", Symbol.for("rect"), "color", tRGB));
  }
}
