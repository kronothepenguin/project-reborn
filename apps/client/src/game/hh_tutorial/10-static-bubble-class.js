export default class {
  pLocX;
  pLocY;
  pTargetX;
  pTargetY;
  pBubbleId;

  construct() {
    this.pWindowType = "bubble_text.window";
    this.pTextWidth = 160;
    pLocX = -1000;
    pLocY = 0;
    pTargetX = pLocX;
    pTargetY = pLocY;
    pBubbleId = VOID;
    this.Init();
    this.pWindow.registerProcedure(Symbol.for("eventHandler"), this.getID(), Symbol.for("mouseUp"));
    return 1;
  }

  setProperty(tProperty, tValue) {
    if (listp(tProperty)) {
      for (let i = 1; i <= tProperty.count; i++) {
        this.setProperty(tProperty.getPropAt(i), tProperty[i]);
      }
    }
    switch (tProperty) {
      case Symbol.for("bubbleId"):
        pBubbleId = tValue;
        break;
      case Symbol.for("targetX"):
        pTargetX = tValue;
        this.selectPointerAndPosition(this.pDirection);
        break;
      case Symbol.for("targetY"):
        pTargetY = tValue;
        this.selectPointerAndPosition(this.pDirection);
        break;
      default:
        callAncestor(Symbol.for("setProperty"), list(this), tProperty, tValue);
        break;
    }
  }

  moveTo(tLocX, tLocY) {
    pLocX = tLocX;
    pLocY = tLocY;
    if (objectp(this.pWindow)) {
      this.pWindow.moveTo(pLocX, pLocY);
    }
  }

  setText(tText) {
    callAncestor(Symbol.for("setText"), list(this), tText);
    if (!objectp(this.pWindow)) {
      return 0;
    }
    tCloseElemId = "bubble_close";
    if (this.pWindow.elementExists(tCloseElemId)) {
      tTextElem = this.pWindow.getElement("bubble_text");
      tCloseElem = this.pWindow.getElement(tCloseElemId);
    }
    this.selectPointerAndPosition(this.pDirection);
  }

  selectPointerAndPosition(tPointerIndex) {
    callAncestor(Symbol.for("selectPointer"), list(this), tPointerIndex);
    if (!objectp(this.pWindow)) {
      return 0;
    }
    tMarginH = 20;
    tMarginV = 15;
    switch (tPointerIndex) {
      case 1:
        this.pWindow.moveTo(pTargetX - tMarginH, pTargetY);
        break;
      case 2:
        this.pWindow.moveTo(pTargetX - this.pWindow.getProperty(Symbol.for("width")) + tMarginH, pTargetY);
        break;
      case 3:
        this.pWindow.moveTo(pTargetX - this.pWindow.getProperty(Symbol.for("width")), pTargetY - tMarginV);
        break;
      case 4:
        this.pWindow.moveTo(pTargetX - this.pWindow.getProperty(Symbol.for("width")), pTargetY - this.pWindow.getProperty(Symbol.for("height")) + tMarginV);
        break;
      case 5:
        this.pWindow.moveTo(pTargetX - this.pWindow.getProperty(Symbol.for("width")) + tMarginH, pTargetY - this.pWindow.getProperty(Symbol.for("height")));
        break;
      case 6:
        this.pWindow.moveTo(pTargetX - tMarginH, pTargetY - this.pWindow.getProperty(Symbol.for("height")));
        break;
      case 7:
        this.pWindow.moveTo(pTargetX, pTargetY - this.pWindow.getProperty(Symbol.for("height")) + tMarginV);
        break;
      case 8:
        this.pWindow.moveTo(pTargetX, pTargetY - tMarginV);
        break;
    }
  }

  hideCloseButton() {
    tWndObj = getWindow(this.pWindowID);
    if (objectp(tWndObj)) {
      if (tWndObj.elementExists("bubble_close")) {
        tElem = tWndObj.getElement("bubble_close");
        tElem.setProperty(Symbol.for("visible"), 0);
      }
    }
  }

  eventHandler(tEvent, tSpriteID, tParam) {
    if (tSpriteID == "bubble_close") {
      executeMessage(Symbol.for("NUH_close"), pBubbleId);
    }
  }
}
