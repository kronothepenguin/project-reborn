import {
  call,
  image,
  ilk,
  integerp,
  list,
  listp,
  member,
  point,
  propList,
  rect,
  sprite,
  stringp,
  symbolp,
  the,
  VOID,
  voidp,
} from "../../director";

export default function () {
  let tSprNum, tGroupData, tItem, tsprite, tmember, t_rSpr, t_rMem, tElemRect, tWrapper, tProps, tPalette, tmemberlist, tSpriteList, tElemList, tSprManager, tResManager, tID, tGroupNum, tOffX, tOffY, tOffW, tOffH, tX, tY, tZ, tBoolean, tNewW, tNewH, tloc, tTemplate, ttype, tmodel, tClass, tClsStruct, tElement, tMethod, tTarget, tParam, tClient, tLayout, tLayoutName, tPrivate, tBlend, tInk, tColor, tBgColor, tIsBlendShared, tIsColorShared, tIsBgColorShared, tIsInkShared, tIsPaletteShared, tSymbol;

  return {
    pTitle: VOID,
    pClientID: VOID,
    pProcedures: VOID,
    pLock: VOID,
    pLocX: VOID,
    pLocY: VOID,
    pLocZ: VOID,
    pwidth: VOID,
    pheight: VOID,
    pModal: VOID,
    pActive: VOID,
    pVisible: VOID,
    pDragFlag: VOID,
    pDragOffset: VOID,
    pBoundary: VOID,
    pScaleFlag: VOID,
    pScaleOffset: VOID,
    pElemList: VOID,
    pMemberList: VOID,
    pGroupData: VOID,
    pSpriteList: VOID,
    pSpecialIDList: VOID,
    pClientRect: VOID,
    pElemClsList: VOID,
    pWindowMngr: VOID,

    construct() {
      this.pTitle = this.getID();
      this.pLocX = 0;
      this.pLocY = 0;
      this.pLocZ = 0;
      this.pwidth = 0;
      this.pheight = 0;
      this.pVisible = 1;
      this.pActive = 0;
      this.pLock = 0;
      this.pModal = 0;
      this.pSpriteList = propList();
      this.pScaleFlag = 0;
      this.pDragFlag = 0;
      this.pDragOffset = list([0, 0]);
      this.pBoundary = rect(0, 0, the.stage.rect.width, the.stage.rect.height).__add__(list([-20, -20, 20, 20]));
      this.pClientID = VOID;
      this.pMemberList = propList();
      this.pElemList = propList();
      this.pGroupData = list();
      this.pClientRect = list([0, 0, 0, 0]);
      this.pSpecialIDList = list(["drag", "close", "scale"]);
      this.pProcedures = this.createProcListTemplate();
      return 1;
    },

    deconstruct() {
      _director.removeUpdate(this.getID());
      _director.removePrepare(this.getID());
      for (let i = 1; i <= this.pSpriteList.count; i++) {
        tSprNum = this.pSpriteList[i].spriteNum;
        _director.releaseSprite(tSprNum);
      }
      call(Symbol.for("deconstruct"), this.pElemList);
      for (let i = 1; i <= this.pMemberList.count; i++) {
        _director.removeMember(this.pMemberList[i].name);
      }
      this.pElemList = propList();
      this.pSpriteList = propList();
      this.pMemberList = propList();
      this.pGroupData = list();
      this.pClientID = EMPTY;
      this.pWindowMngr = VOID;
      return 1;
    },

    define(tProps) {
      this.pLocX = tProps[Symbol.for("locX")];
      this.pLocY = tProps[Symbol.for("locY")];
      this.pLocZ = tProps[Symbol.for("locZ")];
      this.pBoundary = tProps[Symbol.for("boundary")];
      this.pElemClsList = tProps[Symbol.for("elements")];
      this.pWindowMngr = tProps[Symbol.for("manager")];
      return 1;
    },

    close() {
      return _director.removeWindow(this.getID());
    },

    merge(tLayout) {
      this.setDeactive();
      if (!this.buildVisual(tLayout)) {
        return 0;
      }
      this.pSpecialIDList.add("drag" + this.pGroupData.count);
      this.pSpecialIDList.add("close" + this.pGroupData.count);
      this.pWindowMngr.Activate(this.getID());
      return 1;
    },

    unmerge() {
      if (this.pGroupData.count === 0) {
        return _director.error(this, "Cant't unmerge window without content!", Symbol.for("unmerge"), Symbol.for("minor"));
      }
      tGroupData = this.pGroupData.getLast();
      call(Symbol.for("deconstruct"), tGroupData[Symbol.for("items")]);
      this.pClientRect = this.pClientRect.__sub__(tGroupData[Symbol.for("border")]);
      for (const tItem of tGroupData[Symbol.for("items")]) {
        this.pElemList.deleteProp(this.pElemList.getOne(tItem));
      }
      for (const tsprite of tGroupData[Symbol.for("sprites")]) {
        this.pSpriteList.deleteProp(this.pSpriteList.getOne(tsprite));
        _director.releaseSprite(tsprite.spriteNum);
      }
      for (const tmember of tGroupData[Symbol.for("members")]) {
        this.pMemberList.deleteProp(this.pMemberList.getOne(tmember));
        _director.removeMember(tmember.name);
      }
      this.pSpecialIDList.deleteOne("drag" + this.pGroupData.count);
      this.pSpecialIDList.deleteOne("drag" + this.pGroupData.count);
      this.pGroupData.deleteAt(this.pGroupData.count);
      return 1;
    },

    lock(tBoolean) {
      if (voidp(tBoolean)) {
        tBoolean = 1;
      }
      this.pLock = tBoolean;
      return 1;
    },

    hide() {
      if (this.pVisible === 1) {
        this.pVisible = 0;
        this.moveX(10000);
        return 1;
      }
      return 0;
    },

    show() {
      if (this.pVisible === 0) {
        this.pVisible = 1;
        this.moveX(-10000);
        return 1;
      }
      return 0;
    },

    moveTo(tX, tY) {
      this.moveBy(tX - this.pLocX, tY - this.pLocY);
    },

    moveBy(tOffX, tOffY) {
      if ((this.pLocX + tOffX) < this.pBoundary[1]) {
        tOffX = this.pBoundary[1] - this.pLocX;
      }
      if ((this.pLocY + tOffY) < this.pBoundary[2]) {
        tOffY = this.pBoundary[2] - this.pLocY;
      }
      if ((this.pLocX + this.pwidth + tOffX) > this.pBoundary[3]) {
        tOffX = this.pBoundary[3] - this.pLocX - this.pwidth;
      }
      if ((this.pLocY + this.pheight + tOffY) > this.pBoundary[4]) {
        tOffY = this.pBoundary[4] - this.pLocY - this.pheight;
      }
      this.pLocX = this.pLocX + tOffX;
      this.pLocY = this.pLocY + tOffY;
      this.moveXY(tOffX, tOffY);
    },

    moveZ(tZ) {
      if (!integerp(tZ)) {
        return _director.error(this, `Integer expected: ${tZ}`, Symbol.for("moveZ"), Symbol.for("minor"));
      }
      for (let i = 1; i <= this.pSpriteList.count; i++) {
        this.pSpriteList[i].locZ = tZ + i - 1;
      }
      this.pLocZ = tZ;
    },

    center() {
      tX = ((the.stageRight - the.stageLeft) / 2) - (this.pwidth / 2);
      tY = ((the.stageBottom - the.stageTop) / 2) - (this.pheight / 2);
      return this.moveTo(tX, tY);
    },

    resizeBy(tOffX, tOffY) {
      if ((tOffX !== 0) || (tOffY !== 0)) {
        this.pwidth = this.pwidth + tOffX;
        this.pheight = this.pheight + tOffY;
        call(Symbol.for("resizeBy"), this.pElemList, tOffX, tOffY);
      }
    },

    resizeTo(tX, tY) {
      tOffW = tX - this.pwidth;
      tOffH = tY - this.pheight;
      this.resizeBy(tOffW, tOffH);
    },

    setActive() {
      if (!this.pActive) {
        this.pActive = 1;
        return 1;
      } else {
        return 0;
      }
    },

    setDeactive() {
      if (this.pLock) {
        return 0;
      } else {
        if (this.pActive) {
          this.pActive = 0;
          return 1;
        } else {
          return 0;
        }
      }
    },

    getClientRect() {
      return rect(this.pLocX, this.pLocY, this.pLocX + this.pwidth, this.pLocY + this.pheight);
    },

    getElement(tID) {
      tElement = this.pElemList[tID];
      if (voidp(tElement)) {
        return 0;
      }
      return tElement;
    },

    elementExists(tID) {
      return !voidp(this.pElemList[tID]);
    },

    registerClient(tClientID) {
      if (!_director.objectExists(tClientID)) {
        return _director.error(this, `Object not found: ${tClientID}`, Symbol.for("registerClient"), Symbol.for("major"));
      }
      this.pClientID = tClientID;
      return 1;
    },

    removeClient() {
      this.pClientID = VOID;
      return 1;
    },

    registerProcedure(tMethod, tClientID, tEvent) {
      if (!symbolp(tMethod)) {
        return _director.error(this, `Symbol expected: ${tMethod}`, Symbol.for("registerProcedure"), Symbol.for("major"));
      }
      if (!_director.objectExists(tClientID)) {
        return _director.error(this, `Object not found: ${tClientID}`, Symbol.for("registerProcedure"), Symbol.for("major"));
      }
      if (voidp(tEvent)) {
        for (let i = 1; i <= this.pProcedures.count; i++) {
          this.pProcedures[i] = list([tMethod, tClientID]);
        }
      } else {
        this.pProcedures[tEvent] = list([tMethod, tClientID]);
      }
      return 1;
    },

    removeProcedure(tEvent) {
      if (voidp(tEvent)) {
        this.pProcedures = this.createProcListTemplate();
      } else {
        if (this.pProcedures.getaProp(tEvent) !== VOID) {
          this.pProcedures[tEvent] = list([Symbol.for("null"), this.getID()]);
        }
      }
      return 1;
    },

    getProperty(tProp) {
      switch (tProp) {
        case Symbol.for("locX"):
          return this.pLocX;
        case Symbol.for("locY"):
          return this.pLocY;
        case Symbol.for("locZ"):
          return this.pLocZ;
        case Symbol.for("boundary"):
          return this.pBoundary;
        case Symbol.for("width"):
          return this.pwidth;
        case Symbol.for("height"):
          return this.pheight;
        case Symbol.for("visible"):
          return this.pVisible;
        case Symbol.for("title"):
          return this.pTitle;
        case Symbol.for("id"):
          return this.getID();
        case Symbol.for("modal"):
          return this.pModal;
        case Symbol.for("spriteList"):
          return this.pSpriteList;
        case Symbol.for("elementList"):
          return this.pElemList;
        case Symbol.for("Active"):
          return this.pActive;
        case Symbol.for("lock"):
          return this.pLock;
      }
      return 0;
    },

    setProperty(tProp, tValue) {
      switch (tProp) {
        case Symbol.for("locX"):
          this.moveX(tValue);
          break;
        case Symbol.for("locY"):
          this.moveY(tValue);
          break;
        case Symbol.for("locZ"):
          this.moveZ(tValue);
          break;
        case Symbol.for("boundary"):
          this.pBoundary = tValue;
          break;
        case Symbol.for("title"):
          this.pTitle = tValue;
          break;
        case Symbol.for("modal"):
          this.pModal = tValue;
          break;
        case Symbol.for("visible"):
          if (tValue) {
            this.show();
          } else {
            this.hide();
          }
          break;
        default:
          return 0;
      }
      return 1;
    },

    setBlend(tNewBlend) {
      for (const tsprite of this.pSpriteList) {
        tsprite.blend = tNewBlend;
      }
      return 1;
    },

    mouseEnter(tNull, tSprID) {
      return this.redirectEvent(Symbol.for("mouseEnter"), tSprID);
    },

    mouseLeave(tNull, tSprID) {
      return this.redirectEvent(Symbol.for("mouseLeave"), tSprID);
    },

    mouseWithin(tNull, tSprID) {
      return this.redirectEvent(Symbol.for("mouseWithin"), tSprID);
    },

    mouseDown(tNull, tSprID) {
      if (!this.pActive && !this.pLock) {
        this.pWindowMngr.Activate(this.getID());
      }
      if (this.pSpecialIDList.getPos(tSprID) !== 0) {
        if (tSprID.includes("drag")) {
          this.drag(1);
        } else {
          if (tSprID.includes("scale")) {
            this.scale(1);
          }
        }
      }
      return this.redirectEvent(Symbol.for("mouseDown"), tSprID);
    },

    mouseUp(tNull, tSprID) {
      if (this.pSpecialIDList.getPos(tSprID) !== 0) {
        if (tSprID.includes("drag")) {
          this.drag(0);
        } else {
          if (tSprID.includes("scale")) {
            this.scale(0);
          } else {
            if (tSprID.includes("close")) {
              if (voidp(this.pClientID)) {
                return this.pWindowMngr.Remove(this.getID());
              } else {
                tSprID = "close";
              }
            }
          }
        }
      }
      return this.redirectEvent(Symbol.for("mouseUp"), tSprID);
    },

    mouseUpOutSide(tNull, tSprID) {
      if (tSprID.includes("drag")) {
        this.drag(0);
      }
      if (tSprID.includes("scale")) {
        this.scale(0);
      }
      return this.redirectEvent(Symbol.for("mouseUpOutSide"), tSprID);
    },

    keyDown(tNull, tSprID) {
      return this.redirectEvent(Symbol.for("keyDown"), tSprID);
    },

    keyUp(tNull, tSprID) {
      return this.redirectEvent(Symbol.for("keyUp"), tSprID);
    },

    supportedEvents() {
      const tList = list();
      tList.add(Symbol.for("mouseEnter"));
      tList.add(Symbol.for("mouseLeave"));
      tList.add(Symbol.for("mouseWithin"));
      tList.add(Symbol.for("mouseDown"));
      tList.add(Symbol.for("mouseUp"));
      tList.add(Symbol.for("mouseUpOutSide"));
      tList.add(Symbol.for("keyDown"));
      tList.add(Symbol.for("keyUp"));
      return tList;
    },

    redirectEvent(tEvent, tSprID) {
      _director.getWindowManager().registerWindowEvent(this.pTitle, tSprID, tEvent);
      tMethod = this.pProcedures[tEvent][1];
      tTarget = this.pProcedures[tEvent][2];
      tParam = call(tEvent, [this.pElemList[tSprID]], tSprID);
      if ((tParam === 0) && (ilk(tParam) === Symbol.for("integer"))) {
        return 0;
      }
      tClient = _director.getObject(tTarget);
      if (tClient !== 0) {
        return call(tMethod, tClient, tEvent, tSprID, tParam, this.getID());
      } else {
        return this.removeProcedure(tEvent);
      }
    },

    buildVisual(tLayout) {
      tLayout = _director.getObject(Symbol.for("layout_parser")).parse(tLayout);
      if (!listp(tLayout)) {
        return _director.error(this, `Invalid window definition: ${tLayout}`, Symbol.for("buildVisual"), Symbol.for("major"));
      }
      tGroupNum = this.pGroupData.count;
      tElemList = propList();
      tmemberlist = propList();
      tSpriteList = propList();
      tGroupData = { [Symbol.for("members")]: list(), [Symbol.for("sprites")]: list(), [Symbol.for("items")]: list(), [Symbol.for("rect")]: list(), [Symbol.for("border")]: list() };
      tSprManager = _director.getSpriteManager();
      tResManager = _director.getResourceManager();
      for (const tElement of tLayout[Symbol.for("elements")]) {
        tID = tElement[1][Symbol.for("id")];
        if (!voidp(this.pElemList[tID])) {
          tID = tID + tGroupNum;
        }
        tmember = member(tResManager.createMember(this.getID() + "_" + tID, Symbol.for("bitmap")));
        tsprite = sprite(tSprManager.reserveSprite(this.getID()));
        if (tsprite.spriteNum < 1) {
          for (const t_rSpr of tSpriteList) {
            _director.releaseSprite(t_rSpr.spriteNum, this.getID());
          }
          tSpriteList = propList();
          for (const t_rMem of tmemberlist) {
            _director.removeMember(t_rMem.name);
          }
          tmemberlist = propList();
          return _director.error(this, "Failed to build window. System out of sprites!", Symbol.for("buildVisual"), Symbol.for("major"));
        }
        tmemberlist[tID] = tmember;
        tSpriteList[tID] = tsprite;
        tsprite.castNum = tmember.number;
        tsprite.ink = 8;
        tElemRect = rect(2000, 2000, -2000, -2000);
        tGroupData[Symbol.for("members")].add(tmember);
        tGroupData[Symbol.for("sprites")].add(tsprite);
        tSprManager.setEventBroker(tsprite.spriteNum, tID);
        tsprite.registerProcedure(VOID, this.getID(), VOID);
        tBlend = tElement[1][Symbol.for("blend")];
        tInk = tElement[1][Symbol.for("ink")];
        tColor = tElement[1][Symbol.for("color")];
        tBgColor = tElement[1][Symbol.for("bgColor")];
        tPalette = tElement[1][Symbol.for("palette")];
        tIsBlendShared = 1;
        tIsColorShared = 1;
        tIsBgColorShared = 1;
        tIsInkShared = 1;
        tIsPaletteShared = 1;
        for (const tItem of tElement) {
          tItem[Symbol.for("id")] = tID;
          tItem[Symbol.for("mother")] = this.getID();
          tItem[Symbol.for("buffer")] = tmember;
          tItem[Symbol.for("sprite")] = tsprite;
          if (tItem[Symbol.for("blend")] !== tBlend) {
            tIsBlendShared = 0;
          }
          if (tItem[Symbol.for("ink")] !== tInk) {
            tIsInkShared = 0;
          }
          if (tItem[Symbol.for("color")] !== tColor) {
            tIsColorShared = 0;
          }
          if (tItem[Symbol.for("bgColor")] !== tBgColor) {
            tIsBgColorShared = 0;
          }
          if (tItem[Symbol.for("palette")] !== tPalette) {
            tIsPaletteShared = 0;
          }
          if (tItem[Symbol.for("type")] === "image") {
            tIsPaletteShared = 0;
          }
          if (tItem[Symbol.for("flipH")]) {
            tItem.locH = tItem.locH - tItem.width;
          }
          if (tItem[Symbol.for("flipV")]) {
            tItem.locV = tItem.locV - tItem.height;
          }
          if (tItem[Symbol.for("locH")] < tElemRect[1]) {
            tElemRect[1] = tItem[Symbol.for("locH")];
          }
          if (tItem[Symbol.for("locV")] < tElemRect[2]) {
            tElemRect[2] = tItem[Symbol.for("locV")];
          }
          if ((tItem[Symbol.for("locH")] + tItem[Symbol.for("width")]) > tElemRect[3]) {
            tElemRect[3] = tItem[Symbol.for("locH")] + tItem[Symbol.for("width")];
          }
          if ((tItem[Symbol.for("locV")] + tItem[Symbol.for("height")]) > tElemRect[4]) {
            tElemRect[4] = tItem[Symbol.for("locV")] + tItem[Symbol.for("height")];
          }
          if (!voidp(tItem[Symbol.for("cursor")])) {
            tsprite.setcursor(tItem[Symbol.for("cursor")]);
            continue;
          }
          tsprite.setcursor(Symbol.for("arrow"));
        }
        if (tIsPaletteShared && !voidp(tPalette)) {
          if (stringp(tPalette)) {
            tPalette = member(tResManager.getmemnum(tPalette));
          }
          tmember.image = image(tElemRect.width, tElemRect.height, 8, tPalette);
        } else {
          tmember.image = image(tElemRect.width, tElemRect.height, the.colorDepth);
        }
        tmember.regPoint = point(0, 0);
        if (tElement.count === 1) {
          tItem = tElement[1];
          tItem[Symbol.for("style")] = Symbol.for("unique");
          if (tIsBlendShared) {
            tItem[Symbol.for("blend")] = 100;
          }
          tWrapper = this.CreateElement(tItem);
        } else {
          tProps = { [Symbol.for("id")]: tID, [Symbol.for("type")]: Symbol.for("wrapper"), [Symbol.for("style")]: Symbol.for("wrapper"), [Symbol.for("buffer")]: tmember, [Symbol.for("sprite")]: tsprite, [Symbol.for("locX")]: tElemRect[1], [Symbol.for("locY")]: tElemRect[2] };
          tWrapper = this.CreateElement(tProps);
          for (const tItem of tElement) {
            tItem[Symbol.for("locH")] = tItem[Symbol.for("locH")] - tElemRect[1];
            tItem[Symbol.for("locV")] = tItem[Symbol.for("locV")] - tElemRect[2];
            tItem[Symbol.for("style")] = Symbol.for("grouped");
            if (tIsBlendShared) {
              tItem[Symbol.for("blend")] = 100;
            }
            tWrapper.add(this.CreateElement(tItem));
          }
        }
        if (_director.objectp(tWrapper)) {
          tElemList.addProp(tID, tWrapper);
          tGroupData[Symbol.for("items")].add(tWrapper);
        }
        if (tIsBlendShared) {
          tsprite.blend = tBlend;
        }
        if (tIsInkShared) {
          tsprite.ink = tInk;
        }
        if (tIsColorShared) {
          tsprite.color = tColor;
        }
        if (tIsBgColorShared) {
          tsprite.bgColor = tBgColor;
        }
        tsprite.locH = tElemRect[1] + this.pClientRect[1];
        tsprite.locV = tElemRect[2] + this.pClientRect[2];
        tsprite.width = tElemRect.width;
        tsprite.height = tElemRect.height;
      }
      tGroupData[Symbol.for("rect")] = tLayout[Symbol.for("rect")][1];
      tGroupData[Symbol.for("border")] = tLayout[Symbol.for("border")][1];
      if (tGroupNum === 0) {
        this.pLocX = this.pLocX + tGroupData[Symbol.for("rect")][1];
        this.pLocY = this.pLocY + tGroupData[Symbol.for("rect")][2];
        this.pwidth = tGroupData[Symbol.for("rect")].width;
        this.pheight = tGroupData[Symbol.for("rect")].height;
      } else {
        tNewW = this.pClientRect[1] + this.pClientRect[3] + tGroupData[Symbol.for("rect")].width;
        tNewH = this.pClientRect[2] + this.pClientRect[4] + tGroupData[Symbol.for("rect")].height;
        if ((tNewW !== this.pwidth) || (tNewH !== this.pheight)) {
          this.resizeTo(tNewW, tNewH);
        }
      }
      this.pClientRect = this.pClientRect.__add__(tGroupData[Symbol.for("border")]);
      for (let i = 1; i <= tSpriteList.count; i++) {
        tloc = tSpriteList[i].loc.__sub__(list([tGroupData[Symbol.for("rect")][1], tGroupData[Symbol.for("rect")][2]]));
        tSpriteList[i].loc = point(this.pLocX, this.pLocY).__add__(tloc);
        tID = tmemberlist.getPropAt(i);
        this.pMemberList.addProp(tID, tmemberlist[tID]);
        this.pSpriteList.addProp(tID, tSpriteList[tID]);
      }
      for (let i = 1; i <= tElemList.count; i++) {
        this.pElemList.addProp(tElemList.getPropAt(i), tElemList[i]);
      }
      this.pGroupData.add(tGroupData);
      call(Symbol.for("prepare"), tGroupData[Symbol.for("items")]);
      call(Symbol.for("render"), tGroupData[Symbol.for("items")]);
      return 1;
    },

    prepare() {
      tOffX = the.mouseH - this.pScaleOffset[1];
      tOffY = the.mouseV - this.pScaleOffset[2];
      this.pScaleOffset = the.mouseLoc;
      if ((this.pwidth + tOffX) < 64) {
        tOffX = 64 - this.pwidth;
      }
      if ((this.pheight + tOffY) < 64) {
        tOffY = 64 - this.pheight;
      }
      this.resizeBy(tOffX, tOffY);
    },

    update() {
      this.moveTo(the.mouseH - this.pDragOffset[1], the.mouseV - this.pDragOffset[2]);
    },

    CreateElement(tProps) {
      tTemplate = this.pElemClsList[tProps[Symbol.for("style")]];
      ttype = tProps[Symbol.for("type")];
      tmodel = tProps[Symbol.for("model")];
      tClass = "window." + ttype + tmodel + ".class";
      if (!voidp(this.pElemClsList[tClass])) {
        tClsStruct = this.pElemClsList[tClass];
      } else {
        if (_director.variableExists(tClass)) {
          tClsStruct = _director.getClassVariable(tClass);
          this.pElemClsList[tClass] = tClsStruct;
        } else {
          tClsStruct = VOID;
        }
      }
      if (voidp(tClsStruct)) {
        tElement = _director.createObject(Symbol.for("temp"), tTemplate);
      } else {
        tElement = _director.createObject(Symbol.for("temp"), tTemplate, tClsStruct);
      }
      if (!tElement) {
        return _director.error(this, `Illegal element type: ${tProps[Symbol.for("id")]} ${tClass}`, Symbol.for("CreateElement"), Symbol.for("major"));
      }
      tElement.setID(tProps[Symbol.for("id")]);
      tElement.define(tProps);
      return tElement;
    },

    createProcListTemplate() {
      const tList = propList();
      for (const tEvent of this.supportedEvents()) {
        tList[tEvent] = list([Symbol.for("null"), this.getID()]);
      }
      return tList;
    },

    scale(tBoolean) {
      if ((tBoolean === 1) && (this.pScaleFlag === 0)) {
        this.pScaleOffset = the.mouseLoc;
        _director.receivePrepare(this.getID());
        this.pScaleFlag = 1;
      } else {
        if ((tBoolean === 0) && (this.pScaleFlag === 1)) {
          _director.removePrepare(this.getID());
          this.pScaleFlag = 0;
        }
      }
      return 1;
    },

    drag(tBoolean) {
      if ((tBoolean === 1) && (this.pDragFlag === 0)) {
        this.pDragOffset = the.mouseLoc.__sub__(list([this.pLocX, this.pLocY]));
        _director.receiveUpdate(this.getID());
        this.pDragFlag = 1;
      } else {
        if ((tBoolean === 0) && (this.pDragFlag === 1)) {
          _director.removeUpdate(this.getID());
          this.pDragFlag = 0;
        }
      }
      return 1;
    },

    draw(tRGB) {
      call(Symbol.for("draw"), this.pElemList, tRGB);
    },

    moveX(tOffX) {
      for (let i = 1; i <= this.pSpriteList.count; i++) {
        this.pSpriteList[i].locH = this.pSpriteList[i].locH + tOffX;
      }
    },

    moveY(tOffY) {
      for (let i = 1; i <= this.pSpriteList.count; i++) {
        this.pSpriteList[i].locV = this.pSpriteList[i].locV + tOffY;
      }
    },

    moveXY(tOffX, tOffY) {
      for (let i = 1; i <= this.pSpriteList.count; i++) {
        this.pSpriteList[i].loc = this.pSpriteList[i].loc.__add__(list([tOffX, tOffY]));
      }
    },

    null() {
      return 0;
    },

    movePartBy(ttype, tX, tY, tInverse) {
      tsprite = this.pSpriteList[ttype];
      if (voidp(tsprite)) {
        return 0;
      }
      if (tInverse) {
        for (let i = 1; i <= this.pSpriteList.count; i++) {
          tSymbol = this.pSpriteList.getPropAt(i);
          if (tSymbol !== ttype) {
            tsprite = this.pSpriteList[tSymbol];
            tsprite.loc = tsprite.loc.__add__(list([tX, tY]));
          }
        }
      } else {
        tsprite.loc = tsprite.loc.__add__(list([tX, tY]));
      }
    },

    movePartTo(ttype, tX, tY, tInverse) {
      tX = tX - this.pLocX;
      tY = tY - this.pLocY;
      this.movePartBy(ttype, tX, tY, tInverse);
    },
  };
}
