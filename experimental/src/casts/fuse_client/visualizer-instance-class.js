/**
 * Visualizer Instance Class
 * 
 * Translated from: casts/fuse_client/54_Visualizer Instance Class.ls
 * 
 * Individual visualizer instance that manages a group of sprites.
 * Visualizers support positioning, moving, showing/hiding, and
 * sprite lookup by logical ID (getSprById).
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { stage } from '../../core/stage.js';
import { spriteManager } from '../../engine/sprite-manager.js';

export class VisualizerInstance extends ObjectBase {
  constructor() {
    super();

    /** @type {string} Visualizer title */
    this.title = '';

    /** @type {string|Array} Layout definition */
    this.layout = [];

    /** @type {number} X position */
    this.locX = 0;

    /** @type {number} Y position */
    this.locY = 0;

    /** @type {number} Z position */
    this.locZ = 0;

    /** @type {number} Width */
    this.width = 0;

    /** @type {number} Height */
    this.height = 0;

    /** @type {boolean} Visibility */
    this.visible = true;

    /** @type {Array} Sprite references */
    this.spriteList = [];

    /** @type {Array} Sprite data */
    this.spriteData = [];

    /** @type {Map} Active sprite list by logical ID */
    this.actSprList = new Map();

    /** @type {boolean} Dragging flag */
    this.dragFlag = false;

    /** @type {number[]} Drag offset [x, y] */
    this.dragOffset = [0, 0];

    /** @type {Object} Boundary rect */
    this.boundary = { left: 0, top: 0, right: 800, bottom: 600 };

    /** @type {Map} Wrapped parts */
    this.wrappedParts = new Map();

    /** @type {Map} Swap animation list */
    this.swapAnimList = new Map();
  }

  construct() {
    this.title = this.id || '';
    this.layout = [];
    this.locX = 0;
    this.locY = 0;
    this.locZ = 0;
    this.width = 0;
    this.height = 0;
    this.visible = true;
    this.spriteList = [];
    this.spriteData = [];
    this.actSprList = new Map();
    this.dragFlag = false;
    this.dragOffset = [0, 0];
    this.boundary = {
      left: 0,
      top: 0,
      right: stage ? stage.width : 800,
      bottom: stage ? stage.height : 600,
    };
    this.wrappedParts = new Map();
    this.swapAnimList = new Map();
    return 1;
  }

  deconstruct() {
    this.releaseSprites();
    for (const [id, wrapper] of this.wrappedParts) {
      if (wrapper && typeof wrapper.deconstruct === 'function') {
        wrapper.deconstruct();
      }
    }
    this.actSprList.clear();
    this.wrappedParts.clear();
    this.swapAnimList.clear();
    return 1;
  }

  // ── Definition ─────────────────────────────────────────────────────

  /**
   * Define visualizer from properties
   */
  define(tProps) {
    if (voidp(tProps)) return 0;

    if (!voidp(tProps.locX)) this.locX = tProps.locX;
    if (!voidp(tProps.locY)) this.locY = tProps.locY;
    if (!voidp(tProps.locZ)) this.locZ = tProps.locZ;
    if (!voidp(tProps.layout)) this.layout = tProps.layout;
    if (!voidp(tProps.boundary)) this.boundary = tProps.boundary;

    return this.open(this.layout);
  }

  /**
   * Open/load a layout
   */
  open(tLayout) {
    if (voidp(tLayout)) tLayout = this.layout;
    this.layout = tLayout;

    // Release existing sprites
    if (this.spriteList.length > 0) {
      this.releaseSprites();
    }

    return this.buildVisual(tLayout);
  }

  /**
   * Build visual from layout
   * In production, this would parse the layout file and create sprites
   */
  buildVisual(tLayout) {
    if (voidp(tLayout)) return 0;

    // Layout parsing would happen here
    // For now, placeholder
    return 1;
  }

  /**
   * Close the visualizer
   */
  close() {
    // Would call removeWindow or similar
    return 1;
  }

  // ── Positioning ────────────────────────────────────────────────────

  /**
   * Move to absolute position
   */
  moveTo(tX, tY) {
    this.moveBy(tX - this.locX, tY - this.locY);
  }

  /**
   * Move by relative offset (with boundary clamping)
   */
  moveBy(tOffX, tOffY) {
    // Clamp to boundary
    if (this.locX + tOffX < this.boundary.left) {
      tOffX = this.boundary.left - this.locX;
    }
    if (this.locY + tOffY < this.boundary.top) {
      tOffY = this.boundary.top - this.locY;
    }
    if (this.locX + this.width + tOffX > this.boundary.right) {
      tOffX = this.boundary.right - this.locX - this.width;
    }
    if (this.locY + this.height + tOffY > this.boundary.bottom) {
      tOffY = this.boundary.bottom - this.locY - this.height;
    }

    this.locX += tOffX;
    this.locY += tOffY;

    // Move all sprites
    this.moveXY(tOffX, tOffY);
  }

  /**
   * Move all sprites by offset
   */
  moveXY(tOffX, tOffY) {
    for (const [id, sprite] of this.actSprList) {
      if (sprite) {
        sprite.locX += tOffX;
        sprite.locY += tOffY;
      }
    }
  }

  // ── Visibility ─────────────────────────────────────────────────────

  /**
   * Show the visualizer
   */
  show() {
    this.visible = true;
    for (const [id, sprite] of this.actSprList) {
      if (sprite) sprite.visible = true;
    }
    return 1;
  }

  /**
   * Hide the visualizer
   */
  hide() {
    this.visible = false;
    for (const [id, sprite] of this.actSprList) {
      if (sprite) sprite.visible = false;
    }
    return 1;
  }

  /**
   * Set active (show)
   */
  setActive() {
    return this.show();
  }

  /**
   * Set deactive (hide)
   */
  setDeactive() {
    return this.hide();
  }

  // ── Sprite Access ──────────────────────────────────────────────────

  /**
   * Get sprite by logical ID
   */
  getSprById(id) {
    return this.actSprList.get(id) || VOID;
  }

  /**
   * Register a sprite under a logical ID
   */
  registerSprite(id, sprite) {
    this.actSprList.set(id, sprite);
    return 1;
  }

  /**
   * Release all sprites
   */
  releaseSprites() {
    for (const [id, sprite] of this.actSprList) {
      if (sprite && sprite.channel) {
        spriteManager.clearSprite(sprite.channel);
      }
    }
    this.spriteList = [];
    this.spriteData = [];
    this.actSprList.clear();
  }

  // ── Properties ─────────────────────────────────────────────────────

  /**
   * Get property
   */
  getProperty(prop) {
    switch (prop) {
      case 'locX': return this.locX;
      case 'locY': return this.locY;
      case 'locZ': return this.locZ;
      case 'width': return this.width;
      case 'height': return this.height;
      case 'visible': return this.visible;
      case 'sprCount': return this.actSprList.size;
      case 'spriteList': return this.spriteList;
      case 'layout': return this.layout;
      case 'boundary': return this.boundary;
      default:
        return this[prop] !== undefined ? this[prop] : VOID;
    }
  }

  /**
   * Set property
   */
  setProperty(prop, value) {
    switch (prop) {
      case 'locX': this.locX = value; break;
      case 'locY': this.locY = value; break;
      case 'locZ': this.locZ = value; break;
      case 'visible': this.visible = !!value; break;
      case 'width': this.width = value; break;
      case 'height': this.height = value; break;
      default:
        this[prop] = value;
    }
    return 1;
  }

  // ── Debug ──────────────────────────────────────────────────────────

  print() {
    console.log(`Visualizer: ${this.title} (${this.locX}, ${this.locY}) [${this.width}x${this.height}]`);
    console.log(`  Sprites: ${this.actSprList.size}`);
    for (const [id, sprite] of this.actSprList) {
      console.log(`    ${id}: channel=${sprite?.channel}`);
    }
    return 1;
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Visualizer Instance Class', VisualizerInstance);
