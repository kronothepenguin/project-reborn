export default class {
  pArrowSpr;
  pSize;
  pLastLoc;
  pLastDir;
  pUserId;
  pCounter;
  pAnimFlag;
  pAnimCntr;

  construct() {
    this.pArrowSpr = sprite(reserveSprite(this.getID()));
    this.pArrowSpr.ink = 8;
    this.pArrowSpr.visible = 0;
    this.pLastLoc = VOID;
    this.pLastDir = VOID;
    this.pUserId = EMPTY;
    this.pAnimFlag = 0;
    this.pAnimCntr = 0;
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    releaseSprite(this.pArrowSpr.spriteNum);
    return 1;
  }

  Init() {
    let tXFactor = getThread(Symbol.for("room")).getInterface().getGeometry().pXFactor;
    this.pArrowSpr.locZ = getIntVariable("window.default.locz") - 2020;
    this.pArrowSpr.visible = 0;
    if (integer(tXFactor) > 32) {
      this.pSize = "h";
    } else {
      this.pSize = "sh";
    }
  }

  show(tUserID, tAnimFlag) {
    if (stringp(tUserID)) {
      this.pUserId = tUserID;
    } else {
      this.pUserId = getThread(Symbol.for("room")).getInterface().getSelectedObject();
    }
    this.pArrowSpr.loc = point(-1000, -1000);
    this.pArrowSpr.visible = 1;
    this.pCounter = 0;
    this.pLastLoc = VOID;
    this.pLastDir = VOID;
    this.pAnimCntr = 0;
    this.pAnimFlag = tAnimFlag == 1;
    receiveUpdate(this.getID());
    return 1;
  }

  hide() {
    removeUpdate(this.getID());
    this.pArrowSpr.loc = point(-1000, -1000);
    this.pArrowSpr.visible = 0;
    return 1;
  }

  update() {
    this.pCounter = !this.pCounter;
    if (this.pCounter) {
      return;
    }
    let tHumanObj = getThread(Symbol.for("room")).getComponent().getUserObject(this.pUserId);
    if (tHumanObj == 0) {
      return this.hide();
    }
    let tHumanLoc = tHumanObj.getPartLocation("hd");
    let tHumanDir = tHumanObj.getDirection();
    let tChanges = 0;
    if (voidp(this.pLastLoc)) {
      this.pLastLoc = point(0, 0);
    }
    if (tHumanDir != this.pLastDir) {
      tChanges = 1;
    } else {
      if (tHumanLoc != this.pLastLoc) {
        if (tHumanLoc[1] != this.pLastLoc[1]) {
          tChanges = 1;
        } else {
          if (abs(tHumanLoc[2] - this.pLastLoc[2]) > 1) {
            tChanges = 1;
          }
        }
      }
    }
    if (tChanges) {
      this.pLastLoc = tHumanLoc;
      this.pLastDir = tHumanDir;
      let tdir = 2;
      if (tHumanDir < 4) {
        this.pArrowSpr.flipH = 0;
      } else {
        this.pArrowSpr.flipH = 1;
      }
      this.pArrowSpr.member = member(getmemnum(`puppet_hilite_${this.pSize}_${tdir}`));
      let tLocV = 0;
      if (this.pSize == "h") {
        tLocV = 60;
      } else {
        tLocV = 40;
      }
      this.pArrowSpr.loc = point(tHumanLoc[1], tHumanLoc[2] - tLocV);
      return 1;
    }
    let tLocV2 = 0;
    if (this.pSize == "h") {
      tLocV2 = 60;
    } else {
      tLocV2 = 40;
    }
    if (this.pAnimFlag) {
      this.pAnimCntr = (this.pAnimCntr + 4) % 32;
      let tOffY = tHumanLoc[2] + (-8 * sin(float(this.pAnimCntr) / 10));
      this.pArrowSpr.locV = tOffY - tLocV2;
    }
  }
}
