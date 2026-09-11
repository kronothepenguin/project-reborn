export default class {
  pCanvasName;
  pValid;

  deconstruct() {
    callAncestor(Symbol.for("deconstruct"), list(this));
    this.pValid = 0;
    if (memberExists(this.pCanvasName) && (this.pCanvasName != VOID)) {
      removeMember(this.pCanvasName);
    }
    return 1;
  }

  define(tdata) {
    this.pValid = 1;
    this.pName = "template";
    this.pClass = tdata[Symbol.for("class")];
    this.pDirection = tdata[Symbol.for("direction")][1];
    this.pHeadDir = this.pDirection;
    this.pLastDir = this.pDirection;
    this.pPeopleSize = getVariable(`human.size.${tdata[Symbol.for("type")]}`);
    if (!this.pPeopleSize) {
      error(this, "People size not found, using default!", Symbol.for("define"), Symbol.for("minor"));
      this.pPeopleSize = "h";
    }
    this.pCanvasSize = value(getVariable(`human.canvas.${this.pPeopleSize}`));
    if (!this.pCanvasSize) {
      error(this, "Canvas size not found, using default!", Symbol.for("define"), Symbol.for("minor"));
      this.pCanvasSize = propList("std", list(64, 102, 32, -10), "lay", list(89, 102, 32, -8));
    }
    this.pCanvasName = `${this.pClass} ${this.pName} ${this.getID()} Canvas`;
    if (!memberExists(this.pCanvasName)) {
      createMember(this.pCanvasName, Symbol.for("bitmap"));
    }
    let tSize = this.pCanvasSize[Symbol.for("std")];
    this.pMember = member(getmemnum(this.pCanvasName));
    this.pMember.image = image(tSize[1], tSize[2], tSize[3]);
    this.pMember.regPoint = point(0, this.pMember.image.height + tSize[4]);
    this.pBuffer = this.pMember.image;
    let tPartSymbols = tdata[Symbol.for("parts")];
    if (!this.setPartLists(tdata[Symbol.for("figure")])) {
      return error(this, "Couldn't create part lists!", Symbol.for("define"), Symbol.for("major"));
    }
    this.arrangeParts();
    this.simulateUpdate();
    return this.pMember;
  }

  getMember() {
    return this.pMember;
  }

  resetTemplateHuman() {
    this.pMoving = 0;
    this.pDancing = 0;
    this.pTalking = 0;
    this.pCarrying = 0;
    this.pWaving = 0;
    this.pTrading = 0;
    this.pAnimating = 0;
    call(Symbol.for("reset"), this.pPartList);
    this.resetAction();
    this.arrangeParts();
    this.pChanges = 1;
  }

  simulateUpdate() {
    if (this.pValid) {
      this.pSync = not this.pSync;
      if (this.pSync) {
        this.prepare();
      } else {
        this.render();
      }
      this.delay(1000 / the.frameTempo, Symbol.for("simulateUpdate"));
    }
  }

  Refresh(tX, tY, tH, tDirHead, tDirBody) {
    this.pMoving = 0;
    this.pDancing = 0;
    this.pTalking = 0;
    this.pCarrying = 0;
    this.pWaving = 0;
    this.pTrading = 0;
    this.pCtrlType = 0;
    this.pModState = 0;
    this.pLocFix = point(-1, 2);
    call(Symbol.for("reset"), this.pPartList);
    this.pMainAction = "std";
    this.pLocX = tX;
    this.pLocY = tY;
    this.pLocH = tH;
    this.pRestingHeight = 0.0;
    call(Symbol.for("defineDir"), this.pPartList, tDirBody);
    if (this.pMainAction != "lay") {
      call(Symbol.for("defineDirMultiple"), this.pPartList, tDirHead, this.pPartListSubSet["head"]);
    }
    this.pDirection = tDirBody;
    this.arrangeParts();
    this.pChanges = 1;
  }

  render() {
    if (!this.pChanges) {
      return;
    }
    this.pChanges = 0;
    this.pUpdateRect = rect(0, 0, 0, 0);
    this.pBuffer.fill(this.pBuffer.rect, this.pAlphaColor);
    call(Symbol.for("update"), this.pPartList);
  }
}
