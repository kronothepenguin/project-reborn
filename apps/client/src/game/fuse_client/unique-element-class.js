import { image, ilk, list, member, point, propList, rgb, stringp, the, voidp, VOID } from "../../director";

export default function () {
  return {
    pID: VOID,
    pMotherId: VOID,
    pType: VOID,
    pBuffer: VOID,
    pSprite: VOID,
    pPalette: VOID,
    pScaleH: VOID,
    pScaleV: VOID,
    pLocX: VOID,
    pLocY: VOID,
    pwidth: VOID,
    pheight: VOID,
    pVisible: VOID,
    pDepth: VOID,
    pimage: VOID,
    pParams: VOID,
    pProps: VOID,

    define(tProps) {
      this.pID = tProps[Symbol.for("id")];
      this.pMotherId = tProps[Symbol.for("mother")];
      this.pType = tProps[Symbol.for("type")];
      this.pScaleH = tProps[Symbol.for("scaleH")];
      this.pScaleV = tProps[Symbol.for("scaleV")];
      this.pBuffer = tProps[Symbol.for("buffer")];
      this.pSprite = tProps[Symbol.for("sprite")];
      this.pLocX = tProps[Symbol.for("locH")];
      this.pLocY = tProps[Symbol.for("locV")];
      this.pwidth = tProps[Symbol.for("width")];
      this.pheight = tProps[Symbol.for("height")];
      this.pPalette = tProps[Symbol.for("palette")];
      this.pProps = tProps;
      this.pDepth = the.colorDepth;
      this.pVisible = 1;
      if (voidp(this.pPalette)) {
        this.pPalette = Symbol.for("systemMac");
      } else {
        if (stringp(this.pPalette)) {
          this.pPalette = member(_director.getResourceManager().getmemnum(this.pPalette));
        }
      }
      let tMemNum = _director.getResourceManager().getmemnum(this.pProps[Symbol.for("member")]);
      if (tMemNum > 0) {
        let tmember = member(tMemNum);
        if (tmember.type === Symbol.for("bitmap")) {
          this.pimage = tmember.image.duplicate();
          this.pDepth = tmember.image.depth;
          if (this.pimage.paletteRef !== this.pPalette) {
            this.pimage.paletteRef = this.pPalette;
          }
        }
      }
      if (voidp(this.pimage)) {
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
      if (tProps[Symbol.for("color")] !== rgb(0, 0, 0)) {
        this.pParams[Symbol.for("color")] = tProps[Symbol.for("color")];
      }
      if (tProps[Symbol.for("bgColor")] !== rgb(255, 255, 255)) {
        this.pParams[Symbol.for("bgColor")] = tProps[Symbol.for("bgColor")];
      }
      if (tProps[Symbol.for("ink")] !== 0) {
        this.pParams[Symbol.for("ink")] = tProps[Symbol.for("ink")];
      }
      if (this.pParams.count === 0) {
        this.pParams = VOID;
      }
      return 1;
    },

    prepare() {
    },

    show() {
      this.pVisible = 1;
      this.pSprite.visible = 1;
      return 1;
    },

    hide() {
      this.pVisible = 0;
      this.pSprite.visible = 0;
      return 1;
    },

    moveTo(tLocX, tLocY) {
      let tOffX = tLocX - this.pLocX;
      let tOffY = tLocY - this.pLocY;
      this.pLocX = tLocX;
      this.pLocY = tLocY;
      this.pSprite.loc = this.pSprite.loc.__add__(point(tOffX, tOffY));
    },

    moveBy(tOffX, tOffY) {
      this.pLocX = this.pLocX + tOffX;
      this.pLocY = this.pLocY + tOffY;
      this.pSprite.loc = this.pSprite.loc.__add__(point(tOffX, tOffY));
    },

    resizeTo(tX, tY, tForcedTag) {
      let tOffX = tX - this.pSprite.width;
      let tOffY = tY - this.pSprite.height;
      return this.resizeBy(tOffX, tOffY, tForcedTag);
    },

    resizeBy(tOffH, tOffV, tForcedTag) {
      if ((tOffH !== 0) || (tOffV !== 0)) {
        switch (this.pScaleH) {
          case Symbol.for("move"):
            this.moveBy(tOffH, 0);
            break;
          case Symbol.for("scale"):
            this.pSprite.width = this.pSprite.width + tOffH;
            break;
          case Symbol.for("center"):
            this.moveBy(tOffH / 2, 0);
            break;
          case Symbol.for("fixed"):
            if (tForcedTag) {
              this.pSprite.width = this.pSprite.width + tOffH;
            }
            break;
        }
        switch (this.pScaleV) {
          case Symbol.for("move"):
            this.moveBy(0, tOffV);
            break;
          case Symbol.for("scale"):
            this.pSprite.height = this.pSprite.height + tOffV;
            break;
          case Symbol.for("center"):
            this.moveBy(0, tOffV / 2);
            break;
          case Symbol.for("fixed"):
            if (tForcedTag) {
              this.pSprite.height = this.pSprite.height + tOffV;
            }
            break;
        }
        this.pwidth = this.pSprite.width;
        this.pheight = this.pSprite.height;
        this.render();
      }
    },

    flipH() {
      let tImage = image(this.pimage.width, this.pimage.height, this.pimage.depth, this.pimage.paletteRef);
      let tQuad = list(point(this.pimage.width, 0), point(0, 0), point(0, this.pimage.height), point(this.pimage.width, this.pimage.height));
      tImage.copyPixels(this.pimage, tQuad, this.pimage.rect);
      this.pimage = tImage;
    },

    flipV() {
      let tImage = image(this.pimage.width, this.pimage.height, this.pimage.depth, this.pimage.paletteRef);
      let tQuad = list(point(0, this.pimage.height), point(this.pimage.width, this.pimage.height), point(this.pimage.width, 0), point(0, 0));
      tImage.copyPixels(this.pimage, tQuad, this.pimage.rect);
      this.pimage = tImage;
    },

    getProperty(tProp) {
      switch (tProp) {
        case Symbol.for("image"):
          return this.pimage;
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
          return this.pSprite.width;
        case Symbol.for("height"):
          return this.pSprite.height;
        case Symbol.for("rect"):
          return this.pSprite.rect;
        case Symbol.for("depth"):
          return this.pimage.depth;
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
    },

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
          this.resizeTo(tValue, this.pheight);
          break;
        case Symbol.for("height"):
          this.resizeTo(this.pwidth, tValue);
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
          this.pimage = tValue;
          this.render();
          break;
        case Symbol.for("buffer"):
        case Symbol.for("member"):
          switch (ilk(tValue)) {
            case Symbol.for("member"):
              this.pSprite.member = tValue;
              break;
            case Symbol.for("string"):
              this.pSprite.member = _director.getMember(tValue);
              break;
            case Symbol.for("integer"):
              this.pSprite.member = member(tValue);
              break;
            default:
              return _director.error(this, "Can't set #buffer/#member to type : " + ilk(tValue), Symbol.for("setProperty"), Symbol.for("minor"));
          }
          this.pSprite.width = this.pSprite.member.width;
          this.pSprite.height = this.pSprite.member.height;
          break;
        case Symbol.for("palette"):
          this.pPalette = tValue;
          this.pimage.paletteRef = this.pPalette;
          break;
        case Symbol.for("depth"):
          this.pDepth = tValue;
          let tImage = this.pimage.duplicate();
          this.pimage = image(this.pimage.width, this.pimage.height, this.pDepth);
          this.pimage.copyPixels(tImage, tImage.rect, tImage.rect);
          this.pimage.paletteRef = this.pPalette;
          break;
        case Symbol.for("visible"):
          if (tValue === 1) {
            this.show();
          } else {
            this.hide();
          }
          break;
        case Symbol.for("image"):
          this.pimage = tValue;
          this.render();
          break;
        default:
          return 0;
      }
      return 1;
    },

    render() {
      this.pBuffer.image.copyPixels(this.pimage, this.pBuffer.image.rect, this.pimage.rect, this.pParams);
    },

    draw(tRGB) {
      if (!ilk(tRGB, Symbol.for("color"))) {
        tRGB = rgb(255, 0, 0);
      }
      this.pBuffer.image.draw(this.pBuffer.image.rect, propList(Symbol.for("shapeType"), Symbol.for("rect"), Symbol.for("color"), tRGB));
    },
  };
}
