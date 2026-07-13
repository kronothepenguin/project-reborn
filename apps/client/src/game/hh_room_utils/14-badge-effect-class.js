export default class {
  pFrameCount;
  pAnimFrame;
  pStarSpr;
  pDestRect;
  pTargetElement;

  construct() {
    this.pFrameCount = 0;
    this.pAnimFrame = 9;
    if (this.pStarSpr.ilk != Symbol.for("sprite")) {
      this.pStarSpr = sprite(reserveSprite(this.getID()));
      this.pStarSpr.ink = 36;
    }
    receiveUpdate(this.getID());
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    if (this.pStarSpr.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pStarSpr.spriteNum);
    }
    return 1;
  }

  Init(tElem) {
    this.pTargetElement = tElem;
  }

  update() {
    this.pFrameCount = this.pFrameCount + 1;
    if ((this.pFrameCount % 3) != 0) {
      return;
    }
    this.pDestRect = this.pTargetElement.getProperty(Symbol.for("rect"));
    if (this.pDestRect.ilk == Symbol.for("rect")) {
      this.pAnimFrame = this.pAnimFrame + 1;
      if (this.pAnimFrame > 9) {
        this.pAnimFrame = 1;
        let tX = random(this.pDestRect.width) + this.pDestRect.left;
        let tY = random(this.pDestRect.height) + this.pDestRect.top;
        this.pStarSpr.loc = point(tX, tY);
      }
      this.pStarSpr.sprite.member = member(getmemnum(`starblink${this.pAnimFrame}`));
      if (objectExists(Symbol.for("session"))) {
        if (getObject(Symbol.for("session")).GET("badge_visible") == 0) {
          this.pStarSpr.sprite.visible = 0;
        } else {
          this.pStarSpr.sprite.visible = 1;
        }
      }
    }
  }
}
