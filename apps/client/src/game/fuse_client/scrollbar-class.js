import {
  call,
  float,
  image,
  integer,
  member,
  point,
  propList,
  rect,
  stringp,
  the,
  voidp,
} from "../../director";

export default function () {
  let tField, tTempOffset, tHeight, tPercent, tWidth, tMouseH, tMouseV, tNewLocV, tNewLiftRect, tNewLocH, tMoveAreaV, tNewOffset, tMoveAreaH, tScrollPercent, tNowPercent, tNowOffset, tPalette, f, i, tDesc, tmember, tImage, tRect, tImgPropName, tDstRect, tstate2, tClickbutton, tUpPageUp, tTop, tBottom, tLeft, tRight, r, tAgent, tOffH, tOffV, tImage2, tQuad, tDirection, tPnt1, tPnt2, tPnt3, tPnt4;

  return {
    pState: VOID,
    pClientID: VOID,
    pAgentID: VOID,
    pButtonImg: VOID,
    pParts: VOID,
    pRects: VOID,
    pScrollOffset: VOID,
    pViewClientRect: VOID,
    pClientSourceRect: VOID,
    pScrollStep: VOID,
    pButtonStates: VOID,
    pMaxOffset: VOID,
    pPageSize: VOID,
    pClickPoint: VOID,
    pClickPass: VOID,
    pPalette: VOID,
    pProps: VOID,
    pID: VOID,
    pMotherId: VOID,
    pType: VOID,
    pScaleH: VOID,
    pScaleV: VOID,
    pBuffer: VOID,
    pSprite: VOID,
    pLocX: VOID,
    pLocY: VOID,
    pwidth: VOID,
    pheight: VOID,
    pimage: VOID,

    deconstruct() {
      _director.removeObject(this.pAgentID);
      return 1;
    },

    define(tProps) {
      tField = tProps[Symbol.for("type")] + tProps[Symbol.for("model")] + ".element";
      this.pParts = _director.getObject(Symbol.for("layout_parser")).parse(tField);
      if (this.pParts === 0) {
        return 0;
      }
      this.pProps = tProps;
      this.pID = tProps[Symbol.for("id")];
      this.pMotherId = tProps[Symbol.for("mother")];
      this.pType = tProps[Symbol.for("type")];
      this.pScaleH = tProps[Symbol.for("scaleH")];
      this.pScaleV = tProps[Symbol.for("scaleV")];
      this.pBuffer = tProps[Symbol.for("buffer")];
      this.pSprite = tProps[Symbol.for("sprite")];
      this.pLocX = tProps[Symbol.for("locX")];
      this.pLocY = tProps[Symbol.for("locY")];
      this.pwidth = tProps[Symbol.for("width")];
      this.pheight = tProps[Symbol.for("height")];
      this.pClientID = tProps[Symbol.for("client")];
      this.pScrollStep = tProps[Symbol.for("offset")];
      this.pButtonImg = propList();
      if (variableExists("interface.palette")) {
        this.pPalette = member(getmemnum(getVariable("interface.palette")));
      } else {
        this.pPalette = Symbol.for("systemMac");
      }
      this.pRects = propList();
      this.pState = Symbol.for("waitMouseEvent");
      this.pScrollOffset = 0;
      this.pButtonStates = propList();
      this.pButtonStates.setaProp(Symbol.for("top"), Symbol.for("up"));
      this.pButtonStates.setaProp(Symbol.for("bottom"), Symbol.for("up"));
      this.pButtonStates.setaProp(Symbol.for("bar"), Symbol.for("up"));
      this.pButtonStates.setaProp(Symbol.for("lift"), Symbol.for("up"));
      this.UpdateImageObjects(VOID, [Symbol.for("up"), Symbol.for("down"), Symbol.for("passive")]);
      if (this.pType === "scrollbarv") {
        this.pwidth = this.pButtonImg["top_up"].width;
      } else {
        this.pheight = this.pButtonImg["top_up"].height;
      }
      this.pimage = image(this.pwidth, this.pheight, 8, this.pPalette);
      this.UpdateScrollBar([Symbol.for("top"), Symbol.for("bottom"), Symbol.for("bar"), Symbol.for("lift")], Symbol.for("up"));
      tTempOffset = this.pBuffer.regPoint;
      this.pBuffer.image = this.pimage;
      this.pBuffer.regPoint = tTempOffset;
      this.pAgentID = this.getID() + " " + the.milliSeconds;
      _director.createObject(this.pAgentID, _director.getClassVariable("event.agent.class"));
      return 1;
    },

    prepare() {
      this.pSprite.width = this.pwidth;
      this.pSprite.height = this.pheight;
      call(Symbol.for("registerScroll"), [_director.getWindow(this.pMotherId).getElement(this.pClientID)], this.pID);
    },

    getProperty(tProp) {
      switch (tProp) {
        case Symbol.for("width"):
          return this.pwidth;
        case Symbol.for("height"):
          return this.pheight;
        case Symbol.for("locH"):
          return this.pLocX;
        case Symbol.for("locV"):
          return this.pLocY;
        case Symbol.for("locX"):
          return this.pLocX;
        case Symbol.for("locY"):
          return this.pLocY;
        case Symbol.for("offset"):
          return this.pScrollOffset;
        case Symbol.for("scrollrange"):
          if (this.pType === "scrollbarv") {
            return this.pClientSourceRect[4] - this.pClientSourceRect[2];
          } else {
            return this.pClientSourceRect[2] - this.pClientSourceRect[1];
          }
        case Symbol.for("scrollStep"):
          return this.pScrollStep;
        default:
          return 0;
      }
    },

    getScrollOffset() {
      return this.pScrollOffset;
    },

    setScrollOffset(tOffset) {
      this.sendAdjustOffsetTo(tOffset);
      this.UpdateLiftPosition();
      this.ButtonsStates();
      return 1;
    },

    updateData(tViewClientRect, tClientSourceRect) {
      this.pViewClientRect = tViewClientRect;
      this.pClientSourceRect = tClientSourceRect;
      if (this.pType === "scrollbarv") {
        if ((this.pViewClientRect.height % this.pScrollStep) !== 0) {
          this.pViewClientRect.bottom = this.pViewClientRect.bottom - (this.pViewClientRect.height % this.pScrollStep) + this.pScrollStep;
        }
        if (this.pViewClientRect.height > this.pClientSourceRect.height) {
          this.pScrollOffset = 0;
        }
        this.pMaxOffset = this.pClientSourceRect.height - this.pViewClientRect.height;
        this.pPageSize = this.pViewClientRect.height;
      } else {
        if ((this.pViewClientRect.width % this.pScrollStep) !== 0) {
          this.pViewClientRect.right = this.pViewClientRect.right - (this.pViewClientRect.width % this.pScrollStep) + this.pScrollStep;
        }
        if (this.pViewClientRect.width > this.pClientSourceRect.width) {
          this.pScrollOffset = 0;
        }
        this.pMaxOffset = this.pClientSourceRect.width - this.pViewClientRect.width;
        this.pPageSize = this.pViewClientRect.width;
      }
      this.sendAdjustOffsetTo(this.pScrollOffset);
      this.ButtonsStates();
    },

    ScrollBarPercentV() {
      tHeight = float(this.pClientSourceRect.height - this.pViewClientRect.height);
      if (tHeight === 0) {
        return 0;
      } else {
        tPercent = float(this.pScrollOffset) / tHeight;
        if (tPercent > 1.0) {
          return 1.0;
        } else {
          return tPercent;
        }
      }
    },

    ScrollBarPercentH() {
      tWidth = float(this.pClientSourceRect.width - this.pViewClientRect.width);
      if (tWidth === 0) {
        return 0;
      } else {
        tPercent = float(this.pScrollOffset) / tWidth;
        if (tPercent > 1.0) {
          return 1.0;
        } else {
          return tPercent;
        }
      }
    },

    mouseDown() {
      if (this.pSprite.blend < 100) {
        return 0;
      }
      this.pClickPass = 1;
      this.pClickPoint = the.mouseLoc;
      this.ScrollBarMouseEvent(Symbol.for("down"));
      this.render();
      return 1;
    },

    mouseUp() {
      this.initEventAgent(0);
      if (this.pSprite.blend < 100) {
        return 0;
      }
      if (this.pClickPass === 0) {
        return 0;
      }
      this.pClickPass = 0;
      this.ScrollBarMouseEvent(Symbol.for("up"));
      this.pState = Symbol.for("waitMouseEvent");
      this.ButtonsStates();
      this.render();
      return 1;
    },

    mouseWithin() {
      if (this.pState === Symbol.for("lift")) {
        tMouseH = the.mouseH;
        tMouseV = the.mouseV;
        if (this.pType === "scrollbarv") {
          if (tMouseV > (this.pSprite.bottom - this.pRects[Symbol.for("bottom")].height)) {
            tMouseV = this.pSprite.bottom - this.pRects[Symbol.for("bottom")].height;
          } else {
            if (tMouseV < (this.pSprite.top + this.pRects[Symbol.for("top")].height)) {
              tMouseV = this.pSprite.top + this.pRects[Symbol.for("top")].height;
            }
          }
          tNewLocV = this.pClickPoint.locV - tMouseV;
          tNewLiftRect = this.pRects[Symbol.for("lift")] - rect(0, tNewLocV, 0, tNewLocV);
          if (tNewLiftRect.bottom > this.pRects[Symbol.for("bottom")].top) {
            tNewLiftRect = this.pButtonImg[Symbol.for("lift_up")].rect + rect(0, this.pRects[Symbol.for("bottom")].top - this.pRects[Symbol.for("lift")].height, 0, this.pRects[Symbol.for("bottom")].top - this.pRects[Symbol.for("lift")].height);
          }
          if (tNewLiftRect.top < this.pRects[Symbol.for("top")].bottom) {
            tNewLiftRect = this.pButtonImg[Symbol.for("lift_up")].rect + rect(0, this.pRects[Symbol.for("top")].height, 0, this.pRects[Symbol.for("top")].height);
          }
        } else {
          if (tMouseH > (this.pSprite.right - this.pRects[Symbol.for("bottom")].left)) {
            tMouseH = this.pSprite.right - this.pRects[Symbol.for("bottom")].left;
          } else {
            if (tMouseH < (this.pSprite.left + this.pRects[Symbol.for("top")].right)) {
              tMouseH = this.pSprite.left + this.pRects[Symbol.for("top")].right;
            }
          }
          tNewLocH = this.pClickPoint.locH - tMouseH;
          tNewLiftRect = this.pRects[Symbol.for("lift")] - rect(tNewLocH, 0, tNewLocH, 0);
          if (tNewLiftRect.right > this.pRects[Symbol.for("bottom")].left) {
            tNewLiftRect = this.pButtonImg[Symbol.for("lift_up")].rect + rect(this.pRects[Symbol.for("bottom")].left - this.pRects[Symbol.for("lift")].width, 0, this.pRects[Symbol.for("bottom")].left - this.pRects[Symbol.for("lift")].width, 0);
          }
          if (tNewLiftRect.left < this.pRects[Symbol.for("top")].right) {
            tNewLiftRect = this.pButtonImg[Symbol.for("lift_up")].rect + rect(this.pRects[Symbol.for("top")].width, 0, this.pRects[Symbol.for("top")].width, 0);
          }
        }
        this.pRects[Symbol.for("lift")] = tNewLiftRect;
        this.UpdateScrollBar([Symbol.for("bar")], Symbol.for("up"));
        this.UpdateScrollBar([Symbol.for("lift")], Symbol.for("down"));
        this.ScrollByLift();
        this.ButtonsStates();
        this.pClickPoint = point(tMouseH, tMouseV);
      } else {
        if ((this.pState === Symbol.for("top")) || (this.pState === Symbol.for("bottom"))) {
          this.ScrollBarMouseEvent(Symbol.for("down"));
          this.ButtonsStates();
        }
      }
    },

    mouseUpOutSide() {
      if (this.pSprite.blend < 100) {
        return 0;
      }
      this.pClickPass = 0;
      this.pState = Symbol.for("waitMouseEvent");
      this.ButtonsStates();
      this.render();
      return 0;
    },

    UpdateLiftPosition() {
      if (this.pType === "scrollbarv") {
        tMoveAreaV = this.pRects[Symbol.for("bar")].height - this.pRects[Symbol.for("lift")].height;
        tNewOffset = integer(this.ScrollBarPercentV() * tMoveAreaV);
        this.pRects[Symbol.for("lift")] = rect(0, tNewOffset + this.pRects[Symbol.for("top")].height, this.pRects[Symbol.for("lift")].width, tNewOffset + this.pRects[Symbol.for("top")].height + this.pRects[Symbol.for("lift")].height);
      } else {
        tMoveAreaV = this.pRects[Symbol.for("bar")].width - this.pRects[Symbol.for("lift")].width;
        tNewOffset = integer(this.ScrollBarPercentH() * tMoveAreaV);
        this.pRects[Symbol.for("lift")] = rect(tNewOffset + this.pRects[Symbol.for("top")].width, 0, tNewOffset + this.pRects[Symbol.for("top")].width + this.pRects[Symbol.for("lift")].width, this.pRects[Symbol.for("lift")].height);
      }
    },

    ScrollByLift() {
      if (this.pType === "scrollbarv") {
        tMoveAreaV = this.pRects[Symbol.for("bar")].height - this.pRects[Symbol.for("lift")].height;
        if (tMoveAreaV === 0) {
          return 0;
        }
        tScrollPercent = (this.pRects[Symbol.for("lift")].top - this.pRects[Symbol.for("lift")].height + 1) * 100 / tMoveAreaV;
        tNowPercent = float(tScrollPercent) / 100;
        tNowOffset = integer((this.pClientSourceRect.bottom - this.pViewClientRect.height) * float(tScrollPercent) / 100);
      } else {
        tMoveAreaH = this.pRects[Symbol.for("bar")].width - this.pRects[Symbol.for("lift")].width;
        if (tMoveAreaH === 0) {
          return 0;
        }
        tScrollPercent = (this.pRects[Symbol.for("lift")].left - this.pRects[Symbol.for("lift")].width + 1) * 100 / tMoveAreaH;
        tNowPercent = float(tScrollPercent) / 100;
        tNowOffset = integer((this.pClientSourceRect.right - this.pViewClientRect.width) * float(tScrollPercent) / 100);
      }
      this.sendAdjustOffsetTo(tNowOffset);
    },

    sendAdjustOffsetTo(tNewOffset) {
      if ((Math.abs(this.pScrollOffset - tNewOffset) < this.pScrollStep) && (tNewOffset < this.pMaxOffset) && (tNewOffset > 0)) {
        return 1;
      }
      if (tNewOffset < this.pMaxOffset) {
        this.pScrollOffset = tNewOffset;
        if (this.pScrollStep > 0) {
          this.pScrollOffset = this.pScrollOffset / this.pScrollStep * this.pScrollStep;
        }
      } else {
        this.pScrollOffset = this.pMaxOffset;
      }
      if (this.pScrollOffset <= 0) {
        this.pScrollOffset = 0;
      }
      if (this.pType === "scrollbarv") {
        call(Symbol.for("setOffsetY"), [_director.getWindow(this.pMotherId).getElement(this.pClientID)], this.pScrollOffset);
      } else {
        call(Symbol.for("setOffsetX"), [_director.getWindow(this.pMotherId).getElement(this.pClientID)], this.pScrollOffset);
      }
    },

    UpdateImageObjects(tPalette, tListStates) {
      if (voidp(tPalette)) {
        tPalette = this.pPalette;
      } else {
        if (stringp(tPalette)) {
          tPalette = member(getmemnum(tPalette));
        }
      }
      for (const f of [Symbol.for("top"), Symbol.for("lift"), Symbol.for("bottom"), Symbol.for("bar")]) {
        for (const i of tListStates) {
          tDesc = this.pParts[i][Symbol.for("members")][f];
          if (!voidp(tDesc)) {
            tmember = member(getmemnum(tDesc[Symbol.for("member")]));
            if (!voidp(tDesc[Symbol.for("palette")])) {
              this.pPalette = member(getmemnum(tDesc[Symbol.for("palette")]));
            } else {
              this.pPalette = tPalette;
            }
            tImage = tmember.image.duplicate();
            if (tDesc[Symbol.for("flipH")]) {
              tImage = this.flipH(tImage);
            }
            if (tDesc[Symbol.for("flipV")]) {
              tImage = this.flipV(tImage);
            }
            if (!voidp(tDesc[Symbol.for("rotate")])) {
              tImage = this.rotateImg(tImage, tDesc[Symbol.for("rotate")]);
            }
            this.pButtonImg.addProp(Symbol.for(f.description + "_" + i.description), tImage);
          }
        }
        this.DefineRects(f);
      }
      return tPalette;
    },

    DefineRects(tElementPart) {
      if (this.pType === "scrollbarv") {
        tRect = this.pButtonImg[tElementPart.description + "_up"].rect;
        switch (tElementPart) {
          case Symbol.for("lift"):
            tRect = tRect + rect(0, this.pButtonImg["top_up"].height, 0, this.pButtonImg["top_up"].height);
            break;
          case Symbol.for("bottom"):
            tRect = tRect + rect(0, this.pheight - this.pButtonImg["bottom_up"].height, 0, this.pheight - this.pButtonImg["bottom_up"].height);
            break;
          case Symbol.for("bar"):
            tRect = tRect + rect(0, this.pButtonImg[Symbol.for("top_up")].height, 0, this.pheight - this.pButtonImg[Symbol.for("bottom_up")].height - 1);
            break;
        }
        this.pRects.addProp(tElementPart, tRect);
      } else {
        tRect = this.pButtonImg[tElementPart.description + "_up"].rect;
        switch (tElementPart) {
          case Symbol.for("lift"):
            tRect = tRect + rect(this.pButtonImg["top_up"].width, 0, this.pButtonImg["top_up"].width, 0);
            break;
          case Symbol.for("bottom"):
            tRect = tRect + rect(this.pwidth - this.pButtonImg["bottom_up"].width, 0, this.pwidth - this.pButtonImg["bottom_up"].width, 0);
            break;
          case Symbol.for("bar"):
            tRect = tRect + rect(this.pButtonImg[Symbol.for("top_up")].width, 0, this.pwidth - this.pButtonImg[Symbol.for("bottom_up")].width - 1, 0);
            break;
        }
        this.pRects.addProp(tElementPart, tRect);
      }
    },

    DrawSpecificRect(tdestrect, tElementPart, tstate2) {
      tImgPropName = tElementPart.description + "_" + tstate2.description;
      this.pimage.copyPixels(this.pButtonImg.getProp(tImgPropName), tdestrect, this.pButtonImg.getProp(tImgPropName).rect);
    },

    UpdateScrollBar(tElementPartList, tstate2) {
      for (const f of tElementPartList) {
        tDstRect = this.pRects[f];
        tImgPropName = f.description + "_" + tstate2.description;
        this.pimage.copyPixels(this.pButtonImg.getProp(tImgPropName), tDstRect, this.pButtonImg.getProp(tImgPropName).rect, { [Symbol.for("ink")]: 36 });
      }
    },

    ScrollBarMouseEvent(tstate2) {
      if ((this.pButtonStates[Symbol.for("top")] === Symbol.for("passive")) && (this.pButtonStates[Symbol.for("bottom")] === Symbol.for("passive"))) {
        return;
      }
      if (this.pState === Symbol.for("lift")) {
        this.UpdateScrollBar([Symbol.for("bar"), Symbol.for("lift")], Symbol.for("up"));
        this.pButtonStates[Symbol.for("lift")] = Symbol.for("up");
        return;
      }
      tClickbutton = this.buttonOfClickArea(this.pClickPoint);
      if (voidp(tClickbutton)) {
        return;
      }
      if (this.pButtonStates[tClickbutton] === Symbol.for("passive")) {
        return;
      }
      this.pButtonStates[tClickbutton] = tstate2;
      this.pState = tClickbutton;
      if ((tClickbutton === Symbol.for("top")) || (tClickbutton === Symbol.for("bottom"))) {
        this.UpdateScrollBar([tClickbutton], tstate2);
        if (tClickbutton === Symbol.for("top")) {
          this.sendAdjustOffsetTo(this.pScrollOffset - this.pScrollStep);
        } else {
          this.sendAdjustOffsetTo(this.pScrollOffset + this.pScrollStep);
        }
        this.UpdateLiftPosition();
        this.UpdateScrollBar([Symbol.for("bar"), Symbol.for("lift")], Symbol.for("up"));
      } else {
        if (tClickbutton === Symbol.for("lift")) {
          this.UpdateScrollBar([Symbol.for("bar")], Symbol.for("up"));
          this.UpdateScrollBar([Symbol.for("lift")], tstate2);
          this.initEventAgent(1);
        } else {
          if ((tClickbutton === Symbol.for("bar")) && (tstate2 === Symbol.for("down"))) {
            tUpPageUp = 0;
            this.UpdateLiftPosition();
            if (this.pType === "scrollbarv") {
              if ((this.pClickPoint.locV - this.pSprite.locV) <= this.pRects[Symbol.for("lift")].top) {
                tUpPageUp = 1;
              }
            } else {
              if ((this.pClickPoint.locH - this.pSprite.locH) <= this.pRects[Symbol.for("lift")].left) {
                tUpPageUp = 1;
              }
            }
            if (this.pType === "scrollbarv") {
              if (tUpPageUp) {
                this.sendAdjustOffsetTo(this.pScrollOffset - this.pPageSize);
                tTop = this.pRects[Symbol.for("lift")].bottom;
                tBottom = this.pRects[Symbol.for("bottom")].top;
              } else {
                this.sendAdjustOffsetTo(this.pScrollOffset + this.pPageSize);
                tTop = this.pRects[Symbol.for("top")].bottom;
                tBottom = this.pRects[Symbol.for("lift")].top;
              }
              this.UpdateScrollBar([Symbol.for("bar")], tstate2);
              this.DrawSpecificRect(rect(0, tTop, this.pRects[Symbol.for("bar")].width, tBottom), Symbol.for("bar"), Symbol.for("up"));
            } else {
              if (tUpPageUp) {
                this.sendAdjustOffsetTo(this.pScrollOffset - this.pPageSize);
                tLeft = this.pRects[Symbol.for("lift")].right;
                tRight = this.pRects[Symbol.for("bottom")].left;
              } else {
                this.sendAdjustOffsetTo(this.pScrollOffset + this.pPageSize);
                tLeft = this.pRects[Symbol.for("top")].right;
                tRight = this.pRects[Symbol.for("lift")].left;
              }
              this.UpdateScrollBar([Symbol.for("bar")], tstate2);
              this.DrawSpecificRect(rect(tLeft, 0, tRight, this.pRects[Symbol.for("bar")].height), Symbol.for("bar"), Symbol.for("up"));
            }
            this.UpdateScrollBar([Symbol.for("lift")], Symbol.for("up"));
          }
        }
      }
    },

    ButtonsStates() {
      if ((this.pScrollOffset > 0) && (this.pButtonStates[Symbol.for("top")] !== Symbol.for("up")) && (this.pState !== Symbol.for("top"))) {
        this.pButtonStates[Symbol.for("top")] = Symbol.for("up");
        this.UpdateScrollBar([Symbol.for("top")], Symbol.for("up"));
      } else {
        if ((this.pScrollOffset <= 0) && (this.pButtonStates[Symbol.for("top")] !== Symbol.for("passive"))) {
          this.pButtonStates[Symbol.for("top")] = Symbol.for("passive");
          this.UpdateScrollBar([Symbol.for("top")], Symbol.for("passive"));
        }
      }
      if ((this.pScrollOffset < this.pMaxOffset) && (this.pButtonStates[Symbol.for("bottom")] !== Symbol.for("up")) && (this.pState !== Symbol.for("bottom"))) {
        this.pButtonStates[Symbol.for("bottom")] = Symbol.for("up");
        this.UpdateScrollBar([Symbol.for("bottom")], Symbol.for("up"));
      } else {
        if ((this.pScrollOffset >= this.pMaxOffset) && (this.pButtonStates[Symbol.for("bottom")] !== Symbol.for("passive"))) {
          this.pButtonStates[Symbol.for("bottom")] = Symbol.for("passive");
          this.UpdateScrollBar([Symbol.for("bottom")], Symbol.for("passive"));
        }
      }
      if ((this.pButtonStates[Symbol.for("top")] === Symbol.for("passive")) && (this.pButtonStates[Symbol.for("bottom")] === Symbol.for("passive"))) {
        this.pButtonStates[Symbol.for("lift")] = Symbol.for("passive");
        this.UpdateScrollBar([Symbol.for("bar")], Symbol.for("up"));
        this.UpdateScrollBar([Symbol.for("lift")], Symbol.for("passive"));
      } else {
        if (this.pState !== Symbol.for("lift")) {
          this.pButtonStates[Symbol.for("lift")] = Symbol.for("up");
          this.UpdateLiftPosition();
          this.UpdateScrollBar([Symbol.for("bar"), Symbol.for("lift")], Symbol.for("up"));
        }
      }
      this.render();
    },

    buttonOfClickArea(tpoint) {
      tpoint = tpoint - point(this.pSprite.left, this.pSprite.top);
      for (let r = 1; r <= this.pRects.count(); r++) {
        if (tpoint.inside(this.pRects[r])) {
          return this.pRects.getPropAt(r);
        }
      }
    },

    initEventAgent(tBoolean) {
      tAgent = _director.getObject(this.pAgentID);
      if (tBoolean) {
        tAgent.registerEvent(this, Symbol.for("mouseUp"), Symbol.for("mouseUp"));
        tAgent.registerEvent(this, Symbol.for("mouseWithin"), Symbol.for("mouseWithin"));
      } else {
        tAgent.unregisterEvent(Symbol.for("mouseUp"));
        tAgent.unregisterEvent(Symbol.for("mouseWithin"));
      }
    },

    resizeBy(tOffH, tOffV) {
      if ((tOffH !== 0) || (tOffV !== 0)) {
        switch (this.pScaleH) {
          case Symbol.for("move"):
            this.pSprite.locH = this.pSprite.locH + tOffH;
            break;
          case Symbol.for("scale"):
            this.pSprite.width = this.pSprite.width + tOffH;
            break;
          case Symbol.for("center"):
            this.pSprite.locH = this.pSprite.locH + (tOffH / 2);
            break;
        }
        switch (this.pScaleV) {
          case Symbol.for("move"):
            this.pSprite.locV = this.pSprite.locV + tOffV;
            break;
          case Symbol.for("scale"):
            this.pSprite.height = this.pSprite.height + tOffV;
            break;
          case Symbol.for("center"):
            this.pSprite.locV = this.pSprite.locV + (tOffV / 2);
            break;
        }
        this.pRects = propList();
        this.pState = Symbol.for("waitMouseEvent");
        this.pScrollOffset = 0;
        this.pButtonStates = propList();
        this.pButtonStates.setaProp(Symbol.for("top"), Symbol.for("up"));
        this.pButtonStates.setaProp(Symbol.for("bottom"), Symbol.for("up"));
        this.pButtonStates.setaProp(Symbol.for("bar"), Symbol.for("up"));
        this.pButtonStates.setaProp(Symbol.for("lift"), Symbol.for("up"));
        if (this.pType === "scrollbarv") {
          this.pwidth = this.pButtonImg["top_up"].width;
          this.pheight = this.pSprite.height;
        } else {
          this.pwidth = this.pSprite.width;
          this.pheight = this.pButtonImg["top_up"].height;
        }
        if (this.pwidth < 1) {
          this.pwidth = 1;
        }
        if (this.pheight < 1) {
          this.pheight = 1;
        }
        this.UpdateImageObjects(VOID, [Symbol.for("up"), Symbol.for("down"), Symbol.for("passive")]);
        this.pimage = image(this.pwidth, this.pheight, 8, this.pPalette);
        this.UpdateScrollBar([Symbol.for("top"), Symbol.for("bottom"), Symbol.for("bar"), Symbol.for("lift")], Symbol.for("up"));
        tTempOffset = this.pBuffer.regPoint;
        this.pBuffer.image = this.pimage;
        this.pBuffer.regPoint = tTempOffset;
      }
    },

    flipH(tImg) {
      tImage2 = image(tImg.width, tImg.height, tImg.depth, tImg.paletteRef);
      tQuad = [point(tImg.width, 0), point(0, 0), point(0, tImg.height), point(tImg.width, tImg.height)];
      tImage2.copyPixels(tImg, tQuad, tImg.rect);
      return tImage2;
    },

    flipV(tImg) {
      tImage2 = image(tImg.width, tImg.height, tImg.depth, tImg.paletteRef);
      tQuad = [point(0, tImg.height), point(tImg.width, tImg.height), point(tImg.width, 0), point(0, 0)];
      tImage2.copyPixels(tImg, tQuad, tImg.rect);
      return tImage2;
    },

    rotateImg(tImg, tDirection) {
      tImage2 = image(tImg.height, tImg.width, tImg.depth, tImg.paletteRef);
      tQuad = [point(0, 0), point(tImg.height, 0), point(tImg.height, tImg.width), point(0, tImg.width)];
      tQuad = this.RotateQuad(tQuad, tDirection);
      tImage2.copyPixels(tImg, tQuad, tImg.rect);
      return tImage2;
    },

    RotateQuad(tDestquad, tClockwise) {
      tPnt1 = tDestquad[1];
      tPnt2 = tDestquad[2];
      tPnt3 = tDestquad[3];
      tPnt4 = tDestquad[4];
      if (tClockwise) {
        return [tPnt2, tPnt3, tPnt4, tPnt1];
      } else {
        return [tPnt4, tPnt1, tPnt2, tPnt3];
      }
    },
  };
}
