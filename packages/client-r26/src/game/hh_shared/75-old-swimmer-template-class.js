export default class {
  pPhFigure;
  pPelleFigure;
  pFigure;
  pSwim;
  pSwimAndStay;
  pSign;
  pSwimShadowH;
  pSignMember;
  pSwimAnimCount;

  define(tdata) {
    this.pValid = 1;
    this.pPhFigure = tdata[Symbol.for("phfigure")];
    this.pFigure = tdata[Symbol.for("figure")];
    this.pSwimAnimCount = 0;
    this.pSwimAndStay = 0;
    this.pClass = tdata[Symbol.for("class")];
    this.pSex = tdata[Symbol.for("sex")];
    this.pDirection = tdata[Symbol.for("direction")][1];
    this.pLastDir = this.pDirection;
    this.pLocX = tdata[Symbol.for("x")];
    this.pLocY = tdata[Symbol.for("y")];
    this.pLocH = tdata[Symbol.for("h")];
    this.pPeopleSize = getVariable(`human.size.${integer(this.pXFactor)}`);
    if (!this.pPeopleSize) {
      error(this, "People size not found, using default!", Symbol.for("define"), Symbol.for("minor"));
      this.pPeopleSize = "sh";
    }
    this.pCanvasSize = value(getVariable(`human.canvas.${this.pPeopleSize}`));
    this.pCanvasSize.addProp(Symbol.for("swm"), list(60, 60, 32, -8));
    if (!this.pCanvasSize) {
      error(this, "Canvas size not found, using default!", Symbol.for("define"), Symbol.for("minor"));
      this.pCanvasSize = propList("std", list(64, 102, 32, -8), "lay", list(89, 102, 32, -4));
    }
    if (this.pCanvasName == VOID) {
      this.pCanvasName = `${this.pClass} ${this.pName} ${this.getID()} Canvas`;
    }
    if (!memberExists(this.pCanvasName)) {
      createMember(this.pCanvasName, Symbol.for("bitmap"));
    }
    const tSize = this.pCanvasSize[Symbol.for("std")];
    this.pMember = member(getmemnum(this.pCanvasName));
    this.pMember.image = image(tSize[1], tSize[2], tSize[3]);
    this.pMember.regPoint = point(0, this.pMember.image.height + tSize[4]);
    this.pBuffer = this.pMember.image;
    this.pSprite = sprite(reserveSprite(this.getID()));
    this.pSprite.member = this.pMember;
    this.pSprite.ink = 36;
    this.pMatteSpr = sprite(reserveSprite(this.getID()));
    this.pMatteSpr.member = this.pMember;
    this.pMatteSpr.ink = 8;
    this.pMatteSpr.blend = 0;
    this.pShadowSpr = sprite(reserveSprite(this.getID()));
    this.pShadowSpr.blend = 10;
    this.pShadowSpr.ink = 8;
    this.pShadowFix = 0;
    this.pDefShadowMem = member(getmemnum(`${this.pPeopleSize}_std_sd_001_0_0`));
    const tTargetID = getThread(Symbol.for("room")).getInterface().getID();
    setEventBroker(this.pMatteSpr.spriteNum, this.getID());
    call(Symbol.for("registerProcedure"), this.pMatteSpr.scriptInstanceList, Symbol.for("eventProcUserObj"), tTargetID, Symbol.for("mouseDown"));
    call(Symbol.for("registerProcedure"), this.pMatteSpr.scriptInstanceList, Symbol.for("eventProcUserRollOver"), tTargetID, Symbol.for("mouseEnter"));
    call(Symbol.for("registerProcedure"), this.pMatteSpr.scriptInstanceList, Symbol.for("eventProcUserRollOver"), tTargetID, Symbol.for("mouseLeave"));
    const tPartSymbols = tdata[Symbol.for("parts")];
    if (!setPartLists(this, tdata[Symbol.for("figure")])) {
      return error(this, "Couldn't create part lists!", Symbol.for("define"), Symbol.for("major"));
    }
    this.arrangeParts();
    this.Refresh(this.pLocX, this.pLocY, this.pLocH, this.pDirection, this.pDirection);
    return 1;
  }

  getPelleFigure() {
    return this.pPelleFigure;
  }

  getFigure() {
    return this.pFigure;
  }

  Refresh(tX, tY, tH, tDirHead, tDirBody) {
    this.pMoving = 0;
    this.pDancing = 0;
    this.pTalking = 0;
    this.pCarrying = 0;
    this.pWaving = 0;
    this.pTrading = 0;
    this.pCtrlType = 0;
    this.pAnimating = 0;
    this.pModState = 0;
    this.pSwim = 0;
    this.pSwimAndStay = 0;
    this.pSign = 0;
    this.pLocFix = point(0, 0);
    call(Symbol.for("reset"), this.pPartList);
    if (this.pMainAction == "sit") {
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(tX, tY, this.pRestingHeight);
    } else {
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(tX, tY, tH);
    }
    call(Symbol.for("defineDir"), this.pPartList, tDirBody);
    this.pMainAction = "std";
    this.pLocX = tX;
    this.pLocY = tY;
    this.pLocH = tH;
    this.pRestingHeight = 0.0;
    this.pDirection = tDirBody;
    this.arrangeParts();
    if (this.pExtraObjs.count > 0) {
      call(Symbol.for("Refresh"), this.pExtraObjs);
    }
    this.pSync = 0;
  }

  setPartLists(tmodels) {
    const tAction = this.pMainAction;
    this.pPartList = list();
    let tphModel;
    if (this.pSex == "F") {
      tphModel = "s01";
    } else {
      tphModel = "s02";
    }
    let tColor = this.pPhFigure["color"];
    tmodels["ch"] = propList("model", tphModel, "color", tColor);
    for (const f of ["bd", "lh", "rh"]) {
      if (voidp(tmodels[f])) {
        tmodels[f] = propList("model", "001", "color", rgb("#EEEEEE"));
      }
    }
    tmodels["bd"]["model"] = `s${tmodels["bd"]["model"].char[`2..3`]}`;
    tmodels["lh"]["model"] = `s${tmodels["bd"]["model"].char[`2..3`]}`;
    tmodels["rh"]["model"] = `s${tmodels["bd"]["model"].char[`2..3`]}`;
    this.pPelleFigure = tmodels;
    const tPartDefinition = list("li", "lh", "bd", "ch", "hd", "fc", "ey", "hr", "ri", "rh");
    for (let i = 1; i <= tPartDefinition.count; i++) {
      const tPartSymbol = tPartDefinition[i];
      if (voidp(tmodels[tPartSymbol])) {
        tmodels[tPartSymbol] = propList();
      }
      if (voidp(tmodels[tPartSymbol]["model"])) {
        tmodels[tPartSymbol]["model"] = "001";
      }
      if (voidp(tmodels[tPartSymbol]["color"])) {
        tmodels[tPartSymbol]["color"] = rgb("#EEEEEE");
      }
      if (((tPartSymbol == "fc") || (tPartSymbol == "hd")) && (tmodels[tPartSymbol]["model"] == "002") && (this.pXFactor < 33)) {
        tmodels[tPartSymbol]["model"] = "001";
      }
      const tPartCls = value(getThread(Symbol.for("room")).getComponent().getClassContainer().GET("swimpart"));
      const tPartObj = createObject(Symbol.for("temp"), tPartCls);
      let tColor2;
      if (stringp(tmodels[tPartSymbol]["color"])) {
        tColor2 = value(`rgb(${tmodels[tPartSymbol]["color"]})`);
      }
      if (tmodels[tPartSymbol]["color"].ilk != Symbol.for("color")) {
        tColor2 = rgb(tmodels[tPartSymbol]["color"]);
      } else {
        tColor2 = tmodels[tPartSymbol]["color"];
      }
      if ((tColor2.red + tColor2.green + tColor2.blue) > (238 * 3)) {
        tColor2 = rgb("EEEEEE");
      }
      tPartObj.define(tPartSymbol, tmodels[tPartSymbol]["model"], tColor2, this.pDirection, tAction, this);
      this.pPartList.add(tPartObj);
      this.pColors.setaProp(tPartSymbol, tColor2);
    }
    this.pPartIndex = propList();
    for (let i = 1; i <= this.pPartList.count; i++) {
      this.pPartIndex[this.pPartList[i].pPart] = i;
    }
    return 1;
  }

  arrangeParts() {
    const tRH = this.pPartList[this.pPartIndex["rh"]];
    const tRI = this.pPartList[this.pPartIndex["ri"]];
    this.pPartList.deleteAt(this.pPartIndex["rh"]);
    this.pPartList.deleteAt(this.pPartIndex["ri"]);
    if ((tRH.pActionRh == "drk") && (list(0, 6).getPos(this.pDirection) != 0)) {
      this.pPartList.addAt(8, tRI);
      this.pPartList.addAt(9, tRH);
    } else {
      if (this.pDirection == 7) {
        this.pPartList.addAt(1, tRI);
        this.pPartList.addAt(2, tRH);
      } else {
        this.pPartList.append(tRI);
        this.pPartList.append(tRH);
      }
    }
    for (let i = 1; i <= this.pPartList.count; i++) {
      this.pPartIndex[this.pPartList[i].pPart] = i;
    }
    if (this.pLastDir == this.pDirection) {
      return;
    }
    this.pLastDir = this.pDirection;
    const tLH = this.pPartList[this.pPartIndex["lh"]];
    const tLI = this.pPartList[this.pPartIndex["li"]];
    this.pPartList.deleteAt(this.pPartIndex["lh"]);
    this.pPartList.deleteAt(this.pPartIndex["li"]);
    switch (this.pDirection) {
      case 3:
        this.pPartList.addAt(8, tLI);
        this.pPartList.addAt(9, tLH);
        break;
      default:
        this.pPartList.addAt(1, tLI);
        this.pPartList.addAt(2, tLH);
    }
    for (let i = 1; i <= this.pPartList.count; i++) {
      this.pPartIndex[this.pPartList[i].pPart] = i;
    }
  }

  prepare() {
    if (this.pSwim) {
      if (this.pMoving) {
        this.pSwimAndStay = 0;
        this.pMainAction = "swm";
        call(Symbol.for("defineActMultiple"), this.pPartList, "swm", list("bd", "lh", "ch", "rh"));
      } else {
        this.pSwimAndStay = 1;
        this.pMainAction = "sws";
        call(Symbol.for("defineActMultiple"), this.pPartList, "sws", list("bd", "lh", "ch", "rh"));
      }
      const tSwimAnim = list(0, 1, 2, 3, 2, 1);
      this.pSwimAnimCount = this.pSwimAnimCount + 1;
      if (this.pSwimAnimCount > tSwimAnim.count) {
        this.pSwimAnimCount = 1;
      }
      this.pAnimCounter = tSwimAnim[this.pSwimAnimCount];
      if (objectExists(Symbol.for("waterripples")) && (random(2) == 1)) {
        const tPos = this.getTileCenter();
        tPos[1] = tPos[1] - this.pXFactor;
        tPos[2] = tPos[2] - this.pXFactor;
        getObject(Symbol.for("waterripples")).NewRipple(tPos);
      }
      this.pChanges = 1;
    } else {
      if (this.pMoving) {
        call(Symbol.for("defineActMultiple"), this.pPartList, "wlk", list("bd", "lh", "rh"));
      }
      this.pAnimCounter = (this.pAnimCounter + 1) % 4;
    }
    if (this.pEyesClosed && !this.pSleeping) {
      this.openEyes();
    } else {
      if (random(30) == 3) {
        this.closeEyes();
      }
    }
    if (this.pTalking && (random(3) > 1)) {
      if (this.pMainAction == "lay") {
        call(Symbol.for("defineActMultiple"), this.pPartList, "lsp", list("hd", "hr", "fc"));
      } else {
        call(Symbol.for("defineActMultiple"), this.pPartList, "spk", list("hd", "hr", "fc", "ey"));
      }
      this.pChanges = 1;
    }
    if (!this.pSwim) {
      if (this.pMoving || this.pSwimAndStay) {
        this.pLocFix = point(0, this.pAnimCounter > 1);
      }
    } else {
      this.pDancing = 0;
      if (this.pSwimAndStay) {
        this.pLocFix = point(0, this.pAnimCounter > 1);
      } else {
        this.pLocFix = point(0, 0);
      }
    }
    if (this.pMoving) {
      const tFactor = float(the.milliSeconds - this.pMoveStart) / (this.pMoveTime * 1.0);
      if (tFactor > 1.0) {
        tFactor = 1.0;
      }
      this.pScreenLoc = ((this.pDestLScreen - this.pStartLScreen) * 1.0 * tFactor) + this.pStartLScreen;
      this.pChanges = 1;
    }
    if (this.pWaving) {
      call(Symbol.for("doHandWorkLeft"), this.pPartList, "wav");
      this.pChanges = 1;
    }
    if (this.pDancing) {
      this.pAnimating = 1;
      this.pChanges = 1;
    }
  }

  render() {
    if (!this.pChanges) {
      return;
    }
    this.pChanges = 0;
    if (this.pMainAction == "sit") {
      this.pShadowSpr.member = member(getmemnum(`${this.pPeopleSize}_sit_sd_001_${this.pFlipList[this.pDirection + 1]}_0`));
    } else {
      if (!(this.pShadowSpr.member == this.pDefShadowMem)) {
        this.pShadowSpr.member = this.pDefShadowMem;
      }
    }
    let tSize;
    if (this.pMainAction == "swm") {
      tSize = this.pCanvasSize[Symbol.for("swm")];
    } else {
      tSize = this.pCanvasSize[Symbol.for("std")];
    }
    if ((this.pBuffer.width != tSize[1]) || (this.pBuffer.height != tSize[2])) {
      this.pMember.image = image(tSize[1], tSize[2], tSize[3]);
      this.pMember.regPoint = point(0, tSize[2] + tSize[4]);
      this.pSprite.width = tSize[1];
      this.pSprite.height = tSize[2];
      this.pMatteSpr.width = tSize[1];
      this.pMatteSpr.height = tSize[2];
      this.pBuffer = this.pMember.image;
    }
    if (this.pFlipList[this.pDirection + 1] != this.pDirection) {
      if (!this.pSprite.flipH) {
        this.pSprite.flipH = 1;
        this.pMatteSpr.flipH = 1;
        this.pShadowSpr.flipH = 1;
        this.pShadowFix = this.pXFactor;
      }
      this.pMember.regPoint = point(this.pMember.image.width, this.pMember.regPoint[2]);
    } else {
      if (this.pSprite.flipH) {
        this.pSprite.flipH = 0;
        this.pMatteSpr.flipH = 0;
        this.pShadowSpr.flipH = 0;
        this.pShadowFix = 0;
      }
      this.pMember.regPoint = point(0, this.pMember.regPoint[2]);
    }
    this.pSprite.locH = this.pScreenLoc[1];
    this.pSprite.locV = this.pScreenLoc[2];
    this.pSprite.locZ = this.pScreenLoc[3] + 2;
    this.pMatteSpr.loc = this.pSprite.loc;
    this.pMatteSpr.locZ = this.pSprite.locZ + 1;
    this.pShadowSpr.loc = this.pSprite.loc + list(this.pShadowFix, 0);
    this.pShadowSpr.locZ = this.pSprite.locZ - 3;
    if (this.pMainAction == "swm") {
      this.pSprite.locH = this.pSprite.locH - 12;
      this.pMatteSpr.locH = this.pSprite.locH;
    }
    this.pBuffer.fill(this.pBuffer.rect, this.pAlphaColor);
    call(Symbol.for("update"), this.pPartList);
  }

  action_mv(tProps) {
    this.pMoving = 1;
    const tTempDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    const tloc = tProps.word[2];
    const tX = integer(tloc.item[1]);
    const tY = integer(tloc.item[2]);
    let tH = integer(tloc.item[3]);
    if (tH < 7) {
      this.pSwimShadowH = tH;
      tH = 4;
    }
    the.itemDelimiter = tTempDelim;
    this.pStartLScreen = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH);
    this.pDestLScreen = this.pGeometry.getScreenCoordinate(tX, tY, tH);
    this.pMoveStart = the.milliSeconds;
  }

  action_swim(props) {
    this.pSwim = 1;
  }

  action_wave(tProps) {
    this.pWaving = 1;
  }

  action_sign(props) {
    if (this.pSwim) {
      return;
    }
    const tSignMem = `sign${props.word[2]}`;
    call(Symbol.for("doHandWorkLeft"), this.pPartList, "sig");
    const tSignObjID = "SIGN_EXTRA";
    if (voidp(this.pExtraObjs[tSignObjID])) {
      this.pExtraObjs.addProp(tSignObjID, createObject(Symbol.for("temp"), "HumanExtra Sign Class"));
    }
    call(Symbol.for("show_sign"), this.pExtraObjs, propList("sprite", this.pSprite, "direction", this.pDirection, "signmember", tSignMem));
  }
}
