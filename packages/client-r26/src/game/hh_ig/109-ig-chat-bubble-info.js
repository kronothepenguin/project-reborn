export default class {
  defineBalloon(tMode, tColor, tMessage, tItemID, tSourceLoc) {
    this.pBalloonImg = propList();
    this.pBalloonImg.addProp(Symbol.for("left"), member(getmemnum("ig_chat_bubble_left")).image.duplicate());
    this.pBalloonImg.addProp(Symbol.for("middle"), member(getmemnum("ig_chat_bubble_mid")).image.duplicate());
    this.pBalloonImg.addProp(Symbol.for("right"), member(getmemnum("ig_chat_bubble_right")).image.duplicate());
    const tNewBgMemName = `chat_item_background_${tItemID}`;
    this.pBgMemName = tNewBgMemName;
    if (!memberExists(this.pBgMemName)) {
      createMember(this.pBgMemName, Symbol.for("bitmap"));
    }
    this.pItemId = tItemID;
    const tTextImg = this.renderWithWriter(tMessage, tColor);
    if (tTextImg == 0) {
      return error(this, "Could not render text", Symbol.for("defineBalloon"));
    }
    const tTextWidth = tTextImg.width;
    this.pMargins[Symbol.for("left")] = 8;
    this.pMargins[Symbol.for("right")] = 8;
    const tBalloonWidth = this.pMargins[Symbol.for("left")] + tTextWidth + this.pMargins[Symbol.for("right")];
    const tBackgroundImg = this.renderBackground(tBalloonWidth, tColor);
    const tTextOffH = this.pMargins[Symbol.for("left")] + 2;
    const tTextOffV = ((this.pBalloonImg[Symbol.for("middle")].height - tTextImg.height) / 2) + 1;
    const tTextDestRect = rect(tTextOffH, tTextOffV, tTextOffH + tTextWidth, tTextOffV + tTextImg.height);
    tBackgroundImg.copyPixels(tTextImg, tTextDestRect, tTextImg.rect);
    const tBgMem = getMember(this.pBgMemName);
    tBgMem.image = tBackgroundImg;
    tBgMem.regPoint = point(0, 0);
    this.pBgSprite.member = tBgMem;
    this.pBgSprite.ink = 8;
    return 1;
  }

  renderBackground(tWidth, tBalloonColor) {
    const tNewImg = image(this.pBalloonImg.getProp(Symbol.for("left")).width + tWidth + this.pBalloonImg.getProp(Symbol.for("left")).width, this.pBalloonImg[Symbol.for("left")].height, 32);
    let tStartPointY = 0;
    const tEndPointY = this.pBalloonImg[Symbol.for("left")].height;
    let tStartPointX = 0;
    let tEndPointX = 0;
    for (const i of list(Symbol.for("left"), Symbol.for("middle"), Symbol.for("right"))) {
      tStartPointX = tEndPointX;
      let tdestrect;
      switch (i) {
        case Symbol.for("left"):
          tEndPointX = tEndPointX + this.pBalloonImg.getProp(i).width;
          tdestrect = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
          tNewImg.copyPixels(this.pBalloonImg.getProp(i), tdestrect, this.pBalloonImg.getProp(i).rect, propList("bgColor", tBalloonColor, "maskImage", this.pBalloonImg.getProp(i).createMatte()));
          break;
        case Symbol.for("middle"):
          tEndPointX = tEndPointX + tWidth - this.pBalloonImg.getProp(Symbol.for("left")).width - this.pBalloonImg.getProp(Symbol.for("right")).width;
          tdestrect = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
          tNewImg.copyPixels(this.pBalloonImg.getProp(i), tdestrect, this.pBalloonImg.getProp(i).rect, propList("bgColor", tBalloonColor, "maskImage", this.pBalloonImg.getProp(i).createMatte()));
          break;
        case Symbol.for("right"):
          tEndPointX = tEndPointX + this.pBalloonImg.getProp(i).width;
          tdestrect = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
          tNewImg.copyPixels(this.pBalloonImg.getProp(i), tdestrect, this.pBalloonImg.getProp(i).rect, propList("bgColor", tBalloonColor, "maskImage", this.pBalloonImg.getProp(i).createMatte()));
          break;
      }
    }
    return tNewImg;
  }

  renderWithWriter(tText, tBgColor) {
    const tWriterId = `bubbly_writer_${getUniqueID()}`;
    if (writerExists(tWriterId)) {
      removeWriter(tWriterId);
    }
    const tBoldStruct = getStructVariable("struct.font.bold");
    tBoldStruct.setaProp(Symbol.for("color"), rgb(255, 255, 255));
    tBoldStruct.setaProp(Symbol.for("bgColor"), tBgColor);
    createWriter(tWriterId, tBoldStruct);
    const tWriter = getWriter(tWriterId);
    if (tWriter == 0) {
      return 0;
    }
    let tImage = tWriter.render(tText);
    if (tImage.ilk == Symbol.for("image")) {
      tImage = tImage.duplicate();
    }
    removeWriter(tWriterId);
    return tImage;
  }
}
