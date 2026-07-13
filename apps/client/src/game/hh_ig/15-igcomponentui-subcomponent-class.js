export default class {
  pID;
  pMainThreadId;
  pWindowSetId;
  pWindowIdPrefix;
  pWindowID;
  pFlagManagerId;
  pWriterIdPlain;
  pWriterIdBold;
  pModalSpr;

  construct() {
    pWriterIdPlain = getUniqueID();
    pWriterIdBold = getUniqueID();
    pWindowIdPrefix = "ig";
    pWindowID = EMPTY;
    return this.ancestor.construct();
  }

  deconstruct() {
    if (pID == Symbol.for("modal")) {
      return this.removeModalWindow();
    }
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.removeMatchingSets(pWindowSetId);
    if (writerExists(pWriterIdPlain)) {
      removeWriter(pWriterIdPlain);
    }
    if (writerExists(pWriterIdBold)) {
      removeWriter(pWriterIdBold);
    }
    return this.ancestor.deconstruct();
  }

  setID(tID) {
    pID = tID;
  }

  addWindows() {
    if (pID == Symbol.for("modal")) {
      return this.createModalWindow();
    }
    return 1;
  }

  render() {
  }

  update() {
  }

  getOwnPlayerName() {
    const tSession = getObject(Symbol.for("session"));
    if (tSession == 0) {
      return 0;
    }
    if (!tSession.exists(Symbol.for("user_name"))) {
      return 0;
    }
    return tSession.GET(Symbol.for("user_name"));
  }

  getOwnPlayerGameIndex() {
    const tSession = getObject(Symbol.for("session"));
    if (tSession == 0) {
      return 0;
    }
    if (!tSession.exists("user_game_index")) {
      return -1;
    }
    const tIndex = tSession.GET("user_game_index");
    return tIndex;
  }

  getPlainWriter() {
    if (writerExists(pWriterIdPlain)) {
      return getWriter(pWriterIdPlain);
    }
    const tPlainStruct = getStructVariable("struct.font.plain");
    createWriter(pWriterIdPlain, tPlainStruct);
    return getWriter(pWriterIdPlain);
  }

  getBoldWriter() {
    if (writerExists(pWriterIdBold)) {
      return getWriter(pWriterIdBold);
    }
    const tBoldStruct = getStructVariable("struct.font.bold");
    tBoldStruct.setaProp(Symbol.for("fontStyle"), list(Symbol.for("underline")));
    createWriter(pWriterIdBold, tBoldStruct);
    return getWriter(pWriterIdBold);
  }

  alignIconImage(tImage, tWidth, tHeight) {
    if (tImage.ilk != Symbol.for("image")) {
      return 0;
    }
    const tNewImage = image(tWidth, tHeight, tImage.depth);
    const tOffsetX = (tWidth - tImage.width) / 2;
    const tOffsetY = tHeight - tImage.height;
    tNewImage.copyPixels(tImage, tImage.rect + rect(tOffsetX, tOffsetY, tOffsetX, tOffsetY), tImage.rect);
    return tNewImage;
  }

  getHeadImage(tFigure, tsex, tWidth, tHeight) {
    const tFigureObj = getObject("Figure_Preview");
    if (tFigureObj == 0) {
      return 0;
    }
    if (tFigure.ilk != Symbol.for("propList")) {
      const tParserObj = getObject("Figure_System");
      if (tParserObj == 0) {
        return 0;
      }
      tFigure = tParserObj.parseFigure(tFigure, tsex);
    }
    const tImage = tFigureObj.getHumanPartImg(Symbol.for("head"), tFigure, 2, "sh");
    if (voidp(tHeight)) {
      return tImage;
    } else {
      return this.alignIconImage(tImage, tWidth, tHeight);
    }
  }

  getWindowWrapper() {
    return getObject(Symbol.for("ig_window_wrapper"));
  }

  getMainThread() {
    return getObject(this.pMainThreadId);
  }

  getIGComponent(tID) {
    const tMainThreadRef = this.getMainThread();
    if (!objectp(tMainThreadRef)) {
      return 0;
    }
    return tMainThreadRef.getIGComponent(tID);
  }

  getWindowId(tParam) {
    if (voidp(tParam)) {
      return `${pWindowIdPrefix}_${pWindowID}`;
    } else {
      return `${pWindowIdPrefix}_${pWindowID}_${tParam}`;
    }
  }

  createModalWindow() {
    if (pModalSpr > 0) {
      return 1;
    }
    pModalSpr = reserveSprite(this.getID());
    const tsprite = sprite(pModalSpr);
    tsprite.member = member(getmemnum("null"));
    tsprite.blend = 70;
    tsprite.rect = rect(0, 0, the.stage.rect.width, the.stage.rect.height);
    const tVisualizer = getVisualizer("Room_visualizer");
    if (tVisualizer != 0) {
      tsprite.locZ = tVisualizer.getProperty(Symbol.for("locZ")) + 10000000;
    } else {
      tsprite.locZ = -10000000;
    }
    setEventBroker(tsprite.spriteNum, `${this.getID()}_spr`);
    return 1;
  }

  removeModalWindow() {
    if (pModalSpr > 0) {
      releaseSprite(pModalSpr);
      pModalSpr = VOID;
    }
    return 1;
  }

  removeMatchingSets(tWindowSetId, tRender) {
    if (tWindowSetId == VOID) {
      return 0;
    }
    const tIdLength = tWindowSetId.length;
    let i = 1;
    while (i <= this.pSetIndex.count) {
      const tTestString = this.pSetIndex[i];
      if (tTestString.char[`1..${tIdLength}`] == tWindowSetId) {
        this.removeSet(tTestString, tRender);
        continue;
      }
      i = i + 1;
    }
    return 1;
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    return 1;
  }
}
