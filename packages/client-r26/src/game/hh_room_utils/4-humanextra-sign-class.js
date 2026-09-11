export default class {
  pSignSpr;
  pSignMem;

  construct() {
    this.pSignSpr = sprite(reserveSprite(this.getID()));
    return 1;
  }

  deconstruct() {
    releaseSprite(this.pSignSpr.spriteNum);
    this.pSignSpr = VOID;
    return 1;
  }

  Refresh() {
    this.pSignSpr.visible = 0;
  }

  show_sign(tProps) {
    let tSignMem = tProps["signmember"];
    let tHumanSpr = tProps["sprite"];
    let tDirection = tProps["direction"];
    if (this.pSignMem != tSignMem) {
      this.pSignSpr.ink = 8;
      this.pSignSpr.member = member(getmemnum(tSignMem));
      this.pSignMem = tSignMem;
    }
    let tSignLoc = tHumanSpr.loc;
    if (tDirection == 0) {
      tSignLoc.locH = tSignLoc.locH - 16;
    } else {
      if (tDirection == 4) {
        tSignLoc.locH = tSignLoc.locH;
      } else {
        if (tDirection == 6) {
          tSignLoc.locH = tSignLoc.locH - 18;
        }
      }
    }
    this.pSignSpr.loc = tSignLoc;
    this.pSignSpr.locZ = tHumanSpr.locZ + 1;
    this.pSignSpr.visible = 1;
  }
}
