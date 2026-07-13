export default class {
  pState;
  pClientID;
  pAgentID;
  pButtonImg;
  pParts;
  pRects;
  pScrollOffset;
  pViewClientRect;
  pClientSourceRect;
  pScrollStep;
  pButtonStates;
  pMaxOffset;
  pPageSize;
  pClickPoint;
  pClickPass;
  pProps;
  pID;
  pMotherId;
  pType;
  pScaleH;
  pScaleV;
  pBuffer;
  pSprite;
  pLocX;
  pLocY;
  pwidth;
  pheight;
  pPalette;
  pimage;
  pDepth;
  pParams;
  pOffX;
  pOffY;
  pOwnW;
  pOwnH;
  pOwnX;
  pOwnY;
  pScrolls;
  pVisible;

  deconstruct() {
    removeObject(this.pAgentID);
    return 1;
  }

  define(tProps) {
    const tField = `${tProps[Symbol.for("type")]}${tProps[Symbol.for("model")]}.element`;
    this.pParts = getObject(Symbol.for("layout_parser")).parse(tField);
    if (this.pParts == 0) {
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
    this.pButtonStates = propList("top", Symbol.for("up"), "bottom", Symbol.for("up"), "bar", Symbol.for("up"), "lift", Symbol.for("up"));
    this.UpdateImageObjects(VOID, list(Symbol.for("up"), Symbol.for("down"), Symbol.for("passive")));
    if (this.pType == "scrollbarv") {
      this.pwidth = this.pButtonImg["top_up"].width;
    } else {
      this.pheight = this.pButtonImg["top_up"].height;
    }
    this.pimage = image(this.pwidth, this.pheight, 8, this.pPalette);
    this.UpdateScrollBar(list(Symbol.for("top"), Symbol.for("bottom"), Symbol.for("bar"), Symbol.for("lift")), Symbol.for("up"));
    const tTempOffset = this.pBuffer.regPoint;
    this.pBuffer.image = this.pimage;
    this.pBuffer.regPoint = tTempOffset;
    this.pAgentID = `${this.getID()}${the.milliSeconds}`;
    createObject(this.pAgentID, getClassVariable("event.agent.class"));
    return 1;
  }

  prepare() {
    this.pSprite.width = this.pwidth;
    this.pSprite.height = this.pheight;
    call(Symbol.for("registerScroll"), list(getWindow(this.pMotherId).getElement(this.pClientID)), this.pID);
  }

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
        if (this.pType == "scrollbarv") {
          return this.pClientSourceRect[4] - this.pClientSourceRect[2];
        } else {
          return this.pClientSourceRect[2] - this.pClientSourceRect[1];
        }
      case Symbol.for("scrollStep"):
        return this.pScrollStep;
      default:
        return 0;
    }
  }

  getScrollOffset() {
    return this.pScrollOffset;
  }

  setScrollOffset(tOffset) {
    this.sendAdjustOffsetTo(tOffset);
    this.UpdateLiftPosition();
    this.ButtonsStates();
    return 1;
  }

  updateData(tViewClientRect, tClientSourceRect) {
    this.pViewClientRect = tViewClientRect;
    this.pClientSourceRect = tClientSourceRect;
    if (this.pType == "scrollbarv") {
      if ((this.pViewClientRect.height % this.pScrollStep) != 0) {
        this.pViewClientRect.bottom = this.pViewClientRect.bottom - (this.pViewClientRect.height % this.pScrollStep) + this.pScrollStep;
      }
      if (this.pViewClientRect.height > this.pClientSourceRect.height) {
        this.pScrollOffset = 0;
      }
      this.pMaxOffset = this.pClientSourceRect.height - this.pViewClientRect.height;
      this.pPageSize = this.pViewClientRect.height;
    } else {
      if ((this.pViewClientRect.width % this.pScrollStep) != 0) {
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
  }

  ScrollBarPercentV() {
    const tHeight = float(this.pClientSourceRect.height - this.pViewClientRect.height);
    if (tHeight == 0) {
      return 0;
    } else {
      let tPercent = float(this.pScrollOffset) / tHeight;
      if (tPercent > 1.0) {
        return 1.0;
      } else {
        return tPercent;
      }
    }
  }

  ScrollBarPercentH() {
    const tWidth = float(this.pClientSourceRect.width - this.pViewClientRect.width);
    if (tWidth == 0) {
      return 0;
    } else {
      let tPercent = float(this.pScrollOffset) / tWidth;
      if (tPercent > 1.0) {
        return 1.0;
      } else {
        return tPercent;
      }
    }
  }

  mouseDown() {
    if (this.pSprite.blend < 100) {
      return 0;
    }
    this.pClickPass = 1;
    this.pClickPoint = the.mouseLoc;
    this.ScrollBarMouseEvent(Symbol.for("down"));
    this.render();
    return 1;
  }

  mouseUp() {
    this.initEventAgent(0);
    if (this.pSprite.blend < 100) {
      return 0;
    }
    if (this.pClickPass == 0) {
      return 0;
    }
    this.pClickPass = 0;
    this.ScrollBarMouseEvent(Symbol.for("up"));
    this.pState = Symbol.for("waitMouseEvent");
    this.ButtonsStates();
    this.render();
    return 1;
  }

  mouseWithin() {
    if (this.pState == Symbol.for("lift")) {
      let tMouseH = the.mouseH;
      let tMouseV = the.mouseV;
      let tNewLiftRect;
      if (this.pType == "scrollbarv") {
        if (tMouseV > (this.pSprite.bottom - this.pRects[Symbol.for("bottom")].height)) {
          tMouseV = this.pSprite.bottom - this.pRects[Symbol.for("bottom")].height;
        } else {
          if (tMouseV < (this.pSprite.top + this.pRects[Symbol.for("top")].height)) {
            tMouseV = this.pSprite.top + this.pRects[Symbol.for("top")].height;
          }
        }
        const tNewLocV = this.pClickPoint.locV - tMouseV;
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
        const tNewLocH = this.pClickPoint.locH - tMouseH;
        tNewLiftRect = this.pRects[Symbol.for("lift")] - rect(tNewLocH, 0, tNewLocH, 0);
        if (tNewLiftRect.right > this.pRects[Symbol.for("bottom")].left) {
          tNewLiftRect = this.pButtonImg[Symbol.for("lift_up")].rect + rect(this.pRects[Symbol.for("bottom")].left - this.pRects[Symbol.for("lift")].width, 0, this.pRects[Symbol.for("bottom")].left - this.pRects[Symbol.for("lift")].width, 0);
        }
        if (tNewLiftRect.left < this.pRects[Symbol.for("top")].right) {
          tNewLiftRect = this.pButtonImg[Symbol.for("lift_up")].rect + rect(this.pRects[Symbol.for("top")].width, 0, this.pRects[Symbol.for("top")].width, 0);
        }
      }
      this.pRects[Symbol.for("lift")] = tNewLiftRect;
      this.UpdateScrollBar(list(Symbol.for("bar")), Symbol.for("up"));
      this.UpdateScrollBar(list(Symbol.for("lift")), Symbol.for("down"));
      this.ScrollByLift();
      this.ButtonsStates();
      this.pClickPoint = point(tMouseH, tMouseV);
    } else {
      if ((this.pState == Symbol.for("top")) || (this.pState == Symbol.for("bottom"))) {
        this.ScrollBarMouseEvent(Symbol.for("down"));
        this.ButtonsStates();
      }
    }
  }

  mouseUpOutSide() {
    if (this.pSprite.blend < 100) {
      return 0;
    }
    this.pClickPass = 0;
    this.pState = Symbol.for("waitMouseEvent");
    this.ButtonsStates();
    this.render();
    return 0;
  }

  UpdateLiftPosition() {
    let tMoveAreaV;
    let tNewOffset;
    if (this.pType == "scrollbarv") {
      tMoveAreaV = this.pRects[Symbol.for("bar")].height - this.pRects[Symbol.for("lift")].height;
      tNewOffset = integer(this.ScrollBarPercentV() * tMoveAreaV);
      this.pRects[Symbol.for("lift")] = rect(0, tNewOffset + this.pRects[Symbol.for("top")].height, this.pRects[Symbol.for("lift")].width, tNewOffset + this.pRects[Symbol.for("top")].height + this.pRects[Symbol.for("lift")].height);
    } else {
      tMoveAreaV = this.pRects[Symbol.for("bar")].width - this.pRects[Symbol.for("lift")].width;
      tNewOffset = integer(this.ScrollBarPercentH() * tMoveAreaV);
      this.pRects[Symbol.for("lift")] = rect(tNewOffset + this.pRects[Symbol.for("top")].width, 0, tNewOffset + this.pRects[Symbol.for("top")].width + this.pRects[Symbol.for("lift")].width, this.pRects[Symbol.for("lift")].height);
    }
  }

  ScrollByLift() {
    let tMoveAreaV;
    let tMoveAreaH;
    let tScrollPercent;
    let tNowPercent;
    let tNowOffset;
    if (this.pType == "scrollbarv") {
      tMoveAreaV = this.pRects[Symbol.for("bar")].height - this.pRects[Symbol.for("lift")].height;
      if (tMoveAreaV == 0) {
        return 0;
      }
      tScrollPercent = (this.pRects[Symbol.for("lift")].top - this.pRects[Symbol.for("lift")].height + 1) * 100 / tMoveAreaV;
      tNowPercent = float(tScrollPercent) / 100;
      tNowOffset = integer((this.pClientSourceRect.bottom - this.pViewClientRect.height) * float(tScrollPercent) / 100);
    } else {
      tMoveAreaH = this.pRects[Symbol.for("bar")].width - this.pRects[Symbol.for("lift")].width;
      if (tMoveAreaH == 0) {
        return 0;
      }
      tScrollPercent = (this.pRects[Symbol.for("lift")].left - this.pRects[Symbol.for("lift")].width + 1) * 100 / tMoveAreaH;
      tNowPercent = float(tScrollPercent) / 100;
      tNowOffset = integer((this.pClientSourceRect.right - this.pViewClientRect.width) * float(tScrollPercent) / 100);
    }
    this.sendAdjustOffsetTo(tNowOffset);
  }

  sendAdjustOffsetTo(tNewOffset) {
    if ((abs(this.pScrollOffset - tNewOffset) < this.pScrollStep) && (tNewOffset < this.pMaxOffset) && (tNewOffset > 0)) {
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
    if (this.pType == "scrollbarv") {
      call(Symbol.for("setOffsetY"), list(getWindow(this.pMotherId).getElement(this.pClientID)), this.pScrollOffset);
    } else {
      call(Symbol.for("setOffsetX"), list(getWindow(this.pMotherId).getElement(this.pClientID)), this.pScrollOffset);
    }
  }

  UpdateImageObjects(tPalette, tListStates) {
    if (voidp(tPalette)) {
      tPalette = this.pPalette;
    } else {
      if (stringp(tPalette)) {
        tPalette = member(getmemnum(tPalette));
      }
    }
    for (const f of list(Symbol.for("top"), Symbol.for("lift"), Symbol.for("bottom"), Symbol.for("bar"))) {
      for (const i of tListStates) {
        const tDesc = this.pParts[i][Symbol.for("members")][f];
        if (!voidp(tDesc)) {
          const tmember = member(getmemnum(tDesc[Symbol.for("member")]));
          if (!voidp(tDesc[Symbol.for("palette")])) {
            this.pPalette = member(getmemnum(tDesc[Symbol.for("palette")]));
          } else {
            this.pPalette = tPalette;
          }
          let tImage = tmember.image.duplicate();
          if (tDesc[Symbol.for("flipH")]) {
            tImage = this.flipH(tImage);
          }
          if (tDesc[Symbol.for("flipV")]) {
            tImage = this.flipV(tImage);
          }
          if (!voidp(tDesc[Symbol.for("rotate")])) {
            tImage = this.rotateImg(tImage, tDesc[Symbol.for("rotate")]);
          }
          this.pButtonImg.addProp(symbol(`${f}_${i}`), tImage);
        }
      }
      this.DefineRects(f);
    }
    return tPalette;
  }

  DefineRects(tElementPart) {
    let tRect;
    if (this.pType == "scrollbarv") {
      tRect = this.pButtonImg[`${tElementPart}_up`].rect;
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
      tRect = this.pButtonImg[`${tElementPart}_up`].rect;
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
  }

  DrawSpecificRect(tdestrect, tElementPart, tstate) {
    const tImgPropName = `${tElementPart}_${tstate}`;
    this.pimage.copyPixels(this.pButtonImg.getProp(tImgPropName), tdestrect, this.pButtonImg.getProp(tImgPropName).rect);
  }

  UpdateScrollBar(tElementPartList, tstate) {
    for (const f of tElementPartList) {
      const tDstRect = this.pRects[f];
      const tImgPropName = `${f}_${tstate}`;
      this.pimage.copyPixels(this.pButtonImg.getProp(tImgPropName), tDstRect, this.pButtonImg.getProp(tImgPropName).rect, propList("ink", 36));
    }
  }

  ScrollBarMouseEvent(tstate) {
    if ((this.pButtonStates[Symbol.for("top")] == Symbol.for("passive")) && (this.pButtonStates[Symbol.for("bottom")] == Symbol.for("passive"))) {
      return;
    }
    if (this.pState == Symbol.for("lift")) {
      this.UpdateScrollBar(list(Symbol.for("bar"), Symbol.for("lift")), Symbol.for("up"));
      this.pButtonStates[Symbol.for("lift")] = Symbol.for("up");
      return;
    }
    const tClickbutton = this.buttonOfClickArea(this.pClickPoint);
    if (voidp(tClickbutton)) {
      return;
    }
    if (this.pButtonStates[tClickbutton] == Symbol.for("passive")) {
      return;
    }
    this.pButtonStates[tClickbutton] = tstate;
    this.pState = symbol(tClickbutton);
    if ((tClickbutton == Symbol.for("top")) || (tClickbutton == Symbol.for("bottom"))) {
      this.UpdateScrollBar(list(tClickbutton), tstate);
      if (tClickbutton == Symbol.for("top")) {
        this.sendAdjustOffsetTo(this.pScrollOffset - this.pScrollStep);
      } else {
        this.sendAdjustOffsetTo(this.pScrollOffset + this.pScrollStep);
      }
      this.UpdateLiftPosition();
      this.UpdateScrollBar(list(Symbol.for("bar"), Symbol.for("lift")), Symbol.for("up"));
    } else {
      if (tClickbutton == Symbol.for("lift")) {
        this.UpdateScrollBar(list(Symbol.for("bar")), Symbol.for("up"));
        this.UpdateScrollBar(list(Symbol.for("lift")), tstate);
        this.initEventAgent(1);
      } else {
        if ((tClickbutton == Symbol.for("bar")) && (tstate == Symbol.for("down"))) {
          let tUpPageUp = 0;
          this.UpdateLiftPosition();
          if (this.pType == "scrollbarv") {
            if ((this.pClickPoint.locV - this.pSprite.locV) <= this.pRects[Symbol.for("lift")].top) {
              tUpPageUp = 1;
            }
          } else {
            if ((this.pClickPoint.locH - this.pSprite.locH) <= this.pRects[Symbol.for("lift")].left) {
              tUpPageUp = 1;
            }
          }
          if (this.pType == "scrollbarv") {
            let tTop;
            let tBottom;
            if (tUpPageUp) {
              this.sendAdjustOffsetTo(this.pScrollOffset - this.pPageSize);
              tTop = this.pRects[Symbol.for("lift")].bottom;
              tBottom = this.pRects[Symbol.for("bottom")].top;
            } else {
              this.sendAdjustOffsetTo(this.pScrollOffset + this.pPageSize);
              tTop = this.pRects[Symbol.for("top")].bottom;
              tBottom = this.pRects[Symbol.for("lift")].top;
            }
            this.UpdateScrollBar(list(Symbol.for("bar")), tstate);
            this.DrawSpecificRect(rect(0, tTop, this.pRects[Symbol.for("bar")].width, tBottom), Symbol.for("bar"), Symbol.for("up"));
          } else {
            let tLeft;
            let tRight;
            if (tUpPageUp) {
              this.sendAdjustOffsetTo(this.pScrollOffset - this.pPageSize);
              tLeft = this.pRects[Symbol.for("lift")].right;
              tRight = this.pRects[Symbol.for("bottom")].left;
            } else {
              this.sendAdjustOffsetTo(this.pScrollOffset + this.pPageSize);
              tLeft = this.pRects[Symbol.for("top")].right;
              tRight = this.pRects[Symbol.for("lift")].left;
            }
            this.UpdateScrollBar(list(Symbol.for("bar")), tstate);
            this.DrawSpecificRect(rect(tLeft, 0, tRight, this.pRects[Symbol.for("bar")].height), Symbol.for("bar"), Symbol.for("up"));
          }
          this.UpdateScrollBar(list(Symbol.for("lift")), Symbol.for("up"));
        }
      }
    }
  }

  ButtonsStates() {
    if ((this.pScrollOffset > 0) && (this.pButtonStates[Symbol.for("top")] != Symbol.for("up")) && (this.pState != Symbol.for("top"))) {
      this.pButtonStates[Symbol.for("top")] = Symbol.for("up");
      this.UpdateScrollBar(list(Symbol.for("top")), Symbol.for("up"));
    } else {
      if ((this.pScrollOffset <= 0) && (this.pButtonStates[Symbol.for("top")] != Symbol.for("passive"))) {
        this.pButtonStates[Symbol.for("top")] = Symbol.for("passive");
        this.UpdateScrollBar(list(Symbol.for("top")), Symbol.for("passive"));
      }
    }
    if ((this.pScrollOffset < this.pMaxOffset) && (this.pButtonStates[Symbol.for("bottom")] != Symbol.for("up")) && (this.pState != Symbol.for("bottom"))) {
      this.pButtonStates[Symbol.for("bottom")] = Symbol.for("up");
      this.UpdateScrollBar(list(Symbol.for("bottom")), Symbol.for("up"));
    } else {
      if ((this.pScrollOffset >= this.pMaxOffset) && (this.pButtonStates[Symbol.for("bottom")] != Symbol.for("passive"))) {
        this.pButtonStates[Symbol.for("bottom")] = Symbol.for("passive");
        this.UpdateScrollBar(list(Symbol.for("bottom")), Symbol.for("passive"));
      }
    }
    if ((this.pButtonStates[Symbol.for("top")] == Symbol.for("passive")) && (this.pButtonStates[Symbol.for("bottom")] == Symbol.for("passive"))) {
      this.pButtonStates[Symbol.for("lift")] = Symbol.for("passive");
      this.UpdateScrollBar(list(Symbol.for("bar")), Symbol.for("up"));
      this.UpdateScrollBar(list(Symbol.for("lift")), Symbol.for("passive"));
    } else {
      if (this.pState != Symbol.for("lift")) {
        this.pButtonStates[Symbol.for("lift")] = Symbol.for("up");
        this.UpdateLiftPosition();
        this.UpdateScrollBar(list(Symbol.for("bar"), Symbol.for("lift")), Symbol.for("up"));
      }
    }
    this.render();
  }

  buttonOfClickArea(tpoint) {
    tpoint = tpoint - point(this.pSprite.left, this.pSprite.top);
    for (let r = 1; r <= this.pRects.count(); r++) {
      if (tpoint.inside(this.pRects[r])) {
        return this.pRects.getPropAt(r);
      }
      break;
    }
  }

  initEventAgent(tBoolean) {
    const tAgent = getObject(this.pAgentID);
    if (tBoolean) {
      tAgent.registerEvent(this, Symbol.for("mouseUp"), Symbol.for("mouseUp"));
      tAgent.registerEvent(this, Symbol.for("mouseWithin"), Symbol.for("mouseWithin"));
    } else {
      tAgent.unregisterEvent(Symbol.for("mouseUp"));
      tAgent.unregisterEvent(Symbol.for("mouseWithin"));
    }
  }

  resizeBy(tOffH, tOffV) {
    if ((tOffH != 0) || (tOffV != 0)) {
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
      this.pButtonStates = propList("top", Symbol.for("up"), "bottom", Symbol.for("up"), "bar", Symbol.for("up"), "lift", Symbol.for("up"));
      if (this.pType == "scrollbarv") {
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
      this.UpdateImageObjects(VOID, list(Symbol.for("up"), Symbol.for("down"), Symbol.for("passive")));
      this.pimage = image(this.pwidth, this.pheight, 8, this.pPalette);
      this.UpdateScrollBar(list(Symbol.for("top"), Symbol.for("bottom"), Symbol.for("bar"), Symbol.for("lift")), Symbol.for("up"));
      const tTempOffset = this.pBuffer.regPoint;
      this.pBuffer.image = this.pimage;
      this.pBuffer.regPoint = tTempOffset;
    }
  }

  flipH(tImg) {
    const tImage = image(tImg.width, tImg.height, tImg.depth, tImg.paletteRef);
    const tQuad = list(point(tImg.width, 0), point(0, 0), point(0, tImg.height), point(tImg.width, tImg.height));
    tImage.copyPixels(tImg, tQuad, tImg.rect);
    return tImage;
  }

  flipV(tImg) {
    const tImage = image(tImg.width, tImg.height, tImg.depth, tImg.paletteRef);
    const tQuad = list(point(0, tImg.height), point(tImg.width, tImg.height), point(tImg.width, 0), point(0, 0));
    tImage.copyPixels(tImg, tQuad, tImg.rect);
    return tImage;
  }

  rotateImg(tImg, tDirection) {
    const tImage = image(tImg.height, tImg.width, tImg.depth, tImg.paletteRef);
    let tQuad = list(point(0, 0), point(tImg.height, 0), point(tImg.height, tImg.width), point(0, tImg.width));
    tQuad = this.RotateQuad(tQuad, tDirection);
    tImage.copyPixels(tImg, tQuad, tImg.rect);
    return tImage;
  }

  RotateQuad(tDestquad, tClockwise) {
    const tPnt1 = tDestquad[1];
    const tPnt2 = tDestquad[2];
    const tPnt3 = tDestquad[3];
    const tPnt4 = tDestquad[4];
    if (tClockwise) {
      return list(tPnt2, tPnt3, tPnt4, tPnt1);
    } else {
      return list(tPnt4, tPnt1, tPnt2, tPnt3);
    }
  }
}
