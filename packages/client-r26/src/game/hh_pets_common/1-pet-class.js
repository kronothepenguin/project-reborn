export default class {
  pName;
  pClass;
  pCustom;
  pIDPrefix;
  pBuffer;
  pSprite;
  pMatteSpr;
  pMember;
  pShadowSpr;
  pShadowFix;
  pDefShadowMem;
  pPartList;
  pPartIndex;
  pFlipList;
  pUpdateRect;
  pDirection;
  pLocX;
  pLocY;
  pLocH;
  pLocFix;
  pXFactor;
  pYFactor;
  pHFactor;
  pScreenLoc;
  pStartLScreen;
  pDestLScreen;
  pRestingHeight;
  pAnimCounter;
  pMoveStart;
  pMoveTime;
  pEyesClosed;
  pSync;
  pChanges;
  pAlphaColor;
  pCanvasSize;
  pMainAction;
  pWaving;
  pMoving;
  pTalking;
  pSniffing;
  pGeometry;
  pInfoStruct;
  pCorrectLocZ;
  pPartClass;
  pOffsetList;
  pOffsetListSmall;
  pMemberNamePrefix;
  pPetDefinitions;
  pRace;

  construct() {
    this.pName = "";
    this.pIDPrefix = "";
    this.pPartList = list();
    this.pPartIndex = propList();
    this.pFlipList = [0, 1, 2, 3, 2, 1, 0, 7];
    this.pLocFix = point(0, -8);
    this.pUpdateRect = rect(0, 0, 0, 0);
    this.pScreenLoc = [0, 0, 0];
    this.pStartLScreen = [0, 0, 0];
    this.pDestLScreen = [0, 0, 0];
    this.pRestingHeight = 0.0;
    this.pAnimCounter = 0;
    this.pMoveStart = 0;
    this.pMoveTime = 500;
    this.pEyesClosed = 0;
    this.pSync = 1;
    this.pChanges = 1;
    this.pMainAction = "std";
    this.pWaving = 0;
    this.pMoving = 0;
    this.pSniffing = 0;
    this.pTalking = 0;
    this.pAlphaColor = rgb(255, 255, 255);
    this.pSync = 1;
    this.pDefShadowMem = member(0);
    this.pInfoStruct = propList();
    this.pGeometry = getThread(Symbol.for("room")).getInterface().getGeometry();
    this.pXFactor = this.pGeometry.pXFactor;
    this.pYFactor = this.pGeometry.pYFactor;
    this.pHFactor = this.pGeometry.pHFactor;
    this.pOffsetList = propList();
    this.pOffsetListSmall = propList();
    let tPetDEfText = member(getmemnum("pet.definitions")).text;
    tPetDEfText = replaceChunks(tPetDEfText, RETURN, "");
    this.pPetDefinitions = value(tPetDEfText);
    if (ilk(this.pPetDefinitions) != Symbol.for("propList")) {
      this.pPetDefinitions = propList();
      error(this, "Pet definitions has invalid data!", this.getID(), Symbol.for("construct"), Symbol.for("major"));
    }
    if (this.pXFactor == 32) {
      this.pMemberNamePrefix = "s_p_";
      this.pCorrectLocZ = 0;
    } else {
      this.pMemberNamePrefix = "p_";
      this.pCorrectLocZ = 1;
    }
    this.pPartClass = value(getThread(Symbol.for("room")).getComponent().getClassContainer().GET("petpart"));
    return 1;
  }

  deconstruct() {
    this.pGeometry = undefined;
    this.pPartList = list();
    this.pInfoStruct = propList();
    if (this.pSprite.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pSprite.spriteNum);
    }
    if (this.pMatteSpr.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pMatteSpr.spriteNum);
    }
    if (this.pShadowSpr.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pShadowSpr.spriteNum);
    }
    if (memberExists(this.getCanvasName())) {
      removeMember(this.getCanvasName());
    }
    this.pShadowSpr = undefined;
    this.pMatteSpr = undefined;
    this.pSprite = undefined;
    return 1;
  }

  define(tdata) {
    this.setup(tdata);
    if (!memberExists(this.getCanvasName())) {
      createMember(this.getCanvasName(), Symbol.for("bitmap"));
    }
    this.pMember = member(getmemnum(this.getCanvasName()));
    this.pMember.image = image(this.pCanvasSize[1], this.pCanvasSize[2], this.pCanvasSize[3]);
    this.pMember.regPoint = point(0, this.pMember.image.height + this.pCanvasSize[4]);
    this.pBuffer = this.pMember.image.duplicate();
    this.pSprite = sprite(reserveSprite(this.getID()));
    this.pSprite.castNum = this.pMember.number;
    this.pSprite.width = this.pMember.width;
    this.pSprite.height = this.pMember.height;
    this.pSprite.ink = 36;
    this.pMatteSpr = sprite(reserveSprite(this.getID()));
    this.pMatteSpr.castNum = this.pMember.number;
    this.pMatteSpr.ink = 8;
    this.pMatteSpr.blend = 0;
    this.pShadowSpr = sprite(reserveSprite(this.getID()));
    this.pShadowSpr.blend = 16;
    this.pShadowSpr.ink = 8;
    this.pShadowFix = 0;
    this.pDefShadowMem = member(getmemnum(this.pMemberNamePrefix + "std_sd_001_0_0"));
    let tTargetID = getThread(Symbol.for("room")).getInterface().getID();
    setEventBroker(this.pMatteSpr.spriteNum, this.getID());
    this.pMatteSpr.registerProcedure(Symbol.for("eventProcUserObj"), tTargetID, Symbol.for("mouseDown"));
    this.pMatteSpr.registerProcedure(Symbol.for("eventProcUserRollOver"), tTargetID, Symbol.for("mouseEnter"));
    this.pMatteSpr.registerProcedure(Symbol.for("eventProcUserRollOver"), tTargetID, Symbol.for("mouseLeave"));
    setEventBroker(this.pShadowSpr.spriteNum, this.getID());
    this.pShadowSpr.registerProcedure(Symbol.for("eventProcUserObj"), tTargetID, Symbol.for("mouseDown"));
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = numToChar(4);
    this.pInfoStruct[Symbol.for("name")] = item(2).of(this.getID());
    the.itemDelimiter = tDelim;
    this.pInfoStruct[Symbol.for("name")] = this.pName;
    this.pInfoStruct[Symbol.for("class")] = this.pClass;
    this.pInfoStruct[Symbol.for("custom")] = this.pCustom;
    this.pInfoStruct[Symbol.for("image")] = this.getPicture();
    return 1;
  }

  setup(tdata) {
    this.pName = tdata[Symbol.for("name")];
    this.pClass = tdata[Symbol.for("class")];
    this.pDirection = tdata[Symbol.for("direction")][1];
    this.pLocX = tdata[Symbol.for("x")];
    this.pLocY = tdata[Symbol.for("y")];
    this.pLocH = tdata[Symbol.for("h")];
    this.pRace = tdata[Symbol.for("figure")].word[1];
    this.pOffsetList = this.getOffsetList();
    this.pOffsetListSmall = this.getOffsetList(Symbol.for("small"));
    this.pCustom = getText("pet_race_" + this.pRace + "_" + tdata[Symbol.for("figure")].word[2], "");
    if (this.pName.includes(numToChar(4))) {
      this.pIDPrefix = this.pName.substring(0, this.pName.indexOf(numToChar(4)) + 1);
      this.pName = this.pName.substring(this.pName.indexOf(numToChar(4)) + 1);
    }
    this.pCanvasSize = [62, 62, 32, -18];
    if (!this.setPartLists(tdata[Symbol.for("figure")])) {
      return error(this, "Couldn't create part lists!", Symbol.for("setup"), Symbol.for("major"));
    }
    this.resetValues(this.pLocX, this.pLocY, this.pLocH, this.pDirection, this.pDirection);
    this.Refresh(this.pLocX, this.pLocY, this.pLocH);
    this.pSync = 0;
  }

  update() {
    this.pSync = !this.pSync;
    if (this.pSync) {
      this.prepare();
    } else {
      this.render();
    }
  }

  getWebID() {
    return 0;
  }

  setUserTypingStatus(tStatus) {
    nothing();
  }

  resetValues(tX, tY, tH, tDirHead, tDirBody) {
    this.pWaving = 0;
    this.pMoving = 0;
    this.pTalking = 0;
    this.pSniffing = 0;
    call(Symbol.for("reset"), this.pPartList);
    if (this.pCorrectLocZ) {
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(tX, tY, tH + this.pRestingHeight);
    } else {
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(tX, tY, tH);
    }
    this.pMainAction = "std";
    this.pLocX = tX;
    this.pLocY = tY;
    this.pLocH = tH;
    this.pRestingHeight = 0.0;
    call(Symbol.for("defineDir"), this.pPartList, tDirBody);
    if (tDirBody != this.pFlipList[tDirBody + 1]) {
      if (tDirBody != tDirHead) {
        switch (tDirHead) {
          case 4:
            tDirHead = 2;
            break;
          case 5:
            tDirHead = 1;
            break;
          case 6:
            tDirHead = 4;
            break;
          case 7:
            tDirHead = 5;
            break;
        }
      }
    }
    this.pPartList[this.pPartIndex["hd"]].defineDir(tDirHead);
    this.pDirection = tDirBody;
  }

  Refresh(tX, tY, tH, tDirHead, tDirBody) {
    this.arrangeParts();
    this.pChanges = 1;
  }

  select() {
    if (the.doubleClick) {
      if (connectionExists(getVariable("connection.info.id", Symbol.for("Info")))) {
        getConnection(getVariable("connection.info.id", Symbol.for("Info"))).send("GETPETSTAT", propList("string", this.pIDPrefix + this.pName));
      }
    }
    return 1;
  }

  getClass() {
    return "pet";
  }

  getName() {
    return this.pName;
  }

  setPartModel(tPart, tmodel) {
    if (voidp(this.pPartIndex[tPart])) {
      return undefined;
    }
    this.pPartList[this.pPartIndex[tPart]].setModel(tmodel);
  }

  setPartColor(tPart, tColor) {
    if (voidp(this.pPartIndex[tPart])) {
      return rgb(255, 199, 199);
    }
    this.pPartList[this.pPartIndex[tPart]].setColor(tColor);
  }

  getProperty(tPropID) {
    switch (tPropID) {
      case Symbol.for("loc"):
        return [this.pLocX, this.pLocY, this.pLocH];
      case Symbol.for("moving"):
        return this.pMoving;
      default:
        return 0;
    }
  }

  getCustom() {
    return this.pCustom;
  }

  getLocation() {
    return [this.pLocX, this.pLocY, this.pLocH];
  }

  getScrLocation() {
    return this.pScreenLoc;
  }

  getTileCenter() {
    return point(this.pScreenLoc[1] + (this.pXFactor / 2), this.pScreenLoc[2]);
  }

  getPartLocation(tPart) {
    return this.getTileCenter();
  }

  getDirection() {
    return this.pDirection;
  }

  getPartMember(tPart) {
    if (voidp(this.pPartIndex[tPart])) {
      return undefined;
    }
    return this.pPartList[this.pPartIndex[tPart]].getCurrentMember();
  }

  getPartColor(tPart) {
    if (voidp(this.pPartIndex[tPart])) {
      return rgb(255, 199, 199);
    }
    return this.pPartList[this.pPartIndex[tPart]].getColor();
  }

  getPicture(tImg) {
    if (voidp(tImg)) {
      let tCanvas = image(this.pCanvasSize[1], this.pCanvasSize[2], this.pCanvasSize[3]);
    } else {
      let tCanvas = tImg;
    }
    if (voidp(this.pInfoStruct[Symbol.for("image")])) {
      let tPartDefinition = list("tl", "bd", "hd");
      let tTempPartList = list();
      for (const tPartSymbol of tPartDefinition) {
        if (!voidp(this.pPartIndex[tPartSymbol])) {
          tTempPartList.append(this.pPartList[this.pPartIndex[tPartSymbol]]);
        }
      }
      call(Symbol.for("copyPicture"), tTempPartList, tCanvas);
    } else {
      tCanvas.copyPixels(this.pInfoStruct[Symbol.for("image")], tCanvas.rect, tCanvas.rect);
    }
    return this.flipImage(tCanvas);
  }

  getInfo() {
    return this.pInfoStruct;
  }

  getSprites() {
    return [this.pSprite, this.pShadowSpr, this.pMatteSpr];
  }

  closeEyes() {
    this.pPartList[this.pPartIndex["hd"]].defineAct("eyb");
    this.pEyesClosed = 1;
    this.pChanges = 1;
  }

  openEyes() {
    this.pPartList[this.pPartIndex["hd"]].defineAct("std");
    this.pEyesClosed = 0;
    this.pChanges = 1;
  }

  show() {
    this.pSprite.visible = 1;
    this.pMatteSpr.visible = 1;
    this.pShadowSpr.visible = 1;
  }

  hide() {
    this.pSprite.visible = 0;
    this.pMatteSpr.visible = 0;
    this.pShadowSpr.visible = 0;
  }

  draw(tRGB) {
    if (!ilk(tRGB, Symbol.for("color"))) {
      tRGB = rgb(255, 0, 0);
    }
    this.pMember.image.draw(this.pMember.image.rect, propList("shapeType", Symbol.for("rect"), "color", tRGB));
  }

  prepare() {
    this.pAnimCounter = (this.pAnimCounter + 1) % 4;
    if (this.pEyesClosed) {
      this.openEyes();
    } else {
      if (random(30) == 3) {
        this.closeEyes();
      }
    }
    if (this.pTalking && (random(3) > 1)) {
      this.pPartList[this.pPartIndex["hd"]].defineAct("spk");
      this.pChanges = 1;
    }
    if (this.pWaving) {
      this.pPartList[this.pPartIndex["tl"]].defineAct("wav");
      this.pChanges = 1;
    }
    if (this.pSniffing) {
      this.pPartList[this.pPartIndex["hd"]].defineAct("snf");
      this.pChanges = 1;
    }
    if (this.pMainAction == "scr") {
      this.pPartList[this.pPartIndex["bd"]].defineAct("scr");
      this.pChanges = 1;
    }
    if (this.pMainAction == "bnd") {
      this.pPartList[this.pPartIndex["bd"]].defineAct("bnd");
      this.pChanges = 1;
    }
    if (this.pMainAction == "jmp") {
      this.pPartList[this.pPartIndex["bd"]].defineAct("jmp");
      this.pChanges = 1;
    }
    if (this.pMainAction == "pla") {
      this.pPartList[this.pPartIndex["bd"]].defineAct("pla");
      this.pChanges = 1;
    }
    if (this.pMoving) {
      let tFactor = float(the.milliSeconds - this.pMoveStart) / this.pMoveTime;
      if (tFactor > 1.0) {
        tFactor = 1.0;
      }
      this.pScreenLoc = ((this.pDestLScreen - this.pStartLScreen) * tFactor) + this.pStartLScreen;
      this.pChanges = 1;
    }
  }

  render() {
    if (!this.pChanges) {
      return;
    }
    this.pChanges = 0;
    if (this.pShadowSpr.member != this.pDefShadowMem) {
      this.pShadowSpr.member = this.pDefShadowMem;
    }
    if ((this.pBuffer.width != this.pCanvasSize[1]) || (this.pBuffer.height != this.pCanvasSize[2])) {
      this.pMember.image = image(this.pCanvasSize[1], this.pCanvasSize[2], this.pCanvasSize[3]);
      this.pMember.regPoint = point(0, this.pCanvasSize[2] + this.pCanvasSize[4]);
      this.pSprite.width = this.pCanvasSize[1];
      this.pSprite.height = this.pCanvasSize[2];
      this.pMatteSpr.width = this.pCanvasSize[1];
      this.pMatteSpr.height = this.pCanvasSize[2];
      this.pBuffer = image(this.pCanvasSize[1], this.pCanvasSize[2], this.pCanvasSize[3]);
    }
    let tFlip = 0;
    tFlip = tFlip || (this.pFlipList[this.pDirection + 1] != this.pDirection);
    tFlip = tFlip || ((this.pDirection == 3) && (this.pPartList[this.pPartIndex["hd"]].pDirection == 4));
    tFlip = tFlip || ((this.pDirection == 7) && (this.pPartList[this.pPartIndex["hd"]].pDirection == 6));
    if (tFlip) {
      this.pMember.regPoint = point(this.pMember.image.width, this.pMember.regPoint[2]);
      this.pShadowFix = this.pXFactor;
      if (!this.pSprite.flipH) {
        this.pSprite.flipH = 1;
        this.pMatteSpr.flipH = 1;
        this.pShadowSpr.flipH = 1;
      }
    } else {
      this.pMember.regPoint = point(0, this.pMember.regPoint[2]);
      this.pShadowFix = 0;
      if (this.pSprite.flipH) {
        this.pSprite.flipH = 0;
        this.pMatteSpr.flipH = 0;
        this.pShadowSpr.flipH = 0;
      }
    }
    if (this.pCorrectLocZ) {
      let tOffZ = ((this.pLocH + this.pRestingHeight) * 1000) + 2;
    } else {
      let tOffZ = 2;
    }
    this.pSprite.locH = this.pScreenLoc[1];
    this.pSprite.locV = this.pScreenLoc[2];
    this.pSprite.locZ = this.pScreenLoc[3] + tOffZ;
    this.pMatteSpr.loc = this.pSprite.loc;
    this.pMatteSpr.locZ = this.pSprite.locZ + 1;
    this.pShadowSpr.loc = this.pSprite.loc + [this.pShadowFix, 0];
    this.pShadowSpr.locZ = this.pSprite.locZ - 3;
    this.pUpdateRect = rect(0, 0, 0, 0);
    this.pBuffer.fill(this.pBuffer.rect, this.pAlphaColor);
    call(Symbol.for("update"), this.pPartList);
    this.pMember.image.copyPixels(this.pBuffer, this.pUpdateRect, this.pUpdateRect);
  }

  reDraw() {
    this.pBuffer.fill(this.pBuffer.rect, this.pAlphaColor);
    call(Symbol.for("render"), this.pPartList);
    this.pMember.image.copyPixels(this.pBuffer, this.pBuffer.rect, this.pBuffer.rect);
  }

  setPartLists(tFigure) {
    let tAction = this.pMainAction;
    this.pPartList = list();
    let tPartDefinition = list("tl", "bd", "hd");
    if (tFigure.word.count < 3) {
      tFigure = "0 4 AA98EF";
    }
    let tRaceNum = tFigure.word[1];
    let tPalette = tFigure.word[2];
    if (tPalette.length < 2) {
      tPalette = "00" + tPalette;
    } else {
      if (tPalette.length < 3) {
        tPalette = "0" + tPalette;
      }
    }
    let tPaletteType = this.pPetDefinitions[this.pRace][Symbol.for("paletteid")];
    tPalette = `Palette ${tPaletteType} ${tPalette}`;
    let tColor = rgb(tFigure.word[3]);
    for (let i = 1; i <= tPartDefinition.count; i++) {
      let tPartSymbol = tPartDefinition[i];
      let tPartObj = createObject(Symbol.for("temp"), this.pPartClass);
      let tmodel = this.pPetDefinitions[this.pRace][Symbol.for("parts")][tPartSymbol];
      tPartObj.define(tPartSymbol, tmodel, tPalette, tColor, this.pDirection, tAction, this);
      this.pPartList.add(tPartObj);
    }
    this.pPartIndex = propList();
    for (let i = 1; i <= this.pPartList.count; i++) {
      this.pPartIndex[this.pPartList[i].pPart] = i;
    }
    return 1;
  }

  arrangeParts() {
    let tTailInd = this.pPartIndex["tl"];
    let tHeadInd = this.pPartIndex["hd"];
    let tBodyInd = this.pPartIndex["bd"];
    let tTail = this.pPartList[tTailInd];
    let tHead = this.pPartList[tHeadInd];
    let tBody = this.pPartList[tBodyInd];
    let tHeadDir = tHead.getDirection();
    if (tHeadDir == 7) {
      this.pPartList = [tHead, tBody, tTail];
      this.pPartIndex = propList("hd", 1, "bd", 2, "tl", 3);
    } else {
      if ((this.pDirection == 6) || (this.pDirection == 7) || (this.pDirection == 0)) {
        this.pPartList = [tBody, tHead, tTail];
        this.pPartIndex = propList("bd", 1, "hd", 2, "tl", 3);
      } else {
        this.pPartList = [tTail, tBody, tHead];
        this.pPartIndex = propList("tl", 1, "bd", 2, "hd", 3);
      }
    }
  }

  flipImage(tImg_a) {
    let tImg_b = image(tImg_a.width, tImg_a.height, tImg_a.depth);
    let tQuad = list(point(tImg_a.width, 0), point(0, 0), point(0, tImg_a.height), point(tImg_a.width, tImg_a.height));
    tImg_b.copyPixels(tImg_a, tQuad, tImg_a.rect);
    return tImg_b;
  }

  getOffsetList(tSize) {
    if (voidp(tSize)) {
      tSize = Symbol.for("large");
    }
    let tPetOffsetId = this.pPetDefinitions[this.pRace][Symbol.for("offsetid")];
    if (tSize == Symbol.for("large")) {
      let tListMemName = "offset." + tPetOffsetId + ".large";
    } else {
      let tListMemName = "offset." + tPetOffsetId + ".small";
    }
    if (!memberExists(tListMemName)) {
      return propList();
    }
    let tListText = member(getmemnum(tListMemName)).text;
    let tList = propList();
    let tAliasList = propList();
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "=";
    for (let tLineNo = 1; tLineNo <= tListText.line.count; tLineNo++) {
      let tLineText = tListText.line[tLineNo];
      if (!(tLineText.charAt(0) == "#")) {
        if (tLineText.item.count > 1) {
          let tKey = tLineText.item[1];
          let tValue = tLineText.item.slice(1);
          tKey = value(tKey);
          tValue = value(tValue);
          if (ilk(tValue) == Symbol.for("list")) {
            tList[tKey] = tValue;
            continue;
          }
          tAliasList[tKey] = tValue;
        }
      }
    }
    the.itemDelimiter = tDelim;
    for (let tItemNo = 1; tItemNo <= tAliasList.count; tItemNo++) {
      let tKey = tAliasList.getPropAt(tItemNo);
      let tAliasKey = tAliasList[tItemNo];
      if (tList.getaProp(tAliasKey) != undefined) {
        let tOffsetData = tList[tAliasKey];
        tList[tKey] = tOffsetData;
        continue;
      }
      error(this, "Invalid alias definition, no offset available: " + tValue, this.getID(), Symbol.for("getOffsetList"), Symbol.for("minor"));
    }
    return tList;
  }

  getCanvasName() {
    return `${this.pClass} ${this.pIDPrefix} ${this.pName} ${this.getID()} Canvas`;
  }

  action_mv(tProps) {
    this.pMainAction = "wlk";
    this.pMoving = 1;
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    let tloc = tProps.word[2];
    let tLocX = integer(tloc.item[1]);
    let tLocY = integer(tloc.item[2]);
    let tLocH = getLocalFloat(tloc.item[3]);
    the.itemDelimiter = tDelim;
    this.pStartLScreen = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH);
    this.pDestLScreen = this.pGeometry.getScreenCoordinate(tLocX, tLocY, tLocH);
    this.pMoveStart = the.milliSeconds;
    this.pPartList[this.pPartIndex["bd"]].defineAct("wlk");
  }

  action_sld(tProps) {
    this.pMoving = 1;
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    let tloc = tProps.word[2];
    let tLocX = integer(tloc.item[1]);
    let tLocY = integer(tloc.item[2]);
    let tLocH = getLocalFloat(tloc.item[3]);
    the.itemDelimiter = tDelim;
    this.pStartLScreen = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH + this.pRestingHeight);
    this.pDestLScreen = this.pGeometry.getScreenCoordinate(tLocX, tLocY, tLocH);
    this.pMoveStart = the.milliSeconds;
  }

  action_sit(tProps) {
    this.pMainAction = "sit";
    this.pPartList[this.pPartIndex["bd"]].defineAct("sit");
    if (this.pCorrectLocZ) {
      this.pRestingHeight = getLocalFloat(tProps.word[2]) - this.pLocH;
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH + this.pRestingHeight);
    } else {
      this.pRestingHeight = getLocalFloat(tProps.word[2]);
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pRestingHeight);
    }
  }

  action_snf() {
    this.pSniffing = 1;
    this.pPartList[this.pPartIndex["hd"]].defineAct("snf");
  }

  action_scr() {
    this.pMainAction = "scr";
    this.pPartList[this.pPartIndex["bd"]].defineAct("scr");
  }

  action_bnd() {
    this.pMainAction = "bnd";
    this.pPartList[this.pPartIndex["bd"]].defineAct("bnd");
  }

  action_lay(tProps) {
    this.pMainAction = "lay";
    this.pPartList[this.pPartIndex["bd"]].defineAct("lay");
    if (this.pCorrectLocZ) {
      this.pRestingHeight = getLocalFloat(tProps.word[2]) - this.pLocH;
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH + this.pRestingHeight);
    } else {
      this.pRestingHeight = getLocalFloat(tProps.word[2]);
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pRestingHeight);
    }
  }

  action_slp(tProps) {
    this.action_lay(tProps);
    this.pMainAction = "slp";
    this.pPartList[this.pPartIndex["hd"]].defineAct("slp");
  }

  action_jmp(tProps) {
    this.pMainAction = "jmp";
    this.pPartList[this.pPartIndex["bd"]].defineAct("jmp");
  }

  action_ded(tProps) {
    this.pMainAction = "ded";
    this.pPartList[this.pPartIndex["hd"]].defineAct("ded");
    this.pPartList[this.pPartIndex["bd"]].defineAct("ded");
    this.pPartList[this.pPartIndex["tl"]].defineAct("ded");
  }

  action_eat(tProps) {
    this.pPartList[this.pPartIndex["hd"]].defineAct("eat");
  }

  action_beg(tProps) {
    this.pMainAction = "beg";
    this.pPartList[this.pPartIndex["bd"]].defineAct("beg");
    this.pPartList[this.pPartIndex["hd"]].defineAct("beg");
  }

  action_pla(tProps) {
    this.pMainAction = "pla";
    this.pPartList[this.pPartIndex["bd"]].defineAct("pla");
  }

  action_rdy(tProps) {
    this.pMainAction = "rdy";
    this.pPartList[this.pPartIndex["bd"]].defineAct("rdy");
  }

  action_talk(tProps) {
    this.pTalking = 1;
  }

  action_wav(tProps) {
    this.pWaving = 1;
    this.pPartList[this.pPartIndex["tl"]].defineAct("wav");
  }

  action_gst(tProps) {
    let tGesture = tProps.word[2];
    this.pPartList[this.pPartIndex["hd"]].defineAct(tGesture);
    switch (tGesture) {
      case "sml":
      case "agr":
      case "sad":
      case "puz":
        this.pPartList[this.pPartIndex["tl"]].defineAct(tGesture);
        break;
    }
  }
}
