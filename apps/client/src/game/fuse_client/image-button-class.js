import { VOID, member, propList, stringp, symbol, voidp } from "../../director";
import { itemOf } from "../../director";

export default function () {
  let tTemp, tMemName, tTempOffset, tMemNum, tmember, tImage;

  return {
    pBlend: VOID,
    pButtonImg: VOID,
    pFixedSize: VOID,
    pimage: VOID,
    pBuffer: VOID,
    pwidth: VOID,
    pheight: VOID,
    pSprite: VOID,
    pProps: VOID,
    pPalette: VOID,

    prepare() {
      this.pBlend = this.pProps[Symbol.for("blend")];
      this.pButtonImg = propList();
      if (voidp(this.pFixedSize)) {
        this.pFixedSize = 0;
      }
      tTemp = the.itemDelimiter;
      the.itemDelimiter = ".";
      tMemName = this.pProps[Symbol.for("member")];
      tMemName = itemOf(tMemName).slice(1, itemOf(tMemName).count - 1);
      the.itemDelimiter = tTemp;
      this.UpdateImageObjects(VOID, Symbol.for("up"), tMemName);
      this.UpdateImageObjects(VOID, Symbol.for("down"), tMemName);
      this.pimage = this.createButtonImg(Symbol.for("up"));
      tTempOffset = this.pSprite.member.regPoint;
      this.pBuffer.image = this.pimage;
      this.pBuffer.regPoint = tTempOffset;
      this.pwidth = this.pimage.width;
      this.pheight = this.pimage.height;
      this.pSprite.width = this.pwidth;
      this.pSprite.height = this.pheight;
      return 1;
    },

    changeState(tstate) {
      this.pimage = this.createButtonImg(tstate);
      this.render();
    },

    UpdateImageObjects(tPalette, tstate, tMemName) {
      if (voidp(tPalette)) {
        tPalette = this.pPalette;
      } else {
        if (stringp(tPalette)) {
          tPalette = member(_director.getmemnum(tPalette));
        }
      }
      if (tstate === Symbol.for("up")) {
        tMemName = tMemName + ".active";
      } else {
        if (tstate === Symbol.for("down")) {
          tMemName = tMemName + ".pressed";
        }
      }
      tMemNum = _director.getmemnum(tMemName);
      if (tMemNum === 0) {
        return _director.error(this, "Member not found:" + " " + tMemName, Symbol.for("UpdateImageObjects"), Symbol.for("minor"));
      }
      tmember = member(tMemNum);
      tImage = tmember.image.duplicate();
      if (tImage.paletteRef !== tPalette) {
        tImage.paletteRef = tPalette;
      }
      this.pButtonImg.addProp(symbol(tstate), tImage);
    },

    createButtonImg(tstate) {
      return this.pButtonImg.getProp(tstate);
    },
  };
}
