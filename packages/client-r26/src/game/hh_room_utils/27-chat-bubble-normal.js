export default class {
  pBgSprite;
  pUserSprite;
  pLocation;
  pTextParams;
  pBalloonImg;
  pBgMemName;
  pUserMemName;
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
    this.pUserSprite = sprite(reserveSprite(this.getID()));
    this.pUserName = EMPTY;
    this.pUserId = EMPTY;
    this.pSourceLocation = VOID;
    this.pMargins = propList();
    this.pMargins[Symbol.for("left")] = 5;
    this.pMargins[Symbol.for("right")] = 6;
    this.pMargins[Symbol.for("textleft")] = 30;
    this.pBgMemName = EMPTY;
    this.pUserMemName = EMPTY;
    let tVariations = propList("CHAT", "plain", "SHOUT", "bold", "WHISPER", "grey", "OBJECT", "plain");
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
      tmember.color = tFontStruct.getaProp(Symbol.for("color"));
      this.pTextParams[tVariations.getPropAt(i)] = propList("member", tmember, "font", tFontStruct.getaProp(Symbol.for("font")), "fontStyle", tFontStruct.getaProp(Symbol.for("fontStyle")));
    }
    this.pBalloonImg = propList();
    this.pBalloonImg.addProp(Symbol.for("left"), member(getmemnum("chat_bubble_left")).image.duplicate());
    this.pBalloonImg.addProp(Symbol.for("leftcolor"), member(getmemnum("chat_bubble_left_color")).image.duplicate());
    this.pBalloonImg.addProp(Symbol.for("middle"), member(getmemnum("chat_bubble_middle")).image.duplicate());
    this.pBalloonImg.addProp(Symbol.for("right"), member(getmemnum("chat_bubble_right")).image.duplicate());
    this.pBalloonImg.addProp(Symbol.for("pointer"), member(getmemnum("chat_bubble_pointer")).image.duplicate());
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
    if (ilk(this.pUserSprite) == Symbol.for("sprite")) {
      removeEventBroker(this.pUserSprite.spriteNum);
    }
    if (ilk(this.pBgSprite) == Symbol.for("sprite")) {
      releaseSprite(this.pBgSprite.spriteNum);
      this.pBgSprite = VOID;
    }
    if (ilk(this.pUserSprite) == Symbol.for("sprite")) {
      releaseSprite(this.pUserSprite.spriteNum);
      this.pUserSprite = VOID;
    }
    if (memberExists(this.pBgMemName)) {
      removeMember(this.pBgMemName);
    }
    if (memberExists(this.pUserMemName)) {
      removeMember(this.pUserMemName);
    }
  }

  defineBalloon(tMode, tColor, tUserName, tMessage, tItemID, tUserImg, tUserID, tSourceLoc) {
    let tNewBgMemName = `chat_item_background_${tItemID}`;
    let tNewUserMemName = `chat_item_user_${tUserName}`;
    this.pBgMemName = tNewBgMemName;
    if (!memberExists(this.pBgMemName)) {
      createMember(this.pBgMemName, Symbol.for("bitmap"));
    }
    this.pUserMemName = tNewUserMemName;
    if (!memberExists(this.pUserMemName)) {
      createMember(this.pUserMemName, Symbol.for("bitmap"));
    }
    this.pItemId = tItemID;
    let tTextImg = this.renderText(tUserName, tMessage, tMode);
    let tTextWidth = tTextImg.width;
    let tUserImgWidth = 0;
    if (ilk(tUserImg) == Symbol.for("image")) {
      tUserImgWidth = tUserImg.width;
    }
    if (ilk(tUserImg) == Symbol.for("image")) {
      this.pUserName = tUserName;
      this.pUserId = tUserID;
    } else {
      this.pUserName = EMPTY;
      this.pUserId = EMPTY;
    }
    let tBalloonWidth = this.pMargins[Symbol.for("textleft")] + tTextWidth + this.pMargins[Symbol.for("right")];
    let tBackgroundImg = this.renderBackground(tBalloonWidth, tColor);
    let tTextOffH = this.pMargins[Symbol.for("left")] + tUserImgWidth + this.pMargins[Symbol.for("separator")];
    tTextOffH = this.pMargins[Symbol.for("textleft")];
    let tTextOffV = ((this.pBalloonImg[Symbol.for("middle")].height - tTextImg.height) / 2) + 1;
    let tTextDestRect = rect(tTextOffH, tTextOffV, tTextOffH + tTextWidth, tTextOffV + tTextImg.height);
    tBackgroundImg.copyPixels(tTextImg, tTextDestRect, tTextImg.rect);
    let tBgMem = getMember(this.pBgMemName);
    tBgMem.image = tBackgroundImg;
    tBgMem.regPoint = point(0, 0);
    let tUserMem = getMember(this.pUserMemName);
    if (ilk(tUserImg) == Symbol.for("image")) {
      tUserMem.image = tUserImg;
    } else {
      tUserMem.image = image(1, 1, 8);
    }
    tUserMem.regPoint = point(0, 0);
    this.pBgSprite.member = tBgMem;
    this.pUserSprite.member = tUserMem;
    this.pBgSprite.ink = 8;
    this.pUserSprite.ink = 8;
    if (!voidp(tSourceLoc)) {
      let tloc = this.setLocation(tSourceLoc);
      this.addPointer(tSourceLoc[1] - tloc[1]);
    }
    setEventBroker(this.pUserSprite.spriteNum, this.getID());
    this.pUserSprite.registerProcedure(Symbol.for("eventProcUserSelect"), this.getID(), Symbol.for("mouseDown"));
    this.pUserSprite.setcursor("cursor.finger");
    setEventBroker(this.pBgSprite.spriteNum, this.getID());
    this.pBgSprite.registerProcedure(Symbol.for("eventProcUserSelect"), this.getID(), Symbol.for("mouseDown"));
    return 1;
  }

  eventProcUserSelect(tEvent, tSprID) {
    if (this.pUserId != EMPTY) {
      let tRoomInterface = getThread(Symbol.for("room")).getInterface();
      tRoomInterface.eventProcUserObj(tEvent, this.pUserId);
    }
  }

  showBalloon(tVisible) {
    if (voidp(tVisible)) {
      tVisible = 1;
    }
    if (ilk(this.pBgSprite) == Symbol.for("sprite")) {
      this.pBgSprite.visible = tVisible;
    }
    if (ilk(this.pUserSprite) == Symbol.for("sprite")) {
      this.pUserSprite.visible = tVisible;
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
    let tUserSprOffV = (this.pUserSprite.member.image.height - this.pBalloonImg[Symbol.for("middle")].height) / 2;
    let tUserOffH = ((this.pBalloonImg[Symbol.for("left")].width - this.pUserSprite.member.image.width) / 2) + 1;
    this.pUserSprite.loc = point(tUserOffH + tRelativeLocH, this.pLocation[2] + (-1 * tUserSprOffV));
    this.pBgSprite.locZ = getIntVariable("window.default.locz") - 2000 + (this.pLocation[2] / 10);
    this.pUserSprite.locZ = this.pBgSprite.locZ + 100;
    return point(tRelativeLocH, this.pLocation[2]);
  }

  addPointer(tPointerOffH) {
    let tBalloonWidth = this.pBgSprite.member.image.width;
    if (tPointerOffH < this.pBalloonImg[Symbol.for("left")].width) {
      tPointerOffH = this.pBalloonImg[Symbol.for("left")].width;
    } else {
      if (tPointerOffH > (tBalloonWidth - this.pBalloonImg[Symbol.for("right")].width)) {
        tPointerOffH = tBalloonWidth - this.pBalloonImg[Symbol.for("right")].width;
      }
    }
    let tStartX = tPointerOffH;
    let tEndX = tStartX + this.pBalloonImg[Symbol.for("pointer")].width;
    let tStartY = this.pBalloonImg[Symbol.for("middle")].height - 1;
    let tEndY = tStartY + this.pBalloonImg[Symbol.for("pointer")].height;
    let tdestrect = rect(tStartX, tStartY, tEndX, tEndY);
    let tBgImg = getMember(this.pBgMemName).image;
    tBgImg.copyPixels(this.pBalloonImg[Symbol.for("pointer")], tdestrect, this.pBalloonImg[Symbol.for("pointer")].rect);
  }

  getLowPoint() {
    return this.pLocation[2];
  }

  getItemId() {
    return this.pItemId;
  }

  getType() {
    return "NORMAL";
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
    let tNewImg = image(tWidth, this.pBalloonImg[Symbol.for("left")].height + this.pBalloonImg[Symbol.for("pointer")].height, 32);
    let tStartPointY = 0;
    let tEndPointY = this.pBalloonImg[Symbol.for("left")].height;
    let tStartPointX = 0;
    let tEndPointX = 0;
    for (const i of list(Symbol.for("left"), Symbol.for("leftcolor"), Symbol.for("middle"), Symbol.for("right"))) {
      tStartPointX = tEndPointX;
      switch (i) {
        case Symbol.for("left"):
          tEndPointX = tEndPointX + this.pBalloonImg.getProp(i).width;
          let tdestrect = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
          tNewImg.copyPixels(this.pBalloonImg.getProp(i), tdestrect, this.pBalloonImg.getProp(i).rect);
          tEndPointX = 1;
          break;
        case Symbol.for("leftcolor"):
          tEndPointX = tEndPointX + this.pBalloonImg.getProp(i).width;
          let tdestrect2 = rect(tStartPointX, tStartPointY, tEndPointX, tStartPointY + this.pBalloonImg.getProp(i).height) + rect(0, 1, 0, 1);
          let tMatte = this.pBalloonImg.getProp(i).createMatte();
          tNewImg.copyPixels(this.pBalloonImg.getProp(i), tdestrect2, this.pBalloonImg.getProp(i).rect, propList("bgColor", tBalloonColor, "ink", 41, "maskImage", tMatte));
          break;
        case Symbol.for("middle"):
          tEndPointX = tEndPointX + tWidth - this.pBalloonImg.getProp(Symbol.for("left")).width - this.pBalloonImg.getProp(Symbol.for("right")).width;
          let tdestrect3 = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
          tNewImg.copyPixels(this.pBalloonImg.getProp(i), tdestrect3, this.pBalloonImg.getProp(i).rect);
          break;
        case Symbol.for("right"):
          tEndPointX = tEndPointX + this.pBalloonImg.getProp(i).width;
          let tdestrect4 = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
          tNewImg.copyPixels(this.pBalloonImg.getProp(i), tdestrect4, this.pBalloonImg.getProp(i).rect);
          break;
      }
    }
    return tNewImg;
  }

  renderText(tUserName, tChatMessage, tChatMode) {
    let tTextParams = this.pTextParams[tChatMode];
    let tmember = tTextParams[Symbol.for("member")];
    let tBoldStruct = getStructVariable("struct.font.bold");
    let tText = `${tUserName}: ${tChatMessage}`;
    tmember.text = tText;
    tmember.font = tTextParams[Symbol.for("font")];
    tmember.fontStyle = tTextParams[Symbol.for("fontStyle")];
    tmember.char[`1..${tUserName.length + 1}`].font = tBoldStruct.getaProp(Symbol.for("font"));
    tmember.char[`1..${tUserName.length + 1}`].fontStyle = tBoldStruct.getaProp(Symbol.for("fontStyle"));
    let tTextWidth = tmember.charPosToLoc(tmember.char.count).locH + tBoldStruct.getaProp(Symbol.for("fontSize"));
    tmember.rect = rect(0, 0, tTextWidth, tmember.height);
    let tTextImg = tmember.image.duplicate();
    return tTextImg;
  }

  flipH(tImg) {
    let tImage = image(tImg.width, tImg.height, tImg.depth);
    let tQuad = list(point(tImg.width, 0), point(0, 0), point(0, tImg.height), point(tImg.width, tImg.height));
    tImage.copyPixels(tImg, tQuad, tImg.rect);
    return tImage;
  }

  flipV(tImg) {
    let tImage = image(tImg.width, tImg.height, tImg.depth);
    let tQuad = list(point(0, tImg.height), point(tImg.width, tImg.height), point(tImg.width, 0), point(0, 0));
    tImage.copyPixels(tImg, tQuad, tImg.rect);
    return tImage;
  }
}
