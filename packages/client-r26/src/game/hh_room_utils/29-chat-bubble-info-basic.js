export default class {
  pBgSprite;
  pLocation;
  pTextParams;
  pBalloonImg;
  pBgMemName;
  pItemId;
  pMargins;
  pUserName;
  pUserId;
  pSourceLocation;
  pBalloonLeftMarg;
  pBalloonRightMarg;

  construct() {
    this.pItemId = VOID;
    this.pBgSprite = sprite(reserveSprite(this.getID()));
    this.pUserName = EMPTY;
    this.pUserId = EMPTY;
    this.pSourceLocation = VOID;
    this.pMargins = propList();
    this.pMargins[Symbol.for("left")] = 5;
    this.pMargins[Symbol.for("right")] = 6;
    this.pMargins[Symbol.for("textleft")] = 30;
    this.pBgMemName = EMPTY;
    let tVariations = propList("CUSTOM", "bold");
    this.pTextParams = propList();
    for (let i = 1; i <= tVariations.count; i++) {
      let tFontStruct = getStructVariable(`struct.font.${tVariations[i]}`);
      let tMemName = `balloon.text.${tVariations.getPropAt(i)}`;
      let tmember;
      if (!memberExists(tMemName)) {
        tmember = member(createMember(tMemName, Symbol.for("text")));
      } else {
        tmember = member(getmemnum(tMemName));
      }
      tmember.wordWrap = 0;
      tmember.boxType = Symbol.for("adjust");
      tmember.antialias = 0;
      tmember.font = tFontStruct.getaProp(Symbol.for("font"));
      tmember.fontSize = tFontStruct.getaProp(Symbol.for("fontSize"));
      tmember.fontStyle = tFontStruct.getaProp(Symbol.for("fontStyle"));
      this.pTextParams[tVariations.getPropAt(i)] = propList("member", tmember, "font", tFontStruct.getaProp(Symbol.for("font")), "fontStyle", tFontStruct.getaProp(Symbol.for("fontStyle")));
    }
    this.pBalloonImg = propList();
    this.pBalloonImg.addProp(Symbol.for("left"), member(getmemnum("chat_bubble_left")).image.duplicate());
    this.pBalloonImg.addProp(Symbol.for("middle"), member(getmemnum("chat_bubble_middle")).image.duplicate());
    this.pBalloonImg.addProp(Symbol.for("right"), member(getmemnum("chat_bubble_right")).image.duplicate());
    if (variableExists("balloons.leftmargin")) {
      this.pBalloonLeftMarg = getIntVariable("balloons.leftmargin", 0);
    } else {
      this.pBalloonLeftMarg = 0;
    }
    if (variableExists("balloons.rightmargin")) {
      this.pBalloonRightMarg = getIntVariable("balloons.rightmargin", 0);
    } else {
      this.pBalloonRightMarg = the.stageRight - the.stageLeft;
    }
  }

  deconstruct() {
    if (ilk(this.pBgSprite) == Symbol.for("sprite")) {
      releaseSprite(this.pBgSprite.spriteNum);
      this.pBgSprite = VOID;
    }
    if (memberExists(this.pBgMemName)) {
      removeMember(this.pBgMemName);
    }
  }

  defineBalloon(tMode, tColor, tMessage, tItemID, tSourceLoc) {
    let tNewBgMemName = `chat_item_background_${tItemID}`;
    this.pBgMemName = tNewBgMemName;
    if (!memberExists(this.pBgMemName)) {
      createMember(this.pBgMemName, Symbol.for("bitmap"));
    }
    this.pItemId = tItemID;
    let tTextImg = this.renderText(tMessage, tMode);
    let tTextWidth = tTextImg.width;
    if (tColor == VOID) {
      tColor = rgb(255, 255, 255);
    }
    let tBalloonWidth = this.pMargins[Symbol.for("left")] + tTextWidth + this.pMargins[Symbol.for("right")];
    let tBackgroundImg = this.renderBackground(tBalloonWidth, tColor);
    let tTextOffH = this.pMargins[Symbol.for("left")];
    let tTextOffV = ((this.pBalloonImg[Symbol.for("middle")].height - tTextImg.height) / 2) + 1;
    let tTextDestRect = rect(tTextOffH, tTextOffV, tTextOffH + tTextWidth, tTextOffV + tTextImg.height);
    tBackgroundImg.copyPixels(tTextImg, tTextDestRect, tTextImg.rect);
    let tBgMem = getMember(this.pBgMemName);
    tBgMem.image = tBackgroundImg;
    tBgMem.regPoint = point(0, 0);
    this.pBgSprite.member = tBgMem;
    this.pBgSprite.ink = 8;
    return 1;
  }

  showBalloon(tVisible) {
    if (voidp(tVisible)) {
      tVisible = 1;
    }
    if (ilk(this.pBgSprite) == Symbol.for("sprite")) {
      this.pBgSprite.visible = tVisible;
    }
  }

  moveVerticallyBy(tMoveAmount) {
    let tNewLocation = this.pLocation + point(0, tMoveAmount);
    this.setLocation(tNewLocation);
    return tNewLocation[2];
  }

  setLocation(tloc) {
    if ((ilk(tloc) != Symbol.for("point")) && (ilk(tloc) != Symbol.for("list"))) {
      return 0;
    }
    let tMem = getMember(this.pBgMemName);
    let tMemWidth = 0;
    if (tMem.type == Symbol.for("bitmap")) {
      tMemWidth = tMem.image.width;
    } else {
      return 0;
    }
    let tRelativeLocH = tloc[1] - (tMemWidth / 2);
    tRelativeLocH = max(tRelativeLocH, this.pBalloonLeftMarg);
    tRelativeLocH = min(tRelativeLocH, this.pBalloonRightMarg - this.pBgSprite.member.image.width);
    this.pLocation = tloc;
    this.pBgSprite.loc = point(tRelativeLocH, this.pLocation[2]);
    this.pBgSprite.locZ = getIntVariable("window.default.locz") - 2000 + (this.pLocation[2] / 10);
    return point(tRelativeLocH, this.pLocation[2]);
  }

  getLowPoint() {
    return this.pLocation[2];
  }

  getItemId() {
    return this.pItemId;
  }

  getType() {
    return "CUSTOM";
  }

  renderBackground(tWidth, tBalloonColor) {
    if ((tBalloonColor.red + tBalloonColor.green + tBalloonColor.blue) >= 600) {
      let tBalloonColorDarken = rgb(0, 0, 0);
      tBalloonColorDarken.red = tBalloonColor.red * 0.90000000000000002;
      tBalloonColorDarken.green = tBalloonColor.green * 0.90000000000000002;
      tBalloonColorDarken.blue = tBalloonColor.blue * 0.90000000000000002;
      tBalloonColor = tBalloonColorDarken;
    }
    if ((tBalloonColor.red + tBalloonColor.green + tBalloonColor.blue) <= 100) {
      let tBalloonColorDarken = rgb(0, 0, 0);
      tBalloonColorDarken.red = tBalloonColor.red * 3;
      tBalloonColorDarken.green = tBalloonColor.green * 3;
      tBalloonColorDarken.blue = tBalloonColor.blue * 3;
      tBalloonColor = tBalloonColorDarken;
    }
    let tNewImg = image(tWidth, this.pBalloonImg[Symbol.for("left")].height + this.pBalloonImg[Symbol.for("left")].height, 32);
    let tStartPointY = 0;
    let tEndPointY = this.pBalloonImg[Symbol.for("left")].height;
    let tStartPointX = 0;
    let tEndPointX = 0;
    for (const i of list(Symbol.for("left"), Symbol.for("middle"), Symbol.for("right"))) {
      tStartPointX = tEndPointX;
      switch (i) {
        case Symbol.for("left"):
          tEndPointX = tEndPointX + this.pBalloonImg.getProp(i).width;
          let tdestrect = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
          tNewImg.copyPixels(this.pBalloonImg.getProp(i), tdestrect, this.pBalloonImg.getProp(i).rect);
          break;
        case Symbol.for("middle"):
          tEndPointX = tEndPointX + tWidth - this.pBalloonImg.getProp(Symbol.for("left")).width - this.pBalloonImg.getProp(Symbol.for("right")).width;
          let tdestrect2 = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
          tNewImg.copyPixels(this.pBalloonImg.getProp(i), tdestrect2, this.pBalloonImg.getProp(i).rect);
          break;
        case Symbol.for("right"):
          tEndPointX = tEndPointX + this.pBalloonImg.getProp(i).width;
          let tdestrect3 = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
          tNewImg.copyPixels(this.pBalloonImg.getProp(i), tdestrect3, this.pBalloonImg.getProp(i).rect);
          break;
      }
    }
    return tNewImg;
  }

  renderText(tChatMessage, tChatMode) {
    let tTextParams = this.pTextParams[tChatMode];
    let tmember = tTextParams[Symbol.for("member")];
    let tText = tChatMessage;
    tmember.text = tText;
    tmember.font = tTextParams[Symbol.for("font")];
    tmember.fontStyle = tTextParams[Symbol.for("fontStyle")];
    let tTextWidth = tmember.charPosToLoc(tmember.char.count).locH;
    tmember.rect = rect(0, 0, tTextWidth, tmember.height);
    let tTextImg = tmember.image.duplicate();
    return tTextImg;
  }
}
