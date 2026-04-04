/**
 * Pattern Wrapper Class
 * Translated from: 62_Pattern Wrapper Class.ls
 * Tiled image pattern element.
 */
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';

export class PatternWrapper extends ObjectBase {
  constructor() {
    super();
  }

  feedImage(tImage) {
    this.image = tImage;
    this.render();
    return 1;
  }

  moveTo(tX, tY) {
    this.locX = tX;
    this.locY = tY;
    this.render();
  }

  moveBy(tX, tY) {
    this.locX += tX;
    this.locY += tY;
    this.render();
  }

  resizeTo(tX, tY) {
    return this.resizeBy(tX - this.width, tY - this.height);
  }

  resizeBy(tOffH, tOffV) {
    if (tOffH !== 0 || tOffV !== 0) {
      switch (this.scaleH) {
        case 'move': this.locX += tOffH; break;
        case 'scale': this.width += tOffH; break;
        case 'center': this.locX += tOffH / 2; break;
      }
      switch (this.scaleV) {
        case 'move': this.locY += tOffV; break;
        case 'scale': this.height += tOffV; break;
        case 'center': this.locY += tOffV / 2; break;
      }
      this.render();
    }
  }

  render() {
    if (!this.image || !this.buffer?.image) return;
    const imgW = this.image.width;
    const imgH = this.image.height;
    const tilesX = Math.ceil(this.width / imgW);
    const tilesY = Math.ceil(this.height / imgH);

    for (let i = 0; i < tilesX; i++) {
      for (let j = 0; j < tilesY; j++) {
        const xi = this.locX + (i * imgW);
        const yi = this.locY + (j * imgH);
        // copyPixels image at (xi, yi)
      }
    }
  }

  draw() {
    // Draw colored rect
  }
}

ObjectManager.registerClass('Pattern Wrapper Class', PatternWrapper);
