export default class {
  pGeometry;
  pSprite;
  pLastLoc;
  pLastCrd;

  construct() {
    this.pGeometry = VOID;
    this.pSprite = VOID;
    this.pLastLoc = point(0, 0);
    this.pLastCrd = VOID;
    return 1;
  }

  deconstruct() {
    this.pGeometry = VOID;
    if (ilk(this.pSprite) == Symbol.for("sprite")) {
      this.pSprite.visible = 0;
    }
    this.pSprite = VOID;
    this.pLastLoc = VOID;
    return 1;
  }

  define(tdata) {
    this.pGeometry = getObject(tdata[Symbol.for("geometry")]);
    this.pSprite = tdata[Symbol.for("sprite")];
    return 1;
  }

  update() {
    if (the.mouseLoc == this.pLastLoc) {
      return;
    }
    this.pLastLoc = the.mouseLoc;
    let tCrd = this.pGeometry.getWorldCoordinate(the.mouseH, the.mouseV);
    if (the.optionDown) {
      if (this.pLastCrd != tCrd) {
        put(tCrd);
      }
    }
    this.pLastCrd = tCrd;
    if (!tCrd) {
      this.pSprite.locH = -10000;
      this.pSprite.locV = -10000;
    } else {
      let tScreenCoord = this.pGeometry.getScreenCoordinate(tCrd[1], tCrd[2], tCrd[3]);
      this.pSprite.locH = tScreenCoord[1];
      this.pSprite.locV = tScreenCoord[2];
    }
  }

  redirectEvent(tEvent, tSprID, tParam) {
    this.pSprite.visible = 0;
    call(tEvent, [sprite(the.rollover)]);
    this.pSprite.visible = 1;
  }
}
