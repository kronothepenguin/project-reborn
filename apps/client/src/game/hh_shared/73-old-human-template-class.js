export default class {
  pName;
  pClass;
  pSex;
  pCanvasName;
  pBuffer;
  pMember;
  pShadowFix;
  pDefShadowMem;
  pPartList;
  pPartIndex;
  pFlipList;
  pUpdateRect;
  pDirection;
  pLastDir;
  pLocFix;
  pAnimCounter;
  pEyesClosed;
  pSync;
  pChanges;
  pAlphaColor;
  pCanvasSize;
  pColors;
  pPeopleSize;
  pMainAction;
  pMoving;
  pTalking;
  pCarrying;
  pSleeping;
  pDancing;
  pWaving;
  pTrading;
  pCurrentAnim;
  pValid;

  construct() {
    this.pPartList = list();
    this.pPartIndex = propList();
    this.pFlipList = list(0, 1, 2, 3, 2, 1, 0, 7);
    this.pUpdateRect = rect(0, 0, 0, 0);
    this.pLocFix = point(0, 0);
    this.pAnimCounter = 0;
    this.pEyesClosed = 0;
    this.pSync = 1;
    this.pChanges = 1;
    this.pMainAction = "std";
    this.pMoving = 0;
    this.pTalking = 0;
    this.pCarrying = 0;
    this.pSleeping = 0;
    this.pDancing = 0;
    this.pWaving = 0;
    this.pCurrentAnim = EMPTY;
    this.pAlphaColor = rgb(255, 255, 255);
    this.pSync = 1;
    this.pColors = propList();
    this.pDefShadowMem = member(0);
    return 1;
  }

  deconstruct() {
    this.pValid = 0;
    this.pPartList = list();
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
    const tSize = this.pCanvasSize[Symbol.for("std")];
    this.pMember = member(getmemnum(this.pCanvasName));
    this.pMember.image = image(tSize[1], tSize[2], tSize[3]);
    this.pMember.regPoint = point(0, this.pMember.image.height + tSize[4]);
    this.pBuffer = this.pMember.image;
    const tPartSymbols = tdata[Symbol.for("parts")];
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
    this.pMainAction = "std";
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
      call(Symbol.for("defineDirMultiple"), this.pPartList, tDirHead, list("hd", "hr", "ey", "fc"));
    }
    this.pDirection = tDirBody;
    this.arrangeParts();
    this.pChanges = 1;
  }

  setPartModel(tPart, tmodel) {
    if (voidp(this.pPartIndex[tPart])) {
      return VOID;
    }
    this.pPartList[this.pPartIndex[tPart]].setModel(tmodel);
  }

  setPartColor(tPart, tColor) {
    if (voidp(this.pPartIndex[tPart])) {
      return VOID;
    }
    this.pPartList[this.pPartIndex[tPart]].setColor(tColor);
  }

  getPartMember(tPart) {
    if (voidp(this.pPartIndex[tPart])) {
      return VOID;
    }
    return this.pPartList[this.pPartIndex[tPart]].getCurrentMember();
  }

  getPartColor(tPart) {
    if (voidp(this.pPartIndex[tPart])) {
      return VOID;
    }
    return this.pPartList[this.pPartIndex[tPart]].getColor();
  }

  getPicture(tImg) {
    let tCanvas;
    if (voidp(tImg)) {
      tCanvas = image(64, 102, 16);
    } else {
      tCanvas = tImg;
    }
    call(Symbol.for("copyPicture"), this.pPartList, tCanvas);
    tCanvas = this.flipImage(tCanvas);
    return tCanvas;
  }

  closeEyes() {
    if (this.pMainAction == "lay") {
      call(Symbol.for("defineActMultiple"), this.pPartList, "ley", list("ey"));
    } else {
      call(Symbol.for("defineActMultiple"), this.pPartList, "eyb", list("ey"));
    }
    this.pEyesClosed = 1;
    this.pChanges = 1;
  }

  openEyes() {
    if (this.pMainAction == "lay") {
      call(Symbol.for("defineActMultiple"), this.pPartList, "lay", list("ey"));
    } else {
      call(Symbol.for("defineActMultiple"), this.pPartList, "std", list("ey"));
    }
    this.pEyesClosed = 0;
    this.pChanges = 1;
  }

  prepare() {
    this.pAnimCounter = (this.pAnimCounter + 1) % 4;
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
        call(Symbol.for("defineActMultiple"), this.pPartList, "spk", list("hd", "hr", "fc"));
      }
      this.pChanges = 1;
    }
    if (this.pMoving) {
      this.pChanges = 1;
    }
    if (this.pWaving && (this.pMainAction != "lay")) {
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
    this.pUpdateRect = rect(0, 0, 0, 0);
    this.pBuffer.fill(this.pBuffer.rect, this.pAlphaColor);
    call(Symbol.for("update"), this.pPartList);
  }

  reDraw() {
    this.pBuffer.fill(this.pBuffer.rect, this.pAlphaColor);
    call(Symbol.for("render"), this.pPartList);
    this.pMember.image.copyPixels(this.pBuffer, this.pBuffer.rect, this.pBuffer.rect);
  }

  setPartLists(tmodels) {
    const tAction = this.pMainAction;
    this.pPartList = list();
    const tPartDefinition = getVariableValue(`human.parts.${this.pPeopleSize}`);
    for (let i = 1; i <= tPartDefinition.count; i++) {
      const tPartSymbol = tPartDefinition[i];
      if (voidp(tmodels[tPartSymbol])) {
        tmodels[tPartSymbol] = propList();
      }
      if (voidp(tmodels[tPartSymbol]["model"])) {
        tmodels[tPartSymbol]["model"] = "001";
      }
      if (voidp(tmodels[tPartSymbol]["color"])) {
        tmodels[tPartSymbol]["color"] = rgb("EEEEEE");
      }
      const tPartObj = createObject(Symbol.for("temp"), "Bodypart Template Class");
      let tColor;
      if (stringp(tmodels[tPartSymbol]["color"])) {
        tColor = value(`rgb(${tmodels[tPartSymbol]["color"]})`);
      }
      if (tmodels[tPartSymbol]["color"].ilk != Symbol.for("color")) {
        tColor = rgb(tmodels[tPartSymbol]["color"]);
      } else {
        tColor = tmodels[tPartSymbol]["color"];
      }
      if ((tColor.red + tColor.green + tColor.blue) > (238 * 3)) {
        tColor = rgb("EEEEEE");
      }
      tPartObj.define(tPartSymbol, tmodels[tPartSymbol]["model"], tColor, this.pDirection, tAction, this);
      this.pPartList.add(tPartObj);
      this.pColors[tPartSymbol] = tColor;
    }
    this.pPartIndex = propList();
    for (let i = 1; i <= this.pPartList.count; i++) {
      this.pPartIndex[this.pPartList[i].pPart] = i;
    }
    return 1;
  }

  arrangeParts() {
    let tIndex1, tIndex2;
    if (this.pPartIndex["lg"] < this.pPartIndex["sh"]) {
      tIndex1 = this.pPartIndex["lg"];
      tIndex2 = this.pPartIndex["sh"];
    } else {
      tIndex1 = this.pPartIndex["sh"];
      tIndex2 = this.pPartIndex["lg"];
    }
    const tLG = this.pPartList[this.pPartIndex["lg"]];
    const tSH = this.pPartList[this.pPartIndex["sh"]];
    switch (this.pMainAction) {
      case "sit":
      case "lay":
        if (this.pFlipList[this.pDirection + 1] == 0) {
          this.pPartList[tIndex1] = tSH;
          this.pPartList[tIndex2] = tLG;
        } else {
          this.pPartList[tIndex1] = tLG;
          this.pPartList[tIndex2] = tSH;
        }
        break;
      default:
        this.pPartList[tIndex1] = tSH;
        this.pPartList[tIndex2] = tLG;
    }
    const tRS = this.pPartList[this.pPartIndex["rs"]];
    const tRH = this.pPartList[this.pPartIndex["rh"]];
    const tRI = this.pPartList[this.pPartIndex["ri"]];
    this.pPartList.deleteAt(this.pPartIndex["rs"]);
    this.pPartList.deleteAt(this.pPartIndex["rh"]);
    this.pPartList.deleteAt(this.pPartIndex["ri"]);
    if ((tRH.pActionRh == "drk") && (list(0, 6).getPos(this.pDirection) != 0)) {
      this.pPartList.addAt(8, tRI);
      this.pPartList.addAt(9, tRH);
      this.pPartList.addAt(10, tRS);
    } else {
      if (this.pDirection == 7) {
        this.pPartList.addAt(1, tRI);
        this.pPartList.addAt(2, tRH);
        this.pPartList.addAt(3, tRS);
      } else {
        this.pPartList.append(tRI);
        this.pPartList.append(tRH);
        this.pPartList.append(tRS);
      }
    }
    for (let i = 1; i <= this.pPartList.count; i++) {
      this.pPartIndex[this.pPartList[i].pPart] = i;
    }
    if (this.pLastDir == this.pDirection) {
      return;
    }
    this.pLastDir = this.pDirection;
    const tLS = this.pPartList[this.pPartIndex["ls"]];
    const tLH = this.pPartList[this.pPartIndex["lh"]];
    const tLI = this.pPartList[this.pPartIndex["li"]];
    this.pPartList.deleteAt(this.pPartIndex["ls"]);
    this.pPartList.deleteAt(this.pPartIndex["lh"]);
    this.pPartList.deleteAt(this.pPartIndex["li"]);
    switch (this.pDirection) {
      case 3:
        this.pPartList.addAt(8, tLI);
        this.pPartList.addAt(9, tLH);
        this.pPartList.addAt(10, tLS);
        break;
      default:
        this.pPartList.addAt(1, tLI);
        this.pPartList.addAt(2, tLH);
        this.pPartList.addAt(3, tLS);
    }
    for (let i = 1; i <= this.pPartList.count; i++) {
      this.pPartIndex[this.pPartList[i].pPart] = i;
    }
  }

  flipImage(tImg_a) {
    const tImg_b = image(tImg_a.width, tImg_a.height, tImg_a.depth);
    const tQuad = list(point(tImg_a.width, 0), point(0, 0), point(0, tImg_a.height), point(tImg_a.width, tImg_a.height));
    tImg_b.copyPixels(tImg_a, tQuad, tImg_a.rect);
    return tImg_b;
  }

  action_mv(tProps) {
    this.pMainAction = "wlk";
    this.pMoving = 1;
    call(Symbol.for("defineActMultiple"), this.pPartList, "wlk", list("bd", "lg", "lh", "rh", "ls", "rs", "sh"));
  }

  action_sit(tProps) {
    call(Symbol.for("defineActMultiple"), this.pPartList, "sit", list("bd", "lg", "sh"));
    this.pMainAction = "sit";
    this.arrangeParts();
  }

  action_lay(tProps) {
    this.pMainAction = "lay";
    this.pCarrying = 0;
    this.pLocFix = point(30, -10);
    call(Symbol.for("layDown"), this.pPartList);
    if (this.pDirection == 0) {
      this.pDirection = 4;
    }
    call(Symbol.for("defineDir"), this.pPartList, this.pDirection);
    this.arrangeParts();
  }

  action_carryd(tProps) {
    const tItem = tProps.word[2];
    if (integerp(value(tItem))) {
      this.pCarrying = tItem;
      let tCarryItm;
      if (variableExists(`handitem.right.${this.pCarrying}`)) {
        tCarryItm = getVariable(`handitem.right.${this.pCarrying}`, "001");
      } else {
        tCarryItm = "001";
      }
      call(Symbol.for("doHandWorkRight"), this.pPartList, "crr");
      this.pPartList[this.pPartIndex["ri"]].setModel(tCarryItm);
    }
  }

  action_drink(tProps) {
    const tItem = tProps.word[2];
    if (integerp(value(tItem))) {
      this.pCarrying = tItem;
      let tCarryItm;
      if (variableExists(`handitem.right.${this.pCarrying}`)) {
        tCarryItm = getVariable(`handitem.right.${this.pCarrying}`, "001");
      } else {
        tCarryItm = "001";
      }
      call(Symbol.for("doHandWorkRight"), this.pPartList, "drk");
      this.pPartList[this.pPartIndex["ri"]].setModel(tCarryItm);
      this.arrangeParts();
    }
  }

  action_carryf(tProps) {
    const tItem = tProps.word[2];
    if (integerp(value(tItem))) {
      this.pCarrying = tItem;
      let tCarryItm;
      if (variableExists(`handitem.right.${this.pCarrying}`)) {
        tCarryItm = getVariable(`handitem.right.${this.pCarrying}`, "001");
      } else {
        tCarryItm = "001";
      }
      call(Symbol.for("doHandWorkRight"), this.pPartList, "crr");
      this.pPartList[this.pPartIndex["ri"]].setModel(tCarryItm);
    }
  }

  action_eat(tProps) {
    const tItem = tProps.word[2];
    if (integerp(value(tItem))) {
      this.pCarrying = tItem;
      let tCarryItm;
      if (variableExists(`handitem.right.${this.pCarrying}`)) {
        tCarryItm = getVariable(`handitem.right.${this.pCarrying}`, "001");
      } else {
        tCarryItm = "001";
      }
      call(Symbol.for("doHandWorkRight"), this.pPartList, "drk");
      this.pPartList[this.pPartIndex["ri"]].setModel(tCarryItm);
    }
  }

  action_talk(tProps) {
    this.pTalking = 1;
  }

  action_gest(tProps) {
    if (this.pPeopleSize == "sh") {
      return;
    }
    const tList = list("ey", "fc");
    let tGesture = tProps.word[2];
    if (tGesture == "spr") {
      tGesture = "srp";
    }
    if (this.pMainAction == "lay") {
      tGesture = `l${tGesture.char[`1..2`]}`;
      call(Symbol.for("defineActMultiple"), this.pPartList, tGesture, tList);
    } else {
      call(Symbol.for("defineActMultiple"), this.pPartList, tGesture, tList);
      if (tGesture == "ohd") {
        defineAct(this.pPartList[this.pPartIndex["hd"]], tGesture);
        defineAct(this.pPartList[this.pPartIndex["hr"]], tGesture);
      }
    }
  }

  action_wave(tProps) {
    this.pWaving = 1;
  }

  action_ohd() {
    call(Symbol.for("defineActMultiple"), this.pPartList, "ohd", list("hd", "fc", "ey", "hr"));
    call(Symbol.for("doHandWorkRight"), this.pPartList, "ohd");
  }

  action_sleep() {
    this.pSleeping = 1;
  }
}
