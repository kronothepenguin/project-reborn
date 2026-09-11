export default class {
  pWallPatterns;
  pWallDefined;
  pWallModel;
  pFloorPatterns;
  pFloorDefined;
  pFloorModel;
  pLandscapeMngr;

  construct() {
    this.pWallPatterns = field("wallpattern_patterns");
    this.pFloorPatterns = field("floorpattern_patterns");
    this.pWallDefined = 0;
    this.pFloorDefined = 0;
    this.pWallModel = string(getVariable("room.default.wall", "201"));
    this.pFloorModel = string(getVariable("room.default.floor", "203"));
    this.pLandscapeMngr = createObject("landscape_manager", "Landscape Manager");
    registerMessage(Symbol.for("colorizeRoom"), this.getID(), Symbol.for("renderRoomBackground"));
    registerMessage(Symbol.for("setDimmerColor"), this.getID(), Symbol.for("setRoomDimmerColor"));
    this.setRoomDimmerColor(rgb(255, 255, 255));
    return 1;
  }

  deconstruct() {
    if (objectExists("landscape_manager")) {
      removeObject("landscape_manager");
    }
    unregisterMessage(Symbol.for("colorizeRoom"), this.getID());
    unregisterMessage(Symbol.for("setDimmerColor"), this.getID());
  }

  prepare() {
    let tStamp = EMPTY;
    for (let tNo = 1; tNo <= 100; tNo++) {
      const tChar = numToChar(random(48) + 74);
      tStamp = `${tStamp}${tChar}`;
    }
    const tFuseReceipt = getSpecialServices().getReceipt(tStamp);
    const tReceipt = list();
    for (let tCharNo = 1; tCharNo <= tStamp.length; tCharNo++) {
      let tChar = chars(tStamp, tCharNo, tCharNo);
      tChar = charToNum(tChar);
      tChar = (tChar * tCharNo) + 309203;
      tReceipt[tCharNo] = tChar;
    }
    if (tReceipt != tFuseReceipt) {
      error(this, "Invalid build structure", Symbol.for("prepare"), Symbol.for("critical"));
      createTimeout(Symbol.for("builddisconnect"), 3000, Symbol.for("disconnect"), getThread(Symbol.for("login")).getComponent().getID(), VOID, 1);
    }
    if (!this.pWallDefined) {
      this.setWallPaper(this.pWallModel);
    }
    if (!this.pFloorDefined) {
      this.setFloorPattern(this.pFloorModel);
    }
    return 1;
  }

  setProperty(tKey, tValue) {
    switch (tKey) {
      case "wallpaper":
        return this.setWallPaper(tValue);
      case "floor":
        return this.setFloorPattern(tValue);
    }
  }

  setWallPaper(tIndex) {
    const tField = this.pWallPatterns.line[integer(tIndex.char[`${1}..${length(tIndex) - 2}`])];
    if (tField == EMPTY) {
      return error(this, `${"Invalid wall color index:"} ${tIndex}`, Symbol.for("setWallPaper"), Symbol.for("major"));
    }
    if (!memberExists(tField)) {
      error(this, `${"Invalid wall color index:"} ${tIndex}`, Symbol.for("setWallPaper"), Symbol.for("minor"));
      return this.setWallPaper(string(getVariable("room.default.wall")));
    }
    const tmodel = field(tField);
    const tPattern = tmodel.line[integer(tIndex.char[`${length(string(tIndex)) - 1}..${length(string(tIndex))}`])];
    if (tPattern == EMPTY) {
      return error(this, `${"Invalid wall color index:"} ${tIndex}`, Symbol.for("setWallPaper"), Symbol.for("major"));
    }
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    const ttype = tPattern.item[1];
    const tPalette = tPattern.item[2];
    const tR = integer(tPattern.item[3]);
    const tG = integer(tPattern.item[4]);
    const tB = integer(tPattern.item[5]);
    let tColor = rgb(tR, tG, tB);
    const tColors = propList("left", tColor - rgb(16, 16, 16), "right", tColor, "a", tColor - rgb(16, 16, 16), "b", tColor);
    the.itemDelimiter = "_";
    const tPieceList = getThread(Symbol.for("room")).getComponent().getPassiveObject(Symbol.for("list"));
    let tObjPieceCount = 0;
    for (const tPiece of tPieceList) {
      const tSprList = tPiece.getSprites();
      for (const tSpr of tSprList) {
        const tdir = tSpr.member.name.item[1];
        const tName = tSpr.member.name.item[2];
        const tdata = tSpr.member.name.char[`${length(tSpr.member.name) - 7}..${length(tSpr.member.name)}`];
        tColor = tdir;
        if (tColor == "corner") {
          if (tdata.char[2] == "a") {
            tColor = "right";
          } else {
            tColor = "left";
          }
        }
        if (memberExists(`${tdir}_${tName}_${ttype}${tdata}`)) {
          tSpr.member = member(getmemnum(`${tdir}_${tName}_${ttype}${tdata}`));
          tSpr.bgColor = tColors[tColor];
          tSpr.member.paletteRef = member(getmemnum(tPalette));
          tObjPieceCount = tObjPieceCount + 1;
          if (this.pWallDefined == 0) {
            tSpr.locZ = tSpr.locZ - 975;
          }
          if (tSpr.blend == 100) {
            tSpr.ink = 41;
          }
          continue;
        }
        error(this, `${"Wall member not found:"} ${tdir}_${tName}_${ttype}${tdata}`, Symbol.for("setWallPaper"), Symbol.for("minor"));
      }
    }
    the.itemDelimiter = tDelim;
    const tViz = this.getRoomVisualizer();
    let tWrappedWallPartsDefined;
    if (objectp(tViz)) {
      const tWrappedWallParts = tViz.getWrappedParts([Symbol.for("wallleft"), Symbol.for("wallright")]);
      if (tWrappedWallParts.count > 0) {
        for (const tWrapper of tWrappedWallParts) {
          tWrapper.setPartPattern(ttype, tPalette, tColors["left"], Symbol.for("wallleft"));
          tWrapper.setPartPattern(ttype, tPalette, tColors["right"], Symbol.for("wallright"));
          tWrappedWallPartsDefined = 1;
        }
      } else {
        tWrappedWallPartsDefined = 0;
      }
    }
    if ((tPieceList.count == 0) && !tWrappedWallPartsDefined) {
      this.pWallModel = tIndex;
      this.pWallDefined = 0;
      return 0;
    } else {
      this.pWallDefined = 1;
      return 1;
    }
  }

  setFloorPattern(tIndex) {
    const tField = this.pFloorPatterns.line[integer(tIndex.char[`${1}..${length(tIndex) - 2}`])];
    if (tField == EMPTY) {
      return error(this, `${"Invalid floor color index:"} ${tIndex}`, Symbol.for("setFloorPattern"), Symbol.for("major"));
    }
    if (!memberExists(tField)) {
      error(this, `${"Invalid floor color index:"} ${tIndex}`, Symbol.for("setFloorPatterns"), Symbol.for("minor"));
      return this.setFloorPattern(string(getVariable("room.default.floor")));
    }
    const tmodel = field(tField);
    const tPattern = tmodel.line[integer(tIndex.char[`${length(string(tIndex)) - 1}..${length(string(tIndex))}`])];
    if (tPattern == EMPTY) {
      return error(this, `${"Invalid floor color index:"} ${tIndex}`, Symbol.for("setFloorPattern"), Symbol.for("major"));
    }
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    const ttype = tPattern.item[1];
    const tPalette = tPattern.item[2];
    const tR = integer(tPattern.item[3]);
    const tG = integer(tPattern.item[4]);
    const tB = integer(tPattern.item[5]);
    let tColor = rgb(tR, tG, tB);
    let tVisualizer = this.getRoomVisualizer();
    if (!objectp(tVisualizer)) {
      this.pFloorModel = tIndex;
      this.pFloorDefined = 0;
      return 0;
    }
    tVisualizer = this.getRoomVisualizer();
    if (!objectp(tVisualizer)) {
      return 0;
    }
    let tPieceId = 1;
    let tSpr = tVisualizer.getSprById(`${"floor"}${tPieceId}`);
    tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    while (!(tSpr == 0)) {
      const tMem = tSpr.member.name;
      const tClass = `${tMem.item[1]}_${tMem.item[2]}_`;
      const tLayer = `${tMem.item[4]}_`;
      const tObs1 = `${tMem.item[5]}_`;
      const tdir = `${tMem.item[6]}_`;
      const tObs2 = tMem.item[7];
      const tNewMemName = `${tClass}${ttype}_${tLayer}${tObs1}${tdir}${tObs2}`;
      if (memberExists(tNewMemName)) {
        tSpr.member = member(tNewMemName);
      }
      tSpr.bgColor = tColor;
      tSpr.member.paletteRef = member(getmemnum(tPalette));
      tSpr.ink = 41;
      tSpr.locZ = tSpr.locZ - 1000000;
      tPieceId = tPieceId + 1;
      tSpr = tVisualizer.getSprById(`${"floor"}${tPieceId}`);
    }
    the.itemDelimiter = tDelim;
    const tWrappedParts = tVisualizer.getWrappedParts([Symbol.for("floor")]);
    for (const tWrapper of tWrappedParts) {
      tWrapper.setPartPattern(ttype, tPalette, tColor, Symbol.for("floor"));
    }
    the.itemDelimiter = tDelim;
    this.pFloorDefined = 1;
    return 1;
  }

  renderRoomBackground(tColor) {
    const tVisualizer = this.getRoomVisualizer();
    if (objectp(tVisualizer)) {
      tVisualizer.renderWrappedParts(tColor);
    }
  }

  setRoomDimmerColor(tColor) {
    const tVisualizer = this.getRoomVisualizer();
    if (objectp(tVisualizer)) {
      tVisualizer.setDimmerColor(tColor);
    }
  }

  getRoomVisualizer() {
    if (threadExists(Symbol.for("room"))) {
      const tInterface = getThread(Symbol.for("room")).getInterface();
      const tComponent = getThread(Symbol.for("room")).getComponent();
      if (tComponent.getRoomID() == "private") {
        const tVisualizer = getThread(Symbol.for("room")).getInterface().getRoomVisualizer();
        if (objectp(tVisualizer)) {
          return tVisualizer;
        }
      }
    }
    return 0;
  }

  insertWallMaskItem(tID, tClassID, tloc, tdir, tSize) {
    if (objectp(this.pLandscapeMngr)) {
      this.pLandscapeMngr.insertWallMaskItem(tID, tClassID, tloc, tdir, tSize);
    }
  }

  removeWallMaskItem(tID) {
    if (objectp(this.pLandscapeMngr)) {
      this.pLandscapeMngr.removeWallMaskItem(tID);
    }
  }

  setLandscape(ttype, tScale) {
    if (objectp(this.pLandscapeMngr)) {
      this.pLandscapeMngr.setLandscape(ttype, tScale);
    }
  }

  setLandscapeAnimation(tID, tScale) {
    if (objectp(this.pLandscapeMngr)) {
      this.pLandscapeMngr.setLandscapeAnimation(tID, tScale);
    }
  }

  getWallMaskCount() {
    if (objectp(this.pLandscapeMngr)) {
      return this.pLandscapeMngr.getWallMaskCount();
    }
  }
}
