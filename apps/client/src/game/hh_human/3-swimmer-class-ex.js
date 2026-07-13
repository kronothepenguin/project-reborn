export default class {
  pPhFigure;
  pPelleFigure;
  pFigure;
  pSwim;
  pSwimAndStay;
  pSwimAnimCount;

  define(tdata) {
    this.pPartClass = value(getThread(Symbol.for("room")).getComponent().getClassContainer().GET("swimpart"));
    pPhFigure = tdata[Symbol.for("phfigure")];
    pFigure = tdata[Symbol.for("figure")];
    pSwimAnimCount = 0;
    pSwimAndStay = 0;
    callAncestor(Symbol.for("define"), [this], tdata);
    if (voidp(this.pCanvasSize[Symbol.for("swm")])) {
      this.pCanvasSize[Symbol.for("swm")] = list(60, 60, 32, -8);
    }
    tSubSetList = list("swim");
    if (voidp(this.pPartListSubSet)) {
      this.pPartListSubSet = propList();
    }
    for (const tSubSet of tSubSetList) {
      tSetName = `human.partset.${tSubSet}.${this.pPeopleSize}`;
      if (!variableExists(tSetName)) {
        this.pPartListSubSet[tSubSet] = list();
        error(this, `${tSetName} not found!`, Symbol.for("define"), Symbol.for("major"));
        continue;
      }
      this.pPartListSubSet[tSubSet] = getVariableValue(tSetName);
    }
    return 1;
  }

  changeFigureAndData(tdata) {
    tdata[Symbol.for("figure")] = this.fixSwimmerFigure(tdata[Symbol.for("figure")]);
    callAncestor(Symbol.for("changeFigureAndData"), [this], tdata);
  }

  getPelleFigure() {
    return pPelleFigure;
  }

  getFigure() {
    return pFigure;
  }

  isSwimming() {
    return pSwim;
  }

  resetValues(tX, tY, tH, tDirHead, tDirBody) {
    this.pMoving = 0;
    this.pDancing = 0;
    this.pTalking = 0;
    this.pCarrying = 0;
    this.pWaving = 0;
    this.pTrading = 0;
    this.pCtrlType = 0;
    this.pAnimating = 0;
    this.pModState = 0;
    this.pSleeping = 0;
    pSwim = 0;
    pSwimAndStay = 0;
    for (let i = 1; i <= this.pExtraObjsActive.count; i++) {
      this.pExtraObjsActive[i] = 0;
    }
    this.pLocFix = point(0, 0);
    call(Symbol.for("reset"), this.pPartList);
    if (this.pMainAction == "sit") {
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(tX, tY, this.pRestingHeight);
    } else {
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(tX, tY, tH);
    }
    call(Symbol.for("defineDir"), this.pPartList, tDirBody);
    call(Symbol.for("defineDirMultiple"), this.pPartList, tDirHead, this.pPartListSubSet["head"]);
    this.pDirection = tDirBody;
    this.pHeadDir = tDirHead;
    this.pLocX = tX;
    this.pLocY = tY;
    this.pLocH = tH;
    this.pRestingHeight = 0.0;
    this.resetAction();
    if (this.pExtraObjs.count > 0) {
      call(Symbol.for("Refresh"), this.pExtraObjs);
    }
    return 1;
  }

  Refresh(tX, tY, tH) {
    this.arrangeParts();
    this.pSync = 0;
    this.pChanges = 1;
    i = 1;
    while (i <= this.pExtraObjsActive.count) {
      if (this.pExtraObjsActive[i] == 0) {
        this.pExtraObjs[i].deconstruct();
        this.pExtraObjs.deleteAt(i);
        this.pExtraObjsActive.deleteAt(i);
        continue;
      }
      i = i + 1;
    }
  }

  getPartListNameBase() {
    return "swimmer.parts";
  }

  setPartLists(tmodels) {
    tmodels = this.fixSwimmerFigure(tmodels);
    callAncestor(Symbol.for("setPartLists"), [this], tmodels);
    pPelleFigure = propList();
    tDirectionOld = this.pDirection;
    tActionOld = this.pMainAction;
    this.pDirection = 3;
    this.pMainAction = "std";
    this.arrangeParts();
    for (let i = 1; i <= this.pPartList.count; i++) {
      tPartObj = this.pPartList[i];
      tPartSymbol = tPartObj.pPart;
      tPartModel = tPartObj.getModel();
      tPartColor = tPartObj.getColor();
      if (tPartModel.count >= 1) {
        pPelleFigure.addProp(tPartSymbol, propList("model", tPartModel[1], "color", tPartColor));
      }
      if (this.pPartListSubSet["head"].findPos(tPartSymbol)) {
        tPartObj.setUnderWater(0);
        continue;
      }
      tPartObj.setUnderWater(1);
    }
    this.pDirection = tDirectionOld;
    this.pMainAction = tActionOld;
    this.arrangeParts();
    if (!this.isSwimming()) {
      this.resumeAnimation();
    }
    return 1;
  }

  prepare() {
    if (pSwim) {
      if (this.pMoving) {
        pSwimAndStay = 0;
        this.pMainAction = "swm";
        this.definePartListAction(this.pPartListSubSet["swim"], "swm");
      } else {
        pSwimAndStay = 1;
        this.pMainAction = "sws";
        this.definePartListAction(this.pPartListSubSet["swim"], "sws");
      }
      tSwimAnim = list(0, 1, 2, 3, 2, 1);
      pSwimAnimCount = pSwimAnimCount + 1;
      if (pSwimAnimCount > tSwimAnim.count) {
        pSwimAnimCount = 1;
      }
      this.pAnimCounter = tSwimAnim[pSwimAnimCount];
      if (objectExists(Symbol.for("waterripples")) && (random(2) == 1)) {
        tPos = this.getTileCenter();
        tPos[1] = tPos[1] - this.pXFactor;
        tPos[2] = tPos[2] - this.pXFactor;
        getObject(Symbol.for("waterripples")).NewRipple(tPos);
      }
      this.pChanges = 1;
    } else {
      if (this.pMoving) {
        this.definePartListAction(this.pPartListSubSet["walk"], "wlk");
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
        this.definePartListAction(this.pPartListSubSet["speak"], "lsp");
      } else {
        this.definePartListAction(this.pPartListSubSet["speak"], "spk");
      }
      this.pChanges = 1;
    }
    if (!pSwim) {
      if (this.pMoving || pSwimAndStay) {
        this.pLocFix = point(0, this.pAnimCounter > 1);
      }
    } else {
      this.pDancing = 0;
      if (pSwimAndStay) {
        this.pLocFix = point(0, this.pAnimCounter > 1);
      } else {
        this.pLocFix = point(0, 0);
      }
    }
    if (this.pMoving) {
      tFactor = float(the.milliSeconds - this.pMoveStart) / (this.pMoveTime * 1.0);
      if (tFactor > 1.0) {
        tFactor = 1.0;
      }
      this.pScreenLoc = ((this.pDestLScreen - this.pStartLScreen) * 1.0 * tFactor) + this.pStartLScreen;
      this.pChanges = 1;
    }
    if (this.pWaving) {
      this.definePartListAction(this.pPartListSubSet["handLeft"], "wav");
      this.pChanges = 1;
    }
    if (this.pDancing) {
      this.pLocFix = point(0, 2);
      this.pAnimating = 1;
      this.pChanges = 1;
    }
  }

  render() {
    call(Symbol.for("update"), this.pExtraObjs);
    if (!this.pChanges) {
      return;
    }
    this.pChanges = 0;
    if (this.pMainAction == "sit") {
      this.pShadowSpr.castNum = getmemnum(`${this.pPeopleSize}_sit_sd_1_${this.pFlipList[this.pDirection + 1]}_0`);
    } else {
      if (this.pShadowSpr.member != this.pDefShadowMem) {
        this.pShadowSpr.castNum = this.pDefShadowMem.number;
      }
    }
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
      this.pBuffer = image(tSize[1], tSize[2], tSize[3]);
    }
    this.pSprite.flipH = 0;
    this.pMatteSpr.flipH = 0;
    this.pShadowSpr.flipH = 0;
    this.pShadowFix = 0;
    this.pMember.regPoint = point(0, this.pMember.regPoint[2]);
    this.pSprite.locH = this.pScreenLoc[1];
    this.pSprite.locV = this.pScreenLoc[2];
    this.pSprite.locZ = this.pScreenLoc[3] + 2;
    this.updateTypingSpriteLoc();
    this.pMatteSpr.loc = this.pSprite.loc;
    this.pMatteSpr.locZ = this.pSprite.locZ + 1;
    this.pShadowSpr.loc = this.pSprite.loc + list(this.pShadowFix, 0);
    this.pShadowSpr.locZ = this.pSprite.locZ - 3;
    if (this.pMainAction == "swm") {
      this.pSprite.locH = this.pSprite.locH - 12;
      this.pMatteSpr.locH = this.pSprite.locH;
    }
    pUpdateRect = rect(0, 0, 0, 0);
    this.pBuffer.fill(this.pBuffer.rect, this.pAlphaColor);
    if (this.pMainAction == "swm") {
      tRectMod = rect(14, 0, 14, 0);
    } else {
      tRectMod = rect(0, 0, 0, 0);
    }
    call(Symbol.for("update"), this.pPartList, 0, tRectMod);
    this.pMember.image.copyPixels(this.pBuffer, this.pUpdateRect, this.pUpdateRect);
  }

  isInSwimsuit() {
    return 1;
  }

  fixSwimmerFigure(tFigure) {
    tPredefinedParts = list("rh", "lh", "ch", "bd");
    for (const tPrePart of tPredefinedParts) {
      tOccurrenceCount = 0;
      for (let tItemNo = 1; tItemNo <= tFigure.count; tItemNo++) {
        tPartType = tFigure.getPropAt(tItemNo);
        if (tPartType == tPrePart) {
          tOccurrenceCount = tOccurrenceCount + 1;
          if (tOccurrenceCount > 1) {
            tFigure.deleteAt(tItemNo);
            tItemNo = tItemNo - 1;
          }
        }
      }
    }
    if (this.pSex == "F") {
      tphModel = "s01";
    } else {
      tphModel = "s02";
    }
    tColor = pPhFigure["color"];
    tFigure["ch"] = propList("model", tphModel, "color", tColor);
    for (const f of list("bd", "lh", "rh")) {
      if (voidp(tFigure[f])) {
        tFigure[f] = propList("model", "1", "color", rgb("#EEEEEE"));
      }
    }
    tBodyModel = tFigure["bd"]["model"];
    if (ilk(tBodyModel) != Symbol.for("string")) {
      tBodyModel = EMPTY;
    }
    while (tBodyModel.length < 3) {
      tBodyModel = `0${tBodyModel}`;
    }
    tFigure["bd"]["model"] = `s${tBodyModel.char[`${2}..${3}`]}`;
    tFigure["lh"]["model"] = `s${tBodyModel.char[`${2}..${3}`]}`;
    tFigure["rh"]["model"] = `s${tBodyModel.char[`${2}..${3}`]}`;
    return tFigure;
  }

  action_swim(props) {
    this.stopAnimation();
    pSwim = 1;
  }

  action_mv(tProps) {
    this.pMoving = 1;
    tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    tloc = tProps.word[2];
    tLocX = integer(tloc.item[1]);
    tLocY = integer(tloc.item[2]);
    tLocH = getLocalFloat(tloc.item[3]);
    the.itemDelimiter = tDelim;
    this.pStartLScreen = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH);
    this.pDestLScreen = this.pGeometry.getScreenCoordinate(tLocX, tLocY, tLocH);
    this.pMoveStart = the.milliSeconds;
  }
}
