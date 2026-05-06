import {
  EMPTY,
  ilk,
  integerp,
  member,
  numToChar,
  random,
  rect,
  rgb,
  string,
  stringp,
  the,
  VOID,
  voidp,
} from "../../director";

export default function () {
  return {
    pMember: VOID,

    deconstruct() {
      return _director.getResourceManager().removeMember(this.pMember.name);
    },

    prepare() {
      this.pMember = member(
        _director.getResourceManager().createMember(
          this.pProps[Symbol.for("member")] + the.milliSeconds + numToChar(random(99)),
          Symbol.for("field"),
        ),
      );
      this.pMember.wordWrap = this.pProps[Symbol.for("wordWrap")];
      this.pMember.autoTab = this.pProps[Symbol.for("autoTab")];
      this.pMember.alignment = this.pProps[Symbol.for("alignment")];
      this.pMember.font = this.pProps[Symbol.for("font")];
      this.pMember.fontSize = this.pProps[Symbol.for("fontSize")];
      this.pMember.boxType = this.pProps[Symbol.for("boxType")];
      this.pMember.fontStyle = this.pProps[Symbol.for("fontStyle")];
      this.pMember.editable = 1;
      if (voidp(this.pProps[Symbol.for("border")])) {
        this.pProps[Symbol.for("border")] = 0;
      }
      this.pMember.color = this.pProps[Symbol.for("txtColor")];
      this.pMember.bgColor = this.pProps[Symbol.for("txtBgColor")];
      this.pMember.border = this.pProps[Symbol.for("border")];
      if (integerp(this.pProps[Symbol.for("boxDropShadow")])) {
        this.pMember.boxDropShadow = this.pProps[Symbol.for("boxDropShadow")];
      }
      if (this.pProps[Symbol.for("key")] === EMPTY) {
        this.pMember.text = EMPTY;
      } else {
        if (_director.textExists(this.pProps[Symbol.for("key")])) {
          this.pMember.text = _director.getText(this.pProps[Symbol.for("key")]);
        } else {
          _director.error(this, "Text not found:" + " " + this.pProps[Symbol.for("key")], Symbol.for("define"), Symbol.for("minor"));
          this.pMember.text = this.pProps[Symbol.for("key")];
        }
      }
      this.pSprite.member = this.pMember;
      this.pMember.rect = rect(0, 0, this.pwidth, this.pheight);
      return 1;
    },

    getText() {
      return this.pMember.text;
    },

    setText(tText) {
      if (!stringp(tText)) {
        tText = string(tText);
      }
      this.pMember.text = tText;
      return 1;
    },

    setEdit(tBool) {
      if ((tBool !== 1) && (tBool !== 0)) {
        return 0;
      }
      this.pMember.editable = tBool;
      this.pSprite.editable = tBool;
      return 1;
    },

    setFocus(tBool) {
      switch (tBool) {
        case 1:
          the.keyboardFocusSprite = this.pSprite.spriteNum;
          break;
        case 0:
          the.keyboardFocusSprite = 0;
          break;
        default:
          return 0;
      }
      return 1;
    },

    render() {
      this.pwidth = this.pSprite.width;
      this.pheight = this.pSprite.height;
      this.pMember.rect = rect(0, 0, this.pwidth, this.pheight);
    },

    draw(tRGB) {
      if (!ilk(tRGB, Symbol.for("color"))) {
        tRGB = rgb(255, 0, 0);
      }
      the.stage.image.draw(this.pSprite.rect, {
        [Symbol.for("shapeType")]: Symbol.for("rect"),
        [Symbol.for("color")]: tRGB,
      });
    },
  };
}
