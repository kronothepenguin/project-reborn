export default class {
  pSprite;

  construct() {
  }

  deconstruct() {
    if (ilk(this.pSprite) == Symbol.for("sprite")) {
      releaseSprite(this.pSprite.spriteNum);
    }
    this.pSprite = VOID;
  }

  define(tUserID) {
    let tUserObj = getThread(Symbol.for("room")).getComponent().getUserObject(tUserID);
    if (!tUserObj) {
      return 0;
    }
    this.pSprite = sprite(reserveSprite(this.getID()));
    let tPeopleSize = tUserObj.getProperty(Symbol.for("peoplesize"));
    let tLocOffset;
    if (tPeopleSize == "sh") {
      this.pSprite.member = member(getmemnum("chat_typing_bubble_small"));
      tLocOffset = point(18, -1);
    } else {
      this.pSprite.member = member(getmemnum("chat_typing_bubble"));
      tLocOffset = point(20, 0);
    }
    let tloc = tUserObj.getPartLocation("hd");
    this.pSprite.loc = tloc + tLocOffset;
    this.pSprite.ink = 8;
    this.pSprite.locZ = getIntVariable("window.default.locz") - 4000;
    receiveUpdate(this.getID());
  }

  update() {
    this.pSprite.loc = this.pSprite.loc + point(0, -10);
    if (this.pSprite.blend > 0) {
      this.pSprite.blend = this.pSprite.blend - 10;
    }
    if (this.pSprite.locV < -50) {
      removeUpdate(this.getID());
      this.deconstruct();
    }
  }
}
