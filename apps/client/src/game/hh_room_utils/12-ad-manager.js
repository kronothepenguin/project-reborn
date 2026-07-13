export default class {
  pAdMemNum;
  pClickURL;
  pSprite;
  pState;
  pFrame;
  pTimeOutID;
  pToolTipSpr;
  pBlendFlag;
  pRegisteredLayout;
  pDLCounter;
  pMemberID;
  pMemberIDBase;

  construct() {
    this.pState = 0;
    this.pFrame = 0;
    this.pTimeOutID = "showAdTimeOut";
    this.pBlendFlag = 0;
    this.pDLCounter = 0;
    this.pMemberIDBase = "billboard-image";
    this.pMemberID = `${this.pMemberIDBase}${this.pDLCounter}`;
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("removeAd"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("removeAd"));
    registerMessage(Symbol.for("takingPhoto"), this.getID(), Symbol.for("hideAd"));
    registerMessage(Symbol.for("photoTaken"), this.getID(), Symbol.for("showAd"));
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    if (this.pToolTipSpr.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pToolTipSpr.spriteNum);
    }
    if (timeoutExists(this.pTimeOutID)) {
      removeTimeout(this.pTimeOutID);
    }
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    unregisterMessage(Symbol.for("takingPhoto"), this.getID());
    unregisterMessage(Symbol.for("photoTaken"), this.getID());
    this.removeAd();
    return 1;
  }

  hideAd() {
    let tThread = getThread(Symbol.for("room"));
    if (tThread == 0) {
      return 0;
    }
    let tVisObj = tThread.getInterface().getRoomVisualizer();
    if (tVisObj == 0) {
      return 0;
    }
    if (tVisObj.spriteExists("billboard_img")) {
      let tSpr = tVisObj.getSprById("billboard_img");
      tSpr.visible = 0;
    }
  }

  showAd() {
    let tThread = getThread(Symbol.for("room"));
    if (tThread == 0) {
      return 0;
    }
    let tVisObj = tThread.getInterface().getRoomVisualizer();
    if (tVisObj == 0) {
      return 0;
    }
    if (tVisObj.spriteExists("billboard_img")) {
      let tSpr = tVisObj.getSprById("billboard_img");
      tSpr.visible = 1;
    }
  }

  Init(tSourceURL, tClickURL, tRegisteredLayout) {
    if (tSourceURL != 0) {
      if (!(tSourceURL starts "http")) {
        this.pState = 0;
        return error(this, "Incorrect URL!", Symbol.for("Init"), Symbol.for("minor"));
      }
      this.pDLCounter = this.pDLCounter + 1;
      this.pMemberID = `${this.pMemberIDBase}${this.pDLCounter}`;
      this.pAdMemNum = queueDownload(tSourceURL, this.pMemberID, Symbol.for("bitmap"), 1, Symbol.for("httpcookie"));
      if (!(this.pAdMemNum > 0)) {
        this.pState = 0;
        return error(this, "Incorrect URL!", Symbol.for("Init"), Symbol.for("major"));
      }
      this.pRegisteredLayout = tRegisteredLayout;
      member(this.pAdMemNum).image = image(1, 1, 32);
      member(this.pAdMemNum).trimWhiteSpace = 0;
      registerDownloadCallback(this.pAdMemNum, Symbol.for("adLoaded"), this.getID());
      if (!(tClickURL starts "http")) {
        this.pClickURL = VOID;
      } else {
        this.pClickURL = tClickURL;
      }
      let tThread = getThread(Symbol.for("room"));
      if (tThread == 0) {
        return 0;
      }
      let tVisObj = tThread.getInterface().getRoomVisualizer();
      if (tVisObj == 0) {
        return 0;
      }
      if (tVisObj.spriteExists("billboard_bg")) {
        let tSprBg = tVisObj.getSprById("billboard_bg");
        let tSprImg = tVisObj.getSprById("billboard_img");
        tSprBg.member.paletteRef = member(getmemnum("adframe_palette1"));
        if (tSprBg.member.name contains "left") {
          tSprImg.setMember(member(getmemnum("ad_warning_L")));
        } else {
          tSprImg.setMember(member(getmemnum("ad_warning_R")));
        }
        tSprBg.blend = 100;
        tSprImg.blend = 100;
      }
    } else {
      this.pState = 0;
      this.pClickURL = VOID;
    }
  }

  adLoaded() {
    if (timeoutExists(this.pTimeOutID)) {
      removeTimeout(this.pTimeOutID);
    }
    createTimeout(this.pTimeOutID, 5000, Symbol.for("adReady"), this.getID(), VOID, 1);
  }

  adReady() {
    let tThread = getThread(Symbol.for("room"));
    if (tThread == 0) {
      return 0;
    }
    let tVisObj = tThread.getInterface().getRoomVisualizer();
    if (tVisObj == 0) {
      return 0;
    }
    if (member(this.pAdMemNum).type == Symbol.for("empty")) {
      unregisterMember(this.pMemberID);
      return 0;
    }
    if (tVisObj.spriteExists("billboard_img")) {
      if (tVisObj.pLayout != this.pRegisteredLayout) {
        return 0;
      }
      let tSpr = tVisObj.getSprById("billboard_img");
      this.pSprite = tSpr;
      tSpr.setMember(member(this.pAdMemNum));
      tSpr.width = member(this.pAdMemNum).width;
      tSpr.height = member(this.pAdMemNum).height;
      member(this.pAdMemNum).trimWhiteSpace = 0;
      if (this.pBlendFlag) {
        tSpr.blend = 0;
        this.pState = "fadein";
        receiveUpdate(this.getID());
      } else {
        this.pState = 0;
        tSpr.blend = 100;
      }
      if (tVisObj.spriteExists("billboard_bg")) {
        tSpr = tVisObj.getSprById("billboard_bg");
        tSpr.member.paletteRef = member(getmemnum("adframe_palette2"));
      }
      if (!voidp(this.pClickURL)) {
        this.pSprite.setcursor("cursor.finger");
      }
      this.pSprite.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
      this.pSprite.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseEnter"));
      this.pSprite.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseLeave"));
      this.pSprite.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseWithin"));
    }
  }

  removeAd() {
    this.pState = 0;
    this.pSprite = 0;
    if (this.pToolTipSpr.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pToolTipSpr.spriteNum);
      this.pToolTipSpr = VOID;
    }
    if (memberExists(this.pMemberID)) {
      removeMember(this.pMemberID);
    }
    if (timeoutExists(this.pTimeOutID)) {
      removeTimeout(this.pTimeOutID);
    }
    removeUpdate(this.getID());
  }

  ShowToolTip() {
    if (this.pToolTipSpr.ilk != Symbol.for("sprite")) {
      this.pToolTipSpr = sprite(reserveSprite(this.getID()));
      this.pToolTipSpr.ink = 8;
      if (!memberExists("adtooltip")) {
        createToolTipMember(this);
      }
      this.pToolTipSpr.member = member(getmemnum("adtooltip"));
    }
    let tNewLoc = the.mouseLoc + point(0, 30);
    if ((tNewLoc.locV - (this.pToolTipSpr.height / 2)) < 10) {
      tNewLoc.locV = 10 + (this.pToolTipSpr.height / 2);
    }
    if ((tNewLoc.locH - (this.pToolTipSpr.width / 2)) < 10) {
      tNewLoc.locH = 10 + (this.pToolTipSpr.width / 2);
    }
    if ((tNewLoc.locH + (this.pToolTipSpr.width / 2)) > ((the.stage).rect.width - 10)) {
      tNewLoc.locH = (the.stage).rect.width - 10 - (this.pToolTipSpr.width / 2);
    }
    this.pToolTipSpr.loc = tNewLoc;
  }

  createToolTipMember() {
    createMember("adtooltip", Symbol.for("bitmap"));
    let tText = getText("ad_note", "Clicking this advertisement will open a new window");
    let tFontStruct = getStructVariable("struct.font.bold");
    let tmember = member(createMember("adtooltiptext", Symbol.for("text")));
    tmember.wordWrap = 0;
    tmember.boxType = Symbol.for("adjust");
    tmember.antialias = 0;
    tmember.font = tFontStruct.getaProp(Symbol.for("font"));
    tmember.fontSize = tFontStruct.getaProp(Symbol.for("fontSize"));
    tmember.fontStyle = tFontStruct.getaProp(Symbol.for("fontStyle"));
    tmember.text = tText;
    let tList = propList("left", "ad.tooltip.left", "middle", "ad.tooltip.middle", "right", "ad.tooltip.right");
    let tImgs = propList();
    for (const i of list("left", "middle", "right")) {
      tImgs.addProp(i, member(getmemnum(tList[i])).image);
    }
    let tTextWidth = tmember.charPosToLoc(tmember.char.count).locH + (tImgs["left"].width * 2);
    let tWidth = tTextWidth + 9;
    tmember.rect = rect(0, 0, tTextWidth, tmember.height);
    let tTextImg = tmember.image;
    let tNewImg = image(tWidth, tImgs["left"].height, 8);
    let tStartPointY = 0;
    let tEndPointY = tNewImg.height;
    let tStartPointX = 0;
    let tEndPointX = 0;
    for (const i of list("left", "middle", "right")) {
      tStartPointX = tEndPointX;
      switch (i) {
        case "left":
          tEndPointX = tEndPointX + tImgs.getProp(i).width;
          break;
        case "middle":
          tEndPointX = tEndPointX + tWidth - tImgs.getProp("left").width - tImgs.getProp("right").width;
          break;
        case "right":
          tEndPointX = tEndPointX + tImgs.getProp(i).width;
          break;
      }
      let tdestrect = rect(tStartPointX, tStartPointY, tEndPointX, tEndPointY);
      tNewImg.copyPixels(tImgs.getProp(i), tdestrect, tImgs.getProp(i).rect);
    }
    let tMarginH = tImgs.getProp("left").width + 8;
    let tMarginV = (tNewImg.height - tTextImg.height) / 2;
    let tdestrect = tTextImg.rect + rect(tMarginH, tMarginV, tMarginH, tMarginV);
    tNewImg.copyPixels(tTextImg, tdestrect, tTextImg.rect);
    member(getmemnum("adtooltip")).image = tNewImg;
    removeMember("adtooltiptext");
  }

  update() {
    if (this.pState == 0) {
      removeUpdate(this.getID());
      return;
    }
    this.pFrame = !this.pFrame;
    if (this.pFrame) {
      return;
    }
    switch (this.pState) {
      case "fadein":
        if (this.pSprite.blend < 100) {
          this.pSprite.blend = this.pSprite.blend + 10;
        } else {
          this.pState = 0;
        }
        break;
    }
  }

  eventProc(tEvent, tSprID, tParm) {
    let tClickURL = "";
    if (stringp(tParm)) {
      tClickURL = tParm;
    } else {
      tClickURL = this.pClickURL;
    }
    if (tEvent == Symbol.for("mouseUp")) {
      if (!voidp(tClickURL)) {
        queueDownload(tClickURL, `temp${the.milliSeconds}`, Symbol.for("text"), 1, Symbol.for("httpcookie"), Symbol.for("openredirect"));
      }
    } else {
      if ((tEvent == Symbol.for("mouseEnter")) || (tEvent == Symbol.for("mouseWithin"))) {
        if (!voidp(tClickURL)) {
          ShowToolTip(this);
        }
      } else {
        if (tEvent == Symbol.for("mouseLeave")) {
          if (this.pToolTipSpr.ilk == Symbol.for("sprite")) {
            this.pToolTipSpr.locH = the.stageRight + 1000;
          }
        }
      }
    }
  }
}
