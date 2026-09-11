export default class {
  pSprite;
  pOffset;
  pTurnPnt;
  pDirection;

  define(tsprite, tCount) {
    if (tCount % 2) {
      tdir = Symbol.for("right");
    } else {
      tdir = Symbol.for("left");
    }
    this.pSprite = tsprite;
    this.pOffset = list(0, 0);
    this.pTurnPnt = 0;
    this.pDirection = tdir;
    this.reset();
    return 1;
  }

  reset() {
    tmodel = list("car1", "car1", "bus1", "cab1")[random(4)];
    if (this.pDirection == Symbol.for("left")) {
      this.pSprite.castNum = getmemnum(tmodel);
      this.pSprite.flipH = 0;
      this.pSprite.loc = point(740, 498);
      this.pOffset = list(-2, -1);
      this.pTurnPnt = 488;
    } else {
      this.pSprite.castNum = getmemnum(tmodel);
      this.pSprite.flipH = 1;
      this.pSprite.loc = point(184, 505);
      this.pOffset = list(2, -1);
      this.pTurnPnt = 490;
    }
    this.pSprite.width = this.pSprite.member.width;
    this.pSprite.height = this.pSprite.member.height;
    if (tmodel == "car1") {
      this.pSprite.ink = 41;
      this.pSprite.backColor = random(150) + 20;
    } else {
      this.pSprite.ink = 36;
      this.pSprite.backColor = 0;
    }
  }

  update() {
    this.pSprite.loc = this.pSprite.loc + this.pOffset;
    if (this.pSprite.locH == this.pTurnPnt) {
      this.pOffset[2] = -this.pOffset[2];
      tMemName = this.pSprite.member.name;
      tDirNum = integer(tMemName.char[length(tMemName)]);
      tDirNum = !(tDirNum - 1) + 1;
      tMemName = `${tMemName.char[`${1}..${length(tMemName) - 1}`]}${tDirNum}`;
      this.pSprite.castNum = getmemnum(tMemName);
    }
    if (this.pSprite.locV > 510) {
      return this.reset();
    }
  }
}
