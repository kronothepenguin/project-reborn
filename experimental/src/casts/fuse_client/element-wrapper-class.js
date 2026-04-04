/**
 * Element Wrapper Class
 * Translated from: 56_Element Wrapper Class.ls
 * Base element wrapper for window UI elements.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';

export class ElementWrapper extends ObjectBase {
  constructor() {
    super();
    this.elemList = [];
    this.palette = null;
    this.scaleH = 'fixed';
    this.scaleV = 'fixed';
    this.locX = 0;
    this.locY = 0;
    this.width = 0;
    this.height = 0;
    this.visible = 1;
    this.buffer = null;
    this.sprite = null;
  }

  construct() {
    this.elemList = [];
    this.palette = null;
    this.scaleH = 'fixed';
    this.scaleV = 'fixed';
    this.locX = 0;
    this.locY = 0;
    this.width = 0;
    this.height = 0;
    this.visible = 1;
    return 1;
  }

  deconstruct() {
    this.elemList = [];
    this.buffer = VOID;
    this.sprite = VOID;
    return 1;
  }

  define(tProps) {
    this.id = tProps.id;
    this.buffer = tProps.buffer;
    this.sprite = tProps.sprite;
    this.locX = tProps.locX;
    this.locY = tProps.locY;
    this.width = this.buffer?.width || 0;
    this.height = this.buffer?.height || 0;
    this.palette = this.buffer?.paletteRef || null;
    return 1;
  }

  add(tElement) {
    if (!tElement || typeof tElement !== 'object') return 0;
    if (tElement.getProperty?.('scaleH') !== 'fixed') this.scaleH = 'scale';
    if (tElement.getProperty?.('scaleV') !== 'fixed') this.scaleV = 'scale';
    this.elemList.push(tElement);
    return 1;
  }

  show() { this.visible = 1; if (this.sprite) this.sprite.visible = true; return 1; }
  hide() { this.visible = 0; if (this.sprite) this.sprite.visible = false; return 1; }

  moveTo(tLocX, tLocY) {
    this.moveBy(tLocX - this.locX, tLocY - this.locY);
  }

  moveBy(tOffX, tOffY) {
    this.locX += tOffX;
    this.locY += tOffY;
    if (this.sprite) {
      this.sprite.locX += tOffX;
      this.sprite.locY += tOffY;
    }
  }

  resizeBy(tOffW, tOffH) {
    if (tOffW === 0 && tOffH === 0) return;

    switch (this.scaleH) {
      case 'fixed': tOffW = 0; break;
      case 'scale': this.width += tOffW; break;
      case 'move': this.moveBy(tOffW, 0); break;
      case 'center': this.moveBy(tOffW / 2, 0); break;
    }
    if (this.scaleH !== 'scale') tOffW = 0;

    switch (this.scaleV) {
      case 'fixed': tOffH = 0; break;
      case 'scale': this.height += tOffH; break;
      case 'move': this.moveBy(0, tOffH); break;
      case 'center': this.moveBy(0, tOffH / 2); break;
    }
    if (this.scaleV !== 'scale') tOffH = 0;

    if (tOffW !== 0 || tOffH !== 0) {
      if (this.width < 1) this.width = 1;
      if (this.height < 1) this.height = 1;

      if (this.buffer?.image) {
        // Create new buffer with new dimensions
      }
      if (this.sprite) {
        this.sprite.width = this.width;
        this.sprite.height = this.height;
        this.sprite.stretch = false;
      }
    }
  }

  getProperty(tProp) {
    switch (tProp) {
      case 'image': return this.buffer?.image;
      case 'buffer': return this.buffer;
      case 'member': return this.buffer;
      case 'sprite': return this.sprite;
      case 'scaleH': return this.scaleH;
      case 'scaleV': return this.scaleV;
      case 'locX': return this.locX;
      case 'locY': return this.locY;
      case 'locH': return this.locX;
      case 'locV': return this.locY;
      case 'locZ': return this.sprite?.locZ;
      case 'width': return this.width;
      case 'height': return this.height;
      case 'visible': return this.visible;
      case 'blend': return this.sprite?.blend;
      case 'ink': return this.sprite?.ink;
      case 'cursor': return this.sprite?.cursor;
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
      default: return 0;
    }
    return 1;
  }

  prepare() {
    for (const elem of this.elemList) {
      if (elem.prepare) elem.prepare();
    }
  }

  render() {
    if (this.visible) {
      for (const elem of this.elemList) {
        if (elem.render) elem.render();
      }
    }
  }

  draw(tRGB) {
    for (const elem of this.elemList) {
      if (elem.draw) elem.draw(tRGB);
    }
  }
}

ObjectManager.registerClass('Element Wrapper Class', ElementWrapper);
