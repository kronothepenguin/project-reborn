export default class {
  pTipID;
  pTipWidth;

  construct() {
    this.pTipID = "help_tooltip";
    this.pTipWidth = 150;
    registerMessage(Symbol.for("helptooltip"), this.getID(), Symbol.for("createHelpTooltip"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("tooltip"), this.getID());
    if (windowExists(this.pTipID)) {
      removeWindow(this.pTipID);
    }
    return 1;
  }

  createHelpTooltip(tParams) {
    if (tParams.count < 2) {
      return error(this, "Wrong param count", Symbol.for("createHelpTooltip"), Symbol.for("major"));
    }
    let tMsg = getProp(tParams, Symbol.for("Msg"));
    if (textExists(tMsg)) {
      tMsg = getText(tMsg);
    }
    const tPos = getProp(tParams, Symbol.for("pos"));
    if (ilk(tPos) == Symbol.for("point")) {
      this.createTooltipToPoint(tMsg, tPos);
    } else {
      if (ilk(tPos) == Symbol.for("rect")) {
        this.createTooltipToRect(tMsg, tPos);
      }
    }
  }

  createTooltipToRect(tMsg, tRect) {
    if (voidp(tMsg)) {
      return 0;
    }
    if (voidp(tRect)) {
      return 0;
    }
    if (ilk(tRect) != Symbol.for("rect")) {
      return error(this, "No rect", Symbol.for("createTooltipToRect"), Symbol.for("major"));
    }
    const tSpacing = 7;
    const tStageWidth = the.stageRight - the.stageLeft;
    if (!this.createTooltipToPoint(tMsg, point(0, 0))) {
      return 0;
    }
    const tWndObj = getWindow(this.pTipID);
    if ((tRect.top - tWndObj.pheight - tSpacing) > 0) {
      tWndObj.moveTo(tRect.left + tSpacing, tRect.top - tWndObj.pheight - tSpacing);
    } else {
      tWndObj.moveTo(tRect.left + tSpacing, tRect.bottom + tSpacing);
    }
    if ((tWndObj.pLocX + tWndObj.pwidth) > tStageWidth) {
      tWndObj.moveTo(tStageWidth - tWndObj.pwidth, tWndObj.pLocY);
    }
  }

  createTooltipToPoint(tMsg, tloc) {
    if (ilk(tloc) != Symbol.for("point")) {
      return error(this, "No point", Symbol.for("createTooltipToPoint"), Symbol.for("major"));
    }
    const tLayout = "help_tooltip.window";
    const tLineWidth = this.pTipWidth;
    const tFontStruct = getStructVariable("struct.font.plain");
    let tmember;
    if (!memberExists("help_tooltip.txt")) {
      tmember = member(createMember("help_tooltip.txt", Symbol.for("field")));
    } else {
      tmember = member("help_tooltip.txt");
    }
    tmember.wordWrap = 1;
    tmember.boxType = Symbol.for("adjust");
    tmember.font = tFontStruct.getaProp(Symbol.for("font"));
    tmember.fontSize = tFontStruct.getaProp(Symbol.for("fontSize"));
    tmember.margin = tLineWidth;
    tmember.text = `${tMsg} `;
    tmember.lineHeight = tFontStruct.getaProp(Symbol.for("fontSize"));
    const tLineCount = tmember.lineCount;
    let tHelpHeight = (2 * 11) + (tLineCount * tFontStruct.getaProp(Symbol.for("fontSize")));
    if (tHelpHeight < 40) {
      tHelpHeight = 40;
    }
    if (!createWindow(this.pTipID, tLayout, tloc.locH, tloc.locV)) {
      return 0;
    }
    const tWndObj = getWindow(this.pTipID);
    tWndObj.resizeTo(tLineWidth + 30, tHelpHeight);
    if (tWndObj.elementExists("tt_text")) {
      tWndObj.getElement("tt_text").setText(tMsg);
    }
    for (const tSpr of tWndObj.pSpriteList) {
      tSpr.locZ = tSpr.locZ + 1000;
    }
    const tTimeOutList = list(2500, tMsg.length * 100, 10000);
    tTimeOutList.sort();
    this.createTipTimeout(tTimeOutList[2]);
    tWndObj.registerProcedure(Symbol.for("eventProcHelpTooltip"), this.getID(), Symbol.for("mouseUp"));
    return 1;
  }

  removeTip(tTipID) {
    if (objectExists(Symbol.for("tipTimeout"))) {
      removeTimeout(Symbol.for("tipTimeout"));
    }
    if (windowExists(tTipID)) {
      removeWindow(tTipID);
    }
  }

  createTipTimeout(tTime) {
    if (voidp(tTime)) {
      tTime = 4000;
    }
    if (timeoutExists(Symbol.for("tipTimeout"))) {
      removeTimeout(Symbol.for("tipTimeout"));
    }
    createTimeout(Symbol.for("tipTimeout"), tTime, Symbol.for("removeTip"), this.getID(), this.pTipID);
  }

  eventProcHelpTooltip() {
    this.removeTip(this.pTipID);
  }
}
