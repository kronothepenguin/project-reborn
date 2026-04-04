/**
 * Visualizer Part Wrapper Class
 * Translated from: 80_Visualizer Part Wrapper Class.ls
 * Wraps visualizer parts for room rendering (walls, floors).
 */
import { VOID, voidp, integer } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { error, createMember, memberExists, getmemnum, removeMember } from './resource-api.js';

export class VisualizerPartWrapper extends ObjectBase {
  constructor() {
    super();
    this.partList = [];
    this.imgMemberID = null;
    this.typeDef = null;
    this.sprite = null;
    this.locZ = 0;
    this.wrapperStatus = { rendered: 0, rectOk: 0 };
    this.offsets = [0, 0];
    this.wrapID = 'NoID';
    this.boundingRect = [0, 0, 0, 0];
    this.capturesEvents = 0;
    this.spriteProps = { blend: 100, ink: 41, bgColor: '#ffffff' };
    this.ownerID = null;
    this.visualizerLocZ = 0;
    this.bgColor = '#fefefe';
  }

  construct() {
    this.partList = [];
    this.wrapperStatus = { rendered: 0, rectOk: 0 };
    this.offsets = [0, 0];
    this.wrapID = 'NoID';
    this.boundingRect = [0, 0, 0, 0];
    this.capturesEvents = 0;
    this.spriteProps = { blend: 100, ink: 41, bgColor: '#fefefe' };
    this.visualizerLocZ = 0;
    this.bgColor = '#fefefe';
    return 1;
  }

  deconstruct() {
    this.partList = [];
    if (this.imgMemberID && memberExists(this.imgMemberID)) {
      removeMember(this.imgMemberID);
    }
    return 1;
  }

  define(tProps) {
    if (typeof tProps !== 'object') {
      error(this, `Not a proplist: ${tProps}`, 'define', 'major');
      return 0;
    }
    if (tProps.palette) this.spriteProps.palette = tProps.palette;
    if (tProps.id) this.wrapID = tProps.id;
    this.typeDef = tProps.typeDef;
    this.offsets = [integer(tProps.offsetx || 0), integer(tProps.offsety || 0)];
    this.visualizerLocZ = integer(tProps.locZ || 0);
    this.imgMemberID = `VizWrap_${this.wrapID}_${this.id}`;
    this.wrapperStatus = { rendered: 0, rectOk: 0 };
    return 1;
  }

  addPart(tProps) {
    if (typeof tProps !== 'object') {
      error(this, `Not a proplist: ${tProps}`, 'addPart', 'major');
      return 0;
    }
    const memNum = Math.abs(getmemnum(tProps.member));
    if (memNum <= 0) {
      error(this, `No member found: ${tProps.member}`, 'addPart', 'major');
      return 0;
    }

    const partX1 = tProps.locH + this.offsets[0];
    const partY1 = tProps.locV + this.offsets[1];
    tProps.screenrect = [partX1, partY1, partX1 + tProps.width, partY1 + tProps.height];

    if (tProps.locZ !== undefined) this.locZ = tProps.locZ;
    if (tProps.ink !== undefined) this.spriteProps.ink = tProps.ink;
    if (tProps.blend !== undefined) this.spriteProps.blend = tProps.blend;

    this.partList.push(tProps);
    this.wrapperStatus = { rendered: 0, rectOk: 0 };
    return 1;
  }

  removePart(tPartId) {
    for (let pos = 0; pos < this.partList.length; pos++) {
      if (this.partList[pos].id === tPartId) {
        this.partList.splice(pos, 1);
        this.wrapperStatus = { rendered: 0, rectOk: 0 };
        break;
      }
    }
    return this.updateWrap();
  }

  setProperty(tProp, tValue) {
    if (voidp(tProp) || voidp(tValue)) return 0;
    switch (tProp) {
      case 'sprite': this.sprite = integer(tValue); break;
      case 'owner': this.ownerID = tValue; break;
      case 'locZ': this.locZ = integer(tValue); break;
      case 'visLocZ': this.visualizerLocZ = integer(tValue); break;
      case 'blend': this.spriteProps.blend = integer(tValue); break;
      case 'ink': this.spriteProps.ink = tValue; break;
      case 'palette': this.spriteProps.palette = tValue; break;
    }
    return 1;
  }

  getProperty(tProp) {
    switch (tProp) {
      case 'locZ': return this.locZ + this.visualizerLocZ;
      case 'sprite': return this.sprite;
      case 'type': return this.typeDef;
      case 'id': return this.id;
      case 'Active': return this.capturesEvents;
      case 'blend': return this.spriteProps.blend;
      default: return 0;
    }
  }

  updateWrap() {
    if (!this.wrapperStatus.rendered) this.renderImage();
    if (!this.wrapperStatus.rectOk) this.updateBounds();
    return this.updateSprite();
  }

  getBounds() {
    if (!this.wrapperStatus.rectOk) this.updateBounds();
    return this.boundingRect;
  }

  updateBounds() {
    if (this.partList.length === 0) {
      this.boundingRect = [0, 0, 0, 0];
      this.wrapperStatus.rectOk = 1;
      return 1;
    }

    let minX1 = Infinity, minY1 = Infinity, maxX2 = -Infinity, maxY2 = -Infinity;
    for (const part of this.partList) {
      const x1 = part.locH;
      const y1 = part.locV;
      const x2 = x1 + (part.width || 0);
      const y2 = y1 + (part.height || 0);
      if (x1 < minX1) minX1 = x1;
      if (y1 < minY1) minY1 = y1;
      if (x2 > maxX2) maxX2 = x2;
      if (y2 > maxY2) maxY2 = y2;
    }

    this.boundingRect = [minX1, minY1, maxX2, maxY2];
    this.wrapperStatus.rectOk = 1;
    return 1;
  }

  updateSprite() {
    if (!this.sprite) return 0;
    // Update sprite with rendered image
    return 1;
  }

  renderImage() {
    // Render all parts to image
    this.wrapperStatus.rendered = 1;
    return 1;
  }
}

ObjectManager.registerClass('Visualizer Part Wrapper Class', VisualizerPartWrapper);
