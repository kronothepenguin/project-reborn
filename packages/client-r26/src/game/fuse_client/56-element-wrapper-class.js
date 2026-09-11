export default class {
  pID;
  pElemList;
  pBuffer;
  pSprite;
  pPalette;
  pScaleH;
  pScaleV;
  pLocX;
  pLocY;
  pwidth;
  pheight;
  pVisible;

  construct() {
    this.pElemList = list();
    this.pPalette = Symbol.for("systemMac");
    this.pScaleH = Symbol.for("fixed");
    this.pScaleV = Symbol.for("fixed");
    this.pLocX = 0;
    this.pLocY = 0;
    this.pwidth = 0;
    this.pheight = 0;
    this.pVisible = 1;
    return 1;
  }

  deconstruct() {
    call(Symbol.for("deconstruct"), this.pElemList);
    this.pElemList = list();
    this.pBuffer = VOID;
    this.pSprite = VOID;
    return 1;
  }

  define(tProps) {
    this.pID = tProps[Symbol.for("id")];
    this.pBuffer = tProps[Symbol.for("buffer")];
    this.pSprite = tProps[Symbol.for("sprite")];
    this.pLocX = tProps[Symbol.for("locX")];
    this.pLocY = tProps[Symbol.for("locY")];
    this.pwidth = this.pBuffer.width;
    this.pheight = this.pBuffer.height;
    this.pPalette = this.pBuffer.paletteRef;
    return 1;
  }

  add(tElement) {
    if (!objectp(tElement)) {
      return 0;
    }
    if (tElement.getProperty(Symbol.for("scaleH")) != Symbol.for("fixed")) {
      this.pScaleH = Symbol.for("scale");
    }
    if (tElement.getProperty(Symbol.for("scaleV")) != Symbol.for("fixed")) {
      this.pScaleV = Symbol.for("scale");
    }
    this.pElemList.add(tElement);
    return 1;
  }

  show() {
    this.pVisible = 1;
    this.pSprite.visible = 1;
    return 1;
  }

  hide() {
    this.pVisible = 0;
    this.pSprite.visible = 0;
    return 1;
  }

  moveTo(tLocX, tLocY) {
    const tOffX = tLocX - this.pLocX;
    const tOffY = tLocY - this.pLocY;
    this.moveBy(tOffX, tOffY);
  }

  moveBy(tOffX, tOffY) {
    this.pLocX = this.pLocX + tOffX;
    this.pLocY = this.pLocY + tOffY;
    this.pSprite.loc = this.pSprite.loc + list(tOffX, tOffY);
  }

  resizeBy(tOffW, tOffH) {
    if ((tOffW != 0) || (tOffH != 0)) {
      switch (this.pScaleH) {
        case Symbol.for("fixed"):
          tOffW = 0;
          break;
        case Symbol.for("scale"):
          this.pwidth = this.pwidth + tOffW;
          break;
        case Symbol.for("move"):
          this.moveBy(tOffW, 0);
          break;
        case Symbol.for("center"):
          this.moveBy(tOffW / 2, 0);
          break;
      }
      if (this.pScaleH != Symbol.for("scale")) {
        tOffW = 0;
      }
      switch (this.pScaleV) {
        case Symbol.for("fixed"):
          tOffH = 0;
          break;
        case Symbol.for("scale"):
          this.pheight = this.pheight + tOffH;
          break;
        case Symbol.for("move"):
          this.moveBy(0, tOffH);
          break;
        case Symbol.for("center"):
          this.moveBy(0, tOffH / 2);
          break;
      }
      if (this.pScaleV != Symbol.for("scale")) {
        tOffH = 0;
      }
      if ((tOffW != 0) || (tOffH != 0)) {
        if (this.pwidth < 1) {
          this.pwidth = 1;
        }
        if (this.pheight < 1) {
          this.pheight = 1;
        }
        this.pBuffer.image = image(this.pwidth, this.pheight, this.pBuffer.image.depth, this.pPalette);
        this.pBuffer.regPoint = point(0, 0);
        this.pSprite.width = this.pwidth;
        this.pSprite.height = this.pheight;
        this.pSprite.stretch = 0;
        call(Symbol.for("resizeBy"), this.pElemList, tOffW, tOffH);
      }
    }
  }

  getProperty(tProp) {
    switch (tProp) {
      case Symbol.for("image"):
        return this.pBuffer.image;
      case Symbol.for("buffer"):
        return this.pBuffer;
      case Symbol.for("member"):
        return this.pBuffer;
      case Symbol.for("sprite"):
        return this.pSprite;
      case Symbol.for("scaleH"):
        return this.pScaleH;
      case Symbol.for("scaleV"):
        return this.pScaleV;
      case Symbol.for("locX"):
        return this.pLocX;
      case Symbol.for("locY"):
        return this.pLocY;
      case Symbol.for("locH"):
        return this.pLocX;
      case Symbol.for("locV"):
        return this.pLocY;
      case Symbol.for("locZ"):
        return this.pSprite.locZ;
      case Symbol.for("width"):
        return this.pwidth;
      case Symbol.for("height"):
        return this.pheight;
      case Symbol.for("depth"):
        return this.pBuffer.image.depth;
      case Symbol.for("color"):
        return this.pSprite.color;
      case Symbol.for("bgColor"):
        return this.pSprite.bgColor;
      case Symbol.for("blend"):
        return this.pSprite.blend;
      case Symbol.for("ink"):
        return this.pSprite.ink;
      case Symbol.for("palette"):
        return this.pPalette;
      case Symbol.for("visible"):
        return this.pVisible;
      case Symbol.for("cursor"):
        return this.pSprite.cursor;
      default:
        return 0;
    }
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case Symbol.for("scaleH"):
        this.pScaleH = tValue;
        break;
      case Symbol.for("scaleV"):
        this.pScaleV = tValue;
        break;
      case Symbol.for("locX"):
        this.moveTo(tValue, this.pLocY);
        break;
      case Symbol.for("locY"):
        this.moveTo(this.pLocX, tValue);
        break;
      case Symbol.for("locH"):
        this.moveTo(tValue, this.pLocY);
        break;
      case Symbol.for("locV"):
        this.moveTo(this.pLocX, tValue);
        break;
      case Symbol.for("width"):
        this.resizeBy(this.pwidth - tValue, 0);
        break;
      case Symbol.for("height"):
        this.resizeBy(0, this.pheight - tValue);
        break;
      case Symbol.for("color"):
        this.pSprite.color = tValue;
        break;
      case Symbol.for("bgColor"):
        this.pSprite.bgColor = tValue;
        break;
      case Symbol.for("blend"):
        this.pSprite.blend = tValue;
        break;
      case Symbol.for("ink"):
        this.pSprite.ink = tValue;
        break;
      case Symbol.for("cursor"):
        this.pSprite.setcursor(tValue);
        break;
      case Symbol.for("image"):
        const tRegPnt = this.pBuffer.regPoint;
        this.pBuffer.image = tValue;
        this.pBuffer.regPoint = tRegPnt;
        this.pSprite.width = this.pBuffer.width;
        this.pSprite.height = this.pBuffer.height;
        this.pwidth = this.pBuffer.width;
        this.pheight = this.pBuffer.height;
        break;
      case Symbol.for("buffer"):
      case Symbol.for("member"):
        switch (ilk(tValue)) {
          case Symbol.for("string"):
            this.pBuffer = getMember(tValue);
            break;
          case Symbol.for("integer"):
            this.pBuffer = member(tValue);
            break;
          default:
            return error(this, `Can't set #buffer/#member to type : ${ilk(tValue)}`, Symbol.for("setProperty"), Symbol.for("minor"));
        }
        this.pwidth = this.pBuffer.width;
        this.pheight = this.pBuffer.height;
        this.pPalette = this.pBuffer.paletteRef;
        this.pSprite.castNum = this.pBuffer.number;
        break;
      case Symbol.for("palette"):
        this.pPalette = tValue;
        this.pBuffer.image.paletteRef = this.pPalette;
        break;
      case Symbol.for("depth"):
        const tImage = this.pBuffer.image.duplicate();
        this.pBuffer.image = image(tImage.width, tImage.height, tValue);
        this.pBuffer.image.copyPixels(tImage, tImage.rect, tImage.rect);
        this.pBuffer.image.paletteRef = this.pPalette;
        break;
      case Symbol.for("visible"):
        if (tValue == 1) {
          this.show();
        } else {
          this.hide();
        }
        break;
      default:
        return 0;
    }
    return 1;
  }

  prepare() {
    call(Symbol.for("prepare"), this.pElemList);
  }

  render() {
    if (this.pVisible) {
      call(Symbol.for("render"), this.pElemList);
    }
  }

  draw(tRGB) {
    call(Symbol.for("draw"), this.pElemList, tRGB);
  }
}
