export default class {
  pClass;
  pName;
  pCustom;
  pType;
  pSprList;
  pLocX;
  pLocY;
  pLocH;
  pLocZ;
  pXFactor;
  pWallX;
  pWallY;
  pLocalX;
  pLocalY;
  pFormatVer;
  pDirection;
  pParentWallLocZ;
  pPartColors;

  construct() {
    this.pClass = EMPTY;
    this.pName = EMPTY;
    this.pCustom = EMPTY;
    this.pType = EMPTY;
    this.pSprList = list();
    this.pLocX = 0;
    this.pLocY = 0;
    this.pLocH = 0;
    this.pLocZ = 0;
    this.pWallX = 0;
    this.pWallY = 0;
    this.pLocalX = 0;
    this.pLocalY = 0;
    this.pFormatVer = 0;
    this.pDirection = 0;
    this.pParentWallLocZ = VOID;
    return 1;
  }

  deconstruct() {
    for (const tSpr of this.pSprList) {
      releaseSprite(tSpr.spriteNum);
    }
    this.pParentWallLocZ = VOID;
    this.pSprList = list();
    return 1;
  }

  define(tProps) {
    this.pClass = tProps[Symbol.for("class")];
    this.pLocX = tProps[Symbol.for("x")];
    this.pLocY = tProps[Symbol.for("y")];
    this.pLocH = tProps[Symbol.for("h")];
    this.pLocZ = tProps[Symbol.for("z")];
    this.pLocalX = tProps[Symbol.for("local_x")];
    this.pLocalY = tProps[Symbol.for("local_y")];
    this.pWallX = tProps[Symbol.for("wall_x")];
    this.pWallY = tProps[Symbol.for("wall_y")];
    this.pFormatVer = tProps[Symbol.for("formatVersion")];
    this.pDirection = tProps[Symbol.for("direction")];
    this.pType = tProps[Symbol.for("type")];
    this.pXFactor = getThread(Symbol.for("room")).getInterface().getGeometry().pXFactor;
    switch (this.pClass) {
      case "poster":
        this.pName = getText(`poster_${this.pType}_name`, `poster_${this.pType}_name`);
        this.pCustom = getText(`poster_${this.pType}_desc`, `poster_${this.pType}_desc`);
        break;
      case "post.it.vd":
      case "post.it":
        this.pName = getText(`wallitem_${this.pClass}_name`, `wallitem_${this.pClass}_name`);
        this.pCustom = getText(`wallitem_${this.pClass}_desc`, `wallitem_${this.pClass}_desc`);
        break;
      case "photo":
        this.pName = getText(`wallitem_${this.pClass}_name`, `wallitem_${this.pClass}_name`);
        this.pCustom = getText(`wallitem_${this.pClass}_desc`, `wallitem_${this.pClass}_desc`);
        break;
    }
    if (this.solveMembers() == 0) {
      return 0;
    }
    if (this.prepare(tProps) == 0) {
      return 0;
    }
    this.updateLocation();
    return 1;
  }

  getClass() {
    return this.pClass;
  }

  setDirection(tDirection) {
    this.pDirection = tDirection;
  }

  getInfo() {
    const tInfo = propList();
    tInfo[Symbol.for("name")] = this.pName;
    tInfo[Symbol.for("class")] = this.pClass;
    tInfo[Symbol.for("custom")] = this.pCustom;
    tInfo[Symbol.for("smallmember")] = `${this.pClass}_small`;
    const tMemName = `${this.pClass} ${this.pType}_small`;
    if ((this.pClass == "poster") && memberExists(tMemName)) {
      tInfo[Symbol.for("image")] = member(getmemnum(tMemName)).image;
      return tInfo;
    }
    if (memberExists(`${this.pClass}_small`)) {
      tInfo[Symbol.for("image")] = member(getmemnum(`${this.pClass}_small`)).image;
    } else {
      let tTestMem2;
      if (this.pSprList.count > 0) {
        tTestMem2 = `${this.pSprList[1].member.name.char[`1..${length(this.pSprList[1].member.name) - 11}`]}small`;
        if (memberExists(tTestMem2)) {
          tInfo[Symbol.for("image")] = getMember(tTestMem2).image;
        } else {
          tInfo[Symbol.for("image")] = this.pSprList[1].member.image;
        }
      } else {
        tInfo[Symbol.for("image")] = getMember("no_icon_small").image;
      }
    }
    return tInfo;
  }

