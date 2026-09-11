export default class {
  pLoc;
  pType;
  pimage;
  pTurnPoint;
  pRefLoc;
  pMinV;
  pMaxV;
  pMaxH;
  pImageLeft;
  pImageRight;
  pMatteLeft;
  pMatteRight;

  construct() {
    this.pLoc = point(0, 0);
    this.pRefLoc = point(0, 0);
    this.pImageLeft = image(1, 1, 8);
    this.pImageRight = image(1, 1, 8);
    this.pMatteLeft = this.pimage.createMatte();
    this.pMatteRight = this.pimage.createMatte();
    return 1;
  }

  deconstruct() {
    return 1;
  }

  define(tProps) {
    this.pType = tProps.getaProp(Symbol.for("type"));
    this.pMinV = tProps.getaProp(Symbol.for("minv"));
    this.pMaxV = tProps.getaProp(Symbol.for("maxv"));
    this.pMaxH = tProps.getaProp(Symbol.for("maxh"));
    this.pTurnPoint = tProps.getaProp(Symbol.for("turnpoint"));
    const tLocX = random(this.pMaxH);
    let tLocY = this.pMinV + random(this.pMaxV - this.pMinV) - (tLocX / 2);
    if (tLocX > this.pTurnPoint) {
      tLocY = tLocY + ((tLocX - this.pTurnPoint) / 2);
    }
    this.pLoc = point(tLocX, tLocY);
    this.pRefLoc = point(tLocX, tLocY);
    this.pImageLeft = member(getmemnum(`${"cloud_"}${this.pType}${"_left_x"}`)).image.duplicate();
    this.pImageRight = member(getmemnum(`${"cloud_"}${this.pType}${"_right_x"}`)).image.duplicate();
    this.pMatteLeft = this.pImageLeft.createMatte();
    this.pMatteRight = this.pImageRight.createMatte();
  }

  updateAnim() {
    this.pLoc[1] = this.pLoc[1] + 1;
    const tLocY = this.pLoc[2];
    if (this.pLoc[1] > the.stage.rect.width) {
      this.pLoc = point(0.0, random(the.stage.rect.height));
    }
  }

  render(tImage) {
    let tSourceImage;
    if (this.pLoc[1] < this.pTurnPoint) {
      tSourceImage = this.pImageLeft;
    } else {
      tSourceImage = this.pImageRight;
    }
    const tTargetRect = tSourceImage.rect + rect(this.pLoc[1], this.pLoc[2], this.pLoc[1], this.pLoc[2]);
    tImage.copyPixels(tSourceImage, tTargetRect, tSourceImage.rect, propList(Symbol.for("maskImage"), tSourceImage.createMatte()));
  }
}
