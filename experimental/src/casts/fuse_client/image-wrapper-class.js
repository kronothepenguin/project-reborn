/**
 * Image Wrapper Class
 * Translated from: 59_Image Wrapper Class.ls
 * Image display with scrolling support.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';

export class ImageWrapper extends ObjectBase {
  constructor() {
    super();
    this.ownX = 0;
    this.ownY = 0;
    this.ownW = 0;
    this.ownH = 0;
    this.offX = 0;
    this.offY = 0;
    this.scrolls = [];
    this.updateLock = 0;
  }

  prepare() {
    this.offX = 0;
    this.offY = 0;
    this.ownW = this.props?.width || 0;
    this.ownH = this.props?.height || 0;
    this.scrolls = [];
    this.updateLock = 0;

    if (this.props?.style === 'unique') {
      this.ownX = 0;
      this.ownY = 0;
    } else {
      this.ownX = this.props?.locH || 0;
      this.ownY = this.props?.locV || 0;
    }
  }

  feedImage(tImage) {
    if (!tImage || typeof tImage !== 'object') return 0;
    // Render image to buffer
    this.updateLock = 1;
    this.registerScroll();
    this.updateLock = 0;
    return 1;
  }

  clearImage() {
    // Clear image area
  }

  clearBuffer() {
    // Clear buffer
  }

  registerScroll(tID) {
    if (voidp(this.scrolls)) this.prepare();
    if (!voidp(tID) && !this.scrolls.includes(tID)) {
      this.scrolls.push(tID);
    } else if (this.scrolls.length === 0) {
      return 0;
    }
    // Notify scroll elements of source rect
  }

  adjustOffsetTo(tX, tY) {
    this.offX = tX;
    this.offY = tY;
    if (!this.updateLock) {
      this.clearImage();
      this.render();
    }
  }

  adjustOffsetBy(tOffX, tOffY) {
    this.offX += tOffX;
    this.offY += tOffY;
    if (!this.updateLock) {
      this.clearImage();
      this.render();
    }
  }

  setOffsetX(tX) { this.adjustOffsetTo(tX, this.offY); }
  setOffsetY(tY) { this.adjustOffsetTo(this.offX, tY); }
  getOffsetX() { return this.offX; }
  getOffsetY() { return this.offY; }

  resizeBy(tOffH, tOffV) {
    if (tOffH !== 0 || tOffV !== 0) {
      if (this.props?.style === 'unique') {
        switch (this.scaleH) {
          case 'move': this.moveBy(tOffH, 0); break;
          case 'scale': this.width += tOffH; break;
          case 'center': this.moveBy(tOffH / 2, 0); break;
        }
        switch (this.scaleV) {
          case 'move': this.moveBy(0, tOffV); break;
          case 'scale': this.height += tOffV; break;
          case 'center': this.moveBy(0, tOffV / 2); break;
        }
        if (this.width < 1) this.width = 1;
        if (this.height < 1) this.height = 1;
        this.ownW = this.width;
        this.ownH = this.height;
      }
      this.registerScroll();
      this.render();
    }
  }

  render() {
    if (!this.visible) return;
    // copyPixels from image to buffer at ownX/ownY with offX/offY offset
  }

  mouseDown() {
    return { x: this.offX + this.ownX, y: this.offY + this.ownY };
  }

  mouseUp() {
    return { x: this.offX + this.ownX, y: this.offY + this.ownY };
  }
}

ObjectManager.registerClass('Image Wrapper Class', ImageWrapper);
