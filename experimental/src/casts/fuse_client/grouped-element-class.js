/**
 * Grouped Element Class
 * Translated from: 57_Grouped Element Class.ls
 * Window element that renders a bitmap/image member.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { getmemnum } from './resource-api.js';

export class GroupedElement extends ObjectBase {
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
    this.depth = 32;
    this.image = null;
    this.params = null;
    this.props = null;
    this.visible = 1;
  }

  define(tProps) {
    this.id = tProps.id;
    this.motherId = tProps.mother;
    this.type = tProps.type;
    this.buffer = tProps.buffer;
    this.sprite = tProps.sprite;
    this.palette = tProps.palette;
    this.scaleH = tProps.scaleH;
    this.scaleV = tProps.scaleV;
    this.locX = tProps.locH;
    this.locY = tProps.locV;
    this.width = tProps.width;
    this.height = tProps.height;
    this.props = tProps;
    this.visible = 1;

    if (voidp(this.palette)) {
      this.palette = null;
    } else if (typeof this.palette === 'string') {
      const memNum = getmemnum(this.palette);
      if (memNum > 0) this.palette = { name: this.palette, number: memNum };
    }

    const memNum = this.props.member ? getmemnum(this.props.member) : 0;
    this.depth = 32;
    this.image = null;

    if (memNum > 0 && this.type !== 'image') {
      // In production, load the member image
      this.image = null; // placeholder
    }

    if (!this.image) {
      this.depth = 32;
      this.image = null; // placeholder 1x1
    }

    this.params = {};
    if (tProps.blend < 100) this.params.blend = tProps.blend;
    if (tProps.ink !== 0) this.params.ink = tProps.ink;
    if (Object.keys(this.params).length === 0) this.params = null;

    return 1;
  }

  prepare() {}

  moveTo(tLocX, tLocY) {
    this.locX = tLocX;
    this.locY = tLocY;
    this.render();
  }

  moveBy(tOffX, tOffY) {
    this.locX += tOffX;
    this.locY += tOffY;
    this.render();
  }

  resizeBy(tOffH, tOffV) {
    switch (this.scaleH) {
      case 'move': this.locX += tOffH; break;
      case 'center': this.locX += tOffH / 2; break;
      case 'scale': this.width += tOffH; break;
    }
    switch (this.scaleV) {
      case 'move': this.locY += tOffV; break;
      case 'center': this.locY += tOffV / 2; break;
      case 'scale': this.height += tOffV; break;
    }
    this.render();
  }

  flipH() {
    // Flip image horizontally
  }

  flipV() {
    // Flip image vertically
  }

  getProperty(tProp) {
    switch (tProp) {
      case 'buffer': return this.buffer;
      case 'sprite': return this.sprite;
      case 'width': return this.width;
      case 'height': return this.height;
      case 'locX': return this.locX;
      case 'locY': return this.locY;
      case 'scaleH': return this.scaleH;
      case 'scaleV': return this.scaleV;
      case 'depth': return this.depth;
      case 'palette': return this.palette;
      default: return 0;
    }
  }

  render() {
    if (!this.image || !this.buffer?.image) return;
    const targetRect = [this.locX, this.locY, this.locX + this.width, this.locY + this.height];
    // In production: copyPixels to buffer
  }

  draw(tRGB) {
    if (!this.buffer?.image) return;
    // Draw colored rect to buffer
  }
}

ObjectManager.registerClass('Grouped Element Class', GroupedElement);
