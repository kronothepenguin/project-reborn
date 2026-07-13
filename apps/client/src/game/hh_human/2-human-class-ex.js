export default class {
  pName;
  pClass;
  pCustom;
  pSex;
  pModState;
  pCtrlType;
  pBadges;
  pID;
  pWebID;
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
  pLastDir;
  pHeadDir;
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
  pAnimating;
  pSwim;
  pCurrentAnim;
  pGeometry;
  pExtraObjs;
  pExtraObjsActive;
  pInfoStruct;
  pCorrectLocZ;
  pPartClass;
  pQueuesWithObj;
  pPreviousLoc;
  pBaseLocZ;
  pGroupId;
  pStatusInGroup;
  pXP;
  pFrozenAnimFrame;
  pPartListSubSet;
  pPartListFull;
  pPartActionList;
  pPartOrderOld;
  pLeftHandUp;
  pRightHandUp;
  pRawFigure;
  pTypingSprite;
  pUserIsTyping;
  pUserTypingStartTime;
  pCanvasName;

  construct() {
    this.pFrozenAnimFrame = 0;
    this.pID = 0;
    this.pWebID = VOID;
    this.pName = EMPTY;
    this.pPartList = list();
    this.pPartIndex = propList();
    this.pFlipList = list(0, 1, 2, 3, 2, 1, 0, 7);
    this.pLocFix = point(0, 0);
    this.pUpdateRect = rect(0, 0, 0, 0);
    this.pScreenLoc = list(0, 0, 0);
    this.pStartLScreen = list(0, 0, 0);
    this.pDestLScreen = list(0, 0, 0);
    this.pPreviousLoc = list(0, 0, 0);
    this.pRestingHeight = 0.0;
    this.pAnimCounter = 0;
    this.pMoveStart = 0;
    this.pMoveTime = 500;
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
    this.pTrading = 0;
    this.pCtrlType = 0;
    this.pAnimating = 0;
    this.pSwim = 0;
    this.pBadges = propList();
    this.pCurrentAnim = EMPTY;
    this.pAlphaColor = rgb(255, 255, 255);
    this.pSync = 1;
    this.pColors = propList();
    this.pModState = 0;
    this.pExtraObjs = propList();
    this.pExtraObjsActive = propList();
    this.pDefShadowMem = member(0);
    this.pInfoStruct = propList();
    this.pQueuesWithObj = 0;
    this.pXP = 0;
    this.pGeometry = getThread(Symbol.for("room")).getInterface().getGeometry();
    this.pXFactor = this.pGeometry.pXFactor;
    this.pYFactor = this.pGeometry.pYFactor;
    this.pHFactor = this.pGeometry.pHFactor;
    this.pCorrectLocZ = 0;
    this.pPartClass = value(getThread(Symbol.for("room")).getComponent().getClassContainer().GET("bodypart"));
    this.pGroupId = VOID;
    this.pStatusInGroup = VOID;
    this.pBaseLocZ = 0;
    this.pPeopleSize = getVariable("human.size.64");
    this.pRawFigure = propList();
    this.pPartOrderOld = EMPTY;
    this.pUserIsTyping = 0;
    this.pUserTypingStartTime = 0;
    this.pCanvasName = `Canvas:${getUniqueID()}`;
    const tSubSetList = list("figure", "head", "speak", "gesture", "eye", "handRight", "handLeft", "walk", "sit", "itemRight");
    this.pPartListSubSet = propList();
    for (const tSubSet of tSubSetList) {
      const tSetName = `human.partset.${tSubSet}.${this.pPeopleSize}`;
      if (!variableExists(tSetName)) {
        this.pPartListSubSet[tSubSet] = list();
        error(this, `${tSetName} not found!`, Symbol.for("construct"), Symbol.for("major"));
        continue;
      }
      this.pPartListSubSet[tSubSet] = getVariableValue(tSetName);
    }
    this.pPartListFull = getVariableValue(`human.parts.${this.pPeopleSize}`);
    if (ilk(this.pPartListFull) != Symbol.for("list")) {
      this.pPartListFull = list();
    }
    this.pPartActionList = VOID;
    this.pLeftHandUp = 0;
    this.pRightHandUp = 0;
    return 1;
  }

  deconstruct() {
    this.pGeometry = VOID;
    this.pPartList = list();
    this.pInfoStruct = propList();
    if (!voidp(this.pSprite)) {
      releaseSprite(this.pSprite.spriteNum);
    }
    if (!voidp(this.pMatteSpr)) {
      releaseSprite(this.pMatteSpr.spriteNum);
    }
    if (!voidp(this.pShadowSpr)) {
      releaseSprite(this.pShadowSpr.spriteNum);
    }
    if (!voidp(this.pTypingSprite)) {
      releaseSprite(this.pTypingSprite.spriteNum);
    }
    if (memberExists(this.getCanvasName())) {
      removeMember(this.getCanvasName());
    }
    call(Symbol.for("deconstruct"), this.pExtraObjs);
    this.pExtraObjsActive = propList();
    this.pExtraObjs = VOID;
    this.pShadowSpr = VOID;
    this.pMatteSpr = VOID;
    this.pSprite = VOID;
    return 1;
  }

  define(tdata) {
    this.setup(tdata);
    if (!memberExists(this.getCanvasName())) {
      createMember(this.getCanvasName(), Symbol.for("bitmap"));
    }
    const tSize = this.pCanvasSize[Symbol.for("std")];
    this.pMember = member(getmemnum(this.getCanvasName()));
    this.pMember.image = image(tSize[1], tSize[2], tSize[3]);
    this.pMember.regPoint = point(0, this.pMember.image.height + tSize[4]);
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
    this.pShadowFix = 0;
    this.pDefShadowMem = member(getmemnum(`${this.pPeopleSize}_std_sd_1_0_0`));
    const tTargetID = getThread(Symbol.for("room")).getInterface().getID();
    setEventBroker(this.pMatteSpr.spriteNum, this.getID());
    this.pMatteSpr.registerProcedure(Symbol.for("eventProcUserObj"), tTargetID, Symbol.for("mouseDown"));
    this.pMatteSpr.registerProcedure(Symbol.for("eventProcUserRollOver"), tTargetID, Symbol.for("mouseEnter"));
    this.pMatteSpr.registerProcedure(Symbol.for("eventProcUserRollOver"), tTargetID, Symbol.for("mouseLeave"));
    this.pShadowSpr = sprite(reserveSprite(this.getID()));
    if (ilk(this.pShadowSpr) == Symbol.for("sprite")) {
      this.pShadowSpr.blend = 16;
      this.pShadowSpr.ink = 8;
      setEventBroker(this.pShadowSpr.spriteNum, this.getID());
      this.pShadowSpr.registerProcedure(Symbol.for("eventProcUserObj"), tTargetID, Symbol.for("mouseDown"));
    }
    this.pInfoStruct[Symbol.for("name")] = this.pName;
    this.pInfoStruct[Symbol.for("class")] = this.pClass;
    this.pInfoStruct[Symbol.for("custom")] = this.pCustom;
    this.pInfoStruct[Symbol.for("image")] = this.getPicture();
    this.pInfoStruct[Symbol.for("ctrl")] = "furniture";
    this.pInfoStruct[Symbol.for("badges")] = propList();
    const tThread = getThread(Symbol.for("room"));
    if (tThread != 0) {
      const tInterface = tThread.getInterface();
      if (tInterface != 0) {
        const tViz = tThread.getInterface().getRoomVisualizer();
        if (tViz != 0) {
          const tPart = tViz.getPartAtLocation(tdata[Symbol.for("x")], tdata[Symbol.for("y")], [Symbol.for("wallleft"), Symbol.for("wallright")]);
          if (!(tPart == 0)) {
            this.pBaseLocZ = tPart[Symbol.for("locZ")] - 1000;
          }
        }
      }
    }
    return 1;
  }

  changeFigureAndData(tdata) {
    this.pSex = tdata[Symbol.for("sex")];
    this.pCustom = tdata[Symbol.for("custom")];
    const tmodels = tdata[Symbol.for("figure")];
    this.setPartLists(tmodels);
    this.pPartOrderOld = EMPTY;
    this.arrangeParts();
    const tAnimating = this.pAnimating;
    this.resumeAnimation();
    this.pAnimating = tAnimating;
    this.pChanges = 1;
    this.render(1);
    this.reDraw();
    this.pInfoStruct[Symbol.for("image")] = this.getPicture();
  }

  setup(tdata) {
    this.pName = tdata[Symbol.for("name")];
    this.pClass = tdata[Symbol.for("class")];
    this.pCustom = tdata[Symbol.for("custom")];
    this.pSex = tdata[Symbol.for("sex")];
    this.pDirection = tdata[Symbol.for("direction")][1];
    this.pHeadDir = this.pDirection;
    this.pLastDir = this.pDirection;
    this.pLocX = tdata[Symbol.for("x")];
    this.pLocY = tdata[Symbol.for("y")];
    this.pLocH = tdata[Symbol.for("h")];
    this.pBadges = tdata[Symbol.for("badge")];
    this.pGroupId = tdata[Symbol.for("groupID")];
    this.pStatusInGroup = tdata[Symbol.for("groupstatus")];
    this.pXP = tdata.getaProp(Symbol.for("xp"));
    if (!voidp(tdata.getaProp(Symbol.for("webID")))) {
      this.pWebID = tdata[Symbol.for("webID")];
    }
    this.pPeopleSize = getVariable(`human.size.${integer(this.pXFactor)}`);
    if (!this.pPeopleSize) {
      error(this, "People size not found, using default!", Symbol.for("setup"), Symbol.for("minor"));
      this.pPeopleSize = "h";
    }
    this.pCorrectLocZ = this.pPeopleSize == "h";
    this.pCanvasSize = value(getVariable(`human.canvas.${this.pPeopleSize}`));
    if (!this.pCanvasSize) {
      error(this, "Canvas size not found, using default!", Symbol.for("setup"), Symbol.for("minor"));
      this.pCanvasSize = propList("std", list(64, 102, 32, -10), "lay", list(89, 102, 32, -8));
    }
    if (!this.setPartLists(tdata[Symbol.for("figure")])) {
      return error(this, "Couldn't create part lists!", Symbol.for("setup"), Symbol.for("major"));
    }
    this.resetValues(this.pLocX, this.pLocY, this.pLocH, this.pHeadDir, this.pDirection);
    this.Refresh(this.pLocX, this.pLocY, this.pLocH, this.pDirection);
    this.pSync = 0;
  }

  update() {
    if (this.pQueuesWithObj) {
      this.prepare();
      this.render();
    } else {
      this.pSync = !this.pSync;
      if (this.pSync) {
        this.prepare();
      } else {
        this.render();
      }
    }
  }

  resetValues(tX, tY, tH, tDirHead, tDirBody) {
    if (this.pQueuesWithObj && (this.pPreviousLoc == list(tX, tY, tH))) {
      return 1;
    }
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
    this.pQueuesWithObj = 0;
    for (let i = 1; i <= this.pExtraObjsActive.count; i++) {
      this.pExtraObjsActive[i] = 0;
    }
    this.pLocFix = point(-1, 2);
    call(Symbol.for("reset"), this.pPartList);
    if (this.pGeometry != VOID) {
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(tX, tY, tH);
    }
    this.pLocX = tX;
    this.pLocY = tY;
    this.pLocH = tH;
    this.pRestingHeight = 0.0;
    this.pDirection = tDirBody;
    this.pHeadDir = tDirHead;
    this.resetAction();
    if (this.pExtraObjs.count > 0) {
      call(Symbol.for("Refresh"), this.pExtraObjs);
    }
  }

  Refresh(tX, tY, tH) {
    if (this.pQueuesWithObj && (this.pPreviousLoc == list(tX, tY, tH))) {
      return 1;
    }
    if ((this.pDancing > 0) || (this.pMainAction == "lay")) {
      this.pHeadDir = this.pDirection;
    }
    call(Symbol.for("defineDir"), this.pPartList, this.pDirection);
    call(Symbol.for("defineDirMultiple"), this.pPartList, this.pHeadDir, this.pPartListSubSet["head"]);
    this.arrangeParts();
    let i = 1;
    while (i <= this.pExtraObjsActive.count) {
      if (this.pExtraObjsActive[i] == 0) {
        this.pExtraObjs[i].deconstruct();
        this.pExtraObjs.deleteAt(i);
        this.pExtraObjsActive.deleteAt(i);
        continue;
      }
      i = i + 1;
    }
    this.pChanges = 1;
  }

  select() {
    return 1;
  }

  getName() {
    return this.pName;
  }

  getClass() {
    return "user";
  }

  getCustom() {
    return this.pCustom;
  }

  getLocation() {
    return list(this.pLocX, this.pLocY, this.pLocH);
  }

  getScrLocation() {
    return this.pScreenLoc;
  }

  getTileCenter() {
    return point(this.pScreenLoc[1] + (this.pXFactor / 2), this.pScreenLoc[2]);
  }

  getPartLocation(tPart) {
    if (voidp(this.pPartIndex[tPart])) {
      return VOID;
    }
    const tPartLoc = this.pPartList[this.pPartIndex[tPart]].getLocation();
    let tloc;
    if (this.pMainAction != "lay") {
      tloc = this.pSprite.loc + tPartLoc;
    } else {
      tloc = point(this.pSprite.rect[1] + (this.pSprite.width / 2), this.pSprite.rect[2] + (this.pSprite.height / 2));
    }
    return tloc;
  }

  getDirection() {
    return this.pDirection;
  }

  getPartColor(tPart) {
    if (voidp(this.pPartIndex[tPart])) {
      return VOID;
    }
    return this.pPartList[this.pPartIndex[tPart]].getColor();
  }

  getPicture(tImg) {
    return this.getPartialPicture(Symbol.for("Full"), tImg, 4, "h");
  }

  getPartialPicture(tPartList, tImg, tDirection, tPeopleSize) {
    if (tPartList.ilk != Symbol.for("list")) {
      let tPartName = EMPTY;
      if (tPartList == Symbol.for("head")) {
        tPartList = this.pPartListSubSet["head"];
      } else {
        if (tPartList == Symbol.for("Full")) {
          tPartName = `human.parts.${this.pPeopleSize}`;
        } else {
          if (tPartList == Symbol.for("swimmer")) {
            tPartName = `swimmer.parts.${this.pPeopleSize}`;
          }
        }
        if (variableExists(tPartName)) {
          tPartList = value(getVariable(tPartName));
        }
      }
      if (tPartList.ilk != Symbol.for("list")) {
        return tImg;
      }
    }
    let tCanvas;
    if (voidp(tImg)) {
      tCanvas = image(64, 102, 32);
    } else {
      tCanvas = tImg;
    }
    if (voidp(tDirection)) {
      tDirection = this.pDirection;
    }
    if (voidp(tPeopleSize)) {
      tPeopleSize = this.pPeopleSize;
    }
    const tDirData = `.${tDirection}`;
    const tTempPartList = list();
    const tPartOrder = `human.parts.${this.pPeopleSize}${tDirData}`;
    if (!variableExists(tPartOrder)) {
      error(this, `No human part order found ${tPartOrder}`, Symbol.for("getPartialPicture"), Symbol.for("major"));
      for (let i = 1; i <= this.pPartIndex.count; i++) {
        const tPartSymbol = this.pPartIndex.getPropAt(i);
        if (tPartList.findPos(tPartSymbol) > 0) {
          tTempPartList.append(this.pPartList[this.pPartIndex[tPartSymbol]]);
        }
      }
    } else {
      const tPartDefinition = getVariableValue(tPartOrder);
      for (const tPartSymbol of tPartDefinition) {
        if (!voidp(this.pPartIndex[tPartSymbol])) {
          if (tPartList.findPos(tPartSymbol) > 0) {
            tTempPartList.append(this.pPartList[this.pPartIndex[tPartSymbol]]);
          }
        }
      }
    }
    call(Symbol.for("copyPicture"), tTempPartList, tCanvas, tDirection, tPeopleSize);
    return tCanvas;
  }

  getInfo() {
    if (this.pCtrlType == EMPTY) {
      this.pInfoStruct[Symbol.for("ctrl")] = "furniture";
    } else {
      this.pInfoStruct[Symbol.for("ctrl")] = this.pCtrlType;
    }
    this.pInfoStruct[Symbol.for("badges")] = this.pBadges;
    this.pInfoStruct[Symbol.for("groupID")] = this.pGroupId;
    let tPrefix;
    if (this.pCustom == EMPTY) {
      tPrefix = EMPTY;
    } else {
      tPrefix = `${this.pCustom}${RETURN}${RETURN}`;
    }
    if (this.pTrading) {
      this.pInfoStruct[Symbol.for("custom")] = `${tPrefix}${getText("human_trading", "Trading")}`;
    } else {
      if (this.pCarrying != 0) {
        this.pInfoStruct[Symbol.for("custom")] = `${tPrefix}${getText("human_carrying", "Carrying:")} ${this.pCarrying}`;
      } else {
        this.pInfoStruct[Symbol.for("custom")] = this.pCustom;
      }
    }
    this.pInfoStruct.setaProp(Symbol.for("xp"), this.pXP);
    return this.pInfoStruct;
  }

  getWebID() {
    return this.pWebID;
  }

  getSprites() {
    if (ilk(this.pShadowSpr) == Symbol.for("sprite")) {
      return list(this.pSprite, this.pShadowSpr, this.pMatteSpr);
    } else {
      return list(this.pSprite, this.pMatteSpr);
    }
  }

  getProperty(tPropID) {
    switch (tPropID) {
      case Symbol.for("dancing"):
        return this.pDancing;
      case Symbol.for("carrying"):
        return this.pCarrying;
      case Symbol.for("loc"):
        return list(this.pLocX, this.pLocY, this.pLocH);
      case Symbol.for("mainAction"):
        return this.pMainAction;
      case Symbol.for("moving"):
        return this.pMoving;
      case Symbol.for("badges"):
        return this.pBadges;
      case Symbol.for("swimming"):
        return this.pSwim;
      case Symbol.for("groupID"):
        return this.pGroupId;
      case Symbol.for("groupstatus"):
        return this.pStatusInGroup;
      case Symbol.for("typing"):
        return this.pUserIsTyping;
      case Symbol.for("peoplesize"):
        return this.pPeopleSize;
      case Symbol.for("locZ"):
        if (this.pSprite.ilk == Symbol.for("sprite")) {
          return this.pSprite.locZ;
        }
        break;
      default:
        return 0;
    }
  }

  setProperty(tPropID, tValue) {
    switch (tPropID) {
      case Symbol.for("groupID"):
        this.pGroupId = tValue;
        break;
      case Symbol.for("groupstatus"):
        this.pStatusInGroup = tValue;
        break;
      default:
        return 0;
    }
  }

  setUserTypingStatus(tValue) {
    if (tValue == 1) {
      if (ilk(this.pTypingSprite) != Symbol.for("sprite")) {
        this.pTypingSprite = sprite(reserveSprite(this.getID()));
      }
      if (ilk(this.pTypingSprite) == Symbol.for("sprite")) {
        if (this.pPeopleSize == "sh") {
          this.pTypingSprite.member = getMember("chat_typing_bubble_small");
        } else {
          this.pTypingSprite.member = getMember("chat_typing_bubble");
        }
        this.pTypingSprite.ink = 8;
        this.updateTypingSpriteLoc();
      }
      this.pUserTypingStartTime = the.milliSeconds;
    } else {
      if (ilk(this.pTypingSprite) == Symbol.for("sprite")) {
        releaseSprite(this.pTypingSprite.spriteNum);
        this.pTypingSprite = VOID;
        this.pUserTypingStartTime = 0;
      }
    }
  }

  updateTypingSpriteLoc() {
    if ((ilk(this.pTypingSprite) == Symbol.for("sprite")) && (ilk(this.pSprite) == Symbol.for("sprite"))) {
      let tOffset = point(57, -75);
      const tOffsetLocZ = 30;
      if (this.pPeopleSize == "sh") {
        tOffset = point(33, -40);
      }
      this.pTypingSprite.loc = this.pSprite.loc + tOffset;
      this.pTypingSprite.visible = this.pSprite.visible;
      this.pTypingSprite.locZ = this.pSprite.locZ + tOffsetLocZ;
    }
  }

  getPartCarrying(tPart) {
    if (this.pPartListSubSet["handRight"].findPos(tPart) && this.getProperty(Symbol.for("carrying"))) {
      return 1;
    }
    return 0;
  }

  isInSwimsuit() {
    return 0;
  }

  closeEyes() {
    if (this.pMainAction == "lay") {
      this.definePartListAction(this.pPartListSubSet["eye"], "ley");
    } else {
      this.definePartListAction(this.pPartListSubSet["eye"], "eyb");
    }
    this.pEyesClosed = 1;
    this.pChanges = 1;
  }

  openEyes() {
    if (this.pMainAction == "lay") {
      this.definePartListAction(this.pPartListSubSet["eye"], "lay");
    } else {
      this.definePartListAction(this.pPartListSubSet["eye"], "std");
    }
    this.pEyesClosed = 0;
    this.pChanges = 1;
  }

  startAnimation(tMemName) {
    if (tMemName == "dance.2") {
      this.pLeftHandUp = 1;
    }
    if (tMemName == this.pCurrentAnim) {
      return 0;
    }
    if (!memberExists(tMemName)) {
      return 0;
    }
    const tmember = member(getmemnum(tMemName));
    const tList = tmember.text;
    const tTempDelim = the.itemDelimiter;
    the.itemDelimiter = "/";
    for (let i = 1; i <= tList.line.count; i++) {
      const tPart = tList.line[i].item[1];
      const tAnim = tList.line[i].item[2];
      call(Symbol.for("setAnimation"), this.pPartList, tPart, tAnim);
    }
    the.itemDelimiter = tTempDelim;
    this.pAnimating = 1;
    this.pCurrentAnim = tMemName;
  }

  stopAnimation() {
    this.pAnimating = 0;
    this.pCurrentAnim = EMPTY;
    call(Symbol.for("remAnimation"), this.pPartList);
  }

  resumeAnimation() {
    const tMemName = this.pCurrentAnim;
    this.pCurrentAnim = EMPTY;
    this.startAnimation(tMemName);
  }

  show() {
    this.pSprite.visible = 1;
    this.pMatteSpr.visible = 1;
    if (ilk(this.pShadowSpr) == Symbol.for("sprite")) {
      this.pShadowSpr.visible = 1;
    }
    this.updateTypingSpriteLoc();
  }

  hide() {
    this.pSprite.visible = 0;
    this.pMatteSpr.visible = 0;
    if (ilk(this.pShadowSpr) == Symbol.for("sprite")) {
      this.pShadowSpr.visible = 0;
    }
    this.updateTypingSpriteLoc();
  }

  draw(tRGB) {
    if (!ilk(tRGB, Symbol.for("color"))) {
      tRGB = rgb(255, 0, 0);
    }
    this.pMember.image.draw(this.pMember.image.rect, propList("shapeType", Symbol.for("rect"), "color", tRGB));
  }

  prepare() {
    if (!this.pFrozenAnimFrame) {
      this.pAnimCounter = (this.pAnimCounter + 1) % 4;
    } else {
      this.pAnimCounter = this.pFrozenAnimFrame - 1;
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
    if (this.pMoving) {
      const tFactor = float(the.milliSeconds - this.pMoveStart) / this.pMoveTime;
      if (tFactor > 1.0) {
        tFactor = 1.0;
      }
      this.pScreenLoc = ((this.pDestLScreen - this.pStartLScreen) * tFactor) + this.pStartLScreen;
      this.pChanges = 1;
    }
    if (this.pWaving && (this.pMainAction != "lay")) {
      this.definePartListAction(this.pPartListSubSet["handLeft"], "wav");
      this.pChanges = 1;
    }
    if (this.pDancing) {
      this.pAnimating = 1;
      this.pChanges = 1;
    }
    const tTimeNow = the.milliSeconds;
    const tMaxTypingTime = 30000;
    if (((tTimeNow - this.pUserTypingStartTime) > tMaxTypingTime) && (this.pUserTypingStartTime != 0)) {
      this.pUserTypingStartTime = 0;
      this.setUserTypingStatus(0);
    }
  }

  render(tForceUpdate) {
    call(Symbol.for("update"), this.pExtraObjs);
    if (!this.pChanges) {
      return;
    }
    let tSkipFreq;
    if (this.pPeopleSize == "sh") {
      tSkipFreq = 4;
    } else {
      tSkipFreq = 5;
    }
    if ((random(tSkipFreq) == 2) && !this.pMoving && !tForceUpdate) {
      call(Symbol.for("skipAnimationFrame"), this.pPartList);
      return 1;
    }
    this.pChanges = 0;
    let tSize;
    if (this.pMainAction == "lay") {
      tSize = this.pCanvasSize[Symbol.for("lay")];
    } else {
      tSize = this.pCanvasSize[Symbol.for("std")];
    }
    if (ilk(this.pShadowSpr) == Symbol.for("sprite")) {
      if (this.pMainAction == "sit") {
        this.pShadowSpr.castNum = getmemnum(`${this.pPeopleSize}_sit_sd_1_${this.pFlipList[this.pDirection + 1]}_0`);
      } else {
        if (this.pMainAction == "lay") {
          this.pShadowSpr.castNum = 0;
          this.pShadowFix = 0;
        } else {
          if (this.pShadowSpr.member != this.pDefShadowMem) {
            this.pShadowSpr.member = this.pDefShadowMem;
          }
        }
      }
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
    this.pMember.regPoint = point(0, this.pMember.regPoint[2]);
    this.pShadowFix = 0;
    if (this.pSprite.flipH) {
      this.pSprite.flipH = 0;
      this.pMatteSpr.flipH = 0;
    }
    if (ilk(this.pShadowSpr) == Symbol.for("sprite")) {
      this.pShadowSpr.flipH = 0;
    }
    let tOffZ;
    if (this.pCorrectLocZ) {
      tOffZ = ((this.pLocH + this.pRestingHeight) * 1000) + 2;
    } else {
      tOffZ = 2;
    }
    this.pSprite.locH = this.pScreenLoc[1];
    this.pSprite.locV = this.pScreenLoc[2];
    this.pMatteSpr.loc = this.pSprite.loc;
    if (ilk(this.pShadowSpr) == Symbol.for("sprite")) {
      this.pShadowSpr.loc = this.pSprite.loc + list(this.pShadowFix, 0);
    }
    if (this.pBaseLocZ != 0) {
      this.pSprite.locZ = this.pBaseLocZ;
    } else {
      this.pSprite.locZ = this.pScreenLoc[3] + tOffZ + this.pBaseLocZ;
    }
    this.pMatteSpr.locZ = this.pSprite.locZ + 1;
    if (ilk(this.pShadowSpr) == Symbol.for("sprite")) {
      this.pShadowSpr.locZ = this.pSprite.locZ - 3;
    }
    this.updateTypingSpriteLoc();
    this.pBuffer.fill(this.pBuffer.rect, this.pAlphaColor);
    for (const tPart of this.pPartList) {
      let tRectMod = list(0, 0, 0, 0);
      if (tPart.pPart == "ey") {
        if (this.pTalking) {
          if ((this.pMainAction != "lay") && ((this.pAnimCounter % 2) == 0)) {
            tRectMod = list(0, -1, 0, -1);
          }
        }
      }
      tPart.update(tForceUpdate, tRectMod);
    }
    this.pMember.image.copyPixels(this.pBuffer, this.pUpdateRect, this.pUpdateRect);
    this.pUpdateRect = rect(0, 0, 0, 0);
  }

  reDraw() {
    this.pBuffer.fill(this.pBuffer.rect, this.pAlphaColor);
    call(Symbol.for("render"), this.pPartList);
    this.pMember.image.copyPixels(this.pBuffer, this.pBuffer.rect, this.pBuffer.rect);
  }

  getClearedFigurePartList(tmodels) {
    return this.getSpecificClearedFigurePartList(tmodels, this.getPartListNameBase());
  }

  getSpecificClearedFigurePartList(tmodels, tListName) {
    const tPartList = getVariableValue(`${tListName}.${this.pPeopleSize}`);
    if (tPartList.ilk != Symbol.for("list")) {
      return list();
    }
    const tPartListLegal = tPartList.duplicate();
    for (const tPart of this.pPartListSubSet["figure"]) {
      const tPos = tPartList.findPos(tPart);
      if (tPos > 0) {
        tPartList.deleteAt(tPos);
      }
    }
    for (let i = 1; i <= tmodels.count; i++) {
      const tPartName = tmodels.getPropAt(i);
      if ((tPartList.findPos(tPartName) == 0) && (tPartListLegal.findPos(tPartName) > 0)) {
        tPartList.add(tPartName);
      }
    }
    return tPartList;
  }

  getRawFigure() {
    return this.pRawFigure;
  }

  setPartLists(tmodels) {
    if (voidp(this.pPartActionList)) {
      this.resetAction();
    }
    tmodels = tmodels.duplicate();
    this.pRawFigure = tmodels;
    const tPartDefinition = this.getClearedFigurePartList(tmodels);
    const tCurrentPartList = propList();
    for (let i = this.pPartList.count; i >= 1; i--) {
      const tPartObj = this.pPartList[i];
      const tPartType = tPartObj.pPart;
      if ((tPartDefinition.findPos(tPartType) == 0) && this.pPartListSubSet["figure"].findPos(tPartType)) {
        this.pPartList[i].clearGraphics();
        this.pPartList.deleteAt(i);
        continue;
      }
      tCurrentPartList.addProp(tPartType, tPartObj);
    }
    this.pPartIndex = propList();
    this.pColors = propList();
    let tFlipList = getVariable("human.parts.flipList");
    if (ilk(tFlipList) != Symbol.for("propList")) {
      tFlipList = propList();
    }
    let tAnimationList = getVariable("human.parts.animationList");
    if (ilk(tAnimationList) != Symbol.for("propList")) {
      tAnimationList = propList();
    }
    for (let i = 1; i <= tPartDefinition.count; i++) {
      const tPartSymbol = tPartDefinition[i];
      const tmodel = propList();
      tmodel["model"] = list();
      tmodel["color"] = list();
      if (!voidp(tmodels[tPartSymbol])) {
        for (let j = 1; j <= tmodels.count; j++) {
          if (tmodels.getPropAt(j) == tPartSymbol) {
            tmodel["model"].add(tmodels[j]["model"]);
            tmodel["color"].add(tmodels[j]["color"]);
          }
        }
      }
      for (let j = 1; j <= tmodel["color"].count; j++) {
        let tColor = tmodel["color"][j];
        if (voidp(tColor)) {
          tColor = rgb("EEEEEE");
        }
        if (stringp(tColor)) {
          tColor = value(`rgb(${tColor})`);
        }
        if (tColor.ilk != Symbol.for("color")) {
          tColor = rgb("EEEEEE");
        }
        if ((tColor.red + tColor.green + tColor.blue) > (238 * 3)) {
          tColor = rgb("EEEEEE");
        }
        tmodel["color"][j] = tColor;
      }
      const tFlipPart = tFlipList[tPartSymbol];
      let tAction = this.pPartActionList[tPartSymbol];
      if (voidp(tAction)) {
        tAction = "std";
        error(this, `Missing action for part ${tPartSymbol}`, Symbol.for("setPartLists"), Symbol.for("major"));
      }
      if (tCurrentPartList.findPos(tPartSymbol) == 0) {
        const tPartClass = this.getPartClass(tPartSymbol);
        const tPartObj = createObject(Symbol.for("temp"), tPartClass);
        let tDirection = this.pDirection;
        if (this.pPartListSubSet["head"].findPos(tPartSymbol) > 0) {
          tDirection = this.pHeadDir;
        }
        tPartObj.define(tPartSymbol, tmodel["model"], tmodel["color"], tDirection, tAction, this, tFlipPart);
        tPartObj.setAnimations(tAnimationList[tPartSymbol]);
        this.pPartList.add(tPartObj);
      } else {
        if (tmodel["model"].count > 0) {
          this.pPartList[i].clearGraphics();
          this.pCurrentPartList[tPartSymbol].changePartData(tmodel["model"], tmodel["color"]);
        }
      }
      if (tmodel["color"].count > 0) {
        this.pColors.setaProp(tPartSymbol, tmodel["color"]);
      }
    }
    for (let i = 1; i <= this.pPartList.count; i++) {
      this.pPartIndex[this.pPartList[i].pPart] = i;
    }
    return 1;
  }

  arrangeParts(tOrderName) {
    let tPartOrder = EMPTY;
    let tDirData = EMPTY;
    if (!voidp(this.pDirection)) {
      tDirData = `.${this.pDirection}`;
    }
    if (voidp(tOrderName)) {
      tOrderName = "human.parts";
    }
    tPartOrder = `${tOrderName}.${this.pPeopleSize}`;
    const tPartOrderAction = `${tPartOrder}.${this.pMainAction}`;
    if (variableExists(`${tPartOrderAction}${tDirData}`)) {
      tPartOrder = tPartOrderAction;
    }
    if (this.pLeftHandUp) {
      const tPartOrderLeftHand = `${tPartOrder}.lh-up`;
      if (variableExists(`${tPartOrderLeftHand}${tDirData}`)) {
        tPartOrder = tPartOrderLeftHand;
      }
    }
    if (this.pRightHandUp) {
      const tPartOrderRightHand = `${tPartOrder}.rh-up`;
      if (variableExists(`${tPartOrderRightHand}${tDirData}`)) {
        tPartOrder = tPartOrderRightHand;
      }
    }
    tPartOrder = `${tPartOrder}${tDirData}`;
    if (tPartOrder == this.pPartOrderOld) {
      return 1;
    }
    if (!variableExists(tPartOrder)) {
      error(this, `No human part order found ${tPartOrder}`, Symbol.for("arrangeParts"), Symbol.for("major"));
    } else {
      const tPartDefinition = getVariableValue(tPartOrder);
      const tTempPartList = list();
      for (const tPartSymbol of tPartDefinition) {
        if (!voidp(this.pPartIndex[tPartSymbol])) {
          tTempPartList.append(this.pPartList[this.pPartIndex[tPartSymbol]]);
        }
      }
      if (tTempPartList.count != this.pPartList.count) {
        return error(this, `Invalid human part order ${tPartOrder}`, Symbol.for("arrangeParts"), Symbol.for("major"));
      }
      this.pPartList = tTempPartList;
      this.pPartOrderOld = tPartOrder;
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

  getCanvasName() {
    return this.pCanvasName;
  }

  getDefinedPartList(tPartNameList) {
    const tPartList = list();
    for (const tPartName of tPartNameList) {
      if (!voidp(this.pPartIndex[tPartName])) {
        const tPos = this.pPartIndex[tPartName];
        tPartList.append(this.pPartList[tPos]);
      }
    }
    return tPartList;
  }

  definePartListAction(tPartList, tAction) {
    if (voidp(this.pPartActionList)) {
      this.resetAction();
    }
    for (const tPart of tPartList) {
      this.pPartActionList[tPart] = tAction;
    }
    call(Symbol.for("defineAct"), this.getDefinedPartList(tPartList), tAction);
  }

  resetAction() {
    this.pMainAction = "std";
    this.pLeftHandUp = 0;
    this.pRightHandUp = 0;
    if (voidp(this.pPartActionList)) {
      this.pPartActionList = propList();
    }
    if (this.pPartActionList.count == 0) {
      const tPartList = getVariableValue(`${this.getPartListNameBase()}.${this.pPeopleSize}`);
      if (tPartList.ilk == Symbol.for("list")) {
        for (const tPart of tPartList) {
          this.pPartActionList[tPart] = this.pMainAction;
        }
      }
    } else {
      for (let i = 1; i <= this.pPartActionList.count; i++) {
        this.pPartActionList[i] = this.pMainAction;
      }
    }
    call(Symbol.for("setModel"), this.getDefinedPartList(this.pPartListSubSet["itemRight"]), "0");
  }

  getPartClass(tPartSymbol) {
    return this.pPartClass;
  }

  getPartListNameBase() {
    return "human.parts";
  }

  releaseShadowSprite() {
    if (ilk(this.pShadowSpr) == Symbol.for("sprite")) {
      releaseSprite(this.pShadowSpr.spriteNum);
      this.pShadowSpr = VOID;
    }
  }

  action_mv(tProps) {
    this.pMainAction = "wlk";
    this.pMoving = 1;
    this.pBaseLocZ = 0;
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    const tloc = tProps.word[2];
    const tLocX = integer(tloc.item[1]);
    const tLocY = integer(tloc.item[2]);
    const tLocH = getLocalFloat(tloc.item[3]);
    the.itemDelimiter = tDelim;
    this.pMoveStart = the.milliSeconds;
    this.pStartLScreen = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH);
    this.pDestLScreen = this.pGeometry.getScreenCoordinate(tLocX, tLocY, tLocH);
    this.definePartListAction(this.pPartListSubSet["walk"], "wlk");
  }

  action_sld(tProps) {
    this.pMoving = 1;
    this.pBaseLocZ = 0;
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    const tloc = tProps.word[2];
    const tLocX = integer(tloc.item[1]);
    const tLocY = integer(tloc.item[2]);
    const tLocH = getLocalFloat(tloc.item[3]);
    the.itemDelimiter = tDelim;
    this.pQueuesWithObj = integer(tProps.word[3]);
    this.pStartLScreen = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH + this.pRestingHeight);
    this.pDestLScreen = this.pGeometry.getScreenCoordinate(tLocX, tLocY, tLocH);
    this.pPreviousLoc = list(this.pLocX, this.pLocY, this.pLocH);
    const tStartTime = tProps.word[4];
    if (voidp(tStartTime)) {
      this.pMoveStart = the.milliSeconds;
    } else {
      this.pMoveStart = tStartTime;
    }
  }

  action_sit(tProps) {
    this.definePartListAction(this.pPartListSubSet["sit"], "sit");
    this.pMainAction = "sit";
    this.pRestingHeight = getLocalFloat(tProps.word[2]) - 1.0;
    this.pScreenLoc = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH + this.pRestingHeight);
    const tIsInQueue = integer(tProps.word[3]);
    this.pQueuesWithObj = tIsInQueue;
  }

  action_lay(tProps) {
    this.pMainAction = "lay";
    this.pCarrying = 0;
    const tRestingHeight = getLocalFloat(tProps.word[2]);
    let tZOffset;
    if (tRestingHeight < 0.0) {
      this.pRestingHeight = abs(tRestingHeight) - 1.0;
      tZOffset = 0;
    } else {
      this.pRestingHeight = tRestingHeight - 1.0;
      tZOffset = 2000;
    }
    this.pScreenLoc = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH + this.pRestingHeight);
    if (this.pXFactor < 33) {
      switch (this.pFlipList[this.pDirection + 1]) {
        case 2:
          this.pScreenLoc = this.pScreenLoc + list(-10, 18, tZOffset);
          break;
        case 0:
          this.pScreenLoc = this.pScreenLoc + list(-17, 18, tZOffset);
          break;
      }
    } else {
      switch (this.pFlipList[this.pDirection + 1]) {
        case 2:
          this.pScreenLoc = this.pScreenLoc + list(10, 30, tZOffset);
          break;
        case 0:
          this.pScreenLoc = this.pScreenLoc + list(-47, 32, tZOffset);
          break;
      }
    }
    if (this.pXFactor > 32) {
      this.pLocFix = point(30, -10);
    } else {
      this.pLocFix = point(35, -5);
    }
    this.definePartListAction(this.pPartListFull, "lay");
    if (this.pDirection == 0) {
      this.pDirection = 4;
      this.pHeadDir = 4;
    }
    call(Symbol.for("defineDir"), this.pPartList, this.pDirection);
  }

  carryObject(tProps, tDefaultItem, tDefaultItemPublic) {
    const tItem = tProps.word[2];
    if (value(tItem) > 0) {
      let tCarrying = tItem;
      let tCarryItm;
      if (variableExists(`handitem.right.${tCarrying}`)) {
        tCarryItm = getVariable(`handitem.right.${tCarrying}`, string(tDefaultItem));
      } else {
        tCarryItm = string(tDefaultItem);
      }
      this.definePartListAction(this.pPartListSubSet["handRight"], "crr");
      call(Symbol.for("setModel"), this.getDefinedPartList(this.pPartListSubSet["itemRight"]), tCarryItm);
      if (textExists(`handitem${tCarrying}`)) {
        this.pCarrying = getText(`handitem${tCarrying}`, `handitem${tCarrying}`);
      }
    } else {
      if (getObject(Symbol.for("room_component")).getRoomID() != "private") {
        this.pCarrying = tProps.word[`2..${tProps.word.count}`];
        const tCarryItm = string(tDefaultItemPublic);
        this.definePartListAction(this.pPartListSubSet["handRight"], "crr");
        call(Symbol.for("setModel"), this.getDefinedPartList(this.pPartListSubSet["itemRight"]), tCarryItm);
      }
    }
  }

  action_carryd(tProps) {
    this.carryObject(tProps, "1", "1");
  }

  action_carryf(tProps) {
    this.carryObject(tProps, "1", "4");
  }

  action_cri(tProps) {
    this.carryObject(tProps, "75", "1");
  }

  useObject(tProps, tDefaultItem, tDefaultItemPublic) {
    const tItem = tProps.word[2];
    if (integerp(value(tItem))) {
      let tCarrying = tItem;
      let tCarryItm;
      if (variableExists(`handitem.right.${tCarrying}`)) {
        tCarryItm = getVariable(`handitem.right.${tCarrying}`, string(tDefaultItem));
      } else {
        tCarryItm = string(tDefaultItem);
      }
      if (textExists(`handitem${tCarrying}`)) {
        this.pCarrying = getText(`handitem${tCarrying}`, `handitem${tCarrying}`);
      }
      this.definePartListAction(this.pPartListSubSet["handRight"], "drk");
      call(Symbol.for("setModel"), this.getDefinedPartList(this.pPartListSubSet["itemRight"]), tCarryItm);
      this.pRightHandUp = 1;
    } else {
      if (getObject(Symbol.for("room_component")).getRoomID() != "private") {
        this.pCarrying = tProps.word[`2..${tProps.word.count}`];
        const tCarryItm = string(tDefaultItemPublic);
        this.definePartListAction(this.pPartListSubSet["handRight"], "drk");
        call(Symbol.for("setModel"), this.getDefinedPartList(this.pPartListSubSet["itemRight"]), tCarryItm);
        this.pRightHandUp = 1;
      }
    }
  }

  action_usei(tProps) {
    this.useObject(tProps, "1", "1");
  }

  action_drink(tProps) {
    this.useObject(tProps, "1", "1");
  }

  action_eat(tProps) {
    this.useObject(tProps, "1", "4");
  }

  action_talk(tProps) {
    if (this.pPeopleSize == "sh") {
      if (this.pMainAction == "lay") {
        return 0;
      }
    }
    this.pTalking = 1;
  }

  action_gest(tProps) {
    if (this.pPeopleSize == "sh") {
      return 0;
    }
    let tGesture = tProps.word[2];
    if (tGesture == "spr") {
      tGesture = "srp";
    }
    if (this.pMainAction == "lay") {
      tGesture = `l${tGesture.char[`1..2`]}`;
      this.definePartListAction(this.pPartListSubSet["gesture"], tGesture);
    } else {
      this.definePartListAction(this.pPartListSubSet["gesture"], tGesture);
      if (tGesture == "ohd") {
        this.definePartListAction(this.pPartListSubSet["head"], "ohd");
      }
    }
  }

  action_wave(tProps) {
    this.pWaving = 1;
    this.pLeftHandUp = 1;
  }

  action_dance(tProps) {
    const tStyleNum = tProps.word[2];
    this.pDancing = integer(tStyleNum);
    if (this.pDancing == VOID) {
      this.pDancing = 1;
    }
    const tStyle = `dance.${this.pDancing}`;
    this.startAnimation(tStyle);
  }

  action_ohd() {
    this.definePartListAction(this.pPartListSubSet["head"], "ohd");
    this.definePartListAction(this.pPartListSubSet["handRight"], "ohd");
  }

  action_trd() {
    this.pTrading = 1;
  }

  action_sleep() {
    this.pSleeping = 1;
  }

  action_flatctrl(tProps) {
    this.pCtrlType = tProps.word[2];
  }

  action_mod(tProps) {
    this.pModState = tProps.word[2];
  }

  action_sign(props) {
    const tSignMem = `sign${props.word[2]}`;
    if (getmemnum(tSignMem) == 0) {
      return 0;
    }
    this.definePartListAction(this.pPartListSubSet["handLeft"], "sig");
    const tSignObjID = "SIGN_EXTRA";
    this.pExtraObjsActive.setaProp(tSignObjID, 1);
    if (voidp(this.pExtraObjs[tSignObjID])) {
      this.pExtraObjs.addProp(tSignObjID, createObject(Symbol.for("temp"), "HumanExtra Sign Class"));
    }
    call(Symbol.for("show_sign"), this.pExtraObjs, propList("sprite", this.pSprite, "direction", this.pDirection, "signmember", tSignMem));
    this.pLeftHandUp = 1;
  }

  action_joingame(tProps) {
    if (tProps.word.count < 3) {
      return 0;
    }
    const tSignObjID = "IG_ICON";
    this.pExtraObjsActive.setaProp(tSignObjID, 1);
    if (this.pExtraObjs.findPos(tSignObjID) == 0) {
      const tObject = createObject(Symbol.for("temp"), "IG HumanIcon Class");
      if (tObject == 0) {
        return 0;
      }
      this.pExtraObjs.setaProp(tSignObjID, tObject);
    }
    call(Symbol.for("show_ig_icon"), this.pExtraObjs, propList("userid", this.getID(), "gameid", tProps.word[2], "gametype", tProps.word[3], "locz", this.pSprite.locZ));
  }
}
