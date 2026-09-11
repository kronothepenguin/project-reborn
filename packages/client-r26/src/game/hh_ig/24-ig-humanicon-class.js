export default class {
  pUserId;
  pGameId;
  pGameType;
  pOwnGame;
  pSprite;
  pSize;
  pLastLoc;
  pLastDir;
  pSelfCheckCounter;
  pAnimCounter;
  pMemberName;
  pAnimFrame;

  construct() {
    pLastLoc = VOID;
    pLastDir = VOID;
    pUserId = EMPTY;
    pOwnGame = 0;
    return 1;
  }

  deconstruct() {
    if (pSprite.ilk == Symbol.for("sprite")) {
      releaseSprite(pSprite.spriteNum);
    }
    return 1;
  }

  show_ig_icon(tParams) {
    const tXFactor = getThread(Symbol.for("room")).getInterface().getGeometry().pXFactor;
    if (integer(tXFactor) > 32) {
      pSize = "h";
    } else {
      pSize = "sh";
    }
    pGameType = tParams.getaProp("gametype");
    pGameId = tParams.getaProp("gameid");
    pUserId = tParams.getaProp("userid");
    this.checkMemberName();
    if (!(pSprite.ilk == Symbol.for("sprite"))) {
      const tMemNum = getmemnum(`${pMemberName}0`);
      if (tMemNum <= 0) {
        return 0;
      }
      const tSpriteNum = reserveSprite(`IGBubble_${pUserId}`);
      if (tSpriteNum < 1) {
        return 0;
      }
      pSprite = sprite(tSpriteNum);
      pSprite.member = member(tMemNum);
      pSprite.blend = 80;
      pSprite.ink = 8;
      pSprite.locZ = tParams.getaProp("locz");
      const tTargetID = "ig_interface";
      setEventBroker(pSprite.spriteNum, `${pGameId}_${pGameType}`);
      pSprite.registerProcedure(Symbol.for("eventProcMouseDownIcon"), tTargetID, Symbol.for("mouseDown"));
      pSprite.registerProcedure(Symbol.for("eventProcRollOverIcon"), tTargetID, Symbol.for("mouseEnter"));
      pSprite.registerProcedure(Symbol.for("eventProcRollOverIcon"), tTargetID, Symbol.for("mouseLeave"));
      pSprite.visible = 1;
      pAnimCounter = 0;
      pLastLoc = VOID;
      pLastDir = VOID;
      pAnimFrame = 0;
    }
    this.update();
    return 1;
  }

  hide() {
    pSprite.loc = point(-1000, -1000);
    return 1;
  }

  Refresh() {
    return 1;
  }

  update() {
    pAnimCounter = pAnimCounter + 1;
    if (pAnimCounter > 2) {
      pAnimCounter = 0;
      if (pSelfCheckCounter < 10) {
        pSelfCheckCounter = pSelfCheckCounter + 1;
      } else {
        pSelfCheckCounter = 0;
        this.checkMemberName();
      }
      pAnimFrame = pAnimFrame + 1;
      if (pAnimFrame > 3) {
        pAnimFrame = 0;
      }
      const tMemNum = getmemnum(`${pMemberName}${pAnimFrame}`);
      if (tMemNum <= 0) {
        return 0;
      }
      pSprite.member = member(tMemNum);
    }
    const tHumanObj = getThread(Symbol.for("room")).getComponent().getUserObject(pUserId);
    if (tHumanObj == 0) {
      return this.hide();
    }
    const tHumanLoc = tHumanObj.getPartLocation("hd");
    const tHumanDir = tHumanObj.getDirection();
    if (voidp(pLastLoc)) {
      pLastLoc = point(0, 0);
    }
    let tChanges;
    if (tHumanDir != pLastDir) {
      tChanges = 1;
    } else {
      if (tHumanLoc != pLastLoc) {
        if (tHumanLoc[1] != pLastLoc[1]) {
          tChanges = 1;
        } else {
          if (abs(tHumanLoc[2] - pLastLoc[2]) > 1) {
            tChanges = 1;
          }
        }
      }
    }
    if (!tChanges) {
      return 1;
    }
    pSprite.locZ = tHumanObj.getProperty(Symbol.for("locZ")) + 3200;
    pLastLoc = tHumanLoc;
    pLastDir = tHumanDir;
    if (pSize == "h") {
      const tLocV = tHumanLoc[2] - 65;
      switch (tHumanDir) {
        case 7:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 2, tLocV);
          break;
        case 6:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) + 1, tLocV);
          break;
        case 5:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) + 2, tLocV);
          break;
        case 4:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 1, tLocV);
          break;
        case 3:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 2, tLocV);
          break;
        case 2:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 2, tLocV);
          break;
        case 1:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2), tLocV);
          break;
        case 0:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 1, tLocV);
          break;
      }
    } else {
      const tLocV = tHumanLoc[2] - 44;
      switch (tHumanDir) {
        case 7:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 2, tLocV);
          break;
        case 6:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 1, tLocV);
          break;
        case 5:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 1, tLocV);
          break;
        case 4:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) + 1, tLocV);
          break;
        case 3:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 2, tLocV);
          break;
        case 2:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 2, tLocV);
          break;
        case 1:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 1, tLocV);
          break;
        case 0:
          pSprite.loc = point(tHumanLoc[1] - (pSprite.width / 2) - 2, tLocV);
          break;
      }
    }
  }

  checkMemberName() {
    const tThread = getThread(Symbol.for("ig"));
    if (tThread == 0) {
      return 0;
    }
    const tComponent = tThread.getComponent();
    const tService = tComponent.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    if (tService.getJoinedGameId() == pGameId) {
      pOwnGame = 1;
    } else {
      pOwnGame = 0;
    }
    pMemberName = `ig_iconbubble_${pGameType}_${pOwnGame}_`;
    if (pSize == "sh") {
      pMemberName = `s_${pMemberName}`;
    }
    return 1;
  }
}
