export default class {
  pClickURL;
  pToolTipSpr;
  pSprite;
  pShowTimeOutID;
  pDownloadTimeOutID;
  pAdFinished;
  pAdError;
  pMemberID;
  pMemberIDBase;
  pAdLoaded;
  pShowAdTime;
  pDLCounter;
  pShowCounter;

  construct() {
    this.pAdFinished = 0;
    this.pShowTimeOutID = "InterstitialShowTime";
    this.pDownloadTimeOutID = "InterstitialDownTime";
    this.pClickURL = EMPTY;
    this.pAdError = 0;
    this.pMemberIDBase = "interstitial-system";
    this.pMemberID = this.pMemberIDBase;
    this.pAdLoaded = 0;
    this.pDLCounter = 1;
    this.pShowCounter = 0;
    if (variableExists("interstitial_ad_show_delay")) {
      this.pShowAdTime = getVariable("interstitial_ad_show_delay");
    } else {
      this.pShowAdTime = 4000;
    }
    return 1;
  }

  deconstruct() {
    this.hideTooltip();
    if (timeoutExists(this.pShowTimeOutID)) {
      removeTimeout(this.pShowTimeOutID);
    }
    if (timeoutExists(this.pDownloadTimeOutID)) {
      removeTimeout(this.pDownloadTimeOutID);
    }
    if (this.pToolTipSpr.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pToolTipSpr.spriteNum);
      this.pToolTipSpr = VOID;
    }
    return 1;
  }

  Init(tSourceURL, tClickURL) {
    let tShowlimit = getVariable("interstitial.max.displays", 5);
    if (this.pShowCounter >= tShowlimit) {
      this.pAdError = 1;
      this.adFinished();
      return 0;
    }
    if ((tSourceURL == 0) || !(tSourceURL starts "http")) {
      this.pAdError = 1;
      this.adFinished();
      return 0;
    }
    this.pAdError = 0;
    this.pAdLoaded = 0;
    if (memberExists(this.pMemberID)) {
      removeMember(this.pMemberID);
    }
    this.pDLCounter = this.pDLCounter + 1;
    this.pMemberID = `${this.pMemberIDBase}${this.pDLCounter}`;
    let tAdMemNum = queueDownload(tSourceURL, this.pMemberID, Symbol.for("bitmap"), 1, Symbol.for("httpcookie"));
    if (tAdMemNum < 1) {
      this.adFinished();
      return error(this, "Member not found", Symbol.for("Init"), Symbol.for("major"));
    }
    createTimeout(this.pDownloadTimeOutID, 15000, Symbol.for("adDownloadError"), this.getID(), Symbol.for("error"), 1);
    registerDownloadCallback(tAdMemNum, Symbol.for("adLoaded"), this.getID());
    if (!(tClickURL starts "http")) {
      this.pClickURL = VOID;
    } else {
      this.pClickURL = tClickURL;
    }
  }

  getInterstitialMemNum() {
    if (this.pAdLoaded) {
      return getmemnum(this.pMemberID);
    } else {
      return 0;
    }
  }

  getInterstitialLink() {
    return this.pClickURL;
  }

  isAdFinished() {
    return this.pAdFinished;
  }

  adRequested() {
    this.pClickURL = EMPTY;
    this.pAdFinished = 0;
    this.pAdLoaded = 0;
  }

  hideTooltip() {
    if (this.pToolTipSpr.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pToolTipSpr.spriteNum);
      this.pToolTipSpr = VOID;
    }
  }

  adClosed() {
    this.hideTooltip();
  }

  adLoaded() {
    if (timeoutExists(this.pDownloadTimeOutID)) {
      removeTimeout(this.pDownloadTimeOutID);
    }
    if (this.pAdError == 1) {
      return 0;
    }
    if (getMember(this.pMemberID).type == Symbol.for("empty")) {
      return this.adImportError();
    }
    this.pAdLoaded = 1;
    let tThread = getThread(Symbol.for("room"));
    if (tThread == 0) {
      return 0;
    }
    let tRoomInt = tThread.getInterface();
    if (tRoomInt == 0) {
      return 0;
    }
    tRoomInt.resizeInterstitialWindow();
    createTimeout(this.pShowTimeOutID, this.pShowAdTime, Symbol.for("adFinished"), this.getID(), VOID, 1);
    this.pShowCounter = this.pShowCounter + 1;
  }

  adImportError() {
    error(this, "Interstitial resource error", Symbol.for("adImportError"), Symbol.for("minor"));
    unregisterMember(this.pMemberID);
    this.pAdError = 1;
    this.adFinished();
    return 0;
  }

  adDownloadError() {
    error(this, "Interstitial download timeout", Symbol.for("adDownloadError"), Symbol.for("minor"));
    this.pAdError = 1;
    this.adFinished();
  }

  adFinished() {
    this.pAdFinished = 1;
    let tThread = getThread(Symbol.for("room"));
    if (tThread == 0) {
      return 0;
    }
    let tRoomComp = tThread.getComponent();
    if (tRoomComp == 0) {
      return 0;
    }
    tRoomComp.roomPrePartFinished();
  }

  ShowToolTip() {
    if (this.pToolTipSpr.ilk != Symbol.for("sprite")) {
      this.pToolTipSpr = sprite(reserveSprite(this.getID()));
      this.pToolTipSpr.ink = 8;
      if (!memberExists("inttooltip")) {
        createToolTipMember(this);
      }
      this.pToolTipSpr.member = member(getmemnum("inttooltip"));
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
    this.pToolTipSpr.locZ = 100000000;
  }

  createToolTipMember() {
    createMember("inttooltip", Symbol.for("bitmap"));
    let tText = getText("ad_note", "Clicking this advertisement will open a new window");
    let tFontStruct = getStructVariable("struct.font.bold");
    let tmember = member(createMember("inttooltiptext", Symbol.for("text")));
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
    member(getmemnum("inttooltip")).image = tNewImg;
    removeMember("inttooltiptext");
  }

  eventProc(tEvent, tSprID, tParm) {
    if (tEvent == Symbol.for("mouseUp")) {
      if (!voidp(this.pClickURL)) {
        let tInterstitialTarget = "";
        if (variableExists("interstitial.target")) {
          tInterstitialTarget = getVariable("interstitial.target");
        } else {
          tInterstitialTarget = "external";
        }
        if (tInterstitialTarget == "external") {
          queueDownload(this.pClickURL, `temp${the.milliSeconds}`, Symbol.for("text"), 1, Symbol.for("httpcookie"), Symbol.for("openredirect"));
        } else {
          queueDownload(this.pClickURL, `temp${the.milliSeconds}`, Symbol.for("text"), 1, Symbol.for("httpcookie"), Symbol.for("openredirect"), "habboMain");
        }
      }
    } else {
      if ((tEvent == Symbol.for("mouseEnter")) || (tEvent == Symbol.for("mouseWithin"))) {
        if (!voidp(this.pClickURL)) {
          ShowToolTip(this);
        }
      } else {
        if (tEvent == Symbol.for("mouseLeave")) {
          this.hideTooltip();
        }
      }
    }
  }
}
