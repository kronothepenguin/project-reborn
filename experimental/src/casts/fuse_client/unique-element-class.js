/**
 * Unique Element Class
 * Translated from: 58_Unique Element Class.ls
 * Standalone window element with its own image/buffer.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { getmemnum } from './resource-api.js';

export class UniqueElement extends ObjectBase {
  constructor() {
    super();
    this.motherId = null;
    this.type = '';
    this.buffer = null;
    this.sprite = null;
    this.palette = null;
    this.scaleH = 'fixed';
    this.scaleV = 'fixed';
    this.locX = 0;
    this.locY = 0;
    this.width = 0;
    this.height = 0;
    this.visible = 1;
    this.depth = 32;
    this.image = null;
    this.params = null;
    this.props = null;
  }

  define(tProps) {
    this.id = tProps.id;
    this.motherId = tProps.mother;
    this.type = tProps.type;
    this.scaleH = tProps.scaleH;
    this.scaleV = tProps.scaleV;
    this.buffer = tProps.buffer;
    this.sprite = tProps.sprite;
    this.locX = tProps.locH;
    this.locY = tProps.locV;
    this.width = tProps.width;
    this.height = tProps.height;
    this.palette = tProps.palette;
    this.props = tProps;
    this.depth = 32;
    this.visible = 1;

    if (voidp(this.palette)) this.palette = null;

    const memNum = getmemnum(this.props.member);
    if (memNum > 0) {
      // Load member image
      this.image = null; // placeholder
    }

    if (!this.image) this.image = null;

    this.params = {};
    if (tProps.blend < 100) this.params.blend = tProps.blend;
    if (tProps.ink !== 0) this.params.ink = tProps.ink;
    if (Object.keys(this.params).length === 0) this.params = null;

    return 1;
  }

  prepare() {}
  show() { this.visible = 1; if (this.sprite) this.sprite.visible = true; return 1; }
  hide() { this.visible = 0; if (this.sprite) this.sprite.visible = false; return 1; }

  moveTo(tLocX, tLocY) {
    this.locX = tLocX;
    this.locY = tLocY;
    if (this.sprite) {
      this.sprite.locX = tLocX;
      this.sprite.locY = tLocY;
    }
  }

  moveBy(tOffX, tOffY) {
    this.locX += tOffX;
    this.locY += tOffY;
    if (this.sprite) {
      this.sprite.locX += tOffX;
      this.sprite.locY += tOffY;
    }
  }

  resizeTo(tX, tY) {
    return this.resizeBy(tX - (this.sprite?.width || this.width), tY - (this.sprite?.height || this.height));
  }

  resizeBy(tOffH, tOffV) {
    if (tOffH === 0 && tOffV === 0) return;

    switch (this.scaleH) {
      case 'move': this.moveBy(tOffH, 0); break;
      case 'scale': if (this.sprite) this.sprite.width += tOffH; break;
      case 'center': this.moveBy(tOffH / 2, 0); break;
    }
    switch (this.scaleV) {
      case 'move': this.moveBy(0, tOffV); break;
      case 'scale': if (this.sprite) this.sprite.height += tOffV; break;
      case 'center': this.moveBy(0, tOffV / 2); break;
    }

    this.width = this.sprite?.width || this.width;
    this.height = this.sprite?.height || this.height;
    this.render();
  }

  flipH() { /* flip image horizontally */ }
  flipV() { /* flip image vertically */ }

  getProperty(tProp) {
    switch (tProp) {
      case 'image': return this.image;
      case 'buffer': return this.buffer;
      case 'member': return this.buffer;
      case 'sprite': return this.sprite;
      case 'scaleH': return this.scaleH;
      case 'scaleV': return this.scaleV;
      case 'locX': return this.locX;
      case 'locY': return this.locY;
      case 'locZ': return this.sprite?.locZ;
      case 'width': return this.sprite?.width || this.width;
      case 'height': return this.sprite?.height || this.height;
      case 'depth': return this.depth;
      case 'blend': return this.sprite?.blend;
      case 'ink': return this.sprite?.ink;
      case 'visible': return this.visible;
      default: return 0;
    }
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case 'scaleH': this.scaleH = tValue; break;
      case 'scaleV': this.scaleV = tValue; break;
      case 'locX': this.moveTo(tValue, this.locY); break;
      case 'locY': this.moveTo(this.locX, tValue); break;
      case 'blend': if (this.sprite) this.sprite.blend = tValue; break;
      case 'ink': if (this.sprite) this.sprite.ink = tValue; break;
      case 'visible': if (tValue) this.show(); else this.hide(); break;
      case 'image': this.image = tValue; this.render(); break;
      default: return 0;
    }
    return 1;
  }

  render() {
    if (!this.image || !this.buffer?.image) return;
    // copyPixels image to buffer
  }

  draw(tRGB) {
    // Draw colored rect
  }
}

ObjectManager.registerClass('Unique Element Class', UniqueElement);
