import { rect, rgb } from "../../director";

export default function () {
  let tW, tH, tXW, tXH, tOffH, tOffV, tXi, tYi, tRect;

  return {
    pimage: undefined,
    pLocX: undefined,
    pLocY: undefined,
    pwidth: undefined,
    pheight: undefined,
    pScaleH: undefined,
    pScaleV: undefined,
    pBuffer: undefined,
    pParams: undefined,

    feedImage(tImage) {
      this.pimage = tImage;
      this.render();
      return 1;
    },

    moveTo(tX, tY) {
      this.pLocX = tX;
      this.pLocY = tY;
      this.render();
    },

    moveBy(tX, tY) {
      this.pLocX = this.pLocX + tX;
      this.pLocY = this.pLocY + tY;
      this.render();
    },

    resizeTo(tX, tY) {
      tOffH = tX - this.pwidth;
      tOffV = tY - this.pheight;
      return this.resizeBy(tOffH, tOffV);
    },

    resizeBy(tOffH, tOffV) {
      if (tOffH !== 0 || tOffV !== 0) {
        switch (this.pScaleH) {
          case Symbol.for("move"):
            this.pLocX = this.pLocX + tOffH;
            break;
          case Symbol.for("scale"):
            this.pwidth = this.pwidth + tOffH;
            break;
          case Symbol.for("center"):
            this.pLocX = this.pLocX + tOffH / 2;
            break;
        }
        switch (this.pScaleV) {
          case Symbol.for("move"):
            this.pLocY = this.pLocY + tOffV;
            break;
          case Symbol.for("scale"):
            this.pheight = this.pheight + tOffV;
            break;
          case Symbol.for("center"):
            this.pLocY = this.pLocY + tOffV / 2;
            break;
        }
        this.render();
      }
    },

    render() {
      tW = this.pimage.width;
      tH = this.pimage.height;
      tXW = this.pwidth / this.pimage.width;
      tXH = this.pheight / this.pimage.height;
      for (let i = 0; i <= tXW - 1; i++) {
        for (let j = 0; j <= tXH - 1; j++) {
          tXi = this.pLocX + i * tW;
          tYi = this.pLocY + j * tH;
          tRect = rect(tXi, tYi, tXi + tW, tYi + tH);
          this.pBuffer.image.copyPixels(this.pimage, tRect, this.pimage.rect, this.pParams);
        }
      }
    },

    draw() {
      this.pBuffer.image.draw(rect(this.pLocX, this.pLocY, this.pLocX + this.pwidth, this.pLocY + this.pheight), { [Symbol.for("shapeType")]: Symbol.for("rect"), [Symbol.for("color")]: rgb(255, 0, 128) });
    },
  };
}
