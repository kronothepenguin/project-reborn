export default class {
  pLandscapeBgMngr;
  pLandscapeAnimMngr;
  pWallMaskMngr;
  pHasAnimation;
  pLandscapeMem;
  pwidth;
  pheight;
  pWideScreenOffset;
  pRemoveUpdate;
  pWallStruct;
  pTurnPointList;

  construct() {
    this.pLandscapeBgMngr = createObject("landscape_background_manager", "Landscape Background Manager");
    this.pLandscapeAnimMngr = createObject("landscape_animation_manager", "Landscape Animation Manager");
    this.pWallMaskMngr = createObject("wall_mask_manager", "Wall Mask Manager");
    this.pWideScreenOffset = 0;
    this.pRemoveUpdate = 0;
    if (threadExists(Symbol.for("room"))) {
      this.pWideScreenOffset = getThread(Symbol.for("room")).getInterface().getProperty(Symbol.for("widescreenoffset"));
    }
    this.pwidth = the.stageRight - the.stageLeft;
    this.pheight = integer(getVariable("landscape.height", 400));
    const tMemberName = "room_landscape";
    if (memberExists(tMemberName)) {
      this.pLandscapeMem = getMember(tMemberName);
    } else {
      createMember(tMemberName, Symbol.for("bitmap"));
      this.pLandscapeMem = getMember(tMemberName);
      this.pLandscapeMem.image = image(this.pwidth, this.pheight, 32);
    }
    return 1;
  }

  deconstruct() {
    if (objectExists("landscape_background_manager")) {
      removeObject("landscape_background_manager");
    }
    if (objectExists("landscape_animation_manager")) {
      removeObject("landscape_animation_manager");
    }
    if (objectExists("wall_mask_manager")) {
      removeObject("wall_mask_manager");
    }
    const tMemberName = "room_landscape";
    if (memberExists(tMemberName)) {
      removeMember(tMemberName);
    }
    this.pWallStruct = VOID;
    return 1;
  }

  insertWallMaskItem(tID, tClassID, tloc, tdir, tSize) {
    if (tloc.locV == -1000) {
      return 0;
    }
    this.pWallMaskMngr.insertWallMaskItem(tID, tClassID, tloc, tdir, tSize);
    if (this.pWallMaskMngr.getItemCount() == 1) {
      this.setActivate(1);
    }
    this.update();
  }

  removeWallMaskItem(tID) {
    this.pWallMaskMngr.removeWallMaskItem(tID);
    if (this.pWallMaskMngr.getItemCount() == 0) {
      this.setActivate(0);
    }
    this.update();
  }

  setActivate(tActive) {
    if (tActive) {
      const tViz = this.getRoomVisualizer();
      if (objectp(tViz)) {
        const tSpr = tViz.getSprById("landscape");
        if (ilk(tSpr) == Symbol.for("sprite")) {
          tSpr.member = this.pLandscapeMem;
          tSpr.blend = 100;
          tSpr.width = this.pwidth;
          tSpr.height = this.pheight;
          tSpr.locH = 0;
          tSpr.locV = 0;
          this.pLandscapeMem.regPoint = point(0, 0);
        }
      }
      if (this.pHasAnimation) {
        this.pLandscapeAnimMngr.setStopped(0);
      }
    } else {
      this.pLandscapeAnimMngr.setStopped(1);
    }
  }

  setLandscape(tLandscapeType, tRoomType) {
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    const tRoomTypeID = tRoomType.item[2];
    the.itemDelimiter = tDelim;
    if (tRoomTypeID == EMPTY) {
      return 0;
    }
    const tLimiter = the.itemDelimiter;
    the.itemDelimiter = ".";
    const tdata = propList();
    tdata[Symbol.for("width")] = this.pwidth;
    tdata[Symbol.for("height")] = this.pheight;
    tdata[Symbol.for("gradient")] = tLandscapeType.item[1];
    tdata[Symbol.for("type")] = tLandscapeType.item[2];
    tdata[Symbol.for("roomtypeid")] = tRoomTypeID;
    tdata[Symbol.for("offset")] = this.pWideScreenOffset;
    the.itemDelimiter = tLimiter;
    const tRoomWallStruct = this.getRoomWallStruct(tRoomType);
    const tFactorX = tRoomWallStruct.getaProp(Symbol.for("factorx"));
    const tLandscapeProps = this.getLandscapeProps(tdata[Symbol.for("type")], tFactorX);
    this.pLandscapeBgMngr.define(tdata, tRoomWallStruct, tLandscapeProps);
    if (tLandscapeProps != 0) {
      const tCloudFlag = tLandscapeProps.getaProp(Symbol.for("clouds"));
      if (voidp(tCloudFlag) || (tCloudFlag == 1)) {
        this.pHasAnimation = 1;
        this.setLandscapeAnimation(1, tRoomType, tdata[Symbol.for("type")]);
      } else {
        this.pHasAnimation = 0;
      }
    }
    this.updateLandscape();
    receiveUpdate(this.getID());
  }

  setLandscapeAnimation(tAnimationID, tRoomType, tLandscapeType) {
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    const tRoomTypeID = tRoomType.item[2];
    the.itemDelimiter = tDelim;
    if (tRoomTypeID == EMPTY) {
      return 0;
    }
    const tStruct = this.getRoomWallStruct(tRoomType);
    if (tStruct == VOID) {
      return 0;
    }
    const tdata = propList();
    tdata[Symbol.for("width")] = this.pwidth;
    tdata[Symbol.for("height")] = this.pheight;
    tdata[Symbol.for("wallheight")] = tStruct.getaProp(Symbol.for("height"));
    tdata[Symbol.for("id")] = tAnimationID;
    tdata[Symbol.for("roomtypeid")] = tRoomTypeID;
    tdata[Symbol.for("offset")] = this.pWideScreenOffset;
    tdata[Symbol.for("landscape")] = tLandscapeType;
    this.pLandscapeAnimMngr.define(tdata, this.getRoomTurnPointList(tRoomType));
    if (this.pWallMaskMngr.getItemCount() > 0) {
      this.setActivate(1);
    }
    this.updateLandscape();
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

  updateLandscape() {
    const tBgImg = this.pLandscapeBgMngr.getImage();
    if (tBgImg == 0) {
      return 0;
    }
    const tMask = this.pWallMaskMngr.getMask();
    const tLandscapeImg = this.pLandscapeMem.image;
    tLandscapeImg.fill(0, 0, this.pwidth, this.pheight, color(255, 255, 255));
    tLandscapeImg.copyPixels(tBgImg, tBgImg.rect, tBgImg.rect, propList(Symbol.for("maskImage"), tMask));
    const tViz = this.getRoomVisualizer();
    if (objectp(tViz)) {
      const tSpr = tViz.getSprById("landscape");
      if (tSpr.ilk == Symbol.for("sprite")) {
        this.pLandscapeAnimMngr.resetSprite(tSpr, tMask);
      }
    }
  }

  update() {
    if (this.pLandscapeBgMngr.requiresUpdate() || this.pWallMaskMngr.requiresUpdate()) {
      this.updateLandscape();
      if (this.pRemoveUpdate && !this.pWallMaskMngr.requiresUpdate() && !this.pLandscapeBgMngr.requiresUpdate()) {
        removeUpdate(this.getID());
        this.pRemoveUpdate = 0;
      } else {
        this.pRemoveUpdate = 1;
      }
    }
  }

  getRoomWallStruct(tRoomType) {
    if (this.pWallStruct == VOID) {
      this.parseRoomLayout(tRoomType);
    }
    return this.pWallStruct;
  }

  getRoomTurnPointList(tRoomType) {
    if (this.pTurnPointList == VOID) {
      this.parseRoomLayout(tRoomType);
    }
    return this.pTurnPointList;
  }

  parseRoomLayout(tRoomType) {
    const tRoomField = `${tRoomType}.room`;
    const tParser = getObject(Symbol.for("layout_parser"));
    if (tParser == 0) {
      return 0;
    }
    const tFieldData = tParser.parse(tRoomField);
    if (tFieldData == 0) {
      return 0;
    }
    const tRoomData = tFieldData.getaProp(Symbol.for("roomdata"))[1];
    const tElements = tFieldData.getaProp(Symbol.for("elements"));
    if (tElements == 0) {
      return 0;
    }
    this.pWallStruct = propList();
    const tWallPieceStruct = list();
    this.pTurnPointList = propList();
    let tLeft = 0;
    let tRight = 0;
    let tWallHeight = 0;
    let tMaxPieceHeight = 0;
    const tOffsetX = tRoomData.getaProp(Symbol.for("offsetx"));
    const tOffsetY = tRoomData.getaProp(Symbol.for("offsety"));
    const tFactorX = tRoomData.getaProp(Symbol.for("factorx"));
    for (const tElement of tElements) {
      const tWrapperId = tElement.getaProp(Symbol.for("wrapperID"));
      const tmember = tElement.getaProp(Symbol.for("member"));
      if ((tmember.indexOf("wallpart") > -1) || (tmember.indexOf("wallmask") > -1) || (tmember.indexOf("stairs") > -1)) {
        const tItem = propList();
        const tMemName = tElement.getaProp(Symbol.for("member"));
        const tLocH = tElement.getaProp(Symbol.for("locH"));
        let tHeight = tElement.getaProp(Symbol.for("height"));
        const tWidth = tElement.getaProp(Symbol.for("width"));
        tItem.setaProp(Symbol.for("member"), tMemName);
        tItem.setaProp(Symbol.for("locH"), tLocH);
        tItem.setaProp(Symbol.for("locV"), tElement.getaProp(Symbol.for("locV")));
        tItem.setaProp(Symbol.for("width"), tWidth);
        tItem.setaProp(Symbol.for("height"), tHeight);
        tItem.setaProp(Symbol.for("locX"), tElement.getaProp(Symbol.for("locX")));
        tItem.setaProp(Symbol.for("locY"), tElement.getaProp(Symbol.for("locY")));
        if (voidp(tLeft) || (tLeft > tLocH)) {
          tLeft = tLocH;
        }
        if (voidp(tRight) || (tRight < (tLocH + tWidth))) {
          tRight = tLocH + tWidth;
        }
        if (tHeight > tMaxPieceHeight) {
          tMaxPieceHeight = tHeight;
        }
        tWallPieceStruct.append(tItem);
        tHeight = tHeight - (tWidth / 2);
        if (tHeight > tWallHeight) {
          tWallHeight = tHeight;
        }
      }
    }
    let tSideLeftH = VOID;
    let tItem = tWallPieceStruct[1];
    let tWallDefIndex = 1;
    let tside = Symbol.for("left");
    let tSideRight = VOID;
    while (tItem != 0) {
      if (tWallDefIndex > tWallPieceStruct.count) {
        break;
      }
      tItem = tWallPieceStruct[tWallDefIndex];
      const tMemName = tItem.getaProp(Symbol.for("member"));
      const tmember = member(getmemnum(tMemName));
      let tPieceSide;
      if (tMemName.indexOf("right") > -1) {
        tPieceSide = Symbol.for("right");
      } else {
        tPieceSide = Symbol.for("left");
      }
      if (tPieceSide == tside) {
        const tLocH = tItem.getaProp(Symbol.for("locH")) - tmember.regPoint.locH;
        const tLocV = tItem.getaProp(Symbol.for("locV")) - tmember.regPoint.locV;
        if (voidp(tSideLeftH) || (!voidp(tSideLeftH) && (tLocH < tSideLeftH))) {
          tSideLeftH = tLocH;
          const tSideLeftV = tLocV;
          const tSideLeftElemWidth = tItem.getaProp(Symbol.for("width"));
        }
        tWallDefIndex = tWallDefIndex + 1;
      }
      if ((tPieceSide != tside) || (tWallDefIndex > tWallPieceStruct.count)) {
        if (tside == Symbol.for("right")) {
          tSideLeftV = tSideLeftV + 1;
        } else {
          tSideLeftV = tSideLeftV + (tSideLeftElemWidth / 2);
        }
        this.pTurnPointList.setaProp(point(tSideLeftH + this.pWideScreenOffset, tSideLeftV), tside);
        tSideLeftH = VOID;
        tside = tPieceSide;
      }
    }
    this.pWallStruct.setaProp(Symbol.for("struct"), tWallPieceStruct);
    this.pWallStruct.setaProp(Symbol.for("factorx"), tRoomData.getaProp(Symbol.for("factorx")));
    this.pWallStruct.setaProp(Symbol.for("height"), tWallHeight);
    this.pWallStruct.setaProp(Symbol.for("max_piece_height"), tMaxPieceHeight);
    return 1;
  }

  getLandscapeProps(tLandscapeID, tFactorX) {
    let tMemName = `lsd_${tLandscapeID}.props`;
    if (tFactorX == 32) {
      tMemName = `s_${tMemName}`;
    }
    if (!memberExists(tMemName)) {
      return propList();
    }
    const tPropList = value(field(tMemName));
    return tPropList;
  }

  getWallMaskCount() {
    if (objectp(this.pWallMaskMngr)) {
      return this.pWallMaskMngr.getItemCount();
    }
  }
}
