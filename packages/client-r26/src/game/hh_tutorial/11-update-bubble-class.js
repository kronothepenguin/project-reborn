export default class {
  pUpdate;
  pSkipFrames;

  construct() {
    pUpdate = 1;
    receiveUpdate(this.getID());
    pSkipFrames = 1;
    this.pWindowType = "bubble_static.window";
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

  deconstruct() {
    pUpdate = 0;
    removeUpdate(this.getID());
    callAncestor(Symbol.for("deconstruct"), list(this));
    return 1;
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
      tPosX = (tTextElem.getProperty(Symbol.for("width")) / 2) - (tCloseElem.getProperty(Symbol.for("width")) / 2) - 10;
      tCloseElem.moveBy(tPosX, tTextElem.getProperty(Symbol.for("height")) - 5);
    }
    this.selectPointerAndPosition(this.pDirection);
  }

  update() {
    pSkipFrames = !pSkipFrames;
    if (pSkipFrames == 1) {
      return 0;
    }
    tRoomComponent = getThread("room").getComponent();
    tOwnRoomId = tRoomComponent.getUsersRoomId(getObject(Symbol.for("session")).GET("user_name"));
    tHumanObj = tRoomComponent.getUserObject(tOwnRoomId);
    if (tHumanObj == 0) {
      return 0;
    }
    tHumanLoc = tHumanObj.getPartLocation("hd");
    this.setProperty(Symbol.for("targetX"), tHumanLoc[1]);
    this.setProperty(Symbol.for("targetY"), tHumanLoc[2]);
    tSideThreshold = 200;
    if (objectp(this.pWindow)) {
      tSideThreshold = this.pWindow.getProperty(Symbol.for("width")) - 10;
    }
    if (tHumanLoc[1] < tSideThreshold) {
      this.selectPointerAndPosition(7);
    } else {
      this.selectPointerAndPosition(4);
    }
  }
}
