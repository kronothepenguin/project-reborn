export default class {
  pTitle;
  pLayout;
  pLocX;
  pLocY;
  pLocZ;
  pwidth;
  pheight;
  pVisible;
  pSpriteList;
  pSpriteData;
  pActSprList;
  pDragFlag;
  pDragOffset;
  pBoundary;
  pWrappedParts;
  pSwapAnimList;

  construct() {
    this.pTitle = this.getID();
    this.pLayout = list();
    this.pLocX = 0;
    this.pLocY = 0;
    this.pLocZ = 0;
    this.pwidth = 0;
    this.pheight = 0;
    this.pVisible = 1;
    this.pSpriteList = list();
    this.pSpriteData = list();
    this.pActSprList = propList();
    this.pDragFlag = 0;
    this.pDragOffset = list(0, 0);
    this.pBoundary = rect(0, 0, the.stage.rect.width, the.stage.rect.height) + list(-1000, -1000, 1000, 1000);
    this.pWrappedParts = propList();
    this.pSwapAnimList = propList();
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    for (let i = 1; i <= this.pSpriteList.count; i++) {
      releaseSprite(this.pSpriteList[i].spriteNum);
    }
    this.pSpriteList = list();
    this.pSpriteData = list();
    this.pActSprList = propList();
    this.pBoundary = list();
    for (const tWrapper of this.pWrappedParts) {
      tWrapper.deconstruct();
    }
    this.pWrappedParts = propList();
    return 1;
  }

  define(tProps) {
    if (voidp(tProps)) {
      return 0;
    }
    if (!voidp(tProps[Symbol.for("locX")])) {
      this.pLocX = tProps[Symbol.for("locX")];
    }
    if (!voidp(tProps[Symbol.for("locY")])) {
      this.pLocY = tProps[Symbol.for("locY")];
    }
    if (!voidp(tProps[Symbol.for("locZ")])) {
      this.pLocZ = tProps[Symbol.for("locZ")];
    }
    if (!voidp(tProps[Symbol.for("layout")])) {
      this.pLayout = tProps[Symbol.for("layout")];
    }
    if (!voidp(tProps[Symbol.for("boundary")])) {
      this.pBoundary = tProps[Symbol.for("boundary")];
    }
    return this.open(this.pLayout);
  }

  open(tLayout) {
    if (voidp(tLayout)) {
      tLayout = this.pLayout;
    }
    this.pLayout = tLayout;
    if (this.pSpriteList.count > 0) {
      for (let i = 1; i <= this.pSpriteList.count; i++) {
        releaseSprite(this.pSpriteList[i].spriteNum);
      }
      this.pSpriteList = list();
    }
    return this.buildVisual(tLayout);
  }

  close() {
    return this.Remove(this.getID());
  }

  moveTo(tX, tY) {
    this.moveBy(tX - this.pLocX, tY - this.pLocY);
  }

  moveBy(tOffX, tOffY) {
    if ((this.pLocX + tOffX) < this.pBoundary[1]) {
      tOffX = this.pBoundary[1] - this.pLocX;
    }
    if ((this.pLocY + tOffY) < this.pBoundary[2]) {
      tOffY = this.pBoundary[2] - this.pLocY;
    }
    if ((this.pLocX + this.pwidth + tOffX) > this.pBoundary[3]) {
      tOffX = this.pBoundary[3] - this.pLocX - this.pwidth;
    }
    if ((this.pLocY + this.pheight + tOffY) > this.pBoundary[4]) {
      tOffY = this.pBoundary[4] - this.pLocY - this.pheight;
    }
    this.pLocX = this.pLocX + tOffX;
    this.pLocY = this.pLocY + tOffY;
    this.moveXY(tOffX, tOffY);
  }

  moveZ(tZ) {
    if (!integerp(tZ)) {
      return error(this, `Integer expected: ${tZ}`, Symbol.for("moveZ"), Symbol.for("minor"));
    }
    for (let i = 1; i <= this.pSpriteList.count; i++) {
      this.pSpriteList[i].locZ = tZ + i - 1;
    }
    for (const tPart of this.pWrappedParts) {
      tPart.setProperty(Symbol.for("visLocZ"), tZ);
    }
    this.pLocZ = tZ;
  }

  getSprite(tID) {
    return this.pActSprList[tID];
  }

  getSprById(tID) {
    return this.pActSprList[tID];
  }

  getSpriteByID(tID) {
    return this.pActSprList[tID];
  }

  spriteExists(tID) {
    return !voidp(this.pActSprList[tID]);
  }

  moveSprBy(tID, tX, tY) {
    const tsprite = this.pActSprList[tID];
    if (voidp(tsprite)) {
      return error(this, `Sprite not found: ${tID}`, Symbol.for("moveSprBy"), Symbol.for("minor"));
    }
    tsprite.loc = tsprite.loc + list(tX, tY);
    return this.Refresh();
  }

  moveSprTo(tID, tX, tY) {
    const tsprite = this.pActSprList[tID];
    if (voidp(tsprite)) {
      return error(this, `Sprite not found: ${tID}`, Symbol.for("moveSprTo"), Symbol.for("minor"));
    }
    tsprite.loc = point(tX, tY);
    return this.Refresh();
  }

  setActive() {
    return 1;
  }

  setDeactive() {
    return 1;
  }

  hide() {
    if (this.pVisible == 1) {
      this.pVisible = 0;
      this.moveX(10000);
      return 1;
    }
    return 0;
  }

  show() {
    if (this.pVisible == 0) {
      this.pVisible = 1;
      this.moveX(-10000);
      return 1;
    }
    return 0;
  }

  drag(tBoolean) {
    if ((tBoolean == 1) && (this.pDragFlag == 0)) {
      this.pDragOffset = the.mouseLoc - list(this.pLocX, this.pLocY);
      receiveUpdate(this.getID());
      this.pDragFlag = 1;
    } else {
      if ((tBoolean == 0) && (this.pDragFlag == 1)) {
        removeUpdate(this.getID());
        this.pDragFlag = 0;
      }
    }
    return 1;
  }

  getProperty(tProp) {
    switch (tProp) {
      case Symbol.for("layout"):
        return this.pLayout;
      case Symbol.for("locX"):
        return this.pLocX;
      case Symbol.for("locY"):
        return this.pLocY;
      case Symbol.for("locZ"):
        return this.pLocZ;
      case Symbol.for("boundary"):
        return this.pBoundary;
      case Symbol.for("width"):
        return this.pwidth;
      case Symbol.for("height"):
        return this.pheight;
      case Symbol.for("sprCount"):
        return this.pSpriteList.count;
      case Symbol.for("spriteList"):
        return this.pSpriteList;
      case Symbol.for("spriteData"):
        return this.pSpriteData;
      case Symbol.for("visible"):
        return this.pVisible;
      case Symbol.for("title"):
        return this.pTitle;
      case Symbol.for("id"):
        return this.getID();
      case Symbol.for("swapAnims"):
        return this.pSwapAnimList;
    }
    return 0;
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case Symbol.for("layout"):
        return this.open(tValue);
      case Symbol.for("locX"):
        return this.moveX(tValue);
      case Symbol.for("locY"):
        return this.moveY(tValue);
      case Symbol.for("locZ"):
        return this.moveZ(tValue);
      case Symbol.for("boundary"):
        this.pBoundary = tValue;
        return 1;
      case Symbol.for("visible"):
        if (tValue) {
          return this.show();
        } else {
          return this.hide();
        }
      case Symbol.for("title"):
        this.pTitle = tValue;
        return 1;
    }
    return 0;
  }

  getWrappedParts(tWrapTypes) {
    if (voidp(tWrapTypes) || (ilk(tWrapTypes) != Symbol.for("list"))) {
      tWrapTypes = list(Symbol.for("all"));
    }
    if (tWrapTypes.getPos(Symbol.for("all")) > 0) {
      return this.pWrappedParts;
    }
    const tWrappedParts = propList();
    for (const tWrap of this.pWrappedParts) {
      if (tWrapTypes.getPos(tWrap.getProperty(Symbol.for("type"))) > 0) {
        tWrappedParts[tWrap.getProperty(Symbol.for("id"))] = tWrap;
      }
    }
    return tWrappedParts;
  }

  activateWrap(tWrapper) {
    const tSpr = tWrapper.getProperty(Symbol.for("sprite"));
    getSpriteManager().setEventBroker(tSpr.spriteNum, this.getID());
  }

  getPartAtLocation(tLocX, tLocY, tWrapperTypes) {
    if (!(ilk(tWrapperTypes) == Symbol.for("list"))) {
      tWrapperTypes = list(tWrapperTypes);
    }
    for (const tWrap of this.pWrappedParts) {
      if (tWrapperTypes.getOne(tWrap.getProperty(Symbol.for("type")))) {
        const tPart = tWrap.getPartAt(tLocX, tLocY);
        if (ilk(tPart) == Symbol.for("propList")) {
          return tPart;
        }
      }
    }
    return 0;
  }

  createWrapper(tWrapID) {
    if (!voidp(getaProp(this.pWrappedParts, tWrapID))) {
      return error(this, `Duplicate wrap id: ${tWrapID}`, Symbol.for("createWrapper"));
    }
    const tWrap = createObject(Symbol.for("random"), getClassVariable("visualizer.wrapper.class"));
    tWrap.setProperty(Symbol.for("owner"), this.getID());
    this.pWrappedParts[tWrapID] = tWrap;
    const tSpr = sprite(getSpriteManager().reserveSprite(this.getID()));
    tWrap.setProperty(Symbol.for("sprite"), tSpr);
    this.pSpriteList.append(tSpr);
    this.pSpriteData.append(propList());
    return tWrap;
  }

  getWallPartUnderRect(tRect, tSlope) {
    for (const tWrap of this.pWrappedParts) {
      const tWrapType = tWrap.getProperty(Symbol.for("type"));
      if ((tWrapType == Symbol.for("wallleft")) || (tWrapType == Symbol.for("wallright"))) {
        const tPart = tWrap.fitRectToWall(tRect, tSlope);
        if (tPart[Symbol.for("insideWall")] == 1) {
          return tPart;
        }
      }
    }
    return propList("insideWall", 0);
  }

  renderWrappedParts(tColor) {
    if (ilk(tColor) != Symbol.for("color")) {
      return 0;
    }
    if ((tColor.red + tColor.green + tColor.blue) > (250 * 3)) {
      tColor = color(248, 248, 248);
    }
    for (const tWrapper of this.pWrappedParts) {
      tWrapper.renderWithColor(tColor);
    }
  }

  setDimmerColor(tColor) {
    if (ilk(tColor) != Symbol.for("color")) {
      return 0;
    }
    tColor = rgb(255 - tColor.red, 255 - tColor.green, 255 - tColor.blue);
    if (memberExists("room_dimmer_image")) {
      const tMem = getMember("room_dimmer_image");
      tMem.image.setPixel(0, 0, tColor);
    }
  }

  moveX(tOffX) {
    for (let i = 1; i <= this.pSpriteList.count; i++) {
      this.pSpriteList[i].locH = this.pSpriteList[i].locH + tOffX;
    }
  }

  moveY(tOffY) {
    for (let i = 1; i <= this.pSpriteList.count; i++) {
      this.pSpriteList[i].locV = this.pSpriteList[i].locV + tOffY;
    }
  }

  moveXY(tOffX, tOffY) {
    for (let i = 1; i <= this.pSpriteList.count; i++) {
      this.pSpriteList[i].loc = this.pSpriteList[i].loc + list(tOffX, tOffY);
    }
  }

  update() {
    this.moveTo(the.mouseH - this.pDragOffset[1], the.mouseV - this.pDragOffset[2]);
  }

  Refresh() {
    const tRect = rect(100000, 100000, -100000, -100000);
    for (const tWrapper of this.pWrappedParts) {
      tWrapper.updateWrap();
    }
    for (const tSpr of this.pSpriteList) {
      if (tSpr.locH < tRect[1]) {
        tRect[1] = tSpr.locH;
      }
      if (tSpr.locV < tRect[2]) {
        tRect[2] = tSpr.locV;
      }
      if ((tSpr.locH + tSpr.width) > tRect[3]) {
        tRect[3] = tSpr.locH + tSpr.width;
      }
      if ((tSpr.locV + tSpr.height) > tRect[4]) {
        tRect[4] = tSpr.locV + tSpr.height;
      }
    }
    this.pLocX = tRect[1];
    this.pLocY = tRect[2];
    this.pwidth = tRect.width;
    this.pheight = tRect.height;
    if (this.pSpriteData.count > 0) {
      for (let i = 1; i <= this.pSpriteList.count; i++) {
        if (listp(this.pSpriteData[i])) {
          this.pSpriteData[i][Symbol.for("loc")] = this.pSpriteList[i].loc - list(tRect[1], tRect[2]);
        }
      }
    }
    return 1;
  }

  buildVisual(tLayout) {
    let tLayoutName = tLayout;
    let tPrivate = 0;
    if (tLayoutName.length >= 7) {
      putInto(tLayoutName.char[7], "x");
      if (tLayoutName == "model_x.room") {
        tPrivate = 1;
      }
    }
    tLayout = getObjectManager().GET(Symbol.for("layout_parser")).parse(tLayout);
    if (!listp(tLayout)) {
      return error(this, `Invalid visualizer definition: ${tLayout}`, Symbol.for("buildVisual"), Symbol.for("major"));
    }
    if (!voidp(tLayout[Symbol.for("rect")])) {
      if (tLayout[Symbol.for("rect")].count > 0) {
        this.pLocX = this.pLocX + tLayout[Symbol.for("rect")][1][1];
        this.pLocY = this.pLocY + tLayout[Symbol.for("rect")][1][2];
      }
    }
    tLayout = tLayout[Symbol.for("elements")];
    const tSpriteList = list();
    const tSpriteCollections = propList();
    for (let i = 1; i <= tLayout.count; i++) {
      const tMemNum = getResourceManager().getmemnum(tLayout[i][Symbol.for("member")]);
      if (tMemNum < 1) {
        error(this, `Member ${tLayout[i][Symbol.for("member")]} required by visualizer: ${this.getID()} not found!`, Symbol.for("buildVisual"), Symbol.for("major"));
        continue;
      }
      const tElem = tLayout[i];
      let tSpr;
      if (!voidp(tElem[Symbol.for("wrapperID")])) {
        const tWrapID = tElem[Symbol.for("wrapperID")];
        let tPartWrapper;
        if (voidp(this.pWrappedParts[tWrapID])) {
          tPartWrapper = this.createWrapper(tWrapID);
          const tProps = propList();
          tProps[Symbol.for("id")] = tWrapID;
          tProps[Symbol.for("palette")] = tElem[Symbol.for("palette")];
          tProps[Symbol.for("offsetx")] = this.pLocX;
          tProps[Symbol.for("offsety")] = this.pLocY;
          tProps[Symbol.for("locZ")] = this.pLocZ;
          tProps[Symbol.for("typeDef")] = tElem[Symbol.for("typeDef")];
          tPartWrapper.define(tProps);
        } else {
          tPartWrapper = this.pWrappedParts[tWrapID];
        }
        tPartWrapper.addPart(tElem);
      } else {
        tSpr = sprite(getSpriteManager().reserveSprite(this.getID()));
        if (tSpr.spriteNum < 1) {
          for (const t_rSpr of tSpriteList) {
            releaseSprite(t_rSpr.spriteNum, this.getID());
          }
          tSpriteList = propList();
          return error(this, "Failed to build visual. System out of sprites!", Symbol.for("buildVisual"), Symbol.for("major"));
        }
        tSpr.castNum = tMemNum;
        tSpr.ink = tElem[Symbol.for("ink")];
        tSpr.locH = tElem[Symbol.for("locH")] + this.pLocX;
        tSpr.locV = tElem[Symbol.for("locV")] + this.pLocY;
        tSpr.width = tElem[Symbol.for("width")];
        tSpr.height = tElem[Symbol.for("height")];
        tSpr.blend = tElem[Symbol.for("blend")];
        tSpr.rotation = tElem[Symbol.for("rotation")];
        tSpr.skew = tElem[Symbol.for("skew")];
        tSpr.flipH = tElem[Symbol.for("flipH")];
        tSpr.flipV = tElem[Symbol.for("flipV")];
        tSpr.color = rgb(tElem[Symbol.for("color")]);
        tSpr.bgColor = rgb(tElem[Symbol.for("bgColor")]);
        if ((tElem[Symbol.for("media")] == Symbol.for("text")) || (tElem[Symbol.for("media")] == Symbol.for("field"))) {
          const tTxtMem = member(tMemNum);
          if (!voidp(tElem[Symbol.for("txtColor")])) {
            tTxtMem.color = rgb(tElem[Symbol.for("txtColor")]);
          }
          if (!voidp(tElem[Symbol.for("txtBgColor")])) {
            tTxtMem.bgColor = rgb(tElem[Symbol.for("txtBgColor")]);
          }
          if (tTxtMem.font != tElem[Symbol.for("font")]) {
            tTxtMem.font = tElem[Symbol.for("font")];
          }
          if (tTxtMem.fontSize != tElem[Symbol.for("fontSize")]) {
            tTxtMem.fontSize = tElem[Symbol.for("fontSize")];
          }
          if (tTxtMem.fontStyle != tElem[Symbol.for("fontStyle")]) {
            tTxtMem.fontStyle = tElem[Symbol.for("fontStyle")];
          }
          if (tElem[Symbol.for("media")] == Symbol.for("text")) {
            if (tTxtMem.fixedLineSpace != tElem[Symbol.for("fixedLineSpace")]) {
              tTxtMem.fixedLineSpace = tElem[Symbol.for("fixedLineSpace")];
            }
          } else {
            if (tElem[Symbol.for("media")] == Symbol.for("field")) {
              if (tTxtMem.lineHeight != tElem[Symbol.for("lineHeight")]) {
                tTxtMem.lineHeight = tElem[Symbol.for("lineHeight")];
              }
            }
          }
        }
        if (voidp(tElem[Symbol.for("locZ")])) {
          tSpr.locZ = this.pLocZ + i - 1;
        } else {
          tSpr.locZ = integer(tElem[Symbol.for("locZ")]) + this.pLocZ;
        }
        if (!voidp(tElem[Symbol.for("id")])) {
          if ((tElem[Symbol.for("Active")] == 1) || (voidp(tElem[Symbol.for("Active")]) && voidp(tElem[Symbol.for("type")]))) {
            getSpriteManager().setEventBroker(tSpr.spriteNum, tElem[Symbol.for("id")]);
            if (!voidp(tElem[Symbol.for("cursor")])) {
              tSpr.setcursor(tElem[Symbol.for("cursor")]);
            }
            if (!voidp(tElem[Symbol.for("link")])) {
              tSpr.setLink(tElem[Symbol.for("link")]);
            }
          }
          this.pActSprList[tLayout[i][Symbol.for("id")]] = tSpr;
        }
        this.pSpriteData.append(propList());
        tSpriteList.append(tSpr);
      }
      if (!voidp(tElem[Symbol.for("swapAnimType")])) {
        const tAnimProps = propList();
        tAnimProps[Symbol.for("sprite")] = tSpr;
        tAnimProps[Symbol.for("animType")] = tElem[Symbol.for("swapAnimType")];
        tAnimProps[Symbol.for("initDelayType")] = tElem[Symbol.for("swapInitDelayType")];
        tAnimProps[Symbol.for("initDelay")] = tElem[Symbol.for("swapInitDelayValue")];
        tAnimProps[Symbol.for("animDelayType")] = tElem[Symbol.for("swapAnimDelayType")];
        tAnimProps[Symbol.for("animDelay")] = tElem[Symbol.for("swapAnimDelayValue")];
        tAnimProps[Symbol.for("frameList")] = tElem[Symbol.for("swapAnimFrameList")];
        tAnimProps[Symbol.for("animLoopCount")] = tElem[Symbol.for("swapAnimLoopCount")];
        if (!voidp(tElem[Symbol.for("id")])) {
          this.pSwapAnimList[tElem[Symbol.for("id")]] = tAnimProps;
          continue;
        }
        error(this, "Animation had no ID", Symbol.for("buildVisual"), Symbol.for("minor"));
      }
    }
    if (tPrivate) {
      const tThread = getThread(Symbol.for("room"));
      if (tThread != 0) {
        const tSpr = sprite(getSpriteManager().reserveSprite(this.getID()));
        const tmember = getMember("room_dimmer_image");
        if (tmember != 0) {
          tSpr.member = tmember.number;
          tSpr.ink = 35;
          tSpr.locH = 0;
          tSpr.locV = 0;
          tSpr.width = 800;
          tSpr.height = 600;
          tSpr.blend = 100;
          const tGeometry = tThread.getInterface().getGeometry();
          const tScreenLoc = tGeometry.getScreenCoordinate(2, 2, 0);
          tSpr.locZ = tSpriteList[tSpriteList.count].locZ + (100 * 1000);
          tSpriteList.append(tSpr);
          this.pSpriteData.append(propList());
        }
      }
    }
    for (const tSpr of tSpriteList) {
      this.pSpriteList.append(tSpr);
    }
    for (const tWrapper of this.pWrappedParts) {
      if (tWrapper.getProperty(Symbol.for("Active"))) {
        this.activateWrap(tWrapper);
      }
    }
    return this.Refresh();
  }
}
