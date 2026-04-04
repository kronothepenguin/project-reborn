/**
 * Scrollbar Class
 * Translated from: 66_Scrollbar Class.ls
 * Vertical/horizontal scrollbar with up/down buttons, bar, and lift.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { removeObject } from './object-api.js';

export class Scrollbar extends ObjectBase {
  constructor() {
    super();
    this.clientID = null;
    this.agentID = null;
    this.buttonImg = {};
    this.parts = [];
    this.rects = {};
    this.scrollOffset = 0;
    this.viewClientRect = null;
    this.clientSourceRect = null;
    this.scrollStep = 1;
    this.buttonStates = { top: 'up', bottom: 'up', bar: 'up', lift: 'up' };
    this.maxOffset = 0;
    this.pageSize = 0;
    this.clickPoint = null;
    this.clickPass = 0;
  }

  deconstruct() {
    if (this.agentID) removeObject(this.agentID);
    return 1;
  }

  define(tProps) {
    this.props = tProps;
    this.id = tProps.id;
    this.motherId = tProps.mother;
    this.type = tProps.type; // 'scrollbarv' or 'scrollbarh'
    this.scaleH = tProps.scaleH;
    this.scaleV = tProps.scaleV;
    this.buffer = tProps.buffer;
    this.sprite = tProps.sprite;
    this.locX = tProps.locX;
    this.locY = tProps.locY;
    this.width = tProps.width;
    this.height = tProps.height;
    this.clientID = tProps.client;
    this.scrollStep = tProps.offset;
    this.buttonImg = {};
    this.scrollOffset = 0;
    this.buttonStates = { top: 'up', bottom: 'up', bar: 'up', lift: 'up' };

    this.UpdateImageObjects(null, ['up', 'down', 'passive']);

    if (this.type === 'scrollbarv') {
      this.width = this.buttonImg.top_up?.width || 16;
    } else {
      this.height = this.buttonImg.top_up?.height || 16;
    }

    this.image = null; // placeholder
    this.updateScrollBar(['top', 'bottom', 'bar', 'lift'], 'up');

    return 1;
  }

  prepare() {
    if (this.sprite) {
      this.sprite.width = this.width;
      this.sprite.height = this.height;
    }
    // Register with client element
  }

  getProperty(tProp) {
    switch (tProp) {
      case 'width': return this.width;
      case 'height': return this.height;
      case 'locX': return this.locX;
      case 'locY': return this.locY;
      case 'offset': return this.scrollOffset;
      case 'scrollrange': return this.clientSourceRect?.[3] - this.clientSourceRect?.[1] || 0;
      default: return 0;
    }
  }

  updateScrollBar(tParts, tstate) {
    // Update visual state of scrollbar parts
  }

  UpdateImageObjects(tPalette, tstates) {
    // Load up/down/passive state images for all scrollbar parts
  }

  mouseDown() {
    // Handle scrollbar click (top button, bottom button, bar, lift)
  }

  mouseUp() {
    // Release scrollbar
  }
}

ObjectManager.registerClass('Scrollbar Class', Scrollbar);