  getLocation() {
    return list(this.pWallX, this.pWallY);
  }

  getCustom() {
    return this.pCustom;
  }

  getSprites() {
    return this.pSprList;
  }

  select() {
    return 1;
  }

  hasURL() {
    return textExists(`item_ad_url_${this.pType}`);
  }

  GetUrl() {
    return getText(`item_ad_url_${this.pType}`);
  }

  prepare(tdata) {
    return 1;
  }

  solveColors(tpartColors) {
    if (voidp(tpartColors)) {
      tpartColors = "0,0,0";
    }
    this.pPartColors = list();
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    for (let i = 1; i <= tpartColors.item.count; i++) {
      this.pPartColors.add(string(tpartColors.item[i]));
    }
    for (let j = this.pPartColors.count; j <= 4; j++) {
      this.pPartColors.add("*ffffff");
    }
    the.itemDelimiter = tDelim;
  }

  solveInk(tPart, tClass) {
    if (voidp(tClass)) {
      tClass = this.pClass;
    }
    if (!memberExists(`${tClass}.props`)) {
      return 8;
    }
    const tPropList = value(field(getmemnum(`${tClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${tClass}.props is not valid!`, Symbol.for("solveInk"), Symbol.for("minor"));
      return 8;
    } else {
      if (voidp(tPropList[tPart])) {
        return 8;
      }
      if (!voidp(tPropList[tPart][Symbol.for("ink")])) {
        return tPropList[tPart][Symbol.for("ink")];
      }
    }
    return 8;
  }

  solveBlend(tPart, tClass) {
    if (voidp(tClass)) {
      tClass = this.pClass;
    }
    if (!memberExists(`${tClass}.props`)) {
      return 100;
    }
    const tPropList = value(field(getmemnum(`${tClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${tClass}.props is not valid!`, Symbol.for("solveBlend"), Symbol.for("minor"));
      return 100;
    } else {
      if (voidp(tPropList[tPart])) {
        return 100;
      }
      if (!voidp(tPropList[tPart][Symbol.for("blend")])) {
        return tPropList[tPart][Symbol.for("blend")];
      }
    }
    return 100;
  }

  solveLocZ(tPart, tdir, tClass) {
    if (voidp(tClass)) {
      tClass = this.pClass;
    }
    if (!memberExists(`${tClass}.props`)) {
      return 0;
    }
    const tPropList = value(field(getmemnum(`${tClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${tClass}.props is not valid!`, Symbol.for("solveLocZ"), Symbol.for("minor"));
      return 0;
    } else {
      if (voidp(tPropList[tPart])) {
        return 0;
      }
      if (voidp(tPropList[tPart][Symbol.for("zshift")])) {
        return 0;
      }
      if (tPropList[tPart][Symbol.for("zshift")].count <= tdir) {
        tdir = 0;
      }
    }
    return tPropList[tPart][Symbol.for("zshift")][tdir + 1];
  }

  solveLocShift(tPart, tdir, tClass) {
    if (voidp(tClass)) {
      tClass = this.pClass;
    }
    if (!memberExists(`${tClass}.props`)) {
      return 0;
    }
    const tPropList = value(field(getmemnum(`${tClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${tClass}.props is not valid!`, Symbol.for("solveLocShift"), Symbol.for("minor"));
      return 0;
    } else {
      if (voidp(tPropList[tPart])) {
        return 0;
      }
      if (voidp(tPropList[tPart][Symbol.for("locshift")])) {
        return 0;
      }
      if (tPropList[tPart][Symbol.for("locshift")].count <= tdir) {
        return 0;
      }
      const tShift = value(tPropList[tPart][Symbol.for("locshift")][tdir + 1]);
      if (ilk(tShift) == Symbol.for("point")) {
        return tShift;
      }
    }
    return 0;
  }

  solveMembers() {
    let tMemName;
    switch (this.pClass) {
      case "post.it":
      case "post.it.vd":
        tMemName = `${this.pDirection} ${this.pClass}`;
        break;
      case "poster":
        tMemName = `${this.pDirection} ${this.pClass} ${this.pType}`;
        break;
      case "photo":
        tMemName = `${this.pDirection} ${this.pClass}`;
        break;
      default:
        return error(this, `Unknown item class: ${this.pClass}`, Symbol.for("solveMembers"), Symbol.for("minor"));
    }
    if (this.pXFactor == 32) {
      tMemName = `s_${tMemName}`;
    }
    const tMemNum = getmemnum(tMemName);
    if (tMemNum != 0) {
      if (this.pSprList.count == 0) {
        const tSpr = sprite(reserveSprite(this.getID()));
        const tTargetID = getThread(Symbol.for("room")).getInterface().getID();
        setEventBroker(tSpr.spriteNum, this.getID());
        if (tMemNum < 1) {
          tMemNum = abs(tMemNum);
          tSpr.flipH = 1;
        }
        tSpr.castNum = tMemNum;
        tSpr.width = member(tMemNum).width;
        tSpr.height = member(tMemNum).height;
        tSpr.registerProcedure(Symbol.for("eventProcItemObj"), tTargetID, Symbol.for("mouseDown"));
        tSpr.registerProcedure(Symbol.for("eventProcItemRollOver"), tTargetID, Symbol.for("mouseEnter"));
        tSpr.registerProcedure(Symbol.for("eventProcItemRollOver"), tTargetID, Symbol.for("mouseLeave"));
        this.pSprList.add(tSpr);
      } else {
        const tSpr = this.pSprList[1];
      }
      this.updateColor(this.pType);
      return 1;
    }
    return 0;
  }

  setState(tValue) {
    this.updateColor(tValue);
  }

  updateColor(tHexstr) {
    if (!listp(this.pSprList)) {
      return 0;
    }
    if (this.pSprList.count < 1) {
      return 0;
    }
    const tSpr = this.pSprList[1];
    tSpr.ink = 8;
    if (this.pClass == "post.it") {
      if (tHexstr == EMPTY) {
        tHexstr = "#FFFF33";
      }
      tSpr.bgColor = rgb(tHexstr);
      tSpr.color = paletteIndex(255);
    } else {
      if (this.pClass == "post.it.vd") {
        tHexstr = "FFFFFF";
        tSpr.bgColor = rgb(tHexstr);
        tSpr.color = rgb(0, 0, 0);
      }
    }
  }

  updateLocation() {
    switch (this.pFormatVer) {
      case Symbol.for("old"):
        const tGeometry = getThread(Symbol.for("room")).getInterface().getGeometry();
        const tScreenLocs = tGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH * 18.0 / 32.0);
        for (const tSpr of this.pSprList) {
          tSpr.locH = tScreenLocs[1];
          tSpr.locV = tScreenLocs[2];
        }
        break;
      case Symbol.for("new"):
        const tWallObjs = getThread(Symbol.for("room")).getComponent().getPassiveObject(Symbol.for("list"));
        let tWallObjFound = 0;
        if (tWallObjs.count > 0) {
          for (const tWallObj of tWallObjs) {
            if ((tWallObj.getLocation()[1] == this.pWallX) && (tWallObj.getLocation()[2] == this.pWallY)) {
              const tWallSprites = tWallObj.getSprites();
              for (const tSpr of this.pSprList) {
                tSpr.locH = tWallSprites[1].locH - tWallSprites[1].member.regPoint[1] + this.pLocalX;
                tSpr.locV = tWallSprites[1].locV - tWallSprites[1].member.regPoint[2] + this.pLocalY;
              }
              tWallObjFound = 1;
              break;
            }
          }
        }
        if (!tWallObjFound) {
          const tVisualizer = getThread(Symbol.for("room")).getInterface().getRoomVisualizer();
          if (!voidp(tVisualizer)) {
            let tPartTypes;
            switch (this.pDirection) {
              case "leftwall":
                tPartTypes = list(Symbol.for("wallleft"));
                break;
              case "rightwall":
                tPartTypes = list(Symbol.for("wallright"));
                break;
            }
            const tLounge = tVisualizer.getProperty(Symbol.for("layout"));
            if ((tLounge == "model_a.room") && (this.pWallY == 1) && (this.pClass contains "post.it") && (this.pWallX > 0) && (this.pDirection == "rightwall")) {
              this.pWallY = 0;
            }
            const tPartProps = tVisualizer.getPartAtLocation(this.pWallX, this.pWallY, tPartTypes);
            if (ilk(tPartProps) == Symbol.for("propList")) {
              tWallObjFound = 1;
              for (const tSpr of this.pSprList) {
                const tMem = member(getmemnum(tPartProps.member));
                let tFixNegativeLoc = 0;
                if (tLounge == "model_b.room") {
                  if ((this.pWallX == 4) && (this.pWallY == 4) && (this.pLocalX < 0)) {
                    tFixNegativeLoc = 1;
                  }
                } else {
                  if (tLounge == "model_f.room") {
                    if ((this.pWallX == 2) && (this.pWallY == 6) && (this.pLocalX < 0)) {
                      tFixNegativeLoc = 1;
                    }
                    if ((this.pWallX == 6) && (this.pWallY == 2) && (this.pLocalX < 0)) {
                      tFixNegativeLoc = 1;
                    }
                  } else {
                    if (tLounge == "model_g.room") {
                      if ((this.pWallX == 6) && (this.pWallY == 4) && (this.pLocalX < 0)) {
                        tFixNegativeLoc = 1;
                      }
                    } else {
                      if (tLounge == "model_h.room") {
                        if ((this.pWallX == 4) && (this.pWallY == 8) && (this.pLocalX < 0)) {
                          tFixNegativeLoc = 1;
                        }
                      }
                    }
                  }
                }
                if (tFixNegativeLoc) {
                  this.pLocalX = 32 + this.pLocalX;
                }
                tSpr.locH = tPartProps.locH - tMem.regPoint[1] + this.pLocalX;
                tSpr.locV = tPartProps.locV - tMem.regPoint[2] + this.pLocalY;
              }
              this.pParentWallLocZ = tPartProps[Symbol.for("locZ")];
            }
          }
        }
        if (!(this.pClass contains "post.it")) {
          if (!tWallObjFound && getObject(Symbol.for("session")).GET(Symbol.for("room_owner"))) {
            const tComponent = getThread(Symbol.for("room")).getComponent();
            if (!(tComponent == 0)) {
              tComponent.getRoomConnection().send("ADDSTRIPITEM", `new item ${this.getID()}`);
            }
          }
        }
        break;
    }
    const tObjMover = getThread(Symbol.for("room")).getInterface().getObjectMover();
    if (!voidp(this.pParentWallLocZ)) {
      for (let i = 1; i <= this.pSprList.count; i++) {
        this.pSprList[i].locZ = this.pParentWallLocZ + 20000 + i;
      }
    } else {
      for (const tSpr of this.pSprList) {
        if (tSpr.member == member(0, 0)) {
          return error(this, "Spritelist contains empty sprite!", Symbol.for("updateLocation"), Symbol.for("minor"));
        }
        const tItemRp = tSpr.member.regPoint;
        const tItemR = rect(tSpr.locH, tSpr.locV, tSpr.locH, tSpr.locV) + rect(-tItemRp[1], -tItemRp[2], tSpr.member.width - tItemRp[1], tSpr.member.height - tItemRp[2]);
        const tPieceUnderSpr = tObjMover.getPassiveObjectIntersectingRect(tItemR)[1];
        if (objectp(tPieceUnderSpr)) {
          let tlocz = tPieceUnderSpr.getSprites()[1].locZ;
          if (tPieceUnderSpr.getSprites().count > 1) {
            if (tPieceUnderSpr.getSprites()[2].locZ > tPieceUnderSpr.getSprites()[1].locZ) {
              tlocz = tPieceUnderSpr.getSprites()[2].locZ;
            }
          }
          tSpr.locZ = tlocz + 2;
          continue;
        }
        tSpr.locZ = getIntVariable("window.default.locz") - 10000;
      }
    }
  }
}
