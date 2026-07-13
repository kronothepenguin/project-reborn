export default class {
  pWindowID;
  pTargetElementID;
  pTargetWindowID;
  pLocX;
  pLocY;
  pText;
  pOffsetX;
  pOffsetY;
  pDirection;
  pSpecial;
  pWindow;
  pWindowType;
  pTextWidth;
  pTextHeight;
  pWriter;
  pFadeState;
  pFaded;
  pTextOffset;
  pEmptySizeX;
  pEmptySizeY;
  pPointerX;
  pPointerY;

  construct() {
    this.pWindowType = "bubble_text.window";
    this.pFadeState = Symbol.for("ready");
    this.pTextWidth = 120;
    this.pFaded = 0;
    this.Init();
    this.pWindow.registerProcedure(Symbol.for("blendHandler"), this.getID(), Symbol.for("mouseEnter"));
    this.pWindow.registerProcedure(Symbol.for("blendHandler"), this.getID(), Symbol.for("mouseLeave"));
    return 1;
  }

  deconstruct() {
    removeWindow(this.pWindowID);
    removeWriter(this.pWriter.getID());
  }

  Init() {
    if (voidp(this.pWindowID)) {
      this.pWindowID = getUniqueID();
    }
    createWindow(pWindowID, "bubble.window");
    this.pWindow = getWindow(pWindowID);
    this.pWindow.merge(this.pWindowType);
    this.selectPointer(6);
    tElem = this.pWindow.getElement("bubble_text");
    this.pWindow.resizeBy(pTextWidth - tElem.getProperty(Symbol.for("width")), 0);
    this.pTextHeight = tElem.getProperty(Symbol.for("height"));
    tPlainFont = getStructVariable("struct.font.plain");
    tWriterId = getUniqueID();
    createWriter(tWriterId, tPlainFont);
    this.pWriter = getWriter(tWriterId);
    tMetrics = propList("wordWrap", 1, "rect", rect(0, 0, pTextWidth, 0));
    this.pWriter.define(tMetrics);
    this.pWriter.pMember.fixedLineSpace = 11;
    this.pEmptySizeX = this.pWindow.getProperty(Symbol.for("width"));
    this.pEmptySizeY = this.pWindow.getProperty(Symbol.for("height"));
    this.hide();
    return 1;
  }

  hide() {
    this.pWindow.hide();
    this.pTargetWindowID = VOID;
  }

  show() {
    this.pWindow.show();
  }

  setText(tText) {
    this.pText = tText;
    tTextImage = this.pWriter.render(tText).duplicate();
    tElem = this.pWindow.getElement("bubble_text");
    tMarginH = this.pWindow.getProperty(Symbol.for("height")) - tElem.getProperty(Symbol.for("height"));
    tElem.feedImage(tTextImage);
    tElem.resizeTo(tTextImage.width, tTextImage.height, 1);
    this.pWindow.resizeTo(this.pEmptySizeX, tMarginH + tTextImage.height);
    this.updatePointer();
  }

  addText(tText) {
    this.setText(`${this.pText}${RETURN}${RETURN}${getText(tText)}`);
  }

  getProperty(tProp) {
    switch (tProp) {
      case Symbol.for("windowID"):
        return this.pWindowID;
      case Symbol.for("targetWindowID"):
        return this.pTargetWindowID;
      case Symbol.for("text"):
        return this.pText;
      case Symbol.for("offset"):
        return this.pOffset;
      case Symbol.for("direction"):
        return this.pDirection;
      case Symbol.for("special"):
        return this.pSpecial;
    }
    return VOID;
  }

  setProperty(tProperty, tValue) {
    if (listp(tProperty)) {
      for (let i = 1; i <= tProperty.count; i++) {
        this.setProperty(tProperty.getPropAt(i), tProperty[i]);
      }
    }
    switch (tProperty) {
      case Symbol.for("textKey"):
        tText = getText(tValue);
        tText = replaceChunks(tText, "\n", `${RETURN}${RETURN}`);
        this.setText(tText);
        break;
      case Symbol.for("targetID"):
        this.pTargetElementID = tValue;
        break;
      case Symbol.for("direction"):
        this.selectPointer(tValue);
        break;
      case Symbol.for("offsetx"):
        this.pOffsetX = value(tValue);
        break;
      case Symbol.for("offsety"):
        this.pOffsetY = value(tValue);
        break;
      case Symbol.for("special"):
        this.pSpecial = tValue;
        break;
      default:
        nothing();
        break;
    }
  }

  selectPointer(tPointerNum) {
    this.pDirection = tPointerNum;
    for (let i = 1; i <= 8; i++) {
      tElemName = `pointer_${i}`;
      if (!pWindow.elementExists(tElemName)) {
        continue;
      }
      if (i == tPointerNum) {
        pWindow.getElement(tElemName).show();
      } else {
        pWindow.getElement(tElemName).hide();
      }
      tElemName = `pointer_${i}_shadow`;
      if (!pWindow.elementExists(tElemName)) {
        continue;
      }
      if (i == tPointerNum) {
        pWindow.getElement(tElemName).show();
        continue;
      }
      pWindow.getElement(tElemName).hide();
    }
    this.updatePointer();
  }

  update() {
    if (this.pFaded) {
      tX1 = this.pWindow.getProperty(Symbol.for("locX"));
      tY1 = this.pWindow.getProperty(Symbol.for("locY"));
      tX2 = tX1 + this.pWindow.getProperty(Symbol.for("width"));
      tY2 = tY1 + this.pWindow.getProperty(Symbol.for("height"));
      if (!(the.mouseLoc).inside(rect(tX1, tY1, tX2, tY2))) {
        this.pFaded = 0;
        this.show();
      }
    }
    this.updateFade();
    this.updatePosition();
  }

  updatePointer() {
    switch (this.pDirection) {
      case 1:
        this.pPointerX = 33;
        this.pPointerY = 0;
        break;
      case 2:
        this.pPointerX = this.pWindow.getProperty(Symbol.for("width")) - 33;
        this.pPointerY = 0;
        break;
      case 3:
        this.pPointerX = this.pWindow.getProperty(Symbol.for("width"));
        this.pPointerY = 26;
        break;
      case 4:
        this.pPointerX = this.pWindow.getProperty(Symbol.for("width"));
        this.pPointerY = this.pWindow.getProperty(Symbol.for("height")) - 26;
        break;
      case 5:
        this.pPointerX = this.pWindow.getProperty(Symbol.for("width")) - 33;
        this.pPointerY = this.pWindow.getProperty(Symbol.for("height"));
        break;
      case 6:
        this.pPointerX = 33;
        this.pPointerY = this.pWindow.getProperty(Symbol.for("height"));
        break;
      case 7:
        this.pPointerX = 0;
        this.pPointerY = this.pWindow.getProperty(Symbol.for("height")) - 26;
        break;
      case 8:
        this.pPointerX = 0;
        this.pPointerY = 26;
        break;
    }
  }

  updatePosition() {
    if (voidp(this.pTargetElementID)) {
      return 1;
    }
    if (voidp(this.pTargetWindowID)) {
      if (!this.findTargetWindow()) {
        this.hide();
        return 1;
      }
    }
    tTargetWindow = getWindow(this.pTargetWindowID);
    if (!tTargetWindow) {
      this.hide();
      return 1;
    }
    if (!tTargetWindow.getProperty(Symbol.for("visible"))) {
      this.hide();
      return 1;
    }
    tTargetElem = getWindow(this.pTargetWindowID).getElement(this.pTargetElementID);
    if (!tTargetElem) {
      this.hide();
      return 1;
    }
    if (!tTargetElem.getProperty(Symbol.for("visible"))) {
      this.hide();
      return 1;
    }
    tTargetSprite = tTargetElem.getProperty(Symbol.for("sprite"));
    tTargetRect = tTargetSprite.rect;
    tX = tTargetRect[1] + this.pOffsetX - this.pPointerX;
    tY = tTargetRect[2] + this.pOffsetY - this.pPointerY;
    this.pWindow.moveTo(tX, tY);
    if (!this.pFaded) {
      this.pWindow.show();
    }
  }

  findTargetWindow() {
    tWindowList = getWindowIDList();
    for (const tWindowID of tWindowList) {
      if (getWindow(tWindowID).elementExists(this.pTargetElementID)) {
        this.pTargetWindowID = tWindowID;
        return 1;
      }
    }
    return 0;
  }

  updateFade() {
    if (this.pFadeState == Symbol.for("ready")) {
      return 1;
    }
    tFadeSpeed = 5;
    tUpperLimit = 100;
    tLowerLimit = 0;
    tElemBG = this.pWindow.getElement("bubble_bg");
    tBlend = tElemBG.getProperty(Symbol.for("blend"));
    switch (this.pFadeState) {
      case Symbol.for("in"):
        tNewBlend = tBlend + tFadeSpeed;
        break;
      case Symbol.for("out"):
        tNewBlend = tBlend - tFadeSpeed;
        break;
    }
    if (tNewBlend >= tUpperLimit) {
      tNewBlend = tUpperLimit;
      this.pFadeState = Symbol.for("ready");
    }
    if (tNewBlend <= tLowerLimit) {
      tNewBlend = tLowerLimit;
      this.pFadeState = Symbol.for("ready");
      this.pFaded = 1;
      this.pWindow.hide();
    }
    if (this.pFadeState == Symbol.for("ready")) {
      removeUpdate(this.getID());
    }
    tElemList = this.pWindow.getProperty(Symbol.for("elementList"));
    for (const tElem of tElemList) {
      if (tElemList.getOne(tElem).contains("shadow")) {
        continue;
      }
      tElem.setProperty(Symbol.for("blend"), tNewBlend);
    }
  }

  blendHandler(tEvent, tSpriteID, tParam) {
    switch (tEvent) {
      case Symbol.for("mouseEnter"):
        this.pFadeState = Symbol.for("out");
        break;
      case Symbol.for("mouseLeave"):
        this.pFadeState = Symbol.for("in");
        break;
    }
    receiveUpdate(this.getID());
  }
}
